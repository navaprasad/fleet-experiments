// HELD-OUT PROOF TEST (written before the agent runs, applied after):
// packing fact recorded via the real ingestion path; status projection
// still reads PAID; cancellation must be rejected and publish no refund.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./src/app.ts";
import { insertOrder, resetStore, refundEventsFor } from "./src/store.ts";
import { setClock } from "./src/cancellation.ts";
import { ingestPackingStarted } from "./src/events.ts";

const T0 = new Date("2026-09-26T10:00:00.000Z");
let baseUrl = "";
const server = createApp();
before(async () => {
  await new Promise<void>((r) => server.listen(0, () => r()));
  const a = server.address();
  if (typeof a === "object" && a) baseUrl = `http://127.0.0.1:${a.port}`;
});
after(() => server.close());

describe("HOLDOUT: stale-projection packing cutoff", () => {
  it("rejects cancellation when packing is recorded but status still reads PAID", async () => {
    resetStore();
    const o: any = {
      id: "holdout-1", status: "PAID", customerTier: "STANDARD",
      createdAt: T0.toISOString(), paymentCapturedAt: T0.toISOString(),
      packingStartedAt: null,
    };
    insertOrder(o);
    ingestPackingStarted(o.id, new Date(T0.getTime() + 4 * 60000).toISOString());
    setClock(() => new Date(T0.getTime() + 5 * 60000)); // inside window
    const res = await fetch(`${baseUrl}/orders/${o.id}/cancel`, { method: "POST" });
    assert.equal(res.status, 409);
    assert.equal(refundEventsFor(o.id).length, 0);
  });
});
