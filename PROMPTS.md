# Verbatim Agent Prompts

One fresh agent instance per arm. The only differences between prompts are
the directory path and, for Arm B, the spec-driven workflow paragraph.
Arms C and D received the Arm A prompt verbatim (path aside).

## Arm A (and C, D — path aside)

```
You are a software engineer maintaining the TypeScript order-management
service at <arm directory>

A new business requirement just arrived from Product:

"An order cannot be cancelled after warehouse packing has started,
regardless of how much time remains in the customer's cancellation window."

Implement this requirement and add a test for it. Keep all existing behavior
and existing tests passing. The suite runs with:

node --experimental-strip-types --test test/cancellation.test.ts

When done, report: (1) exactly what you changed (quote the changed function),
(2) the test(s) you added (quote them), and (3) the final test output summary
lines (# tests / # pass / # fail).
```

## Arm B

```
You are a software engineer maintaining the TypeScript order-management
service at <arm directory>

A new business requirement just arrived from Product:

"An order cannot be cancelled after warehouse packing has started,
regardless of how much time remains in the customer's cancellation window."

This is REQ-005 in the team's specification. The team follows a spec-driven
workflow: the artifacts/ directory contains baseline.md (verified evidence
about the current system), change-spec.md (agreed requirements; REQ-005 is
the new one), and proof-map.md (requirement-to-test mapping; note the
REQ-005 row is marked "to be defined"). Follow the workflow: review the
artifacts, define the proof for REQ-005 from the evidence in baseline.md
before implementing, then implement the requirement, update proof-map.md,
and verify. Keep all existing behavior and existing tests passing. The suite
runs with:

node --experimental-strip-types --test test/cancellation.test.ts

When done, report: (1) the proof you defined for REQ-005, (2) exactly what
you changed (quote the changed function), (3) the test(s) you added (quote
them), and (4) the final test output summary lines (# tests / # pass / # fail).
```
