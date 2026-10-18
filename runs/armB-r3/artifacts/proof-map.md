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

REQ-005 -> TEST-005    PackingStarted ingested (packing_started_at
                       recorded, OBS-005) while the status projection
                       still shows PAID (projection lag, OBS-006):
                       cancellation inside the window is rejected and
                       no refund request is published (OBS-004).
REQ-005 -> TEST-006    Packing recorded and projection caught up
                       (status PACKING): a premium customer inside
                       their 60-minute window still cannot cancel.
REQ-005 -> TEST-007    Guard against over-blocking: an order with no
                       packing recorded remains cancellable inside
                       its window.
```
