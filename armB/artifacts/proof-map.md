# Proof — proof-map.md

Each significant requirement maps to verification evidence in
test/cancellation.test.ts.

```
REQ-001 -> TEST-001    Standard customer at 29:59 can cancel.
REQ-001 -> TEST-002    Standard customer at 30:00 cannot cancel.
REQ-002 -> TEST-003    Premium customer at 45:00 can cancel.
REQ-003 -> TEST-004    Two identical cancellation requests result
                       in one refund.
REQ-004 -> CONTRACT-001  Existing API contract test remains unchanged.

REQ-005 -> TEST-005    Order with packing started (packing_started_at
                       recorded per OBS-005) and status projection
                       already PACKING cannot be cancelled inside the
                       customer's window.
REQ-005 -> TEST-006    Order whose packing_started_at is recorded but
                       whose status projection still reads PAID
                       (projection lag per OBS-006) cannot be cancelled
                       inside the customer's window, and no refund
                       request is published (OBS-004).
REQ-005 -> TEST-007    Order with packing not started (packing_started_at
                       null) inside the window can still be cancelled
                       (REQ-001 behavior preserved).
```
