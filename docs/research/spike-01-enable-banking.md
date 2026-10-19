# SPIKE-01: Enable Banking test connection — findings

Method, checklist and gates: `docs/PRD.md` Appendix B. Issue #8. Tooling and runbook: `scripts/spike-01/README.md`.

Draft: filled in during the spike. A cell reads "—" until it has evidence, or "not available" with the reason. Every sample here follows the Appendix B anonymisation rules and has had a second read before commit.

## 1. Summary

| Gate | Decision | Evidence |
|---|---|---|
| G1 | — | — |
| G2 | — | — |
| G3 | — | — |
| G4 | — | — |
| G5 | — | — |
| G6 | — | — |
| G7 | — | — |
| G8 | — | — |
| G9 | — | — |
| G10 | — | — |
| G11 | — | — |
| G12 | — | — |
| G13 | — | — |
| G14 | — | — |

Top 5 findings:
1. —

## 2. Setup

- Day 1: —. Observation: — to — (month-end crossed: —).
- Registration: the developer's only (§10 question 7). Sandbox application: —. Production application: restricted mode, linked —.
- Banks and accounts tested:

| Bank | Account | Type | Holder | Linked in Control Panel | App session | Expendable |
|---|---|---|---|---|---|---|
| Erste | [ACCT_A] | — | — | — | — | — |
| Alior | [ACCT_B] | — | — | — | — | — |

- Unattended fetches: — (machine stayed on / fetched by hand at 4 set times).
- Not tested, and why: second member's registration (§10 question 7); —

## 3. Per-bank findings

| # | Item | Erste | Alior |
|---|---|---|---|
| 1 | Max consent length allowed; length granted (days) | — | — |
| 2 | History depth on first fetch and after the window closes; window length; which approval opened it; does a later approval reopen it | — | — |
| 3 | Account types returned; are cards and loans exposed as accounts | — | — |
| 4 | Account identifiers (IBAN, domestic, masked card); both IBAN and domestic forms; holder name; co-holder flag | — | — |
| 5 | Balance types per account type; credit limit returned; does booked include pending or holds | — | — |
| 6 | Transaction fields populated (% per field) | — | — |
| 7 | Description samples (see §4) | — | — |
| 8 | Description usability score (G2) | — | — |
| 9 | Pending: statuses; identifier; kept when booked; disappears in the same fetch; changes; pending replaced while pending; days to booking (min/median/max) | — | — |
| 10 | Pending that never books: disappears or CNCL/RJCT; booked later cancelled or rejected | — | — |
| 11 | Missing, changed or reused identifiers; identical same-day transactions | — | — |
| 12 | Joint account: same identifiers from both logins | — | — |
| 13 | Unattended limit; response when exceeded; member-present refreshes counted; what counts as a fetch | — | — |
| 14 | Early revocation: next fetch's response; distinguishable from a temporary error; time to detect | — | — |
| 15 | Re-consent: identifiers stable; does connecting again end another session | — | — |
| 16 | Enrichment from Enable Banking (merchant names, categories, logos) | — | — |
| 17 | Restricted mode: linked-account limit; new account needs linking and re-consent; time limit; Enable Banking's answer | — | — |
| 18 | The bank's own CSV export: format, encoding, columns | — | — |
| 19 | Card and loan repayments and transfers seen from the paying account | — | — |
| 20 | Days from transaction date to first booked appearance: longest typical lag (9 in 10), maximum, long holds listed separately | — | — |
| 21 | Ending access from the app: bank shows consent revoked; old session fails | — | — |

### Item 8 scores

| # | Bank | Account type | Description (anonymised) | Score (1 / 0.5 / 0) |
|---|---|---|---|---|
| 1 | — | — | — | — |

## 4. Samples

### Descriptions per account type
—

### Pending → booked
—

### Foreign currency
—

## 5. Joint accounts and limits

- Linked-account limit: —
- Enable Banking's written answer: not asked yet.
- Joint account comparison: —

## 6. Consent lifecycle

- Granted length: —
- History window: —
- Revocation: —
- Re-consent: —
- Detection latency: —

## 7. Limits

- Unattended: —
- Member-present: —

## 8. Decision gates

| Gate | Trigger observed | Decision | Evidence | Requirements affected |
|---|---|---|---|---|
| G1 | — | — (default: no limit assumed until Enable Banking refuses a link; CSV for any account it refuses) | — | BANK-02, BANK-16, J-01 |
| G2 | — | — (default: treat as below 50%) | — | CAT-14, MET-05 |
| G3 | — | — (default: manual liabilities) | — | ACC-06, ACC-08 |
| G4 | — | — (default: assume ≤90 days) | — | TXN-21, BUD-13 |
| G5 | — | — (default: pending shown and counted; matches flagged more often) | — | TXN-06, TXN-07, BUD |
| G6 | — | — (default: booking date) | — | TXN-05 |
| G7 | — | — (default: assume triggered) | — | TXN-10 |
| G8 | — | — (default: manual merge) | — | BANK-15 |
| G9 | — | — (default: 1 day) | — | BANK-10 |
| G10 | — | — (default: assume member refreshes are counted) | — | BANK-06, BANK-07 |
| G11 | — | — (default: suggestions only) | — | TXN-13 |
| G12 | — | — (default: not used) | — | CAT |
| G13 | — | — (default: assume the link uses up the window and nothing reopens it) | — | BANK-16, BANK-05 |
| G14 | — | — (default: 7 days) | — | BUD, INS-23 |

## 9. PRD impact

Every requirement marked `Depends on: SPIKE-01`, each "unchanged" or with the change to make.

| Requirement | Change |
|---|---|
| ACC-02 | — |
| ACC-06 | — |
| ACC-08 | — |
| ACC-12 | — |
| AUTH-11 | — |
| BANK-01 | — |
| BANK-04 | — |
| BANK-05 | — |
| BANK-06 | — |
| BANK-07 | — |
| BANK-10 | — |
| BANK-12 | — |
| BANK-14 | — |
| BANK-15 | — |
| BANK-16 | — |
| BUD-02 | — |
| BUD-13 | — |
| CAT-07 | — |
| CAT-10 | — |
| CAT-11 | — |
| CAT-14 | — |
| FC-03 | — |
| FC-04 | — |
| HH-06 | — |
| HH-07 | — |
| INS-03 | — |
| INS-11 | — |
| INS-23 | — |
| J-01 | — |
| J-02 | — |
| J-05 | — |
| J-06 | — |
| J-07 | — |
| J-08 | — |
| J-09 | — |
| J-11 | — |
| MET-05 | — |
| NW-02 | — |
| NW-04 | — |
| NW-06 | — |
| REC-01 | — |
| REC-02 | — |
| REC-03 | — |
| REC-06 | — |
| REC-14 | — |
| SET-03 | — |
| SET-09 | — |
| TXN-03 | — |
| TXN-05 | — |
| TXN-06 | — |
| TXN-07 | — |
| TXN-10 | — |
| TXN-13 | — |
| TXN-14 | — |
| TXN-21 | — |
| TXN-24 | — |

## 10. Open questions

| Question | Conservative assumption used |
|---|---|
| — | — |

## 11. Data handling

- Anonymisation rules applied to every extract above, with a second read before commit: —
- Raw history: kept complete and encrypted outside the repository; location recorded in —. Second encrypted copy on separate media, refreshed after each day's fetches; opened on another machine or after a restart on —, newest fetch matching the main copy: —.
- Deletion: only by the user's recorded decision, once G13 is known and the history is in the app or judged not needed.
