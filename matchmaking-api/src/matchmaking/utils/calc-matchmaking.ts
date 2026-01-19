export type Requirement = { techId: number; requiredLevel: number };
export type Skill = { techId: number; dominanceLevel: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * - Por tecnología requerida: score = clamp(have/req, 0..1)
 * - have por tecnología = máximo nivel entre las cartas
 * - peso = req (nivel requerido)
 * - opcional: penalización por faltantes críticos
 */
export function calcMatchmakingPercentage(
  requirements: Requirement[],
  skills: Skill[],
  options?: {
    applyMissingPenalty?: boolean; // default true
    missingThreshold?: number; // default 0.6 (60% del requerido)
    missingPenaltyMax?: number; // default 0.25 (hasta -25%)
  },
): number {
  const applyMissingPenalty = options?.applyMissingPenalty ?? true;
  const missingThreshold = options?.missingThreshold ?? 0.6;
  const missingPenaltyMax = options?.missingPenaltyMax ?? 0.25;

  // reqMap: techId -> max requerido
  const reqMap = new Map<number, number>();
  for (const r of requirements) {
    const req = Number(r.requiredLevel);
    if (!Number.isFinite(req) || req <= 0) continue;
    const prev = reqMap.get(r.techId) ?? 0;
    reqMap.set(r.techId, Math.max(prev, req));
  }

  // haveMap: techId -> max dominancia
  const haveMap = new Map<number, number>();
  for (const s of skills) {
    const have = Number(s.dominanceLevel);
    if (!Number.isFinite(have) || have < 0) continue;
    const prev = haveMap.get(s.techId) ?? 0;
    haveMap.set(s.techId, Math.max(prev, have));
  }

  let weightedSum = 0;
  let weightSum = 0;

  let totalRequired = 0;
  let missing = 0;

  for (const [techId, req] of reqMap.entries()) {
    totalRequired++;
    const have = haveMap.get(techId) ?? 0;

    const score = clamp(have / req, 0, 1);
    weightedSum += score * req;
    weightSum += req;

    if (applyMissingPenalty && have < req * missingThreshold) {
      missing++;
    }
  }

  if (weightSum === 0) return 0;

  const base = (weightedSum / weightSum) * 100;

  if (!applyMissingPenalty || totalRequired === 0) {
    return clamp(base, 0, 100);
  }

  const missingRatio = missing / totalRequired;
  const penalty = 1 - missingRatio * missingPenaltyMax;

  return clamp(base * penalty, 0, 100);
}
