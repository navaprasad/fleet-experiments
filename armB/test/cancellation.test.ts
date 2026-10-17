// Test suite. Runs on Node's built-in test runner:
//   node --experimental-strip-types --test test/cancellation.test.ts
import { describe, it, beforeEach, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.ts";
import { insertOrder, resetStore, refundEventsFor, type Order } from "../src/store.ts";
import { setClock } from "../src/cancellation.ts";
import { ingestPackingStarted, applyStatusProjection } from "../src/events.ts";

const T0 = new Date("2026-09-26T10:00:00.000Z");
let baseUrl = "";
const server = createApp();

before(async () => {
  await new Promise<void>((resolve) => server.listen(0, () => resolve()));
  const address = server.address();
  if (typeof address === "object" && address) baseUrl = `http://127.0.0.1:${address.port}`;
});

after(() => server.close());

function minutesAfterT0(min: number, seconds = 0): Date {
  return new Date(T0.getTime() + min * 60000 + seconds * 1000);
}

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: "o-" + Math.random().toString(36).slice(2),
    status: "PAID",
    customerTier: "STANDARD",
    createdAt: T0.toISOString(),
    paymentCapturedAt: T0.toISOString(),
    packingStartedAt: null,
    ...overrides,
  };
}

async function cancel(id: string): Promise<{ status: number; body: any }> {
  const res = await fetch(`${baseUrl}/orders/${id}/cancel`, { method: "POST" });
  return { status: res.status, body: await res.json() };
}

beforeEach(() => {
  resetStore();
  setClock(() => new Date());
});

describe("cancellation window", () => {
  it("TEST-001: standard customer at 29:59 can cancel", async () => {
    const o = order();
    insertOrder(o);
    setClock(() => minutesAfterT0(29, 59));
    const res = await cancel(o.id);
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "CANCELLED");
  });

  it("TEST-002: standard customer at exactly 30:00 cannot cancel", async () => {
    const o = order();
    insertOrder(o);
    setClock(() => minutesAfterT0(30, 0));
    const res = await cancel(o.id);
    assert.equal(res.status, 409);
  });

  it("TEST-003: premium customer at 45:00 can cancel", async () => {
    const o = order({ customerTier: "PREMIUM" });
    insertOrder(o);
    setClock(() => minutesAfterT0(45, 0));
    const res = await cancel(o.id);
    assert.equal(res.status, 200);
  });
});

describe("refund idempotency", () => {
  it("TEST-004: two identical cancellation requests result in one refund", async () => {
    const o = order();
    insertOrder(o);
    setClock(() => minutesAfterT0(5));
    const first = await cancel(o.id);
    const second = await cancel(o.id);
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(refundEventsFor(o.id).length, 1);
  });
});

describe("packing cutoff (REQ-005)", () => {
  it("TEST-005: packing started and projected cannot cancel inside window", async () => {
    const o = order();
    insertOrder(o);
    // Packing starts 5 minutes after capture; projection has caught up.
    ingestPackingStarted(o.id, minutesAfterT0(5).toISOString());
    applyStatusProjection(o.id, "PACKING");
    setClock(() => minutesAfterT0(10)); // well inside the 30-minute window
    const res = await cancel(o.id);
    assert.equal(res.status, 409);
    assert.equal(refundEventsFor(o.id).length, 0);
  });

  it("TEST-006: packing recorded but status projection lagging (still PAID) cannot cancel inside window", async () => {
    const o = order();
    insertOrder(o);
    // OBS-005/OBS-006: packing_started_at is durably recorded at ingestion,
    // while the status projection lags and still reads PAID.
    ingestPackingStarted(o.id, minutesAfterT0(5).toISOString());
    setClock(() => minutesAfterT0(6)); // inside the window, projection not yet applied
    const res = await cancel(o.id);
    assert.equal(res.status, 409);
    assert.equal(refundEventsFor(o.id).length, 0);
  });

  it("TEST-007: packing not started, inside window, can still cancel", async () => {
    const o = order();
    insertOrder(o);
    setClock(() => minutesAfterT0(10));
    const res = await cancel(o.id);
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "CANCELLED");
  });
});

describe("API contract compatibility", () => {
  it("CONTRACT-001: successful cancellation returns the order object", async () => {
    const o = order();
    insertOrder(o);
    setClock(() => minutesAfterT0(1));
    const res = await cancel(o.id);
    assert.equal(res.status, 200);
    assert.equal(res.body.id, o.id);
    assert.equal(res.body.status, "CANCELLED");
    assert.equal(res.body.customerTier, "STANDARD");
  });

  it("existing restriction: SHIPPED orders cannot be cancelled", async () => {
    const o = order({ status: "SHIPPED" });
    insertOrder(o);
    setClock(() => minutesAfterT0(1));
    const res = await cancel(o.id);
    assert.equal(res.status, 409);
  });
});
