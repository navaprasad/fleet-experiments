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

REQ-005 -> TEST-005    Order whose packing_started_at is recorded (per
                       OBS-005, durably at event ingestion) cannot be
                       cancelled while well inside the customer window,
                       even though the status projection still reads
                       PAID (per OBS-006, the projection may lag the
                       recorded fact). The refusal publishes no refund
                       request (per OBS-004, only successful
                       cancellation publishes one).
REQ-005 -> TEST-006    Order whose status projection has caught up
                       (status = PACKING) cannot be cancelled inside
                       the window.
REQ-005 -> TEST-007    Premium customer with packing started cannot
                       cancel even with most of the 60-minute window
                       (REQ-002) remaining — "regardless of how much
                       time remains in the customer's window".
```
