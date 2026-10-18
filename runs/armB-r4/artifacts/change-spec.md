# Intent — change-spec.md

Observable behavior the team has agreed to implement. Implementation details
are left to the implementer; business policy is decided here.

```
REQ-001
A standard customer may cancel an eligible order less than
30 minutes after successful payment capture.

REQ-002
A premium customer may cancel an eligible order less than
60 minutes after successful payment capture.

REQ-003
Repeated cancellation requests must not create multiple refunds.

REQ-004
The existing cancellation API response contract must remain
compatible.

REQ-005  (added 11:07 AM — NEW, not yet implemented)
An order cannot be cancelled after warehouse packing has started,
regardless of how much time remains in the customer's window.
```

Recorded decisions:

- "Checkout" means successful payment capture.
- Exactly 30:00 (or 60:00) is OUTSIDE the window.
- An "eligible order" is a PAID order with a captured payment.
- Customer tier is carried on the order at purchase time.

Non-goals:

```
NON-GOAL-001  Partial item cancellation is not part of this change.
NON-GOAL-002  Merchant-initiated cancellation is not being redesigned.
NON-GOAL-003  The public cancellation API is not being versioned
              as part of this work.
```
