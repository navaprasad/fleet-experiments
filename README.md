# Fleet Experiment: Do AI Coding Agents Fall for the Projection-vs-Fact Trap?

Companion repository for the article *"Fleet Experiments: Pressure-Testing
Architecture Decisions with Disposable AI Agents."*

## The claim under test

> Given a model with a convenient status projection and a durably recorded
> fact, a coding agent implementing "cancellation is forbidden once packing
> has started" will check the projection (`order.status === "PACKING"`)
> rather than the durable fact.

**Result: refuted in all four conditions, across 5 replications each (n = 20).**
Every fresh agent consulted the durable fact; every implementation passed the
held-out stale-state proof test; 0/15 no-artifact runs cited the correct
requirement ID (8 fabricated one) while 5/5 artifact runs cited it correctly.
See [RESULTS.md](RESULTS.md).

## Layout

```
base/      Pre-experiment fixture: ~300-line TypeScript order service,
           6 passing tests, no packing logic, spoiler-scrubbed.
           base/artifacts/ holds the Evidence/Intent/Proof specs (Arm B only).
pre/       Pristine per-arm pre-states (A/B/C/D) that every run started from.
armA/      Run 1: code + requirement; projection lag documented in a comment.
armB/      Run 1: code + requirement + specification artifacts.
armC/      Run 1: code + requirement; lag comment removed (undocumented).
armD/      Run 1: fact field removed from the Order model; packing recorded
           only in a separate packing_events table.
runs/      Replications 2-5 for each arm (armA-r2 ... armD-r5), each exactly
           as the fresh agent left it.
holdout.test.ts  The held-out verification, written before any agent ran.
PROMPTS.md       Verbatim prompts given to each agent.
RESULTS.md       Full results, reproduction record, and threats to validity.
```

Each arm/run directory contains the implementation exactly as the fresh agent
left it, including the tests the agent wrote.

## Method

One fresh, clean-context AI coding agent per arm (Claude-family; no shared
context with the experiment designer). Neutral prompts, identical across arms
except the controlled variable, recorded verbatim in PROMPTS.md. The held-out
proof test — packing fact ingested via the real event path while the status
projection still reads PAID — was written from the requirement before any
agent ran, and applied to each arm's implementation afterward.

## Run it

Node 22.6+ (uses `node:sqlite`, `node:test`, native type-stripping; zero npm
dependencies):

```
cd armA   # or armB / armC / armD / base
node --experimental-strip-types --test test/cancellation.test.ts
node --experimental-strip-types --test holdout.test.ts   # arms only
```

## Provenance

The experiment subjects were AI coding agents; the fixture, protocol, and
held-out test were designed with AI assistance and verified by the author.
Experiment run: 2026-10-17, Node v22.23.2.
