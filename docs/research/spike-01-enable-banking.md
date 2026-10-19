# SPIKE-01: Enable Banking test connection — findings

Method, checklist and gates: `docs/PRD.md` Appendix B. Issue #8. Tooling and runbook: `scripts/spike-01/README.md`.

Draft. A cell reads "—" until it has evidence, or "not available" with the reason. Every sample here follows the Appendix B anonymisation rules and has had a second read before commit.

**Scope of this draft.** On day 1 the developer chose to draw conclusions from Erste alone, from two fetches on the day of connection, without the observation period. Alior's consent was authorised but returned no accounts (§2). The gates below were proposed from that evidence and decided by the user on 2026-10-20 (§8). Anything that needs time (pending → booked, changes over days, limits, revocation, re-consent, the history window) is untested and keeps its conservative default.

## 1. Summary

**Decision: go with Enable Banking.** Despite the limits below, the developer keeps Enable Banking as the bank-data provider. The app is built so the provider can be replaced later (`docs/architecture.md` §5.9).

| Gate | Decision | Evidence |
|---|---|---|
| G1 | Not triggered: no limit assumed (default) | 5 Erste accounts linked and returned without refusal |
| G2 | Not triggered: 96% | 48 of 50 Erste transactions scored usable (item 8) |
| G3 | Cards: not triggered, the card balance is exposed. Loans: triggered. Loans aren't tracked as accounts for now: a repayment is a fixed expense in "Rent / mortgage payment" or "Other loan repayments" | The credit card is an account with a debt balance; a monthly loan repayment leaves a current account but no loan account is returned |
| G4 | Not triggered | The first "longest" fetch returned 730 days, the full range requested |
| G5 | Triggered for Erste. Pending handling (TXN-06, TXN-07) is postponed to Later; M1 imports booked transactions only | No pending items in either strategy, while available < booked shows holds exist |
| G6 | Triggered for Erste: booking date | `transaction_date` and `value_date` are never filled |
| G7 | Default (assume triggered; no rule change) | No identifier problem in two fetches 18 minutes apart; not observed over days |
| G8 | Default (manual merge) | No second login (§10) |
| G9 | Default (1 day) | Not tested |
| G10 | Default (member refreshes counted) | Not tested |
| G11 | Not triggered for Erste | Counterparty IBAN on 605 of 605 non-card debits and 310 of 350 non-card credits; card repayments pair 40 of 40 |
| G12 | Not triggered: not used | No enrichment fields; merchant names are raw card descriptors |
| G13 | Default (the link uses up the window) | Not tested; the kept 730-day history covers the Erste accounts anyway |
| G14 | 5 days, household-wide, so a month is settled for a review on the 5th | The budget date is the booking date (G6), so a transaction reaches the app about a day after its budget date (inferred, not observed over days). From purchase to booking: 112 rides, 9 in 10 within 3 days |

Top 5 findings:
1. **Two years of history on the first fetch, and it holds together.** "longest" returned 730 days, everything requested, and "default" returns 90 days. Transaction identifiers are unique and stable between the two fetches, and on current accounts each `balance_after_transaction` follows from the one before, so a gap in the history can be detected.
2. **No pending transactions at all.** Every transaction is `BOOK`. Holds show only as an available balance below the booked balance.
3. **No transaction date.** The budget date has to be the booking date. Rides whose descriptor carries the ride date booked 1–6 days later (median 2).
4. **Descriptions are good.** The merchant is in `creditor.name` and the descriptor. The second line of `remittance_information` is always Erste's own transaction type (card transaction, direct debit, standing order, fee, loan repayment and so on), which stands in for the empty `bank_transaction_code`. Card payments abroad carry the original amount and rate in the text.
5. **The credit card is an ordinary-looking account.** It is typed `CACC` like the current accounts, has its own IBAN and a debt balance, no credit limit, and a `balance_after_transaction` that is always 0. Card repayments pair by IBAN (40 of 40). Loans are not exposed.

## 2. Setup

