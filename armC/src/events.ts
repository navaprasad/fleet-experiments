// Warehouse event ingestion.
import { setPackingStartedAt, updateStatus } from "./store.ts";

export function ingestPackingStarted(orderId: string, occurredAt: string): void {
  setPackingStartedAt(orderId, occurredAt);
}

export function applyStatusProjection(orderId: string, status: "PACKING" | "SHIPPED"): void {
  updateStatus(orderId, status);
}
