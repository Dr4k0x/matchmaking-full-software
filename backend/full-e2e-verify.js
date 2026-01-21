const http = require('http');
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE2LCJub21icmUiOiJUZXN0IFVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3Njg5NjI4ODgsImV4cCI6MTc2OTA0OTI4OH0.1vK3tQF1B54cBGz0iZm55sz_A-BYDqdO8OySf-KsRIU';

async function request(options, body) {
  return new Promise((resolve) => {
    const req = http.request({ hostname: '127.0.0.1', port: 3000, ...options, headers: { ...options.headers, 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } }, (res) => {
      let data = ''; res.on('data', (c) => data += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(data) }); } catch(e) { resolve({ status: res.statusCode, body: data }); } });
    });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('--- E2E START ---');
  const tname = 'Tech-'+Date.now();
  await request({ path: '/tecnologia', method: 'POST' }, { nombre: tname, descripcion: 'T', tipo: 'Frontend' });
  const rt = await request({ path: `/tecnologia?nombre=${tname}`, method: 'GET' });
  const tid = rt.body.data?.[0]?.idTecnologia;
  
  const rp = await request({ path: '/proyecto', method: 'POST' }, { nombre: 'P1', descripcion: 'D', fechaCreacion: '2026-01-01', fechaFinalizacion: '2026-12-31', estado: 'P', nivelColaborativo: 1, nivelOrganizativo: 1, nivelVelocidadDesarrollo: 1, nivelesProyecto: [{ idTecnologia: tid, nivelRequerido: 5 }] });
  const pid = rp.body.idProyecto;
  
  const rc = await request({ path: '/carta', method: 'POST' }, { nombreApellido: 'C1', cedulaIdentidad: 'E2E-'+Date.now(), tipoCarta: 'P', poderSocial: 1, sabiduria: 1, velocidad: 1, nivelesCarta: [{ idTecnologia: tid, nivel: 5 }] });
  const cid = rc.body.id;
  console.log(`P:${pid} C:${cid} T:${tid}`);
  
  const rm = await request({ path: '/matchmaking', method: 'POST' }, { idProyecto: pid, idCartas: [cid] });
  const mid = rm.body.idMatchmaking;
  if (!mid) { console.log('ERROR M:', rm.body); return; }
  console.log(`M:${mid}`);

  console.log('--- TESTING LOCKS ---');
  const p1 = await request({ path: `/proyecto/${pid}`, method: 'PATCH' }, { estado: 'E' });
  console.log(`PATCH PROJ ESTADO (200): ${p1.status}`);
  const p2 = await request({ path: `/proyecto/${pid}`, method: 'PATCH' }, { nombre: 'X' });
  console.log(`PATCH PROJ NAME (409): ${p2.status}`);
  const d1 = await request({ path: `/proyecto/${pid}`, method: 'DELETE' });
  console.log(`DEL PROJ (409): ${d1.status}`);
  const d1c = await request({ path: `/carta/${cid}`, method: 'DELETE' });
  console.log(`DEL CARD (409): ${d1c.status}`);

  console.log('--- RELEASE ---');
  await request({ path: `/matchmaking/${mid}`, method: 'DELETE' });
  const d2 = await request({ path: `/proyecto/${pid}`, method: 'DELETE' });
  console.log(`DEL PROJ OK (200): ${d2.status}`);
  const d3 = await request({ path: `/carta/${cid}`, method: 'DELETE' });
  console.log(`DEL CARD OK (200): ${d3.status}`);

  await request({ path: `/tecnologia/${tid}`, method: 'DELETE' });
}
run();
