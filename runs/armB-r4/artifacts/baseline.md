# Evidence — baseline.md

Verified observations about the existing system. An unresolved question stays
an unresolved question until a decision is recorded in change-spec.md.

```
OBS-001 [confirmed by route]
POST /orders/:id/cancel currently returns the existing order object.

OBS-002 [confirmed by test]
SHIPPED orders cannot be cancelled.

OBS-003 [confirmed by schema]
Orders contain created_at and payment_captured_at timestamps.

OBS-004 [confirmed by integration code]
Successful cancellation publishes a refund request record.

OBS-005 [confirmed by event-processing code and Operations]
PackingStarted is durably recorded on the order (packing_started_at)
at event ingestion, independently of the order-status projection.

OBS-006 [confirmed by Operations]
The order-status projection may lag behind that recorded fact
by several seconds.

OBS-007 [confirmed by code]
Repeated cancellation of an already-cancelled order returns the
order unchanged and publishes no additional refund request.
```
