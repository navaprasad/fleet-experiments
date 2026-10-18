# Experiment Results — REQ-005 implementation by fresh AI coding agents

Runs: 2026-10-17 (r1) and 2026-10-20 (r2–r5). n = 5 per arm, 20 runs total.

## Reproduction record

- Agent/client: general-purpose coding subagents launched via the Claude Agent
  SDK inside a Claude Cowork session; each run was a fresh instance with no
  conversational history from the experiment design or from other runs.
- Model: claude-fable-5 (Claude family). Host-environment system instructions
  were present and are not fully reproducible — noted as a limitation. No
  repository-level AGENTS.md / CLAUDE.md existed in any fixture.
- Task prompts: PROMPTS.md, verbatim; identical across arms except the
  controlled variable and directory path.
- Tool access: file read/write and shell within the fixture directory; no
  network access required or used.
- Fixture base state: pre/ directories (6/6 tests passing, no packing logic);
  each run directory under runs/ preserves the agent's full patch.
- Runtime: Node v22.23.2, `node --experimental-strip-types --test`.
- Held-out oracle: holdout.test.ts, written from the requirement before any
  agent ran; never present in any fixture during a run.

## Conditions (two manipulated dimensions — a condition sweep, not a factorial design)

| Arm | Where knowledge of the projection-lag constraint lives | Where the durable packing fact lives |
|---|---|---|
| A | Code comment in the event-ingestion module | Column on the Order row |
| B | Specification artifacts (Evidence OBS-005/006, Intent, Proof) | Column on the Order row |
| C | Nowhere — undocumented operational reality | Column on the Order row |
| D | Nowhere | Separate packing_events table only (requires a new query) |

## Headline result (n = 20)

The hypothesized failure — implementing the packing cutoff against the status
projection alone — occurred in **0 of 20 runs**. Every run consulted the
durable fact (all five Arm D runs independently wrote a new store query
against the packing_events table), every run passed the held-out stale-state
test, and every run kept the 6 pre-existing tests green. With zero failures
in 20 trials, a true per-run failure rate above ~14% is unlikely (95%,
rule of three); the data cannot distinguish rates below that.

Implementation shape varied without affecting correctness: 16/20 checked
both the fact and the projection ("belt and braces"); 4/20 (A-r3, B-r1,
B-r3, B-r5) gated on the fact alone.

## Provenance result (n = 20)

The new rule's requirement ID is REQ-005 in the specification. What each run
cited for the new rule in code comments:

| Arm (n=5) | Correct (REQ-005) | Fabricated (REQ-004) | No citation |
|---|---|---|---|
| A (comment-documented) | 0 | 1 | 4 |
| B (artifacts) | **5** | 0 | 0 |
| C (undocumented) | 0 | 4 | 1 |
| D (separate table) | 0 | 3 | 2 |
| **Total no-artifact (A+C+D)** | **0/15** | 8/15 | 7/15 |

The fabrication is systematic, not random: the fixture's pre-existing code
cites REQ-001..003, and the no-artifact agents that invented an ID chose the
next number in sequence — REQ-004 — which in the actual specification is the
API-compatibility requirement. Plausible, confident, wrong. All five Arm B
runs cited REQ-005 correctly and updated proof-map.md with evidence-derived
proof cases (every Arm B proof explicitly cited OBS-005/OBS-006 and included
the projection-lag case).

## Interpretation

Under these conditions, specification artifacts did not change implementation
correctness (20/20 regardless). They changed provenance (0/15 correct without
them; 5/5 with them) and verification articulation (requirement-mapped,
evidence-derived proof vs. implementation-shaped tests).

## Threats to validity

One model family; a ~300-line fixture that fits entirely in context;
semantically honest identifiers (packingStartedAt, packing_events) that aid
discovery; host system instructions not fully controlled; n=5 per arm bounds
only moderately large failure rates. Agent capabilities shift between model
releases — findings are dated and should be re-run.
