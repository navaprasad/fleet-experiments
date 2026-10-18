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

REQ-005 -> TEST-005    PackingStarted has been ingested (packing_started_at
                       recorded per OBS-005) but the status projection still
                       reads PAID (projection lag per OBS-006); cancellation
                       inside the customer's window is rejected.
REQ-005 -> TEST-006    Status projection has caught up (order status PACKING);
                       cancellation inside the customer's window is rejected.
REQ-005 -> TEST-007    A rejected cancellation after packing started publishes
                       no refund request (consistent with OBS-004/REQ-003).
```
