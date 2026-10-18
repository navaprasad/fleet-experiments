// Warehouse event ingestion.
//
// The warehouse publishes PackingStarted events. Ingestion durably records
// the packing timestamp on the order row when the event arrives. The order
// status field is a projection maintained by a separate process and is
// updated asynchronously; it may be updated at a later time than the
// packing timestamp.
import { setPackingStartedAt, updateStatus } from "./store.ts";

export function ingestPackingStarted(orderId: string, occurredAt: string): void {
  setPackingStartedAt(orderId, occurredAt);
}

// Runs asynchronously, driven by the projection pipeline.
export function applyStatusProjection(orderId: string, status: "PACKING" | "SHIPPED"): void {
  updateStatus(orderId, status);
}