- Day 1: 2026-10-19 (sandbox, then Erste). Observation: not run (the developer's choice, see Scope).
- Registration: the developer's only (§10). Sandbox application: Bank Millennium mock flow run end to end on day 1. Production application: restricted mode, Erste accounts linked in the Control Panel on day 1, shortly before the app session.
- Banks and accounts tested:

| Bank | Account | Type | Holder | Linked in Control Panel | App session | Expendable |
|---|---|---|---|---|---|---|
| Erste | [ACCT_A] | Credit card ("Karta kredytowa Visa Platinum"), PLN, typed `CACC` | [PERSON_1] | day 1 | day 1 | no |
| Erste | [ACCT_B] | Current ("Konto Smart"), PLN | [PERSON_1] | day 1 | day 1 | no |
| Erste | [ACCT_C] | Current ("Konto Erste Platinum"), PLN; two different cards are used on it | [PERSON_1] (the only name returned) | day 1 | day 1 | no |
| Erste | [ACCT_D] | Currency ("Konto24 walutowe w USD") | [PERSON_1] | day 1 | day 1 | no |
| Erste | [ACCT_E] | Currency ("Konto24 walutowe w EUR") | [PERSON_1] | day 1 | day 1 | no |
| Alior | — | Consent authorised, 0 accounts returned | — | not known | day 1 | — |

- Unattended fetches: none.
- Not tested, and why: second member's registration (§10); Alior (its consent returned no accounts, and the developer set it aside); observation over days, and so pending, changes, month-end and lag measured directly; limits; revocation and re-consent; window probes (no account named as expendable); the joint-account comparison; the bank's CSV export.

## 3. Per-bank findings

| # | Item | Erste | Alior |
|---|---|---|---|
| 1 | Max consent length allowed; length granted (days) | 180 (`maximum_consent_validity` 15,552,000 s); 180 granted. Enable Banking lists Erste as `beta` | 180 granted |
| 2 | History depth on first fetch and after the window closes; window length; which approval opened it; does a later approval reopen it | First fetch ("longest", within 2 minutes of the app approval, the Control Panel link made earlier that day): 730 days, from the first day Enable Banking asked for, so the bank may hold more. "default": 90 days. The rest: not tested | not available (no accounts) |
| 3 | Account types returned; are cards and loans exposed as accounts | 5 accounts, all `CACC`: 2 current (PLN), 2 currency (USD, EUR), 1 credit card. The card is exposed as an account and can be told apart only by its product name. No loan account, although a monthly "SPŁATA KREDYTU" leaves a current account | not available |
| 4 | Account identifiers (IBAN, domestic, masked card); both IBAN and domestic forms; holder name; co-holder flag | IBAN on every account, the card included. No domestic form (`account_id.other` and `all_account_ids` empty), no masked card number. Holder name and postal address returned. No co-holder flag; one name on the account two cards are used on. `details` holds a label on 2 accounts (one set by the holder, one "Prywatne__PLN"); `usage` empty | not available |
| 5 | Balance types per account type; credit limit returned; does booked include pending or holds | `ITBD` and `ITAV` only, on every account, with no reference date or change time. Current accounts: `ITBD` equals the last `balance_after_transaction`, so booked excludes holds; at fetch time `ITAV` < `ITBD` on the busiest account, so holds lower available. Card: `ITBD` negative (the debt), `ITAV` the credit still available; no `credit_limit` (it can only be inferred as `ITAV` − `ITBD`) | not available |
| 6 | Transaction fields populated (% per field) | Of 4,106: `transaction_id` 100, `entry_reference` 100 (different from `transaction_id`), `booking_date` 100, `transaction_date` 0, `value_date` 0, counterparty name 99, counterparty account 100 on non-card debits, 89 on non-card credits and 0 on card transactions, `remittance_information` 100 (2 lines: descriptor, then Erste's transaction type), `merchant_category_code` 0, `bank_transaction_code` 0, `balance_after_transaction` 100 on current accounts (no breaks in the running balance) and always 0 on the card, original amount and currency 0 as fields but in the text of card payments abroad, `exchange_rate` 0 (rate in the text). Counterparty names are cut at about 32 characters and often end in the start of a street address; a saved payee shows the holder's own name for it | not available |
| 7 | Description samples (see §4) | §4 | not available |
| 8 | Description usability score (G2) | 48 / 50 = 96% (proposed) | not available |
| 9 | Pending: statuses; identifier; kept when booked; disappears in the same fetch; changes; pending replaced while pending; days to booking (min/median/max) | Not provided: only `BOOK` in both strategies (4,106 and 741 transactions), no `PDNG` or `HOLD` even while holds lower `ITAV`. The rest of the item: not available | not available |
| 10 | Pending that never books: disappears or CNCL/RJCT; booked later cancelled or rejected | Not observed (no observation period) | not available |
| 11 | Missing, changed or reused identifiers; identical same-day transactions | Two fetches 18 minutes apart: all 741 overlapping transactions matched by `transaction_id` with every field identical; none missing or reused. 35 groups of identical same-day transactions (date, amount, description), each with distinct identifiers. Over days: not observed | not available |
| 12 | Joint account: same identifiers from both logins | Not available (no second login) | not available |
| 13 | Unattended limit; response when exceeded; member-present refreshes counted; what counts as a fetch | Not tested. Two member-present fetches on day 1 (128 requests) without refusal | not available |
| 14 | Early revocation: next fetch's response; distinguishable from a temporary error; time to detect | Not tested | not available |
| 15 | Re-consent: identifiers stable; does connecting again end another session | Not tested | not available |
| 16 | Enrichment from Enable Banking (merchant names, categories, logos) | None: no fields beyond the standard set; `creditor.name` is the raw card descriptor (for example "Amazon.pl*[REDACTED]", "BOLT.EU/R/[REDACTED]") | not available |
| 17 | Restricted mode: linked-account limit; new account needs linking and re-consent; time limit; Enable Banking's answer | No limit reached with 5 accounts. The rest: not tested | Consent authorised for 180 days but 0 accounts returned: not ticked at the bank, or not linked in the Control Panel (not known) |
| 18 | The bank's own CSV export: format, encoding, columns | Not collected | not available |
| 19 | Card and loan repayments and transfers seen from the paying account | Card repayment: a transfer to the card's own IBAN ([ACCT_A]), type "PRZELEW NA RACHUNEK BANKU - ONLINE", free text by the payer; on the card a credit "Spłata należności - dziękujemy" / "Spłata" with no counterparty account. All 40 such transfers pair with a card credit of the same amount within 3 days. Transfers between own accounts: 116 legs whose counterparty IBAN is another linked account; the bank's own currency exchanges ("Transakcja eFX") carry the same reference and rate on both legs. Loan repayment: "SPŁATA KREDYTU" / "SPŁATA", no counterparty name, counterparty account present | not available |
| 20 | Days from transaction date to first booked appearance: longest typical lag (9 in 10), maximum, long holds listed separately | No transaction date in the data. Proxy: 112 rides whose card descriptor carries the ride date: 1–6 days, median 2, 9 in 10 within 3. Long holds: not seen | not available |
| 21 | Ending access from the app: bank shows consent revoked; old session fails | Not tested | not available |

### Item 8 scores

The 50 newest transactions across all Erste accounts, newest first (there was no observation period). Scored by the rule in Appendix B G2: can a person tell the merchant or payee from the description alone. Card payments on current accounts start "VISA PLAT [CARD_n] PŁATNOŚĆ KARTĄ <amount> PLN", shortened below to "card:". Store and terminal numbers and towns outside Warsaw are redacted. The scores are proposals; the user confirms or changes them.

| # | Bank | Account type | Description (anonymised) | Score (1 / 0.5 / 0) |
|---|---|---|---|---|
| 1 | Erste | card | Amazon.pl*[REDACTED] AMAZON.PL LU / Płatność | 1 |
| 2 | Erste | current | Opłata za wypłatę gotówki cash back dot.karty [CARD_1] / OPŁATA/PROWIZJA | 1 |
| 3 | Erste | current | card, w tym CASHBACK 110 PLN SHELL [REDACTED] | 1 |
| 4 | Erste | current | card: "PETRO-NAFT" SP. Z O.O. [REDACTED] | 1 |
| 5 | Erste | current | card: TERRAMARKET SP. Z O.O. [REDACTED] | 1 |
| 6 | Erste | current | card: ROBSON [REDACTED] | 1 |
| 7 | Erste | current | card: Firmowy sklep miesny ZM [REDACTED] | 1 |
| 8 | Erste | current | Zakup BLIK Max Premium Burgers [REDACTED] ref:[REDACTED] / OBCIĄŻENIE | 1 |
| 9 | Erste | current | to [PERSON_3]: "[PERSON_2] pobyt [REDACTED]" / PRZELEW EXPRESS ELIXIR | 1 |
| 10 | Erste | current | card: ASIAN HOUSE KING CROSS WARSZAWA | 1 |
| 11 | Erste | current | card: ZABKA [REDACTED] WARSZAWA | 1 |
| 12 | Erste | current | card: AUCHAN POLSKA SP. Z [REDACTED] WARSZAWA | 1 |
| 13 | Erste | current | card: MCDONALDS [REDACTED] WARSZAWA | 1 |
| 14 | Erste | current | card: MCDONALDS [REDACTED] WARSZAWA | 1 |
| 15 | Erste | current | card: BILETOMAT TW [REDACTED] WARSZAWA | 1 |
| 16 | Erste | current | card: AUCHAN POLSKA SP. Z [REDACTED] WARSZAWA | 1 |
| 17 | Erste | current | card: ASIAN HOUSE KING CROSS WARSZAWA | 1 |
| 18 | Erste | card | ZEN.COM UAB Vilnius LT / Płatność (a payment service; the real payee is hidden) | 0.5 |
| 19 | Erste | current | card: BILETOMAT TW [REDACTED] WARSZAWA | 1 |
| 20 | Erste | current | card: KINOTEKA [REDACTED] WARSZAWA | 1 |
| 21 | Erste | current | card: JMP S.A. BIEDRONKA [REDACTED] WARSZAWA | 1 |
| 22 | Erste | current | SPŁATA KREDYTU / SPŁATA (no payee name; the bank's own loan) | 1 |
| 23 | Erste | current | card: ZABKA [REDACTED] WARSZAWA | 1 |
| 24 | Erste | current | card: JMP S.A. BIEDRONKA [REDACTED] WARSZAWA | 1 |
| 25 | Erste | current | card: JMP S.A. BIEDRONKA [REDACTED] WARSZAWA | 1 |
| 26 | Erste | current | card: BOLT.EU/R/[REDACTED] Tallinn | 1 |
| 27 | Erste | current | card: UBER *TRIP AMSTERDAM | 1 |
| 28 | Erste | current | to WSPÓLNOTA MIESZKANIOWA [REDACTED]: "CZYNSZ [REDACTED]" / ZLECENIE STAŁE NA RACHUNEK W INNYM BANKU | 1 |
| 29 | Erste | current | card: GURU KEBAB TENDUR WARSZAWA | 1 |
| 30 | Erste | current | card: MCDONALDS [REDACTED] WARSZAWA | 1 |
| 31 | Erste | current | card: PhotoAiD S.A Bialystok | 1 |
| 32 | Erste | current | card: Urzad Dzielnicy [REDACTED] Warszawa | 1 |
| 33 | Erste | card | PLAYTOMIC.IO [REDACTED] MADRID ES / Płatność | 1 |
| 34 | Erste | card | WOLT WARSAW PL / Płatność | 1 |
| 35 | Erste | current | card: BOLT.EU/R/[REDACTED] Tallinn | 1 |
| 36 | Erste | current | card: WETERYNARZ POD LAPA Warszawa | 1 |
| 37 | Erste | current | to [PERSON_5] (the holder's saved name for the payee): "[REDACTED] [PERSON_2] splata" / ZLECENIE STAŁE NA RACHUNEK W INNYM BANKU | 1 |
| 38 | Erste | current | card: ORLEN STACJA NR [REDACTED] WARSZAWA | 1 |
| 39 | Erste | card | SP PREPMYMEAL-PL FRANKFURT AM DE / Płatność | 1 |
| 40 | Erste | card | KOCIO TAXI [PERSON_7] [REDACTED] PL / Płatność | 1 |
| 41 | Erste | card | AllegroPay POZNAN PL / Płatność | 1 |
| 42 | Erste | card | WOLT WARSAW PL / Płatność | 1 |
| 43 | Erste | card | Lite e-Commerce Sp. z o.o Warszawa PL / Płatność (a company name, not a shop name) | 0.5 |
| 44 | Erste | current | from [PERSON_4]: "Przelew na telefon [REDACTED] Przelew na telefon Dla [PERSON_1] Od [PERSON_4]" / UZNANIE | 1 |
| 45 | Erste | current | from [PERSON_6]: "Padel" / UZNANIE | 1 |
| 46 | Erste | current | Zakup BLIK PayPro S.A. [REDACTED] Poznan ref:[REDACTED] / OBCIĄŻENIE (a payment processor; the shop is hidden) | 0 |
| 47 | Erste | current | card: Allegro Poznan | 1 |
| 48 | Erste | card | BOLT.EU/O/[REDACTED] Warsaw PL / Płatność | 1 |
| 49 | Erste | card | VAY WARSZAWA PL / Płatność | 1 |
| 50 | Erste | card | GURU KEBAB TENDUR WARSZAWA PL / Płatność | 1 |

## 4. Samples

### Descriptions per account type

Each line is `remittance_information` as returned (amounts rounded), with the counterparty name where it adds something. Three masked cards appear across the current and currency accounts, here [CARD_1] to [CARD_3]; the "VISA PLAT" or "VISA SEL" prefix changes over time for the same card.

Credit card account (`creditor.name` is the first part of line 1):
- `["WOLT WARSAW PL", "Płatność"]`: purchase.
- `["UBR* PENDING.UBER.COM AMSTERDAM NL", "Płatność"]`: a booked purchase, despite "PENDING" in the merchant's name.
- `["Amazon.pl AMAZON.PL LU", "Zwrot"]`: refund, a credit.
- `["Spłata należności - dziękujemy", "Spłata"]`, counterparty name "Splata karty kredytowej": repayment, a credit with no counterparty account.
- Other type labels seen: "Opłata/prowizja" (fee), "Odsetki" (interest).

Current account:
- `["VISA PLAT [CARD_1] PŁATNOŚĆ KARTĄ 32 PLN  UBER   *TRIP AMSTERDAM", "TRANSAKCJA KARTĄ"]`: card purchase.
- `["VISA PLAT [CARD_2] ZWROT PŁATNOŚCI KARTĄ 57 PLN  AllegroPay POZNAN", "TRANSAKCJA KARTĄ"]`: card refund, a credit with no counterparty name.
- `["VISA PLAT [CARD_1] PŁATNOŚĆ KARTĄ, w tym CASHBACK 110 PLN SHELL [REDACTED]", "TRANSAKCJA KARTĄ"]`: the amount includes the cash taken.
- `["VISA SEL [CARD_2] WYPŁATA Z BANKOMATU KARTĄ 700 PLN  PLANET CASH [REDACTED] WARSZAWA", "TRANSAKCJA KARTĄ"]`, counterparty name "PLANET_R": cash withdrawal.
- `["Zakup BLIK Pizza Na Wypasie [REDACTED] ref:[REDACTED]", "OBCIĄŻENIE"]`: BLIK purchase; the counterparty account is the shop's or its payment processor's.
- `["/NIP/[REDACTED]/IDP/[REDACTED]/TXT/DarowiznaWWF[REDACTED]/SEK/[REDACTED]", "POLECENIE ZAPŁATY NA RACHUNEK W INNYM BANKU"]`, payee "FUNDACJA WWF POLSKA UL.[REDACTED]": direct debit.
- `["CZYNSZ [REDACTED]", "ZLECENIE STAŁE NA RACHUNEK W INNYM BANKU"]`, payee "WSPÓLNOTA MIESZKANIOWA [REDACTED]": standing order.
- `["Spłata zadłużenia karty kredytowej", "PRZELEW NA RACHUNEK BANKU - ONLINE"]`, payee [PERSON_1] with a street address, counterparty account [ACCT_A] (the card): card repayment.
- `["SPŁATA KREDYTU", "SPŁATA"]`, no payee name, counterparty account present: loan repayment.
- `["/OPF/X/////[REDACTED] [REDACTED] [PERSON_1] Przelew z Walutomatu", "UZNANIE"]`, payer "CURRENCY ONE SPÓŁKA AKCYJNA UL.": money arriving through a currency-exchange service. No incoming payment comes from an employer: the larger credits are from Walutomat, [PERSON_2], own accounts, family and once the tax office. So salary can't be recognised from these accounts' data.
- `["Opłata za prowadzenie Konta Smart od 01.MM.YYYY do 31.MM.YYYY", "OPŁATA/PROWIZJA"]`: monthly account fee. Older fees on the same account name the product "Konta Santander": Erste took over the bank, and the product name changed in the history.

Currency accounts:
- `["VISA PLAT [CARD_2] PŁATNOŚĆ KARTĄ 1 EUR  OBRADOR ARTESANAL DE LUCI [REDACTED]", "TRANSAKCJA KARTĄ"]`: a card payment in EUR taken from the EUR account.
- `["[REDACTED] - Transakcja eFX kurs: 4.2844000", "UZNANIE"]`, payer [PERSON_1]: the bank's own currency exchange, with the rate in the text. The PLN leg reads the same with "OBCIĄŻENIE".

### Pending → booked
Not available: Erste returned no pending transactions.

### Foreign currency
Card payments in a foreign currency from a PLN account (5 in 730 days: 4 EUR, 1 GBP), for example `["VISA SEL [CARD_2] PŁATNOŚĆ KARTĄ 65 GBP 1 GBP=4.9922 PLN Duke of Wellington London", "TRANSAKCJA KARTĄ"]`. `transaction_amount` is in PLN and `exchange_rate` is empty. In all 5, the PLN amount equals the original amount times the stated rate (difference 0%), so any FX fee isn't in the amount.

## 5. Joint accounts and limits

- Linked-account limit: not reached with 5 Erste accounts.
- Enable Banking's written answer: not asked yet.
- Joint account comparison: not available (no second login). [ACCT_C] is used by two cards but returns one holder name, so a co-holder doesn't show in the data.

## 6. Consent lifecycle

- Granted length: 180 days at both banks, Erste's maximum.
- History window: the first "longest" fetch, within 2 minutes of the app approval, returned 730 days. Window length, the approval that opens it and whether a later one reopens it: not tested.
- Revocation: not tested.
- Re-consent: not tested.
- Detection latency: not tested.

## 7. Limits

- Unattended: not tested.
- Member-present: two Erste fetches on day 1 (128 requests in all) without refusal.

## 8. Decision gates

Decided on 2026-10-20. The user chose G3, G5, G6 and G14; the others were accepted as proposed. Untested gates keep the PRD's conservative defaults until a later test says otherwise (§10).

| Gate | Trigger observed | Decision | Evidence | Requirements affected |
|---|---|---|---|---|
| G1 | No | No limit assumed until Enable Banking refuses a link; CSV for any account it refuses (default) | 5 Erste accounts returned | BANK-02, BANK-16, J-01 |
| G2 | No | Merchant cleanup stays as planned; categorisation target unchanged | 96% on 50 Erste transactions (item 8) | CAT-14, MET-05 |
| G3 | Cards no; loans yes | NW uses the card's booked balance as its liability. Loans aren't tracked for now: a repayment is a fixed expense in "Rent / mortgage payment" or "Other loan repayments", and Erste's loan-repayment type maps to the latter. A manual loan for net worth comes with ACC-08 (M3) | Card `ITBD` is the debt; no loan account returned | ACC-06, ACC-08, CAT-11, NW-02 |
| G4 | No | The budget wizard can use up to 2 years of history for Erste | 730 days on the first fetch | TXN-21, BUD-13 |
| G5 | Yes (Erste) | Pending handling is postponed: TXN-06 and TXN-07 move to Later, M1 imports booked transactions only, and left to spend says "excludes purchases not yet booked". When a connected bank sends pending items, they are built then | Only `BOOK`; `ITAV` < `ITBD` | TXN-06, TXN-07, BUD-02, ACC-12, J-07 |
| G6 | Yes (Erste) | Budget date is the booking date for Erste; expect month-end shifts of 1–6 days | `transaction_date` 0% | TXN-05 |
| G7 | Not observed over days | Assume triggered (default); no rule change | Clean over 18 minutes only | TXN-10 |
| G8 | Not tested | Manual merge (default) | No second login | BANK-15 |
| G9 | Not tested | 1 day (default) | — | BANK-10, J-07 |
| G10 | Not tested | Assume member refreshes are counted (default) | — | BANK-06, BANK-07 |
| G11 | No (Erste) | Internal transfers can be matched by counterparty IBAN, card repayments included; currency exchanges also by their shared reference | 605/605 non-card debits with IBAN; 40/40 card repayments paired | TXN-13 |
| G12 | No | Not used | No enrichment fields | CAT |
| G13 | Not tested | Assume the link uses up the window (default); the kept spike history is imported in M1 | — | BANK-16, BANK-05 |
| G14 | Erste only | 5 days, household-wide and fixed rather than calibrated per bank, so a month is settled when it's reviewed on the 5th. A bank connected later whose lag proves longer may raise it, at most to 14 | Booking date is the budget date (G6): about 1 day to the first sync, inferred. 112-ride proxy, purchase to booking 9 in 10 within 3 days | INS-23, J-02, J-04, BUD defaults |

## 9. PRD impact

Every requirement marked `Depends on: SPIKE-01`, each "unchanged" or with the change made in `docs/PRD.md`. "Not tested" means the PRD's conservative default stands until a later test (§10).

| Requirement | Change |
|---|---|
| ACC-02 | Unchanged. Erste types every account `CACC`; the adapter types the card as a credit card from its product name (`docs/architecture.md` §5.9) |
| ACC-06 | Unchanged. Owed comes from source (1), the card's booked balance; "Available credit" is `ITAV`. No limit is given, so a member enters it |
| ACC-08 | Unchanged, M3. Erste returns no loan account, so the manual path applies. Until then a repayment is a fixed expense in "Rent / mortgage payment" or "Other loan repayments" (G3) |
| ACC-12 | **Changed:** the pending setting is pre-set off for Erste (booked excludes holds, item 5) and isn't shown until TXN-06 is built (G5) |
| AUTH-11 | Unchanged: re-consent not tested |
| BANK-01 | Unchanged. Erste gives no masked number but an IBAN on every account, and no co-holder flag, so Joint is never suggested from bank data. Type: ACC-02 |
| BANK-04 | Unchanged. Erste returned 730 days on the first fetch; the window's length wasn't tested, so the 60-minute limit stays (G13) |
| BANK-05 | Unchanged: option (b) stays, with its warning, because G13 wasn't tested |
| BANK-06 | Unchanged: limits not tested, and member refreshes are assumed to count (G10) |
| BANK-07 | Unchanged. Two member-present fetches on day 1 weren't refused; whether they count against the unattended limit wasn't tested (G10) |
| BANK-10 | **Changed:** "May need renewing" after 1 day of failures, not 3 (G9). History depth without a fresh window stays 90 days, which is what Erste's "default" returned |
| BANK-12 | Unchanged: re-consent not tested. The card has its own IBAN, so it is identified like any account |
| BANK-14 | Unchanged: whether ending access revokes the consent at the bank wasn't tested (item 21), so the message still doesn't claim it |
| BANK-15 | Unchanged: no second login (G8, manual merge). Erste gives an IBAN on every account, so the automatic match by full identifier can apply |
| BANK-16 | Unchanged: 5 accounts linked without reaching a limit (G1); the window wasn't tested (G13) |
| BUD-02 | **Changed:** the pending rule does nothing until TXN-06 is built, and left to spend says "excludes purchases not yet booked" (G5) |
| BUD-13 | Unchanged: 730 days at Erste (G4), so the short-history path is for CSV-only and newly opened accounts |
| CAT-07 | Unchanged. Erste fills the counterparty name, and the account number on non-card transactions. No card merchant codes, so that condition isn't offered; bank transaction code conditions use the transaction type (CAT-11) |
| CAT-10 | Unchanged. Counterparty account number on all non-card debits and 89% of non-card credits, none on card payments, which rely on the descriptor |
| CAT-11 | **Changed:** kept, not dropped. Erste's transaction type, the second line of the description, serves as the bank transaction code; a loan repayment maps to "Other loan repayments" (G3) |
| CAT-14 | Unchanged: 96% of descriptions usable (G2), so it stays Should |
| FC-03 | Unchanged. The starting balance is the booked balance; with no pending imported (G5), nothing is applied on day 0 |
| FC-04 | Unchanged: Erste reports no statement balance or repayment date for the card, as FC-04 already assumes |
| HH-06 | Unchanged: no second login, so joint accounts weren't compared (G8) |
| HH-07 | Unchanged: ending a connection wasn't tested (item 21) |
| INS-03 | Unchanged. Erste returned exactly the 730 days asked for, so an account whose history starts near that date reached the limit; whether Erste holds more is open (§10) |
| INS-11 | Unchanged: descriptions are usable (G2) |
| INS-23 | **Changed:** the settling window is a fixed 5 days instead of calibrated per bank, so a month is settled for a review on the 5th (G14). The defaults table and glossary follow |
| J-01 | **Changed:** step 9 names pay not arriving straight from an employer as a reason to enter the payday by hand (§4, §10). The rest unchanged: window not tested (G13), descriptions usable (G2) |
| J-02 | **Changed:** CSV files are imported about 5 days after the period ends, not a week (G14). Second registration and account limit not tested |
| J-05 | Unchanged: no card repayment date is reported, so 3b's "Card repayment date unknown" applies |
| J-06 | Unchanged: re-consent not tested |
| J-07 | **Changed:** 1a waits 1 day, not 3 (G9); step 4 runs pending matching only once TXN-07 is built (G5) |
| J-08 | Unchanged: no second login (G8) |
| J-09 | Unchanged: ending a connection not tested (item 21) |
| J-11 | Unchanged: no reissued card, closed account or new account was seen in one day |
| MET-05 | Unchanged: (a) under 10% and (b) at least 80% stand; 96% usable descriptions give no reason to lower (b) (G2) |
| NW-02 | Unchanged: the card counts at its booked balance (ACC-06); loans count only once entered by hand (ACC-08, M3; G3) |
| NW-04 | Unchanged: no second login (G8) |
| NW-06 | Unchanged: Erste returns only current balances, and past values come from ACC's history as NW-06 says. `balance_after_transaction` on current accounts agrees with it |
| REC-01 | Unchanged. Descriptions, counterparty account numbers and 730 days of history are there; the tolerances weren't re-tuned (no observation period) |
| REC-02 | Unchanged: Erste's transaction type tells a transfer or standing order from a card payment or direct debit (CAT-11) |
| REC-03 | Unchanged: Erste gives the original amount only in the description, so none is shown (TXN-24). 5 foreign card payments in 730 days |
| REC-06 | Unchanged: no pending (G5); references are in the descriptions |
| REC-14 | Unchanged: as REC-03 |
| SET-03 | Unchanged: no FX fields filled; a currency account comes as its own account in its currency, and the bank's own exchange legs share a reference |
| SET-09 | Unchanged: ending a connection not tested (item 21) |
| TXN-03 | Unchanged: Erste fills only the booking date, so only that date shows (item 6) |
| TXN-05 | Unchanged: with no transaction date, the existing order falls to the booking date (G6) |
| TXN-06 | **Changed:** Should, Later. M1 imports booked transactions only; the "doesn't show pending transactions" message and the cancelled-after-booking rule still ship in M1 (G5) |
| TXN-07 | **Changed:** Should, Later, with TXN-06 (G5) |
| TXN-10 | Unchanged: identifiers stable over 18 minutes only (G7 default). 35 groups of identical same-day transactions have distinct identifiers and are counted, not collapsed |
| TXN-13 | Unchanged: counterparty IBAN on every non-card debit, card repayments pair 40 of 40, exchange legs share a reference (G11). A loan repayment isn't marked as a transfer, so it falls to CAT-11 |
| TXN-14 | Unchanged: the card is its own account, and its repayments are transfers to its IBAN (item 19) |
| TXN-21 | Unchanged: no CSV export collected, so no presets yet; the kept 730-day history is imported in M1 (G13) |
| TXN-24 | Unchanged: original amount and rate only in the description, so only the PLN amount is shown |

## 10. Open questions

| Question | Conservative assumption used |
|---|---|
| Does Erste have a short extended-history window, or does "longest" always return 2 years? One "longest" fetch a day or more after approval would answer it | The link uses up the window (G13 default) |
| Does Erste hold more than the 730 days Enable Banking asked for? | 730 days |
| Why did Alior's authorised consent return no accounts? | Alior is on CSV until a connection returns accounts |
| How do Erste's identifiers, amounts and descriptions behave over days, and across a month-end? | G7 default |
| Unattended limits, revocation, re-consent | G9 and G10 defaults |
| Only one member has a registration, so joint accounts can't be compared. Is [ACCT_C] a joint account? It's used by two cards but returns one holder | Manual merge (G8 default) |
| Can the salary be recognised? No employer pays into these accounts | The payday is entered by hand in the budget wizard |
| Is the card's repayment date reported anywhere? Not in the account details or balances | "Card repayment date unknown" (J-05 3b) |

## 11. Data handling

- Anonymisation rules applied to every extract above, with a second read before commit: day 1, 2026-10-19 (this file was searched for the holder's and other people's names, street names, card digits, IBAN patterns, phone fragments and tax numbers, and none were found). Beyond the rules: store and terminal numbers, towns outside Warsaw and district names are redacted, because together they would show where the household lives.
- Raw history: kept complete on the developer's machine outside the repository, in `$SPIKE_DIR/raw` (location recorded in the developer's local env file). **Not encrypted yet**: on day 1 the developer chose to store it as plain JSON until their gpg key exists, which departs from Appendix B. Second copy on separate media: not made yet.
- Deletion: only by the user's recorded decision, once G13 is known and the history is in the app or judged not needed.
