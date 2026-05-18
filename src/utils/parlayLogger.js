let counter = 0;

function summarizeBet(bet) {
  if (!bet) return null;
  return {
    id: bet.id,
    teams: bet.teams,
    bet_type: bet.bet_type,
    odds: bet.odds,
    detail: bet.detail?.slice?.(0, 80),
    hasAnalysis: Boolean(bet.analysis),
    hasCoverAnalysis: Boolean(bet.cover_analysis),
  };
}

export function createParlayLogger(scope = "client") {
  const id = `${scope}-${Date.now()}-${++counter}`;
  const t0 = Date.now();

  const log = (step, data) => {
    const elapsed = Date.now() - t0;
    const prefix = `[Parlay][${id}][+${elapsed}ms]`;
    if (data !== undefined) {
      console.log(prefix, step, data);
    } else {
      console.log(prefix, step);
    }
  };

  return { id, log, summarizeBet };
}
