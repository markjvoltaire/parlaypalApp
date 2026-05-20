/** Parse American odds from number or string (e.g. +1609, -150). */
export function parseAmericanOdds(odds) {
  if (odds == null || odds === "") return null;
  const raw = String(odds).trim();
  if (!raw) return null;
  const n = Number(raw.replace(/^\+/, ""));
  return Number.isFinite(n) ? n : null;
}

export function calculateImpliedProbability(odds) {
  const n = parseAmericanOdds(odds);
  if (n == null) return null;
  const p = n > 0 ? 100 / (n + 100) : Math.abs(n) / (Math.abs(n) + 100);
  return p * 100;
}

export function normalizePct(v) {
  if (v == null) return null;
  const num = Number(v);
  if (!Number.isFinite(num)) return null;
  return num <= 1 ? num * 100 : num;
}

/**
 * Multiply implied probabilities for each leg.
 * Returns null if any leg lacks odds or probability (avoids false 100%).
 */
export function calculateParlayProbability(bets) {
  if (!Array.isArray(bets) || bets.length === 0) return null;

  let product = 1;
  for (const bet of bets) {
    let pct = null;
    if (parseAmericanOdds(bet?.odds) != null) {
      pct = calculateImpliedProbability(bet.odds);
    }
    if (pct == null) {
      pct = normalizePct(bet?.probability);
    }
    if (pct == null) return null;
    product *= pct / 100;
  }

  return product * 100;
}

/**
 * Win probability for display.
 * 1. Parlay odds on the ticket (+1609) — matches the priced SGP / parlay line
 * 2. Slip-level parlay_probability from extraction
 * 3. Product of leg odds/probabilities (only when no parlay line exists)
 */
export function resolveParlayProbability(
  bets,
  { parlayOdds, parlayProbability } = {},
) {
  const fromParlayOdds = calculateImpliedProbability(parlayOdds);
  if (fromParlayOdds != null) return fromParlayOdds;

  const fromSlip = normalizePct(parlayProbability);
  if (fromSlip != null) return fromSlip;

  return calculateParlayProbability(bets);
}
