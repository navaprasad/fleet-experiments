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

REQ-005 -> TEST-005    Packing started (PackingStarted ingested, per
                       OBS-005) while the status projection still lags
                       and reads PAID (per OBS-006), well inside the
                       customer's window: cancellation is refused (409)
                       and no refund request is published.
REQ-005 -> TEST-006    Packing started and the status projection has
                       caught up (status PACKING), inside the window:
                       cancellation is refused (409) and no refund
                       request is published.
```

Proof rationale for REQ-005 (derived from baseline.md): the durable
packing_started_at fact recorded at event ingestion (OBS-005) is the
authoritative signal that packing has started; the status projection may
lag by several seconds (OBS-006), so the proof must show the cutoff holds
even when the order status still reads PAID. "No refund request" follows
from OBS-004 (refunds are published only on successful cancellation).

