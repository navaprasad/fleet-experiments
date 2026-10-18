// Warehouse event ingestion.
import { recordPackingEvent, updateStatus } from "./store.ts";

export function ingestPackingStarted(orderId: string, occurredAt: string): void {
  recordPackingEvent(orderId, occurredAt);
}

export function applyStatusProjection(orderId: string, status: "PACKING" | "SHIPPED"): void {
  updateStatus(orderId, status);
}
