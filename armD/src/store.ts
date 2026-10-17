// Order store backed by SQLite (node:sqlite).
import { DatabaseSync } from "node:sqlite";

export interface Order {
  id: string;
  status: "PAID" | "PACKING" | "SHIPPED" | "CANCELLED";
  customerTier: "STANDARD" | "PREMIUM";
  createdAt: string;
  paymentCapturedAt: string | null;
}

export interface RefundEvent {
  orderId: string;
  requestedAt: string;
}

const db = new DatabaseSync(":memory:");

db.exec(`
  CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    customer_tier TEXT NOT NULL,
    created_at TEXT NOT NULL,
    payment_captured_at TEXT
  );
  CREATE TABLE refund_events (
    order_id TEXT NOT NULL,
    requested_at TEXT NOT NULL
  );
  CREATE TABLE packing_events (
    order_id TEXT NOT NULL,
    occurred_at TEXT NOT NULL
  );
`);

export function insertOrder(order: Order): void {
  db.prepare(
    `INSERT INTO orders (id, status, customer_tier, created_at, payment_captured_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(
    order.id,
    order.status,
    order.customerTier,
    order.createdAt,
    order.paymentCapturedAt
  );
}

export function getOrder(id: string): Order | undefined {
  const row = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id) as
    | Record<string, string | null>
    | undefined;
  if (!row) return undefined;
  return {
    id: row.id as string,
    status: row.status as Order["status"],
    customerTier: row.customer_tier as Order["customerTier"],
    createdAt: row.created_at as string,
    paymentCapturedAt: row.payment_captured_at,
  };
}

export function updateStatus(id: string, status: Order["status"]): void {
  db.prepare(`UPDATE orders SET status = ? WHERE id = ?`).run(status, id);
}

export function recordPackingEvent(orderId: string, occurredAt: string): void {
  db.prepare(`INSERT INTO packing_events (order_id, occurred_at) VALUES (?, ?)`).run(orderId, occurredAt);
}

export function hasPackingStarted(orderId: string): boolean {
  const row = db
    .prepare(`SELECT 1 FROM packing_events WHERE order_id = ? LIMIT 1`)
    .get(orderId);
  return row !== undefined;
}

export function publishRefundRequest(orderId: string, requestedAt: string): void {
  db.prepare(`INSERT INTO refund_events (order_id, requested_at) VALUES (?, ?)`).run(
    orderId,
    requestedAt
  );
}

export function refundEventsFor(orderId: string): RefundEvent[] {
  return db
    .prepare(`SELECT order_id, requested_at FROM refund_events WHERE order_id = ?`)
    .all(orderId)
    .map((r: any) => ({ orderId: r.order_id, requestedAt: r.requested_at }));
}

export function resetStore(): void {
  db.exec(`DELETE FROM orders; DELETE FROM refund_events; DELETE FROM packing_events;`);
}
