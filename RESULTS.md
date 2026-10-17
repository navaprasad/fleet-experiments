# Experiment Results — REQ-005 implementation by fresh AI coding agents

Date: 2026-10-17. Runtime: Node v22.23.2, `--experimental-strip-types --test`.
Agent: fresh instances of a Claude-family coding agent, one per arm, no shared
context with the experiment designer's session. Prompts recorded verbatim.
One run per arm.

Baseline (all arms): pre-REQ-005 service, 6/6 tests passing, no packing logic,
no spoiler comments in src/ or tests.

| Arm | Conditions | Implementation produced | Held-out stale-state test |
|---|---|---|---|
| A | Code + requirement text only; projection lag documented in events.ts comment | `packingStartedAt !== null \|\| status === "PACKING"` | PASS |
| B | Code + requirement + Evidence/Intent/Proof artifacts (lag in OBS-005/006; proof row "to be defined") | `packingStartedAt !== null` (fact only); proof derived from OBS-005/006 before implementing; proof-map updated; tests drive real ingestion path | PASS |
| C | Code + requirement only; lag comment REMOVED (undocumented constraint) | `packingStartedAt !== null \|\| status === "PACKING"` | PASS |
| D | Code + requirement only; `packingStartedAt` removed from Order entirely — fact lives only in a separate `packing_events` table | Added `hasPackingStarted()` store query; checks `status === "PACKING" \|\| hasPackingStarted(id)` | PASS |

## Headline finding

The hypothesized failure (agent checks only the status projection) did NOT
reproduce in any arm — including undocumented lag (C) and fact-in-separate-
table (D). 4/4 implementations consulted the durable fact; 4/4 passed the
held-out proof test; all arms kept the 6 pre-existing tests green.

## Observed differences between arms

1. TRACEABILITY: Arms A and C both labeled the new rule "REQ-004" in code
   comments — a wrong, invented requirement ID (REQ-004 is the API-compat
   requirement). Arm D cited no ID. Only Arm B (artifacts) cited REQ-005
   correctly and updated proof-map.md.
2. PROOF DERIVATION: Arm B explicitly derived its tests from OBS-005/OBS-006,
   exercised the real ingestion path (ingestPackingStarted /
   applyStatusProjection), and added a behavior-preservation test. A/C/D
   wrote good tests but with fixture-level setup and no requirement mapping.
3. Arm B was the only arm whose output a reviewer can verify against intent
   without reading the implementation.

## Caveats

- One model family, one run per arm, ~300-line codebase that fits entirely
  in the agent's context. Semantically suggestive names (packingStartedAt,
  packing_events) likely aided discovery. No claim about other models,
  larger codebases, or cryptically named schemas.
