// Cancellation policy and handler.
import { type Order, getOrder, updateStatus, publishRefundRequest } from "./store.ts";

export class CancellationNotAllowedError extends Error {
  constructor(message = "Cancellation not allowed") {
    super(message);
    this.name = "CancellationNotAllowedError";
  }
}

// Injectable clock so tests can control time deterministically.
export type Clock = () => Date;
export let now: Clock = () => new Date();
export function setClock(clock: Clock): void {
  now = clock;
}

const WINDOW_MINUTES: Record<Order["customerTier"], number> = {
  STANDARD: 30, // REQ-001
  PREMIUM: 60, // REQ-002
};

export function isInsideCancellationWindow(order: Order): boolean {
  // The window starts at successful payment capture; exactly WINDOW minutes
  // is outside the window.
  if (!order.paymentCapturedAt) return false;
  const capturedAt = new Date(order.paymentCapturedAt).getTime();
  const elapsedMinutes = (now().getTime() - capturedAt) / 60000;
  return elapsedMinutes < WINDOW_MINUTES[order.customerTier];
}

export function canCancel(order: Order): boolean {
  if (order.status === "SHIPPED" || order.status === "CANCELLED") {
    return false;
  }
  // REQ-005: an order cannot be cancelled after warehouse packing has
  // started, regardless of remaining window time. Packing is durably
  // recorded as packing_started_at at event ingestion (OBS-005); the
  // status projection may lag (OBS-006), so we gate on the recorded
  // fact, not on the projected status.
  if (order.packingStartedAt !== null) {
    return false;
  }
  return isInsideCancellationWindow(order);
}

export function cancelOrder(orderId: string): Order {
  const order = getOrder(orderId);
  if (!order) {
    throw new CancellationNotAllowedError("Order not found");
  }

  // Repeated cancellation requests must not create multiple refunds (REQ-003).
  if (order.status === "CANCELLED") {
    return order;
  }

  if (!canCancel(order)) {
    throw new CancellationNotAllowedError();
  }

  updateStatus(orderId, "CANCELLED");
  publishRefundRequest(orderId, now().toISOString());
  return { ...order, status: "CANCELLED" };
}
