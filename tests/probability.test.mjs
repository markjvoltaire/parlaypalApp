import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateImpliedProbability,
  calculateParlayProbability,
  resolveParlayProbability,
} from "../src/utils/probability.js";

test("calculateImpliedProbability parses +1609", () => {
  const pct = calculateImpliedProbability("+1609");
  assert.ok(pct > 5.8 && pct < 5.9, `expected ~5.85%, got ${pct}`);
});

test("calculateImpliedProbability parses +2125", () => {
  const pct = calculateImpliedProbability(2125);
  assert.ok(pct > 4.4 && pct < 4.6, `expected ~4.5%, got ${pct}`);
});

test("calculateParlayProbability returns null when any leg lacks odds", () => {
  const bets = [
    { odds: "+350", probability: 22 },
    { odds: null, probability: null },
    { odds: "-110", probability: 52 },
  ];
  assert.equal(calculateParlayProbability(bets), null);
});

test("resolveParlayProbability prefers parlay odds over leg product", () => {
  const bets = [
    { odds: "+350", probability: 22.2 },
    { odds: "-110", probability: 52.4 },
    { odds: "-110", probability: 52.4 },
    { odds: "-110", probability: 52.4 },
  ];
  const pct = resolveParlayProbability(bets, {
    parlayOdds: "+1609",
    parlayProbability: 5.85,
  });
  assert.ok(pct > 5.8 && pct < 5.9, `expected parlay line ~5.85%, got ${pct}`);
});

test("resolveParlayProbability does not return 100% for missing leg data", () => {
  const bets = [
    { odds: null, probability: null },
    { odds: null, probability: null },
  ];
  const pct = resolveParlayProbability(bets, {
    parlayOdds: "+2125",
    parlayProbability: null,
  });
  assert.ok(pct > 4.4 && pct < 4.6, `expected ~4.5%, got ${pct}`);
  assert.notEqual(pct, 100);
});
