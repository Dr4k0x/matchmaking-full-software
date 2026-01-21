const http = require('http');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE2LCJub21icmUiOiJUZXN0IFVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3Njg5NjI4ODgsImV4cCI6MTc2OTA0OTI4OH0.1vK3tQF1B54cBGz0iZm55sz_A-BYDqdO8OySf-KsRIU';

async function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch(e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('\n--- STARTING SYSTEM VERIFICATION ---');

  // 1. Get Matchmakings to find locked resources
  const resM = await request({ hostname: 'localhost', port: 3000, path: '/matchmaking', method: 'GET' });
  if (!resM.body || resM.body.length === 0) {
    console.log('❌ FATAL: No matchmakings found. Create one first.');
    return;
  }
  const match = resM.body[0];
  const projectId = match.idProyecto;
  
  // Get the project details to see its cards
  const resPDetail = await request({ hostname: 'localhost', port: 3000, path: `/proyectos/${projectId}`, method: 'GET' });
  
  console.log(`\n--- TEST 1: PROJECT LOCK (ID: ${projectId}) ---`);
  
  // Test 1.1: PATCH Project with ONLY 'estado' (Expected 200)
  const patchOk = await request({ hostname: 'localhost', port: 3000, path: `/proyectos/${projectId}`, method: 'PATCH' }, { estado: 'E' });
  console.log(`PATCH { estado }: ${patchOk.statusCode} ${patchOk.statusCode === 200 ? '✅' : '❌'}`);

  // Test 1.2: PATCH Project with 'estado' + 'nombre' (Expected 409)
  const patchFail = await request({ hostname: 'localhost', port: 3000, path: `/proyectos/${projectId}`, method: 'PATCH' }, { estado: 'E', nombre: 'Illegal Change' });
  console.log(`PATCH { estado, nombre }: ${patchFail.statusCode} ${patchFail.statusCode === 409 ? '✅' : '❌'}`);
  if (patchFail.statusCode === 409) console.log(`   Message: ${patchFail.body.message}`);

  // Test 1.3: PATCH Project with empty DTO (Expected 400)
  const patchEmpty = await request({ hostname: 'localhost', port: 3000, path: `/proyectos/${projectId}`, method: 'PATCH' }, {});
  console.log(`PATCH {}: ${patchEmpty.statusCode} ${patchEmpty.statusCode === 400 ? '✅' : '❌'}`);

  // Test 1.4: DELETE Project (Expected 409)
  const delProj = await request({ hostname: 'localhost', port: 3000, path: `/proyectos/${projectId}`, method: 'DELETE' });
  console.log(`DELETE Project: ${delProj.statusCode} ${delProj.statusCode === 409 ? '✅' : '❌'}`);

  console.log(`\n--- TEST 2: CARD LOCK ---`);
  
  // Find a card associated with this matchmaking
  const resCards = await request({ hostname: 'localhost', port: 3000, path: '/cartas', method: 'GET' });
  const lockedCard = resCards.body.find(c => c.matchmaking && c.matchmaking.idMatchmaking === match.idMatchmaking);

  if (lockedCard) {
    const cardId = lockedCard.idCarta;
    console.log(`Testing with Card ID: ${cardId}`);

    // Test 2.1: PATCH Card (Expected 409)
    const patchCard = await request({ hostname: 'localhost', port: 3000, path: `/cartas/${cardId}`, method: 'PATCH' }, { nombreApellido: 'Hack' });
    console.log(`PATCH Card: ${patchCard.statusCode} ${patchCard.statusCode === 409 ? '✅' : '❌'}`);
    if (patchCard.statusCode === 409) console.log(`   Message: ${patchCard.body.message}`);

    // Test 2.2: DELETE Card (Expected 409)
    const delCard = await request({ hostname: 'localhost', port: 3000, path: `/cartas/${cardId}`, method: 'DELETE' });
    console.log(`DELETE Card: ${delCard.statusCode} ${delCard.statusCode === 409 ? '✅' : '❌'}`);
    if (delCard.statusCode === 409) console.log(`   Message: ${delCard.body.message}`);
  } else {
    console.log('⚠️ No locked card found in this matchmaking.');
  }

  console.log('\n--- VERIFICATION COMPLETE ---');
}

run();
