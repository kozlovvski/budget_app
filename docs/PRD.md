# Household budget app — Product requirements

| | |
|---|---|
| **Status** | Draft for household review |
| **Date** | 16 October 2026 |
| **Bank data partner** | Enable Banking (restricted mode) |
| **Scope** | One private household; responsive web |

This document says **what** the app must do and why. It names no technology; that comes in the technical design. It is the source of truth for the GitHub Project (section 11): issues mirror requirements, never the other way round.

**How to read it**
- **IDs:** `AREA-NN` for requirements, `J-NN` for journeys, `MET-NN` for metrics, `RISK-NN` for risks. IDs are never reused.
- **Priority (MoSCoW):** Must = v1 is not done without it. Should = important, may slip. Could = only if cheap.
- **Milestones:** M0 Research → M1 Sign-in & bank data → M2 Categorise & budget → M3 Plan ahead → Later (section 7).
- ***Depends on: SPIKE-01*** marks anything that rests on unverified assumptions about the data Enable Banking returns. The spike (Appendix B) confirms or rewrites it before it is built.
- Quoted text in "quotes" is the exact wording the app shows.

## Contents
- [1. Overview & vision](#1-overview--vision)
- [2. Personas](#2-personas)
- [3. Key user journeys](#3-key-user-journeys)
- [4. Functional requirements](#4-functional-requirements)
- [5. Non-functional requirements (NFR)](#5-non-functional-requirements-nfr)
- [6. Success metrics](#6-success-metrics)
- [7. Milestones](#7-milestones)
- [8. Out of scope](#8-out-of-scope)
- [9. Risks & dependencies](#9-risks--dependencies)
- [10. Open questions](#10-open-questions)
- [11. GitHub Project mapping](#11-github-project-mapping)
- [12. Appendix](#12-appendix)

## 1. Overview & vision

### 1.1 Problem
The household keeps money in several EU banks: each member's current account and card, a joint account, savings, maybe a loan or mortgage. Answering the questions that come up every week ("how much can we still spend this month?", "is the car insurance covered?", "will we be short before payday?") today means logging into several bank apps or keeping a spreadsheet up to date. The points below come from the household's own experience. They are assumptions, not research findings (see Open questions):
- Nobody has the whole picture. One member keeps the spreadsheet and carries the mental load. The other has to ask.
- Irregular costs (annual insurance, car service, holidays, gifts) arrive as surprises because nothing sets money aside for them each month.
- Subscriptions and price rises pile up unnoticed.
- Upkeep kills the habit: categorising the same merchants again, reconciling, and bank syncs that break without anyone noticing.
- A number that looks current but isn't is worse than no number. A budget built on a sync that stopped two weeks ago misleads both members. So does one built on a sync that "worked" but missed something: a reissued card that arrived as a new account, or card spending the bank reports days later.

### 1.2 Vision
**One number the whole household trusts (how much we can still spend this period), kept true in about ten minutes a week.**

Every account the household has is in one place: banks that sync, banks whose files a member imports, and cash, property or loans tracked by hand. Each account says how current and complete it is. The transactions are categorised with little effort, and every member sees all of it. The app plans with flex budgeting, so day to day only one number needs watching ([Monarch: "one high-level number to track"](https://www.monarch.com/blog/flex-budgeting-simplify-your-spending-with-just-one-number)). It puts money aside for irregular costs, knows the bills, projects the balance forward, tracks net worth, and always shows how fresh each number is and what it may be missing. Every member sees the same thing.

### 1.3 Goals
| ID | Goal | Measured by |
|---|---|---|
| G1 | Answer "how much can we still spend this period?" with one number that both members trust: flexible left to spend. | MET-05, MET-08, MET-10 |
| G2 | Keep upkeep low: a weekly review of 10 minutes or less for the member doing it. Beyond a one-off bank setup and renewing their own bank consents, no member *has* to do any bookkeeping. **Stated exception:** a member whose bank can't be connected (the CSV fallback) must export a file from that bank and import it once per budget period, after that period's settling window ends, so that the files together cover the whole period. Only they have the bank login. | MET-01, MET-02, MET-05 |
| G3 | No surprises: non-monthly costs are set aside in advance, bills are known before they're due, and a low balance shows up before it happens. | MET-10. The low-balance warning itself is an acceptance criterion (FC-06), not a metric (MET-11 removed). |
| G4 | Freshness and completeness are always visible. No derived number is shown as current or complete when the data behind it isn't. | MET-06 for whether data arrives in time; visibility itself is acceptance criteria (BANK-09, INS-01) |
| G5 | Equal visibility: every member uses the same numbers to make day-to-day decisions. | Not measured, by design: no metric tracks individual members (6.1). Ensured by the fully shared household (HH-01). |
| G6 | Gaps are visible, never hidden. For every account, the app shows how much history it has and what's missing, and offers a way to fill the gap. Manual assets are included in net worth. | Acceptance criteria (BANK-05, ACC-13), not a metric |
| G7 | Look back and see the trend: where the money went (reports, Sankey), how net worth changes over time, and the year in review. | Not measured. Served by INS and NW. |

### 1.4 Non-goals
Section 8 has the detailed out-of-scope list. These non-goals shape the product:
- **Not a public product.** No billing, marketing, public sign-up, multiple households or multi-tenancy.
- **No privacy between members.** Fully shared: every member sees every account and transaction. "Filter by member" is for reports only. No private accounts per member.
- **No notifications of any kind.** No email alerts, push, digests or calendar reminders. Email is used only for invites and sign-in links. The app has to be worth opening (see 3.1).
- **No tracking of individual members.** The app never counts how often a member opens it or what they do there. Records of who did something (who settled a period, who edited a transaction, who holds a connection) are kept for coordination only, never as a statistic. Who did the weekly review, and how long it took, isn't recorded at all.
- **No per-member budgets, allowances or settling up.** There is one shared budget. The app doesn't give each member their own spending pot and doesn't work out who owes whom. A household can still create a flexible category for a person (e.g. "Ola's fun money") as an ordinary category. To be confirmed (Open questions).
- **No native app, PWA or offline mode.** Responsive web only, from 360 px wide.
- **No moving money.** No payment initiation, transfers or bill pay.
- **No envelope or zero-based budgeting.** The household does not "give every euro a job" (YNAB's model). Flex budgeting is the model.
- **No savings goals in v1** (Later). Sinking funds for non-monthly costs are part of the budget and are not goals.
- **No investment holdings or performance tracking, receipts, AI Q&A** (Later). Investment accounts appear in net worth as balances or manual values only.
- **No financial, tax or legal advice**, and no bookkeeping for a business or self-employment.
- **No promise of real-time or complete data.** Freshness and known gaps are reported, not promised away.

### 1.5 Guiding principles
Every area applies these when a trade-off comes up.
1. **Low weekly effort. The app does the work, people confirm it.** Anything automatic (categories, transfers, recurring items, possible duplicates) arrives as a suggestion in one queue. Nothing blocks the dashboard. One decision should resolve many items (grouping, "create a rule?"). The effort budget is 10 minutes a week (MET-02, a manual check).
2. **Trustworthy numbers, freshness always visible.** Every derived number (left to spend, forecast, net worth, reports) shows when its data was last updated. It carries a stale-data warning when a connection behind it is stale, broken or expired, and an incomplete marker when something known is missing. A consent that is about to expire doesn't make a number stale. It's shown as a one-line note. "Synced 08:10" means the last sync succeeded at 08:10. It doesn't mean every payment up to 08:10 is in: card spending can post days later (settling window), and a sync can't see an account the bank has stopped or not yet started listing (J-11). Likewise, "Data up to 14 Oct" says data has arrived up to that day, not that every payment from that day is in. The app shows uncertainty (pending, estimated, possible duplicate, reconciliation gap) instead of guessing silently. A total that includes uncertain items says so: "Includes 3 uncertain items (€86) — may be off". It never silently drops a real transaction or overwrites a member's edit.
3. **Pull, not push.** The app sends nothing. Everything that needs a person waits on the dashboard and names who needs to act. The phone glance ("can we afford this?") is the habit everything else hangs on.
4. **Household-shared.** One budget, one left to spend, one set of numbers. Attribution ("connected by", "settled by", account holder) is for coordination, never for blame. Copy never compares members.
5. **Private to the household.** Only household members see the data. There are no third-party analytics and no tracking of individual members. The few metrics (section 6) are computed from records the app keeps anyway. Full export and delete-all are always available.
6. **Honest about unknowns.** Anything that depends on bank data quality (SPIKE-01) falls back to manual entry or CSV import, never to a blank or invented value.
7. **Phone for glancing and quick fixes, desktop for setup and month close.** Every journey can be completed at 360 px. Setup and month close are designed for a larger screen first. Lunch Money's case for web-first is that "budgeting requires intentionality" ([Lunch Money](https://lunchmoney.app/features/web-first)).

### 1.6 Core concepts in the user's words
Proposed wording for BUD, FC and INS to reuse in onboarding and help text. Members never see the internal term "flex type".
- **Your plan.** "Money comes in. Bills that are the same every month go out. A bit is put aside for the once-a-year costs, and savings come off the top. What's left is yours to spend, and that's the only number you need to watch." This follows Monarch's formula: income − fixed − non-monthly − savings = flex number ([Monarch](https://www.monarch.com/blog/flex-budgeting-simplify-your-spending-with-just-one-number)).
- **Left to spend.** "How much of this period's spending money is left: groceries, eating out, shopping, fun. Bills and money set aside aren't in it."
- **Set aside (sinking funds).** "Car insurance is €1,200 once a year, so €100 a month is set aside. When the bill comes, it's paid from what's been set aside and doesn't eat this month's spending money." This is YNAB's "true expenses" idea.
- **Forecast.** "Day by day, what your account balances will look like over the next weeks if bills and income arrive as usual and you spend like you normally do."
- **Freshness.** "Synced 08:10 today. Card payments from the last few days may still appear." Or: "⚠ Ola's bank hasn't updated since Monday. Numbers may be missing recent spending."
- **Settled.** "September is settled: the bank has stopped sending changes for it. If anything changes later, the recap shows exactly what."
- **Provisional.** "September is still settling: card payments from its last days may still arrive. Anything carried from it into October may change until it settles."

---

## 2. Personas

The personas describe behaviour, not permissions. "Owner" and "Member" are roles (HH-02). Either persona can hold either role, and HH allows several Owners. The details below are assumptions about one household. Nobody has checked them with the partner yet (Open questions), and the frequencies are estimates to revisit after M2. The payday anchor follows a product precedent: Emma offers payday-based budget periods because "people tend to think in payday cycles" ([Emma](https://emma-app.com/blog/payday-sync-budgets-track-salary)). That is Emma's claim, not evidence about this household.

### 2.1 Household lead: the one who sets it up
**Who.** The member who wants the system to exist. Comfortable with spreadsheets. Today they do the household's money admin by hand. Usually the first user and an Owner. Usually also the operator, i.e. the person who installs and hosts the app, which happens outside the app.

**Goals**
- One number they trust enough to stop opening the bank apps.
- Irregular costs covered before they arrive. Bills and subscriptions known.
- Net worth trend over time, including the flat, car and loans.
- Low upkeep: 10 minutes or less a week, one sitting at month end.
- The partner uses the same numbers without being chased.

**Frustrations**
- Categorising the same merchant again every month.
- Bank apps that don't add up to the spreadsheet. Spreadsheets that are always behind.
- Syncs that break without anyone noticing (the reason they distrust other apps).
- Being "the household accountant" whom the partner has to ask.

**Frequency** (estimates)
- Setup: once. About 1–2 hours of active work. While the app runs in restricted mode, the order is fixed: first add their own Enable Banking registration to the app, then one bank at a time link it in Enable Banking, connect it in the app and let its first import run, in the same sitting, before starting the next bank. Setup can stop between banks and resume later from "Continue setup". It must not stop between linking a bank and connecting it. Then come review and the budget wizard. · Depends on: SPIKE-01 (how long linking takes per bank)
- Weekly review: once a week, 10 minutes or less (J-03).
- Month close: once per budget period, 30 minutes or less (J-04).
- Glances: several times a week (J-05).
- Re-consent of their own connections: every ≤180 days per bank (J-06).

**Phone vs desktop**
| Phone | Desktop |
|---|---|
| Left to spend and pace before buying something | Onboarding: Enable Banking registration, bank connections with the one-shot import |
| Checking one transaction ("was that charged twice?") | Bulk review, rules, category setup |
| Quick categorising in the review inbox | Budget wizard, month close, reports |
| Re-consent: SCA usually happens in the bank's mobile app anyway | CSV backfill, export, member management |

**Success looks like:** "I don't open the bank apps any more, and I don't keep a spreadsheet."

### 2.2 Partner
**Who.** The other adult. Finances are fully shared. They care about the outcome (can we afford it, are bills covered), not the process. They may hold the Owner role too. Other members (an adult child, a relative) behave like a lighter version of this persona.

**Goals**
- Answer "can we afford this?" in one glance on the phone, without asking the household lead.
- See exactly the numbers the household lead sees, with no information gap.
- Bring in their own bank accounts once, then do no bookkeeping. The exception is a bank that can only come in by CSV: then they import a file from it once per period, after the period's settling window ends, so that their files together cover the whole period (G2).
- Know that bills and yearly costs are covered.

**Frustrations**
- Being asked to explain every transaction they made.
- Another password to remember for something they use occasionally. Hence email sign-in (AUTH-16).
- Having to create their own Enable Banking registration just so the app can see their accounts. It's a one-off, but it's real work, and the household lead can't do it for them.
- Feeling watched or judged. Per-member reports can read as surveillance. Hence principle 4 and the "no tracking of individual members" non-goal.
- Jargon ("non-monthly sinking fund", "flex type").
- Numbers that differ from their bank app with no explanation.

**Frequency** (estimates, not measured; the app doesn't count anyone's visits)
- Glances: 2–5 times a week on the phone (J-05).
- Setup, once (J-02): create their own Enable Banking registration, add it to the app, then link, connect and import one bank at a time, in the same order as the household lead. Nobody else can do this for them. The estimate (an assumption, not measured): 30–45 minutes for one or two banks, of which creating the registration is the unfamiliar part. Probably one sitting at a desktop, possibly two. The fallback is CSV-only for their accounts, with a recurring import (below). **In this household neither is needed:** the household lead's logins reach every account (§10 question 7).
- CSV fallback only: export and import a file from each such bank once per period, after its settling window ends (about 5 days after the period ends), so that their files together cover the whole period up to that day. While a period waits for it, the account shows "Waiting for <account> data up to <date>" (INS-23).
- Weekly review: occasionally joins or does it. Answers "what was this?" questions about their own transactions.
- Recap: reads it once a period if it's put in front of them (the dashboard's Last period widget, INS-06).
- Re-consent of *their own* connections: every ≤180 days. **Nobody else can do this for them**, because SCA needs their bank login. It's the one recurring chore the product can't remove, and with no notifications it depends on the other member seeing the flag and telling them (J-06).

**Phone vs desktop**
| Phone | Desktop |
|---|---|
| Nearly everything: left to spend, recent transactions, recap, review inbox items about their own spending, re-consent | Rarely. Probably their Enable Banking registration and first bank connections (J-02) |

**Success looks like:** "I check the app instead of asking."

**Design consequences**
- The household lead's setup never waits for the partner. The app works with whatever is connected and says what's missing (J-01 9d). The one step that can't be delegated is the partner bringing in their own accounts, through their own Enable Banking registration or by CSV. The app shows that step as theirs, with their name, and shows each member's setup progress (registration added · banks connected; BANK-16) with "Continue setup". The household lead may explain, never act for them.
- Nothing the partner wants to do day to day waits for an Owner. Owner-only are household settings (budget period, review day, staleness thresholds), deleting or restoring data, and managing members (HH-02). Editing the budget isn't limited by role.
- Plain-language copy (1.6). Reports never rank or compare members.
- Anything only this member can do (their Enable Banking setup, re-consent) is labelled with their name, so the other member can remind them in person.

---

## 3. Key user journeys

### 3.1 The return loop: why people come back without notifications
Notifications are out, and so are calendar reminders. Monarch's weekly recap shows on the dashboard *and* goes out by email ([Monarch release notes, Dec 2025](https://releasebot.io/updates/monarch)). We keep only the dashboard half. Pull-only is a bet: it avoids notification fatigue, but it works only if each visit pays off. The loop:

1. **Cues** (things the app can count on without sending anything)
   - **The purchase moment.** "Can we afford this?" is the cue we expect to bring members to the dashboard most often (J-05). Every other piece of work is reachable from that screen.
   - **The household's review day.** Set in SET-05 (default Sunday) and agreed between the members as their own routine. The cue is theirs. In the app, from that day the dashboard shows "Weekly review due" until a member taps "Mark week reviewed" (INS-24).
   - **Period end.** Payday or month end is a natural money moment. The dashboard's Last period widget shows "<period>: Provisional" with what it's waiting for, and later "<period> settled" (INS-06, INS-23).
2. **Routine.** A weekly review with a fixed set of steps and a visible end (J-03). The cue shows the item count and when the week was last reviewed ("12 items · last reviewed Sun 6 Oct"). It doesn't say who reviewed.
3. **Reward.** Certainty, not gamification. Marking the week reviewed shows a short closing summary: what was cleared from the inbox, left to spend, and anything Provisional or stale. For example: "31 of 38 items cleared · left to spend €412 for 9 days, on pace · September still Provisional: waiting for Ola's mBank". There's no streak that resets and no red failure state.
4. **Investment.** Each correction can become a rule ("create a rule?"), so next week's inbox is shorter. Effort should fall over time. The inbox count at the start of each review, which the app keeps, shows whether it does (MET-02). YNAB recommends tying the check to an existing routine ([YNAB](https://www.ynab.com/five-minute-budget-routine/)). Copilot's "To Review" queue starts suggesting categories after 30 reviews ([Copilot](https://help.copilot.money/en/articles/11157550-quick-start-guide)), so the payoff of reviewing is visible.

Rules for the loop (inputs to INS, CAT, BANK and BUD):
- **One place for attention.** Everything waiting for a person is on the dashboard (in M1, before the dashboard exists, on the Connections page). That covers the review count, connections that stopped working, CSV-fed accounts showing "Import due", account decisions waiting ("Waiting for a decision on <account>", J-11), each naming *who* must act, plus possible duplicates, sinking-fund shortfalls and flagged price changes. An expiring consent is only the one-line header note and a line on the connection screens. It never becomes an attention row.
- **Skipping is cheap.** Missed weeks merge into one catch-up review with bulk accept. A backlog never hides left to spend. Abandonment after a few missed weeks is the failure mode we're designing against.
- **Responsibility is visible.** Actions only one member can do name that member.
- **Questions between members stay in the app.** "Ask <member>" on a transaction shows on that member's dashboard the next time they open it. Not yet in any area: an open question (section 10).

### 3.2 Journey index
| ID | Journey | Persona(s) | Areas | Milestone |
|---|---|---|---|---|
| J-01 | Household onboarding | Household lead | AUTH, HH, SET, BANK, ACC, TXN, CAT, REC, BUD, INS | M1 (steps 1–6), M2 (7–10) |
| J-02 | Partner joins and connects their banks | Partner | AUTH, HH, SET, BANK, ACC, TXN, BUD, INS | M1 |
| J-03 | Weekly review | Household lead or partner | SET, BANK, ACC, TXN, CAT, REC, BUD, FC, INS | M2 (FC step M3) |
| J-04 | Month close (settling a period) | Any member | BANK, TXN, ACC, CAT, REC, BUD, NW, INS | M2 (minimal close); full recap and NW M3 |
| J-05 | "Can we afford this?" | Partner, household lead | AUTH, BUD, FC, INS, BANK | M2 (forecast M3) |
| J-06 | Consent renewal | Connection's holder, any member | BANK, AUTH, INS, TXN, ACC | M1 |
| J-07 | Early revocation discovered | Any member | BANK, ACC, TXN, BUD, FC, NW, INS | M1 |
| J-08 | Joint account connected by both partners | Partner, household lead | BANK, ACC, HH, TXN, BUD, FC, NW | M1 · Depends on SPIKE-01 |
| J-09 | A member leaves the household | An Owner, leaving member | HH, AUTH, SET, BANK, ACC, TXN, BUD, REC, FC, NW | M1 (erasure and re-plan M2/M3) |
| J-10 | Lost 2FA device | Any member with 2FA on | AUTH, HH | M1 |
| J-11 | Something's missing although the sync worked | Any member (notices, decides), connection holder (renews) | BANK, ACC, TXN, INS, BUD | M1 (markers M2) · Depends on SPIKE-01 |

Notation: numbered steps are the main path. Branches are numbered after the step they leave from (4a, 4b…). "The member who holds the connection" means the member who completed SCA for it. A member's "Enable Banking registration" is their own Enable Banking Control Panel account, where they link their own bank accounts before the app can see them. It's needed only while the app runs in Enable Banking's restricted mode. "Owner" always means the role (HH-02). In M1 the app opens on the Connections page. From M2 it opens on the dashboard, which carries the same attention items.

---

#### J-01 Household onboarding
**Persona:** household lead (holds the Owner role) · **Trigger:** the first user opens the app (how the first user is admitted is AUTH/HH) · **Done when:** a budget is accepted and the dashboard shows left to spend for the current period (9e).

1. The household lead enters their email and confirms it with the sign-in code sent there. They can turn on 2FA now or later. *(AUTH-01, AUTH-16, AUTH-04)*
2. They create the household: name, base currency and time zone. *(HH, SET-02, SET-12)*
3. The app explains the setup order: add your own Enable Banking registration to the app → then one bank at a time: link it in Enable Banking, connect it in the app straight away, and let its first import finish → review → recurring items → budget. It says that each member brings in their own accounts this way and nobody can do it for someone else. It warns in plain words: "Connect each bank in the app right after you link it, in the same sitting. Don't link all your banks first and connect them later. Your bank may release older history only for a short time after you link it." Until SPIKE-01 shows otherwise, the app assumes that window is about an hour. The household lead can invite members now or later. *(HH, BANK-16)* · Depends on: SPIKE-01 (which bank sign-in opens the extended-history window, and for how long)
4. They connect their banks. While in restricted mode this has three parts:
   - **Once, first:** outside the app, they create their own Enable Banking registration. In the app, they add it to the app, which requires re-authentication. What exactly is copied from Enable Banking into the app is set by BANK-16. *(BANK-16, AUTH-10)* · Depends on: SPIKE-01
   - **Per bank, in one sitting:** outside the app, they link the bank's accounts in their registration by signing in at the bank (SCA). Straight away, in the app, they pick the bank, complete SCA at the bank again and choose accounts. For each account they set the account holder (a member or Joint) and confirm the account type. *(BANK-01, BANK-16, ACC, HH)*
   - **Progress:** the Connections page shows their setup progress, e.g. "Registration added · 1 bank connected", with "Continue setup". It shows only what the app can see: a bank linked in Enable Banking but not yet connected doesn't appear. *(BANK-16)*
5. The one-shot full-history import runs. They may leave the page, but they start the next bank only once this import has finished. When it finishes, each account shows the date range received, transaction count, current balance, and any reconciliation gap between the bank balance and the transactions. *(BANK, ACC, TXN)*
6. They repeat steps 4–5 for each bank login they hold (link, connect, import, then the next bank), and optionally add manual accounts (cash, property, vehicle, loan). *(BANK, ACC)* M1 ends here: transactions are visible and searchable, and the app opens on the Connections page.
7. **Review.** The app auto-categorises and detects internal transfers. The review inbox shows the rest grouped by merchant/description, so one decision covers many. Each manual fix offers "create a rule?". The household lead checks the flex type of the default categories and may stop at any point. The app shows how much of the last 12 months is categorised; 100% isn't required. *(CAT, TXN)*
8. **Recurring items.** The app proposes detected salaries, bills and subscriptions with amount and cadence. The household lead confirms or rejects each. *(REC)*
9. **Budget wizard.** An Owner picks the budget period: calendar month or a payday anchor (BUD-10). If REC found the salary, its usual day is suggested (REC-08). A weekday pattern such as "second Thursday" becomes the earliest day it can fall on. If REC didn't find it (no pay arrives straight from an employer, as SPIKE-01 saw at Erste, or descriptions are too poor to recognise one), the Owner enters the payday by hand. For each income item the wizard asks "Does this pay fund the next period?" If yes, its most recent payment before the first period starts funds the first period. Recurring items confirmed here start at the first period's start, so payments already made in it link to them. The app proposes expected income (confirmed recurring income), fixed (confirmed bills), non-monthly set-asides (annual items seen in history, ÷12, as sinking funds) and planned savings. It shows the resulting left to spend next to the household's historical average flexible spending. The household lead edits and accepts. *(BUD-13, REC, SET)* · Depends on: SPIKE-01 (salary detection from descriptions)
10. The dashboard shows left to spend with freshness and the review count (INS-06). Consents that are about to expire show in the header note, not on the dashboard. The app asks the household to confirm the weekly review day (SET-05, default Sunday) and suggests inviting the partner if that hasn't happened yet. *(INS, SET-05, HH)*

**Branches**
- 3a. The household lead invites now, but the email doesn't arrive or the link expires. They resend from Members. Setup continues without waiting. *(HH)*
- 4a. **Bank not offered by Enable Banking, or it can't be linked.** The household lead adds a manual account and imports the bank's CSV export. This is the stated CSV fallback (J-02 5a). The account is labelled "not synced" and shows "Data up to" the end of the last import. A stretch of a period that no file covers shows as "Missing data for <account> <date range>" and keeps that period from settling on its own. Once that date is older than SET's threshold for imported data (default 7 days), every member sees "Import due for <account>" on it, naming the holder. *(ACC-13, TXN-21, SET-06)*
- 4b. SCA cancelled, failed or timed out. No connection and no partial data are left behind. The household lead returns to the bank picker with the reason, when known. *(BANK)*
- 4c. An account is already connected by another member (a joint account). → J-08.
- 4d. **The partner's personal account.** The household lead can connect only accounts linked in their own Enable Banking registration, and Enable Banking's terms don't allow linking someone else's account. The app explains that the partner brings in their own accounts (J-02) and offers to invite them. *(BANK-16, HH)*
- 4e. **Linked but not connected.** The household lead links a bank in Enable Banking, then stops before connecting it in the app. The app can't see the link itself, so it can't name that bank. "Continue setup" repeats the warning from step 3 and asks them to connect any bank they've linked straight away. If the window has already closed, it ends as in 5d. *(BANK-16)* · Depends on: SPIKE-01 (how long the window lasts)
- 5a. **Short history.** The bank returns less than 12 months. The result says so per account ("We received 89 days, from 16 Jul. Your bank may not offer more.") and offers CSV backfill from the bank's export for the missing range. Where the file and the bank data overlap, a transaction in both shows as one flagged pair ("possible duplicate"). Both count until a member resolves the pair, and nothing is dropped silently. It's matched without a flag only when the file carries the bank's identifier (TXN-10, TXN-21). ≤90 days with no extended window is a SPIKE-01 decision gate (CSV backfill becomes Must in M1). *(BANK, TXN)* · Depends on: SPIKE-01
- 5b. **Import fails or is partial** (bank error, timeout, rate limit). The account shows "Incomplete: history received back to 3 Mar 2025". The app retries while the extended-history window is open and shows when that window closes, if known. The household lead can retry by hand. If the window closes first, the app lists the missing range and offers CSV backfill. The budget wizard marks accounts with incomplete history and does not present their averages as complete. *(BANK, TXN, BUD)* · Depends on: SPIKE-01
- 5c. Bank balance ≠ balance derived from the transactions. The gap is shown on the account (ACC-12) and doesn't block onboarding.
- 5d. **The extended-history window was already used.** The bank was signed into earlier (an earlier try, or a link made long before the connect, 4e), and now returns only recent history. SPIKE-01 never deliberately delays connecting a real account, so this should happen only by accident. If SPIKE-01 kept the full history it fetched, the household lead imports it as a file, like a CSV backfill (BANK-05). Otherwise it ends as in 5a: the range received is shown and CSV backfill is offered. *(BANK, TXN)* · Depends on: SPIKE-01
- 6a. **Setup paused between banks.** The household lead stops after two of four banks. Nothing is lost. The Connections page shows the progress and "Continue setup", and the household runs on Partial (9d) until the rest is in. Stopping between banks is fine. Stopping between linking a bank and connecting it is not (4e). *(BANK-16)*
- 7a. Descriptions are poor (SPIKE-01 gate). Fewer automatic categories, more grouped review. Uncategorised transactions stay visibly "Uncategorised" and are never silently put in a bucket. They count as flexible spending until categorised (BUD). *(CAT, BUD)*
- 8a. Too little history to detect recurring items. The wizard asks the household lead to add known bills and income by hand as manual recurring items. *(REC)*
- 9a. **Short history** (fewer than 3 full periods of data). The wizard suggests only what the history supports: averages labelled "low confidence", "estimate from N days", or manual entry only under 14 days. It asks for a checklist of irregular costs (insurance, car, holidays, gifts, taxes) with annual amounts. With under 90 days it first suggests importing older history by CSV. The plan is labelled "Draft", and on day 1 of each period the app offers "Update plan from N periods of data?" until 3 full periods exist. *(BUD-13)*
- 9b. **Irregular income** (freelance, bonuses). Irregular income categories default to 0 expected. A household that lives on irregular income sets a base expected income instead (BUD-04, BUD-13).
- 9c. The household lead leaves mid-wizard. Progress is kept. The dashboard shows "Finish budget setup" where left to spend would be, never a placeholder number. *(BUD, INS)*
- 9d. **Another member has no accounts in the budget yet** (or hasn't added their Enable Banking registration). The budget says so ("Tomek has no accounts in the budget", BUD-17) until that member connects their accounts or adds them by CSV, so their missing spending isn't mistaken for no spending. Their setup progress shows on the Connections page. *(BUD-17, BANK-16)*
- 9e. **Budget accepted mid-period** (e.g. on the 18th of a calendar-month period). The plan covers the whole current period, including the spending since the 1st (BUD-13). With fewer than 7 days left, the wizard offers to start from the next period instead. This first period doesn't count in the learning periods or in MET-10 (6.1). *(BUD-13)*

#### J-02 Partner joins and connects their banks
**In this household** the household lead's logins reach every account (§10 question 7), so the partner signs in and deliberately skips the bank steps. The bank steps stay in the PRD for a member who later brings an account only they hold.

**Persona:** partner · **Trigger:** the partner opens the invite link from the email · **Done when:** the partner is signed in, and their accounts are connected, on the CSV fallback with its import cadence stated, or deliberately skipped, and are part of the budget.

1. The invite page shows the household name and who invited them. *(HH)*
2. The invite link signs the partner in. They enter a display name and can turn on 2FA now or later. *(AUTH-02, AUTH-04)*
3. Before seeing any data, they see and acknowledge: "Everything in <household> is shared with every member: all accounts and all transactions, including the ones you connect. 'Filter by member' is for reports only." *(HH-01)*
4. They land on the same page as the household lead: the Connections page in M1, the dashboard from M2.
5. They bring in their own banks in the same order as the household lead, with a short how-to, because they may never have heard of Enable Banking:
   - **Their own Enable Banking registration.** Outside the app, they create their own registration. Then they add it to the app, which requires re-authentication (BANK-16). The household lead can explain it but can't do it for them.
   - **Then one bank at a time, in one sitting:** link it in their registration (SCA at the bank), connect it in the app straight away (SCA again), choose accounts and set each account's holder, and let the first import finish before the next bank. The history warning from J-01 step 3 applies to them too. *(BANK-01, BANK-16, ACC)*
   - **Progress** shows on the Connections page for every member: "Tomek: registration added · 1 bank connected".
   · Depends on: SPIKE-01, only if a second registration is ever added (§10 questions 7 and 8)
6. If a budget already exists, the app proposes updating it with the partner's newly detected income and bills: "Update budget with Tomek's accounts?" Any member can accept it, because editing the budget isn't limited by role. MET-10 doesn't count this period (6.1). *(BUD, REC)*
7. Optionally the partner answers review inbox items on their own transactions. *(CAT)*

**Branches**
- 1a. Link expired or already used. The page says so and asks them to get a new invite from an Owner. *(HH, AUTH)*
- 5a. **CSV fallback, a stated degraded mode.** The partner doesn't want a separate registration, or a bank won't link. Their accounts are manual and fed by CSV files that only they can export, because only they have the bank login. Before they choose it, the app says what it means: "You'll need to import a file from <bank> once per budget period, after its settling window ends (about 5 days after the period ends). Together your files must cover the whole period, up to that day. Until they do, that period can't settle on its own." Each such account shows "Data up to <date>". A stretch that no file covers shows as "Missing data for <account> <date range>" and also blocks settling. When that date is older than SET's threshold for imported data (default 7 days), every member sees "Import due for <account>" on it, naming Tomek as the one who can import (SET-06). The threshold is a trade-off: at the 7-day default, a member who imports once per period sees "Import due" about three weeks in four; at 35 days the cue rarely shows, but spending not yet imported is missing from left to spend for weeks with no stale warning. A commercial agreement with Enable Banking is out of scope for a private household. *(BANK-16, ACC-13, TXN-21, SET-06)* · Depends on: SPIKE-01
- 5b. The joint account is already connected by the household lead. → J-08.
- 5c. The partner doesn't connect now. The household works with what is in the budget, the coverage note from J-01 9d stays, and the partner's setup shows "Not started" with "Continue setup".
- 5d. **Linked-account limit reached.** Enable Banking's terms say the number of linked accounts per application "may be limited". If the limit is hit, the app says which accounts are connected and that no more can be added. The rest can be added by CSV (5a). *(BANK)* · Depends on: SPIKE-01 (the actual limit)
- 5e. **Stuck halfway.** The partner created a registration but never added it, or linked one bank and stopped. The Connections page shows where they are ("Tomek: registration added · no banks connected"), with "Continue setup" for Tomek only. Other members see "Only Tomek can finish this" and can remind them in person. The household lead can explain the steps but not act for them. A bank linked but not connected may lose its older history (J-01 4e, 5d). *(BANK-16)*
- 5f. **A CSV import is late.** A period's settling window has ended and Tomek hasn't imported a file that reaches its last day. An import made before the window ended doesn't count. "Waiting for <account> data up to <date>" (or, for a stretch no file covers, "Missing data for <account> <date range>") shows on the account, left to spend carries the stale warning naming it, and the period stays Provisional, waiting for that account's data. Nothing is sent. Another member reminds Tomek in person, or uses "Settle now", which names what is missing (J-04 2a). *(SET-06, BUD-17, INS-23)*
- 6a. The budget update is declined. The budget stays as it is. Their accounts' spending still counts against left to spend (fully shared), per BUD.

#### J-03 Weekly review
**Persona:** usually the household lead; any member can · **Trigger:** from the household's review day (SET-05, default Sunday) the dashboard shows "Weekly review due · N items · last reviewed <date>" until a member marks the week reviewed (INS-24). A member can also start at any time from the To review widget. Nothing is sent. · **Done when:** a member taps "Mark week reviewed". Unresolved items may stay in the inbox and carry over.

1. A member starts from the cue or from To review. *(INS-06, INS-24)*
2. **Freshness.** Before the inbox, the member looks at the attention rows at the top of the dashboard: connections that are stale or broken, CSV-fed accounts showing "Import due", and account decisions waiting (J-11). Each row names the member who must act. If that's the current member, they fix it inline (re-consent, J-06, or import a file). Otherwise they see "Only Ola can renew this", and the review continues. Expiring consents aren't part of the review. They stay in the header note and on the connection screens, and numbers aren't marked stale because of them. Stale accounts stay labelled through the remaining steps. *(INS-06, BANK, ACC)*
3. **Transactions.** The review inbox: new, uncategorised, low-confidence, possible duplicates, possible internal transfers, refunds, recurring payments that might belong to a bill but didn't link ("Recurring: possible match"), and bills still open after their window ("Recurring: still unpaid?"). They're grouped by merchant with bulk confirm, and each manual fix offers a rule. *(TXN, CAT-12, CAT-13, REC)*
4. **Bills.** Bills due in the next 14 days, newly detected recurring items to confirm, and price changes. In M2 each bill shows only "seen this period" or "not seen yet", with "Mark paid elsewhere" and "Mark ended". "Overdue" and the other statuses come with REC in M3. A bill paid early counts in the period it's for if that period isn't Settled when the payment is linked. Settling later never moves it. *(REC, BUD)*
5. **Budget.** The period-to-date view: left to spend, pace, the last 7 days against a usual week, open items, and the previous period's state while it is still Provisional (INS-24). Sinking funds with any shortfall (BUD). Optionally adjust this period's plan. *(INS-24, BUD)*
6. **Cash.** Lowest projected balance in the forecast horizon, with its date and any low-balance flag. *(FC, M3)*
7. **Finish.** The member taps "Mark week reviewed" (INS-24). The app stores only that the week was reviewed on that date, and the number of inbox items open at the start and at the end. It doesn't store who reviewed or how long it took. The closing summary shows what was cleared from the inbox, left to spend, and anything Provisional or stale. It says what was checked, not that the data is complete: "Reviewed with data synced 08:10 today. Card payments from the last few days may still appear." *(INS-24)*

**Branches**
- 1a. **Nothing to review** (rules handled everything, connections fresh). Steps 2–6 collapse to one screen. Marking the week reviewed takes one tap.
- 1b. **Catch-up.** The week was last marked reviewed more than 13 days ago. One review covers all unreviewed weeks. Items dated in earlier periods are offered in bulk: "Accept all 47 suggested categories". The summary names the weeks covered. Reviewing week by week is never required.
- 2a. **A connection is stale, or a CSV-fed account shows "Import due", and the responsible member isn't present.** Steps 5–6 show the stale warning, and the summary says "Reviewed with incomplete data: <bank> last updated 4 days ago". The other member reminds them in person.
- 3a. A member doesn't recognise a transaction. They mark it "Ask Tomek". It stays unresolved and appears in that member's attention list on their dashboard. *(open question, section 10; until decided, members ask each other outside the app)*
- 3b. **Possible duplicate.** The member chooses "Same transaction", which merges the pair and keeps the bank version (restorable), or "Not a duplicate", which clears the flag for good (TXN-10). The app never removes one on its own. Until resolved, both count in totals, and each affected total says "Includes N uncertain items (<amount>) — may be off". *(TXN-10)*
- 5a. Over pace. The app shows how far over pace the household is and the daily amount available (BUD-15). A member can lower planned savings for this period with a plan edit (BUD-16).
- 7a. Two members review at the same time. An item resolved by one disappears for the other. Neither loses an edit (NFR). The week is marked reviewed once. A second tap changes nothing.
- 7b. Done on a phone. Every step and bulk action is available at 360 px.

#### J-04 Month close (settling a period)
**Persona:** any member · **Trigger:** a budget period has ended. The dashboard's Last period widget shows "<period>: Provisional" and what it's waiting for, e.g. "settling until 7 Oct" (INS-06, INS-23). Nothing is sent. · **Done when:** the period is **Settled**. Settling *is* the month close: BUD's close and the recap's Settle are one action. BUD owns what is snapshotted and carried over (BUD-19); INS shows it. Fixing the current period's plan (step 8) is recommended but isn't part of done. In M2 this is a minimal close inside the recap; the full recap comes in M3.

Steps 2–8 can happen in any order, before or after the period settles. Plan fixes made before it settles, or before its settling window ends if that is later, count as month-close fixes for MET-10, not as mid-period changes (6.1).
1. A member opens the recap of the period that just ended. It's Provisional and lists open items first. *(INS-23)*
2. **Completeness.** The recap shows the date the settling window ends ("Settling window ends 5 Nov"). The window is counted from the period end and never restarts. For each account counting in the budget, the recap shows whether its data reaches the end of that window: a successful sync after the window ended for a connected account, or "Data up to" on or after the window's end for a CSV-fed account. It also checks coverage, because freshness isn't coverage: an account can be up to date and still have a stretch of the period with no data, such as a range no CSV file covered or a connection that lapsed past what the bank returns. History that starts during the period isn't a gap ("History starts <date>"), and an account with an end date never blocks past its end date (INS-23). Until every account passes both checks, the period waits and says why: "Waiting for <account> to sync", "Waiting for <account> data up to <date>", "Missing data for <account> <date range>", "Waiting for <account> to be counted or confirmed" (cash that tracks freshness), or "Waiting for a decision on <account>". Every figure that covers a gap carries "Missing data for <account> <range> — may be off" (BUD-02). The member resolves what they can (sync now, re-consent, import a file for the missing range, decide an account) or waits. *(BANK, ACC-13, TXN, INS-23, BUD-02, BUD-19)*
3. **Review.** Clears review inbox items dated in the period, using the same flow as J-03 step 3. Open items don't stop the period from settling. They show as "Settled with N open items". *(CAT, TXN)*
4. **Integrity.** Unresolved possible duplicates in the period, which count in totals until resolved and show the uncertain-items footnote, and accounts with a reconciliation gap. A gap of 1 unit or more can't be dismissed or explained away. It stays until a fix (resolving duplicates, importing missing history) or a labelled balance adjustment closes it (ACC-12). Neither blocks settling. *(TXN, ACC-12)*
5. **Result.** Income vs expected, fixed vs expected, non-monthly set aside and spent (sinking-fund balances, shortfalls), flexible spent vs plan, net saved, savings rate and moved to savings, change vs previous periods. All of these follow BUD's counting rules. *(INS, BUD-19)*
6. **Rollover.** If rollover is on, the recap shows the flexible remainder or overspend carried into the current period. While this period is Provisional, the current period shows that amount as "Provisional — from <period>", and it may still change. When this period settles, the amount is fixed. Later changes appear as a late adjustment line. Sinking-fund balances carried over work the same way. *(BUD-07, BUD-09, BUD-19)*
7. **Manual values.** The app lists manual assets and liabilities whose value is older than NW's threshold. The member updates or confirms each one. *(NW, M3)*
8. **Plan for the current period.** The app proposes changes learned from the period (new subscription, price change, salary change, sinking fund running short). The member accepts or edits them. They change the plan of the current period, which is already running (BUD-16). *(BUD, REC)*
9. **Settle.** The period settles on its own as in step 2. Or a member presses "Settle now": the confirmation names what is missing, the recap records who settled and when, and it shows "Settled with N open items" if any remain. At settle, BUD snapshots the budget result (BUD-19). The period's plan has been read-only since the period ended (BUD-16). Settling can't be undone. *(BUD-19, INS-23)*

**Branches**
- 2a. **A connection is broken and its holder is away.** The period can't settle on its own while that account's data doesn't reach the end of the settling window. There's no new feature for this. The account stays honestly stale, and a member either waits or presses "Settle now". The recap records who settled and what was missing, e.g. "Settled by Anna on 12 Oct · mBank Joint had data up to 3 Oct · 4 open items" (INS-23). If the outage lasts, see J-07 4e.
- 2b. **Late transaction.** A transaction dated in the period books after it's Settled, or a refund arrives for a purchase in it. TXN's date rule and BUD's refund rule decide its period. The recap shows "Changed since settled: N changes" with the settled and current figures. Rollover that was already carried isn't rewritten. The difference appears as a "late adjustment" line in the current period. The next weekly review shows it too. *(TXN, BUD, INS)*
- 2c. **Bill paid early or late.** Rent for October paid on 28 Sep counts in October. A bill for October paid on 2 Nov counts in October if October isn't Settled when the payment is linked to the bill, and otherwise in November. Settling later never moves it. The transaction says "Counted in October (paid 2 Nov)", and a member can change it. *(REC, BUD)*
- 2d. **An account decision is pending.** A replaced card or a vanished account hasn't been decided, so the period shows "Waiting for a decision on <account>". Any member decides it (J-11 step 3) or uses "Settle now". An account whose end date is before the period end never blocks settling. *(ACC, BUD-19)*
- 5a. **Payday-anchored period.** Salary arrived early (weekend, holiday). Period boundaries follow BUD-11 and SET's holiday calendar. A salary that arrives in the last days before the next period starts gets BUD-11's prompt "Count this in the next period?". An income item marked as funding the next period is placed there from then on. The recap shows the actual date range. *(BUD-11, REC-08)*
- 8a. **Month close skipped entirely.** Nothing is blocked. The period settles on its own when the data allows. The new period runs with the copied plan and the default rollover (BUD-19), and net worth monthly snapshots are taken regardless (NW).

#### J-05 "Can we afford this?"
**Persona:** partner on a phone in a shop (expected to be the most common case), household lead · **Trigger:** about to make a purchase or take on a commitment · **Done when:** the member has the two answers, with their freshness.

1. The member opens the app on the phone. The first screen shows left to spend for this period with its freshness ("synced 08:10": the time of the last successful sync, not a promise that every payment up to then is in), days left and pace. If the number includes unresolved possible duplicates, it says so underneath: "Includes 2 uncertain items (€86) — may be off". *(INS, BUD)*
2. If the purchase fits comfortably, that's the answer.
3. If it's large, or it's a commitment (a new subscription), the member opens the "Can we afford this?" detail (INS-06). It shows two answers side by side (the second from M3):
   - **"Does it fit our plan?"** Left to spend, and how it would look after an amount of this size.
   - **"Will we have the cash?"** The lowest projected balance in the forecast horizon, and its date.
4. The detail explains the difference in one sentence each:
   > **Left to spend** tells you whether this fits this period's plan, after bills, money set aside for yearly costs, and savings.
   > **Forecast** tells you whether your accounts stay above zero, based on when money actually comes in and goes out.
   > They can disagree. Something can fit the plan but land before payday (the forecast warns). Or the cash can be there but already promised to yearly costs (left to spend warns).
5. The member decides.

**Branches**
- 1a. **Stale data.** The number is still shown, with "⚠ updated 3 days ago: Ola's bank stopped updating. Only Ola can reconnect." The member decides knowing the risk. A consent that's only about to expire doesn't trigger this. *(INS, BANK)*
- 1b. No budget yet. "Finish budget setup" instead of a number (J-01 9c).
- 1c. **A purchase made minutes ago isn't in the number yet.** Pending transactions do count, and the number says "incl. 3 pending" (BUD). A payment the bank hasn't reported at all isn't in it. The freshness label shows when the last sync was. *(BUD)*
- 1d. **Signed out.** The session has ended, so the member signs in at the till with a code from their email, plus 2FA if on, and lands back on left to spend (AUTH-07). How often this happens depends on "remember this device":
  - With it ticked on their own phone: a full sign-in at most once every 30 days, or after 7 days without use (AUTH-07). At the estimated 4 glances a week, that's about 1 glance in 17.
  - Without it: the session ends after 30 minutes without activity, so nearly every glance starts with a full sign-in.
  - J-05 therefore relies on members ticking "remember this device" on their own phone. Proposals to AUTH are in section 10. *(AUTH)*
- 1e. **Last period isn't settled yet.** In the first days of a period, the rollover carried from the previous period shows as "Provisional — from <period>" and may still change until that period settles. Left to spend says so in one line, so a member isn't surprised when it moves by a few euros. *(BUD-19, INS-06)*
- 3a. **The purchase is a non-monthly cost** (e.g. replacing the washing machine from "Home repairs"). The relevant answer is that sinking fund's balance. Paying from a sinking fund doesn't reduce left to spend. The detail shows the sinking funds. *(BUD)*
- 3b. **Paid by credit card.** Left to spend falls when the purchase is made. The cash impact appears in the forecast on the card repayment date, if one is known: from a confirmed recurring repayment (REC) or entered by hand. If neither exists, the forecast says "Card repayment date unknown" and doesn't guess. *(BUD, FC-04, REC)* · Depends on: SPIKE-01 (whether banks report the repayment date)
- 3c. Left to spend already negative or over pace. The app shows by how much and, if rollover is on, that next period's left to spend will be lower. *(BUD)*
- 3d. Forecast not available (before M3, or no forecast accounts chosen). Only the plan answer is shown, with "Forecast not set up yet" (INS empty state).

#### J-06 Consent renewal
**Persona:** the member who holds the connection (acts); any member (notices) · **Trigger:** a consent enters BANK's expiry warning window (at least 14 days before expiry) · **Done when:** the consent has a new expiry date and the same accounts keep syncing with no gap and no duplicates.

1. From the start of the warning window, every member sees a one-line header note on every screen and the same line on the connection screens: "<Bank> (Ola): access ends in 12 days. Only Ola can renew (bank sign-in needed)." Numbers aren't marked stale because of this. *(INS, BANK)*
2. A member who sees it and isn't Ola tells Ola in person. The app sends nothing.
3. Ola opens the app (any device), chooses Renew and completes SCA at the bank, two taps from the header note (AUTH-11). There is no extra in-app re-authentication beyond what AUTH requires. Whether the account must also be linked again in Ola's Enable Banking registration is unknown. *(BANK-12, AUTH)* · Depends on: SPIKE-01
4. The app shows the new expiry date. It matches the renewed connection's accounts to the existing ones, so they keep their history, and a sync runs. No account or transaction is duplicated. *(BANK-12, ACC, TXN)* · Depends on: SPIKE-01 (whether account identifiers stay the same after re-consent; if not, 4d)
5. The note disappears for every member.

**Branches**
- 1a. **The last days before expiry.** The header note keeps counting down ("access ends in 2 days"). It never becomes a dashboard attention row, and nothing else escalates. *(INS, BANK)*
- 1b. **Several consents expire together.** Banks connected in the same week all expire around the same day, about 180 days later, and often all for one member. The connection screen groups them per member: "Ola: 3 banks to renew by 12 Apr". A member can renew early at any time in the window, e.g. before going away. Whether early renewal gives a full new term depends on the bank. *(BANK, INS)* · Depends on: SPIKE-01
- 3a. SCA fails or is cancelled. The current consent stays valid until expiry. The note adds "Renewal attempt failed on <date>". *(BANK)*
- 3b. The bank grants a shorter consent than before. The new, shorter expiry is shown as is.
- 3c. **The bank now returns different accounts.** Renewal is the only moment the app sees this (BANK-12). Accounts the household doesn't have appear as "New accounts found", unticked by default. Accounts the bank no longer returns show "No longer available from this connection" and keep their history. If a new account has the same type and currency as a missing one, the app asks "Is this the replacement for <account>?" Each change is then decided as in J-11 step 4. *(BANK-12, ACC-09)* · Depends on: SPIKE-01
- 4a. **Expiry passes without renewal.** The connection needs re-consent. Every derived number whose data is no longer complete because of it shows the stale warning (INS-01). Renew remains available. After renewal, the app fetches the missed days as far as the bank allows. If any part can't be fetched, that date range is recorded and shown as a coverage gap on the account ("Missing data for <account> <date range>"), and CSV backfill is offered. Until the gap is filled, the period it falls in can't settle on its own, and figures covering it say "— may be off". *(BANK-10, TXN-21, ACC-13)* · Depends on: SPIKE-01 (how much history a re-consent returns)
- 4b. The holding member has left the household. → J-09 (the connection is ended, or the account is kept up to date through another member's connection).
- 4c. The holding member has lost their 2FA device. → J-10 first.
- 4d. **Account identifiers change after renewal** (bank-dependent). The app can't match an account with confidence and asks "Is this <existing account>?" with the likely account pre-selected (BANK-12). If yes, the existing account continues and overlapping transactions are matched. Any it can't match show as possible duplicates. They count in totals until resolved, with "Includes N uncertain items (<amount>) — may be off" under each affected total. If no, it's added as a new account. *(BANK-12, ACC, TXN-10)* · Depends on: SPIKE-01

#### J-07 Early revocation discovered
**Persona:** any member who opens the app (notices); the member who holds the connection (acts) · **Trigger:** a consent ends before its expiry (password change, revoked in the bank app, bank reset). The app learns this at its next sync attempt. · **Done when:** the connection is renewed, or deliberately disconnected with "Keep data" (its accounts become manual) or "Delete data" (BANK-14), and no stale warning remains for it.

1. The next sync for the connection fails. The app records when and how. *(BANK-10)*
2. The connection needs re-consent, and its accounts become Stale at once. A banner on every screen names the bank and the holder: "Ola's mBank connection stopped working on 3 Mar — Ola needs to renew it." It can be collapsed to a badge but not dismissed (BANK-10). Left to spend, forecast, net worth and reports that include its accounts show the stale warning naming it. *(BANK-10, INS, BUD, FC, NW)*
3. Any member who sees it tells Ola in person, or sends the link from "Copy renewal link" (BANK-10). The app sends nothing.
4. Ola renews with SCA. The app matches the accounts to the existing ones (as J-06 step 4), fetches the missed days and, once pending transactions are imported (TXN-07, Later), runs pending→booked matching. Edits are preserved. *(BANK-12, TXN)* · Depends on: SPIKE-01
5. Fetched transactions enter the review inbox. The warnings clear. *(CAT)*

**Branches**
- 1a. **Can't tell revocation from a bank outage.** The connection shows "Bank problem" and keeps retrying on schedule. After 1 day of failures it says "May need renewing" and offers renewal (BANK-10). It never says "access revoked" unless the bank says so. *(BANK-10)* · Depends on: SPIKE-01 (what early revocation looks like)
- 4a. **Revoked on purpose** (the member no longer wants this bank in the app). The holder or an Owner disconnects (BANK-14, re-authentication). With "Keep data" the accounts stay with all their history as manual accounts, "Disconnected on <date> — not updating", with an end date equal to their last data date, so they never block settling (INS-23). The confirmation warns: "Spending on this account after <date> won't be counted unless you import it or reconnect. Exclude it from the budget instead?" (BANK-14). With "Delete data" (Owners only) the data goes to Recently deleted, where any Owner can restore it for 7 days (SET-11). Either way the stale warning ends because the accounts are no longer expected to sync. A kept account that stays in the budget (the default) shows a quieter note instead: every figure covering dates after its last data says "Not updating since <date>: <account> — may be off" (BUD-02). The note goes when the account is excluded, archived or reconnected, so it is never a warning without a way out. *(BANK-14, ACC-09, BUD-02)*
- 4b. The gap is longer than the bank will return. The coverage gap is recorded and shown ("Missing data for <account> <date range>"), and CSV backfill is offered. Until it is filled, the period it falls in can't settle on its own; a member can use "Settle now", which names it (as J-06 4a).
- 4c. Revocation lands at period end. The period stays Provisional and can't settle on its own until the account's data reaches the end of the settling window (J-04 2a).
- 4d. Account identifiers change after reconnecting. As J-06 4d.
- 4e. **The holder can't renew for a long time** (away, ill). There's no new feature for this. The accounts stay honestly Stale, and each period that can't settle is closed with "Settle now", which names what's missing (J-04 2a). If it lasts, an Owner may disconnect with "Keep data" (BANK-14, re-authentication, a household event). The accounts become manual, the banner stops, and they stop blocking settling. The confirmation offers to exclude them from the budget instead (BANK-14). If they stay in it, as they usually should while the holder's card is still in use, every figure covering dates after their last data shows "Not updating since <date>: <account> — may be off", so the holder's spending never drops out of left to spend silently. When the holder is back, they reconnect the bank through BANK-16, the kept accounts are offered for re-attachment, and the time in between shows as a coverage gap that the bank fills as far back as it allows. Whatever the bank can't return can be filled by CSV; each transaction that is in both the file and bank data shows as a flagged pair until a member resolves it (TXN-10, TXN-21). This is what "converted to manual" means everywhere in this document. *(BANK-10, BANK-14, BANK-16, ACC-13, TXN-10, TXN-21, BUD-02)*

#### J-08 Joint account connected by both partners
**Persona:** partner (connects second), household lead · **Trigger:** a member's bank connection includes an account that's already connected through another member's connection · **Done when:** the account appears once, with account holder Joint, and both connections feed it. · Depends on: SPIKE-01 (how the same joint account appears from two logins, and whether either holder can link it in their own Enable Banking registration)

1. During account selection, the app recognises the account. If the bank returns the same full account identifier as an existing account at the same bank, the app attaches it automatically and says so: "Joint ••1234 is already in the household (connected by Ola). It will now be kept up to date by both connections." *(BANK-15, HH-06)*
2. The account stays one account, account holder Joint, now with two connections as sources. The same transaction delivered by both connections is merged automatically. Existing edits are kept. *(BANK-15, TXN-10, HH-06)*
3. The account details say "Kept up to date by: Ola's connection, Tomek's connection" and which one delivered the last update. The account is fresh while at least one source is healthy. *(BANK-15, HH-06)*
4. Budget, forecast and net worth count the account once. *(BUD, FC, NW)*

**Branches**
- 1a. **No confident match** (masked numbers, missing identifiers). The app never merges silently. If the accounts look alike (same bank and currency, at least 5 identical transactions in the last 30 days), it asks "This looks like Joint ••1234 — same account?" A member confirms or rejects. Rejecting keeps them separate, and the app doesn't ask again, but a member can still merge them by hand later ("Same account as…"). *(BANK-15, HH-06)*
- 1b. The member leaves the joint account out of their consent. Nothing changes.
- 2a. **Wrong merge.** A member unmerges it from the account details. Each transaction goes back to the connection that delivered it, with its edits, and no edit is lost. *(BANK-15)*
- 3a. **One source lapses.** The account stays fresh through the other. The lapsed connection still shows its own banner, which adds "Joint ••1234 is still updated through Ola's connection", and it still needs renewing (J-06, J-07). Numbers aren't marked stale. *(BANK-15)*
- 3b. **The two logins report a transaction differently** (description, pending/booked timing). Each transaction keeps the bank details from the connection that delivered it first, and member edits always win. Only transactions whose details differ between the two logins become possible duplicates, which count in totals until resolved, with the uncertain-items footnote. *(BANK-15, TXN-10)*
- 3c. Reports filtered by member show Joint as its own value. *(INS, HH)*

#### J-09 A member leaves the household
**Persona:** an Owner (removes) or the leaving member (leaves) · **Trigger:** separation, an adult child moving out, a relative stopping · **Done when:** the person has no access, nothing is fetched through their connections, the household's figures are unchanged unless erasure was asked for (4a), and the current period's plan reflects the change.

1. An Owner chooses "Remove <member>", or the member chooses "Leave household". Both need re-authentication and an explicit confirmation (AUTH-10). For an Owner's removal that is always a fresh re-authentication. *(HH-07, AUTH)*
2. Before confirming, a summary lists every consequence by name: the member's connections, the accounts behind them, joint accounts, and recurring items and budget lines tied to those accounts (e.g. their salary). It also says what can be undone: a removal can be restored by an Owner for 7 days, leaving can't. *(HH-07, BANK, ACC, REC, BUD)*
3. **Access and connections.** All the person's sessions end at once. After a removal, their login, their Enable Banking registration details and their connections are kept unused for 7 days in Recently deleted: sign-in is blocked and nothing is fetched. After those 7 days, or at once when a member leaves on their own, all of it is deleted and the connections are ended at the bank-data provider. The summary tells the person to also remove the app in their Enable Banking registration and withdraw consent in their bank app, because ending it on the app's side may not remove it at the bank. *(HH-07, SET-11, AUTH, BANK)* · Depends on: SPIKE-01 (what ending a connection does at the bank)
4. **Their accounts.** Kept with full history. For the 7 days after a removal, their connections show "Paused — member removed" and the accounts go stale; the stale warning names the fix "Restore <name>, or connect this account from your own bank login". In that time a stale account can hold a period from settling on its own, and a member can use "Settle now" (J-04 2a). When the connections end (after the 7 days, or at once when a member leaves), the accounts are marked "Not updating — <name> left" (or "removed") and kept as with "Keep data": manual, with an end date equal to their last data date, so they never block settling (BANK-14). While one stays in the budget, figures after its last data show "Not updating since <date>: <account> — may be off". The remaining Owners can later keep, exclude from the budget, archive or delete each one. A deletion goes to Recently deleted for 7 days (SET-11). *(HH-07, ACC-09)*
5. **Joint accounts.** History is kept and the holder stays Joint. If another member's connection also feeds it, it continues without interruption. Otherwise the remaining members see "Connect this joint account from your own bank login to keep it updated", which attaches to the existing account (J-08). *(HH-06, HH-07, BANK-15)*
6. **Figures and work.** Without erasure, no figure changes in any period. The person's categories, rules, notes and edits stay, attributed to "<name> (former member)". Every member sees the removal or the leave as a household event. *(HH-07, AUTH-13)*
7. **Re-plan.** Members are asked to update the current period's plan. Income and bills tied to the person's accounts are listed, and the forecast's account selection is updated. MET-10 doesn't count this period (6.1). *(BUD, REC, FC)*
8. Net worth drops archived accounts from their archive date. Past snapshots stay as recorded. *(NW)*

**Branches**
- 1a. **The leaving person is the last Owner.** They can't leave or be removed. The app says "Make someone else an Owner first, or delete the household." *(HH-03)*
- 1b. **One Owner removes another Owner without their agreement** (e.g. separation). HH allows it. It takes effect immediately after re-authentication and a confirmation naming the person, and every member sees it as a household event. Any Owner can restore the removed Owner within 7 days. *(HH-03, HH-07)*
- 1c. **The leaving member wants a copy of the data first.** Any member can make a full export after re-authentication (HH-02, SET-08), so they export before leaving. A removed member can no longer sign in to do it.
- 1d. **Removed by mistake.** Within 7 days an Owner restores the member from Recently deleted (fresh re-authentication). This brings back their login and role; their name and attribution never changed. Their bank connections stay "Paused — member removed" until that member signs in and taps "Resume my connections". A consent that lapsed or was withdrawn in the meantime is then renewed as in J-06. A member who left on their own can only be invited again as a new member. *(HH-07, SET-11)*
- 3a. The member had already revoked consent at the bank. The connection shows as broken, and step 3 just ends it.
- 3b. **The removed member signs in within the 7 days.** They see "You were removed from this household on <date> by <name>. Your bank connections are no longer used and will be ended on <date>…", with how to end access in their Enable Banking setup and bank app, and "To have your data erased, ask an Owner." *(HH-07)*
- 4a. **Erasure of personal data (GDPR, M2).** The leaver asks for it on the leave screen, or an Owner asks on a former member's behalf (HH-08). It runs 7 days after the request. Until then every member sees a banner listing the accounts that will be erased and the date. The person's name becomes "Former member N" everywhere. If they choose, accounts whose data came only from them are erased too. Erasure removes records, not money events. A Settled period shows "Changed since settled — member data erased", while carried rollover, sinking funds and late adjustments stay as they were. The current period changes only by the erased transactions dated in it. Erased data never goes to Recently deleted, and an erasure request ends the 7-day restore option. *(HH-08)*

#### J-10 Lost 2FA device
**Persona:** any member with 2FA on · **Trigger:** the phone with the authenticator was lost, broken or replaced · **Done when:** the member is signed in, has a new authenticator and a new set of recovery codes, and the lost device's sessions are ended.

1. The member signs in with their email link or code. At the 2FA step they choose "Use a recovery code". *(AUTH-16, AUTH-05)*
2. They enter one recovery code and are signed in. That code is used up. Only they see a notice about it, on their own account (AUTH-13).
3. The app shows a new set of 10 recovery codes. They must download or print them and tick "I saved my recovery codes" before continuing. All old codes stop working. *(AUTH-05)*
4. They're asked to set up a new authenticator. With the phone gone, they do it now, and the old authenticator stops working at once. Only a member who still has the old phone can postpone this step. *(AUTH-04, AUTH-05)*
5. The member reviews active sessions, with times in the household's time zone (SET-12), and signs out the lost device's sessions, or signs out everywhere. *(AUTH)*

Any later change to their authenticator, recovery codes or email always needs fresh re-authentication, with no "signed in a few minutes ago" shortcut. *(AUTH-10)*

**Branches**
- 1a. **No recovery codes.** The member asks an Owner directly. The Owner chooses "Reset 2FA" in Members, re-authenticates and confirms "Only do this if <name> asked you directly". The reset takes effect at once, and every member sees it as a household event. 2FA is then off for the member: they sign in with their email alone and can turn 2FA on again (AUTH-04). If they also lost access to their email, the operator changes it by hand (AUTH-15 is Later). An Owner can't reset their own 2FA; another Owner does it. *(AUTH-12, AUTH-13)*
- 1b. **Every Owner has lost access** (to their email, or to their 2FA and recovery codes). No path inside the app makes anyone an Owner. Members can still sign in and do everything except Owner actions, and the data stays intact. The operator, who runs the app, handles it by hand, outside the app (§10 question 11). To prevent it, while the household has one Owner, Owners see "Only one Owner — if you lose access to your email or 2FA, nobody can manage this household" (AUTH-12, HH-03). *(AUTH, HH)*
- 1c. The lost device had "remember this device" on. The member signs out everywhere from another device, or after recovery. *(AUTH)*
- 1d. **Too many wrong codes.** After 5 wrong 2FA or recovery codes, each further failure adds a growing wait shown on screen, but failures never lock the account for good (AUTH-09).
- Bank connections and each member's Enable Banking registration are unaffected, and sync continues. If the member also has a renewal due, it waits until they're back in (J-06 4c).

#### J-11 Something's missing although the sync worked
**Persona:** any member (notices and decides); the connection holder (renews) · **Trigger:** a member notices something missing: a card payment they made isn't there, a new card's spending isn't showing, or an account shows "No longer available from this connection" or Stale although the connection is fine. Or a renewal returns a different list of accounts (J-06 3c). · **Done when:** every account the household expects is fed, deliberately left out, archived or marked as replaced, and every number says what it can't see. · Depends on: SPIKE-01 (how banks report reissued cards, closed accounts, accounts opened during a consent, and posting lag)

1. A member notices the gap. The app finds out about new or vanished accounts only when the connection is renewed (BANK-12), so between renewals a member usually notices first. An account the bank no longer returns shows "No longer available from this connection" or Stale, and numbers that include it show the stale warning naming it (INS-01). A new card's spending is simply missing. *(BANK-12, ACC-13, INS)*
2. On the account, "Something's missing?" explains the likely causes in plain words and names who acts: "A new card or account appears only after Ola links it in Ola's Enable Banking registration and renews the mBank connection." *(ACC-14, Could)*
3. The holder links the new card or account in their Enable Banking registration, then renews the connection (J-06 step 3). The renewal shows "New accounts found", and for a new account with the same type and currency as a missing one it asks "Is this the replacement for Card ••4411?" *(BANK-16, BANK-12)* · Depends on: SPIKE-01
4. Any member decides each change. The account's holder usually does, by convention, but only renewing is reserved to the connection holder:
   - **Replacement card or account.** Yes links the new account as "Replacement for Card ••4411". The old account gets an end date, and both read as one history in balances and reports. Whether rules and budget lines tied to the old account move to the new one is an open question (section 10). No adds it as a new account (holder and type set as in J-01 step 4). *(ACC-09)*
   - **Account gone.** "Archive" for a closed account: it's shown as "Closed on <date>", the date of its last data, and its history is kept. Or "Mark as replaced by…". Until someone decides, an account that counts in the budget shows "Waiting for a decision on <account>", and periods that include it can't settle on their own. An account whose end date is before a period's end never blocks it. *(ACC-09, ACC-13, BUD-19)*
   - **New account the household doesn't want.** It stays unticked in "New accounts found". Nothing else is needed. *(BANK-12)*
5. The markers clear for every member. *(BANK, ACC, TXN, INS)*

**Branches**
- 1a. **Card spending posts late.** A purchase from Friday isn't there on Sunday, although the sync worked at 08:10. That isn't an error: the bank hasn't reported it yet. The freshness label shows when the last sync was, not that everything up to then is in. A period settles on its own only once every budget account's data reaches the end of its settling window, counted from the period end. If the purchase still hasn't appeared after that, the member checks with the bank or adds it by hand. *(INS, TXN)*
- 3a. **The holder isn't around to renew.** Nobody else can bring in the new card. Until the holder renews, its spending is missing from every number, and the old card's Stale or "No longer available" marker says so. Periods wait or are closed with "Settle now" (J-04 2a). For a long absence, see J-07 4e.
- 4a. **Wrong "replacement" link.** Undoing the link separates the accounts again, and no edit is lost (ACC-09).
- 4b. The bank reports the same transactions under both the old and the new card. They show as possible duplicates, which count in totals until resolved, with the uncertain-items footnote. *(TXN-10)*

---

## 4. Functional requirements

Requirements are grouped by area. Each heading reads `ID Title · Priority · Milestone`. A requirement tagged *Depends on: SPIKE-01* is provisional until the SPIKE-01 findings note exists (Appendix B). Sections marked *informative* are worked examples and explanations, not requirements.

### 4.1 Authentication & sessions (AUTH)
How members get into the household and stay safely signed in. The app is invite-only: the first person creates the household, everyone else joins by invite. Every member signs in with a link or code sent to their email (AUTH-16); there are no passwords. A member can add a second factor (2FA, AUTH-04). Email is used only for invites and sign-in links. The goal is "bank-grade enough" for read-only bank data (no money can be moved: payment initiation is out of scope) without making the routine job, renewing a bank consent on a phone, painful.

Protection is proportionate. Owners are trusted, and the operator can bypass anything in the app anyway. So the app protects against **outsiders** (a compromised inbox, a lost or unattended phone) and **accidents**, not against Owners. Owner actions take effect immediately, after re-authentication and an explicit confirmation. Each one is recorded in the audit log (NFR-04) and shown to every member as a household event (AUTH-13). Deleted data stays recoverable for 7 days (SET-11).

Baseline references: [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html) (account recovery and notifications: [§4](https://pages.nist.gov/800-63-4/sp800-63b/events/)) and [OWASP ASVS 5.0 V6 Authentication](https://github.com/OWASP/ASVS/blob/master/5.0/en/0x15-V6-Authentication.md) / [V7 Session Management](https://github.com/OWASP/ASVS/blob/master/5.0/en/0x16-V7-Session-Management.md). Numbers below are product defaults. Deviations from NIST are stated and justified, as [ASVS 7.1.1](https://github.com/OWASP/ASVS/blob/master/5.0/en/0x16-V7-Session-Management.md) requires. The **operator** is the person who installs and hosts the app, an out-of-app role (in practice a household Owner). Each member who brings bank accounts holds their own Enable Banking registration.

#### AUTH-01 Create the household (first run) · Must · M1
As the first Owner, I want to create the household once, so that the app belongs to our household from the start.
**Acceptance criteria**
- When no household exists, the app shows only "Create household".
- Creation asks for: household name, base currency (SET-02, with its confirmation step), household time zone (SET-12, pre-filled from the browser), the creator's name and email, confirmed with a sign-in code (AUTH-16) before the household is created. 2FA is offered (AUTH-04). The creator becomes an Owner.
- After creation, "Create household" is not reachable by anyone. Any public sign-up URL shows "This app is invite-only. Ask a household Owner for an invite."
- If someone else creates the household first, the operator sees only the sign-in page and cannot create their own. The fix is to reset the installation outside the app. At that point the installation holds no bank data.
- After household deletion (SET-09) the app returns to the first-run state.
**Notes:** The setup code from the first draft was removed. Remaining risk: someone who finds a fresh installation before the operator could claim it. They gain an empty app with no bank data, and the operator notices at once because their own creation fails.

#### AUTH-02 Accept an invite · Must · M1
As an invited person, I want to join from an invite email, so that I get my own login without a public sign-up.
**Acceptance criteria**
- An invite link is sent only by email to the address the Owner entered (HH-04). There is no "copy link" option, so the link arriving in that inbox proves the person controls the address.
- The link is single-use and expires 72 hours after it is sent. Resending an invite invalidates the previous link. Revoking a pending invite invalidates its link immediately.
- Opening a used, expired or revoked link shows "This invite is no longer valid — ask an Owner to send a new one" and creates nothing.
- Accepting requires a display name. Opening the invite link counts as the first sign-in (AUTH-16). 2FA is offered and can be skipped (AUTH-04). The account email is the invited address and cannot be edited during acceptance. No two members can have the same email.
- Until all steps are complete the person sees no household data. If they abandon midway, the link stays usable until it expires.
- Once accepted, the new member appears in the Members list with role and join date, and the event is in the audit log (NFR-04).
**Notes:** ASVS 6.4.1: activation codes must expire after a short period or after first use. 72 h is long enough for a partner who checks email irregularly.

#### AUTH-03 Password rules · removed
Removed. Members sign in with an email link or code (AUTH-16); there are no passwords (§10 question 2).

#### AUTH-04 Optional two-factor authentication · Should · M1
As a member, I want to add a second factor to my sign-in, so that someone who gets into my email still can't open our bank data.
**Acceptance criteria**
- 2FA is offered at household creation and invite acceptance, with "Skip for now". A member can turn it on later in Settings → Security, after re-authentication (AUTH-10).
- Supported second factor: one-time codes from an authenticator app (set up by QR code, with a manual-entry fallback). SMS codes are not offered.
- With 2FA on, every new session needs the email link or code (AUTH-16) plus a 2FA code, or a recovery code (AUTH-05).
- Each code works once. The code field accepts paste and the phone's one-time-code autofill.
- A member can replace their authenticator (e.g. new phone) or turn 2FA off, after re-authentication. The old authenticator stops working immediately. Each change is an own-account notice (AUTH-13).
- An Owner can see, per member, whether 2FA is on, but never the secret.
**Notes:** Optional by household decision (§10 question 2). Without it, a member's account is as safe as their inbox (AUTH-16). NIST 800-63B-4 §3.1.3.3 marks SMS/voice as "restricted". ASVS 6.6.1 allows SMS only alongside stronger methods. Not offering SMS also avoids a paid SMS provider.

#### AUTH-05 Recovery codes · Should · M1
As a member with 2FA on, I want one-time recovery codes, so that I can still sign in if I lose my phone.
**Acceptance criteria**
- Recovery codes exist only for members with 2FA on (AUTH-04). Turning 2FA off deletes them.
- At 2FA enrolment the member gets 10 recovery codes and must download or print them, then tick "I saved my recovery codes" before continuing.
- Each code can replace one 2FA code at sign-in and works only once.
- After signing in with a recovery code, the member is shown a new set of 10 codes, which they must save as at enrolment, and all old codes stop working. They are also asked to set up a new authenticator. They can postpone that step if they still have their phone.
- The member can generate a new set at any time after re-authentication (AUTH-10). All old codes stop working immediately.
- An Owner can see, per member, whether recovery codes exist and when they were generated, but never the codes themselves.
**Notes:** ASVS 6.5.1 (look-up secrets single-use). NIST 800-63B-4 §4.2.1.1: after a saved recovery code is used, the provider "SHALL invalidate that recovery code and SHALL issue a new saved recovery code". Issuing a fresh set at that moment replaces the earlier "N of 10 remaining" counter and low-codes flag.

#### AUTH-06 Password reset by email · removed
Removed. With no passwords, a member who can't sign in asks for a new email link or code (AUTH-16).

#### AUTH-07 Session timeouts and "remember this device" · Must · M1
As a member, I want to stay signed in on my own phone but not on a shared computer, so that daily use is quick and a forgotten browser isn't an open door.
**Acceptance criteria**
- Default session (box unticked): ends after 30 minutes without activity and at most 12 hours after sign-in, whichever comes first.
- "Remember this device" (unticked by default, offered at sign-in): the session on that browser ends 30 days after sign-in or after 7 days without use, whichever comes first. Then a full sign-in (AUTH-16, plus 2FA if on) is required.
- 2 minutes before an inactivity timeout the member sees "You'll be signed out in 2 minutes — Stay signed in", and one tap extends the session.
- After any timeout, signing in again returns the member to the page they were on.
- Every page has a visible "Sign out" control (in the menu on phones).
- There is no cap on concurrent sessions per member. All of them appear in the session list (AUTH-08).
**Notes:** NIST 800-63B-4 §2.2.3 (AAL2): the overall timeout "SHOULD be no more than 24 hours", and the inactivity timeout "SHOULD be no more than 1 hour". The 30-day remembered session is a deliberate deviation. It is opt-in per device, listed and revocable (AUTH-08), ends after 7 idle days, and every destructive action still needs re-authentication (AUTH-10). The app also cannot move money. Banking apps log out after 5 minutes because [PSD2 RTS Art. 4(3)(d)](https://eur-lex.europa.eu/eli/reg_del/2018/389/oj) requires it of payment service providers. This app is not one (see Open questions to confirm).

#### AUTH-08 Active sessions and sign out everywhere · Must · M1
As a member, I want to see where I'm signed in and end sessions, so that I can react to a lost phone.
**Acceptance criteria**
- Settings → Security lists each of my sessions: browser and device type, sign-in time, last active, "remembered" yes/no, and "this device". Only I see this list.
- I can end any single session, or "Sign out everywhere else". Ending my own sessions needs no re-authentication, so a member whose inbox is compromised can act at once.
- An ended session stops working on its next request: the device shows the sign-in page and no household data.
- An Owner can end all sessions of another member (e.g. their phone was stolen), after re-authenticating (AUTH-10), without seeing that member's session list. The event is audited and shown to all members (AUTH-13).
- Removing a member (HH-07) ends all their sessions immediately.
**Notes:** ASVS 7.4.2, 7.4.5, 7.5.2. Owners don't see other members' sessions or last-active times.

#### AUTH-09 Sign-in throttling without permanent lockout · Must · M1
As a member, I want code guessing slowed down without an attacker being able to lock me out for good, so that my account is protected and still usable.
**Acceptance criteria**
- After 5 wrong email codes (AUTH-16), that code stops working and the member asks for a new email.
- Wrong 2FA codes and recovery codes: the first 5 consecutive failures cause no delay. Each further failure adds a wait that starts at 30 seconds and doubles, capped at 15 minutes. The screen shows how long to wait.
- Failed attempts never disable an account permanently.
- Delays and messages are the same for emails that don't belong to any member.
- Throttling and failed sign-ins are recorded in the audit log (NFR-04).
**Notes:** NIST 800-63B-4 §3.2.2 suggests increasing waits instead of a hard lockout. ASVS 6.1.1 requires the design to prevent malicious account lockout. Here an attacker can delay a member but cannot lock them out. Counting failures per known browser was dropped. Remaining risk: someone who knows a member's email can make that member wait up to 15 minutes at a fresh sign-in. Already signed-in and remembered sessions are not affected.

#### AUTH-10 Re-authentication and confirmation before destructive or access-changing actions · Must · M1
As the household, we want deleting data or changing access to need fresh proof of identity and an explicit confirmation, so that an unattended signed-in phone or a slip of the finger can't do lasting damage.
**Acceptance criteria**
- **Rule.** An action asks for re-authentication (a fresh code sent to the member's email, or their 2FA code if 2FA is on), and then an explicit confirmation naming what will happen, when it:
  - (a) deletes household data, even though it stays recoverable in Recently deleted for 7 days (SET-11);
  - (b) ends access that only someone else can restore;
  - (c) changes who can sign in, or with which email, authenticator or recovery codes;
  - (d) sends all household data out of the app; or
  - (e) adds a new source of bank data.
- **Fresh every time for (b) and (c)**. Ending access and changing who can sign in, or how, always ask for re-authentication, even right after sign-in. This covers changing your own email, 2FA or recovery codes, and every Owner action on roles or membership. Only (a), (d) and (e) skip re-authentication when the member fully signed in within the last 10 minutes. They still need the confirmation.
- **Catch-all.** Any confirmation that says a change to household data "cannot be undone" asks for re-authentication, in every area. Settling a period (BUD-19, INS-23) is not such a change: it changes no data, and later corrections show as "Changed since settled".
- **Current list:**
  - (a) disconnect with "delete data"; delete an account; permanently delete transactions; undo a CSV import (TXN-21); merge a category, or delete one into a target category (CAT-03); schedule or cancel deletion of all household data (SET-09); request or cancel erasure (HH-08).
  - (b) disconnect any connection, also with "keep data", because only the connection holder can restore it through the bank's SCA (BANK — disconnect).
  - (c) invite, resend or revoke an invite; remove a member or restore a removed member (HH-07, SET-11); promote, demote or remove an Owner (HH-03); reset another member's 2FA (AUTH-12); change your own or, as an Owner, another member's email (AUTH-15); end another member's sessions; turn your own 2FA on or off or replace your authenticator; generate new recovery codes.
  - (d) full data export (SET-08). Report CSVs (INS) and filtered transaction CSVs (TXN) are not on the list.
  - (e) add a **new** bank connection; add or replace your own Enable Banking registration (BANK — own Enable Banking setup).
- **Not on the list,** because they can be undone in the app and are recorded: restoring data from Recently deleted (SET-11); merging or unmerging accounts (HH-06); budget, category and rule edits; changes to the budget period, time zone, holiday calendar, staleness thresholds or base currency (SET-05, SET-06, SET-10, SET-12). Applying a rule to past transactions stays off the list only while CAT offers an undo for it. Otherwise the catch-all applies.
- A remembered session (AUTH-07) does not count as a recent sign-in.
- Re-authentication is a dialog on the current page. After success the action continues without re-entering data.
- Re-consent of an existing connection is **not** on this list (AUTH-11).
**Notes:** [ASVS 7.5.1](https://github.com/OWASP/ASVS/blob/master/5.0/en/0x16-V7-Session-Management.md) (Level 2) asks for full re-authentication before changing anything used for authentication or recovery. A recent sign-in does not count, so (c) never skips. Without that, a phone grabbed within 10 minutes of sign-in could change the email to the attacker's inbox and so take the account. An Owner's phone could invite the attacker as an Owner and remove the real Owners. (b) never skips either, because only the connection holder can undo it. Re-authenticating before other sensitive operations is [ASVS 7.5.3](https://github.com/OWASP/ASVS/blob/master/5.0/en/0x16-V7-Session-Management.md), a Level 3 item. It is applied here to deletions and access changes because, with no waiting holds, re-authentication, confirmation, the household event and Recently deleted are the whole protection. The 10-minute window avoids asking twice when sign-in is immediately followed by a deletion (still recoverable), an export or a new connection.

#### AUTH-11 Low-friction re-consent of an existing connection · Must · M1
As a member whose bank consent is expiring, I want to renew it from my phone in a few taps, so that our data doesn't go stale because renewal is a chore.
**Acceptance criteria**
- Renewing an existing connection never asks for re-authentication beyond normal sign-in. The bank's own SCA is the only extra proof.
- Signed in on a phone: from the expiry note (shown on every screen), the member reaches the bank's SCA screen in at most 2 taps ("Renew" → confirmation screen naming the bank and accounts → "Continue to bank").
- Signed out: a link to the renewal step (e.g. one sent by a partner in a chat) asks for sign-in (AUTH-16) and then opens the renewal step directly, without passing through the landing screen.
- If the member cancels or the bank returns an error, the existing connection and its data are unchanged and "Try again" is offered.
- The whole flow works at 360 px width and with the bank's app opening in between (app-to-app redirect and back).
- Only the member who holds the connection can renew it. Other members see "Only <name> can renew this" (see BANK — re-consent).
**Depends on:** BANK — re-consent flow; SPIKE-01 (whether the bank asks to re-select accounts)
**Notes:** Step count on a phone:

| Situation | App screens | Bank screens (bank controls them) |
|---|---|---|
| Signed in on a remembered phone | 2 taps: Renew → Continue to bank | SCA, often 1–3 (approve in bank app, maybe re-select accounts) |
| Session expired / not remembered | +1–2: email code, and a 2FA code if on | same |
| Returning | 0: success screen, sync starts automatically | — |

Worst case is 4 app screens plus the bank's SCA. New connections need re-authentication (AUTH-10) because they add a new data source. Renewals don't.

#### AUTH-12 Owner-assisted 2FA reset · Should · M1
As a member with 2FA on who lost my authenticator and my recovery codes, I want an Owner to reset my 2FA, so that I don't lose my account and history.
**Acceptance criteria**
- An Owner chooses "Reset 2FA" for another member. The Owner re-authenticates (AUTH-10) and confirms a dialog that says: "Only do this if <name> asked you directly. Until <name> turns 2FA on again, their email alone will let them in." The reset takes effect immediately.
- The member's authenticator and recovery codes stop working at once, 2FA is off for them, and all of their sessions end (AUTH-08), so a lost phone's remembered session stops working too. They sign in with their email (AUTH-16) and can turn 2FA on again (AUTH-04).
- A member who also lost access to their email asks the operator, who changes it by hand while AUTH-15 is Later.
- An Owner can never see or set another member's 2FA secret, and cannot reset their own 2FA. An Owner who lost their 2FA is reset by another Owner.
- Every reset is audited (NFR-04) and shown to all members as a household event (AUTH-13).
- **If every Owner has lost access** (to their email, or to their 2FA and recovery codes), no path inside the app makes anyone an Owner. Members can still sign in and do everything except Owner actions, and the data stays intact. The operator handles it by hand, outside the app (§10 question 11). The app states this where Owners are managed.
- Prevention: while the household has only one Owner, Owners see an in-app flag "Only one Owner — if you lose access to your email or 2FA, nobody can manage this household" until a second Owner exists (HH-03).
**Notes:** Owners are trusted (§10 question 9), so the reset takes effect at once with no waiting hold. The Owner remains what NIST 800-63B-4 calls a recovery contact ([§4.2.1.3](https://pages.nist.gov/800-63-4/sp800-63b/events/)). Every reset is a household event: other members are the "designee" notified under §4.2.4. ASVS 6.4.4 (identity proofing for a lost factor) is met by the Owner knowing the member in person. Remaining risk: after a reset, the member's account is protected only by their inbox until they turn 2FA on again.

#### AUTH-13 Security notices and household events · Must · M1
As a member, I want to be told about security changes to my account, and about actions that affect other members or the household, so that a takeover or a mistake is noticed quickly.
**Acceptance criteria**
- **My account (only I see these, on sign-in and as a banner until I've seen them):**
  - 2FA turned on or off; authenticator replaced;
  - recovery code used; new recovery codes generated;
  - my email changed;
  - "Sign out everywhere else" used.
- **Household events (every member sees these):** actions one member takes on another member or on household data:
  - an Owner reset a member's 2FA, changed a member's email, ended a member's sessions, or disconnected a connection that member holds (BANK — disconnect);
  - Owner role granted or removed;
  - member invited, joined, left, removed or restored;
  - data deleted (connection "delete data", account, transactions) or restored from Recently deleted (SET-11);
  - erasure requested, cancelled or executed;
  - household deletion scheduled or cancelled.
- Household events appear on the landing screen (Connections page in M1, dashboard from M2) as one compact line ("2 household events since your last visit"), which opens the list. They are marked seen per member and never counted or reported. Nothing stays on screen until dismissed, except household deletion and erasure countdowns (SET-09, HH-08).
- Each notice says who, what and when. The affected member gets "This wasn't me" → sign out everywhere and secure your email. Other members get "Not expected? Ask <name>".
- Notices stay available in Settings → Security for 90 days.
- The same events appear in the audit log with the same visibility (NFR-04).
**Notes:** A member's own protective actions (2FA changes, new codes, signing out elsewhere) are not broadcast. Otherwise a member who suspects someone would be telling that person. Events that affect someone else are broadcast to everyone, as AUTH-13 requires. For own-account events after a recovery, the member is the person NIST notifies ([§4.2.4](https://pages.nist.gov/800-63-4/sp800-63b/events/)). Owner-started recovery is a household event, so other members act as designees (§4.6). Emailing any notice is an open question for the user. New-browser and failed-sign-in notices were dropped. Failed sign-ins remain in the audit log for the member and Owners.

#### AUTH-14 Manage my sign-in details · removed
Removed. Authenticator and recovery-code changes are in AUTH-04 and AUTH-05. Email changes are in AUTH-15.

#### AUTH-15 Change a member's email · Could · Later
As a member who changed email provider, or lost access to my old inbox, I want my login email updated without losing my account, so that sign-in links reach me.
**Acceptance criteria**
- A member changes their own email in Settings → Security after re-authentication (AUTH-10). An Owner can change another member's email from Settings → Members, after re-authentication, when that member has lost access to their old inbox.
- The new address is typed twice and must not belong to another member or a pending invite.
- The member keeps their authenticator, recovery codes, sessions, role and history.
- A self-made change is an own-account notice. An Owner-made change is a household event (AUTH-13). Both are audited (NFR-04).
**Notes:** Deprioritised (§10 question 10). Until it is built, the operator changes a member's email by hand, outside the app. With email sign-in (AUTH-16) the email is the whole login, so the design must be revisited before this is built: whether the new address confirms with a sign-in code first.

#### AUTH-16 Sign in with an email link or code · Must · M1
As a member, I want to sign in with a link or code sent to my email, so that there is no password to remember, reuse or leak.
**Acceptance criteria**
- The sign-in page asks only for an email address. "Send sign-in link" always shows the same message ("If this email belongs to a member, we've sent a sign-in link and code"), whether or not the address exists.
- The email contains a link and a 6-digit code. Either one signs in once. Both expire 15 minutes after sending, and requesting a new email invalidates the previous one.
- The link signs in the browser that opens it. Opening it shows a "Sign in as <email>" button, and only pressing it uses the link, so a mail scanner that opens links can't use it up. The code signs in the browser where it is typed, so a member can read the email on one device and sign in on another.
- "Remember this device" is chosen on the sign-in page (AUTH-07). With 2FA on, a 2FA code follows (AUTH-04).
- The email names the browser and time of the request and says "If you didn't ask for this, ignore this email."
- At most 5 sign-in emails per account per hour. Further requests show the same message and send nothing.
- A household invite (AUTH-02) also works as the new member's first sign-in.
**Notes:** Household decision (§10 question 2): email sign-in first, Google sign-in Later, 2FA optional (AUTH-04). Deviation: NIST 800-63B doesn't accept email as an out-of-band authenticator, so a member without 2FA is as safe as their inbox. Accepted for a household app that can't move money. Limits: short expiry, single use, the session list (AUTH-08) and household events (AUTH-13).

#### AUTH-17 Sign in with Google · Could · Later
As a member with a Google account, I want to sign in with it, so that I don't wait for an email each time.
**Acceptance criteria**
- "Continue with Google" appears on the sign-in page beside the email field.
- It signs in only an existing member whose Google account email matches their member email. It never creates a member or a household; joining still needs an invite (AUTH-02).
- With 2FA on, the app's own 2FA code still follows (AUTH-04).
- A member can turn Google sign-in off for their account in Settings → Security. Email sign-in (AUTH-16) always stays available.
**Notes:** Household decision (§10 question 2). Whoever takes over a member's Google account can sign in as them, just as with their inbox.

---

### 4.2 Household & roles (HH)
There is exactly one household and everything in it is shared: every member sees every account, transaction, budget and report ("filter by member" exists in reports only, see INS). HH defines who may administer the household (Owner) and who just uses it (Member), how the account holder and the connection holder are recorded, and what happens when someone leaves, including erasing their personal data with every resulting change shown. Owners are trusted: their actions take effect immediately, and they are visible to everyone and recoverable instead of delayed. For comparison, Monarch also gives every household member "[full visibility into all accounts and transactions](https://www.monarch.com/features/collaboration)", with Admin vs Member roles in its [help centre](https://help.monarch.com/hc/en-us/articles/20926382202004-Monarch-for-Couples-and-Households). YNAB Together uses separate plans per person, and a [removed member keeps their own plans and loses access to shared ones](https://support.ynab.com/en_us/ynab-together-B1nS78Cki.md). Our fully shared model is closer to Monarch.

#### HH-01 One fully shared household · Must · M1
As a member, I want to see all of the household's money, so that we plan together from one picture.
**Acceptance criteria**
- Every member sees all accounts (bank and manual), transactions, budgets, recurring items, forecasts, net worth and reports. No setting hides an account or transaction from another member.
- Only one household exists per installation. There is no household switcher and no way to create a second household.
- Before accepting an invite, the invitee sees "Everyone in this household sees all accounts and transactions, including the ones you connect."
**Notes:** Per-member private accounts are out of scope.

#### HH-02 Roles and permissions · Must · M1
As an Owner, I want clear roles, so that everyone can do the day-to-day work but only Owners can change who's in the household or delete data.
**Acceptance criteria**
- Each member is either Owner or Member. The app enforces this matrix: a forbidden action is not shown, and attempting it anyway (e.g. via an old link) shows "Only an Owner can do this":

| Action | Owner | Member |
|---|---|---|
| View all accounts, transactions, budgets, reports | Yes | Yes |
| Edit transactions (category, split, tags, notes, exclude), add manual transactions | Yes | Yes |
| Add/edit manual accounts and assets; set account holder | Yes | Yes |
| Edit the budget (amounts, rollover, sinking funds) | Yes | Yes |
| Manage categories and rules | Yes | Yes |
| Change area settings (e.g. forecast accounts, low-balance threshold, insight thresholds) | Yes | Yes |
| Add or replace their own Enable Banking registration (re-auth) | Yes | Yes |
| Add a new bank connection for their own bank login (re-auth) | Yes | Yes |
| Renew, refresh, resume or disconnect a connection they hold (a Member disconnects with "Keep data" only) | Yes | Yes |
| Disconnect a connection held by another member | Yes | No |
| Delete an account or permanently delete transactions (re-auth; goes to Recently deleted) | Yes | No |
| Undo a CSV import (goes to Recently deleted; TXN — CSV import) | Any import | Imports they made |
| Restore anything from Recently deleted (SET-11) | Yes | No |
| Invite, resend or revoke invites; remove members | Yes | No |
| Promote a Member; demote or remove an Owner (HH-03) | Yes | No |
| Reset another member's 2FA, end their sessions | Yes | No |
| Change their own or, as an Owner, another member's email (re-auth; Later, AUTH-15) | Yes | Own only |
| Change household settings (name, base currency, time zone, budget period and payday anchor, holiday calendar, review day, staleness thresholds) | Yes | View only |
| Full data export (re-auth) | Yes | Yes |
| View audit log | Per NFR-04 | Per NFR-04 |
| Schedule or cancel deletion of all household data | Yes | No |
| Leave the household; request erasure of own data | Yes (if another Owner remains) | Yes |
| Start erasure for a former member who asked outside the app | Yes | No |

**Notes:** Rule of thumb: Owners administer and delete, Members use. Budget, categories, rules and area settings are open to Members because the budget belongs to the whole household (changing the period setting is Owner-only, as in BUD). Export is open to Members because they can already see everything. Owners are trusted. Re-authentication, the household event (AUTH-13) and Recently deleted (SET-11) protect against outsiders and accidents. There is no "Cancel a hold" row because the app has no holds. Members' permissions are a decision to confirm (Open questions).

#### HH-03 Multiple Owners and last-Owner protection · Must · M1
As the household, we want more than one Owner to be possible, so that one person losing access doesn't lock the rest out of admin.
**Acceptance criteria**
- Any number of members can be Owners. An Owner can promote a Member to Owner, demote another Owner to Member, or remove another Owner (HH-07). Each needs re-authentication and an explicit confirmation naming the person (AUTH-10), and takes effect immediately.
- Every role change is audited (NFR-04) and shown to all members as a household event (AUTH-13).
- An Owner can step down to Member or leave (HH-07) on their own, immediately.
- The household always has at least one Owner. The last Owner cannot step down, leave, or be removed. The app says "Make someone else an Owner first, or delete the household."
- While there is exactly one Owner, the single-Owner flag from AUTH-12 is shown to Owners.
**Notes:** There is no 7-day demotion hold. Owners are trusted. A hold also had no end state when two Owners kept cancelling each other. A demoted Owner who disagrees has the household event, and every deletion stays recoverable for 7 days (SET-11).

#### HH-04 Invite members · Must · M1
As an Owner, I want to invite my partner or another household member, so that they get their own login.
**Acceptance criteria**
- An Owner enters an email and display name and picks a role (Owner or Member), after re-authentication. The invite email is sent (AUTH-02 for link rules).
- Settings → Members lists pending invites with sent time, expiry and role, with Resend and Revoke.
- Inviting an address that already belongs to a member or a pending invite is blocked with a message.
- Expired invites show as "Expired" and can be resent. They disappear from the list after 30 days.
- Each member has a display name and a colour or initials (editable by the member) used in reports, account holder labels and edit attribution.

#### HH-05 Account holder and connection holder on every account · Must · M1
As a member, I want each account to show whose it is and who keeps it connected, so that reports can be filtered by member and we know who must renew a connection.
**Acceptance criteria**
- Every account (bank or manual) has an **account holder**: one member's name, or **Joint**. Default for a bank account: the member who connected it. Default for a manual account: the member who created it. Any member can change it. It is a reporting label only. It never changes who can see the account or what erasure covers (HH-08).
- Every bank account also shows its **connection holder** or holders: the member whose bank login gave the consent, through their own Enable Banking registration. The app records this when the connection is made. Nobody can edit it. Example: "Account holder: Joint · Connected by: Ania".
- For an account filled by CSV import, the app records which member imported each file, and when. Nobody can edit that either.
- When a member leaves, their name is shown with "(former member)". After erasure (HH-08) it becomes the pseudonym "Former member N".
**Notes:** "Owner" is reserved for the admin role. "Account holder" is used for whose account it is (Appendix C). The connection holder, the CSV importer and the import date are recorded facts. HH-08 uses them instead of the editable label.

#### HH-06 A joint account connected by two members appears once · Must · M1
As a couple, we want our joint account to appear once even if we both connect it, so that balances, budgets and net worth aren't doubled.
**Acceptance criteria**
- When two connections deliver the same bank account, the household sees **one** account with account holder Joint. Its details list both connections as sources ("Kept up to date by: Ania's connection, Piotr's connection", BANK-15).
- Each transaction and balance of that account is counted once in every list, total, budget, forecast and net-worth figure.
- The account is up to date while **any** of its source connections is healthy. It is flagged stale only when **all** of them are broken, expired or older than the staleness threshold (SET-06). A banner names which source is broken.
- If one source is removed (disconnected, consent expired, member left), the account continues from the remaining source with no gap and no duplicate transactions.
- If the app is not certain two accounts are the same, it never merges them silently. It shows "This looks like <account> — same account?" (BANK-15) and a member decides. A rejected suggestion is not shown again, but a member can still merge the two accounts by hand from the account details ("Same account as…"). A merge can be undone from the account details.
- What HH requires vs what BANK does: HH requires the "appears once / counted once / fresh if any source is fresh" behaviour above. BANK is responsible for recognising that two connections return the same account, attaching a new connection to an existing account, and de-duplicating transactions that arrive from both sources (see BANK — joint accounts across connections, and TXN — dedup).
**Depends on:** SPIKE-01 (how the same joint account appears from two logins), BANK, TXN

#### HH-07 Remove a member / leave the household · Must · M1
As an Owner (or a departing member), I want a clear leaving process, recoverable if a removal was a mistake, so that access ends cleanly and the household's history stays correct.
**Acceptance criteria**
- An Owner removes a member, or a member chooses "Leave household". Both need re-authentication and an explicit confirmation (AUTH-10). Before confirming, a summary screen lists every consequence below, with the affected connections and accounts by name. Both are household events (AUTH-13).
- **Login:** on confirmation, all the leaver's sessions end and they cannot reach household data.
- **Removal is recoverable for 7 days.** A removed member goes to Recently deleted (SET-11). For 7 days their login, Enable Banking registration details and connections are kept, unused: sign-in is blocked and nothing is fetched. Their connections show "Paused — member removed". Nobody is asked to renew them, and their accounts' stale warnings name the fix "Restore <name>, or connect this account from your own bank login" instead of a renewal. Within those days an Owner can restore the member (fresh re-authentication, AUTH-10). **Restoring brings back the login and role only**, with the same name and attribution. The connections stay "Paused — member removed" until that member signs in and taps "Resume my connections" (no new Enable Banking setup). If a consent lapsed or was withdrawn in the meantime, they renew it instead (BANK — re-consent). Nobody else can resume or renew them. After 7 days without a restore, their sign-in data is deleted, their connections are ended at the bank-data provider, and everything the app held to fetch their bank data is deleted.
- **Leaving is immediate.** A member who leaves on their own chose to go, so nothing is kept for restore. Their sign-in data and everything the app held to fetch their bank data (including their Enable Banking registration details) are deleted at once, and their connections are ended at the bank-data provider. They can be invited again as a new member.
- **A removed member's rights:** if a removed member signs in correctly within the 7 days, they see: "You were removed from this household on <date> by <name>. Your bank connections are no longer used and will be ended on <date>. If an Owner restores you, they stay paused until you resume them. You can also remove access now in your Enable Banking setup and your bank app. To have your data erased, ask an Owner." Their erasure request then goes through an Owner (HH-08). The removal summary tells the Owner this.
- **Withdrawing consent at the bank:** the leave and removal summaries tell the leaver they can also remove the app in their Enable Banking registration and withdraw consent in their bank app, because ending it on our side may not remove it at the bank (SPIKE-01).
- **Accounts behind those connections:** kept with full history and marked "Not updating — <name> left" (or "removed"). When the connections end, they become accounts kept as with BANK — disconnect "keep data". For each one the remaining Owners can later keep it, archive it, or delete it (BANK — disconnect, ACC — delete).
- **Joint accounts:** history is kept in full and the account holder stays Joint. If the account has another healthy source (HH-06), it continues without interruption. Otherwise the remaining members see "Connect this joint account from your own bank login to keep it updated", and doing so attaches to the existing account (no duplicate).
- **Figures:** leaving or removal without erasure changes no figure in any period. Every imported transaction stays. No new transactions arrive from the leaver's connections.
- **Their work:** categories, rules, notes, splits and edits they made remain, attributed to "<name> (former member)".
- The leaver may also request erasure of their personal data (HH-08) on the same screen. An erasure request for a removed member ends the restore option.
**Depends on:** BANK — disconnect; SET-11; SPIKE-01 (what ending a connection does at the bank)
**Notes:** An "Undo removal" that deleted the member's Enable Banking registration details at once would force a restored member to set up Enable Banking again before renewing. Keeping them unused for 7 days spares that setup. An Owner's restore does not restarts fetching on its own. The removed person was told their connections would end, and the app must not use a person's bank consent until that person is back and agrees. Remaining risk: for 7 days after a removal the household still holds unused access to the removed member's bank data. The removed member is told how to end it themselves.

#### HH-08 Erase a departing member's personal data · Must · M2
As a departing member, I want my login, my name and the bank data that came only from me removed, so that my former household no longer holds them. As the remaining household, we want to see exactly what changed.
**Acceptance criteria**
- **Who can ask:** the leaver, when leaving (HH-07). Or an Owner on a former member's behalf ("Erase former member's data"), when that person asks outside the app.
- **Always erased:**
  - the member's name and email, replaced by the pseudonym "Former member N" wherever the app shows a member (member list, account holder and connection holder labels, CSV importer, edit attribution, audit log);
  - any remaining sign-in data;
  - anything held for their connections, including the fingerprints kept so that bank transactions deleted from them aren't imported again (TXN — permanent delete).
- **Erased if the leaver chooses** (one choice, with the accounts listed by name): every account whose data came **only** from the leaver up to the day they left or were removed. That is data from connections they held or from CSV files they imported (HH-05). It covers all its transactions, balances, balance history and notes. After that day:
  - CSV files another member imports into such an account count as the leaver's data and are erased with it;
  - the only thing that keeps the account is another member connecting it from their own bank login, because the bank's SCA proves they also hold it (HH-06).
  The editable account-holder label plays no part.
- **Kept, and the screen lists them:**
  - accounts that also had a source from another member before the leave date, such as a joint account the partner also connected (HH-06);
  - manual accounts with no import from the leaver (any Owner can delete one by hand);
  - the leaver's categorisations, notes and splits on kept transactions, now attributed to the pseudonym;
  - transactions in other members' accounts that involve the leaver, such as a transfer to them. Those are the remaining members' own bank data.
- **Timing:** erasure runs 7 days after the request. During those days every member sees a banner listing the accounts that will be erased and the date. Others cannot cancel a leaver's own request. Any Owner can cancel a request an Owner started (re-authentication required). Erased data never goes to Recently deleted (SET-11). It is purged on schedule.
- **Recently deleted is included.** The choice also lists the leaver's sole-source accounts that are already in Recently deleted. When erasure runs, everything in Recently deleted within its scope is purged with it and can no longer be restored: the removed member's own entry, and deleted accounts, connection data and transactions from the accounts being erased.
- **Effect on figures:** erasure removes records, not money events that were already carried forward:
  - Every period's live results drop the erased transactions dated in it. A Settled period keeps its settle snapshot and shows "Changed since settled — member data erased", with settled and current figures side by side.
  - Rollover already carried into a later period, sinking-fund balances and late-adjustment lines are **not** changed by erasure. No new late adjustment is created.
  - The current period changes only by the erased transactions dated in it.
  - Net worth: erased accounts leave current and past net-worth figures, as with BANK — disconnect "delete data" (NW).
- **Links to erased items:** a transfer, refund or split whose linked transaction was erased keeps its amount and category on the remaining side, loses the link, and appears once in the review inbox as "Linked transaction erased". It never becomes income or spending without a member's action.
- **Check** (a tester can repeat it): settle period P. Note its settled result, the rollover carried into the current period C, every sinking-fund balance, and C's left to spend. Then erase a former member's sole-source account with transactions in P and in C. All of those transactions are flexible spending (no income, fixed, non-monthly or transfer items), so each one changes left to spend by exactly its amount. Expected:
  - P's settled figures are unchanged. P's current figures differ by exactly the erased transactions dated in P, and P shows "Changed since settled — member data erased".
  - C's carried rollover line and every sinking-fund balance are unchanged, and no late-adjustment line appears.
  - C's left to spend differs by exactly the erased transactions dated in C.
  - From M3, when net worth exists: the erased account is gone from net worth and its history.
- **What the screen promises,** which is also what a tester checks: the member's name and email no longer appear anywhere the app shows a **member**, and the listed accounts and their data are gone. The screen also says what erasure does **not** touch:
  - text that other members' banks or other members wrote, which may still contain the name (descriptions such as "Transfer to Anna Kowalska", counterparty names, notes, tag, rule and category names);
  - copies exported earlier;
  - a pseudonym, which does not hide who someone was in a small household.
  Searching transactions for the name may still find such text. Members can edit their own notes, tags and rules by hand.
- After it runs, the data is gone from the live app at once and from backups within 30 days (NFR-11). The audit log records request, cancellation, execution and scope (counts), but not the erased data.
**Depends on:** BANK — disconnect "delete data"; BUD/INS — settle snapshot, "Changed since settled" and carried values; TXN — links; CAT — review inbox; NW
**Notes:** The check has a defined expected result. The scope is fixed to sources before the leave date, so a CSV import after leaving can't pull an account out of scope. The promise is limited to what can be tested.
Erasure is a Must in M2 because settle snapshots and links arrive in M2. In M1 the fallback is leaving plus deleting data per account (BANK — disconnect). Legal context, not legal advice: [GDPR Recital 18](https://gdpr-info.eu/recitals/no-18/) excludes processing "by a natural person in the course of a purely personal or household activity", but GDPR still "applies to controllers or processors which provide the means" for it (e.g. a hosting provider). No legal duty on the household to erase was found, so this is a trust feature. It is the one deletion that skips Recently deleted (SET-11). The 7-day wait is kept so a co-holder can rescue a joint account. [Art. 17](https://gdpr-info.eu/art-17-gdpr/) asks for erasure "without undue delay". Data is kept when it is also another member's because [Art. 20(4)](https://gdpr-info.eu/art-20-gdpr/) says a data subject's rights "shall not adversely affect the rights and freedoms of others".

---

### 4.3 Bank connections (BANK)

How each member links their bank logins through Enable Banking, how data keeps flowing within PSD2 limits, and how the household finds out when a connection is broken, expiring or out of date. Everything is in-app, because there are no notifications. Covers: each member's own Enable Banking setup (restricted mode), connect, the one-shot first history import, scheduled and manual sync, freshness, connection health and early revocation, expiry and re-consent, disconnect, and joint accounts seen through two logins. Account-level display is in ACC. Transaction handling is in TXN.

Facts this area relies on (sources):
- Enable Banking (EB) returns a per-bank maximum consent length. For most banks it is 180 days ([EB FAQ](https://enablebanking.com/docs/faq/), [EB changelog Jul 2023](https://enablebanking.com/blog/2023/08/20/changelog-july-2023)), following the 180-day SCA renewal in [Delegated Reg. (EU) 2022/2360](https://eur-lex.europa.eu/eli/reg_del/2022/2360/oj).
- Without the user's active request, access is limited to 4 fetches per 24 h unless the bank agrees more. With an active request there is no such limit ([RTS Art. 36(5), Reg. (EU) 2018/389](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32018R0389); EB: "many ASPSPs have the limit of 4 times a day for data fetches when PSU … is not online", [EB FAQ](https://enablebanking.com/docs/faq/)). An "active request" means "the PSU being in session at the time of the request and proactively performing an action". The EBA excludes refreshing automatically whenever the user opens the app ([EBA Q&A 2018_4172](https://www.eba.europa.eu/single-rule-book-qa/qna/view/publicId/2018_4172)). The PSU of a connection is the member who gave the consent.
- Full history is often available only for a short time after the initial authorisation: "generally around one hour" per [EB FAQ](https://enablebanking.com/docs/faq/), or 5 or 45 minutes depending on the bank per [TrueLayer](https://support.truelayer.com/hc/en-us/articles/360025818054). After that, many banks return only 90 days. EB does not say whether a later authorisation reopens the window. Linking an account in the EB Control Panel is a separate bank authorisation from the app's own ([EB linked accounts](https://enablebanking.com/docs/api/linked-accounts/)), so the app's connection may not be the first one → SPIKE-01.
- Sessions can expire early. EB returns the same "expired session" error as for normal expiry. Known causes include banks that don't allow several concurrent sessions per user ([EB FAQ](https://enablebanking.com/docs/faq/)). EB's public docs mention no push notification on revocation, so the app finds out at its next sync attempt.
- Restricted mode (EB terms, updated 9 Jan 2026, re-read 15 Oct 2026, [EB terms](https://enablebanking.com/terms)): production use "is limited to Linked Accounts and is available solely for evaluation purposes or for the personal use of private individuals". The terms grant no right to access "account information that does not belong to the Control Panel user who associated the Linked Accounts with the application accessing them". "The number of Linked Accounts per Application may be limited." A user may not "make accessible to any third party" the Control Panel or the API. Linking happens in the Control Panel and "won't handle authorization on behalf of the app" ([EB linked accounts](https://enablebanking.com/docs/api/linked-accounts/)). Only linked accounts can be fetched ([EB FAQ](https://enablebanking.com/docs/faq/)). Consequence: one member cannot link another member's personal accounts. Each member links their own accounts under their own EB registration. Whether EB accepts several members' registrations feeding one household app → SPIKE-01 gate G1.
- EB defines transaction statuses BOOK, PDNG, HOLD, SCHD, OTHR, CNCL and RJCT. It describes its transaction reference as "unique and immutable for accounts with the same identification hashes", and an account's identification hashes cover several numbers for one account, "e.g. IBAN and BBAN" ([EB API reference](https://enablebanking.com/docs/api/reference/)). Per [EB FAQ](https://enablebanking.com/docs/faq/), however, references are "in most cases" given only for booked transactions, and some banks "provide duplicate values". Which banks use which statuses and identifiers is **unverified** → SPIKE-01.

#### BANK-01 Connect a bank · Must · M1
As a Member, I want to connect my bank login and choose which of its accounts to add, so that the household gets my transactions without manual entry.
**Acceptance criteria**
- "Connect a bank" works only for a member whose own Enable Banking setup is in place (BANK-16). Without it, the button leads to the setup guide (BANK-16) or to the CSV path (BANK-02).
- The member picks a country, then searches the bank list by name. Before going to the bank, the app shows the bank's maximum consent length, that the bank will ask for SCA, and what data is read (accounts, balances, transactions, read-only). It also shows: "Link this bank in Enable Banking and connect it here in the same sitting. Banks often release older history only for about an hour after an approval." (BANK-04)
- Starting a new connection requires re-authentication in the app (see AUTH — re-authentication).
- After SCA, the member sees every account the bank returned. For each one: the bank's name for it, a masked account number if provided, currency, and account type if provided. Each account is pre-selected, and the member can untick any they don't want. The step says: "Missing an account? Link it in your Enable Banking setup first (BANK-16)."
- For each added account the member sets the account holder (a member or Joint). It defaults to the connecting member. If the bank marks the member as a co-holder, Joint is suggested instead (Depends on SPIKE-01).
- If the member cancels at the bank, or SCA fails, the app shows "Connection not created" with the bank's reason if one was given. No connection or account is created, and the member can try again straight away.
- An account already in the household (BANK-15 matching) is not added twice. The app says "Already in your household as <account name> — this connection will also keep it updated."
**Depends on:** SPIKE-01 (account type, co-holder flag, masked number availability); AUTH (re-authentication); HH (account holder)
**Notes:** One connection = one consent for one bank login. A member with two logins at the same bank makes two connections. The member who gave the consent is the **connection holder** (HH term).

#### BANK-02 Bank not available · Must · M1
As a Member, I want a clear path when my bank can't be connected, so that my accounts are still tracked.
**Acceptance criteria**
- The app offers "Create a manual account and import a CSV file" (see ACC — manual accounts; TXN-21) when any of these apply: the bank isn't in the list; a connection attempt fails for a reason that won't go away (bank unsupported); the member has no Enable Banking setup and chooses not to create one; or the member's linked-account limit is reached (BANK-16).
- The bank search shows "Can't find your bank?", which leads to the same path.

#### BANK-03 Consent length, expiry date and countdown · Must · M1
As a household, we want each connection to last as long as the bank allows and to see well ahead when it ends, so that we re-consent rarely and without a data gap.
**Acceptance criteria**
- Each new consent and each re-consent asks for the maximum length the bank allows. If a bank grants less than 180 days, the shorter date is shown and nothing else changes.
- Each connection shows its consent expiry date on the Connections page, on the connection's page, and in the connection section of each of its accounts' detail.
- On each of the last 14 days before expiry (or from the day of consent, if the bank granted less than 14 days), the connection screens show "Expires in N days", and the global header note on every screen shows it, more prominently in the final 3 days. No account row, card or figure gets an expiry marker.
- Expiring soon is not stale. A connection that is only expiring doesn't make any account or figure Stale.
- When several of one member's connections expire within the same 14 days, the connection screens group them per member, e.g. "Ola: 3 banks to renew by 12 Apr". Renewing early is allowed (BANK-12).
- After expiry, the connection moves to Needs re-consent (BANK-10).
- Every member sees the countdown. Only the connection holder gets "Renew" (BANK-12). Other members see "Only <name> can renew this" and "Copy renewal link", which they can pass on themselves (AUTH — low-friction re-consent).
**Notes:** The 14-day criterion turns the metric "every consent expiry visible in-app ≥14 days before lapse" into a check.

#### BANK-04 First full-history import · Must · M1
As a Member, I want the app to fetch as much history as my bank allows right after I approve the connection, and to make sure that finishes, so that the household has history for budgets and reports from day one.
**Acceptance criteria**
- The import starts within 1 minute of the member returning from the bank. It carries on if the member closes the page or signs out.
- Every new connection asks the bank for the longest history it will give. The app never assumes its own connection is the first approval for the account: linking the account in Enable Banking came earlier.
- A progress view shows, per account: status (waiting / importing / done / partial / failed), number of transactions fetched so far, and the oldest date reached. The view can be reopened from the connection until the import is finished.
- If fetching fails while older history may still be available, the app keeps retrying until that time is over. The progress view shows "Retrying — next attempt at HH:MM. Older history may stop being available around HH:MM." The connection holder can press "Retry now". The time limit is the bank's value from SPIKE-01, otherwise 60 minutes after the approval ([EB FAQ](https://enablebanking.com/docs/faq/)).
- While the first import is unfinished, its retries come before scheduled syncs for that connection, because the history window can't be repeated. Scheduled syncs for the connection wait until the import ends. If the bank answers "too many requests", the next retry follows the bank's indicated wait if it falls inside the window, otherwise the app tries once more just before the window closes.
- An account is "done" only when every part of its history came back without error. Otherwise it is "partial" (BANK-05). The app never shows a partly fetched history as complete.
- Members can use the app during the import. Imported transactions appear in the list as each account finishes.
- A re-consent or a second connection to an account that already has history does not repeat the first import. It only fills the gap since the last successful sync (BANK-12, BANK-15).
**Depends on:** SPIKE-01 (history depth, window length per bank, which approval opens the window: gate G13)
**Notes:** EB has a "longest" fetch option that "tries to find the longest possible period of transactions" ([EB API reference](https://enablebanking.com/docs/api/reference/)). Hints for technical design: fetch history older than 90 days first, because the last 90 days can be fetched later and older history may not. Spread retries across the window.

#### BANK-05 Partial first import and backfill · Must · M1
As a Member, I want to see exactly what history I got and how to fill the rest, so that gaps are never hidden.
**Acceptance criteria**
- When the import ends, a summary shows each account with its history coverage ("from 14 Mar 2024 to today") and status. If an account is partial or failed, the summary gives the reason in plain words (for example "the bank only returned the last 90 days" or "the bank returned an error").
- For an account with less history than the household wants (anything short of 12 months, or an error), the summary offers:
  (a) "Import older history from a CSV file", with the missing date range pre-filled (TXN-21);
  (b) "Try again with a new bank approval". This runs a fresh SCA, and the app says it may not work. The option is hidden for banks where SPIKE-01 showed it doesn't (G13).
- Coverage and any gaps stay visible later on the account (ACC-13).
- Because history beyond the bank's normal depth may never be fetchable again, the connection page shows "First history not in a backup yet" until the first backup that includes the import has finished, and then "First history backed up on <date>" (backup: see NFR/SET).
- If an account failed completely, normal sync (BANK-06) still fetches its last 90 days, and the summary says so.
**Depends on:** SPIKE-01 (whether a fresh SCA reopens extended history: G13)

#### BANK-06 Scheduled sync · Must · M1
As a household, we want new transactions and balances fetched automatically several times a day, so that numbers are current without anyone pressing a button.
**Acceptance criteria**
- Each connection syncs automatically 3 times per 24 hours, keeping 1 of the bank's 4 unattended fetches for the holder's refresh (BANK-07). Where SPIKE-01 shows a bank doesn't count the holder's refreshes (G10), it syncs 4 times. Where a bank allows fewer, it syncs less often.
- Syncs are spread through the day, and one of them finishes before 07:00 in the household time zone (SET).
- Each sync fetches balances and new or changed transactions (including pending, where provided) for every account in the connection.
- If a bank answers "too many requests", the app doesn't retry before the next scheduled slot. The connection shows "Bank limited updates — next update at HH:MM". The first import is the exception (BANK-04).
- The connection page shows the times of the last 24 hours' scheduled syncs and the next one, so the schedule can be checked.
- Scheduled syncs are the only automatic fetches. Opening the app doesn't fetch anything: an automatic refresh on opening the app is not an active request ([EBA Q&A 2018_4172](https://www.eba.europa.eu/single-rule-book-qa/qna/view/publicId/2018_4172)), so it would use up the 4 unattended fetches.
**Depends on:** SPIKE-01 (actual per-bank limits); SET (time zone)

#### BANK-07 Manual refresh · Must · M1
As a Member using the app, I want to refresh my connections now, so that I see a purchase I just made.
**Acceptance criteria**
- "Refresh now" is shown on each connection the signed-in member holds, and "Refresh my connections" on the Connections page.
- A member can't refresh another member's connection, because only the connection holder's own action is an active request (facts above). On another member's connection the app shows when it last updated and when the next automatic update is due. A joint account that the member also connected can be refreshed through their own connection.
- A refresh shows progress and then the result: "Updated — 3 new transactions", or the error in plain words.
- Each connection can be refreshed manually at most once every 10 minutes. Until then, the button shows when it will next be available.
- At a bank that counts the holder's refreshes against its daily limit (the default until G10 says otherwise), the holder has 1 refresh per 24 hours (BANK-06). The button shows "1 refresh left today" or when the next one is available.
**Depends on:** SPIKE-01 (whether banks honour "user present")

#### BANK-09 Freshness: last synced and stale state · Must · M1
As a household, we want every account and every number built from it to say how up to date it is, so that we never act on old data without knowing it.
**Acceptance criteria**
- Every connected account shows "Updated <relative time>", the time of its last successful sync. A failed sync doesn't change it.
- A connected account is **Stale** when its last successful sync is older than the staleness threshold (SET), or when its connection needs re-consent (BANK-10). A joint account kept fresh by two connections follows BANK-15.
- Which manual accounts can be Stale, and when, is set by ACC-13. The stale marker and the warnings below apply to them in the same way.
- A consent that is only expiring (BANK-03) doesn't make anything Stale.
- A stale account shows a stale marker with the reason and the time since it was last updated. The marker appears on the account, in the account list and on its transactions view.
- Any figure computed from one or more accounts (left to spend, forecast, net worth, reports, recurring-item status) takes the worst freshness of its inputs. If any input is stale, the figure shows a stale warning that names the stale accounts and links to the fix (renew, refresh or import). Each owning area places the warning (BUD, FC, NW, INS, REC).
- The Connections page always shows overall freshness: the oldest "Updated" or "Data up to" time (ACC-13) among accounts included in the budget. From M2 the landing page (INS-06) shows it too.
**Depends on:** SET (staleness thresholds, time zone); BUD, FC, NW, INS, REC (where they show the warning)

#### BANK-10 Connection health, early revocation and lapse · Must · M1
As a household, we want a broken connection detected and shown as soon as the app can know, and to see how long we have before history is lost, so that we fix it before numbers drift or data is gone.
**Acceptance criteria**
- Each connection has one status: **Healthy**; **Syncing**; **Expiring soon** (BANK-03; counts as Healthy for freshness); **Needs re-consent** (the bank or the bank-data provider says the consent is expired, revoked or invalid); **Bank problem** (temporary errors such as an outage or a timeout); **Disconnected** (BANK-14); **Paused — member removed**: the holder was removed from the household, so the connection doesn't sync and no banner asks anyone to renew it. Its accounts are Stale (BANK-09). If the member is restored (SET-11), the connection stays paused until that member taps "Resume my connections" (re-consent if the consent lapsed meanwhile, BANK-12).
- Early revocation (password change, consent revoked in the bank app, a bank-side reset, a bank allowing only one active session per login) is detected at the next sync attempt: a scheduled sync (BANK-06) or the holder's refresh (BANK-07). The app gets no other signal.
- On detection the connection moves to Needs re-consent, and all its accounts become Stale immediately, whatever the threshold says. A banner on every screen names the bank and the connection holder: "Monika's mBank connection stopped working on 3 Mar — Monika needs to renew it." The holder sees "Renew". Other members see "Only Monika can renew this" and "Copy renewal link" (BANK-03).
- The banner lists likely causes in plain words, including "connecting the same bank login in another app can end this connection at some banks" ([EB FAQ](https://enablebanking.com/docs/faq/)).
- From the first day in Needs re-consent, the banner shows how long the connection has been broken and "Renew within N days to avoid a gap in history". N = the bank's history depth without a fresh window (90 days unless SPIKE-01 says otherwise) minus the days broken. At 0 the banner says "History from <date> will be missing unless you import it from a CSV file."
- If renewal happens after more history was lost than the bank returns, each account shows the exact missing date range and offers CSV backfill for it (TXN-21).
- Bank problem: the connection keeps retrying on its normal schedule. Past the staleness threshold, its accounts become Stale. After 1 day of failures, the connection says "May need renewing" and offers re-consent (SPIKE-01, G9: revocation wasn't tested, so the conservative 1 day applies).
- While the connection is in Needs re-consent, the banner can't be dismissed. It can be collapsed to a small badge in the header.
- If the holder can't renew for a long time (away, ill), nothing new is offered. The accounts stay Stale. Periods can be closed with Settle now (BUD), which states what's missing. An Owner may disconnect with "Keep data" (BANK-14): the accounts become manual and the banner stops. The holder later reconnects through BANK-16, and TXN-10 removes the overlap.
**Depends on:** SPIKE-01 (whether revocation can be told apart from temporary errors: G9; history depth); AUTH (renewal link)
**Notes:** With no notifications, this banner and the renewal link a member passes on are the only signals. A holder who rarely opens the app learns about it from the other member.

#### BANK-12 Re-consent · Must · M1
As the connection holder, I want to renew a consent in as few steps as possible and keep all history and edits, so that renewing every ~6 months is painless.
**Acceptance criteria**
- Re-consent is available at any time, not only near expiry, and resets the expiry date. Only the connection holder can start it.
- It needs no extra in-app re-authentication beyond an active session, and goes straight to the bank's SCA (AUTH — low-friction re-consent).
- On return, an account is re-attached automatically only when the bank returns the same full account identifier as before (BANK-15 matching). In any other case (masked card number, no identifier, changed identifier) the app asks "Is this <existing account>?" with the likely account pre-selected. It never adds a second copy of an account silently.
- If the renewal returns none of the connection's accounts, nothing is attached. The app says "These accounts don't belong to this connection. Did you sign in to a different bank login?"
- Accounts the bank now returns that the household doesn't have appear as "New accounts found", unticked by default. Accounts the bank no longer returns show "No longer available from this connection" (ACC-09).
- When a new account has the same type and currency as one that is no longer available (for example a reissued card), the app asks "Is this the replacement for <account>?" Yes adds the replacement link (ACC-09), so history continues. Until the holder links the new account in Enable Banking and renews, the old account stays Stale or "No longer available".
- After re-consent the app fetches everything since the last successful sync. Transactions are de-duplicated as in TXN-10, and no history, category or edit is lost.
**Depends on:** SPIKE-01 (identifiers stable across re-consent; how cards are identified); AUTH (re-consent)

#### BANK-14 Disconnect · Must · M1
As an Owner, or the connection holder, I want to disconnect a bank and choose what happens to its data, so that I control what stays.
**Acceptance criteria**
- Disconnect requires re-authentication (see AUTH). The member chooses one of two options:
  - **Keep data**: the accounts stay with all transactions and edits. Each becomes a manual account marked "Disconnected on <date> — not updating", with an end date equal to its last data date (ACC-09). The member then chooses per account whether it stays included in the budget and net worth (default: stays included) or is archived (ACC-09). For an account that stays included in the budget, the confirmation says: "Spending on this account after <date> won't be counted unless you import it or reconnect. Exclude it from the budget instead?" Figures covering dates after its last data then show "Not updating since <date>: <account> — may be off" (BUD-02). Its end date means it never blocks settling.
  - **Delete data**: the connection's accounts, transactions, balances and edits are removed. The confirmation states how many transactions will go and that past budget periods and reports will change. The member must type the bank name to confirm. The deleted data goes to "Recently deleted" (SET-11), where any Owner can restore it for 7 days before it is purged. Restored data comes back as accounts disconnected with "Keep data", and its transactions go through TXN-10's duplicate check.
- In both cases the app ends its access at the bank-data provider. It tells the member they can also unlink the accounts in their Enable Banking setup and check in the bank's own app that access is gone. Whether ending access also revokes the consent at the bank is unverified (Depends on SPIKE-01), so the message doesn't claim it.
- If an account is also kept fresh by another member's connection (BANK-15), disconnecting removes only this connection's link. The account and its data stay.
- If the same bank login is connected again later, accounts kept with "Keep data" are offered for re-attachment by BANK-12's rule. Once re-attached, they update again and their end date is cleared. The time in between shows as a coverage gap (ACC-13), and the bank fills it as far back as it allows.
- Only an Owner or the connection holder can disconnect (see HH — roles). "Delete data" is offered only to Owners. A Member who holds the connection disconnects with "Keep data", and an Owner can then delete the kept accounts (HH-02). Every disconnect is recorded in the audit trail and shown to all members as a household event. An Owner disconnecting with "Keep data" is also the exit when the holder can't renew (BANK-10).
**Depends on:** SPIKE-01 (does ending access revoke the consent at the bank: item 21); AUTH (re-authentication); HH (roles, member leaving)

#### BANK-15 Joint account connected from two logins · Must · M1
As a household, we want an account both partners can log into to appear once and stay fresh while either consent is valid, so that it is neither double-counted nor stale without reason.
**Acceptance criteria**
- Automatic match: two accounts from different connections are the same account when they are at the same bank and have the same full account identifier. Spaces and letter case are ignored. An account's IBAN and its domestic account number count as the same identifier (EB lists both forms in an account's identification; see facts). The member is told about the match.
- Masked numbers (for example "**** 1234") and accounts without a full identifier are never matched automatically. If an account at the same bank has the same currency and at least 5 identical transactions in the last 30 days, the app suggests "This looks like <account> — same account?" A member confirms or rejects. A rejected suggestion is not made again, but a member can still merge the two accounts by hand later ("Same account as…", HH-06), and undo it.
- A merged account shows "Kept up to date by: Michał's connection, Monika's connection" and which connection delivered the last update.
- The account is not Stale while at least one linked connection is healthy and within the staleness threshold. When all linked connections have lapsed, it becomes Stale (BANK-09).
- A lapsed connection still shows its own status and banners. The banner adds "<account> is still updated through <other member>'s connection".
- Each transaction appears once. The same transaction delivered by both connections (the same identity key as TXN-10, counted as in TXN-10) is merged automatically, because both connections read the same account. Only transactions whose details differ between the two logins become possible duplicates (TXN-10). A transaction only one login returns is kept.
- Each transaction keeps the bank details from the connection that first delivered it. Member edits always win (TXN-04).
- A member can unmerge a wrongly merged account. Each transaction goes back to the connection that delivered it, with its edits. Both accounts keep the merged account's settings (name, holder, type, include toggles). If a connection never delivered any transactions, its account starts with the history that connection can fetch now, and the gap shows in coverage (ACC-13).
**Depends on:** SPIKE-01 (G8: same identifier from both logins; same transaction identifiers from both logins); HH (joint accounts, Joint holder)
**Notes:** EB describes its transaction reference as stable "for accounts with the same identification hashes" ([EB API reference](https://enablebanking.com/docs/api/reference/)), but banks may not provide it. Hint for technical design: let one connection sync a joint account and switch to the other when it lapses, which saves each bank's unattended allowance.

#### BANK-16 Each member's own Enable Banking setup (restricted mode) · Must · M1
As a Member who brings bank accounts, I want to connect them through my own Enable Banking registration, so that the household gets my data within Enable Banking's terms.
**Acceptance criteria**
- While the app runs in restricted mode, a member connects banks only through their own Enable Banking registration. They create and hold it themselves, and add it to the app themselves. Adding or replacing it requires re-authentication (AUTH). The app never fetches one member's accounts through another member's registration.
- A member without a registration who presses "Connect a bank" sees a setup guide in this order: (1) create your own Enable Banking registration; (2) add it to the app; (3) for one bank at a time, in the same sitting: link its accounts in Enable Banking (the bank asks for SCA), connect it in the app straight away, and wait for the first import (BANK-04) before starting the next bank. The guide says why: the bank may release older history only for about an hour after linking (G13). It also offers "Use CSV files instead" (BANK-02).
- Setup can be resumed. The Connections page shows each member's progress: registration added; banks connected (the app can't see links made in Enable Banking). It offers "Continue setup" to that member. The household's setup shows as "Partial" until every member who brings accounts has finished or chosen CSV. Another member can see the progress and explain the steps, but can't act for them.
- An account appears only after its own holder has linked it in their registration. This includes accounts opened later and reissued cards. The account step and the connection page say: "Only accounts you linked in your Enable Banking setup are shown. New account or new card? Link it there, then renew this connection." The renewal then offers it as a "New account found" or as a replacement (BANK-12).
- A joint account can be linked by either holder (Depends on SPIKE-01, G1).
- If Enable Banking's limit on linked accounts is reached, the guide says so and offers CSV for the remaining accounts (BANK-02).
- CSV is a stated reduced mode, not an equal path. A member who uses CSV only has manual CSV-fed accounts (ACC-04). The app says that the account holder, who alone has the bank login, must export and import once after each period's settling window ends, with a file that reaches at least that date. Each such account shows "Import due for <account>" when its "Data up to" passes the manual threshold, and "Waiting for <account> data up to <date>" while a period waits for it (ACC-13, INS-23). Like every other account, these accounts appear in every household figure.
**Depends on:** SPIKE-01 (gate G1 and checklist item 17: the linked-account limit; a second member's registration end to end, only if one is added; G13: how long after linking the window stays open); AUTH (re-authentication); SET (where the registration is added); HH
**Notes:** Basis: the EB terms quoted in the facts above. A commercial agreement with EB would remove this setup and the linking step. It is out of scope for a private household. If the app ever leaves restricted mode, this requirement and its messages go away.

#### BANK-18 Connection history · Should · M1
As a Member, I want to see recent syncs for a connection, so that I can tell whether a missing transaction is the bank's delay or the app's problem.
**Acceptance criteria**
- The connection page lists the last 30 syncs: time, scheduled or manual, result, number of new, changed and pending transactions, and any error in plain words.
- The list includes the first import (BANK-04) with its per-account coverage.

---

### 4.4 Accounts (ACC)

Every place money sits or is owed: connected bank accounts and manual accounts (cash, investment, property, vehicle, loan, mortgage, other). This area defines account types, what balance each account shows and why, archive and delete, balance history, the rule for when the bank's balance and the transactions disagree, and how history coverage is shown. Net worth totals are in NW. Investment holdings are Later. Currency handling is in TXN-24.

#### ACC-01 Accounts overview · Must · M1
As a Member, I want one list of all household accounts with their balances, so that I see where our money is.
**Acceptance criteria**
- Accounts are grouped by type (ACC-02). Each shows its name, account holder (member or Joint), balance in its own currency, the base-currency equivalent if the currency differs (TXN-24), and its freshness (BANK-09).
- Each account shows its balance label (for example "booked balance", "owed", "value as of 1 Mar") so the type of figure is never ambiguous (ACC-06, ACC-11).
- Group subtotals and the overall total are in base currency. If an input is stale, the subtotal says so.
- Archived accounts are in a collapsed "Archived" section (ACC-09).
- The list works at 360 px width without horizontal scrolling.

#### ACC-02 Account types · Must · M1 (manual types M2/M3, see ACC-04)
As a household, we want each account to have a type that says whether it is an asset or a liability, so that totals and net worth are right.
**Acceptance criteria**
- Types: current, savings, credit card, loan, mortgage, cash, investment, property, vehicle, other asset, other liability.
- Credit card, loan, mortgage and other liability are liabilities. All other types are assets.
- For a connected account, the type is pre-filled from the bank's account type if provided, otherwise "current". A member can change it at any time.
**Depends on:** SPIKE-01 (do banks report account type for cards and loans)

#### ACC-03 Account settings · Must · M1
As a Member, I want to name an account, set its holder, and choose what it counts towards, so that the household's figures match reality.
**Acceptance criteria**
- Editable: display name, account holder (a member or Joint — see HH), type, "Include in budget" (on/off), "Include in net worth" (on/off).
- Defaults for "Include in budget": on for current, credit card and cash, off for every other type. "Include in net worth" is on for all.
- An account that BUD-20 uses for sinking-fund money says so in its settings, and its "Include in budget" stays on. Turning it off first asks to turn off BUD-20's setting.
- From M2, when budget periods exist, changing "Include in budget" asks whether to apply it to the current budget period only or to past periods too. Past periods are recalculated only if the member says so. A Settled period then shows "Changed since settled".
- The bank's original account name stays visible on the account detail.
**Depends on:** BUD (which flows count towards the budget; settled periods); NW

#### ACC-04 Manual accounts · Must · M2 (cash) / M3 (investment, property, vehicle, loan, mortgage, other)
As a household, we want to track money the bank connection can't see, so that the budget and net worth are complete.
**Acceptance criteria**
- A member can create a manual account of any type in ACC-02, with name, holder, currency, and opening balance or value with its date.
- Cash and other spending-type manual accounts hold transactions entered by hand (TXN-20) or imported (TXN-21). Their balance = opening balance + transactions (ACC-12 applies).
- Investment, property, vehicle, loan, mortgage, other asset and other liability accounts hold dated values (ACC-05). Transactions on them are optional.
- A manual account created in M1 as a CSV import target (BANK-02, BANK-05, BANK-16) behaves as a cash-type manual account, except that it is CSV-fed: its freshness follows ACC-13's CSV-fed rule from M1 (SET-06 threshold, "Import due for <account>").
**Notes:** The milestone split is: manual/cash in M2, net worth in M3. The CSV-target case is in M1 for backfill and for members without an Enable Banking setup.

#### ACC-05 Manual values · Must · M3
As a Member, I want to update the value of a manual asset or liability, with its history kept, so that net worth tracks changes over time.
**Acceptance criteria**
- "Update value" records an amount and a date (default today). Earlier values stay in the account's value history and can be edited or deleted. A deleted value goes to "Recently deleted" (SET-11). Every change is recorded with who made it.
- Value-type accounts show "Value as of <date>" and are not marked Stale (ACC-13).
**Depends on:** NW (value history, revaluation)

#### ACC-06 Credit card balance shown · Must · M1
As a household, we want a credit card to show what we owe, so that it appears correctly as a liability.
**Acceptance criteria**
- The main figure for a credit card is **Owed**: the outstanding amount, shown as a positive number labelled "owed". In totals it counts as a liability.
- A second line shows "Available credit" and "Limit", if available.
- Source order for Owed: (1) a booked balance from the bank; (2) limit minus available credit, if the bank gives an available balance and the limit is known (from the bank or entered by a member), labelled "calculated from available credit"; (3) the balance calculated from transactions (ACC-12), labelled "calculated from transactions".
- If none of these is possible, the card asks a member to enter the current owed amount and treats it as a manual value until the bank provides one.
- The label always states which source is used.
- Credit limit: the bank's limit if provided, otherwise one a member enters in the card's settings. The "Limit" line says which.
- ACC is the only place the owed figure, the credit limit and their labels are defined. NW and FC show them as they are.
**Depends on:** SPIKE-01 (which balance types banks return for cards; is the limit exposed); NW (card liability)
**Notes:** Booked comes first because it reconciles with booked transactions. Available credit includes holds and changes with the limit, so it is a weaker measure of debt.

#### ACC-08 Loan or mortgage · Must · M3
As a household, we want loans and mortgages tracked even when the bank doesn't provide them, so that net worth includes our debts.
**Acceptance criteria**
- A member can create a manual loan or mortgage account with the outstanding balance and its date, and update it (ACC-05).
- A repayment to a tracked loan or mortgage counts as a fixed expense by default. If the loan account also shows the incoming payment, the two legs are paired (TXN-13), so the cost counts once. The loan balance changes only through value updates or bank data.
- If the bank exposes the loan, its balance is shown with the same source label rules as ACC-06 (booked balance first).
**Depends on:** SPIKE-01 (are loans exposed, and with which balance); CAT, BUD (repayment default); NW
**Notes:** Splitting a repayment into principal and interest is Later. The default keeps the budget simple: the whole repayment is the fixed cost the household plans for.

#### ACC-09 Archive and delete · Must · M1
As a Member, I want to put away closed accounts without corrupting totals, so that the account list shows only what's current.
**Acceptance criteria**
- **Archive** (for closed accounts): syncing stops for this account, and it leaves current totals from the archive date. The account gets an end date, shown as "Closed on <date>", equal to its last data date (a member can change it). An account whose end date is before a period's end never blocks that period from settling. Its history stays in past budget periods, reports and net-worth history. Its transactions stay searchable and editable. If the balance isn't zero, archiving warns "Balance is €X — it will leave net worth from today". Unarchive is possible at any time.
- **Delete**: only for manual accounts, or for connected accounts already disconnected with "Keep data". It needs an Owner and re-authentication. The confirmation states how many transactions will be removed and that past periods and reports will change. The account and its data go to "Recently deleted" (SET-11), where any Owner can restore them for 7 days.
- **Replacement**: a member can mark an account as the "Replacement for <account>" (for example a reissued card or a new account number). The old account gets an end date, and both accounts' history reads as one in balance history and reports. The link can be undone.
- Accounts the bank stops returning (BANK-12) are shown as "No longer available from this connection", with "Archive" or "Mark as replaced by…" as the suggested actions. They are never deleted automatically. Any member can make these account decisions. Only connection actions are reserved to the connection holder (BANK).
- An account that should count but not be seen in budgets or net worth uses the include toggles (ACC-03).
**Depends on:** AUTH (re-authentication); HH (roles); NW

#### ACC-10 Balance history recording · Must · M1
As a household, we want every account's balance recorded from the day it is added, so that balance history and net-worth trends exist later.
**Acceptance criteria**
- At every successful sync, each balance the bank returns is stored with its type and date. Each manual value is stored with its date.
- From M1, the account detail lists the recorded balances (date, balance type, amount, source: bank or member), newest first.
- For dates before the first stored balance, the daily balance is calculated backwards from the earliest bank balance using booked transactions, and marked "calculated".
- Every daily balance carries a label: **reported** (by the bank, a CSV balance column or a member), **calculated**, or **gap**. A calculation never silently bridges missing data: a balance that depends on a date range with no data (ACC-13) is labelled "gap". A calculated balance whose calculation includes an unresolved possible duplicate (TXN-10) is also labelled "may include a duplicate".
- A month shown from this history (ACC-11, NW) carries every label of the balances used for it, and is labelled "gap" if any of its days falls in a coverage gap. Example: "Mar 2024 · calculated · may include a duplicate".
- A value-type account (ACC-05) has no balance before its first recorded value. Those dates are labelled "No value before <date>", and NW shows that label rather than treating the account as zero.
- Stored balances are never overwritten by calculated ones.
- ACC is the single source of account balances, balance history (including the calculation backwards), their labels and the credit limit (ACC-06). NW, FC and INS use these figures and labels and don't work out their own.
**Notes:** M1 because balance snapshots can't be recreated later. The chart is ACC-11. Hint for technical design: on gap days, carry the last known balance and label it, rather than leaving a hole.

#### ACC-11 Balance history view · Should · M3
As a Member, I want a chart of an account's balance over time, so that I see trends and spot anomalies.
**Acceptance criteria**
- The chart shows the daily balance for a chosen range (30 days, 12 months, all). Bank-reported points look different from calculated ones.
- Points where a reconciliation gap was found (ACC-12) are marked, with the gap amount on hover or tap.
- Value-type manual accounts show a step chart of their values.

#### ACC-12 Reconciliation: bank balance vs transactions · Must · M1
As a household, we want to know when the bank's balance and our transactions disagree, so that a missing or duplicated transaction never hides inside our numbers.
**Acceptance criteria**
- Which figure is used where:
  - The current balance in account lists and net worth is the bank-reported balance (booked preferred, ACC-06). If the bank gives no balance, it falls back to the calculated balance, labelled "calculated".
  - Budget and spending figures use transactions only. Balances don't affect them.
  - The forecast's starting balance is the bank-reported balance (see FC).
  - Balance history uses reported balances where available and calculated ones in between (ACC-10).
- The account detail shows three figures side by side: the bank-reported balance; the balance calculated from transactions ("bank balance on <date> plus the N transactions since"); and the difference. A member can check the difference by hand.
- Each account has a setting "This bank's balance includes pending purchases". It is pre-set per bank from SPIKE-01: off for Erste, whose booked balance excludes holds. When it is on, pending transactions are included in the calculated balance, so card holds don't show as a gap. It isn't shown until pending transactions are imported (TXN-06, Later).
- Any non-zero difference is shown on the account detail. If the difference is at least 1 unit of the account currency (for example €1) and is still there after 2 consecutive successful syncs, the account also shows "Transactions don't match the bank balance by €X since <date>" in the account list, in the count on the Connections page (M1) and as a review inbox item (M2, CAT).
- The gap view lists likely causes the app can check: possible duplicates on this account, missing date ranges (ACC-13), pending transactions the bank may include, and edited or excluded amounts that don't affect the balance.
- The member resolves the gap by fixing duplicates, importing missing history, or adding a **balance adjustment** transaction. The adjustment shows in the transaction list, is labelled, and is excluded from the budget. Nothing is ever adjusted automatically.
- A gap of 1 unit or more can't be dismissed. It disappears only when the figures agree within that amount, through a fix or an adjustment.
- Manual cash accounts: "Count cash" records the actual amount. If it differs from the calculated balance, a balance adjustment is offered.
**Depends on:** SPIKE-01 (which balance types are returned; whether the booked balance includes holds; whether balances and transactions update at the same time); CAT (review inbox, M2); FC; NW
**Notes:** Hint for technical design: calculated balance = previous reported booked balance + booked transactions since (+ pending when the setting is on). The 2-sync confirmation avoids false alarms when a bank updates its balance before listing the transaction, so the gap is delayed by at most one sync. The 1-unit threshold stops rounding differences from raising an alert after every sync while keeping them visible on the account.

#### ACC-13 History coverage, "data up to" and manual-account freshness · Must · M1
As a Member, I want each account to show which dates have data, where it came from and how recent it is, so that I know whether the history is complete and current.
**Acceptance criteria**
- The account detail shows coverage as date ranges with their source. Example: "CSV import 1 Jan 2021–19 Dec 2023 · Bank 20 Dec 2023–today". Gaps appear as "No data 4 Apr–2 Jun 2024".
- Each gap offers "Import CSV for this range".
- Coverage updates after every import, sync, re-consent, restore and deletion.
- The account detail states where history starts and why, for example "History starts 14 Mar 2024 — the bank returned no older data", "— first CSV row", or "— account opened". INS uses this text (INS-03).
- Every account shows "Data up to <date>", a calendar date in the household time zone (SET), so it can be compared with a period's settling-window end. It says how recent the data is, not that it is complete:
  - connected account: the day of its last successful sync;
  - CSV-fed account: the latest date covered by any of its imports (an old backfill never moves it back). The import preview proposes the last row's date, and the member can correct it, for example to the statement's end date (TXN-21);
  - cash account: the latest of its newest transaction, its last "Count cash" (ACC-12), and its last "No more transactions up to <date>" confirmation.
- Which accounts can be Stale:
  - connected accounts per BANK-09;
  - CSV-fed accounts when "Data up to" is older than the manual-account threshold (SET-06). They also show "Import due for <account>";
  - cash accounts never, unless a member turns on "Track freshness for this account" in the account settings. When it is on, the account becomes Stale like a CSV-fed one. It offers "No more transactions up to <date>" (one tap) and "Count cash" to bring it up to date;
  - value-type accounts (investment, property, vehicle, loan, mortgage, other) are never Stale. They show "Value as of <date>" (ACC-05).
  A stale manual account shows the BANK-09 marker and warnings, with its fix.
- Settling: a budget-side account lets a period settle automatically only when both hold:
  - its data reaches the end of the settling window. For a connected account, that means a successful sync after the window ended. For a CSV-fed account, "Data up to" must be on or after the window end, so the holder imports once after the window ends; an earlier import leaves the period Provisional. A cash account never blocks unless it tracks freshness; then it needs "Data up to" on or after the window end, like a CSV-fed one;
  - it has no coverage gap inside the period. A gap is any stretch of the period with no data for the account, for example a CSV range never imported or a connection that lapsed past what the bank can return. History that starts during the period is not a gap ("History starts <date>"). A cash account's coverage has no gaps.
  An account with an end date never blocks a period that ends after it. While an account blocks, the period shows the reason from ACC: "Waiting for <account> to sync", "Waiting for <account> data up to <date>" (CSV-fed), "Waiting for <account> to be counted or confirmed" (cash that tracks freshness), "Missing data for <account> <date range>", or, for an account that is "No longer available" with no decision yet, "Waiting for a decision on <account>". Any figure covering a gap carries "Missing data for <account> <range> — may be off", shown like the uncertain-items line (TXN). BUD owns settling itself, and BUD, INS and FC show the gap line.
- After a restore from a backup (NFR/SET), coverage is re-checked for every account. The app lists each date range that is now missing. Ranges the bank can still return are fetched at the next sync. Ranges it can't are shown as "Lost in restore: <range>", with "Import CSV for this range".

---

#### ACC-14 "Something's missing?" on the account · Could · M2
As a member who isn't the connection holder, I want the account screen to tell me why a card or account might be missing and who can fix it, so that I don't have to guess or ask.
**Acceptance criteria**
- The account detail of every bank-fed account, and the Connections page, offer "Something's missing?".
- It explains in plain words: card spending can post days late (the freshness label shows the last sync, not that everything up to then is in); a new card or account appears only after the connection holder links it in their own Enable Banking registration and renews the connection; an account the bank stops returning shows "No longer available from this connection".
- It names the connection holder and the connection, for example: "A new card or account appears only after Ola links it in Ola's Enable Banking registration and renews the mBank connection."
- It shows the same text BANK-16 shows the holder, so both members read the same explanation.
**Notes:** Backs J-11 step 2. Could, because J-11 can be completed without it: the member asks the holder, who sees the same text in BANK-16.

### 4.5 Transactions (TXN)

The single list of every household transaction from banks, CSV files and manual entry. This area covers how transactions are matched as they move from pending to booked, how duplicates are kept out without ever dropping a real transaction, and the date that decides a transaction's budget period. It also covers what members can do to a transaction (edit, split, tag, note, exclude, link as transfer or refund), CSV import and export, and currencies. Categorisation and rules are in CAT. How each flex type affects the budget is in BUD.

Principle for the whole area: **if unsure, show it and flag it** ("possible duplicate", "check this match", "the bank may have corrected this"). Never drop or merge silently. Each flag takes one tap to resolve. Flags go to the **review area**: in M1 that is a filter (TXN-02) plus counts on the Connections page and the account, and from M2 the review inbox (CAT).

**Uncertain items**. These are transactions that count in totals as they are, but may be wrong:
- a possible duplicate (TXN-10);
- a pending that may have booked or changed (TXN-07);
- one the bank may have corrected (TXN-10);
- one no longer reported by the bank (TXN-09);
- a pending that disappeared but hasn't been matched or expired yet (TXN-07);
- an unconfirmed suggested transfer leg (TXN-13);
- one with an unusual bank status (TXN-06).
Any total that includes uncertain items shows "Includes N uncertain items (<amount>) — may be off", linking to the list of them. TXN defines the states. BUD, INS and FC show the line.

**Hiding and deleting**. Removing a transaction (a duplicate, an old version the bank corrected, one no longer reported, or a member's "Remove") hides it, and excluding it (TXN-19) keeps it out of the budget. Neither is a delete: the transaction stays restorable from the list's filters with no time limit. **Delete permanently** is a separate action on one or more selected transactions, for Owners only, after re-authentication (AUTH-10). Undoing a CSV import (TXN-21) is the exception: any member can undo an import they made, and an Owner any import. The confirmation states how many transactions go and that past periods and reports will change. Deleted transactions go to "Recently deleted" (SET-11), where any Owner can restore them for 7 days, and are then purged. Restored transactions go through TXN-10's duplicate check (SET-11). If one side of a transfer or refund link is erased (HH-08), the other side keeps its category, the link is dropped, and one review inbox item "Linked transaction erased" is raised (CAT). A permanently deleted bank transaction is not imported again at later syncs. The app keeps only a minimal fingerprint of it for this, and erasing a member (HH-08) also drops that member's fingerprints.

#### TXN-01 Unified transaction list · Must · M1
As a Member, I want one list of all household transactions, so that I can see and review everything in one place.
**Acceptance criteria**
- The list shows transactions from all accounts, including archived ones, newest first, grouped by budget date (TXN-05).
- Each row shows: description (the member's edited description if set, otherwise the bank's), amount in account currency (and the original currency if different, TXN-24), account, category (once CAT exists), and markers for pending, scheduled, possible duplicate, transfer, refund, split, excluded, manual and CSV.
- Pending transactions look clearly different from booked ones.
- The list is usable at 360 px width. It loads progressively, with no "load all" step.

#### TXN-02 Search and filter · Must · M1
As a Member, I want to search and filter transactions, so that I find any transaction in seconds.
**Acceptance criteria**
- Free-text search matches the bank description, the edited description, counterparty name, notes and tags. Searching an amount (for example "12.50") matches that exact amount in any currency shown on the row.
- Each filter appears in the milestone that delivers its field. M1 ships date range, account, account holder, status, source and the M1 flags. Filters can be combined: date range, account, account holder (member or Joint), category, flex type, tag, status (pending / booked / scheduled / expired pending / cancelled), source (bank / CSV / manual), and flags (possible duplicate, check this match, the bank may have corrected this, no longer reported by the bank, one-leg transfer, unusual bank status, transfer, refund, split, excluded, edited by member, balance adjustment, removed as duplicate, pending may have changed, cancelled by the bank after booking, uncertain (any state in the list above), marked duplicate by hand, not a duplicate).
- The filtered view shows how many transactions match and their total in base currency.
**Notes:** Response-time targets are in NFR.

#### TXN-03 Transaction detail · Must · M1
As a Member, I want to see everything known about a transaction, so that I understand it and trust what the app did.
**Acceptance criteria**
- Shows every date the bank provided, each labelled (transaction date, booking date, value date), and says which one is the budget date (TXN-05).
- Shows the source: the connection and its holder, the CSV file name with its import date and the member who imported it, or the member who entered it.
- Shows the history: the pending → booked change with old and new amount and dates, and how it was matched (TXN-07); merges; transfer and refund links; and each member edit with who and when. A member who has left shows as HH defines for former members ("(former member)" or a pseudonym, HH-08).
- A "Bank data" section shows every field the bank provided, unchanged, including the bank's status.
**Depends on:** SPIKE-01 (which fields are populated); NFR (audit trail)

#### TXN-04 Member edits always win · Must · M1
As a Member, I want my edits to survive every later sync, so that I never redo work.
**Acceptance criteria**
- Members can edit: description, budget date (TXN-05), category, split, tags, notes, "exclude from budget", and transfer and refund links. They can edit amount and currency only on manual and CSV transactions.
- Bank-provided fields (amount, dates, bank description, status) update when the bank changes them. A field a member has edited is never overwritten by a sync, an import, a pending → booked match, a rule, or a switch between connections (BANK-15).
- If the bank changes the amount of a transaction a member has split or linked, TXN-07 / TXN-16 apply.
- Every edit records the member and the time (TXN-03).
**Depends on:** CAT (precedence: manual edit > rule > learned pattern)

#### TXN-05 Budget date rule · Must · M1
As a household, we want one clear rule for which budget period a transaction belongs to, so that periods don't shift because of bank processing delays.
**Acceptance criteria**
- The **budget date** of a transaction, in order of preference:
  1. a date the member set;
  2. the transaction date (when the purchase or payment was made), from any version of the transaction (pending or booked) or the CSV that provided one;
  3. the booking date;
  4. for a pending transaction with neither, the date the app first saw it.
- Once a transaction has had a transaction date, it keeps it even if a later version lacks one, so a purchase doesn't jump period when it books. If the booked version brings a transaction date the pending lacked, the budget date moves to it, and the detail says so.
- The value date is never used for the budget date.
- From M2, when budget periods exist, a transaction belongs to the period that contains its budget date (BUD, SET — payday anchor).
- The only automatic exception (from M2, with recurring-item linking in REC): when a payment is linked to a recurring-item occurrence, its period is decided at that moment. If the occurrence's period isn't Settled when the link is made, the payment counts there. Otherwise it counts in the period containing its budget date. Settling a period later never moves it. Only a member (setting the budget date, rule 1) or unlinking moves it. The row and the detail show "Counted in <period> (paid <date>)". Example: rent paid early on 28 Sep for the 10 Oct occurrence and linked on 29 Sep counts in October, and stays there when September settles.
- Example: a card purchase on 31 Jan, booked 2 Feb, belongs to the period containing 31 Jan. If the bank gives only the booking date, it belongs to the period containing 2 Feb. The detail view says "budget date = booking date (bank gave no purchase date)".
- A transaction that arrives after its period ended is placed in that period. TXN doesn't flag it, because bookings after period end are normal, especially at banks that show no pending. Until the period is Settled, late arrivals simply update it. After that, the period shows "Changed since settled" and rollover is not rewritten silently (BUD and INS own this).
- The two legs of a transfer keep their own budget dates. Where a pair counts in the budget (savings; loan repayment), it counts in the period of the leg on the account included in the budget. If both accounts are included, the outgoing leg decides.
- Balance history and reconciliation (ACC-10, ACC-12) use the booking date, not the budget date.
**Depends on:** SPIKE-01 (G6: how often banks give a transaction date, especially for cards); BUD (settled periods, transfer pairs); SET (budget period)
**Notes:** Why the transaction date: it matches the member's memory and receipts. A pending transaction and its booked version keep the same date, so they stay in the same period, and weekends or slow card booking don't move spending into the next period. Why not the booking date: it is always present and matches bank statements, but end-of-period card purchases would land in the wrong month, which is the case members notice most. Plaid makes the same split between authorised date and posted date ([Plaid](https://plaid.com/docs/transactions/transactions-data/)). A salary paid early (on the 28th for next month) is handled by the payday anchor (SET/BUD), not by this rule.

#### TXN-06 Pending transactions · Should · Later
As a Member, I want to see pending transactions and have them count against what's left to spend, so that a purchase from this morning is already reflected.
**Acceptance criteria**
- **Postponed by SPIKE-01 (G5).** Erste sends no pending transactions. Until a connected bank does and this is built, the app imports booked transactions only, and every bank counts as one that provides no pending transactions. Two criteria below still ship in M1: a booked transaction the bank later reports as cancelled or rejected, and the message for a bank that provides no pending transactions.
- Pending transactions are shown with a "Pending" marker and their current amount.
- By default they count towards spending and left to spend. Each figure that includes pending amounts says "incl. N pending". BUD defines how everything counts and shows the label.
- Members can categorise, tag, note, split and exclude pending transactions. TXN-07 carries these edits over to the booked version.
- A pending transaction that comes back in the next sync with the same account, amount, date and description is treated as the same pending transaction, and its edits stay. This holds even when the bank gives no stable identifier for pending items, and for a pending already matched to a booked transaction: it stays matched and is not stored again (TXN-07). Identical pending transactions are counted, not collapsed (TXN-10).
- How bank statuses are shown (EB statuses, facts above):
  - "pending" (PDNG) and "on hold" (HOLD): shown and counted as pending, and included in "incl. N pending";
  - "other" (OTHR): counted as pending and included in "incl. N pending". It is marked "Unusual bank status" and is an uncertain item. If it never books, it ends like any pending (TXN-07);
  - "scheduled" (SCHD): shown with a "Scheduled" marker and not counted until it books. When it books, the booked transaction replaces it and keeps its edits, matched as in TXN-07. If it never books, it ends like a pending (TXN-07); it never counted, so no total changes;
  - "cancelled" and "rejected" (CNCL, RJCT): they end a matching pending transaction (TXN-07). Otherwise they are shown struck through and not counted;
  - a booked transaction the bank later reports as cancelled or rejected stops counting, stays visible struck through, and goes to the review area as "Cancelled by the bank after booking". In a Settled period this is a late adjustment shown as "Changed since settled".
- If a bank provides no pending transactions, its accounts show "This bank doesn't show pending transactions — recent purchases appear after booking".
**Depends on:** SPIKE-01 (are pending transactions provided; do they keep an identifier; which statuses each bank uses; checklist item 10: does a booked transaction ever turn cancelled or rejected); BUD (how pending counts)
**Notes:** [EB FAQ](https://enablebanking.com/docs/faq/): transaction references are usually given only for booked transactions, so pending → booked matching can't rely on identifiers.

#### TXN-07 Pending → booked, and pending that never books · Should · Later
As a Member, I want a booked transaction to replace its pending version and keep my edits, and a pending that never books to stop counting but stay visible, so that I never lose work and never see a purchase twice without being told.
**Acceptance criteria**
- **Postponed with TXN-06** (SPIKE-01, G5).
- When a pending transaction books, the list shows one transaction: the booked amount, dates and bank description, with every member edit and any link to a recurring occurrence (REC) carried over (TXN-04). The detail shows "Was pending: €38.00 on 31 Jan → booked €42.00 on 2 Feb" and how it was matched, in words: "same bank reference", "same amount, booked 2 days later", "the only purchase that booked when the pending one disappeared — amount changed", or "matched by Monika".
- The app matches automatically only when exactly one booked transaction fits. It also flags "Check this match" in the review area when the amount changed by more than 20%, or when there were identical pending candidates with different member edits. A flag doesn't hold the match back.
- If the bank keeps reporting the pending after a fitting booked transaction appears, the app matches them automatically only when the amounts are the same. With a different amount, both may be real, so both count and both are flagged "Pending may have booked as …". The same applies to a new pending that fits a pending still reported ("Pending may have changed to …"). Once matched, by the app or a member, the pending the bank still reports is recognised and not stored again.
- If a pending that disappeared fits both a new pending and a booked transaction, the app doesn't choose: all count, and all are flagged.
- If the app can't tell which booked transaction a pending one became, it doesn't guess. The booked transaction appears as new, the pending one stays, both count, and both are flagged "Pending may have booked as …". One tap resolves it: "Same purchase" merges them as above, "Different" clears the flag. A purchase is never counted twice without this flag.
- A pending transaction can also change while still pending: the bank drops it and returns a new pending with a different amount, description or date (for example a fuel pre-authorisation replaced by the amount actually taken). The app treats the new pending as the same purchase when exactly one fits: the new amount counts, the edits carry over, and the detail shows "Pending changed: €500.00 → €212.00". The "Check this match" rule above applies. If the app can't tell, both stay, both count, and both are flagged "Pending may have changed to …"; one tap resolves it as above.
- Fuel test (must behave this way): sync 1 returns a pending €500.00 "ORLEN AUTH", and a member adds a note. Sync 2 returns a pending €212.00 "ORLEN 1234 WARSZAWA" on the same account and no €500.00. The result is one pending of €212.00 with the note, flagged "Check this match" because the amount changed by more than 20%. The €500 and the €212 are never both counted without a flag.
- Hold-persists test (must behave this way): sync 1 returns a pending €500.00 "ORLEN AUTH" with a note. Sync 2 returns the same €500.00 pending and a booked €212.00 "ORLEN 1234 WARSZAWA". Both count, both are flagged "Pending may have booked as …", and totals show "Includes 2 uncertain items (€712.00) — may be off". "Same purchase" leaves one transaction of €212.00 with the note. Sync 3 still returns the €500.00 pending: nothing new is stored and €212.00 is counted once. A €3.50 pending still reported next to its booked €3.50 is matched without a flag and is not stored again.
- Time runs only on what the app has seen. A pending transaction counts as gone only after a successful sync stops returning it. While a connection is broken, nothing expires and nothing is matched, and its accounts are Stale (BANK-09).
- A pending transaction becomes **Expired pending** if no booked transaction is matched within 3 days of the first successful sync that no longer returned it (SPIKE-01 calibrates the 3 days). It expires at once if the bank marks it cancelled or rejected. Until it is matched or expires, a pending that disappeared keeps counting and is an uncertain item.
- An expired pending transaction no longer counts in any total. It stays in the list, struck through, for 30 days. After that it is visible only with the "expired pending" filter. It is never deleted, and its edits are kept. If it had member edits, a review item asks "This pending transaction ended without a booked match — move your edits to another transaction?" and offers a manual match.
- A pending transaction the bank still reports after 14 days (for example a hotel or rental hold) keeps counting and is flagged "Pending for more than 14 days".
- If a split pending transaction books at a different amount, the split is kept. The difference goes into a new "Unallocated difference" part with the original category, and the transaction is flagged for review.
- Members can undo a match ("These are different transactions") or match by hand ("This is the booked version of…").
- Worked example (must behave this way): on 31 Jan a €38.00 pending "AUTH COFFEE BAR WAW" gets a note. On 3 Feb the consent lapses. It is renewed on 25 Feb, and the first sync returns a booked €42.00 "COFFEE BAR SP Z O O" (transaction date 31 Jan, booked 2 Feb) and no pending. The result is one transaction of €42.00 on 31 Jan with the note, matched as "the only purchase that booked when the pending one disappeared — amount changed". It is not flagged, because the change is 10.5%. From 3 to 25 Feb the €38 pending kept counting while every figure showed the stale warning. Nothing was counted twice.
- Two identical €3.50 "COFFEE BAR" pending transactions, one with a note, both book at €3.50: both are matched, and one of the booked transactions carries the note. If they book at different amounts, the app can't tell which one had the note, so the match is flagged "Check this match". The detail then shows each pending's amount and first-seen time, so the member can move the note.
**Depends on:** SPIKE-01 (does the pending item disappear when it books, and how long before the booked one appears; do amount, date or description change, including while still pending (checklist item 9); statuses used); CAT (review inbox, manual edit precedence)
**Notes:** Hints for technical design: a candidate is on the same account, in the same direction, booked 0–14 days after the pending's date, with either the same amount (or the same original-currency amount) or a pending that disappeared in the same sync, and with a similar description or counterparty. Tie-break: closest amount, then closest date, then oldest pending. A pending → pending candidate is a new pending on the same account, in the same direction, first seen in the sync that stopped returning the old one, dated within 3 days of it, with a similar description or counterparty; its amount may differ. Research: Plaid says pending and posted versions can differ in amount and name, usually take 1–5 business days and at most 14 days, and that matching is not always possible ([Plaid](https://plaid.com/docs/transactions/transactions-data/)). Monarch discourages editing pending transactions because edits may be lost ([Monarch help](https://help.monarch.com/hc/en-us/articles/28953573066260-Tips-Tricks-for-Using-Monarch)). Lunch Money users report edits lost on posting ([Lunch Money feedback](https://feedback.lunchmoney.app/bugs/p/pending-transaction-changes-lost-once-transaction-is-posted)). PocketSmith carries category, notes and labels over ([PocketSmith](https://learn.pocketsmith.com/article/256-pending-transactions-from-a-bank-feed)).

#### TXN-09 Bank changes or drops a booked transaction · Must · M1
As a household, we want to be told when the bank changes or stops returning a booked transaction, so that history never changes silently.
**Acceptance criteria**
- A known identifier that comes back with a different amount or date is handled by TXN-10 ("The bank may have corrected this"). Other bank fields that change on the same transaction (description, counterparty) are updated and shown in its history. TXN-04 still protects member edits.
- If a booked transaction stops appearing in bank data for a date range the bank still covers, it is not deleted. It is flagged "No longer reported by the bank", is an uncertain item, and stays in totals until a member removes it. Removal hides it, restorable (not a delete). The same applies when the bank returns fewer of several identical transactions than before.
- A booked transaction the bank later reports as cancelled or rejected: TXN-06.

#### TXN-10 Duplicates: identical transactions are kept, overlaps are flagged · Must · M1
As a household, we want two identical purchases to both be kept and overlaps between sources flagged rather than silently merged or dropped, so that we neither double-count nor lose a real transaction.
**Acceptance criteria**
- Within one account and one source (one connection or one CSV file), a transaction is the same as one already stored when their **identity keys** match:
  - booked, with a bank identifier: identifier, amount and booking date;
  - booked, without one: booking date, amount and bank description;
  - pending: TXN-06.
  BANK-15 uses the same key.
- TXN-07 handles a pending transaction that books (including at a new amount with the same identifier, such as a restaurant tip) before anything here. The rules below are for booked transactions only.
- Identical transactions are counted, never collapsed. If a fetch covering a date returns N identical transactions and the app has M, it adds N − M when N is larger, and never removes any (fewer: TXN-09).
- A known identifier that comes back with a different amount or date, in the same fetch or a later one, is kept as a separate transaction. If the bank still returns both versions, both are real and nothing is flagged. If the earlier version is no longer returned, both count and both are flagged "The bank may have corrected this". "Bank corrected it" keeps the new version and removes the old one (restorable). "Two transactions" clears the flag. The same applies when a booked transaction without identifier stops being returned and, in the same fetch, one with the same amount and booking date but a different description appears: they are flagged together as one "The bank may have corrected this" pair, not as "No longer reported" plus a new transaction.
- Tests (run on prepared bank data where no real bank behaves this way): (a) two €3.50 "COFFEE BAR" purchases on the same day, with the same reused identifier or none, synced 4 times and renewed once, end as exactly 2 transactions. (b) A booked €3.50 with identifier X, followed by a fetch that returns X at €4.50 and no €3.50, shows 2 flagged transactions that both count. "Bank corrected it" leaves 1 at €4.50.
- Sources that overlap: bank vs CSV, two connections to a joint account (BANK-15), manual vs bank. Across sources, merging is automatic only when certain: the same bank identifier for the same account with the same amount and date, or an exact match (account, booking date, amount, description) counted as above.
- A **possible duplicate** is a pair from different sources on the same account, with the same amount and dates within 3 days of each other, that isn't certain. The date compared is each side's transaction date if it has one, otherwise its booking date. A CSV file with a single date column gives each row that date as both (TXN-21). Both stay and both count in every total. They are uncertain items, so each affected total shows the uncertain-items line (above), and the pair goes to the review area. Pairs are formed one to one, nearest date first: three bank and three CSV coffees of the same amount give at most three pairs, never nine.
- Resolving shows both side by side. "Same transaction" merges them: the bank version's amount and dates are kept, along with the union of member edits (where both have a value for the same field, the member picks). "Not a duplicate" clears the flag for good for that pair.
- A manual transaction on a connected account that matches a later bank transaction is offered as "Match your entry to the bank transaction?" with the same merge behaviour.
- Members can mark any transaction "Duplicate of …" by hand, for duplicates the app missed. Removed duplicates are kept hidden: they can be restored, and they stop the same transaction being imported again from any source.
- Every duplicate decision is kept with its date and whether the app had flagged the pair first (yes/no): "Same transaction" (merged), "Duplicate of …" (marked by hand), "Not a duplicate", and undoing a merge. The household can filter and count them (MET-08).
**Depends on:** SPIKE-01 (G7: identifiers missing, unstable or reused; are identifiers stable across logins and sessions); CAT (review inbox)
**Notes:** Content-hash duplicate detection (as in Firefly III's "content-based" mode, [Firefly III docs](https://github.com/firefly-iii/docs/blob/main/docs/docs/references/data-importer/duplicate-detection.md)) would treat the second coffee as a duplicate, and this requirement rules that out. Identity needs the amount and date as well as the identifier because some banks "provide duplicate values" ([EB FAQ](https://enablebanking.com/docs/faq/)). Actual favours the imported transaction and matches on date, amount and similar payee ([Actual docs](https://actualbudget.org/docs/transactions/importing)). Here, anything short of certain is flagged instead of merged. Removed transactions are kept to block re-import, as Firefly III and Actual (optionally) do.

#### TXN-13 Internal transfers · Must · M2
As a household, we want money moved between our own accounts (including between members) paired and kept out of income and spending, so that moving money isn't counted as spending or earning it.
**Acceptance criteria**
- Two transactions are proposed as an internal transfer when they are in two different household accounts, in opposite directions, with the same amount and currency, and with budget dates within 5 days.
- The pair is linked automatically if the counterparty account number on either side matches the other household account. Otherwise the pair is suggested in the review area, and confirming takes one tap. Until confirmed or dismissed, each suggested leg keeps the category it would have on its own (CAT), counts as that, and is an uncertain item.
- A linked pair is **one transfer**. The list shows both legs ("Transfer to/from <account>"), but every total, report, recurring item and budget figure counts the pair once.
- How a pair counts by default:
  - between own accounts that aren't savings: neutral;
  - into a savings-type account: savings;
  - out of a savings-type account: negative savings, never income;
  - into a tracked loan or mortgage: a fixed expense;
  - into a tracked credit card: neutral, because the card's purchases are the spending (TXN-14).
  A member can re-categorise a savings pair as a plain neutral transfer, for example sinking-fund money kept in a savings account.
- When both accounts are in the budget, a counted pair falls in the period of the outgoing leg (TXN-05).
- A transfer from an account in the budget to a tracked account excluded from the budget (ACC-03) shows in the "Not counted" lines as "Moved to accounts outside the budget", unless it is savings.
- A transfer leg can be split (TXN-16), for example part savings and part neutral.
- A member can mark a transfer "Surplus swept from <period>". BUD defines what the mark does.
- Members can link two transactions by hand, including across currencies, and can unlink them.
- A transfer between members' accounts is an internal transfer like any other.
- The category decides how a transaction counts. The rules above only set the default category, and a member's category always wins.
- A transaction to or from an account the household doesn't track has no pair. Its default category is a savings category if it is the household's own savings held elsewhere (counted as savings), or "Credit card repayment (untracked card)" for an untracked card (TXN-14; spending). Otherwise, if it looks like a transfer (its counterparty is a household member, or the bank marks it as a transfer), it defaults to "Transfer to/from untracked account". That makes it a **one-leg transfer**, which counts as neither spending nor income. Members can also use this category for money that will be paid back. Reports show one-leg transfers in the "Not counted" lines as "Money leaving tracked accounts" and "Money arriving from untracked accounts" (INS).
- A one-leg transfer the app categorised by itself goes to the review area once, as "Other side not tracked — link it or confirm", so money never leaves the spending figures unseen.
**Depends on:** SPIKE-01 (G11: is the counterparty account number provided; item 19: how transfers are marked); CAT (flex types, rules); BUD (savings, loan repayments); REC, INS (one transfer per pair)

#### TXN-14 Card repayments · Must · M2
As a household, we want credit-card repayments handled so that card spending is counted exactly once, whether or not the app sees the card's purchases.
**Acceptance criteria**
- A repayment to a tracked card is paired with the card's incoming payment as an internal transfer (TXN-13). It is neutral, and the card's purchases are the spending.
- A card is tracked only when its transactions are in the app. A card kept only as a value for net worth (ACC-05) stays untracked.
- If the card's purchases aren't visible to the app, the repayment counts as spending in the category "Credit card repayment (untracked card)". That category's flex type is Flexible (CAT; REC-07 defaults recurring repayments to Flexible). A review item suggests "Track this card's purchases: import its statements by CSV".
- A repayment is recognised as going to a tracked card when its counterparty account is that card's account, or when a member or rule links it. Recognising a repayment to an untracked card depends on what the bank provides (counterparty account, bank codes, description). The app suggests the category where it can, and otherwise a member or a rule sets it.
- When a card becomes tracked (connected, or a manual card with imported statements), past repayments to it are offered for re-linking as transfers. The app states that past budget periods will change (Settled periods show "Changed since settled") and asks before doing it. A recurring item for the repayment is offered for conversion to a Transfer item (REC).
**Depends on:** SPIKE-01 (are cards exposed as accounts; how card repayments look in bank data); CAT (category, flex type); BUD (recalculating past periods)

#### TXN-15 Refunds · Must · M2
As a Member, I want a refund linked to the original purchase and not counted as income, so that spending shows what we really paid.
**Acceptance criteria**
- An incoming transaction is suggested as a refund of an earlier outgoing one when it is on the same account or the same card, from a similar counterparty, for an amount ≤ the original, and within 90 days after it. Members confirm in one tap or link by hand.
- A linked refund takes the original's category unless a member set one. Partial refunds and several refunds for one purchase are allowed. Their total can't exceed the original (validation message).
- Refunds, linked or not, that are categorised in an expense category reduce spending in that category and never count as income. BUD defines which period's spending a refund reduces when it lands in a later period.
- Bank reversals and chargebacks are handled the same way.
**Depends on:** BUD (refund in a later period); CAT

#### TXN-16 Splits · Must · M2
As a Member, I want to split one transaction into parts with their own category, so that a mixed shop is budgeted correctly.
**Acceptance criteria**
- A split has 2 or more parts. Each part has an amount, a category, and optional tags, note and exclude flag.
- The parts must add up exactly to the transaction amount. The app shows the remaining amount and won't save until it is 0.
- Each part counts in its own category everywhere (budget, reports).
- Unsplitting restores a single transaction with the category of the largest part.
- If the bank amount changes after splitting (TXN-07, TXN-09), TXN-07's "Unallocated difference" rule applies.
**Depends on:** BUD, INS (parts counted per category)

#### TXN-17 Tags · Should · M2
As a Member, I want to add any number of tags to transactions, so that I can track things across categories (a holiday, a renovation).
**Acceptance criteria**
- Tags are shared across the household. Members can create, rename, merge and delete them. Deleting a tag removes it from transactions and warns how many are affected.
- A transaction or split part can have several tags. Tags can be filtered (TXN-02) and reported on (INS), and rules can add them (CAT).

#### TXN-18 Notes · Must · M1
As a Member, I want to add a note to a transaction, so that the household knows what it was.
**Acceptance criteria**
- A note is free text of up to 1,000 characters on a transaction or split part. It is searchable (TXN-02), and the detail view shows who wrote it and when.

#### TXN-19 Exclude from budget · Must · M2
As a Member, I want to exclude a transaction from the budget (for example a work expense to be reimbursed), so that it doesn't distort left to spend.
**Acceptance criteria**
- An excluded transaction or split part counts in neither the budget, left to spend, spending reports, nor income. It still counts in account balances and net worth.
- It shows an "Excluded" marker and can be filtered. Reports can optionally show excluded totals (INS).
- Balance adjustments (ACC-12) are always excluded.
**Depends on:** BUD, INS

#### TXN-20 Manual transactions · Must · M2
As a Member, I want to add transactions by hand (cash, or something the bank hasn't shown yet), so that the budget is complete.
**Acceptance criteria**
- Fields: account, date, amount, currency (default: the account's), description, and optionally category, tags, note and split.
- Manual transactions are marked "Manual" with the creating member. They can be edited and removed like any transaction, and an Owner can delete them permanently (TXN intro).
- On a connected account, a manual transaction is matched against later bank transactions as in TXN-10.
**Depends on:** ACC (cash accounts)

#### TXN-21 CSV import · Must · M1
As a Member, I want to import a bank's CSV export into an account without duplicating what the bank already gave, so that I can backfill history or track a bank the app can't connect to.
**Acceptance criteria**
- Steps: choose the target account (existing, or a new manual account) → upload the file → map columns → preview → confirm.
- Reading the file: the app detects delimiter, encoding (at least UTF-8 and common legacy single-byte encodings), decimal separator, thousands separator and date format. Each can be overridden. The member can skip a number of header lines.
- Column mapping: date (required); amount (required), as one signed column or as separate debit and credit columns; description (required). Optional: transaction date, booking date, counterparty, counterparty account, reference or identifier, currency, original amount and currency, balance. There is a "flip sign" option.
- Preview: the first 20 parsed rows, plus totals for rows to import, rows matching existing transactions (to be skipped), possible duplicates (to be imported and flagged), and rows that can't be read with the reason for each. No row is skipped silently. Skipped rows are listed with why.
- Importing into an account that has bank data: the preview shows the file's date range next to the bank's coverage (ACC-13). Bank coverage starts at the oldest booking date the bank returned, unless the bank states a longer covered range.
  - The default is "Import only rows before the bank's coverage". Rows dated within 7 days of the coverage start are checked against bank data (TXN-10) instead of imported unchecked, because the file's date may be the purchase date and the bank's the booking date. Test: a purchase made on 19 Dec and booked on 20 Dec, dated 19 Dec in the file and present in bank data from 20 Dec, ends up as one flagged possible-duplicate pair, and "Same transaction" leaves one. It ends up once with no flag only when the file row carries the bank's identifier for it.
  - The other option is "Import all rows, check for duplicates", which applies TXN-10 against bank, manual and earlier CSV data.
- Rows that carry the bank's own identifier for the same account are merged automatically with bank transactions that have that identifier, amount and date.
- The mapping is saved per account and offered again next time. A file with the same column headers gets it automatically.
- At least 20,000 rows can be imported in one file.
- Each import can be undone as a whole from the account's import history. Undo removes only transactions created by that import, and the confirmation lists member edits made to them since. Any member can undo an import they made, and an Owner can undo any import. Undo moves its transactions to "Recently deleted" (SET-11) for 7 days and is recorded in the audit trail (TXN-03).
- The budget date follows TXN-05: the transaction-date column if mapped, otherwise the date column.
- After each import, coverage (ACC-13) and reconciliation (ACC-12) are re-checked.
- *Could:* built-in column presets for the household's banks, once SPIKE-01 lists them.
**Depends on:** ACC (manual accounts, coverage, reconciliation); SPIKE-01 (household banks' CSV formats)
**Notes:** The mapping options follow Actual's importer (flip amount, separate inflow/outflow columns, date format override; [Actual docs](https://actualbudget.org/docs/transactions/importing)). The identifier column also lets history kept from SPIKE-01 be imported in M1 without duplicating later bank data (SPIKE-01, Data handling).

#### TXN-23 CSV export · Should · M2
As a Member, I want to export the current filtered transaction list to CSV, so that I can analyse it elsewhere.
**Acceptance criteria**
- Exports the transactions matching the current filters (TXN-02). Each row has: budget date, booking date, account, account holder, description (edited and bank), counterparty, amount and currency, original amount and currency, base-currency amount, category, flex type, tags, note, status, flags, source. Each split part is one row, with a transaction identifier shared across the parts.
- UTF-8, with a header row. The file name contains the date range.
- Needs no re-authentication. A full-data export is a different feature (SET), and that one does need it.
- Text that could run as a spreadsheet formula is written as plain text, as in SET-08's export.
**Depends on:** SET (full export, re-authentication rules)

#### TXN-24 Currencies: account currency and foreign-currency transactions · Must · M1
As a household with purchases or accounts in more than one currency, we want each account kept in its own currency, foreign purchases shown with both amounts, and totals converted, so that balances match the bank and totals add up.
**Acceptance criteria**
- Each account has one currency, taken from the bank or chosen for a manual account. Its balances and transactions are stored and shown in that currency, and that amount is the one used for balances.
- If the bank provides the original amount and currency, the row shows both: "€42.10 (PLN 180.00)". The detail view shows the exchange rate if the bank provides one.
- Totals and any figure in base currency use SET's FX rule (which rate, which date, when the bank's converted amount wins). The converted amount is labelled with the rate date. This includes transfer legs and linked refunds: linking or unlinking that changes a base amount shows like any other change ("Changed since settled", BUD's late adjustment).
- An FX change between pending and booked is handled by TXN-07, which matches on the original amount.
- If the bank provides no original amount, only the account-currency amount is shown. Nothing is guessed from the description.
**Depends on:** SPIKE-01 (FX fields populated); SET (base currency, FX rule); NW (FX revaluation)

#### TXN-25 Bulk edit · Should · M2
As a Member, I want to change category, tags or exclusion for many transactions at once, so that clean-up after the first import is quick.
**Acceptance criteria**
- Members select several transactions, or all results of a filter, and set the category, add or remove tags, or set or clear "exclude". A confirmation shows the count.
- Bulk edits count as member edits (TXN-04) and can be undone as one action for 10 minutes.

---

### 4.6 Categorisation (CAT)
Categorisation gives every transaction (or split part) exactly one category, and every category has one flex type. The category, through its flex type, decides how a transaction counts in the flex budget (BUD) and in reports (INS). Account type and transfer structure only supply the default category. This area covers the default category tree, managing categories, where automatic categories come from and in what order, rules, learning from corrections, the review inbox, merchant name cleanup and tags. Merchant cleanup and anything that uses bank-provided codes or enrichment depend on SPIKE-01.

#### CAT-01 Default category tree · Must · M2
As a household, I want a ready-made two-level category tree with flex types already set, so that the budget works from day one without building categories by hand.
**Acceptance criteria**
- A new household starts with the tree below: 63 categories in 15 groups. Every category has exactly one flex type. Groups have no flex type and are used only for display.
- The tree has exactly two levels: group → category. Transactions and split parts are assigned to categories, never to groups.
- "Between own accounts", "Transfer to/from untracked account" and "Sinking-fund money" (all transfer) are system categories. Transfer detection (CAT-05) and BUD-20 use them. They can be renamed or moved to another group. They cannot be deleted, hidden or given a different flex type.
- "Uncategorised" is a state, not a category. It cannot be picked as a category, budgeted or given a flex type.
- Until a category has its first transaction, category pickers and the budget's flexible list show it inside a collapsed "Not used yet" section. It can still be picked, searched and planned. This keeps a first-month picker short without removing categories the household will need later (e.g. School supplies in September).
**Notes:** Groups are life areas, chosen for display and reports. The fixed / non-monthly / flexible split that Monarch's flex budgeting uses ([Monarch](https://www.monarch.com/blog/flex-budgeting-simplify-your-spending-with-just-one-number)) is carried by each category's flex type, not by its group. Housing, for example, holds fixed, non-monthly and flexible categories. Local items are tuned for a Polish household. The language of the default names is an open question.

| Group | Category | Flex type | Note |
|---|---|---|---|
| Income | Salary | income | |
| Income | Bonus | income | irregular |
| Income | Freelance & self-employment | income | irregular |
| Income | Family benefits (e.g. 800+) | income | |
| Income | Interest & investment income | income | |
| Income | Tax refund | income | irregular |
| Income | Other income | income | irregular |
| Housing | Rent / mortgage payment | fixed | full instalment, principal included. Default for a repayment to a tracked mortgage |
| Housing | Building & HOA fees (czynsz) | fixed | |
| Housing | Electricity | fixed | switch to non-monthly if billed every 2 months (BUD-07) |
| Housing | Gas & heating | fixed | as Electricity |
| Housing | Water & waste | fixed | |
| Housing | Internet & TV | fixed | |
| Housing | Home insurance | non-monthly | |
| Housing | Property tax | non-monthly | |
| Housing | Repairs & maintenance | non-monthly | |
| Housing | Furniture & household goods | flexible | |
| Food | Groceries | flexible | |
| Food | Restaurants & cafés | flexible | |
| Food | Takeaway & delivery | flexible | |
| Transport | Fuel & charging | flexible | |
| Transport | Public transport | flexible | |
| Transport | Taxi & ride-hailing | flexible | |
| Transport | Parking & tolls | flexible | |
| Transport | Car loan / leasing | fixed | |
| Transport | Car insurance (OC/AC) | non-monthly | |
| Transport | Car service, inspection & tyres | non-monthly | |
| Health & fitness | Pharmacy | flexible | |
| Health & fitness | Doctors & dentist | flexible | |
| Health & fitness | Private medical plan | fixed | |
| Health & fitness | Sport & fitness memberships | fixed | |
| Children | Nursery & childcare | fixed | |
| Children | After-school activities | fixed | |
| Children | School supplies & trips | non-monthly | September peak |
| Children | Kids' clothing & toys | flexible | |
| Shopping & personal | Clothing & shoes | flexible | |
| Shopping & personal | Personal care & beauty | flexible | |
| Shopping & personal | Electronics | flexible | |
| Shopping & personal | Other shopping | flexible | |
| Leisure | Entertainment & culture | flexible | |
| Leisure | Hobbies | flexible | |
| Leisure | Holidays & travel | non-monthly | |
| Leisure | Gifts & celebrations | non-monthly | Christmas, Easter, birthdays |
| Leisure | Charity & donations | flexible | |
| Bills & subscriptions | Mobile phone | fixed | |
| Bills & subscriptions | Streaming & digital services | fixed | |
| Financial | Other loan repayments | fixed | default for a repayment to a tracked loan |
| Financial | Life insurance | fixed | |
| Financial | Monthly taxes & social contributions | fixed | e.g. self-employed advances |
| Financial | Annual tax settlement | non-monthly | |
| Financial | Bank & card fees | flexible | small, irregular amounts |
| Financial | Credit card repayment (untracked card) | flexible | the repayment is the only trace of the card's spending (TXN-14) |
| Pets | Pet food & supplies | flexible | |
| Pets | Vet | non-monthly | |
| Cash | Cash withdrawal | flexible | counted as spent when withdrawn. Households that track a manual cash account switch it to transfer |
| Savings | Savings | savings | default for transfers into or out of a savings-type account |
| Savings | Investments & retirement (e.g. IKE/IKZE) | savings | |
| Transfers | Between own accounts | transfer | system category. Includes transfers between members |
| Transfers | Credit card repayment | transfer | to a tracked card: the card's purchases are what count |
| Transfers | Transfer to/from untracked account | transfer | system category. A one-leg transfer to or from an account the household doesn't track: neither spending nor income, reported as "Money leaving tracked accounts" / "Money arriving from untracked accounts" (TXN-13) |
| Transfers | Sinking-fund money | transfer | system category. Money for sinking funds kept in a real account (BUD-20) |
| Transfers | Reimbursable expenses | transfer | e.g. work costs the employer pays back. Kept out of the budget both ways |
| Other | Miscellaneous | flexible | |

#### CAT-02 Manage categories and groups · Must · M2
As a Member, I want to create, rename, move and hide categories and groups, so that the tree matches how our household thinks about money.
**Acceptance criteria**
- A member can create a category (name, group, flex type), rename it, move it to another group and reorder it within its group.
- A member can rename and reorder groups. Creating and deleting groups is Should · M2. Only an empty group can be deleted.
- Renaming or moving a category keeps all of its history. Past transactions, reports and budget periods show the new name and group.
- Category names are unique within the household, ignoring letter case.
- Hiding a category removes it from category pickers. All transactions already in it stay there. A hidden category can be unhidden.
- Hiding is blocked while the category has an enabled rule pointing to it, a confirmed recurring item using it (REC), or a planned amount in the current or a future period. The message names what to change first.
- An unused category (no transactions, rules, recurring items or plan amounts) can be deleted directly. Deleting a category that is in use needs a merge (CAT-03).
- Any member can do all of the above. The household money model is fully shared (see HH).

#### CAT-03 Merge and delete categories · Should · M3
As a Member, I want to merge or delete categories without losing transactions, so that I can tidy the tree at any time.
**Acceptance criteria**
- Merging category A into category B moves to B everything that belonged to A: all of A's transactions and split parts from any date, rules whose action sets A, recurring items using A, learned patterns for A, and A's planned amounts for the current and future periods (added to B's). A is then removed.
- Merging is allowed only when A and B have the same flex type in the current period. Otherwise the member must first change one flex type (CAT-04).
- When both are non-monthly, their sinking fund balances are added together (see BUD-07).
- Transactions that were categorised manually keep the Manual source after the merge.
- **Past periods:** moved transactions count with the flex type B had in their period. Period results are live, so they change. Every Settled period whose results change shows "Changed since settled" (BUD-19). With rollover on, the difference reaches the current period only as a late adjustment line (BUD-09). Past plans do not change.
- Before confirming, the member sees the number of transactions, rules, recurring items and plan lines affected, and the Settled periods whose results will change. The merge cannot be undone, the confirmation says so, and it asks for re-authentication (AUTH-10). It is recorded in the plan history (BUD-16).
- A category that is in use can only be deleted by choosing a target category, which works as a merge. It is never possible to delete a category and leave its transactions uncategorised.

#### CAT-04 Change a category's flex type · Must · M2
As a Member, I want to change a category's flex type, including in the middle of a period, so that the budget reflects how an expense really behaves.
**Acceptance criteria**
- The change applies to the current period and every future period. Past periods, Settled or Provisional, keep the flex type the category had at the time, in budget results and in the savings rate (BUD-18).
- Changing it back within the same period restores the earlier state of the current period (plan line, fund and counting) as if nothing had changed. Both changes stay in the plan history (BUD-16).
- Before confirming, the member sees this period's left to spend before and after the change.
- Fixed → flexible: the category's expected amount leaves the fixed bucket and the flexible budget grows by the same amount. This period's transactions in the category count as flexible spending.
- Flexible → fixed: the member enters an expected amount, and the flexible budget shrinks by that amount.
- Any type → non-monthly: the member enters a target amount, frequency and optional next due month (BUD-07). The fund opens at the start of the current period at 0 or at an opening balance the member enters ("already set aside"). This period's spending in the category draws on the fund.
- Non-monthly → any type: the fund closes. The confirmation shows its balance and the balance stays visible in history. No money moves, because the fund is virtual.
- Changing to or from income, transfer or savings shows an extra warning that it changes how the category counts in the savings rate from this period on.
- Every change is recorded in the plan history (BUD-16).

#### CAT-05 Categorisation sources and precedence · Must · M2
As a household, I want transactions categorised automatically in a predictable order that never overrides us, so that the budget is mostly right without hand work and our corrections stick.
**Acceptance criteria**
- Each transaction and each split part is either uncategorised or has exactly one category plus a recorded source: Manual, Rule, Recurring item, Transfer detection, Learned, Bank data, or none.
- Precedence, highest first: **Manual > Rule > Recurring item > Transfer detection > Learned > Bank data > Uncategorised**. The highest source that has an answer sets the category.
- **Rule and recurring item:** both are member decisions. When a rule and a confirmed recurring item both match and disagree, the rule wins and the recurring item shows its "category differs" flag (REC-07). Budget actuals always follow the transaction's own category, never the item's.
- **Transfer detection** supplies the default category from the structure of a linked internal transfer (TXN-13). The category then decides how it counts:
  - into or out of a savings-type account: Savings;
  - into a tracked mortgage: Rent / mortgage payment; into a tracked loan: Other loan repayments (both fixed);
  - into a tracked credit card: Credit card repayment (transfer). A card is tracked only when its transactions are in the app;
  - into or out of the account named in BUD-20: as BUD-20 says;
  - any other pair: Between own accounts.
  It also supplies, for a transaction with no pair: "Credit card repayment (untracked card)" when TXN-14 recognises a repayment to an untracked card, and "Transfer to/from untracked account" when TXN-13 recognises a one-leg transfer. So a one-leg transfer is never left uncategorised and counted as flexible spent.
- Automatic sources run when a transaction first appears: sync, the first import, CSV import, or a manual transaction saved without a category. They run again when a transaction changes from pending to booked (TXN-07), when it is linked or unlinked as an internal transfer, and when it is linked to a recurring item, unless the source is Manual.
- No automatic process ever overwrites a Manual category. That covers creating or editing rules, applying a rule to existing transactions, recurring-item changes, learning, pending→booked changes and re-syncs.
- **First source.** Each transaction also keeps the source that first categorised it (Learned, Rule, Recurring item, Transfer detection, Bank data, or Manual), separately from its current source. It never changes afterwards. Accepting a suggestion still makes the current source Manual, so precedence is unchanged. The first source feeds the categorisation-quality metric: automatic first categories that a member later changed.
- A Manual category changes only when a member edits it or chooses "Reset to automatic". Reset runs the automatic sources again.
- Accepting a suggestion from the review inbox counts as Manual.
- Creating or editing a rule does not change existing automatic categories by itself. Only "apply to existing transactions" does (CAT-08).
**Notes:** Why Transfer detection sits above Learned: a linked transfer between our own accounts is a structural fact, while a learned pattern is a guess from descriptions. Learned patterns built on names misfire on transfers (CAT-10). A household that wants a transfer counted differently (e.g. fund money into a savings account) uses a rule, a recurring item or BUD-20, all of which rank higher. Why Recurring item sits above Transfer detection: a confirmed item is a member's explicit choice, e.g. a monthly transfer set to "Sinking-fund money".

#### CAT-06 Why this category · Should · M2
As a Member, I want to see why a transaction got its category, so that I can fix the cause and not only the symptom.
**Acceptance criteria**
- Each transaction's detail shows its category source and the reason:
  - Manual: the member's name and the date.
  - Rule: the rule's name, linked to the rule.
  - Recurring item: "Recurring item: <name>", linked to the item.
  - Transfer detection: "internal transfer with <account>", and which default applied (e.g. "into a savings account → Savings").
  - Learned: "learned from N similar transactions", linked to them.
  - Bank data: the code that was used, e.g. "card merchant code 5411".
- From the detail, a member can open and edit the rule or the recurring item, choose "Reset to automatic", or choose "Stop learning this" (CAT-10).
- Transaction lists show the source as a small marker. Uncategorised transactions are marked as such.
- Showing what a lower-priority source would have picked is CAT-17 (M3).

#### CAT-07 Rules: conditions and actions · Must · M2
As a Member, I want rules that set category, name and tags for matching transactions, so that recurring cases are handled the same way every time.
**Acceptance criteria**
- A rule has a name, one or more conditions (all must match) and one or more actions. It can be enabled or disabled without deleting it.
- Conditions:
  - Description: contains / starts with / equals. Matching ignores letter case and Polish diacritics, so "zabka" matches "ŻABKA".
  - Merchant display name · Should · M2, with CAT-14.
  - Counterparty name or account number.
  - Amount: direction (outflow / inflow) plus equals / less than / greater than / between.
  - Account(s).
  - Account holder (a member or Joint) · Should · M2.
  - Day-of-month range · Should · M2.
  - Current category, including "is uncategorised".
  - Card merchant code / bank transaction code.
- Actions:
  - Set category.
  - Set merchant display name.
  - Add tag(s).
  - Mark as reviewed, so the transaction skips the review inbox.
  - Exclude from budget (TXN-19).
- Rules form one ordered household list that members can reorder. For the category, the first matching enabled rule wins. Later matching rules can still add tags and set fields that an earlier rule left unset.
- While editing a rule, the member sees how many existing transactions currently match it.
**Depends on:** SPIKE-01 (applies only to the conditions on merchant display name, counterparty name or account number, and card merchant / bank transaction codes; they are offered only if banks fill those fields)
**Notes:** Condition and action set follows Lunch Money ([Lunch Money rules](https://support.lunchmoney.app/setup/rules)). Lunch Money's split and email actions are left out: no notifications, and splits stay manual in v1.

#### CAT-08 Apply a rule to existing transactions · Must · M2
As a Member, I want to apply a new or changed rule to past transactions after previewing the result, so that history gets fixed without losing manual corrections.
**Acceptance criteria**
- When saving a rule, the member picks "Future transactions only" or "Also existing transactions".
- "Also existing transactions" opens a preview of every matching transaction, showing current → new category, in groups: *will change*, *already correct*, *kept: manual*, *kept: earlier rule wins*. The preview names the Settled periods whose results will change.
- Transactions in *kept: manual* cannot be selected and are never changed.
- The member can deselect individual transactions in *will change*. Only the selected ones change. Their source becomes Rule and they are marked reviewed.
- Results of past periods that contain changed transactions are recalculated. Settled periods show "Changed since settled" (BUD-19). Past plans do not change.
- Undo after applying is CAT-16 (M3). Until then the preview is the safeguard, and the confirmation says the change can't be undone, so it asks for re-authentication (AUTH-10 catch-all).
**Notes:** Lunch Money's preview with deselect ([Lunch Money rules](https://support.lunchmoney.app/setup/rules)), plus the manual-edit guarantee Lunch Money does not document.

#### CAT-09 "Create a rule?" after a manual fix · Should · M2
As a Member, I want to be offered a rule right after I fix a category, so that I don't have to fix the same merchant again.
**Acceptance criteria**
- After a member changes one transaction's category by hand, a prompt offers "Always categorise like this?". It does not block other actions.
- The prompt is pre-filled with a condition on the description or merchant display name and the new category as the action. It shows how many other transactions match. All fields can be edited before saving.
- If a rule caused the wrong category, the prompt offers "Edit rule '<name>'" instead of creating a new rule. If a recurring item caused it, the prompt offers "Change the item's category" (REC-07).
- Saving goes to the choice in CAT-08 (future only, or also existing transactions with a preview).
- "Don't ask again for this" stops the prompt for that description or merchant.
- Bulk edits do not trigger the prompt.
**Notes:** Lunch Money ([rules](https://support.lunchmoney.app/setup/rules)) and Copilot both offer a rule right after an edit.

#### CAT-10 Learning from corrections · Should · M2
As a household, I want the app to learn from how we categorise, so that the review inbox shrinks over time without us writing rules.
**Acceptance criteria**
- Learning uses manual categorisations, accepted suggestions, and automatic categories a member confirmed by reviewing one transaction.
- Once the household has categorised at least 2 transactions with the same counterparty or description pattern the same way, the next such transaction gets that category automatically with source Learned. This does not happen if any of the last 3 similar transactions went to a different category. So when a member changes a Learned category, the pattern pauses until the household is consistent again.
- When past choices conflict, nothing is applied. The transaction stays uncategorised and the review inbox shows up to 2 suggested categories, each accepted with one tap.
- Learning fills only new transactions and uncategorised transactions still in the inbox. It never changes a transaction that already has a category.
- **What learning ignores:**
  - Transactions linked as internal transfers (TXN-13). It neither learns from them nor applies to them. Transfer detection and higher sources handle them (CAT-05).
  - A counterparty whose name matches a member's name: learning matches it only on the counterparty account number, so a transfer to a member's own account at another bank isn't treated like a payment to that member's personal account. Without an account number it only suggests. **Depends on:** SPIKE-01 (do banks fill counterparty name and account number).
  - Payment intermediaries that stand for many merchants (e.g. PayU, Przelewy24, PayPal, Allegro): learning only suggests, unless the description also names the merchant. The list is built in and can be extended by the household.
- **What teaches:** a single manual edit, an accepted suggestion, or a single "Reviewed" counts as one example. A bulk "Set category" counts as one example per pattern, however many transactions it changed. A bulk "Mark reviewed" teaches nothing. One sweeping action can't create a pattern on its own.
- "Stop learning this" (CAT-06) removes the pattern, and future similar transactions fall through to lower sources.
- Learning is shared by the whole household.
**Depends on:** SPIKE-01 (which bank fields reliably identify "the same counterparty". The feature works on descriptions alone, but quality depends on them)
**Notes:** Copilot learns from reviews, needs 30 reviewed transactions before it starts, applies a prediction only above a confidence threshold, and otherwise shows its top two guesses ([Copilot Intelligence](https://help.copilot.money/en/articles/8182433-copilot-intelligence-for-spending)). Here the threshold is per pattern ("2 consistent"), so a small household's patterns start being used sooner. The defaults table in BUD gives the reasons and what would change them. "Similar" may also take account and amount into account, e.g. a petrol station's fuel versus its shop. That is left to design.

#### CAT-11 Categories from bank data · Should · M2
As a household, I want bank-provided codes used as a last automatic hint, so that more new transactions arrive categorised.
**Acceptance criteria**
- If banks provide card merchant codes, bank transaction codes or Enable Banking categories, the app maps them to default categories. Examples: grocery merchant code → Groceries; ATM code → Cash withdrawal; fee code → Bank & card fees; loan repayment code → Other loan repayments; interest code → Interest & investment income.
- These hints apply only when no Manual, Rule, Recurring item, Transfer detection or Learned source applies. The source shows as Bank data, with the code.
- The household cannot edit the mapping in v1. Corrections become learned patterns, which take precedence over Bank data.
- SPIKE-01: Erste fills no merchant or bank transaction code fields, but every description carries the bank's transaction type (card payment, direct debit, standing order, fee, loan repayment and so on). That type serves as the bank transaction code.
**Depends on:** SPIKE-01

#### CAT-12 Review inbox: what enters it · Must · M2
As a household, I want one shared inbox of transactions that need a look, so that a weekly review is short and nothing slips through.
**Acceptance criteria**
- The household has one inbox, shared by all members. Its count shows in navigation and on the dashboard (see INS). The count includes possible duplicates.
- A transaction enters the inbox with one or more reason labels:
  - **New**: arrived by sync, dated in the current or previous budget period.
  - **Uncategorised**.
  - **Suggestion**: a learned pattern conflicted (CAT-10), or BUD-20 suggests a split. It appears only once CAT-10 or BUD-20 (both Should) is available.
  - **Possible duplicate**, at any date (TXN-10). Both transactions count in every total until resolved.
  - **Changed at booking**: only when the automatic category changed at booking, or TXN flags "Check this match" (TXN-07). An amount, date or description change alone does not enter the inbox; the detail shows it.
  - **Recurring: possible match**: REC could not link it with certainty: a tie between items, an amount outside the band, or a payment for a skipped occurrence. The item carries REC-06's actions.
  - **Recurring: still unpaid?**: an occurrence of a bill or subscription the household pays ("Us", REC-06) is still open after its window ended. The item is for the occurrence, not a transaction. The answers are REC-06's "Mark paid elsewhere", "Skip this one" and "Still waiting"; BUD-06 says what each does to the budget. Neither recurring reason is a REC flag (REC-11).
  - Items TXN sends for review, with TXN's reason text, e.g. "Pending may have booked as …" (TXN-07), a transfer to confirm or "Other side not tracked" (TXN-13).
  - **Linked transaction erased**: the other side of a transfer, refund or split was erased with a member's data (HH-08).
- Transactions a member entered by hand are marked reviewed by that member and do not enter the inbox.
- Transactions where a rule's "Mark as reviewed" action applied skip the inbox.
- Imported history older than the previous budget period (first import or CSV backfill) does not enter the inbox. Instead, a separate "Uncategorised in history: N" link opens the filtered transaction list.
- A reviewed transaction returns to the inbox if its automatic category later changes at booking, or it is flagged as a possible duplicate.
- Open items dated in a period don't stop it from settling. The period then shows "Settled with N open items" (BUD-19).
- The inbox can be filtered by reason, account, member and amount.
- The number of open inbox items is available to the weekly review (INS-24), which records it when a review starts and when it is marked done. These are household counts only: nothing is recorded about which member reviewed or for how long. Once the inbox is empty, it links to the weekly review (INS-24) as the next step.
**Notes:** Copilot's "To Review" ([Copilot](https://help.copilot.money/en/articles/8182433-copilot-intelligence-for-spending)).

#### CAT-13 Reviewing and bulk actions · Must · M2
As a Member, I want to clear the inbox quickly, with bulk actions, so that the weekly review fits in under 10 minutes.
**Acceptance criteria**
- "Reviewed" means a member has confirmed the transaction's category and flags. The app records who did it and when. The transaction leaves the inbox for everyone.
- Any manual edit (category, split, tag, note) marks the transaction reviewed.
- Bulk actions work on selected transactions or on "select all shown" (respecting filters): set category (source Manual), add tag, mark reviewed. How much bulk actions teach learning is set in CAT-10.
- Uncategorised transactions cannot be marked reviewed without a category. A bulk "mark reviewed" skips them and says how many were skipped.
- Possible duplicates leave the inbox only once they are resolved (TXN-10). Bulk "mark reviewed" skips them too.
- Each inbox row has accept / change-category controls that work at 360 px width without opening the detail view.

#### CAT-14 Merchant name cleanup · Should · M2
As a Member, I want short, readable merchant names instead of raw bank descriptions, so that lists, rules and reports are easy to scan.
**Acceptance criteria**
- Each transaction shows a display name derived from its description and counterparty, with noise removed: card numbers, terminal IDs, city, dates, reference numbers. Illustrative example: "ZAKUP KARTA 1234 ZABKA Z1234 K.1 WARSZAWA" → "Żabka".
- The original bank description is always viewable and is never changed.
- A member can rename a merchant for "this transaction only" or "all transactions like this". The second option creates a rule with a "set merchant display name" action (CAT-07).
- Rules, learned patterns and merchant reports (INS) use the display name.
**Depends on:** SPIKE-01 (description samples decide feasibility. If descriptions are unusable for most transactions, this becomes Must per the SPIKE-01 decision gate)

#### CAT-15 Tags vs categories · Should · M2
As a Member, I want tags as well as categories, so that I can track trips, events or projects across categories without affecting the budget.
**Acceptance criteria**
- A transaction or split part has exactly one category and zero or more tags.
- Tags never change the budget, left to spend or the savings rate.
- Tags are created on the fly while tagging. Members can rename, merge and delete them. Deleting asks for confirmation, shows how many transactions carry the tag, and removes only the tag; categories are untouched.
- Rules can add tags (CAT-07). Transactions can be filtered and reported by tag (see INS).
- Examples shown in the empty state: "Holiday Croatia 2026", "Kitchen renovation", "Wedding".
**Notes:** Same split as Lunch Money: categories drive budgeting, tags are many-per-transaction for events and projects ([Lunch Money tags](https://support.lunchmoney.app/setup/tags)). Adding a tag to a transaction is a TXN edit (TXN-17, Should · M2). CAT defines what tags mean and how they are managed.

#### CAT-16 Undo a rule apply · Could · M3
As a Member, I want to undo applying a rule to existing transactions, so that a mistaken bulk change is easy to reverse.
**Acceptance criteria**
- After "Also existing transactions" (CAT-08), an "Undo" on the rule restores the previous category and source of each changed transaction. Undo is available until the rule is edited or applied again.
- Undo skips any transaction whose category changed after the apply (e.g. a later Manual edit). These are listed as "kept: changed since", so undo never overrides a member (CAT-05).
- Settled periods whose results change again show "Changed since settled" (BUD-19).

#### CAT-17 Competing sources in "why this category" · Should · M3
As a Member, I want to see when another source would have picked a different category, so that I can spot a rule that is too broad.
**Acceptance criteria**
- When a lower-priority source would have picked a different category, the detail shows it too. Example: "Rule 'Biedronka → Groceries' applied. Learned pattern suggested Household goods."
- When a rule beat a recurring item, the line names the item, and links to the item's "category differs" flag (REC).

### 4.7 Flex budget (BUD)
The flex budget gives the household one number to watch: **left to spend**, the flexible money remaining this budget period. Expected income pays for fixed bills, set-asides into virtual sinking funds for non-monthly costs, and planned savings first. What remains is the flexible budget. This area defines that formula exactly, the one counting rulebook that every budget and report figure uses, the budget period and how it is settled, the setup wizard, pace, and the savings rate definition that INS reuses. All amounts are in base currency (see SET — FX rule).

**Terms used in BUD and reused by INS (one meaning each):**
- **Expected income**: the plan's income lines. **Income received**: the net of income categories in the period.
- **Unplanned income** = Σ over income lines of max(0, received − expected). It is counted per line, so a bonus on a line expecting 0 is unplanned as soon as it lands, and a salary not yet paid doesn't cancel it.
- **Income shortfall** = Σ over income lines of max(0, expected − received), plus any planned withdrawal not made (BUD-08). It is final when the period settles. During the period, lines not yet received show as "Assumes income not yet received" (BUD-04).
- **Planned savings**: the plan's savings lines. A negative total is shown as a **planned withdrawal**.
- **Planned savings counted**: planned savings when 0 or more. For a planned withdrawal, only the part already withdrawn: max(planned savings, min(0, moved to savings)). **Planned withdrawal not made** = planned savings counted − planned savings.
- **Moved to savings**: the net of savings categories in the period (in +, out −). It replaces the earlier term "actual savings".
- **Saved above plan**: the part of moved to savings that lowers left to spend (BUD-08).
- **Net saved** = income received − spending. **Savings rate** = net saved ÷ income received (BUD-18).
- **Period surplus**: what the period's plan left unused, outside the funds (BUD-19).

#### BUD-01 Budget plan and the flex formula · Must · M2
As a household, I want one balanced plan per budget period, so that we know how much is free to spend after commitments.
**Acceptance criteria**
- The plan for a period contains:
  - expected income per income category;
  - an expected amount per fixed category;
  - a target, frequency, optional next due month and per-period set-aside per non-monthly category (BUD-07);
  - planned savings per savings category. The total may be negative: a planned withdrawal, e.g. 1,000 a month taken from savings during parental leave. Only a member sets it. It counts only once the money is actually withdrawn (BUD-08).
- **Flexible budget = expected income − Σ fixed expected − Σ set-asides − planned savings + rollover in + late adjustments** (the last two only with rollover on, BUD-09).
- The flexible budget is always calculated and never typed in. To change it, a member changes another line.
- **Recurring items in the plan.** A confirmed recurring item (REC) feeds its category's plan line as follows:
  - income, fixed and savings categories: the amounts of the item's occurrences due in the period. A monthly item counts once and a weekly item 4 or 5 times. An item due less often than monthly counts in full in the periods it is due, which is why REC-07 suggests a non-monthly category for it;
  - non-monthly categories: the item's yearly total is the suggested target and its monthly equivalent (REC-07) the suggested set-aside;
  - flexible categories: nothing is planned, and its payments count as flexible spent.
  A line's expected amount is the sum of its items plus any amount a member adds by hand. Adding, changing or ending an item changes the plan only through a member action, with the BUD-16 default. An item's amount drift (variable amounts, FX) never changes the plan by itself: REC flags it.
- If the flexible budget is negative, the plan shows "Plan exceeds expected income by X", with links to the lines that can be lowered, and left to spend starts negative. For a household with irregular income it also offers "Plan on your base income" (BUD-13).
- A new period starts with the plan marked "this and future periods" (BUD-16), so there is no monthly re-entry.
- Plan amounts apply per period and are not prorated for longer or shorter payday periods. The one exception is a transition period (BUD-12).
**Notes:** Monarch: "Income − Fixed Expenses − Non-monthly expenses − Goals = Monthly Flex Number" ([Monarch](https://www.monarch.com/blog/flex-budgeting-simplify-your-spending-with-just-one-number)). Here "Goals" is planned savings, because savings goals are deferred. Fixed lines use occurrences due in the period, not monthly equivalents: a monthly equivalent in a fixed line would show the bill as over plan in the month it lands and under plan in the others, and fixed under plan never raises left to spend (BUD-06).

#### BUD-02 How every transaction counts (the counting rulebook) · Must · M2
As a household, I want one fixed rule for how every kind of transaction counts, so that the budget and every report agree and can be checked by hand.
**Acceptance criteria**
- **One rulebook.** Every figure about income, spending, savings or the budget, in BUD and in INS (savings rate, recap, cash-flow totals), uses exactly these rules. INS may offer other views, e.g. booked only, only as explicitly labelled report filters.
- **Scope: budget-side accounts.** A transaction counts only if it is on an account with "Include in budget" on (ACC-03). A linked internal transfer counts once: from its leg on a budget-side account, or from the outgoing leg if both are budget-side. A transfer between two accounts outside the budget doesn't count.
- **Period:** the period that contains the transaction's budget date (TXN-05). Two exceptions: a member's per-transaction override, and a payment linked to a recurring occurrence. That payment's period is decided once, when the link is made: the occurrence's period if it is not Settled then, otherwise the period it was paid in. Settling later never moves it. Only an override or unlinking does (BUD-06).
- **The category decides.** A transaction or split part counts by the flex type its category had **in that transaction's period** (CAT-04). Account type and transfer structure only supply the default category (CAT-05).

| What | Counts as | Effect on left to spend |
|---|---|---|
| income | income received | none (BUD-04) |
| fixed | fixed actual, per category | over plan lowers it, under plan never raises it (BUD-06) |
| non-monthly | drawn from that category's sinking fund | none (BUD-07) |
| flexible | flexible spent | lowers it |
| savings | moved to savings (in +, out −) | only saved above plan lowers it; a withdrawal raises it only by undoing saved above plan (BUD-08) |
| transfer (incl. Transfer to/from untracked account, Sinking-fund money) | nothing | none |
| uncategorised outflow | flexible spent | lowers it, labelled "incl. N uncategorised (<amount>)" |
| uncategorised inflow | nothing | none, labelled "N uncategorised inflows not counted" |
| excluded from budget (TXN-19) | nothing | none |

- **Pending** transactions count at their current amount (TXN-06). Every figure that includes them says "incl. N pending (<amount>)". When the amount changes at booking, the figure follows the booked amount. An expired pending stops counting (TXN-07). A scheduled transaction doesn't count until it books. Until TXN-06 is built (Later; SPIKE-01, G5), no pending transactions are imported, so this rule does nothing, figures move only at booking, and left to spend says "excludes purchases not yet booked".
- **Uncertain items**: every transaction in a state TXN defines as uncertain counts as it stands, e.g. both possible duplicates until resolved (TXN-10) and each leg of an unconfirmed suggested transfer by its own category (TXN-13). Every figure that includes any says "Includes N uncertain items (<amount>) — may be off", linking to the list.
- **Missing data**: a figure that covers a coverage gap says "Missing data for <account> <range> — may be off", rendered like the uncertain-items footnote. ACC defines a gap: a stretch of the period with no data for a budget-side account. History that starts mid-period is shown as "History starts <date>" and is not a gap.
- **Not updating**: while an account disconnected with "Keep data" stays included in the budget, a figure covering dates after its last data says "Not updating since <date>: <account> — may be off", rendered the same way. Its end date is its last data date, so it never blocks settling (BUD-19, INS-23).
- BUD-02 owns these three footnotes (uncertain items, missing data, not updating). BUD-03, BUD-15, BUD-17, BUD-18, BUD-19, INS and FC render them with the same wording.
- Amounts are net within a category: inflows in an expense category (refunds, cashback) reduce that category's spending, and a category's net spending may be negative.
- Each split part counts by its own category's flex type, e.g. one card payment split into Groceries and Pharmacy, or one transfer split into Savings 2,000 and Sinking-fund money 950 (BUD-20).
- A savings transfer is moved to savings: never spending, never income, and never counted a second time anywhere.
- **Not counted, but shown.** These count as nothing, and the budget's "Not counted" list (BUD-03) and INS show them with TXN's names:
  - a one-leg transfer in "Transfer to/from untracked account" (TXN-13): "Money leaving tracked accounts" / "Money arriving from untracked accounts";
  - a transfer from a budget-side account to a tracked account outside the budget that isn't savings: "Moved to accounts outside the budget";
  - uncategorised inflows and excluded transactions.
- A one-leg transfer is neither income nor spending. If a member's income lands in an account the household doesn't track, a member can put the transfers from it into an income category (e.g. Salary), so the budget sees that income. The default stays a neutral transfer.
**Notes:** Example of the budget side: the joint account pays 2,000 into the savings account. The joint account is budget-side, the savings account isn't, so the pair counts once, as +2,000 moved to savings, in the period of the joint account's leg. A transfer from a partner's personal account to the joint account is "Between own accounts", so no budget side is needed: it counts as nothing either way.

#### BUD-03 Left to spend and budget overview · Must · M2
As a Member, I want left to spend and its breakdown on one screen, so that I know what we can still spend and why.
**Acceptance criteria**
- **Left to spend = flexible budget − flexible spent − fixed over plan − saved above plan**, where:
  - **flexible spent** = net of flexible categories + uncategorised outflows (BUD-02);
  - **fixed over plan** = max(0, Σ over settled fixed categories of (actual − expected) + Σ over unsettled fixed categories of max(0, actual − expected)). Settled is defined in BUD-06;
  - **saved above plan** = max(0, moved to savings − planned savings counted − unplanned income − surplus swept from last period) (BUD-08). Surplus swept is 0 unless set by the BUD-13 first-period leftover or, when it exists, the BUD-08 surplus card.
- The headline shows left to spend for the current period, the period dates, its freshness (BUD-17), pace (BUD-15), and the labels "incl. N pending (<amount>)", "incl. N uncategorised (<amount>)" and the BUD-02 footnotes (uncertain items, missing data, not updating) when they apply.
- The breakdown shows each term as its own line: flexible budget (with rollover in and late adjustments when rollover is on), flexible spent, fixed over plan, saved above plan. Each line opens the transactions behind it. Each line has a one-sentence explanation, e.g. under Fixed: "Bills above plan lower left to spend straight away. Bills below plan count only once the bill is in, and never raise it above plan."
- Buckets are shown, each opening its transactions:
  - Income: received vs expected, and unplanned income.
  - Fixed: paid vs expected per category, with each recurring bill shown as "seen this period" or "not seen yet". From M3 BUD may show REC-10 statuses instead.
  - Non-monthly: the funds list (BUD-07), with "Funds behind: X" when any fund with a due month is behind.
  - Savings: moved vs planned.
  - Flexible: net spent per category this period. There are no per-category limits in v1.
  - Not counted (collapsed): the totals listed in BUD-02, each opening its transactions.
- Any past period can be opened: plan vs results, with a read-only plan and its Provisional or Settled state (BUD-19).
- The screen works at 360 px without horizontal scrolling (see NFR).
- **Comprehension test:** a member who did not set up the budget, using only the 360 px budget screen and no help, answers within 2 minutes: how much is left to spend; which line lowered it most this period; and how much they can spend per day for the rest of the period (BUD-15). The test is passed when they get all three right.

#### BUD-04 Expected vs received income · Must · M2
As a household with irregular income, I want the budget to run on expected income and to see surprises and shortfalls, so that a bonus doesn't silently inflate spending and a late salary isn't hidden.
**Acceptance criteria**
- Left to spend is based on **expected** income. Income received never changes it automatically.
- The Income bucket shows "received X of expected Y" for the period, and unplanned income when there is any.
- Unplanned income and income shortfall are counted **per income line** (terms above). Example: a 3,000 bonus on day 5, with the Bonus line expecting 0, is unplanned income at once, even though the 5,500 salary due on day 25 hasn't arrived.
- **Unplanned income moved to savings never lowers left to spend**: it is subtracted in saved above plan (BUD-03, journey a). This holds whether or not anyone answers the card below.
- When unplanned income exceeds 5% of total expected income (or is above 0 when total expected income is 0), one "Unplanned income +X" card appears for the period. Its amount updates as more income arrives. It offers:
  - add it to this period's flexible budget (raises that line's expected income for this period only);
  - add it to a sinking fund (Should · M2): raises that line's expected income and the fund's set-aside by the same amount for this period only, so the flexible budget is unchanged and the fund grows;
  - keep it (the default): it is then saved, either moved to savings or left in the account as part of the period surplus (BUD-19).
  The card stays until a member chooses or the period settles. An unanswered card counts as "keep it".
- When a recurring income item (REC-08) is "not seen yet" after its expected date, left to spend shows "Assumes income not yet received: <item>, expected <date>", one line per item (no "overdue" wording in M2).
- **Late income:** when income lands in the first 7 days of a period on a line that had a shortfall in the previous period, and it isn't linked to that period's occurrence, a card asks "Is this <previous period>'s <line>?". Yes moves it to the previous period with the per-transaction override: the shortfall there shrinks, and so does the rollover it carried (provisional), or a late adjustment appears if that period is Settled. So with rollover on, a salary paid 2 days late isn't charged as −X in one period and kept as +X unplanned in the next.
- An income shortfall is shown in the close (BUD-19). With rollover on it carries into the next period (BUD-09). With rollover off, the day-1 card offers to cover it (BUD-19).
- Irregular income categories (Bonus, Freelance & self-employment, Tax refund, Other income) default to 0 expected in the wizard. A household that lives on irregular income sets a **base expected income** instead (BUD-13).
**Notes:** Using the plan and not actuals is why a bonus needs an explicit decision, in the spirit of YNAB's "give every złoty a job" ([YNAB sinking funds](https://www.ynab.com/blog/what-is-a-sinking-fund)). The 5% threshold keeps interest and small transfers from raising a card every month (defaults table).

#### BUD-05 Refunds · Must · M2
As a household, I want refunds to count predictably, so that a refund doesn't rewrite a finished period or look like income.
**Acceptance criteria**
- A refund (an inflow in an expense category, including ones TXN marks as a refund) counts in the budget period of **its own date**, not the period of the original purchase.
- It lowers the net spending of its category in that period:
  - flexible: left to spend goes up;
  - fixed: fixed actual goes down, which can cancel an overrun but never raises left to spend above plan (BUD-06);
  - non-monthly: the fund balance goes up.
- A refund never counts as income, so it is never in the savings-rate income (BUD-18).
- A refund gets its category from the normal sources (CAT-05). When TXN links it to the original purchase (TXN-15), the review inbox suggests the original purchase's category, or its largest split part's category for a split purchase.
- A member can still move a specific refund to another period with the per-transaction override (TXN-05).
**Notes:** Decision: count in the period the refund lands in. The money becomes available when it arrives. Crediting the original period would change a finished period the household has already acted on, and with rollover on the effect would land in the current period anyway.

#### BUD-06 Fixed bills above, below or missing · Must · M2
As a household, I want clear rules for bills that differ from plan, so that left to spend never assumes money we don't have.
**Acceptance criteria**
- **Settled fixed category.** A fixed category is settled for the period when:
  - every occurrence of its confirmed recurring items due in the period is resolved: seen (REC-06), resolved with "Mark paid elsewhere", or skipped;
  - or, with no recurring item, its net actual has reached the expected amount. A refund or the first of two payments doesn't settle it;
  - or a member marks it "Paid in full".
- **Above expected:** the excess lowers left to spend straight away and shows as "Fixed over plan" with the categories involved. This includes a fixed category with no expected amount.
- **Below expected:** an unsettled category's unused amount stays reserved. Once a category is settled, its under-run offsets over-runs in other settled categories, but fixed over plan never goes below 0. Example: electricity +60 and gas −100, both settled: fixed over plan 0. The total under-run shows as "Fixed under plan +X" in the close and ends up in the period surplus (BUD-19).
- **Not arrived:** the expected amount stays reserved until the period ends. The Fixed bucket shows the bill as "not seen yet". When its window has passed, the inbox asks "Recurring: still unpaid?" (CAT-12):
  - **Still waiting:** it stays reserved. In the close it is listed as "Did not arrive — still waiting";
  - **Mark paid elsewhere:** paid from an account the budget doesn't see. The occurrence is resolved with nothing counted, so its amount is an under-run (it never raises left to spend and ends up in the surplus);
  - **Skip this one:** lowers this period's expected amount by that occurrence's expected amount, nothing more, and grows the flexible budget by the same amount (a plan edit).
  A bill without a recurring item that hasn't arrived is listed as "Did not arrive".
- **Release:** a member can choose "Won't come this period" on a fixed category. It releases only the part of the line not backed by a still-open recurring occurrence (with no recurring items, the whole remaining line). The expected amount for this period falls to the actual amount plus the expected amounts of its open occurrences, and the flexible budget grows by the difference (a plan edit, BUD-16). A recurring occurrence is released only by "Skip this one". The category is settled once no open occurrence remains.
  Example: Nursery & childcare expects 1,200 = nursery 900 + babysitter 300, both recurring, nothing paid yet. Skipping the nursery occurrence lowers expected to 300 and raises the flexible budget by 900, not 1,200. The babysitter's 300 stays reserved, and "Won't come this period" then releases nothing more while that occurrence is open.
- **Paid early or late:** a payment linked to a recurring occurrence counts in the occurrence's period if that period is not Settled when the link is made, and shows "Counted in <period> (paid <date>)". Otherwise it counts in the period it was paid. The decision is made once, at link time. Settling later never moves it; only a member's override or unlinking does. Examples: rent for 10 Oct paid on 28 Sep counts in October; October's bill paid and linked on 2 Nov, while October is still Provisional, counts in October.
- **Unlinked late bill:** counts by the TXN-05 date rule and may create an overrun. A member can move it with the per-transaction override. A Settled period then shows "Changed since settled".
- **Bills every 2 months:** a bill paid every 2 months (common for Polish electricity) goes in a non-monthly category with frequency 2 (BUD-07), so each period sets aside half and no period shows a full bill as over plan. Settlement and correction invoices for the same utility use the same category and fund.
**Notes:** Polish electricity sellers offer 1-, 2-, 6- and 12-month settlement periods. On the common 6-month period the customer pays forecast invoices every 2 months and a correction after the meter reading ([enerad.pl](https://enerad.pl/co-to-jest-okres-rozliczeniowy/)). Tauron's prosumers move to monthly settlement from 1 Sep 2026 ([globenergia.pl](https://globenergia.pl/rozliczenie-miesieczne-dla-wszystkich-prosumentow-co-zmieni-sie-od-wrzesnia-2026-roku/)). Gas billing cycles were not verified. Whether the household's own bills are monthly is an open question.

#### BUD-07 Non-monthly sinking funds · Must · M2
As a household, I want each non-monthly expense to build up a virtual fund every period, so that annual and seasonal costs don't wreck the month they land in.
**Acceptance criteria**
- Each non-monthly category has a target amount, a frequency (every N months, default 12) and an optional next due month.
- **Set-aside per period = target ÷ N**, rounded up to a whole currency unit. A member can override it.
- **Fund balance = opening balance + Σ set-asides − Σ net spending in the category.** Each period's set-aside is added at the start of that period. The balance carries over to every following period.
- Spending in a non-monthly category draws on its fund and never changes left to spend.
- **Shortfall:** spending beyond the balance makes it negative. The balance shows as "short by X" (in red and with a minus sign) and stays negative into later periods, so future set-asides refill it. Left to spend does not change automatically.
- "Cover from this period" lets a member move any amount up to the shortfall from this period's flexible budget into the fund. Left to spend goes down by that amount (a plan edit, BUD-16).
- **Due month and catch-up.** With a next due month set, the fund shows "on track" or "behind by X — needs Y per period", where:
  - X = target − (balance before this period's set-aside + current set-aside × P);
  - Y = (target − balance before this period's set-aside) ÷ P, rounded up, which is the current set-aside plus X ÷ P;
  - P = the periods until the due month, counting this one and the due month.
  Example (household B, first-year walk): car insurance 1,800 due in December, balance 0 in October, set-aside 150, P = 3: X = 1,800 − 450 = 1,350 and Y = 600.
   One tap ("Catch up") sets the set-aside to Y until the due month. After the due month the set-aside returns to target ÷ N. "Accept shortfall" keeps the set-aside. The fund then says it will be short in that due month, and the next one too unless the set-aside rises, because a fund that starts behind at target ÷ N stays behind by the same amount every cycle.
- **Funds behind:** the overview shows "Funds behind: X", the total of the behind amounts. It never lowers left to spend by itself.
- **Carried balance:** while the previous period is Provisional, the balance carried into the current period shows "Provisional — from <period>" and may change. Once that period settles it is fixed. A later change to fund spending in a Settled period appears as a late adjustment line in the fund for the current period, not as a silent change.
- Erasing a member's data (HH-08) does not change any fund balance: the fund keeps one "Erased member data" adjustment equal to the net spending removed.
- **Opening balance:** a member can set or change the balance at any time with an optional note, e.g. "already set aside" when starting mid-year. The change is recorded (who, when, old → new) in the plan history.
- The fund screen says the money is set aside in the plan, not held in a separate account. If the household names an account for sinking-fund money (BUD-20), the screen names it.
- The total of all fund balances is available to FC (FC-10).
**Notes:** Sinking funds as in YNAB ([YNAB](https://www.ynab.com/blog/what-is-a-sinking-fund)) and Monarch's non-monthly rollover ([Monarch](https://www.monarch.com/blog/fixed-flex-spending-what-it-is-and-how-to-get-started)). Like YNAB's cash overspending, which carries the deficit forward ([YNAB](https://support.ynab.com/en_us/when-the-month-rolls-over-a-guide-rkyyd6qC9)), a shortfall stays visible and is repaid. It is never hidden. The first-year walk below shows why "Catch up" is the wizard's default. **Not savings goals** (Later), for three reasons:
- A sinking fund is tied to an expense category and filled by the plan.
- It is spent down by ordinary spending.
- It needs no account or money movement.
Savings goals track real balances or contributions towards a wealth target (e.g. a flat deposit) and are not part of left to spend.

#### BUD-08 Planned savings and transfers to savings · Must · M2
As a household, I want transfers to savings kept out of spending and compared with what we planned, so that saving never looks like overspending and moving our own money never changes left to spend by itself.
**Acceptance criteria**
- Transactions in savings categories are never spending. **Moved to savings** = their net in the period, counted per BUD-02: into savings +, out of savings −. A linked transfer counts once.
- **Below plan:** "Moved X of Y planned" is shown; for a planned withdrawal, "Withdrawn X of Y planned". X and Y are shown as positive amounts. If money moved the opposite way to the plan, the line reads "Withdrawn 0 of Y planned · Moved X into savings" or "Moved 0 of Y planned · Withdrew X". Left to spend does not change, because the planned amount stays reserved.
- **Above plan:** **saved above plan = max(0, moved to savings − planned savings counted − unplanned income − surplus swept from last period)**. It lowers left to spend and shows as its own line with these parts. So:
  - unplanned income moved to savings doesn't lower left to spend (journey a);
  - last period's surplus moved to savings doesn't either, once marked as below (journey b).
- **Last period's surplus · Should · M2:** when a savings transfer lands in the first 7 days of a period and the previous period had a period surplus not carried by rollover (BUD-19), a card asks "Is this <period>'s surplus?". Yes marks up to that amount as "surplus swept" (TXN-13's mark). It still counts in moved to savings, but not in saved above plan.
  - **Cap:** the previous period's surplus as it stands now, minus any positive rollover carried and the expected amount of bills marked "Still waiting" (BUD-06). While that period is Provisional the cap is live and shows "Provisional — from <period>". If the cap falls below the marked amount, the swept amount falls with it and saved above plan rises.
  - **First budget period:** there is no previous result, so no card. The leftover entered in the wizard (BUD-13, Must) counts as surplus swept instead.
  - With rollover on, the carried part is already in the flexible budget, so moving it to savings simply uses it and needs no mark.
- **Withdrawals:** money out of savings is negative moved to savings, never income. A withdrawal first undoes any saved above plan, which raises left to spend by that much: taking back money saved beyond the plan returns it. Beyond that, it never raises left to spend by itself. Example: 500 saved above plan, then 800 withdrawn: left to spend rises by 500, not 800. A card asks "<amount> came out of savings. Use it for this period's spending?". <amount> is only the part beyond any planned withdrawal still outstanding: a withdrawal the plan already counts on gets no card.
  - Yes lowers this period's planned savings by that amount (a plan edit, this period only, BUD-16). The flexible budget grows by the same amount. If planned savings goes below 0, it shows as a planned withdrawal.
  - "It was fund money": re-categorises it as Sinking-fund money. Nothing is added to the flexible budget, and the bill it paid draws on its fund. This is the default answer when the money came from the BUD-20 account.
  - No (the default otherwise) leaves it as a withdrawal: "Moved X of Y planned".
- **Default, not a verdict:** a member can put either leg of a savings transfer in a transfer category (e.g. Sinking-fund money, Between own accounts). It then neither counts as savings nor touches left to spend.
- **Planned recurring withdrawals:** a recurring withdrawal (e.g. 1,000 a month during parental leave) enters the plan only as a planned withdrawal that a member sets on the savings line. REC may offer it (REC-07).
- **A planned withdrawal adds nothing to saved above plan until it happens.** Saved above plan uses only the part already withdrawn (planned savings counted, see terms). Until the withdrawal is made, left to spend shows "Assumes withdrawal not yet made: <amount>", like income not yet received. The part not made by the end of the period counts in the income shortfall (BUD-09, BUD-19). Example: household A's October with planned savings −1,000 instead of +2,000, and no transfer into savings. The flexible budget is 14,000 − 5,600 − 950 + 1,000 = 8,450, and left to spend is 8,450 − 3,350 − 60 − 0 = 5,040, with "Assumes withdrawal not yet made: 1,000".
  - On 10 Oct, 1,000 comes out of savings. Planned savings counted is −1,000 and saved above plan 0. There is no card, the assumption line goes, and left to spend stays 5,040.
  - Had 1,300 come out, the card would ask about 300 only. Yes would make planned savings −1,300, the flexible budget 8,750 and left to spend 5,340.
  - Without this rule, Yes on the full 1,000 would have made the flexible budget 9,450 and left to spend 6,040, and the close would have booked a 1,000 shortfall.
- Moving money between savings categories leaves moved to savings unchanged, because it is compared in total.
- Savings held at an institution the household doesn't track: payments in a savings category count by their direction (TXN-13).
**Notes:** The principle: moving money between our own accounts never by itself changes left to spend, except through the planned-savings line. Saved above plan exists only to catch spending money the plan had assigned elsewhere. Unplanned income and last period's surplus are money no plan line assigned, so moving them is neutral.

#### BUD-09 Flexible rollover · Should · M2
As a household, I want to choose whether leftover or overspent flexible money carries into the next period, so that one period's discipline or slip shows up in the next.
**Acceptance criteria**
- A household setting, off by default.
- When on, the next period gets a **Rollover in** line = the previous period's end left to spend − its income shortfall, positive or negative. The shortfall is included because the flexible budget assumed income that never came, including a planned withdrawal not made (BUD-08). Income that was only late is moved back by BUD-04's late-income prompt, so it isn't charged here.
- While the previous period is Provisional, Rollover in follows its live result and shows "Provisional — from <period>". When that period settles, the amount is fixed (BUD-19).
- A later change to a Settled period's result never rewrites a carried amount. The difference appears in the current period as a **Late adjustment** line that names the period and the change. Example: a 120 refund arrives for a Settled September while November is current: November shows "Late adjustment (September): +120".
- **Erasing a member's data (HH-08)** removes records, not money events: carried rollover, late adjustments and sinking-fund balances do not change. Settled periods' live results change and show "Changed since settled — member data erased". The current period changes only by erased transactions dated in it. No late adjustment line is created for erasure.
- Rollover applies only to the flexible bucket. Sinking funds always carry. Fixed under plan, savings and unplanned income never carry; they end up in the period surplus and net saved.
- Turning it on: the first carry is the current period's end result. Turning it off: nothing carries from the end of the current period onward, and the current period keeps any rollover it already received.
- "Reset rollover" sets the current period's rollover and late adjustment lines to 0. It is recorded as a plan edit.
- A negative rollover or late adjustment is shown with a minus sign, in red, with an explanation.
**Notes:** Monarch allows positive and negative rollover, including for the flex bucket ([Monarch rollovers](https://www.monarch.com/blog/rollovers-and-referral-rewards), [help](https://help.monarch.com/hc/en-us/articles/4411119762196-Rollover-Budgets)).

#### BUD-10 Budget period · Must · M2
As a household, I want the budget period to be either the calendar month or anchored to payday, so that a period starts when the money arrives.
**Acceptance criteria**
- There is one household setting, hosted in SET (SET-05) and changed by Owners only (HH-02): **calendar month** (default) or **payday-anchored** with an anchor day from 1 to 31, or "last working day of the month".
- A payday-anchored period starts on the anchor day (adjusted per BUD-11) and ends the day before the next period starts. If the anchor day is past the end of the month, the period starts on the last day of that month.
- Each period is labelled with its start and end dates.
- **Paydays on a weekday pattern** (e.g. "second Thursday", REC-08) are offered as the **earliest day of the month they can fall on** (second Thursday → 8th), so the salary never lands before its period starts. The same rule is used by REC-08. Early arrivals (a holiday, an employer paying early) are handled by BUD-11's prompt and the item's "funds the next period" flag (REC-08).
- **Partners paid on different dates:** there is one anchor for the household.
  - The wizard lists each recurring income's usual payday and suggests the payday of the largest one.
  - If any other recurring income usually lands within 5 days of that anchor, it warns that this income may fall into the wrong period, and suggests calendar month or another anchor. 5 days matches the early-salary window (BUD-11), so the warning covers the same cases the prompt would otherwise raise every period.
- **Changing the setting:** from M3 this follows BUD-12. In M2 the setting can be changed only until the first period is Settled. The change then re-dates the current period at once, and its plan is kept.
**Notes:** Emma offers payday-based periods, including "last working day", and recommends calendar month when there are several incomes ([Emma](https://help.emma-app.com/en/article/what-is-a-period-in-emma-o5u7bx)).

#### BUD-11 Payday on non-working days and early salary · Must · M2
As a household paid on a fixed day, I want periods to follow the real payday when it moves, so that salary doesn't land in the wrong period.
**Acceptance criteria**
- If a payday-anchored period start falls on a Saturday, a Sunday or a public holiday in SET's holiday calendar (SET-05), the period starts on the **previous working day** (default) or the next working day (household setting). Without a holiday list for the country, only weekends count (SET-05).
- Examples:
  - anchor 10, and 10 Jan 2027 is a Sunday, so the period starts on Fri 8 Jan 2027;
  - anchor 3, and 3 May 2026 is a Sunday; 2 May is a Saturday and 1 May a public holiday, so the period starts on Thu 30 Apr 2026.
- **Which period a payment counts in:** a payment linked to a recurring occurrence counts in its occurrence's period if that period isn't Settled when the link is made, otherwise in the period it was paid (decided at link time, BUD-02, BUD-06). An income occurrence due on 3 May 2026 that is paid on 30 Apr counts in the period of 3 May. No prompt is needed.
- **Early-salary prompt:** when recurring income (REC) arrives in the last 5 days before the next period starts and the linked-payment rule above doesn't already count it in the next period, the budget asks "Count this in the next period?":
  - "Yes, this time": applies the per-transaction period override (TXN-05);
  - "Yes, always for <item>": sets the REC income item's "funds the next period" flag (REC-08 holds it). From then on that rule places it, and the prompt stops for that item;
  - "No": nothing moves. The prompt doesn't come back for that transaction.
  Nothing moves without an answer.
- The prompt is shown only when the income line would still have received its expected amount in this period without this payment. So it never moves a period's only salary, which would show that period short for money it received. The first period is handled by the wizard question "Does this pay fund the next period?" (BUD-13).
- The prompt also appears in calendar-month mode, e.g. for a salary normally paid on the 1st that arrives on Fri 30 Oct 2026 (1 Nov is a Sunday and a holiday) and is meant for November. October's own salary came on 1 Oct.

#### BUD-12 Changing the period setting · Should · M3
As an Owner, I want to switch between calendar and payday periods, or change the anchor, without breaking history, so that the budget can follow a new job.
**Acceptance criteria**
- The change takes effect at the end of the current period. Past periods keep their dates, plans and results.
- A **transition period** runs from the end of the current period to the first start date under the new setting. If that is shorter than 14 days, the transition runs on to the start date after that, so it lasts 14–44 days.
- For the transition period, the app proposes a plan that the member confirms or edits:
  - income, fixed and savings amounts from the occurrences of recurring items due within it (BUD-01);
  - other fixed amounts, set-asides and planned savings prorated by day count.
- Example: switching on 14 Oct 2026 from calendar month to anchor 25. October (1–31 Oct) is unchanged. The transition is 1–24 Nov (24 days). Then the period from Wed 25 Nov follows the new setting.
- Reports run by budget period. The transition period appears in them as its own period, labelled "Transition (N days)". It never counts as a complete period in averages or comparisons (INS-03).
**Notes:** Moved from Must · M2 to Should · M3. In M2 a change is possible only before the first settle (BUD-10). A new job in the first months is the case this leaves out.

#### BUD-13 Setup wizard (incl. short history) · Must · M2
As a household, I want a wizard that suggests our plan from history, and still produces a usable plan with under 90 days of data, so that we can start budgeting in minutes.
**Acceptance criteria**
- The wizard is offered when the household has no plan, and it can be re-run at any time. A re-run shows the current and proposed plans side by side and replaces the current and future periods only after confirmation.
- **First period:** the plan covers the whole current period, including transactions from before the wizard was run. When fewer than 7 days of the current period are left, the wizard offers to start from the next period instead, and the current one is shown without a plan.
- Steps:
  1. Period (BUD-10), with the detected paydays.
  2. Income: confirmed recurring income (REC) rolled up per BUD-01, plus the irregular categories at 0 with their history shown, and a one-tap **base expected income** = "the lowest of the last 3 full periods" for households living on irregular income. For each recurring income item it asks "Does this pay fund the next period?" (the "funds the next period" flag; see below).
  3. Fixed: per fixed category, the roll-up of its confirmed recurring items (BUD-01), or the history-based amount (short history below). A recurring item due less often than monthly is suggested as non-monthly (REC-07).
  4. Non-monthly: per category, the last 12 months' total as the suggested yearly target. If history covers less than 12 months, a checklist of common non-monthly costs with blank amounts (car insurance, property tax, holidays, gifts, school start, vet). For each fund the wizard also asks:
     - the next due month (optional);
     - how much is "already set aside" (the opening balance, default 0);
     - for a fund that would be behind: "Catch up" (the default) or "Accept shortfall" (BUD-07).
     When BUD-20 is available, it also asks whether the household keeps fund money in a real account.
  5. Planned savings: confirmed recurring savings transfers (REC-07) and history, or a % of expected income. Also "Money left over from before budgeting that you'll move to savings this period" (default 0).
  6. Result: the flexible budget next to usual flexible spending from history. If the flexible budget is more than 10% below it, the wizard warns "This plan leaves less than you usually spend on flexible items".
- Every suggestion shows its basis, e.g. "median of last 3 periods", "recurring item: Netflix 60 zł", "from 1 payment", "estimate from 20 days".
- Every amount can be edited, and the wizard can be finished with blanks (treated as 0).
- If recurring detection has no results, the wizard still works from history and manual entry.
- **Recurring items confirmed in the wizard start at the first budget period's start date**, so salary or rent already paid in that period has its occurrence and links to it (BUD-01, BUD-06). Items created after setup follow REC (nothing created in the past).
- **Leftover from before budgeting (first period only).** The step-5 amount counts as surplus swept in the first period (BUD-08), so moving it to savings doesn't lower left to spend. It counts only up to what was actually moved beyond planned savings counted and unplanned income: surplus swept = min(leftover, max(0, moved to savings − planned savings counted − unplanned income)). An amount entered but never moved changes nothing. This needs no BUD-08 card.
- **Pay that funds the next period.** If the answer in step 2 is yes, the item's most recent payment before the first period starts (within history) becomes the occurrence that funds the first period, and links to it. The period is decided at link time, so the payment counts in the first period. Later payments fund the following period as usual. If history has no such payment, the first period shows that income as not yet received (BUD-04).
  Example: calendar month, wizard run on 5 Oct 2026, salary 5,500 paid on the 28th.
  - Yes: the 28 Sep payment counts in October ("Counted in October (paid 28 Sep)"), and October shows received 5,500 of 5,500. The 28 Oct payment funds November through the same rule, so BUD-11 doesn't ask.
  - No: the 28 Oct payment counts in October. BUD-11 doesn't offer to move it, because it is October's only salary.
- **Short history.** A **full period** is a past period that is Settled (BUD-19) with no coverage gap, as INS-03 counts it. A period settled with "Settle now" over a gap is not full. For periods before the first plan, which are never settled, it is one that meets the same conditions: every budget-side account covers it completely with no gap (ACC-13) and has data up to the end of its settling window. A Provisional period still waiting for data never feeds medians or base expected income.
- Suggestions by history (the wizard's "history" in the steps above):

| History | Suggestions |
|---|---|
| 3 or more full periods | median of the last 3 full periods |
| 1–2 full periods | average of the available full periods, labelled "low confidence" |
| 14 days to under 1 full period | flexible amounts scaled up to the period length, labelled "estimate from N days". Non-monthly from the checklist only |
| under 14 days | recurring items (if any) and manual entry only. No history-based amounts |

- **Fixed amounts are never scaled.** A fixed category without a confirmed recurring item is suggested at its last payment, labelled "from 1 payment", or the median of its payments when there are several.
- **Which window:** flexible amounts are scaled over the window that every budget-side account covers (e.g. only the partner's 90 days when the other account has 2 years of CSV). Fixed and non-monthly suggestions use each category's own coverage.
- Example: 20 days of history, 31-day period. Rent 3,200 is suggested as 3,200 "from 1 payment". Scaling it by days would have given 3,200 × 31 ÷ 20 = 4,960. Groceries of 1,200 in those 20 days are suggested as 1,860, "estimate from 20 days".
- With under 90 days of history, the wizard first suggests importing older history by CSV (see TXN — CSV import).
- A plan built from fewer than 3 full periods is labelled **"Draft"** ("Provisional" is kept for unsettled periods). On day 1 of each new period, until 3 full periods exist, the day-1 card (BUD-19) offers "Update plan from N periods of data?" with old and new plans side by side. A member can accept or dismiss it.
**Notes:** Counting the whole current period differs from YNAB, where "there's no need to record transactions or bills you've already paid before starting" ([YNAB](https://support.ynab.com/en_us/starting-ynab-in-the-middle-of-the-month-a-guide-rJH96acA9)). Here the transactions are already imported, and dropping them would make left to spend too high. The 7-day cut-off avoids a first period that is almost over.
**Depends on:** SPIKE-01 (history depth decides how often the short-history path is used. The decision gate makes short history a design case)

#### BUD-14 Wizard with short history · merged into BUD-13
Merged into BUD-13. The ID is kept so references stay valid; the short-history rules, the full-period definition and the "Draft" label are in BUD-13.

#### BUD-15 Daily pace and over-pace flag · Must · M2
As a Member, I want to see whether we are spending flexible money faster than the period allows, so that we can adjust before running out.
**Acceptance criteria**
- **Pace measures flexible spending only.** **Pace line** = flexible budget × d ÷ N, where d is today's day number in the period (1…N, today included) and N is the period length in days.
- **Over pace** when flexible spent − pace line > 5% of the flexible budget. The flag is not shown in the first 3 days of a period.
- The budget shows "X below pace" or "X over pace". When left to spend is 0 or less, "below pace" is not shown, so it never sits next to "Over by X".
- **Lump sums:** a repayment in "Credit card repayment (untracked card)" pays for a month of card use in one go. Pace leaves this period's net in that category (R) out of both sides: it compares flexible spent − R with (flexible budget − R) × d ÷ N, and the 5% tolerance is of flexible budget − R. Left to spend and the daily amount still include R. Example: flexible budget 6,000, 30 days, day 5, a 2,100 card repayment and 800 of other flexible spending. Pace line (6,000 − 2,100) × 5 ÷ 30 = 650, so 150 over pace, under the 195 tolerance: no flag. Counting the repayment would have shown 1,900 over pace every month.
- **Daily amount available** = left to spend ÷ (N − d + 1). If left to spend ≤ 0, it shows "Over by X".
- Fixed over plan and saved above plan lower left to spend, and so the daily amount, but they never trip the pace flag. Pace answers "are we spending flexible money too fast?". Left to spend answers "how much is left?".
- The over-pace flag appears only in the app: the budget page and the dashboard. There are no notifications.
- If the flexible budget is ≤ 0, the flag is replaced by a message that names the cause:
  - "Plan exceeds expected income" (BUD-01) when the plan alone leaves nothing, before rollover and late adjustments;
  - "Last period's overspend uses up this period's flexible budget" when the plan leaves money but a negative rollover in or late adjustment takes it to 0 or below (BUD-09).
- When left to spend is stale, the pace line carries the same warning (BUD-17). When flexible spent includes uncertain items, missing data or an account not updating, the pace figures carry the BUD-02 footnotes.
**Notes:** The earlier draft compared "used" (flexible budget − left to spend) with the pace line. That counted a bill over plan or extra savings as fast flexible spending. Copilot's dashboard works the same way as this rule: its "dotted line... represents the ideal spending rate", and "Any recurring transactions expected to post in the current month are not included in the chart" ([Copilot](https://intercom.help/copilotmoney/en/articles/6045480-dashboard-tab-overview)). Pace is linear. Spending that comes in lumps (e.g. a weekly shop) can trip the flag early, which is why there is the 5% tolerance and the 3-day grace.

#### BUD-16 Mid-period plan edits · Must · M2
As a Member, I want to change the plan during a period, so that we can rebalance when life changes.
**Acceptance criteria**
- Any member can change expected income, fixed amounts, set-asides and planned savings in the current period. The flexible budget and left to spend update immediately.
- A member who edits a plan amount directly is asked "This period only" or "This and future periods" (default).
- **One-period actions ask no scope question** and change only the current period: "Skip this one" (BUD-06, REC-12), "Won't come this period" (BUD-06), "Cover from this period" (BUD-07), "Cover it this period" (BUD-19), the unplanned-income choices (BUD-04) and "Use it for this period's spending" (BUD-08).
- **The same default applies when a change starts in REC**: confirming, adding or changing a recurring item (its amount, frequency, category or type, or accepting a price change) asks the same question with the same default. It creates one record, "Plan changed by <member>: <item>, <line> old → new". REC never changes the plan without a member action.
- **Mark ended (M2):** a member sets a recurring item's end date in REC. Its occurrences after that date leave the plan lines (BUD-01) as a plan edit from the period after the one containing the end date onward, recorded with the item's name. It asks no scope question. In the current period, an amount the item leaves behind is released with "Won't come this period" (BUD-06).
- The plans of past periods are read-only from the moment the period ends. Future periods can be edited one at a time. The only exception is a base-currency change (SET-10): it converts past plans at each period's start-date rate, labelled "converted from <old currency>", and is not a plan edit.
- **Plan history** for each period records, with member, time and old → new:
  - plan line edits, including those from REC (incl. Mark ended, Skip this one, Mark paid elsewhere), unplanned-income choices (BUD-04) and "Use it for this period's spending" (BUD-08);
  - flex-type changes (CAT-04) and merges (CAT-03);
  - fund changes: opening balance, catch-up, cover, shortfall choice (BUD-07);
  - rollover reset (BUD-09);
  - the settle, with who or "automatically" (BUD-19), and each late adjustment line (BUD-09).
- Money is rebalanced by editing lines. For example, lower planned savings to raise the flexible budget. There is no separate "move money" feature in v1.
**Notes:** Mid-period rebalancing as in Copilot. REC-18 proposed "next budget period" as the default for REC-originated changes. BUD's default (BUD-16) is the only one.

#### BUD-17 Stale-data warning on budget numbers · Must · M2
As a Member, I want to know when left to spend may be out of date, so that I don't trust a number built on a broken connection or an old import.
**Acceptance criteria**
- Left to spend, pace and the budget screen show "Data as of <date and time>": the oldest "Data up to" (ACC-13) among budget-side accounts that can be stale.
- Which accounts can be stale is set by ACC-13 and BANK-09, not by BUD: connected accounts per BANK-09, CSV-fed accounts against SET's threshold for manual accounts ("Import due for <account>"), cash accounts only when opted in with "Track freshness for this account" (ACC-13). Value-type accounts are never budget-side.
- When any budget-side account is stale, or its connection is broken, expired or revoked, a warning appears next to left to spend. It names each affected account with its "Data up to" and links to the fix (re-consent or sync, see BANK; "Import CSV" or "Count cash", see ACC-13). The number stays visible.
- An expiring consent is not stale. It appears only in the header note and on connection screens. The budget shows no marker for it.
- The warning disappears when every affected account is up to date again.
- **Missing data and not updating:** a coverage gap in the current period, or an included account disconnected with "Keep data", shows its BUD-02 footnote next to left to spend, with the same fix links. Unlike staleness, a gap stays until the data is imported.
- **Coverage note:** when a member has no account included in the budget, the budget screen says "<member> has no accounts in the budget", so a partner's missing spending is not mistaken for no spending.

#### BUD-18 Savings rate (shared definition) · Must · M2
As a household, I want one savings rate definition used everywhere, so that the budget and reports never disagree.
**Acceptance criteria**
- Counting follows BUD-02. **Income** = net of income categories. **Spending** = net of fixed, non-monthly and flexible categories plus uncategorised outflows. Transfer and savings categories and excluded transactions are ignored. Only actual transactions count: set-asides and plan amounts do not.
- **Net saved = income − spending. Savings rate = net saved ÷ income**, shown as a percentage with one decimal. If income ≤ 0, it shows "—".
- It can be calculated for any budget period or date range. A range rate uses the range's totals, not an average of period rates. INS must use this definition.
- Next to a period's rate:
  - **"Non-monthly paid from funds: X"**, so that a period in which a 6,000 holiday is paid explains its low rate;
  - **"Last 12 periods: Y%"**, the rate over the last 12 Settled periods without a coverage gap (as INS-03 counts them), which smooths out funds being spent;
  - **moved to savings**, as information only. It is not part of the rate.
- Categories count with the flex type they had in the period concerned (CAT-04).
- The figure shows "incl. N uncategorised (<amount>)", "incl. N pending (<amount>)" and the BUD-02 footnotes (uncertain items, missing data, not updating) when relevant, and the stale warning (BUD-17) for the current period.
**Notes:** This is a cash-flow definition. It works for households that don't transfer to a savings account. The full mortgage instalment counts as spending, principal included, so the rate is conservative. A rate measured against the plan (set-asides counted as saved) is not in v1 (see Open questions).

#### BUD-19 Period close (Settle) and day 1 · Must · M2
As a household, I want each period to close in one step with a clear result, and the new period to start with what we need to decide, so that closing the month is one screen and nothing changes behind our backs.
**Acceptance criteria**
- **When it settles.** Settle is run from the recap (INS-23), as one action. A period settles automatically when its settling window has ended, every budget-side account's data reaches the end of that window, and no budget-side account has a coverage gap inside the period. That means:
  - connected accounts: a successful sync after the window ended;
  - CSV-fed accounts: "Data up to" on or after the window's end;
  - cash accounts don't block it unless the household has opted them into staleness;
  - a coverage gap blocks it with "Missing data for <account> <date range>". History that starts mid-period ("History starts <date>") is not a gap;
  - an account with an end date before the period end never blocks it, including one disconnected with "Keep data". An undecided account (e.g. a replaced card) blocks it with "Waiting for a decision on <account>" (ACC).
- Until then the period is **Provisional**, with "Waiting for <account> to sync" (connected) or "Waiting for <account> data up to <date>" (CSV-fed) where data is missing. Any member can "Settle now". The confirmation names what is missing, including each coverage gap with its account and dates, and the record names who settled.
- Open review-inbox items don't block it: the period reads "Settled with N open items" (CAT-12). Settle cannot be undone.
- **What Settle freezes** (the snapshot):
  - the plan: every line, the flexible budget, rollover in and late adjustments;
  - flexible spent, fixed actual, fixed over plan and fixed under plan;
  - planned savings, planned savings counted, moved to savings and saved above plan;
  - expected income, income received, unplanned income and income shortfall, per income line, with any planned withdrawal not made (BUD-08);
  - end left to spend and period surplus;
  - rollover carried into the next period (BUD-09);
  - each fund's balance, and whether it is behind or short. This is the balance carried into the next period;
  - "Did not arrive" fixed items, marking those "still waiting" (BUD-06);
  - net saved and the savings rate (BUD-18);
  - the counts behind the footnotes: pending, uncategorised, and uncertain items with their count and amount, plus any coverage gaps and not-updating accounts.
- **Fixed under plan (close)** = fixed expected − fixed actual + fixed over plan. This includes bills that did not arrive.
- **Period surplus** = end left to spend + fixed under plan (close) + not moved to savings − income shortfall, where not moved to savings = max(0, planned savings counted + unplanned income + surplus swept from last period − moved to savings). With a planned withdrawal, the close shows not moved to savings as "Not moved to savings or withdrawn beyond plan". The period surplus is the money the period left unused outside the funds. It is what "last period's surplus" (BUD-08) refers to.
- **After Settle:** results stay live. Each snapshot figure that later differs shows both values ("At settle: X · Now: Y") with "Changed since settled: N changes" (INS-23). Rollover and funds don't change silently: the difference appears as a late adjustment (BUD-09). This includes a booked transaction later reported as cancelled or rejected, data deleted or restored from Recently deleted (SET-11), "Include in budget" applied to past periods (ACC-03) and past card repayments re-linked as transfers (TXN-14). Erasure leaves carried values unchanged (BUD-09, HH-08).
- **Day 1 of a new period:**
  - The plan is copied ("this and future periods" lines, BUD-16).
  - A "Last period" card on the budget screen shows:
    - the previous period's state (Provisional or Settled);
    - its end left to spend and period surplus;
    - the rollover carried, "Provisional — from <period>" until that period settles;
    - "Did not arrive" items and funds behind;
    - open decisions: an unplanned-income card not yet answered (counts as "keep it" if left);
    - with rollover off and an income shortfall: "Cover it this period", which lowers this period's flexible budget by up to the shortfall (a plan edit);
    - the Draft plan update offer (BUD-13).
  - The card links to the recap (INS-23).
- **M2 minimal close:** the recap shows these figures as BUD's close, and the past-period view in BUD (BUD-03) shows the same snapshot. The fuller recap is INS's.
**Notes:** The work is split: BUD owns what is frozen, what carries and day 1; INS owns the recap page and the Settle action.

#### BUD-20 Sinking-fund money kept in a real account · Should · M2
As a household that moves set-aside money into a separate account, I want those transfers kept apart from savings, so that fund money isn't counted twice or seen as missing savings.
**Acceptance criteria**
- A household setting, asked in the wizard (BUD-13): "We keep sinking-fund money in <account>", with "holds only fund money" or "also holds savings".
- **The account must be in the budget.** Turning the setting on also turns on "Include in budget" for that account (ACC), after a confirmation that says so. Otherwise a bill paid straight from it would never draw on its fund (BUD-07).
- **Only fund money:** transfers to and from that account default to the category Sinking-fund money (transfer type). They neither count as savings nor change left to spend. Fund balances stay virtual (BUD-07).
- **Also holds savings:**
  - inflows are split automatically: Sinking-fund money up to this period's set-asides not yet moved to the account, Savings for the rest. The review inbox lists the split for a member to confirm or change, and it counts as split meanwhile. So the set-asides never show as saved above plan while nobody has answered;
  - outflows default to Sinking-fund money, with a one-tap "It was savings".
- Without the setting, a household can get the same result with two separate transfers (one for funds, one for savings) and a rule (CAT-07).
- The fund screen names the account. FC uses the total of all fund balances (BUD-07).
- **Fund account check · Could · M2:** the fund screen shows the account's balance next to the total of fund balances, and the difference.
**Notes:** It is worked through as savings journey (d) in "Savings journeys" below. Whether the household keeps fund money in a savings account is an open question.

#### BUD-21 Prompt for a chronically off plan line · Should · M3
As a household, I want to be told when a fixed or income line is always off, so that the plan stops quietly holding money we never need, or assuming money we never get.
**Acceptance criteria**
- After 3 Settled periods in a row in which a fixed category or income line differs from its expected amount in the same direction, by more than 10% and at least 20 zł each time, the line shows "Usually X, plan says Y. Update plan?".
- Accepting applies a plan edit with "This and future periods" (BUD-16). Dismissing hides the prompt for that line for 3 periods.
- Lines fed by a recurring item point to REC's own price-change flag instead, so the household isn't asked twice.
- Income lines set from the wizard's base expected income, and lines expecting 0 (e.g. Bonus), are never prompted: they are low or zero on purpose.
**Notes:** A bill always 40 under plan holds 480 a year that reaches only the surplus, never left to spend.

##### Worked example: October 2026, household A (informative)
Household A is established: it has budgeted for a while and its funds are running (the car insurance fund holds 1,200 before October). Calendar-month period, 31 days, rollover off, all accounts current.

**Plan**

| Line | Amount (zł) |
|---|---|
| Expected income (two salaries 8,500 + 5,500) | 14,000 |
| Fixed: rent 3,200, building fees 650, electricity 250, internet 180, nursery 1,200, streaming 120 | −5,600 |
| Non-monthly set-asides: car insurance 1,800/yr → 150; gifts 2,400/yr → 200; holidays 6,000/yr → 500; repairs 1,200/yr → 100 | −950 |
| Planned savings | −2,000 |
| **Flexible budget** | **5,450** |

**Actuals by 20 Oct (d = 20, N = 31)**
- Income received: 14,000. Matches plan, so unplanned income is 0.
- Fixed: every bill seen, all categories settled. Electricity came to 310. Fixed actual 5,660. **Fixed over plan 60.**
- Non-monthly: car insurance (OC) paid, 1,750. The fund was 1,200 before October, plus the 150 October set-aside, minus 1,750: **−400, "short by 400"**. Left to spend is not affected.
- Savings: transfer from the joint account to the savings account 2,500. It counts once, as moved to savings. **Saved above plan = max(0, 2,500 − 2,000 − 0 − 0) = 500.**
- Flexible: groceries 1,900, restaurants 450, fuel 600, clothing 700 (3,650 gross). On 5 Oct came a **refund of 300** for shoes bought on 25 Sep. It counts in October and brings Clothing to 400 net. **Flexible spent 3,350.**
- Count as nothing: partner's personal account → joint account 1,000 (Between own accounts); repayment of the tracked credit card 2,100.

**Results**
- Left to spend = 5,450 − 3,350 − 60 − 500 = **1,540**.
- Pace line = 5,450 × 20 ÷ 31 = 3,516.13. Flexible spent 3,350 is 166.13 **below pace**, so no flag. The earlier draft counted "used" = 3,910 and showed the flag although flexible spending was below pace.
- Daily amount available = 1,540 ÷ (31 − 20 + 1) = 1,540 ÷ 12 = **128.33**.
- Net saved = 14,000 − (5,660 + 1,750 + 3,350) = 3,240, so the **savings rate is 23.1%**, shown with "Non-monthly paid from funds: 1,750". Moved to savings: 2,500 (information only).
- If the refund had been credited to September, October's flexible spent would be 3,650 and left to spend 1,240.

##### Savings journeys (informative)
All start from household A's October and change only what is stated.

**(a) Bonus moved to savings.** A 3,000 bonus arrives on 15 Oct and is moved to savings the same day.
- Income received 17,000. The Bonus line expects 0, so unplanned income is 3,000 (counted per line, BUD-04). Moved to savings 5,500.
- Saved above plan = max(0, 5,500 − 2,000 − 3,000 − 0) = 500. Left to spend = 5,450 − 3,350 − 60 − 500 = **1,540**, unchanged by the bonus. Accepted: the bonus is saved and left to spend doesn't change.
- Net saved = 17,000 − 10,760 = 6,240, savings rate 36.7%.
- The card "Unplanned income +3,000" was left as "keep it". Two other answers, if the bonus stays in the account instead:
  - add to this period's flexible budget: expected income 17,000, flexible budget 8,450, moved 2,500, saved above plan 500, left to spend 8,450 − 3,350 − 60 − 500 = 4,540;
  - add to the Holidays fund: expected income 17,000 and the Holidays set-aside 3,500 for October, so the flexible budget stays 5,450 and left to spend 1,540. The Holidays fund grows by 3,000.

**(b) Sweeping last period's surplus.** October instead ends with flexible spent 4,290 (everything else as above). End left to spend = 5,450 − 4,290 − 60 − 500 = 600. Period surplus = 600 + 0 + max(0, 2,000 + 0 + 0 − 2,500) − 0 = 600.
- Rollover off. On 2 Nov they move 600 to savings and answer the card "Is this October's surplus?" with Yes. On 10 Nov they move the usual 2,000.
- November: moved 2,600, swept 600. Saved above plan = max(0, 2,600 − 2,000 − 0 − 600) = 0. Left to spend is untouched. Accepted.
- Without the mark, saved above plan would be 600 and November's left to spend 600 lower.
- With rollover on: November's flexible budget is 5,450 + 600 = 6,050. The swept cap is 600 − 600 = 0, so no card. Saved above plan = 2,600 − 2,000 = 600. Left to spend is the same as with rollover off and the mark: the carried 600 is used by the move.

**(c) Taking money out of savings for an emergency.** October with moved to savings 2,000 (exactly as planned): left to spend = 5,450 − 3,350 − 60 − 0 = 2,040.
- A phone breaks: 800, Electronics (flexible). Left to spend 1,240.
- They move 800 back from savings. Moved to savings = 2,000 − 800 = 1,200, "Moved 1,200 of 2,000 planned". Saved above plan 0. Left to spend stays 1,240: the withdrawal alone doesn't raise it.
- They answer "Use it for this period's spending?" with Yes: planned savings for October becomes 1,200, the flexible budget 6,250, and left to spend = 6,250 − 4,150 − 60 − max(0, 1,200 − 1,200) = **2,040**. Accepted: the withdrawal paid for the emergency and the plan says so.
- Net saved = 14,000 − (5,660 + 1,750 + 4,150) = 2,440, savings rate 17.4%.

**(d) Sinking-fund money kept in the savings account.** The household moves 2,950 to savings each month: 2,000 savings plus the 950 set-asides. In October they move the insurance money back: 1,750 out of savings, then OC paid.
- Default (no BUD-20): moved to savings = 2,950 − 1,750 = 1,200. Before the withdrawal, saved above plan was 950: the set-asides lowered left to spend twice. After it, savings look 800 under plan.
- Answering the withdrawal card with "It was fund money" (BUD-08) fixes the 1,750, not the monthly 950 counted as savings. That needs BUD-20 or two separate transfers.
- With BUD-20 ("also holds savings"): the 2,950 is split automatically into Savings 2,000 and Sinking-fund money 950, and the 1,750 withdrawal defaults to Sinking-fund money. Moved to savings 2,000 of 2,000. Saved above plan 0. Left to spend = 5,450 − 3,350 − 60 − 0 = 2,040. The fund still shows −400.

##### Starting in October: the first year of funds, household B (informative)
Household B is a different household from A: same plan, but new to budgeting. It runs the wizard in October 2026. Every fund starts at 0, with nothing "already set aside". Car insurance (1,800) and gifts (2,400) are due in December, holidays (6,000) in July 2027. Repairs (1,200) has no due month.

| Fund | Due | At target ÷ N | With "Catch up" (default) |
|---|---|---|---|
| Car insurance | Dec 2026 | 150 × 3 = 450 by Dec: **short 1,350** | 1,800 ÷ 3 = 600 per period Oct–Dec |
| Gifts | Dec 2026 | 200 × 3 = 600 by Dec: **short 1,800** | 2,400 ÷ 3 = 800 per period Oct–Dec |
| Holidays | Jul 2027 | 500 × 10 = 5,000 by Jul: **short 1,000** | 6,000 ÷ 10 = 600 per period Oct–Jul |
| Repairs | none | 100 | 100 |

- With catch-up, set-asides total 600 + 800 + 600 + 100 = 2,100 for Oct–Dec, so the flexible budget is 14,000 − 5,600 − 2,100 − 2,000 = **4,300**. Jan–Jul 2027: 150 + 200 + 600 + 100 = 1,050, flexible budget 5,350. From August 2027: 950, flexible budget 5,450. Every fund then meets its due month.
- With "Accept shortfall", the flexible budget is 5,450 from October and the overview shows "Funds behind: 4,150" (1,350 + 1,800 + 1,000). Left to spend overstates safe spending by 4,150 spread over the year. Car insurance after December: −1,350 + 12 × 150 = 450 before the next payment, short 1,350 again. Catching up from January needs (1,800 + 1,350) ÷ 12 = 262.5, rounded up to 263 per period.
- This is why the wizard asks for due months and opening balances, and why "Catch up" is its default.

##### Irregular income with rollover on (informative)
A freelance household sets a base expected income of 6,000 ("lowest of the last 3 full periods"). Fixed 3,000, set-asides 500, planned savings 500, so the flexible budget is 2,000. No non-monthly spending in these months.
- **Month A:** 9,000 received, so unplanned income 3,000. One card, "Unplanned income +3,000", left as "keep it". They move 3,000 + 500 to savings: saved above plan = max(0, 3,500 − 500 − 3,000) = 0. Flexible spent 2,000, end left to spend 0. Net saved 9,000 − 5,000 = 4,000, savings rate 44.4%.
- **Month B:** 4,000 received, income shortfall 2,000. "Assumes income not yet received" shows until the period ends. Moved to savings 500, flexible spent 1,900, end left to spend 100. Rollover carried = 100 − 2,000 = −1,900. Net saved 4,000 − 4,900 = −900, savings rate −22.5%.
- **Month C:** flexible budget 2,000 − 1,900 = 100. The missing money shows up where it bites. To spend normally they can take money out of savings and use it for spending (journey c), or lower planned savings.
- With rollover off, month C's day-1 card instead offers "Cover it this period" for the 2,000 shortfall (BUD-19).

##### Defaults and what would change them (informative)

| Default | Value | Why | What would overturn it |
|---|---|---|---|
| Over-pace tolerance (BUD-15) | 5% of flexible budget, flag from day 4 | a weekly shop is about a quarter of groceries and trips a linear line early | over-pace flags the household dismisses as wrong in 2 of the first 3 periods |
| Payday proximity warning (BUD-10) | 5 days | same as the early-salary window, so one window covers both | the household's two paydays regularly 6–7 days apart |
| Early-salary window (BUD-11) | last 5 days of the period | Polish paydays shift by up to 3 days over a long weekend (e.g. 3 May 2026 paid on 30 Apr) | an income item paid earlier than this |
| Unplanned income card (BUD-04) | above 5% of expected income | 1% (140 zł on 14,000) would fire on normal payslip variation and interest | bonuses under 5% that the household wants to place |
| Learned pattern (CAT-10) | 2 consistent manual categorisations; intermediaries suggestion only | quick to learn without learning from one-offs | wrong learned categories found in the review inbox |
| Wizard warning (BUD-13) | flexible budget more than 10% below usual flexible spending | ordinary month-to-month variation is under 10% | the warning shown for plans the household then keeps |
| Short-history bands (BUD-13) | 14 days; 1 and 3 full periods | under 14 days misses most monthly bills | SPIKE-01 history depth |
| Late-income prompt (BUD-04) | income in the first 7 days on a line that was short last period | a salary late by a long weekend lands within days | late salaries arriving after day 7 |
| Pace lump sums (BUD-15) | only Credit card repayment (untracked card) | the one flexible category paid in a single monthly lump by design | another category that trips pace every month and the household dismisses |
| Surplus card (BUD-08) | savings transfer in the first 7 days | a sweep usually happens right after the period ends | sweeps done later in the period |
| Chronic line prompt (BUD-21) | 3 settled periods, more than 10% and at least 20 zł | one or two odd months are noise | prompts the household dismisses |
| Settling window (INS-23) | 5 days | the month review is around the 5th; Erste's booked transactions arrive within about a day (SPIKE-01, G14) | a bank whose lag from budget date to first sync is longer, at most 14 |
| First-period cut-off (BUD-13) | fewer than 7 days left | too short to learn anything from | — |
| Pending expiry | owned by TXN (TXN-07) | — | — |

### 4.8 Bills & subscriptions (REC)
REC finds and tracks **recurring items**: bills, subscriptions, recurring income and recurring transfers between our own accounts. It supplies the BUD setup wizard (expected income, fixed and non-monthly amounts, each income item's usual payday), the cash-flow forecast (expected dates and amounts) and, from M3, the dashboard (upcoming bills). M2 delivers **core recurring detection**: detect, confirm, add manually, match transactions, categorise, list, show which occurrences are seen or not seen yet in each budget period, resolve bills still unpaid, end items by hand, and hand member changes to BUD's plan. M3 adds the rest: statuses, flags, skipping, automatic end detection, price changes, totals and the calendar. Nothing detected affects any number until a member confirms it.

Research basis: Lunch Money suggests items from "a clear pattern of payee and amount that repeat over a regular cadence", which users accept or reject ([Lunch Money – creating recurring items](https://support.lunchmoney.app/finances/recurring-items/creating-recurring-items)). It shows three states (linked, date passed without a link, future) and supports optional start and end dates ([Lunch Money – basics](https://support.lunchmoney.app/finances/recurring-items/the-basics-of-recurring.md)). Monarch re-scans on every sync, detects paychecks too, and offers a monthly calendar ([Monarch](https://www.monarch.com/blog/track-recurring-bills-and-subscriptions)). Rocket Money flags a price increase only when it is more than $1.99 and more than 5% ([Rocket Money](https://www.rocketmoney.com/learn/personal-finance/is-there-an-app-that-can-tell-me-when-my-subscription-price-increased)).

#### REC-01 Detect recurring candidates · Must · M2
As a household, I want the app to spot payments and income that repeat, so that I don't have to list every bill by hand when I set up the budget.
**Acceptance criteria**
- Detection runs after the first full-history import, after every sync and after every CSV import.
- If detection hasn't finished when the BUD wizard reaches its recurring step, the step says "Still looking for recurring payments". Members can add items manually (REC-05) or continue. Suggestions appear on the Recurring page when ready, and the wizard's recurring step can be reopened.
- **Same counterparty** means the same counterparty account number, where the bank provides it. Otherwise it means the same merchant name after CAT's merchant cleanup. If cleanup isn't available, it means the same name as the bank gives it, ignoring letter case, spaces, punctuation and digits.
- A candidate is a **series**: transactions with the same counterparty, from the same account, in the same direction, that fit one frequency:
  - every transaction falls within the frequency's tolerance of a **schedule** (REC-02): weekly ±1 day, every 2 weeks ±2, monthly-type ±4, every 2 months ±5, quarterly ±7, every 6 months and annual ±10. The tolerance is measured against the schedule's dates (e.g. "day 10", "last business day", "second Thursday"), not between consecutive payments;
  - there is at most one transaction per expected period, so weekly grocery shopping at the same shop is not suggested.
- Transactions already linked to an item are not used for detection. A subscription that moves to a new card keeps linking to its item (REC-06) and doesn't produce a second suggestion.
- **Splitting.** One counterparty can produce several series.
  - Transactions with different stable references in the description (e.g. two contract numbers) are always kept apart.
  - Each remaining set is first tested as a single series. Only a set that doesn't fit is split, and each part is tested again. It is split first into amount groups, where every amount in one group is more than 20% away from every amount in the other (e.g. 4.99 and 10.99). A part that still doesn't fit is split into day groups, where every day of the period in one group is at least 7 days from every day in the other (e.g. around the 5th and around the 20th). Splitting repeats on every part (amount, then day) until each part fits or is too small to meet the minimum.
  - **Stray transactions.** A transaction that stops a set from fitting (e.g. a one-off charge near the bill's day) is left out of the series instead of blocking it. This is allowed while the series still meets the minimum and the left-out transactions are at most a quarter of the set. Weekly grocery shopping at one shop still isn't suggested as monthly, because three quarters of it would be left out.
  - Because the whole set is tested first, a weekly or fortnightly payment is never cut into monthly series. A seasonal gas bill whose amounts vary by more than 20% also stays one series.
  - **Alternating amounts.** A series **alternates** when its amounts form two groups more than 20% apart and no two consecutive transactions are in the same group. It is then split into two series with twice the interval, provided each meets the minimum number of occurrences.
- When several schedules fit a series (e.g. "day 10" and "second Thursday"), detection proposes the one closest to the actual dates (smallest total difference in days). On a tie it proposes day N.
- Minimum number of occurrences: weekly and every 2 weeks, 4; monthly and every 2 months, 3 (or 2 if the amounts are identical); quarterly, every 6 months and annual, 2.
- Examples:
  - Payments of 49.99 to one counterparty on 3 Jan, 2 Feb and 4 Mar give one monthly suggestion, day 3, expected amount 49.99.
  - 6 payments to the same supermarket in one month give no suggestion.
  - From one account, the same app store charges 4.99 around the 5th and 10.99 around the 12th every month. This gives two monthly suggestions.
  - Each partner pays for their own streaming subscription from their own account. This gives two suggestions.
  - One supplier collects electricity (about 180) on the 5th and gas (about 90) on the 20th from the same account. This gives two monthly suggestions.
  - One insurer collects car insurance (1,200) every March and home insurance (600) every September, from the same account. With one year of history (two payments), this gives one every-6-months suggestion with a range of 600–1,200. A member can change it to annual and add the other policy manually (REC-05). Payments from before an item's start date are never linked (REC-02), so there is usually no link to move between the two items. If one is linked, a member unlinks it and links it to the other policy manually (REC-06). With two years of history (four payments), the alternating rule gives two annual suggestions.
  - A salary of the same amount paid on the 1st and the 15th gives two monthly suggestions (day 1 and day 15). A member can replace them with one "twice a month" item (REC-02).
  - A salary arriving on 8 Jan, 12 Feb, 12 Mar and 9 Apr 2026 gives a monthly suggestion on "second Thursday", which fits exactly. "Day 10" also fits, but its total difference is several days, so it is not proposed. Gap-based tolerance would have rejected both.
- Proposed item type (REC-07). These are only defaults; the category decides how a transaction counts:
  - Inflows are proposed as Income, except internal transfers, which are proposed as Transfer.
  - Outflows to a tracked loan or mortgage account are proposed as a Bill in a fixed category.
  - Outflows to a tracked credit card or to another of our accounts are proposed as a Transfer. When the destination is a savings-type account, the Transfer is proposed as a savings transfer. When the source is a savings-type account, it is proposed as a savings withdrawal. A member can change either to a plain neutral transfer (REC-07).
  - Repayments to a card the app doesn't track, including a card that has only a value for net worth, are proposed as a Bill in the category "Credit card repayment (untracked card)", whose flex type is Flexible. They are never proposed in a fixed category.
  - Every other outflow is proposed as a Bill.
  - A recurring transfer between two tracked accounts is suggested once, from the paying account's side, with the other account as its To account (REC-07). The receiving leg stays paired with it as one internal transfer (TXN) and is not a separate item.
  - An outflow or inflow that TXN marks as a transfer to or from an untracked account is proposed as a Transfer with no To account.
- No suggestion duplicates an existing item with the same counterparty, account, frequency and amount group.
- When the available history is shorter than 13 months, the suggestions screen says: "Annual bills (e.g. insurance, taxes) can't be detected yet from your history. Add them manually."
**Depends on:** SPIKE-01 (merchant and description quality, counterparty account numbers, stable references in descriptions, history depth); TXN (internal transfer detection and pairing); CAT (merchant cleanup, if built)
**Notes:** The tolerances are starting values and will be re-tuned after SPIKE-01. A payment that varies by more than the tolerance, such as a salary paid "any time up to the 10th", may not be detected. A member then adds the item manually with a wider match window (REC-02). If descriptions turn out to be unusable (SPIKE-01 gate), detection relies on counterparty account numbers, and the wizard leans more on manual entry.

#### REC-02 Frequencies, schedules and match windows · Must · M2
As a household, I want each recurring item to follow its real schedule, so that due dates and the forecast match reality.
**Acceptance criteria**
- Frequencies: weekly; every 2 weeks; twice a month (two days of the month, e.g. 1st and 15th); monthly; every 2 months; quarterly; every 6 months; annual; custom (every N days, weeks or months).
- Detection (REC-01) suggests every frequency except "twice a month" and "custom". Those two are set manually only.
- A monthly-type item is due on one of:
  - day N; when N is past the end of a month, the last day of that month is used;
  - the last business day of the month;
  - the Nth weekday of the month (e.g. second Thursday, last Friday).
- Each item has a weekend rule: none, previous business day, or next business day. Example: a salary due on the 10th, with "previous business day", is expected on Friday the 8th when the 10th is a Sunday.
- An occurrence **belongs to** the budget period that contains its **nominal due date**, before any weekend shift (see BUD — roll-up). An Income item marked "funds the next period" is the exception (REC-08). REC-19 and BUD use this.
- **First occurrence.** An item's first occurrence is its first due date on or after its start date.
  - Items confirmed during first budget setup (see BUD — first budget setup, BUD-13) start at the first budget period's start date, so occurrences already paid in that period exist and link.
  - An Income item marked "Funds the next period" in the first-budget wizard (REC-08) also gets one earlier occurrence: its most recent payment before the first period's start, within the history, becomes the occurrence that funds the first period and links to it.
  - Any other item starts on the day it is created or confirmed, by default. No occurrence of such an item is ever created in the past.
- **The schedule is fixed.** Expected dates always come from the schedule. An early or late payment never moves later dates. Example: rent due on the 10th is paid on the 13th. The next expected date is still the 10th of the next month.
- **Who starts the payment.**
  - **Them**: card charges, direct debits, salaries. The other side picks the date. This is the default.
  - **Us**: transfers and standing orders. We pick the date, and the expected date is the due date.
  Detection proposes "Us" when the bank's transaction code shows a transfer or standing order. A member can change it.
- **Match window.** Each occurrence has a window in which a payment links to it (REC-06).
  - "Them" items: by default from the expected date minus the frequency's tolerance (REC-01) to the expected date plus the grace period.
  - "Us" items: from half the interval before the due date (rounded down: 3 days for weekly, 15 days for monthly, 45 days for quarterly), but never before the day after the previous occurrence's due date, to the due date plus the grace period. So rent paid 12 days early still links. An ad-hoc transfer to the same account 26 days before the next due date doesn't, so it isn't counted in the next period by mistake (REC-19). The first occurrence's window follows the same rule. For an item created after setup it never starts before the start date, so payments from before the item existed are never linked automatically (a member can link one manually, REC-06). For an item confirmed during first budget setup it can start before the first budget period. Example: the first period starts on 1 Oct, and October's rent paid on 28 Sep links to October.
  - An Unpaid "Us" Bill or Subscription occurrence (still owed) keeps its window open until it is resolved (REC-06). REC-06 links to the oldest open occurrence first, so overlapping windows never compete.
  - Grace period: 2 days for weekly items and 5 days for all other frequencies.
  - A member can change the window per item ("up to N days early, M days late"). Example: a salary paid "by the 10th" can be set to 10 days early, 0 late.
- Business days exclude weekends and the public holidays in the household's holiday calendar (SET). Dates and days are counted in the household time zone (SET).
- Each item shows its next expected date.
**Depends on:** SPIKE-01 (bank transaction codes that tell a transfer or standing order from a card payment or direct debit)
**Notes:** Twice a month, the last business day and the Nth weekday are common salary patterns. Every 2 months covers utilities that bill bi-monthly.

#### REC-03 Fixed and variable amounts · Must · M2
As a household, I want bills that change every month (utilities) tracked as a range, so that a normal fluctuation isn't treated as a problem.
**Acceptance criteria**
- Each item is either **fixed amount** or **variable amount**. Detection picks variable when the matched amounts differ by more than 5% from their average. A member can change the choice.
- A fixed item has one expected amount: by default, its most recent matched amount. After confirmation it changes only when a member edits it or accepts a price change (REC-14).
- A variable item has:
  - an expected amount: by default, the average of its last 3 matched amounts;
  - an expected range: by default, the lowest to highest of its last 6 matched amounts.
  A member can override either value.
- Wherever a variable item appears (list, calendar, wizard, detail), its range is shown next to its expected amount. A variable item is never shown as just an average.
- **Currency:**
  - Expected amounts and ranges are in the item's account currency, based on the bank's booked amounts. Per SET's FX rule, the booked amount in account currency wins.
  - Forecast and totals use these account-currency amounts. Totals convert them to base currency at the reference rate (SET).
  - An item can also have a "Priced in" currency, for example a subscription priced in USD and charged to a card in base currency. It is filled automatically when the bank provides the original currency, or set by a member.
  - The "Priced in" amount is used only to detect price changes (REC-14).
  - For an item with a "Priced in" currency, the account-currency expected amount follows the booked amount of its latest linked payment, because exchange-rate moves change it every time. The "Priced in" amount changes only when a member accepts a price change. Accepting sets both: the new "Priced in" amount, and the booked amount of the payment that raised the flag.
- Automatic changes to an expected amount or range (a variable item's average, a "Priced in" item following the exchange rate) never change the budget plan by themselves (REC-18).
**Depends on:** SPIKE-01 (original-currency amount and currency on card transactions); SET (FX rule)
**Notes:** Lunch Money users report that showing only the average of a fluctuating item is misleading ([Lunch Money feedback](https://feedback.lunchmoney.app/bugs/p/recurring-item-with-fluctuating-amount-displays-average-instead-of-range)).

#### REC-04 Review suggestions · Must · M2
As a Member, I want to confirm or dismiss suggested recurring items, so that only real ones affect our budget and forecast.
**Acceptance criteria**
- Each suggestion shows the transactions it is based on (date, amount, account), plus its proposed name, frequency and schedule, amount (or range), next expected date, item type, category, and who starts the payment.
- A member can **confirm** a suggestion, optionally editing any of those fields first. Several suggestions can be confirmed at once (used by the BUD wizard).
- A member can **dismiss** a suggestion ("Not recurring"). The same series (counterparty, account, frequency, amount group) is not suggested again. Dismissed suggestions are listed under "Dismissed" and can be restored.
- Suggestions do not affect left to spend, the forecast, totals or the calendar until they are confirmed.
- Any member can confirm or dismiss. The item records who confirmed it and when.

#### REC-05 Manual recurring items · Must · M2
As a Member, I want to add a recurring item by hand, so that I can cover bills that detection missed: annual ones, ones paid from an unconnected account, or ones from before our history starts.
**Acceptance criteria**
- A member can create an item from scratch.
  - Required fields: name, type, frequency and schedule, next expected date, fixed amount or variable range, and category.
  - Optional fields: account, who starts the payment, match window, "Description contains" text (REC-06), "Repays" account (REC-07), start date (default today and never in the past; first budget setup uses the first budget period's start) and end date.
- A member can also create an item from an existing transaction ("Make recurring"). The fields are pre-filled from that transaction.
- Occurrences start at the start date (REC-02). For an item created after setup, transactions from before its start date are never linked automatically and no past period changes. The item's page lists the earlier transactions that match it, as history.
- A manual item with no account can't be matched automatically. A member uses "Mark paid elsewhere" on its occurrences (REC-19).

#### REC-06 Match transactions to recurring items · Must · M2
As a household, I want new transactions linked to their recurring item automatically, so that we can see what's been paid without ticking things off.
**Acceptance criteria**
- **Which items can match.** An active item can take a transaction when:
  - the counterparty and direction match;
  - the transaction date is inside the match window (REC-02) of one of the item's **open** occurrences. Open means not Paid, Skipped or Missed. It isn't limited to the occurrence whose window contains the date. An occurrence of a "Us" Bill or Subscription whose window has closed without a payment stays open, with its window, because the money is still owed. It stays open until it is paid, marked paid elsewhere, skipped or the item ends. An occurrence of a "Them" item or a "Us" Transfer is Missed when its window closes without a payment, so it is no longer open (REC-10; in M2 it is simply Not seen yet);
  - if the item has "Description contains" text, the transaction's description contains it.
- **Amount band.** A transaction links automatically only if its amount is within the item's band:
  - fixed items: 50% to 150% of the expected amount;
  - variable items: 50% of the lowest to 150% of the highest amount in the range;
  - card repayment items (Transfers that repay a card): any amount.
- **Linking:**
  - Within one item, a payment links to its **oldest** open occurrence first. Example: rent ("Us") is due on 10 Oct and 10 Nov. A payment on 13 Oct links to October. A payment on 20 Oct is after October's normal window, but October is still owed, so its window is still open and the payment links to October. The 10 Nov payment then links to November.
  - If exactly one item takes the transaction within its band, the transaction is linked. A changed amount inside the band raises the REC-14 flags. It never prevents the link.
  - If several items take it, the tie is broken by, in order: the item's own account, then the closest amount, then the closest date.
  - If items are still tied and they share the same account, expected amount and category, the choice makes no difference to any figure. The transaction links to the tied item whose open occurrence is earliest, then the oldest item, with no flag. Example: both partners' identical streaming plans paid from one Joint card.
  - If items are still tied and differ in category, nothing is linked, and a possible-match item (below) lets a member choose. It also offers:
    - "Tell these apart", which opens the items' "Description contains" fields;
    - "Link in order from now on", for when the descriptions are identical too. Ties between these two items are then linked as for interchangeable items, and the member accepts that their categories may be swapped. This stops the same tie coming back every period.
  - If the counterparty and window match but the amount is outside the band, nothing is linked. A possible-match item offers "Link and accept new amount" or "Not this item". While it is open, the occurrence doesn't count towards "Possibly ended" (REC-13).
- **Still unpaid? (M2).** When a "Us" Bill or Subscription occurrence is still open after its normal window ends, a review-inbox item "Recurring: still unpaid?" appears (see CAT — review inbox). It names the item, the due date and the amount, and offers:
  - "Mark paid elsewhere" (REC-19);
  - "Skip this one", which marks the occurrence Skipped (as in REC-12);
  - "Still waiting", which closes the inbox item and keeps the occurrence open. If it is still open when the next occurrence is due, the inbox item comes back.
  This stops one unrecorded cash payment from shifting every later payment by one period without anyone being asked.
- **Where non-link outcomes appear.** A tie, an amount outside the band, and a payment for a skipped occurrence each create a review-inbox item (see CAT — review inbox) with the reason "Recurring: possible match". This applies from M2. The item offers the actions described here, and acting on it closes it for every member. The Recurring page (REC-11) shows how many are open and links to the inbox. It doesn't keep its own copy.
- A transaction links to at most one occurrence, and an occurrence to at most one transaction. If a second payment falls in the window of an occurrence that is already Paid by an automatic link, no open occurrence can take it, and it is closer to the expected amount, it takes the automatic link. The first payment becomes an ordinary transaction and isn't linked again automatically (REC-14, correction invoices). It keeps its current category and source, and counts in the period of its budget date, as for any unlink (BUD-02). An automatic swap happens only while the occurrence's period is not Settled; after that, the second payment becomes a "Recurring: possible match" inbox item instead. Manual links are never replaced.
- **Account.**
  - A payment from a different account than the item's account still links if the item is the only candidate.
  - The item's account doesn't change automatically.
  - After 2 consecutive occurrences are paid from the same other account, a "Paying account changed" flag (REC-11, M3) offers "Switch to <account>" or "Keep".
- **"Description contains".** A member can add this text to tell apart several items from one counterparty, such as electricity and gas contract numbers. Detection fills it in when it split a counterparty's series by reference (REC-01).
- **Editing matching fields** (counterparty, account, "Description contains", amount, window) affects new transactions only. The item offers "Re-check past payments", which re-applies these rules to past automatic links. It never changes a manual link or unlink.
- Pending transactions match too. When a pending transaction becomes booked (see TXN – pending→booked matching), the link is kept.
- A transaction marked as a possible duplicate (TXN) of an already linked transaction is not linked. It is resolved in the review inbox. Until it is resolved, both count in totals.
- Members can link or unlink a transaction manually from either the transaction or the item. A manual link or unlink is never undone automatically.
- If one payment covers two occurrences, a member links it to one and uses "Mark paid elsewhere" on the other, with a note such as "covered by the 20 Oct payment" (REC-19).
- Refunds from the counterparty of a bill item are not linked as payments.
- Examples:
  - 49.99 → 54.99: linked; Price change flag (REC-14).
  - 49.99 → 99.99: not linked; review-inbox item "Recurring: possible match".
  - App store items of 4.99 and 10.99: a 6.99 charge links to the 4.99 item, because it is the closer amount.
**Depends on:** TXN (pending→booked, refunds, possible duplicates); CAT (review inbox reason "Recurring: possible match"); SPIKE-01 (whether pending transactions keep their identity, description references)
**Notes:** Lunch Money links only exact amounts or a set range, so a price change breaks the link. Automatic price-change flagging is still an open feature request there ([Lunch Money feedback – flag price increases](https://feedback.lunchmoney.app/recurring-items/p/automatically-identify-and-flag-possible-recurring-transaction-price-increases)). That is why REC links on a wide band and flags the change (REC-14) instead of refusing the link. For several subscriptions from one merchant, Copilot asks the user to create one recurring item each and tell them apart by name, amount range, expected date and frequency ([Copilot – multiple recurrings for the same merchant](https://help.copilot.money/en/articles/5327632-multiple-recurrings-for-the-same-merchant)). REC detects the split itself (REC-01) and uses the same fields to break ties.

#### REC-07 Category, flex type and item type · Must · M2
As a household, I want each recurring item tied to a category, so that the budget knows whether it is fixed, non-monthly, flexible, income or savings.
**Acceptance criteria**
- Each item has one category. The default is the most common category among its matched transactions. The item's flex type always comes from its category's flex type (see CAT). REC never sets a flex type of its own.
- Each item has one item type:
  - **Bill**, which includes repayments to a tracked loan or mortgage account (fixed category by default) and repayments to a card the app doesn't track (spending, in "Credit card repayment (untracked card)" with flex type Flexible, never fixed by default);
  - **Subscription**: a member can switch any Bill to Subscription and back;
  - **Income**: only income-flex categories are allowed;
  - **Transfer**: money moving between our own accounts. It is neutral, including repayments to a tracked credit card. Two defaults apply, and a member can override either:
    - a transfer to a savings-type account or in a savings-flex category is a **savings transfer**: counted as "moved to savings", never as income or spending;
    - a transfer out of a savings-type account is a **savings withdrawal**: it reduces the period's "moved to savings", and is never income.
    A member can put either one in a neutral transfer category (e.g. "Sinking-fund money"). It is then a plain Transfer that neither counts as moved to savings nor touches left to spend. Example: a monthly 300 to a savings account that holds the household's sinking-fund money.
  Bill and Subscription items can't use income or transfer categories.
- **Repays.** An item can name the loan, mortgage or card account it repays. Detection sets this for tracked accounts; a member sets it for manual ones. FC-04 and NW-03 use it.
- **To account.** Every Transfer item names the other account, or none when it is an untracked account. Detection sets it from TXN's pairing of the two legs. For a card repayment, the To account is the card. FC-04 uses it.
- **Category as a source.** A confirmed item's category ranks just below a member Rule: Manual > Rule > recurring item > Learned (CAT-05). Newly matched transactions get the item's category unless a member edited that transaction's category by hand, or a member Rule also matches and disagrees. In that case the Rule wins.
- If a matched transaction's category differs from the item's, the item's page shows "Category differs" and lists those transactions, with "Use item's category" and "Change item's category" actions (M2). From M3 this also raises a "Category differs" flag (REC-11). Budget actuals always follow the transaction's own category.
- When a member changes an item's category, the app offers "Also apply to past matched transactions". Saying yes never overwrites manually edited transactions.
- For every confirmed item, BUD receives:
  - its **monthly equivalent**: weekly ×52/12; every 2 weeks ×26/12; twice a month ×2; every 2 months ÷2; quarterly ÷3; every 6 months ÷6; annual ÷12; every N days ×365/(12×N); every N weeks ×52/(12×N); every N months ÷N;
  - its **occurrences expected in each budget period**, with dates and amounts.
  Amounts go to BUD in base currency, converted at the reference rate (SET) at the moment a member's action sends them (REC-18). BUD decides how items roll up into plan lines.
- **Frequency vs flex type hint.** The item shows a hint on confirmation, and an icon in the list until a member resolves it:
  - for an item less frequent than monthly (every 2 months or longer) in a fixed category: "This bill isn't monthly. In a fixed category it counts in full in the periods it is due and not in the others (see BUD — plan amounts). Move it to a non-monthly category, which sets aside a share every period?";
  - for an item monthly or more frequent in a non-monthly category: "This is a monthly bill. Move it to a fixed category?"
  The actions are "Choose category" or "Keep as is".
- An expense item in a flexible category is allowed. Its detail page notes: "Counts against left to spend."
- Savings transfer and savings withdrawal items are shown next to BUD's planned-savings line, as information. They change the plan only when a member edits that line. REC never raises left to spend.
- **When the repaid account becomes tracked.** If a card that a Bill repays becomes tracked (its transactions are in the app; a value-only card for net worth doesn't count), and a member confirms the re-check of past repayments as transfers (see TXN — card repayments), the item changes from Bill to Transfer, with the card as its To account, in the same step. Any plan effect goes through REC-18. If a manual loan or mortgage is later replaced by a connected one, its repayment item stays a Bill, and a member re-points its Repays account.
**Depends on:** CAT (category tree, flex types, precedence with the recurring item as a source, default categories for loan repayments and savings); BUD (roll-up of items into plan lines); TXN (transfer pairing, one-leg transfers)

#### REC-08 Recurring income for budget and payday · Must · M2
As a household, I want salaries and other regular income detected, so that the budget wizard can propose our expected income and payday anchor.
**Acceptance criteria**
- Detection (REC-01) suggests regular inflows from the same payer, such as a salary, benefits, a pension or rent received, as Income items. Each one shows the account and the account holder it lands in.
- A salary that varies (overtime, bonuses) is a variable item with an expected range (REC-03).
- BUD receives each confirmed Income item (REC-07) for its expected income. How they add up, and how irregular income is treated, is up to BUD.
- **Payday anchor.** BUD owns the anchor options and the choice. REC gives BUD each Income item's usual payday in BUD's terms: a day of the month (1–31) or "last working day".
  - An Nth-weekday item maps to the earliest day of the month it can fall on, so its payments never land before the period starts. Example: second Thursday → 8. BUD-10 uses the same rule.
  - The Income item whose payday BUD uses as the anchor follows the household's payday weekend direction (see BUD — payday on non-working days) instead of its own weekend rule, so the two can't disagree.
- **Funds the next period.** An Income item can carry a "Funds the next period" mark. The first-budget wizard asks "Does this pay fund the next period?" for each Income item. Later, BUD-11's "Yes, always for <item>" sets it. A member can clear it on the item's page. Each occurrence of a marked item belongs to the budget period after the one that contains its nominal due date (REC-02), so its linked payments count there (REC-19).
  - In the wizard, a "yes" also makes the item's most recent payment before the first period's start the occurrence that funds the first period (REC-02).
  - Example: payday anchor on the 1st, the first period starts on 1 Oct, and a pension due on the 28th is marked in the wizard. The 28 Sep pension becomes October's occurrence, links to it and counts in October. The 28 Oct pension funds November.
- Income landing in any member's account or a Joint account counts. Because the money model is fully shared, it does not matter whose salary it is.
- Recurring transfers between members' accounts are Transfer items, not Income. They are never added to expected income.
**Depends on:** BUD (expected income, payday anchor options, BUD-11 setting "Funds the next period"); TXN (internal transfers between members)

#### REC-09 Recurring list · Must · M2
As a Member, I want one list of all recurring items, so that I can see what's coming and correct anything wrong.
**Acceptance criteria**
- The list shows every confirmed item, grouped by item type. Each row shows the name, account and account holder, frequency, expected amount or range, next expected date, category with its flex type, and the REC-07 hint icon if one applies.
- The list can be sorted by next expected date (the default), amount or name, and filtered by item type, account holder and category.
- Each item opens a detail page with all its fields and its matched transactions, newest first.
- At 360 px width each row stays readable without horizontal scrolling. Secondary fields wrap onto a second line.
**Notes:** In M2 this list and REC-19's "seen / not seen yet" are what the wizard and BUD need. The basic M2 dashboard has no upcoming bills. Statuses arrive in M3 (REC-10).

#### REC-10 Occurrence statuses · Must · M3
As a household, I want each expected payment to show whether it is paid, coming or late, so that nothing slips by unnoticed.
**Acceptance criteria**
- Each occurrence has exactly one status. Every status has a text label and an icon, never colour alone. "Window" means the occurrence's match window (REC-02). Statuses depend only on dates, links and whether the account's data is complete past the window: its "Data up to" date (ACC — "data up to"). For a connected account that is its last successful sync; for a CSV-fed account, the end of its newest import. The SET staleness threshold is not used.
  - **Upcoming**: the expected date is today or later, and no transaction is linked.
  - **Paid**: a transaction is linked, or a member used "Mark paid elsewhere" (REC-19). If the linked transaction is pending, the label is "Paid · pending". If there is no transaction, the label is "Paid elsewhere".
  - **Overdue**: the expected date has passed, the window is still open, and no transaction is linked.
  - **Missed** ("Them" items, and "Us" Transfers): the window has closed, no transaction is linked, and the account's data is complete past the window. It means the charge, income or transfer didn't happen, and nothing is owed.
  - **Unpaid** ("Us" Bills and Subscriptions): the same conditions as Missed. It means we haven't paid and the money is still owed. The occurrence stays open for linking (REC-06).
    - An Unpaid occurrence raises the review-inbox item "Recurring: still unpaid?" (REC-06). It isn't a separate flag.
  - **Skipped**: a member marked the occurrence as not happening (REC-12).
  - **Can't check**: the window has closed and no transaction is linked, but the account's data isn't complete past the window. For example, the connection is broken, or the last CSV import ends before the window closed. The status is re-checked whenever the account's "Data up to" date moves.
- A manual item with no account shows "Due — mark paid elsewhere?" once its window closes. It never becomes Missed or Unpaid.
- Income items use the same statuses.
- These statuses refine REC-19: Paid is Seen, and every other status is Not seen yet.
- **How a tester sees each status.** Use a monthly "Them" item due on the 10th: grace is 5 days, so the window closes at the end of the 15th.
  | Status | Setup |
  |---|---|
  | Upcoming | Today is the 9th. |
  | Overdue | Today is the 12th and there is no matching transaction. |
  | Missed | Today is the 17th, the account synced on the 16th, and there is no matching transaction. |
  | Unpaid | Same as Missed, with the item set to "Us" and type Bill. |
  | Missed ("Us" Transfer) | Same as Missed, with a "Us" Transfer item, e.g. a monthly savings transfer the member didn't make. |
  | Unpaid, inbox item | The "Us" Bill above on the 16th: the review inbox shows "Recurring: still unpaid?". After "Still waiting", it shows again on the 10th of the next month. |
  | Can't check | Today is the 20th and the account's last successful sync was on the 14th. For a CSV-fed account: its newest import ends on the 14th. |
  | Paid | A matching transaction is dated the 11th. |
  | Skipped | A member marks the occurrence as skipped. |
**Depends on:** ACC ("Data up to" per account, including CSV-fed accounts); BANK (last successful sync per account)

#### REC-11 Recurring flags (in-app) · Must · M3
As a Member, I want things that need my attention about recurring items flagged inside the app, so that I notice them without notifications.
**Acceptance criteria**
- Flag types:
  - Missed occurrence (REC-10). Unpaid occurrences use the review-inbox item "Recurring: still unpaid?" instead (REC-06);
  - possibly ended (REC-13);
  - charged after ending (REC-13);
  - price change or unusual amount (REC-14);
  - new recurring payment (REC-15);
  - paying account changed (REC-06);
  - category differs (REC-07);
  - plan out of date (REC-18).
- Possible matches and "still unpaid?" items (REC-06) are review-inbox items, not flags. The Recurring page shows how many are open and links to them.
- Open flags are listed at the top of the Recurring page. The main navigation item shows how many are open.
- Each flag has its actions inline (for example Accept new price or Dismiss). Each flag names its item and the budget period it belongs to. Taking any action closes the flag for every member. The app records who closed it, with which action and when, for the item's history only. It is never counted or reported per member.
- No email, push or other notification is ever sent for a flag.

#### REC-12 Skip an occurrence · Should · M3
As a Member, I want to mark one occurrence as skipped, so that a payment holiday or a paused month isn't reported as missed and isn't forecast.
**Acceptance criteria**
- A member can mark any Upcoming, Overdue, Missed or Unpaid occurrence as Skipped, and can undo it. In M2, an occurrence can be skipped only through the "Recurring: still unpaid?" inbox item (REC-06) or when ending its item (REC-13).
- A skipped occurrence leaves the forecast. It doesn't count towards "possibly ended" (REC-13) and doesn't move later expected dates.
- A skip lowers that period's expected amount by the skipped occurrence's expected amount only, never the rest of its category's line. Example: Nursery & childcare 1,200 = nursery 900 (skipped) + babysitter 300 (still due), so the expected amount falls by 900. Any other plan change goes through REC-18.
- If a matching transaction arrives later for a skipped occurrence, it is not linked automatically. It creates a review-inbox item "Recurring: possible match" (REC-06).

#### REC-13 End a recurring item · Must · M2 (Mark ended) / M3 (Possibly ended, Charged after ending)
As a household, I want to mark a cancelled subscription or a finished loan as ended, so that it stops being expected, and so that I find out if it is charged again.
**Acceptance criteria**
- **Mark ended (M2).** A member can end any item with an end date (default today). Occurrences after that date disappear from the list's upcoming dates, the calendar, the totals, the forecast and REC-19. Past occurrences and their linked transactions are kept.
  - If the item has open occurrences on or before the end date, the member chooses "Mark paid elsewhere" or "Skip this one" for each. No answer is preselected, and the item doesn't end until each is answered.
  - The item leaves future plan lines through BUD's plan-edit step (REC-18, BUD-16).
- The automatic parts below are M3.
- The app flags "Possibly ended" after 2 consecutive Missed occurrences (weekly to every 2 months), or after 1 (quarterly, every 6 months, annual). Only "Them" items and "Us" Transfers can be Missed (REC-10).
  - An occurrence with an open possible-match item (REC-06) doesn't count.
  - The flag offers "Mark ended" (end date = last paid occurrence) or "Keep".
  - A "Us" Bill or Subscription is never flagged "Possibly ended", because its unpaid occurrences are still owed. Its unpaid occurrences raise "Recurring: still unpaid?" inbox items (REC-06), and a member ends the item from its page.
- If a transaction arrives that would have linked to an ended item under the REC-06 rules, the app shows a **Charged after ending** flag. It offers "Link and reactivate" or "Ignore".
- Ended items are listed under "Ended" and can be reactivated.

#### REC-14 Price changes and unusual amounts flagged · Must · M3
As a household, I want to see when a subscription or bill changes price, so that we can decide whether to keep it.
**Acceptance criteria**
- **Fixed items.** A linked amount that differs from the expected amount by at least 5% **and** at least 2.00 raises a "Price change" flag. Increases and decreases both count. The flag shows the old amount, new amount, change in % and date.
  - "Accept new price" makes the new amount the expected amount for future occurrences. It reaches the forecast and totals immediately, and the budget as described in REC-18.
  - "Dismiss" treats it as a one-off and keeps the expected amount.
- **Variable items.** A linked amount outside the expected range raises an "Unusual amount" flag. "Accept" widens the range. "Dismiss" keeps it.
- **When flags are judged.** Price-change and unusual-amount flags are raised when the occurrence's window closes, using the payment linked to it at that moment. If two payments to the counterparty fall in one occurrence's window, the one closer to the expected amount stays linked, and the other becomes an ordinary transaction (REC-06 says what it keeps). A payment that isn't linked never raises a flag. So a utility's correction or settlement invoice paid alongside the regular bill raises no price flag. If a correction invoice is the only payment in the window, "Dismiss" is offered as "One-off (e.g. correction invoice)".
- No flag is raised when the change is below either threshold.
  - 49.99 → 50.99 (2%, 1.00): no flag.
  - 49.99 → 54.99 (10%, 5.00): the transaction links (REC-06) and raises the flag.
- **Which amounts are compared:**
  - Normally the account-currency booked amounts (REC-03).
  - If the item has a "Priced in" currency and the bank provides the original amount, the original amounts are compared, so exchange-rate moves alone raise no flag. Accepting sets the new "Priced in" amount (REC-03).
  - If the item has a "Priced in" currency but the bank doesn't provide the original amount, the threshold rises to 10%, and the flag says "May be due to the exchange rate".
- Each item's detail page shows its history of amount changes.
- Income items show their amount changes in history but raise no price-change flags.
**Depends on:** SPIKE-01 (original-currency amounts on card transactions)
**Notes:** The thresholds follow Rocket Money's precedent of more than $1.99 and more than 5% (source above). The absolute part keeps small subscriptions from causing noise. Letting the household adjust the thresholds is a Could (see Open questions).

#### REC-15 New recurring payment flagged · Must · M3
As a household, I want to be told when a new recurring payment starts, so that we spot forgotten sign-ups and trials that turned into paid plans.
**Acceptance criteria**
- After the household finishes the BUD setup wizard, every new suggestion from REC-01 also raises a "New recurring payment" flag (REC-11). The flag shows the counterparty, amount, frequency and first date.
- Confirming or dismissing the suggestion closes the flag.
- Suggestions created during the first import or the wizard raise no flags. They appear only on the suggestions screen.
**Notes:** Raised from Should to Must because it costs little on top of REC-01. Detection needs at least 2 occurrences, so a new subscription is flagged at its 2nd charge at the earliest. Flagging after the 1st charge would mean guessing.

#### REC-16 Subscription and bill totals · Must · M3
As a household, I want to see what our subscriptions and bills cost per month and per year, so that we can decide what to cut.
**Acceptance criteria**
- The Recurring page shows the monthly-equivalent and annual totals (REC-07 factors) of active (not ended) items, separately for Subscriptions, Bills and Income, in base currency. Transfers are not totalled.
- Totals can be broken down by category (so loan and mortgage repayments can be seen apart from other Bills) and filtered by account holder.
- Variable items count at their expected amount. Any total that includes one is labelled "estimated".
- Foreign-currency items are converted using the SET FX rule.
- Example: Netflix 49 monthly + a domain at 120 a year + a gym at 30 weekly gives subscriptions of 49 + 10 + 130 = 189 / month and 2,268 / year.

#### REC-17 Calendar view · Could · M3
As a Member, I want a month calendar of recurring items, so that I can see which days money goes out and comes in.
**Acceptance criteria**
- The calendar shows every expected occurrence on its expected date, and every paid occurrence on the date of its linked transaction, each with its status (REC-10). Each day shows total money in and total money out.
- Months can be browsed back to the earliest imported data and up to 12 months ahead.
- Below 600 px width, the calendar becomes a list of days that have occurrences.
- Selecting an occurrence opens its item. Ended items and skipped occurrences are not shown as expected.
**Notes:** Could: the household rates it low priority (§10 question 13). It reuses the data from REC-09 and REC-10.

#### REC-18 Recurring changes and the budget plan · Must · M2
As a household, I want to know when a change to a recurring item changes our budget, so that left to spend never shifts without us seeing why.
**Acceptance criteria**
- Member actions that can change the plan:
  - confirming or adding an item;
  - editing an item's amount, frequency or category (its flex type follows the category, REC-07);
  - changing an item's type (REC-07), e.g. Bill → Transfer;
  - accepting a price change or unusual amount (REC-14);
  - ending an item (REC-13, M2);
  - skipping an occurrence (REC-12; in M2 through BUD-06's "Skip this one"). A skip lowers only that period's expected amount, by the occurrence's expected amount, and grows the flexible budget by the same amount (BUD-06).
- From M3, when they exist, the forecast, totals and calendar reflect the change immediately.
- If the action affects the plan, REC opens BUD's plan-edit step (see BUD — editing the plan mid-period) and names the recurring item. BUD decides which plan line the item rolls up into, whether a scope question is asked and its default (BUD-16; skipping and ending ask none), the preview, and the one plan-history record "plan changed by <member>". REC adds no dialog, default or history of its own.
- **Only member actions change the plan.** Automatic changes never do. Examples: a variable item's expected amount following its recent average, or a "Priced in" item's account-currency amount following the exchange rate (REC-03).
  - M2: the item's detail page shows "Plan uses <X>; now expected <Y>" when the amount last sent to the plan and the expected amount differ.
  - M3: when the difference reaches the REC-14 thresholds (at least 5% and at least 2.00 for fixed items, or outside the range for variable items), the item also shows a "Plan out of date" flag (REC-11). "Update plan" opens BUD's plan-edit step; "Dismiss" keeps the plan.
- Savings transfer and withdrawal items never change planned savings by themselves. Only a member editing BUD's planned-savings line does (REC-07).
- REC never changes the plan of a past budget period, whether it is Settled or not. Linking a transaction to a past occurrence changes only the period the transaction counts in, decided at link time (REC-19). It never moves a transaction into a Settled period automatically.
- The BUD setup wizard builds the first plan from confirmed items by its own rules (see BUD — setup wizard).
**Depends on:** BUD (plan lines and roll-up, plan-edit step with its default, preview and history)

#### REC-19 Seen or not seen yet in each budget period · Must · M2
As a household, I want to see which of this period's expected bills, transfers and income have come through, so that the budget shows what is still to come.
**Acceptance criteria**
- Each occurrence belongs to the budget period that contains its nominal due date, before any weekend shift (REC-02). An Income item marked "Funds the next period" belongs to the following period (REC-08).
- An occurrence is **Seen** when a transaction (pending or booked) is linked to it (REC-06), or when a member uses "Mark paid elsewhere" on it (one label everywhere). Examples: cash, an untracked account, or one payment that covered two occurrences. The mark takes an optional note, records who made it, and can be undone.
- Otherwise it is **Not seen yet**. This applies to Bills, Subscriptions, Transfers and Income alike. In M2 there is no "overdue", "missed" or "late" wording. Those statuses come with REC-10 in M3.
- **Which period a linked payment counts in.** This is decided once, when the link is made. If the occurrence's budget period isn't Settled at that moment, the transaction counts there. If it is Settled, the transaction counts in the period it was paid in (TXN — budget date rule). Settling a period later never moves it. Only a member override, or unlinking and linking again, moves it. This is the only automatic exception to TXN's budget-date rule.
  - When the period it counts in isn't the period it was paid in, the transaction shows "Counted in <period> (paid <date>)". When it isn't the occurrence's period, the occurrence shows "Paid <date>, counted in <period>".
  - A member can override this per transaction ("Count in the period paid" or "Count in <occurrence's period>"). The override stays until a member changes it or unlinks the transaction.
  - Examples, with monthly periods starting on the 1st and a "Us" rent item due on the 10th:
    - Rent paid on 28 Sep links to the October occurrence (window from 25 Sep, REC-02). It counts in October: "Counted in October (paid 28 Sep)". September's fixed spending doesn't include it, and October's rent is Seen.
    - October's rent paid on 2 Nov, while October is still Provisional, links to the October occurrence, which is still open (REC-06). It counts in October: "Counted in October (paid 2 Nov)". When October is Settled on 15 Nov, the payment stays in October. November's fixed spending never includes it, so November doesn't show two rents.
    - The same payment made on 20 Nov, after October was Settled, counts in November as usual. October's rent is Seen and shows "Paid 20 Nov, counted in November".
- BUD receives, for each budget period, every occurrence that belongs to it, with its state and the amount counted (see BUD — fixed bills seen this period).
- A manual item with no account stays Not seen yet until a member uses "Mark paid elsewhere".
- In M3, REC-10 statuses refine this state (Paid = Seen; every other status = Not seen yet).
**Depends on:** REC-06; TXN (budget date rule and its per-transaction override); BUD (period boundaries and the Settled state)
**Notes:** Added in round 2 so that M2 has one definition of what BUD's "seen this period / not seen yet" means. For recurring income that arrives early, BUD-11's prompt can set the item's "Funds the next period" mark (REC-08).

### 4.9 Cash-flow forecast (FC)
The forecast answers: **"Will the balance in our chosen accounts stay above our safety line over the next 30–90 days, and when is it lowest?"** It is a cash view: actual balances projected day by day. Left to spend (BUD) answers a different question: **"How much flexible money is left in this budget period's plan?"** That is a budget view and ignores timing and which account holds the money. The two numbers never change each other. FC-05 says how everyday spending is projected, and FC-10 says how the UI explains a disagreement. FC depends on confirmed recurring items (REC) and lives in M3.

Research basis: Simplifi projects from the current account balance plus recurring reminders and future-dated transactions. It deliberately excludes planned spending, and users pick the accounts ([Simplifi – projected cash flow](https://support.simplifi.quicken.com/en/articles/3357429-using-projected-cash-flow)). PocketSmith shows a predicted balance for every day and supports scenarios ([PocketSmith](https://pocketsmith.com/tour/cash-flow-forecasts)). According to a review, Monarch's projected balance covers about 30 days of a checking account ([Penny Hoarder](https://www.thepennyhoarder.com/budgeting/monarch-money-review/)).

#### FC-01 Forecast view · Must · M3
As a household, I want a day-by-day projection of our balance, so that we know whether we'll run short before money comes in.
**Acceptance criteria**
- The view states its question in one line: "Projected combined balance of the accounts in this forecast". Next to it, an "About these numbers" link explains in one paragraph how this differs from left to spend.
- The headline shows:
  - the **lowest point**: amount and date (if tied, the earliest date);
  - the **balance at the end of the horizon**.
- The horizon can be 30, 60 or 90 days (default 30). The last choice is remembered per viewer.
- The view has a chart of the daily closing balance and a day list. The day list shows only days with events: date, each item and its amount, and the running balance.
- A table alternative to the chart is available, to meet the WCAG 2.2 AA requirement (NFR-08).
- Today is day 0. Items expected today but not yet paid are applied on day 0.
- The forecast reflects the latest synced data and settings every time the view is opened.

#### FC-02 Accounts in the forecast · Must · M3
As a household, I want to choose which accounts the forecast covers, so that it matches the money we actually spend from.
**Acceptance criteria**
- By default, the forecast includes every current account of every member and every Joint current account, whether connected or manual, unless it is archived.
- A member can add or remove any current, savings, credit card or manual cash account. Loans, mortgages, property, vehicles and investments can't be included.
- The choice applies to the whole household, not to one member. Its view shows who changed it last and when.
- A current account added later is included automatically, and the assumptions panel (FC-07) says so for the next 30 days.
- If an included account has never synced and has no balance, it is left out, with a notice naming it.

#### FC-03 Starting balance · Must · M3
As a household, I want the forecast to start from the right balance, so that the projection isn't wrong from day 0.
**Acceptance criteria**
- Each included account starts from its current balance as ACC displays it, per ACC's reconciliation rule. If ACC shows a gap between the bank-reported balance and the balance derived from transactions, the assumptions panel shows that gap too.
- Pending transactions are counted exactly once:
  - if the balance used already includes them (ACC-12's "This bank's balance includes pending purchases"), they are not applied again;
  - otherwise pending outflows and inflows are applied on day 0.
  The assumptions panel says which applies to each account.
- A pending transaction linked to a recurring occurrence makes that occurrence Paid, so it is not projected again.
- Foreign-currency accounts are converted to base currency at the current reference rate (SET FX rule). That rate is used for the whole horizon, and the assumptions panel says so.
- Each account's starting balance shows its "as of" time.
**Depends on:** ACC (reconciliation rule); SPIKE-01 (which balance types banks provide, and whether they include pending)

#### FC-04 Recurring items and transfers in the forecast · Must · M3
As a household, I want bills, income and transfers placed on their expected dates, so that the timing of money in and out is realistic.
**Acceptance criteria**
- Only confirmed recurring items (REC) are used. The number of unconfirmed suggestions is shown in the assumptions panel.
- An occurrence is projected on its expected date (after the weekend rule) at its expected amount. Variable items are labelled "estimate".
- **Status handling (REC-10):**
  - Upcoming: projected on its date.
  - Overdue and Can't check: projected on day 0, labelled.
  - Unpaid ("Us" Bills and Subscriptions, still owed): projected on day 0 until it is paid, marked paid elsewhere, skipped or the item is ended.
  - Missed "Them" Bills (e.g. a failed direct debit): projected on day 0, labelled "Missed — may still be collected", until a member resolves it or the next occurrence is due.
  - Other Missed occurrences ("Them" Subscriptions and Income, "Us" Transfers): not projected, because nothing is owed.
  - The assumptions panel lists every Missed occurrence and whether it is projected.
  - Paid (from any account, including excluded ones), Skipped and ended: not projected.
- **Which items count.**
  - A Transfer item counts when either of its two accounts is included. From an excluded or untracked account into an included one, it is an inflow. From an included account into an excluded or untracked one, it is an outflow. Between two included accounts, it nets to 0 in the combined balance and shows in the per-account view (FC-08). This covers savings transfers too (savings treatment is a budget rule, not a cash rule).
  - Every other item counts only if its own account is included. Its account doesn't change when one payment comes from elsewhere (REC-06).
  - Example: a Joint bill paid once from the partner's excluded account is Paid for that occurrence, so it isn't projected, and its later occurrences are still projected from the item's account.
  - A manual item with no account is assumed to be paid from the forecast accounts, and the assumptions panel lists it.
- **Salary landing in an account outside the forecast** (for example the partner's own current account) is not projected. What is projected is any recurring Transfer item that moves money from that account into an included account. Example: the partner's salary lands in their own excluded account, and a monthly transfer item of 3,000 moves money from there into the included Joint account. The forecast shows a 3,000 inflow on that item's date. The assumptions panel lists "Income landing outside this forecast" with amounts and dates.
- **Loans and mortgages:** repayments are Bills and are projected like any other Bill.
- **Credit cards:**
  - If a card is included, its purchases are part of everyday spending (FC-05), and repayments from included accounts have no effect on the combined balance.
  - If a card is excluded and repaid from an included account, its repayment item is projected as an outflow. The next repayment uses the card's owed figure as ACC shows it (ACC — credit card balance), labelled "estimate". Later repayments in the horizon use the average of the last 3 repayments. If the amount owed isn't available, all repayments use that average.
  - If an excluded card is repaid from an excluded account, it has no effect on the forecast. An included card repaid from an excluded account gets the repayment as an inflow, like any Transfer item.
  - If an excluded card has an amount owed but no repayment is expected within the horizon, the assumptions panel warns: "Card X: Y owed, no repayment expected in this forecast".
  - Repayments to a card the app doesn't track (including a value-only card) are Bills in a flexible category. They are projected like any other recurring item, and FC-05 leaves their linked transactions out, so they aren't counted twice.
- Spending is never counted twice. Spending on an excluded card reaches the forecast only through its repayment.
**Depends on:** REC; TXN (internal transfer pairing and card repayment detection); ACC (card owed figure); SPIKE-01 (which card balance banks provide, via ACC)
**Notes:** Using the amount currently owed for the next repayment can overstate it slightly, because it includes purchases after the statement date. The error is on the safe side. Statement balances are not assumed to be available (SPIKE-01).

#### FC-05 Everyday (flexible) spending · Must · M3
As a household, I want everyday spending included in the forecast, so that it doesn't look rosier than reality.
**Acceptance criteria**
- The household chooses one method. The choice applies to the whole household.
  - **Recent spending** (default): a prediction of behaviour. For each included account, its average daily flexible spending over its last 90 days, or its whole history if shorter. The account averages are added together. An account with less than 30 days of history contributes nothing, and the assumptions panel names it.
  - **Our budget**: a reflection of the plan. For the rest of the current budget period, the remaining left to spend (0 if negative) is spread evenly over the remaining days. If left to spend is 0 or less, the view says "Your budget has nothing left for everyday spending until <period end>, so none is projected. Use Recent spending to see your usual pace." For later periods, the current period's flexible budget without rollover or late adjustments (BUD) is spread evenly over each later period's own days, so periods of different lengths each get the full amount. This method is available only when every account with flexible spending in the last 90 days is included. Otherwise it is disabled with "Include <account> to use this method", because spending on an excluded card would be counted both here and through its repayment (FC-04).
  - **Fixed amount**: a monthly amount a member enters. The assumptions panel shows "Set by <member> on <date>".
- **What counts as flexible spending:** exactly what BUD counts as "flexible spent", by BUD's counting rules for pending transactions, uncategorised outflows, refunds, transfers and possible duplicates. FC defines no rules of its own.
  - FC then leaves out transactions linked to recurring items, because FC-04 already projects those items. This avoids projecting them twice; it isn't a different counting rule.
  - Each account's average uses the transactions on that account.
  - The assumptions panel shows BUD-02's footnotes with its wording when they apply: "Includes N uncertain items (<amount>) — may be off", linking to the list; "Missing data for <account> <range> — may be off"; and "Not updating since <date>: <account> — may be off".
  - An included account with "Include in budget" off has no flexible spending by BUD's rules, so none is projected for it. The assumptions panel names it: "<Account>: everyday spending not projected (not in the budget)".
- The result is applied as an equal daily outflow from day 1 to the end of the horizon.
- **Pace note.** With Recent spending, if the projected flexible spending until the end of the current budget period is more than the remaining left to spend, the view says: "This assumes you keep spending about <X>/day, your recent average. Your budget has <Y> left until <period end>." A "Preview with our budget" switch shows the alternative without changing the household's choice. The switch is shown only when "Our budget" is available.
- The assumptions panel shows the method, the figure used, its lookback, and also the last-30-days daily average, so a recent change in behaviour is visible.
- Fixed and non-monthly spending that isn't a confirmed recurring item is not projected. The assumptions panel says so: "Fixed and non-monthly costs without a recurring item aren't included".
**Notes:** The default predicts behaviour because the forecast's question is "will we run short?". A household that is deliberately cutting back can switch to Our budget, or use the preview. The 90-day lookback reacts slowly on purpose, so one frugal fortnight doesn't make the forecast optimistic. The double-counting argument only applies when an account with flexible spending is excluded, which is exactly when Our budget is disabled. A one-off large purchase inflates Recent spending. The Fixed amount method covers this in v1. Simplifi also leaves planned spending out of its projection (source above).

#### FC-06 Low-balance threshold and lowest point · Must · M3
As a household, I want a safety line we don't want to drop below, so that the forecast warns us in time.
**Acceptance criteria**
- The household sets one low-balance threshold in base currency (default 0). Any member can change it.
- If the projected combined balance falls below the threshold on any day in the horizon:
  - the headline shows "Projected below <threshold> on <first date>; lowest <amount> on <date>";
  - those days are marked on the chart and in the day list with an icon and text, not colour alone.
- The flag exists only inside the app (forecast view, and the dashboard if INS shows it). No notification is sent.

#### FC-07 Assumptions panel · Must · M3
As a Member, I want to see everything the forecast assumes, so that I can trust it or fix it.
**Acceptance criteria**
- The panel is reachable from the headline in one step. It lists:
  - included and excluded accounts, with starting balances and "as of" times;
  - recurring items used, with dates and amounts (estimates marked);
  - occurrences projected on day 0 (Overdue, Can't check, Unpaid, Missed "Them" Bills), and other Missed occurrences not projected;
  - the spending method, its figure, its lookback and the last-30-days average (FC-05);
  - accounts without enough history, accounts not in the budget, and BUD-02's footnotes for uncertain items, missing data and accounts not updating (FC-05);
  - the number of unconfirmed suggestions;
  - income landing outside the forecast;
  - card warnings (FC-04);
  - the FX note (FC-03);
  - the pending-transaction handling (FC-03).
- From the panel a member can open each recurring item, the account selection and the spending method.

#### FC-08 Per-account projection · Should · M3
As a household, I want to see each account's own projection, so that one account going overdrawn isn't hidden by a healthy total.
**Acceptance criteria**
- The view can be expanded to show each included account's projected balance and lowest point.
- In the per-account view, recurring transfers between included accounts are shown as an outflow from one account and an inflow to the other, on their expected dates.
- If any single account is projected below 0 while the combined balance stays above the threshold, the headline adds "<Account> projected below 0 on <date>".
- Example: salary lands in account A on the 10th, and rent leaves account B on the 1st. Account B is flagged even though A + B stays positive.
- Example: a recurring transfer A→B on the 9th covers rent from B on the 10th. B's line rises on the 9th and falls on the 10th, and B is not flagged.
- With the Recent spending method, each account's own average is applied to it. With the other methods, everyday spending is not shared out between accounts. The per-account view then says "Everyday spending shown in the combined view only".

#### FC-09 Stale data and low-confidence states · Must · M3
As a household, I want to know when the forecast is built on old or thin data, so that we don't trust it more than it deserves.
**Acceptance criteria**
- **Stale data:** if any included account is Stale by ACC's and BANK's rule, a warning names those accounts, their "Data up to" dates and, for connected accounts, their connection state (e.g. broken, expired). A connected account is stale by its last successful sync. A CSV-fed account, or a cash account with "Track freshness for this account" on, is stale by its "Data up to" date. The projection is still shown, labelled "Based on data as of <oldest date>". Cash accounts that haven't opted in are left out of that date, so a rarely used cash tin doesn't push it back by months.
- A connection that is only expiring doesn't make the forecast stale. "Expiring" appears only in BANK's header note and on connection screens, never in the forecast view.
- **Short history:** if the method is Recent spending and no included account has 30 days of history, the view says "Not enough history to estimate everyday spending: use our budget, enter a monthly amount, or view recurring items only". Until a member chooses, the projection is labelled "Recurring items only".
- **No recurring items:** if no recurring items are confirmed, the view says "No recurring items confirmed: bills and income aren't included" and links to the suggestions screen.
- **Nothing to show:** if no included account has a balance, an empty state explains how to add accounts.
**Depends on:** ACC ("Data up to" and manual-account freshness); BANK (connection health); SET (staleness thresholds)

#### FC-10 When the forecast and left to spend seem to disagree · Must · M3
As a household, I want an explanation when the budget says we're fine but the forecast doesn't (or the other way round), so that the two numbers don't confuse us.
**Acceptance criteria**
- A "Why these differ" note appears in the forecast view when either:
  - (a) left to spend is above 0 and the forecast drops below the threshold before the end of the current budget period; or
  - (b) left to spend is below 0 and the forecast stays above the threshold for the whole current budget period.
- The note shows these figures where they apply:
  - **Timing:** the next income date and amount, and the total outflows before it.
  - **Accounts outside the forecast:** their total balance.
  - **Sinking funds:** the total currently set aside (from BUD), with the text "Sinking funds are virtual: the app doesn't know which account holds this money. If it sits in an account in this forecast, the forecast counts it as available cash. If it sits in an account outside it (e.g. a savings account), it isn't counted." When any savings-type account is excluded and plain Transfers (REC-07) went into it in the last 90 days, the note names that account as the likely place.
  - **Buffer:** the combined balance of the forecast accounts (FC-02) at the start of this budget period.
  - **Spending assumption:** the pace difference from FC-05, when the method is Recent spending.
- The "About these numbers" link (FC-01) is always available, not only in cases (a) and (b).
- Neither number is ever adjusted to match the other.
- The note links to the budget, and the budget view (BUD) can link back to the forecast.
**Depends on:** BUD (left to spend, total sinking-fund balance, budget period dates)

#### FC-11 Planned one-off items · Could · M3
As a Member, I want to add a planned one-off payment or income (e.g. a holiday deposit on the 20th), so that the forecast includes it.
**Acceptance criteria**
- A member can add a one-off item with date, amount, direction, account and note. It appears in the projection and in the assumptions panel.
- The item disappears from the forecast after its date. It can also be linked to the real transaction when that arrives.

#### FC-12 What-if scenarios · Could · Later
As a household, I want to try changes (cancel a subscription, add a new bill, change the salary date) without saving them, so that we can compare outcomes.
**Acceptance criteria**
- A scenario applies temporary changes to the forecast, shown next to the baseline, and is discarded or saved by name.
**Notes:** PocketSmith offers this (source above). It is deferred to Later because FC-11, the FC-05 preview and editing recurring items cover the common cases in v1.

### 4.10 Net worth (NW)
Net worth is the total of all asset values minus all liability balances, in base currency, for the whole household. It combines connected accounts with manually valued assets and liabilities (property, vehicles, investments, valuables, loans), keeps monthly snapshots for a trend, and breaks the total down by type, account holder and account. Investments are manual values only in v1. Syncing holdings is Later. NW is in M3, but it relies on the balances ACC records from M1.

Research basis: Lunch Money records month-end balances, keeps the history editable, converts each balance at the historical rate for its date, and charts by type or by account ([Lunch Money – net worth](https://support.lunchmoney.app/home/net-worth.md)). Monarch keeps a daily balance snapshot and supports manual property and vehicle accounts alongside automated valuations ([Monarch – property & vehicles](https://help.monarch.com/hc/en-us/articles/4404739126548)). Emma treats property, vehicles and valuables as manual "offline assets" ([Emma](https://emma-app.com/features/tracking/net-worth)).

#### NW-01 Net worth total · Must · M3
As a household, I want one net worth figure, so that we know where we stand overall.
**Acceptance criteria**
- Net worth = total assets − total liabilities, in base currency, using each counted account's (NW-05) current balance or value exactly as ACC shows it, with ACC's label.
- Assets: current, savings, cash, investment, property, vehicle and other-asset accounts. Liabilities: credit card, loan, mortgage and other-liability accounts. Account types come from ACC.
- An asset with a negative balance (an overdrawn current account) stays an asset with a negative value. A liability in credit (an overpaid card) stays a liability with a negative value. Each account always stays on its own side.
- Liabilities are shown as positive amounts owed and subtracted, however the bank signs them.
- Foreign-currency balances are converted at the current reference rate (SET FX rule).
- If ACC labels an account's balance "calculated" or "may include a duplicate", net worth shows that label next to the account and a footnote on the total in the uncertain-items wording: "may be off", never "overstated".
- The figure always shows its freshness (NW-12).
**Depends on:** ACC (account types, balances and their labels)

#### NW-02 Liability balances for cards and loans · Must · M3
As a household, I want card and loan debts counted at what we actually owe, so that net worth isn't overstated or understated.
**Acceptance criteria**
- A credit card counts at its **Owed** figure as ACC shows it, with ACC's source label (see ACC — credit card balance). The available credit and the credit limit are never used as the liability.
- A loan or mortgage counts at its balance as ACC shows it: the bank's outstanding amount if the bank exposes the loan, otherwise its manual values (see ACC — loan or mortgage).
- NW defines no source order, credit limit or labels of its own. When ACC asks a member to enter a card's owed amount, the Net worth page shows the same prompt and counts the card from that value.
**Depends on:** ACC (owed figure, credit limit, loan balances and their labels); SPIKE-01, through ACC (which balance types banks provide for cards and loans)

#### NW-03 Manual values in net worth · Must · M3
As a Member, I want our property, car, investments, valuables and loans that aren't connected counted with their dated values, so that net worth includes them and shows how they changed.
**Acceptance criteria**
- Manual values, their history and who changed them are kept by ACC (see ACC — manual values). NW uses them as they are.
- The account's value on any date is its latest value on or before that date. Values are not interpolated. Before the first value, the account doesn't count.
- **Start value and date.** When a member adds a manual asset, loan or mortgage, the app asks for two values: the value on the date the household acquired it (for a loan or mortgage, the date it started and the amount owed then), and today's value. They are stored as ACC's opening value and date and as a value entry (see ACC — manual accounts). Both are optional.
  - If the trend's range includes months before the account's first value, those months show the marker "Doesn't include <account>: No value before <date>", using ACC-10's label.
  - Example: a flat and its mortgage are added in March 2026. The flat gets its 2019 purchase value, but the mortgage only gets today's balance. Months from 2019 to February 2026 show "Doesn't include Mortgage: No value before March 2026", so the flat doesn't silently look owned outright.
- Adding, editing or deleting a past value updates every affected monthly snapshot (NW-06).
- **Manual loans and mortgages between updates:**
  - The value is never reduced automatically, because the app can't split a repayment into principal and interest.
  - If a recurring item "Repays" this account (REC-07), the account is listed in "Values to update" with the note "<N> repayments (<total>) since the last value on <date>", once the first linked repayment after the latest value arrives. This is a reminder, not a label: the value stays exactly as entered, with ACC's label.
  - The note links to "Enter current balance".
- Investments are manual values only in v1. If a connected bank account of investment type reports a balance, that balance is used (SPIKE-01). Holdings and securities sync is Later.
- A value older than 90 days, or with repayments since it (above), is listed among "Values to update" on the Net worth page. This is a reminder, not staleness: value-type accounts are never Stale (see ACC — "data up to").
**Depends on:** ACC (manual accounts, opening value and date, manual values); REC (Repays link)
**Notes:** v1 has no ownership share. If the household owns part of an asset, members enter the household's share as the value.

#### NW-04 Joint accounts and assets counted once · Must · M3
As a household, I want shared accounts and assets counted once, so that net worth isn't inflated.
**Acceptance criteria**
- Every account and manual asset or liability has an account holder: a member or Joint (see HH).
- A Joint account connected by both partners appears and counts once (see HH/BANK – joint account de-duplication).
- If two counted accounts share an account identifier (e.g. IBAN), the Net worth page shows a "Possible duplicate account" warning naming both.
- Joint is its own group in breakdowns. It is never split between members.
**Depends on:** HH, BANK (joint account appears once); SPIKE-01 (how a joint account appears from two logins)

#### NW-05 Choose what counts · Should · M3
As a household, I want to leave specific accounts out of net worth (e.g. a child's account we manage), so that the figure reflects our own money.
**Acceptance criteria**
- NW counts accounts whose "Include in net worth" setting is on (see ACC — account settings; default on). Excluded accounts are listed separately as "Not counted" with their values.
- Archived accounts count until their archive date and not after it.
- Changing the setting recalculates current net worth and all snapshots, so the trend stays consistent.

#### NW-06 Monthly snapshots · Must · M3
As a household, I want net worth recorded at every month end, so that we can see the trend even after an account is disconnected.
**Acceptance criteria**
- For the end of each calendar month (household time zone), the app shows every counted account's month-end value:
  - in account currency, taken from ACC's balance history (see ACC — balance history recording), including ACC's calculation backwards before the first recorded balance;
  - converted at the month-end reference rate (SET FX rule). After a base-currency change, every month is converted again at its own month-end rate (SET-10);
  - with ACC's labels for that month.
- NW defines no reconstruction, correction rule or labels of its own.
- **Marked months.** A month is marked when any counted account's value carries an ACC label other than "reported": "calculated", "gap" (including coverage gaps and gaps before an account's data starts) or "may include a duplicate". The month names those accounts and their labels. Example: "Mar 2024 · Current account: calculated, may include a duplicate".
- When ACC's history or labels for a past month change, the month-end value follows. Examples: a CSV import fills a gap, or a possible duplicate is resolved.
- **Value-type manual accounts** use their latest value on or before month end (NW-03). A month that includes values older than 90 days at month end shows "Includes old values".
- Disconnecting an account and keeping its data keeps its past snapshot values. Deleting an account's data removes it from all snapshots, and the trend is recalculated. If an Owner restores it from Recently deleted (SET-11), its past values come back. Erasing a member's data (HH-08) removes their accounts from all snapshots the same way.
- The current month is shown as a live "Today" value, not as a snapshot.
**Depends on:** ACC (balance history and its labels, recorded from M1); BANK (disconnect keep/delete); SET (FX rule, time zone)
**Notes:** Snapshots use calendar months, not the budget period, and never wait for a period to be settled. Net worth is a balance-sheet figure, and month ends are the same for every household whatever its payday anchor. Whether banks return any past balances is not assumed (Depends on: SPIKE-01). Past values come from ACC's recorded and calculated history.

#### NW-07 Back-filled history · removed
(removed: duplicates ACC — balance history recording, which calculates balances backwards before the first recorded one and labels them "calculated" or "gap". NW-06 uses that history and its labels.)

#### NW-08 Trend · Must · M3
As a household, I want a chart of net worth over time, so that we can see whether we're moving forward.
**Acceptance criteria**
- The chart has monthly points plus "Today" and three lines: net worth, total assets, total liabilities. Ranges: 6 months, 1 year, 3 years, all.
- Months marked in NW-06 (calculated, gap, may include a duplicate) or NW-03 ("Doesn't include <account>") are marked with a symbol and explained in the tooltip and table, not by colour alone.
- Selecting a month shows its net worth and its change since the previous month, split into:
  - **change in accounts already counted**, split into assets and liabilities;
  - **accounts and assets added or removed**: the value of each account at the first month end it counts, or at the last month end before it stops counting;
  - **currency effect**, if any (NW-10);
  - within the change in accounts already counted, **manual value updates**: for each manual account whose value was updated in that month, the change and the period it covers. Example: "Flat value updated: +80,000, covers Mar 2024 – Mar 2026". The change is shown as one step in the month it was entered, never spread over the earlier months, because values aren't interpolated (NW-03).
- Example: a flat is added in March with only a March value of 600,000. March shows "Added: +600,000; change in existing accounts: +2,300". The flat is never shown as growth.
- The page shows the change over the selected range as an amount and a %, with the same split.
- A table alternative is available.

#### NW-09 Breakdowns · Must · M3
As a household, I want to see what our net worth is made of, so that we understand where it sits and who holds what.
**Acceptance criteria**
- **By type:**
  - assets: Cash & current, Savings, Investments, Property, Vehicles, Other assets;
  - liabilities: Credit cards, Loans, Mortgages, Other liabilities.
  Each group shows its total and its % of total assets or total liabilities.
- **By account holder:** each member and Joint, with assets, liabilities and net.
- **By account:** value, ACC's source label, and "Data up to" or "Value as of" (ACC).
- Every breakdown can be viewed for Today or any past snapshot month.

#### NW-10 Currency effect shown separately · Should · M3
As a household with foreign-currency accounts, I want exchange-rate moves shown apart from real changes, so that a weaker or stronger currency isn't mistaken for saving or spending.
**Acceptance criteria**
- For each foreign-currency account, the change between two snapshots is split into:
  - **Currency effect** = previous balance × (new rate − old rate);
  - **Real change** = (new balance − previous balance) × new rate.
- Example: an account holds 1,000 in a foreign currency in both months, and the rate moves from 4.30 to 4.20. Real change is 0 and the currency effect is −100.
- The trend (NW-08) and month details show the total currency effect as its own line item.
- This appears only if at least one counted account is in a foreign currency.
**Notes:** Should, not Must: net worth is still correct without the split. The split prevents misreading the change. Rates follow SET's FX rule (Lunch Money uses the historical rate for each date, source above).

#### NW-11 Property and vehicle equity · Should · M3
As a household, I want to link our mortgage to our flat, so that we see how much of it we actually own.
**Acceptance criteria**
- A member can link one or more liabilities (mortgage, loan) to one property or vehicle. A liability links to at most one asset.
- The asset's page shows its value, its linked liabilities, its equity (value − linked liabilities, which can be negative) and its equity history.
- If a linked liability is in "Values to update" with repayments since its last value (NW-03), the equity shows the same note.
- Linking never changes the net worth total or the type breakdown.
**Notes:** The whole mortgage journey, end to end:
1. A member adds the flat as a manual property, with its purchase-date value and today's value (NW-03).
2. The mortgage is either connected, and counted at the bank's outstanding amount (NW-02), or added as a manual mortgage with its start date and starting amount and today's balance (NW-03). If the start is skipped, earlier months show "Doesn't include Mortgage".
3. The member links the mortgage to the flat, and the flat's page shows equity.
4. The monthly repayment from the current account is detected (REC-01) as a Bill in a fixed category, with "Repays: Mortgage" (REC-07). It reaches BUD's plan through BUD's own roll-up (REC-07) and the forecast (FC-04).
5. With a manual mortgage, each linked repayment adds to the "N repayments since the last value" note (NW-03). The mortgage appears under "Values to update" until a member enters the balance from the bank statement.
6. The trend shows the falling mortgage and the flat's value changes as change in existing accounts. The flat's first appearance shows as "Added", not as growth (NW-08).

#### NW-12 Freshness and stale-data warning · Must · M3
As a household, I want to know when net worth is based on old data, so that we don't misread it.
**Acceptance criteria**
- The net worth figure shows "as of <date>": the oldest "Data up to" date (ACC) among counted connected and CSV-fed accounts, and cash accounts with "Track freshness for this account" on. Other cash accounts are left out of that date.
- If any counted account is Stale by ACC's and BANK's rule, a warning lists those accounts, their "Data up to" dates, the connection state for connected accounts (e.g. broken, expired), and their share of total assets or liabilities (e.g. "2 accounts, 38% of assets, data up to 9 days ago"). Value-type accounts are never Stale (ACC).
- A connection that is only expiring doesn't make net worth stale. "Expiring" appears only in BANK's header note and on connection screens.
- "Values to update" (NW-03) is reported separately, in milder wording than the stale-connection warning.
- These warnings appear wherever net worth is shown, including the dashboard (INS).
**Depends on:** ACC ("Data up to" and manual-account freshness); BANK (connection health); SET (staleness thresholds)

### 4.11 Insights, reports & dashboard (INS)

INS turns data owned by other areas (TXN, CAT, BUD, REC, FC, NW, BANK, ACC) into views: the dashboard (home screen), reports, rule-based in-app insights, a recap page per budget period and the weekly review. INS defines no money concepts of its own. Every figure about income, spending, savings or the budget counts transactions exactly as BUD does, so a number means the same thing wherever it appears. There are no notifications. Everything here is shown in-app only, so every derived number shows how fresh it is, and anything the household should act on has to be visible on the dashboard.

Milestones: **M2** has what the household needs to run and close its first periods: basic dashboard, spending by category / group / flex type, income vs expenses and savings rate, drill-down, the shared counting and freshness rules, a minimal recap with Settle (INS-23) and the weekly review view (INS-24). **M3** has the full dashboard, the other breakdowns (account, member, tag, merchant), trends, cash-flow diagram, period comparison, year in review, insights, and the fuller recap and weekly review (INS-26).

---

**— Shared rules —**

#### INS-01 Freshness markers on every derived number · Must · M2
As a household, I want every number on the dashboard, in reports, in the recap and in insights to say when its data may be incomplete or not yet final, so that I never act on a figure I wrongly think is current.
**Acceptance criteria**
- A number's *scope* is the accounts it is computed from (INS-02), plus the date range it covers.
- Account freshness comes from the owning area, and no account type is exempt:
  - connected accounts: BANK (last successful sync, connection state);
  - manual accounts: ACC, using SET's manual-account threshold. A CSV-fed account can be Stale. A cash account is never Stale unless a member has opted it in. Value-type accounts show "Value as of <date>".
- An account's *data up to* date is its last successful sync (BANK), or ACC's "data up to" date for a manual account. A joint account connected from two logins uses its most recently synced connection.
- **Stale**: a number shows a Stale marker when an account in its scope is Stale (BANK/ACC) and that account's data up to is before the end of the number's range. The marker says from which date transactions may be missing (e.g. "mBank Joint: may be missing transactions after 3 Oct").
- A number whose range ends before every in-scope account's data up to shows no Stale marker, even if a connection is broken today. Example: last year's report is not marked Stale because mBank broke yesterday.
- **Provisional**: a number whose range includes a past budget period that is not yet Settled (INS-23) shows a Provisional marker naming the period (e.g. "September is Provisional, figures may still change"). The current period is "in progress" (INS-03), not Provisional.
- **Incomplete**: a number whose range covers a coverage gap (ACC: a stretch with no data for an account, not a history that starts mid-range) shows "Missing data for <account> <range> — may be off", linking to the gap.
- **Not updating**: while an account disconnected with "Keep data" stays included in the budget (BANK, ACC), a number whose range covers dates after its last data shows "Not updating since <date>: <account> — may be off". That account has an end date, so it never holds a period back from settling (INS-23).
- The uncertain-items footnote (INS-02), Incomplete and Not updating use BUD-02's wording unchanged, rendered the same way (BUD-02).
- **Expiring** is never shown on a number, card, widget, report, recap or insight. It appears only in BANK's one-line header note, which shows on every screen including the dashboard (INS-06), and in BANK's connection screens. A number is never marked Stale only because a consent is expiring.
- Every marker is text plus an icon, never colour alone. It names the account, the problem and **who can fix it**:
  - a connection: the member whose bank login it uses (e.g. "Anna needs to re-consent at mBank"). For that member the marker links to the re-consent or sync action. Other members see the same text with no re-consent action, because only that member can complete SCA at the bank.
  - a manual account: "Import a newer CSV or add transactions", with the action available to every member.
- Each card, widget and report shows its own Stale, Provisional, Incomplete and Not updating markers for its own scope. A page-level banner alone does not count.
**Depends on:** BANK — connection health, last successful sync, which member's bank login a connection uses, data gaps; ACC — manual-account freshness and "data up to", history coverage; SET — staleness thresholds; INS-23 — Settled state
**Notes:**
- This applies the rule that every derived number carries a stale-data warning.
- Expiring is kept off numbers because the data behind a figure is still current while a consent runs. With per-member Enable Banking setups and joint accounts seen from two logins, something is expiring on many days, so a per-figure marker would be on screen most of the time and stop being read.

#### INS-02 Counting rules for all reports, recap and insights · Must · M2
As a household, I want every report, recap and insight to count money exactly as the budget does, so that numbers agree across screens.
**Acceptance criteria**
- **One rulebook**: every INS figure about income, spending, savings or the budget uses BUD's counting rules unchanged (see BUD — how each flex type counts, refunds, planned savings and transfers to savings, savings rate). INS has no variant of them. In particular:
  - pending transactions count, and every total that includes them says "incl. N pending (<amount>)", linking to them;
  - uncategorised outflows count as flexible spent, and every total that includes them says "incl. N uncategorised (<amount>)" (BUD's label);
  - uncategorised inflows are not income, and are listed under "Not counted" (below);
  - a past period uses the flex type each category had in that period (CAT);
  - an internal transfer whose two legs TXN has paired counts once, from its budget side (BUD);
  - only accounts included in the budget (ACC) are in scope. A report's account filter narrows within them.
- **The category decides**: a transaction counts by its category's flex type. Account type and transfer structure only supply the default category (TXN, CAT). Examples:
  - a transfer into a savings-type account defaults to a savings category and shows in "Moved to savings". If a member re-categorises it as a plain transfer, it leaves "Moved to savings" in every report;
  - a repayment to a tracked loan or mortgage account defaults to a fixed category and counts as fixed spending.
- **Moved to savings** is BUD's moved to savings: money into savings counts +, withdrawals count −. It is shown beside spending, never as spending or income, and it is not counted a second time anywhere. For example, it is not added into the savings rate, which is BUD's (income − spending) ÷ income.
- **"Not counted" lines**: every report that shows spending or income lists, below its totals and never added into them, each of these that has an amount in its range and filters. Each line opens its transactions.
  - "Money leaving tracked accounts" and "Money arriving from untracked accounts" (TXN's labels), as two lines: transfer-type transactions with no paired leg in a tracked account, e.g. a payment to an untracked account or a reimbursable work expense;
  - "Moved to accounts outside the budget": transfers from a budget-side account to a tracked account not included in the budget, unless their category makes them savings (above);
  - "N uncategorised inflows not counted" (BUD's label);
  - "Excluded from budget", with outflow and inflow amounts shown separately (TXN).
- **Uncertain items**: a total that includes any item TXN marks as uncertain shows "Includes N uncertain items (<amount>) — may be off", linking to the list where each can be resolved. TXN defines the uncertain states, e.g. an unresolved possible duplicate (both counted until resolved) or a leg of a suggested internal transfer not yet confirmed (counted by its own category until then). The wording never says "overstated", because the error can go either way.
- **Splits**: each split part counts in its own category (BUD). In merchant, account and member breakdowns it takes its parent's merchant, account and account holder.
- **Foreign currency**: totals are in the base currency (SET — FX rule). Drill-down lists show each transaction's original amount and currency next to the converted amount. A total that includes a conversion at what SET calls an "Estimated rate" says "includes estimated exchange rates".
- Transactions in archived accounts stay in reports for their dates.
**Depends on:** BUD — counting rules, refund timing, moved to savings, savings rate; TXN — pending, transfer pairing and suggested pairs, transfers to untracked accounts, uncertain states, exclude from budget, splits; CAT — flex types and their history; ACC — include in budget; SET — FX rule
**Notes:**
- With one rulebook, the dashboard, budget, reports and recap can be checked against each other by hand. Any other view (e.g. booked only) would have to be an explicitly labelled report filter. v1 has none.
- "Category decides" lets a household keep sinking-fund money in a real savings account: re-categorising those transfers as plain transfers keeps them out of savings.
- The "Not counted" lines make sure money that leaves the tracked accounts never disappears from view, even though it is neither spending nor income.
- Possible duplicates are counted twice rather than once. Picking which one to drop would silently remove a real transaction whenever the pair are two genuine identical purchases.

#### INS-03 Report periods, date ranges and history coverage · Must · M2
As a household, I want reports to use the same periods as our budget and to say when history is missing, so that month close and reports show the same totals and averages aren't skewed.
**Acceptance criteria**
- The default time unit for every report is the **budget period** as set in SET/BUD (a calendar month or payday-anchored). Each transaction belongs to the period TXN's date rule assigns.
- Range presets: current period, last period, last 3, last 6 and last 12 periods, this year, last year, all time. A custom date range is also available. Custom ranges use the same transaction date as TXN's period rule.
- The current period is labelled "in progress". A past period not yet Settled is labelled "Provisional" (INS-23). Both are drawn so they can be told apart from Settled periods without relying on colour. Neither counts in averages, baselines or comparisons.
- A "year" (for year in review and the "this year" / "last year" presets) is the set of budget periods with most of their days in that calendar year. A tie goes to the later year. Example: with payday anchor 25, the period 25 Dec 2026–24 Jan 2027 belongs to 2027.
- **History start**: each account has a history start date with one of two reasons, from ACC/BANK:
  - **opened**: nothing is missing before it, because the account didn't exist or wasn't used.
  - **earlier data missing**: the bank returned no older history.

  The default is "earlier data missing" when the first import reached the bank's history limit, otherwise "opened". A member can correct the reason in ACC.
- When a range starts before a history start marked "earlier data missing", the report shows "Partial: <account> data starts <date>". A history start marked "opened" shows nothing.
- A **qualifying period** is a Settled period that counts towards averages and comparisons. A Settled period does not qualify if, for some account in scope, it falls wholly or partly:
  - before a history start marked "earlier data missing", or
  - within a coverage gap ("Missing data for <account> <range>", ACC-13).

  A history start marked "opened" never removes a period, so adding a newly opened card does not switch averages off.
- A transition period after a change of the period setting (BUD) never qualifies, because its length differs. It is shown in reports as its own period, labelled "Transition (N days)".
- When fewer qualifying periods exist than an average asks for, it says "based on N periods". With 0 it is not shown.
**Depends on:** SPIKE-01 — whether reaching the bank's history limit can be detected; BUD/SET — budget period, payday anchor, transition period; TXN — date rule; ACC — history start and reason per account; BANK — data gaps; INS-23 — Settled state
**Notes:** Decision: budget periods, not calendar months. With a calendar-month period they are the same. With a payday anchor, calendar-month reports would disagree with the budget being closed. Custom ranges cover one-off questions such as "the 3–17 July holiday".

#### INS-04 Drill-down from any number to its transactions · Must · M2
As a member, I want to open the transactions behind any number, so that I can check and fix what it is made of.
**Acceptance criteria**
- Every money amount on the dashboard, in reports, recap and insights can be selected by pointer and by keyboard. Selecting it opens the transaction list filtered to exactly the transactions or split lines that make up the amount, and shows the list total. For a sum, the list total equals the selected amount. Refunds show as negative and split lines show their split amount.
- **Average**: opens the transactions of the periods it averages. The header reads "Average of N periods = <total> ÷ N", and that total equals the list total.
- **% share**: opens the same list as the line's amount.
- **Savings rate**: opens that period's income vs expenses view (INS-13), showing the parts of the calculation. Each part then drills down to transactions.
- Amounts that are not sums of transactions link to their owning view: net worth to the NW breakdown, forecast low point to FC's projection and assumptions, left to spend to the BUD view.
- The applied filters (period, dimension value, accounts, members, tags) show as removable chips in the transaction list.
- Editing a transaction from the drill-down (category, split, exclude, tag, resolve duplicate) and going back shows the number recalculated.
**Depends on:** TXN — transaction list filters, totals and edits

#### INS-05 Accessible charts · Must · M2
As a member using a screen reader, a keyboard or a small screen, I want every chart to have a text and table equivalent, so that I get the same information without seeing the chart.
**Acceptance criteria**
- Every chart has a "Show as table" equivalent with the same values. The only chart replaced by its table on phones is the cash-flow diagram (INS-14). Every other chart is shown on phones by default, with the table toggle.
- Every chart has a one-sentence text summary of its main result, available to assistive technology (e.g. "Spending €2,140, 12% above 3-period average").
- Colour is never the only signal. Over/under, increase/decrease, stale, Provisional and in progress all carry a text label, a sign (+/−) or an icon. Series are distinguished by label or pattern as well as colour.
- All chart interactions (selecting a segment, drill-down, changing the period) work by keyboard with a visible focus indicator.
- Charts and tables meet NFR's accessibility target (WCAG 2.2 AA), including the contrast of chart labels and lines.
**Depends on:** NFR — accessibility

---

**— Dashboard —**

#### INS-06 Basic dashboard · Must · M2
As a member, I want one home screen that shows how much we can still spend, what's new and whether the data can be trusted, so that a quick check takes seconds.
**Acceptance criteria**
- From M2 the dashboard is the landing page after sign-in, replacing M1's Connections page (BANK). It carries the same global items as that page, with the same rules, plus the "household events since your last visit" line, the erasure and household-deletion countdowns and the Owners' backup warning (AUTH-13, SET-09, HH-08, NFR-12). It has these widgets:
  - **Left to spend**: BUD's left to spend for the current budget period, the period end date and days left, and BUD's over-pace flag when raised. A negative value reads "Over by <amount>" in text. Selecting it opens the budget view.
    - **"Can we afford this?"** (J-05): a link under left to spend opens a detail with an optional amount field. It shows left to spend and the daily amount available (BUD-15) after that amount. From M3 it also shows FC's lowest projected balance in the horizon and its date beside them, with J-05 step 4's three sentences. The amount is never saved and changes nothing.
  - **To review**: the number of items in the review inbox (CAT). Selecting it opens the inbox. With nothing to review it reads "All reviewed", not "0", and links to the weekly review (INS-24).
    - From the household's review day (SET) it also shows "Weekly review due", linking to the weekly review, until a member marks the week reviewed (INS-24).
  - **Connections**:
    - When no connection or manual account needs action, it shows one line: "All connections up to date · last synced <time of the least recently synced connection>".
    - Otherwise it shows one row per connection that is Stale, broken, revoked or expired, and per manual account that is Stale (INS-01). Each row shows the state, since when, and who must act. These rows are the attention rows placed at the top of the dashboard (INS-09).
    - The signed-in member's own connection rows come first, labelled "You", with the action (sync now / re-consent). Other members' connection rows read "<name> needs to re-consent at <bank>" and have no SCA action, only "Copy renewal link" (BANK-10). Manual-account rows offer "Import CSV" or "Add transaction" to every member. A cash account that tracks freshness also offers "Count cash" and "No more transactions up to <date>" (ACC-13).
  - **Last period**: shown once a budget period has ended. It shows the most recently ended period's recap state (INS-23):
    - while Provisional: "<period>: Provisional", with what it is waiting for (e.g. "settling until 7 Oct" or "Waiting for mBank Joint to sync") and a link to the recap;
    - once Settled: "<period> settled" or "<period> settled with N open items", with a link to the recap. This is shown until the signed-in member opens that recap, and then the widget is hidden until the next period ends.
  - **Recent transactions**: the 5 most recent transactions on phone and 10 on desktop, with pending ones labelled "Pending". Each shows date, merchant or description, category, account holder and amount in account currency, plus a "See all" link.
- **Header note**: BANK's global one-line header note for expiring consents shows at the top of the dashboard, as on every screen (BANK). Example: "Consent expiring: mBank (Anna) in 9 days · PKO (you) in 12 days — Re-consent".
  - The re-consent link is offered only for the signed-in member's own connections.
  - Extra connections collapse into "+N more", which opens the connections screen.
  - No widget, attention row or number repeats it, including in a connection's final days.
- Each widget shows its own INS-01 markers.
- Each widget loads independently. A widget that fails shows "Couldn't load — retry", never a zero or blank amount, and the other widgets still show.
- NFR's dashboard performance target (under 2 s on a mid-range phone over 4G with 5 years of history) is met when left to spend, with its freshness marker, and any connection attention rows (INS-09) are on screen. Other widgets may still show a loading placeholder at that point, never a zero.
- The layout is fixed in v1. Members cannot hide or reorder widgets.
**Depends on:** BUD — left to spend, over-pace flag; CAT — review inbox; SET — review day; BANK — M1 Connections page, header note and banner, connection health, which member's login a connection uses; ACC — manual-account freshness; TXN — transaction list; NFR — performance; INS-23, INS-24
**Notes:**
- Matches the core of Copilot's dashboard: "Free to spend", To Review and Upcoming ([Copilot help](https://intercom.help/copilotmoney/en/articles/6045480-dashboard-tab-overview)).
- Monarch lets users customise its dashboard separately on web and mobile ([Monarch help](https://help.monarch.com/hc/en-us/articles/360058127551-Customize-Your-Dashboard)). That is not needed for one household and is left out.
- With no notifications, naming who must act on a connection is how the other partner learns that they need to pass the message on.

#### INS-07 Full dashboard · Must · M3
As a member, I want the dashboard to also show upcoming bills, net worth, the forecast low point, insights and the latest recap, so that I don't need to open each area to see what needs attention.
**Acceptance criteria**
- Widgets added to INS-06:
  - **Upcoming bills**: recurring items (REC) still due until the end of the current budget period, and always at least the next 7 days. Overdue items come first, labelled "Overdue". Up to 5 rows (name, due date, expected amount), the total still to pay in that window, and "See all" linking to REC's calendar.
  - **Net worth**: NW's current value, the change since the previous monthly snapshot (amount and sign), and NW's indicator of manual values that may be out of date. Selecting it opens NW.
  - **Forecast low point**: the lowest projected balance for the household's chosen accounts within the horizon the signed-in member last chose in FC (FC's default otherwise), with its date. Shows FC's low-balance flag when raised. Selecting it opens FC.
  - **Insights**: up to 3 active insights (INS-18), newest first, the member's "N new since your last visit" count (INS-18), and "See all (N)".
- Every widget follows INS-01 (freshness) and INS-04 (drill-down).
**Depends on:** REC — upcoming/overdue; NW — current value, snapshots; FC — projection, horizon, low-balance flag
**Notes:**
- Bills run until the end of the budget period because that is "until next payday" when the period is payday-anchored. Those bills are what the household must still cover from this period's money. The 7-day minimum keeps next week's bills visible on the last days of a period.
- The recap card moved to M2 as the Last period widget (INS-06).
- Top 3 insights keeps the widget within about one phone-screen height.

#### INS-08 Dashboard empty and short-history states · Must · M2
As a new household, I want the dashboard to say what is missing instead of showing zeros, so that I don't mistake "no data" for "no spending".
**Acceptance criteria**
- With no connections and no imported or manual transactions, the dashboard shows a setup checklist instead of widgets: connect a bank, import CSV, add a manual account, set up the budget. Each step links to its flow and shows when it is done.
- No widget ever shows a zero amount because its data source is not set up. It shows "Not set up yet" with the action that sets it up. Examples:
  - left to spend before the budget wizard is done;
  - forecast before FC's accounts are chosen;
  - upcoming bills before any recurring item is confirmed ("No confirmed bills yet — review detected recurring items").
- While the first history import is running, affected widgets show "Importing history…" instead of numbers.
- A widget whose source is set up but empty shows a factual empty message (e.g. "No bills due before the end of this period").
- Averages and comparisons follow INS-03 ("based on N periods"; not shown with 0).
**Depends on:** BANK — import status; BUD — wizard state; REC; FC

#### INS-09 Dashboard layout on phone and desktop · Must · M2
As a member checking on my phone, I want the most important numbers first, so that a glance answers "can we spend?" and "is the data current?".
**Acceptance criteria**
- **Attention rows** at the top of the dashboard are the Connections widget's rows (INS-06). An expiring consent never has an attention row; it appears only in the header note (INS-06). When there are no attention rows, the Connections widget's one-line summary sits at the end of the dashboard.
- An attention row can be collapsed to a one-line badge but not dismissed while its problem lasts (BANK).
- **Phone, M2** (360 px wide and up), one column in this order: header note, attention rows, left to spend, to review, last period, recent transactions, Connections summary.
- **Phone, M3**, one column in this order: header note, attention rows, left to spend, to review, upcoming bills, insights, last period, recent transactions, forecast low point, net worth, Connections summary.
- At 360×640 px, the header note, left to spend and up to 2 attention rows are visible without scrolling. With more than 2, the rest collapse into "+N more connections need attention".
- **Desktop** (1280×800 px and up) has at least two columns. Visible without scrolling: in M2, left to spend, to review and connection attention rows; in M3, upcoming bills as well.
- There is no horizontal page scroll at any width from 360 px up.
**Depends on:** NFR — supported widths; BANK — header note, connection banner

---

**— Reports —**

#### INS-10 Spending and income by category, group and flex type · Must · M2
As a household, I want spending and income broken down by category, category group and flex type, so that we can close the month and see where money went.
**Acceptance criteria**
- One report screen with a "group by" choice of category, category group or flex type, and a filter by account (accounts included in the budget, INS-02).
- Each line shows its amount and its average per qualifying period over the selected range (INS-03). Spending lines show their share of total spending (%), and income lines their share of total income. Lines can be sorted by amount or name.
- **Flex type** lines are Fixed, Non-monthly, Flexible, Income and "Moved to savings" (INS-02). Moved to savings shows no % share.
- Uncategorised outflows are a line "Uncategorised (counted as flexible)", inside Flexible in the flex type view and as its own line in the category and group views.
- Transfer-type transactions are not lines. Those with no paired leg in a tracked account appear in the "Not counted" lines below the totals (INS-02).
- Spending and income are shown separately.
- Each grouping has a bar chart with a table toggle (INS-05).
- All INS-02 counting rules, INS-01 markers and INS-04 drill-down apply.
**Depends on:** CAT — categories, groups, flex types; BUD — counting rules
**Notes:** M2 scope is what the household needs to close its first month: where the money went by category and flex type (this report), income vs expenses and savings rate (INS-13), and drill-down to fix wrong categories (INS-04). The other group-bys and filters are in INS-25, M3.

#### INS-25 Breakdown by account, member and tag; combined filters · Must · M3
As a household, I want to break down and filter spending by account, member and tag, so that we can answer questions such as "what did the holiday tag cost?" or "how much went through each card?".
**Acceptance criteria**
- INS-10 adds the group-bys account, member and tag. Filters on accounts, members, categories, category groups, flex types and tags can be combined, and each filter can include or exclude values.
- **Member**:
  - Lines are each member plus **Joint**. Every transaction is attributed to its account's account holder as currently set (ACC), for all dates. The screen says "Grouped by account holder".
  - Changing an account's holder re-attributes that account's whole history in this report.
  - Former members appear as HH defines for members who have left.
- **Tag**:
  - A transaction with several tags counts in full under each tag, and the report says "Tags overlap — lines don't add up to the total".
  - Untagged transactions show as "No tag".
  - The grand total is the total of the filtered transactions, not the sum of the tag lines.
- All INS-02, INS-01 and INS-04 rules apply.
**Depends on:** TXN — tags; ACC — account holder; HH — former members
**Notes:**
- In a fully shared household, "by member" answers "through whose accounts did the money go?", not "who decided to spend it". Unlike the account breakdown, it adds up all of a member's accounts and cards in one line, which stays comparable when a member opens a new card.
- Contributions to a joint account ("who pays what") are internal transfers, not spending, so this report does not show them. The transaction list filtered to transfers into the joint account answers that question (TXN).
- If most spending is on a Joint account, the report will be mostly "Joint". That is correct. Tags give finer attribution. INS adds no per-transaction member field. v1 does not attribute joint-account card spending to the cardholder (Open questions).

#### INS-11 Merchant breakdown · Should · M3
As a household, I want spending grouped by merchant, so that we can see which shops and services take the most money.
**Acceptance criteria**
- "Merchant" is available as a group-by and a filter in INS-10.
- Lines use the merchant display name from CAT's merchant cleanup (CAT-14), or the raw description where no merchant was identified.
- The report shows the top 20 merchants by amount plus an "All other merchants" line. The full list is available as a table.
**Depends on:** SPIKE-01 — description/merchant quality; CAT — merchant cleanup
**Notes:** If SPIKE-01 finds descriptions unusable, this report is only as good as CAT's merchant cleanup.

#### INS-12 Trends over periods · Must · M3
As a household, I want to see how spending and income in any breakdown changed period by period, so that we notice trends.
**Acceptance criteria**
- For any breakdown and filter (INS-10, INS-25), a trend view shows one value per budget period across the selected range (default: last 12 periods), with the average of qualifying periods marked (INS-03).
- Up to 5 lines (e.g. categories) can be selected for side-by-side comparison. Each line is labelled directly, not only by colour.
- The in-progress period follows INS-03.
- The trend is shown as a chart on all widths, with a table toggle (INS-05).
**Depends on:** INS-03, INS-10
**Notes:** Lunch Money's query tool shows totals and averages over time and exports CSV ([Lunch Money docs](https://support.lunchmoney.app/finances/analyze)).

#### INS-13 Income vs expenses and savings rate · Must · M2
As a household, I want income, spending, savings and savings rate per period, so that we know whether we live within our means.
**Acceptance criteria**
- For each budget period in the selected range, the report shows BUD's figures (BUD — savings rate), counted per INS-02:
  - income;
  - spending;
  - net saved (income − spending);
  - savings rate (net saved ÷ income);
  - moved to savings (BUD), as a separate line labelled "for information, not part of the rate".

  Range totals and averages over qualifying periods (INS-03) are also shown.
- A one-line description of the savings rate, taken from BUD, is shown with it.
- Every figure is live (current data). For the current period it equals what the budget screen shows at the same moment. For a Settled period that changed after settling, the recap shows the figure at settle and now (INS-23).
- Spending can be expanded by flex type, then category group, then category. Income can be expanded by income category.
- A negative net saved amount reads "−<amount>, spent more than income", not only in colour. A negative moved to savings reads "−<amount>, taken from savings".
- When income is ≤ 0, the savings rate shows "—" (as in BUD) with the text "no income".
**Depends on:** BUD — savings rate, net saved, moved to savings, irregular income; INS-23
**Notes:**
- Worked example, a holiday paid from savings: income 14,000; spending 17,000, including a 3,000 holiday drawn from its sinking fund; 3,000 moved back from the savings account. The report shows net saved "−3,000, spent more than income", moved to savings "−3,000, taken from savings", savings rate −21.4%. The withdrawal is not income, and the holiday counts once, as spending.
- YNAB's Income v Expense report shows per-month figures with averages and totals. It keeps refunds in their expense categories rather than in income, and drills down to the transaction list ([YNAB help](https://support.ynab.com/en_us/income-v-expense-Byu1BYWRq)).

#### INS-14 Cash-flow diagram (income → flex types → categories) · Should · M3
As a household, I want a flow diagram from income through flex types to categories, so that we can see in one picture where a period's income went.
**Acceptance criteria**
- For a selected budget period (default: the most recent Settled period) or range, the diagram shows Income → {Fixed, Non-monthly, Flexible, Savings, Left in accounts} → categories. Uncategorised outflows are a category under Flexible (INS-02).
- Sources are Income, plus where present: "From savings" (when moved to savings is negative), "From balances" (when spending plus savings exceed income and from savings) and "Net refunds".
- **Net refunds**: a category whose refunds exceed its spending in the range (net negative) is drawn as part of a "Net refunds" source flowing into its own flex type, never as an outflow. Selecting it lists those categories and their net amounts.
- Each flex type is labelled with BUD's net figure for it (INS-02), which is its drawn categories minus the net refunds flowing into it. The flow from the other sources into a flex type equals that net figure, or is absent when it is negative. If a flex type's net figure is negative, the part of its net refunds not used by its categories flows on to "Left in accounts".
- The diagram balances: Income + From savings + From balances = Fixed + Non-monthly + Flexible + Savings + Left in accounts, where each flex type is its BUD net figure.
  - "Savings" appears only when moved to savings is positive.
  - "Left in accounts" appears only when the sources exceed spending plus savings.
- "Left in accounts" is what the sources leave after spending and moved to savings in this range. Its node says "cash flow, not the period surplus", so it is not read as BUD's period surplus.
- Under the diagram, INS-13's net saved figure is shown with how it relates to the diagram: "Net saved (income − spending) = moved to savings + left in accounts − from balances". Example: "Net saved €4,000 = €2,000 moved to savings + €2,000 left in accounts".
- Below that, a "Not in this diagram" list shows the INS-02 "Not counted" lines, with amounts and drill-down.
- Non-monthly shows actual spending in non-monthly categories during the range, not the amount set aside.
- Within each flex type, the top 8 categories with positive net spending are shown and the rest are grouped as "Other <flex type>".
- Selecting any node or flow drills down (INS-04).
- Below 768 px width, the report shows the same data as an expandable table (source → flex type → category) and no diagram. Flex type rows show BUD's net figure, and net-refund categories are listed under their flex type with negative amounts.
- INS-02 rules and the INS-01 marker apply.
**Depends on:** BUD — counting rules, moved to savings; INS-02
**Notes:**
- Monarch's cash-flow Sankey shows where money comes from and goes each month ([Monarch](https://www.monarch.com/blog/visualize-your-cash-flow-like-never-before)). It can be broken down by category, group or merchant and filtered by account or tag ([Monarch help](https://help.monarch.com/hc/en-us/articles/20504904768020-Cash-Flow)).
- Monarch's Reports are web only ([Monarch](https://www.monarch.com/blog/saved-reports-and-more)). The phone table is the equivalent here.

#### INS-15 Period comparison · Should · M3
As a household, I want to compare a period with the previous one, our average and the same period last year, so that we know what changed.
**Acceptance criteria**
- Any breakdown can add comparison columns: previous period; average of the previous 3, 6 or 12 qualifying periods (INS-03); and the same period last year if it qualifies. Each column shows the absolute difference and the % difference, with a sign.
- "Previous period" is the most recent qualifying period before the selected one. When that is not the period immediately before, the column header names the one used (e.g. "vs August — September is Provisional").
- For the in-progress period, the "previous period" comparison is like-for-like: it uses that period's amounts up to the same day number of the period (e.g. day 12 vs day 12) and says so.
- A comparison base with no data (e.g. no history last year) shows "no data", not 0 or +100%.
- Lines can be sorted by largest increase or largest decrease.
**Depends on:** INS-03

#### INS-16 Year in review · Should · M3
As a household, I want a summary of the year, so that we can look back and plan the next year.
**Acceptance criteria**
- Available for every year with data. For the current year it is labelled "Year to date". It becomes final once every period of the year is Settled (INS-23).
- Contents:
  - total income, total spending, net and savings rate (BUD) for the year, each compared with the previous year where data exists;
  - top 10 categories and top 10 merchants by spending;
  - the 5 categories that grew most and the 5 that shrank most vs the previous year;
  - the 10 largest transactions;
  - total spent on subscriptions (REC);
  - net worth at the start vs end of the year (NW);
  - period-by-period income vs expenses.
- A year with fewer than 12 qualifying periods says "based on N periods" (INS-03).
- Wording is factual. No peer comparisons, jokes, or praise/blame wording (e.g. no "oops", "well done", "you overspent again").
- Every number drills down (INS-04) and shows INS-01 markers.
**Depends on:** REC — subscription totals; NW — snapshots; BUD — savings rate
**Notes:** Emma users criticised its year in review for peer comparisons and judging commentary, and asked to be compared with their own past instead ([Emma community](https://community.emma-app.com/t/review-of-year-2020/3416)).

#### INS-17 Export report data as CSV · Could · M3
As a member, I want to download the table behind a report, so that I can work with it in a spreadsheet.
**Acceptance criteria**
- Every report table can be downloaded as CSV with exactly the rows, columns, filters and period shown on screen, in the base currency.
- The file starts with a header naming the report, period, filters, base currency, generation time and any INS-01 markers active at that time.
- Needs no re-authentication. Only the full-data export does (AUTH).
- Text that could run as a spreadsheet formula is written as plain text, as in SET-08's export.
**Depends on:** AUTH — re-authentication for export
**Notes:** Could rather than Should, because drill-down (INS-04) plus TXN's CSV export of a filtered list already gets the underlying rows out. Lunch Money offers report CSV export ([Lunch Money docs](https://support.lunchmoney.app/finances/analyze)).

---

**— Insights (rule-based, in-app only) —**

#### INS-18 Insights list and lifecycle · Must · M3
As a member, I want a short list of factual observations about our money that I can act on or dismiss, and that I see even when my partner has already handled them, so that I notice things without being nagged.
**Acceptance criteria**
- Insights appear in three places:
  - the dashboard widget (top 3, INS-07);
  - an Insights page, with all active insights and a "Dismissed" tab for the current and previous period;
  - the recap of the period they belong to (INS-23).
- Each insight shows its type, subject (category, merchant or item), amount, the comparison it is based on (e.g. "vs 3-period average €180"), the period, and when it was raised. It links to the exact transactions behind it (INS-04), or to the owning view for flags from other areas (INS-22).
- Wording is neutral and factual, with no praise/blame or exclamation wording ([Mint users found judging alerts made them give up tracking](https://www.wral.com/amp/17100108)).
- **Dismiss** hides an insight for the whole household and records who dismissed it and when. It can be restored from the Dismissed tab.
- **Since your last visit** (per member): the Insights page starts with a section, separate from the active list, showing everything that happened to insights since the signed-in member last opened the Insights page or the weekly review (INS-26):
  - insights raised since then, labelled "New";
  - insights another member dismissed, labelled "Dismissed by <name>";
  - insights withdrawn, with the reason, e.g. "Price change accepted by Anna" (INS-22) or "No longer applies after recategorisation".
- Only active insights appear in the dashboard's top 3. The dashboard's "N new since your last visit" counts every entry in the member's section.
- Opening the Insights page or the weekly review marks the section seen for that member only.
- Each member's seen state exists only to show these markers. It is never counted or reported.
- **No repeats**: at most one insight per type per subject per budget period. A dismissed insight is not raised again for the same subject in the same period, even if the amount grows.
- **Cap**: INS's own rules (INS-20, INS-21) raise at most 5 insights per budget period. Further matches go into one entry, "N more unusual items this period", which opens the list.
- **Self-correcting**: insights are re-checked whenever their underlying transactions change (sync, recategorisation, split, exclude, duplicate resolved, transfer confirmed).
  - An insight whose condition no longer holds is withdrawn and listed in each member's Since your last visit section with the reason.
  - If the condition holds again in the same period, the same insight comes back and is not counted as a new one.
- Insights expire at the end of the budget period after the one they belong to.
- **Turn off type**: from any insight, a member can turn off that insight type for the household. A settings list shows every type with on/off and its thresholds (INS-20, INS-21), and any member can edit it.
**Depends on:** INS-19, INS-04
**Notes:**
- Alert fatigue is a known reason people mute finance-app messages ([SuprSend](https://suprsend.com/post/alert-fatigue)). The noise controls are the per-period cap, the no-repeat rule and the type switch.
- Cap of 5 per period is roughly one per week. Tune it with the dismissal share (section 10).
- "Since your last visit" replaces notifications for partner awareness: dismissing household-wide removes duplicate work, but a partner still sees what was handled and by whom.

#### INS-19 Insights and stale data · Must · M3
As a household, I want insights never to present a guess based on missing data as fact, so that a broken connection doesn't produce false alarms.
**Acceptance criteria**
- Every insight shows the INS-01 marker for its scope when it is displayed, not only when it is raised.
- Insights triggered by something *missing* (late expected income, forecast low balance) are not raised while any account behind them is Stale (INS-01). Instead, the Insights page and widget show one line, "Some insights are paused: <account or connection> is out of date", naming who must act (INS-01).
- An insight raised before its account became Stale stays visible with a Stale marker. It is not withdrawn just because the data is stale.
- Rules that use averages (INS-20) use only qualifying periods (INS-03), so Provisional periods never feed them.
**Depends on:** INS-01; BANK — connection health; ACC — manual-account freshness

#### INS-20 Unusual category spending · Must · M3
As a household, I want to know when a flexible category is already well above its usual level, so that we can react before the period ends.
**Acceptance criteria**
- Checked only for categories with the **flexible** flex type. Fixed and non-monthly categories are uneven by design and are not checked. Neither is uncategorised spending, which is not a category.
- Triggers when the category's spending in the current budget period so far (INS-02) is **more than 1.5×** its average over the **previous 3 qualifying periods** (INS-03), **and** the excess over that average is at least the *insight minimum amount*.
- The default insight minimum amount is 5% of the current period's flexible budget (BUD), rounded to a whole unit of the base currency. A member can replace it with a fixed amount in insight settings.
- Raised whether or not BUD's over-pace flag is on. The over-pace flag says the whole flexible budget is ahead of plan. This rule names which category is above its own history. Both can show at the same time.
- **Short history**: with fewer than 3 qualifying periods, the rule is not checked. The Insights page then says "Unusual-spending checks start once 3 full periods of history exist — expected after <end date of the period that completes the 3rd>". Other insight types (INS-21, INS-22) work from day one.
- Example text: "Restaurants: €410 so far this period, vs €220 average over the last 3 periods (+€190)". It links to the period's transactions in that category.
- Recategorising transactions so that the condition no longer holds withdraws the insight (INS-18).
**Depends on:** BUD — flexible budget amount, counting rules; CAT — flex types
**Notes:**
- This rule compares one category to its *history*. BUD's over-pace flag compares the whole flexible budget to the *plan*. BUD has no per-category limits in v1, so this is the only per-category signal.
- This rule fires late on purpose: comparing spending so far against a whole period's usual level means it only fires once the excess has actually happened, never on one early big shop. Early warning is BUD's over-pace flag.
- A wrong category produces a false alert, which is why every insight links to its transactions and withdraws itself after a recategorisation.
- With ≤90 days of first import and no CSV backfill, the rule starts after 1–2 more period ends. CSV backfill (TXN) makes it start immediately.

#### INS-21 Large transaction · Should · M3
As a household, I want unusually large one-off outflows pointed out, so that both partners know about them.
**Acceptance criteria**
- Triggers for a single outflow, booked or pending, at or above the *large transaction amount* that:
  - counts as non-monthly or flexible spending, including uncategorised (INS-02). Transfers, savings, income and fixed categories never trigger it;
  - is not matched to a confirmed recurring item (REC);
  - is not a leg of a suggested internal transfer awaiting confirmation. If the suggestion is rejected, the transaction is checked again.
- The default large transaction amount is 20% of the current period's flexible budget, rounded to a whole unit of the base currency. It can be changed in insight settings.
- For a split transaction, the whole amount is compared and one insight is raised for the transaction, not one per split line.
- If the transaction is part of an unresolved possible-duplicate pair, the insight says "possible duplicate" and links to resolve it. One insight is raised for the pair, not two.
- Example text: "Large payment: €620 at <merchant> on 12 Oct (account: Joint current)". It links to the transaction.
- The other partner sees it through "Since your last visit" (INS-18) even after the purchaser dismisses it.
**Depends on:** REC — confirmed recurring matches; TXN — suggested transfers, possible duplicates

#### INS-22 Flags from other areas in the insights list · Should · M3
As a member, I want flags raised by the budget, recurring items and forecast to appear in the insights list too, so that one place shows everything worth attention.
**Acceptance criteria**
- The insights list also shows these flags, using the owning area's rule unchanged:
  - BUD's over-pace flag;
  - REC's new subscription and price change flags;
  - REC's overdue expected recurring income (e.g. "Salary expected 25 Oct not yet received");
  - FC's low-balance flag.
- These flags do not count towards the INS-18 cap. They follow INS-18's one-per-subject-per-period rule, dismiss behaviour and "since your last visit" tracking, and INS-19's stale rules. Late income and low balance count as "missing"-type insights.
- Dismissing one in the insights list hides it from the list only. Whether the owning area's own view still shows it is that area's decision.
- When the owning area closes a flag (e.g. a member accepts a new price in REC), the entry is withdrawn. It appears in every other member's Since your last visit section with who closed it and the action taken (INS-18).
- Each flag links to its owning view (budget category, recurring item, forecast day).
**Depends on:** BUD — over-pace flag; REC — new/price-change/overdue flags; FC — low-balance flag

---

**— Recap —**

#### INS-23 Period recap and Settle · Must · M2
As a household, I want a recap page for each budget period that tells us when its data has settled and lets us close it, so that closing the month takes one screen instead of a digest email.
**Acceptance criteria**
- A recap exists for every past budget period with data. From the day after the period ends it is **Provisional**, and the period carries the Provisional marker wherever it appears (INS-01).
- **Settling window**: one household-wide number of days, the same for every bank:
  - It is 5 days (SPIKE-01, G14), so a month is settled when the household reviews it around the 5th.
  - Why 5 is enough: what matters is the days from a transaction's budget date to the first sync that returns it. At Erste the budget date is the booking date (G6), so that is about 1 day. For a bank that sends purchase dates it would be about 3: at Erste, card purchases book 1–6 days after the purchase, 9 in 10 within 3.
  - A bank connected later whose lag proves longer may raise it, at most to 14.
- **Auto-settle**: the period becomes **Settled** automatically on the first day, after the settling window has ended, on which every account included in the budget has data reaching the end of the window:
  - a connected account: a successful sync after the window ended (BANK);
  - a CSV-fed account: its data up to (ACC) is on or after the window's last day;
  - a cash account never holds it back, unless a member has opted it into staleness (SET, ACC). It then counts as CSV-fed;
  - an account whose end date (ACC: closed, archived or disconnected with Keep data) is before the period end never holds it back. One whose end date is later needs data up to its end date or the window's last day, whichever is earlier;
  - an account waiting for a member's decision (ACC, e.g. a replaced card not yet linked) holds it back;
  - an account with a coverage gap inside the period (ACC) holds it back. A history that starts mid-period is not a gap.

  Open items do not block it (below).
- While Provisional, the recap says what it is waiting for, each with who can fix it (INS-01):
  - "Settling until <date>" while the window runs;
  - "Waiting for <account> to sync" for a connected account;
  - "Waiting for <account> data up to <date>" for a CSV-fed or opted-in cash account;
  - "Waiting for a decision on <account>" (ACC);
  - "Missing data for <account> <date range>" for a coverage gap (ACC).
- **Open items**: items dated in the period that still need a member are listed, each with a link to resolve it:
  - review inbox items (CAT), including possible duplicates and bank balance gaps (ACC-12);
  - uncertain items (INS-02, TXN), such as suggested transfers not yet confirmed;
  - pending transactions still unbooked ("Still pending after N days");
  - recurring items, including recurring income, not seen yet in the period (REC). If the period settles first, the payment counts in the period it is paid when it arrives (REC).

  A period settled while any remain reads "**Settled with N open items**". The items stay listed until resolved.
- **Settle now**: any member can settle a Provisional period at any time, e.g. when a connection nobody will re-consent holds it back.
  - Before confirming, it states what is still missing: each account holding the period back with its data up to date or missing date range, the open items, and that later changes will show as "Changed since settled".
  - The recap then records who settled it, when, and what was missing at that moment, e.g. "Settled by Anna on 12 Oct · mBank Joint had data up to 3 Oct · 4 open items". An automatic settle reads "Settled automatically on <date>".
- Settling cannot be undone. Corrections after settling go through "Changed since settled" and BUD's late adjustment.
- **Settle is the budget's period close**: settling runs BUD's period close (see BUD — period close: what is snapshotted and what carries over). It is one action, not two. The recap's Budget result section shows BUD's close as BUD defines it.
- **Changed since settled**: after settling, when transactions dated in the period are added, edited or removed, or category changes affect the period, the recap shows "Changed since settled: N changes" with a link listing them (what, who, when). Changes caused by erasing a member's data (HH-08) read "Changed since settled — member data erased".
  - For each figure BUD snapshotted at settle that now differs, both values are shown (e.g. "At settle: €1,840 · Now: €1,910").
  - Where BUD made a late adjustment in a later period, the recap links to it.
- **Contents in M2**, each with drill-down (INS-04) and INS-01 markers, in this order:
  1. **Open items** (above);
  2. **Budget result** (BUD's period close);
  3. **Headline** (live): income, spending, net saved, savings rate and moved to savings (INS-13), each vs the previous qualifying period and the 3-period average (INS-03);
  4. **Spending by flex type** (INS-10), with the INS-02 "Not counted" lines.

  INS-26 adds more sections in M3.
- Wording is factual: no praise, blame or exclamation wording.
**Depends on:** SPIKE-01 — pending→booked lag per bank; BUD — period close, snapshot, late adjustment; CAT — review inbox, category change history; TXN — uncertain states, pending, edit history; REC — occurrences seen / not seen yet; BANK — successful sync, data gaps; ACC — data up to, end date, coverage gaps, accounts awaiting a decision; SET — cash staleness opt-in
**Notes:**
- "Settled" means the data had stopped arriving, or a member chose to settle. It does not promise that the numbers never change. Later changes are shown, not hidden.
- Open review items don't block settling because every synced transaction enters the inbox as "New" (CAT). Blocking on them would keep most periods Provisional until someone clears the inbox. "Settled with N open items" is expected to be common.
- Data must reach the end of the window, not only the period end. A transaction dated in the period can first appear days later, so a connection that broke just after the period end would otherwise let the period settle without it.
- The 95% rule stops one slow hotel hold from setting the window. 30 transactions is roughly a month of card use for one bank.
- This replaces Monarch's weekly recap, which appears on the dashboard and is also emailed ([Monarch release notes](https://releasebot.io/updates/monarch)). Here, the dashboard's Last period widget (INS-06) is how members find it.

#### INS-24 Weekly review: period-to-date view · Must · M2
As a member doing the weekly review, I want one "so far this period" screen after the review inbox, so that a weekly check is the inbox plus one screen.
**Acceptance criteria**
- Opening the current period's recap shows a period-to-date view labelled "In progress, day N of M".
- Entry points: the review inbox links to it as its next step once the inbox is empty (CAT), and so do the dashboard's "All reviewed" and "Weekly review due" (INS-06).
- **Review day**: SET holds a household review day (default Sunday). From that day, "Weekly review due" shows on the dashboard until a member taps "Mark week reviewed" on this screen.
- Marking the week reviewed shows a short closing summary: inbox items open when the cue appeared and now, left to spend, and anything Provisional or Stale. It says what was checked, not that the data is complete, e.g. "Reviewed with data synced 08:10 today. Card payments from the last few days may still appear."
- The household sees "Week reviewed on <date>". Only that date and the two inbox counts are stored. Who reviewed, time spent and gaps between visits are not stored.
- It shows:
  - left to spend, pace and the over-pace flag, as on the budget screen (BUD), including BUD's "Provisional — from <period>" note on carried amounts while the previous period is Provisional;
  - spending so far by flex type (INS-10), with the INS-02 "Not counted" lines;
  - **Last 7 days**: flexible spent in the last 7 days vs a usual week, which is the average daily flexible spent over the previous 3 qualifying periods × 7 (INS-03: "based on N periods", not shown with 0), and the top 3 flexible categories in those 7 days;
  - **Open items** for the current period, each linking to fix: review inbox count, uncertain items (INS-02), and uncategorised count and amount;
  - if the previous period is still Provisional, one line with its state, linking to its recap (INS-23).
- Every amount drills down (INS-04) and shows INS-01 markers.
**Depends on:** CAT — review inbox and its next step; BUD — left to spend, pace, carried amounts while the previous period is Provisional; SET — review day; INS-23
**Notes:** The weekly review (metric: under 10 minutes) is the inbox (CAT) plus this screen. Its duration is not measured in the app; the 10-minute target is checked by hand. INS-26 adds, in M3, the member's Since your last visit section and, where INS-15 is built, a link to the like-for-like comparison.

#### INS-26 Fuller recap and weekly review · Must · M3
As a household, I want the recap and weekly review to also show categories, large transactions, recurring changes, net worth and insights, so that looking back needs no other screen.
**Acceptance criteria**
- The recap (INS-23) adds these sections after its M2 sections, each with drill-down (INS-04) and INS-01 markers:
  - **Categories**: top 5 by spending, and the 3 largest increases and 3 largest decreases vs the 3-period average (INS-03);
  - **Largest 5 transactions** that count as spending (INS-02);
  - **Recurring** (REC): new subscriptions, price changes, total spent on subscriptions;
  - **Net worth** (NW): change between NW's values nearest the period's start and end, labelled with the dates used, e.g. "Net worth 31 Aug → 30 Sep: +€1,200". With payday-anchored periods these dates differ from the period dates;
  - **Insights** raised in the period, including dismissed and withdrawn ones, marked with who dismissed them or why they were withdrawn (INS-18).
- The weekly review (INS-24) adds, at the top, the member's Since your last visit section (INS-18). Where INS-15 is built, it also links to INS-15's like-for-like comparison with the previous qualifying period.
**Depends on:** REC — subscriptions, price changes; NW — values and their dates; INS-18

---

### 4.12 Settings & data (SET)
One place for household-level settings, and for getting data out, deleting it or getting it back. SET owns:
- the base currency and the currency conversion rule;
- the household time zone;
- the settings behind the budget period (period type, payday anchor, holiday calendar);
- the staleness thresholds;
- full export;
- Recently deleted;
- household deletion.
For budget periods, categories, members and connections it provides the entry point only. Their behaviour lives in BUD, CAT, HH and BANK.

#### SET-01 Settings structure · Must · M1
As a member, I want settings grouped in one place, so that I can find household and personal options.
**Acceptance criteria**
- Settings has these sections:
  - **Household:** name, base currency, time zone, budget period and payday anchor, holiday calendar, review day, staleness thresholds, FX rate source;
  - **Members** (HH);
  - **Connections:** "My Enable Banking setup" (add or replace your own registration, BANK — own Enable Banking setup), then every connection with its connection holder, status, consent expiry and last sync; actions as defined in BANK;
  - **Categories & rules:** opens CAT's management screens;
  - **My account & security** (AUTH-05, AUTH-08, AUTH-13, AUTH-15);
  - **Data:** export, Recently deleted, last successful backup (NFR-12), delete household, audit log, retention.
- Members see the Household section read-only. Every editable control respects the matrix in HH-02.
- Every household-setting change is recorded in the audit log with old and new value.
- All sections work at 360 px width.

#### SET-02 Base currency · Must · M1
As an Owner, I want one base currency for the household, chosen with care, so that totals across accounts in different currencies add up.
**Acceptance criteria**
- The base currency is chosen at household creation (AUTH-01) from a list of ISO currencies. Nothing is pre-selected.
- A confirmation step shows an example ("Left to spend: 1 234,56 zł") and says: "All household totals will be in this currency. Usually it's the currency your salaries are paid in."
- All household-level figures (left to spend, budgets, forecasts, net worth, reports) are shown in the base currency. Account-level views show the account's own currency.
- Until the first account (bank or manual) is added, an Owner can change the base currency freely in Settings → Household. After that, changing it follows SET-10. Before SET-10 exists (M3), the setting shows "Locked while accounts exist — available in a later version. No history is lost by waiting."
**Notes:** An "export and create a new household" fallback would lose history for good: there is no re-import in v1, and reconnecting may not return extended history (BANK — first import). SET-10 is used instead.

#### SET-03 Currency conversion rule · Must · M1
As a member, I want a predictable rule for foreign-currency amounts, so that totals match what my bank actually charged and past figures don't drift.
**Acceptance criteria**
- **The bank's converted amount wins.** When a transaction's original currency differs from its account's currency (e.g. EUR card purchase on a PLN account), the amount the bank booked in the account currency is used. The original amount and currency are shown as secondary info when the bank provides them.
- **Base-currency amount: the first rule that applies wins.**
  1. A manual base-currency amount (SET-04, M3).
  2. The account is in the base currency: the amount as booked. No conversion.
  3. A linked internal transfer leg whose other leg is on a base-currency account: the other leg's amount, so the transfer creates no income or spending (TXN — internal transfers, M2).
  4. A refund linked to its purchase (TXN — refunds, M2): the purchase's rate, so a full refund nets to zero in base currency.
  5. Otherwise: the reference rate for its rate date.
  In M1 only rules 2 and 5 exist.
- **Consequences of that order:**
  - A refund to a base-currency account of a purchase made on a foreign-currency account is booked in the base currency (rule 2). Any difference from the purchase's base amount is real money and stays in the purchase's category.
  - A transfer between two non-base-currency accounts uses rule 5 on both legs. Any difference between the legs is money gained or lost in the conversion. It is never income or spending in a category; in net worth it is part of the receiving account's real change (NW-10's currency effect covers only rate moves on balances already held).
  - A refund's rate difference on a non-base account is treated the same way.
- **Rate source:** one published daily reference-rate source for the whole household (choice in Open questions), named in Settings → Household.
- **Rate date:** the transaction date if the bank provides it, otherwise the booking date (the same date TXN uses for the budget period).
- **No rate published that day** (weekend, holiday): the latest earlier rate is used, and it is final.
- **Rate not published yet** (e.g. a purchase this morning, before today's rates appear): the latest earlier rate is used and the amount is labelled "Estimated rate". When the rate for that date is published, it replaces the estimate and the label disappears. ("Provisional" is reserved for unsettled periods.)
- **When a base amount may change.** Once a transaction is booked and its rate is final, its base amount changes only when:
  - a member links or unlinks it (rules 3–4);
  - a member sets or clears an override (rule 1);
  - the base currency changes (SET-10).
  Rate movements never change it. If such a change falls in a Settled period, that period shows "Changed since settled", and rollover already carried forward is not rewritten (late adjustment).
- **Pending:** a pending foreign-currency transaction without a bank-booked account-currency amount uses the latest rate and is labelled "Estimated rate" until it is booked.
- **Currency the source doesn't publish:** an Owner enters a rate for that currency with its date. It is used until updated and every figure that uses it is marked "manual rate from <date>".
- **Balances** of foreign-currency accounts are converted at the rate of the balance date (today: the latest available rate). Revaluation effects are shown separately (NW — FX revaluation).
- **Visibility:** every converted figure is marked (e.g. "≈"). Tapping it shows original amount, rate, rate date, source and which rule above applied.
- **Multi-currency accounts:** if a bank account holds several currencies, each currency is a separate account converted on its own (ACC).
- If the rate source is unavailable, the last known rate is used and affected figures show "Estimated rate — from <date>".
- **Real changes vs rate effects:** each amount uses the rate of its own date, so past figures don't move with today's rate. Net worth shows FX revaluation separately (NW). A report filtered to one foreign-currency account can be shown in that account's own currency (INS).
**Depends on:** SPIKE-01 (FX fields banks populate; how multi-currency accounts appear), TXN (date rule, refund links, transfer pairs), ACC, NW, INS
**Notes:** The rules apply in one order, and the section lists when an amount may change. Rate sources: [ECB euro reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html) are "usually updated at around 16:00 CET every working day, except on TARGET closing days" and are "for information purposes only". [NBP](https://nbp.pl/statystyka-i-sprawozdawczosc/kursy/informacja-o-terminach-publikacji-kursow-walut/) publishes Table A every working day between 11:45 and 12:15, and Table B (less common currencies) weekly on Wednesdays. Either is fine for budgeting display, which is why the bank's booked amount always wins over a reference rate.

#### SET-04 Override a converted amount · Could · M3
As a member, I want to enter what I actually paid in base currency, so that cash exchanged at a kiosk or a manual foreign transaction is accurate.
**Acceptance criteria**
- On a manual transaction, or a bank transaction in a non-base-currency account, a member can enter the base-currency amount. It replaces the reference-rate conversion and is marked "set manually".
- A manual value is never overwritten by sync or rate updates.

#### SET-05 Budget period, holiday calendar and review day settings · Must · M2
As an Owner, I want the calendar settings that shape our budget periods and our weekly review in one place, so that "left to spend" matches our real month and the review comes on our day.
**Acceptance criteria**
- **Household review day:** one weekday, default Sunday. From that day a "Weekly review due" cue shows on the dashboard until a member marks the week reviewed (INS — weekly review). Changing it applies from the next week.
- Settings → Household also hosts these one-per-household settings. Their behaviour is defined in BUD:
  - budget period: calendar month or payday-anchored, with the anchor day (BUD — budget period);
  - direction when a period start falls on a non-working day: previous working day (default) or next working day (BUD — payday on non-working days);
  - **public-holiday calendar:** one country. Default: the country of the household time zone (SET-12). Its public holidays count as non-working days for payday shifts (BUD), and are available to REC for due dates.
- Only Owners change them (HH-02). The period type and anchor can be changed freely only until the first period is settled. After that the setting shows "Locked after the first settled period — available in a later version", until BUD — changing the period setting (Should, M3) exists. The screen shows the next three period start dates before saving.
- One holiday calendar serves the whole household. If partners are paid in different countries, an early salary in the other country is handled by BUD's "Count this in the next period?" prompt (BUD — early salary).
- If the app has no holiday list for the chosen country, only Saturdays and Sundays count as non-working days, and the setting says so.
**Depends on:** BUD (period rules), REC (due dates), INS (weekly review), SET-12
**Notes:** The time zone is in SET-12 because M1 already needs it. The review day lives here because the weekly review first exists in M2. Any member's settle locks the period setting until BUD-12 exists (Open questions).

#### SET-06 Staleness thresholds · Must · M1
As an Owner, I want to set how old bank and imported data may be before it's flagged stale, so that warnings match how often we really sync and import.
**Acceptance criteria**
- **Connections:** "Flag bank data as out of date after: N hours", default 24, allowed 6–168. A connection whose last successful sync is older than this is "out of date".
- **Manual accounts with an outside source:** "Flag imported data as out of date after: N days", default 7, allowed 1–62. A CSV-fed account whose "Data up to" date (ACC — coverage) is older than this is "out of date". Every member then sees an "Import due for <account>" cue on that account (ACC), with "Import CSV". The same threshold applies to a cash account only if a member has turned on "Track freshness for this account" for it (ACC). Cash accounts are never stale otherwise. Value-type accounts (property, investments and similar) are never stale. They show "Value as of <date>" (ACC).
- **CSV fallback.** A member without an Enable Banking setup runs their accounts on CSV import. This is a stated degraded mode. A period auto-settles only once each such account's "data up to" date reaches the end of that period's settling window (BUD) **and** the account has no coverage gap inside the period. So the member imports once after the settling window ends, with files that together cover the whole period up to the window's last day. An earlier import leaves the period Provisional, with "Waiting for <account> data up to <date>" (INS-23). A stretch of the period with no data blocks auto-settle with "Missing data for <account> <date range>" (ACC — coverage). History that starts mid-period is not a gap: it shows "History starts <date>". An account with an end date never blocks past its end date (INS-23). "Settle now" stays available (BUD). This threshold and its "Import due" cue are the only reminders. The settings screen says so next to the setting.
- Every figure that depends on an out-of-date connection or account shows the stale-data warning (NFR-06).
- Changing a threshold updates warnings on the next page view.
- Broken, revoked or expired connections make their figures stale regardless of these settings (BANK — connection health).
- A consent that is only **expiring** (≤ 14 days left) does not make anything stale. It gets its own low-key note (BANK — expiry countdown).
**Notes:** The 7-day default matches the household's weekly review (SET-05 review day): a partner who imports CSV files at the review keeps their accounts fresh, and "left to spend" is never silently missing more than a week of their spending. A household that imports only once per period can set 35 days. Then the in-period figures lack that member's spending without a warning, and the screen says so. The settle condition is the same as for connected accounts: data must reach the end of the settling window. Remaining risk: a cash account nobody opted in may silently lag.

#### SET-07 Members, connections and categories entry points · Must · M1
As a member, I want to reach member, connection and category management from Settings, so that I don't hunt for them.
**Acceptance criteria**
- Settings → Members shows members (name, role, join date; for Owners also 2FA and recovery-code status) and pending invites, with actions per HH-02 to HH-08.
- Settings → Connections first shows "My Enable Banking setup": whether the signed-in member's own registration has been added, with "Add" or "Replace" (re-authentication required, AUTH-10). It also shows, for each member, whether their setup has been added (BANK — own Enable Banking setup). Below that, it lists every connection: bank, connection holder, accounts, status, consent expiry date, last successful sync. Renew, sync and disconnect actions follow BANK and AUTH-10/11.
- Settings → Categories & rules opens CAT's screens (M2). Before M2 the entry is hidden.

#### SET-08 Full data export · Must · M1
As a member, I want to download all household data in an open format, so that we're never locked in and can keep our own archive.
**Acceptance criteria**
- "Export all data" (Owner or Member, after re-authentication) produces one download: an archive of CSV files, one per data type, plus a README explaining every file and column.
- It contains every data type that exists at that milestone, including at least:
  - accounts (bank and manual) with account holder, connection holder, balance history, history coverage and data gaps (ACC — coverage);
  - all transactions with original bank fields and all user edits (category, splits, tags, notes, excluded flag, internal-transfer and refund links), plus each transaction's first category source and its category change history (CAT);
  - duplicate decisions: date, decision, whether the app had flagged the pair first, and both transactions' sources (TXN-10);
  - categories with flex types; rules;
  - budgets per period (planned, actual, rollover, sinking-fund balances), the plan history with times (BUD), and each settle record: when the period settled, automatically or by "Settle now" and by whom, what was missing, and the settle snapshot (BUD, INS);
  - weekly review records (INS — weekly review);
  - recurring items; manual asset values with history; net-worth snapshots;
  - members (name, role, joined and left dates); connections (bank, connection holder, consent dates, status);
  - FX rates used, including manual rates; household settings;
  - audit-log events visible to the exporting member.
- Items in Recently deleted (SET-11) are not included.
- It never contains sign-in links or codes, 2FA secrets, recovery codes or anything that allows fetching bank data.
- Format: UTF-8, header row, dates as YYYY-MM-DD, amounts with a "." decimal separator and a separate currency column. Each file opens correctly in common spreadsheet apps. Commas, quotes and line breaks inside text don't break columns.
- **Text can't run as a formula.** Text from banks, CSV files or members can start with "=", "+", "-", "@", a tab or a null character. Such text is written so spreadsheet apps show it as plain text. Amount and date columns stay numbers. Developer check: when the export is opened in a spreadsheet app, transactions described "=1+1" and "@SUM(A1)" are shown as text, not calculated.
- For a household with 5 years of history (the NFR-07 dataset), the export is ready within 5 minutes. A progress indicator is shown. If the member leaves the page, the finished export waits in Settings → Data.
- The file can be downloaded only by the member who requested it, while signed in, for 24 hours. Then it is deleted.
- Each export is in the audit log, visible to all Owners.
**Notes:** Covers access and portability as product behaviour ([GDPR Art. 20](https://gdpr-info.eu/art-20-gdpr/): "structured, commonly used and machine-readable format"). Re-importing an export into a new household is not in v1. Formula protection follows [ASVS 1.2.10](https://github.com/OWASP/ASVS/blob/master/5.0/en/0x10-V1-Encoding-and-Sanitization.md), a Level 3 item adopted here. Anyone who can send a bank transfer to a member controls a description that ends up in this file. The export also carries the records the metrics (section 6) are read from (MET-01, MET-05, MET-06, MET-08, MET-10): first category source, duplicate decisions, settle records, plan history and coverage. These are small tables next to the transactions.

#### SET-09 Delete all household data · Must · M1
As an Owner, I want to delete everything, so that we can stop using the app without leaving our financial history behind.
**Acceptance criteria**
- Available to Owners only, after re-authentication. The screen lists what will be deleted (counts of accounts, transactions, connections, members), offers "Export first" (SET-08), and requires typing the household name to confirm.
- Deletion is scheduled for 7 days later. During those days every member sees a banner with the date and who scheduled it, with an "Export all data" link that works for Members too. Any Owner can cancel (re-authentication required). The household stays usable.
- When it runs, the deletion cannot be undone: all household data, all member logins, Recently deleted and all pending exports are deleted, and members cannot sign in.
- All connections are ended at the bank-data provider when deletion runs. During the 7 days the banner tells members to also withdraw consent in their bank apps, because ending it on our side may not remove it at the bank (SPIKE-01). No consent is ever used again.
- Deleted data is gone from backups within 30 days (NFR-11). A restore never brings back a deleted household (NFR-12).
- Afterwards the app is in the first-run state (AUTH-01).
**Depends on:** BANK — ending a connection; SPIKE-01
**Notes:** The 7-day schedule is the household-level form of Recently deleted (SET-11). A deleted household has nowhere to be restored from, so it stays in use until the date instead. The claim that "destroying the data takes at least 7 days" holds for every deletion except erasure (HH-08).

#### SET-10 Change the base currency after accounts exist · Should · M3
As an Owner whose household moved country or picked the wrong currency, I want to change the base currency without losing history, so that we don't have to start over.
**Acceptance criteria**
- An Owner chooses a new base currency. Before saving, the screen shows the rate source that will be used (if the current source doesn't publish the new currency, the Owner picks one that does, SET-03), the number of periods affected, and an example of a past total before and after.
- No account-currency amount ever changes. Every base-currency figure is recomputed by SET-03's rules with the new base currency, at the reference rate for each item's original rate date.
- Plans for past periods are converted at the rate of each period's start date and labelled "converted from <old currency>". Plans for the current and future periods are converted at the change-day rate, and members are asked to review them on the budget screen.
- Settled periods keep their settle snapshot in the old currency and show "Changed since settled: base currency changed from <old> to <new>".
- Manual base-currency amounts (SET-04) are converted at the rate of their date and marked "converted from manual <old currency> value".
- Net-worth history is recomputed at each snapshot date's rate (NW).
- The change is audited. Changing back to the old currency recomputes again and gives the same figures as before, apart from the "Changed since settled" markers.
**Depends on:** BUD (plans), NW (snapshots), INS (settled snapshot display), SET-03
**Notes:** Possible because SET-03 keeps the account-currency amount as the source of truth and reference rates are published historically. A Should in M3 because it is rare and needs every money area to exist. Until then SET-02 locks the currency, and its setup confirmation guards the original choice.

#### SET-11 Recently deleted · Must · M1
As the household, we want anything deleted to be recoverable for a week, so that a mistake or a misused phone never costs us history the bank can't return.
**Acceptance criteria**
- These go to Settings → Data → Recently deleted instead of disappearing:
  - a connection's data deleted with "delete data" (BANK — disconnect);
  - a deleted account (ACC — delete);
  - transactions deleted permanently (TXN — permanent delete);
  - transactions removed by undoing a CSV import (TXN — CSV import);
  - a deleted value of a value-type account (ACC — value-type accounts);
  - a removed member (HH-07).
- Each entry shows what it is (with counts of accounts and transactions), who deleted it, when, and the date it will be purged. Every member sees the list. Only Owners can restore.
- Deleted items leave every list, search, figure and report at once. Restoring brings them back in full, with their edits, categories, links and attribution. Settled periods affected either way show "Changed since settled". Rollover already carried forward is not rewritten (late adjustment).
- Restoring a connection's deleted data brings its accounts back as disconnected accounts kept as with "keep data" (BANK — disconnect). Connecting the same bank login again re-attaches them (BANK — re-consent). Restoring follows TXN-10: restored transactions are checked against what is already there like any import, and an uncertain match is shown as a possible duplicate, never silently dropped. Restored accounts follow BANK's joint-account rules (HH-06).
- Restoring data needs no re-authentication, because it can be deleted again. Restoring a member needs fresh re-authentication (AUTH-10) and brings back their login and role only. Their connections stay paused until they resume them (HH-07).
- Deleting and restoring are audited (NFR-04) and are household events (AUTH-13).
- 7 days after deletion the entry is purged: gone from the live app at once and from backups within 30 days (NFR-11).
- Erasure (HH-08) never goes to Recently deleted, and when it runs it also purges the items already there that fall within its scope (HH-08). Household deletion uses its own 7-day schedule (SET-09).
- **Not deletions:** archiving an account (ACC — archive), and hiding or excluding a transaction. Those stay reversible in the app at any time and never enter Recently deleted.
**Depends on:** BANK — disconnect; ACC — delete; TXN — permanent delete; HH-07; NFR-12 (a restore from backup re-applies purges)
**Notes:** It replaces holds as the protection for one-shot data, such as the full history a bank releases only at first consent. Remaining risk: a deletion nobody notices for 7 days is gone for good. Every deletion is a household event, and the household reviews weekly. Restoring a member doesn't restart their connections, restores follow TXN-10 instead of promising no duplicates, erasure purges matching entries, and hiding or excluding is not deletion.

#### SET-12 Household time zone · Must · M1
As the household, we want one time zone that defines our days, so that "today", sync times, budget periods and audit times agree for every member.
**Acceptance criteria**
- The household time zone is set at creation (AUTH-01, pre-filled from the browser) and shown in Settings → Household. Only Owners change it (HH-02).
- It defines when a day starts and ends for: "today", scheduled sync times (BANK — scheduled sync), period boundaries, due dates, month-end snapshots and the times shown in the audit log.
- **A change applies from that moment.** No existing transaction changes its date, and periods that have already started keep their dates. Only "today", future period boundaries, upcoming due dates, sync times and future month-end snapshots use the new zone. The confirmation says so.
**Depends on:** BANK (sync schedule), BUD (period boundaries), REC (due dates), NW (month-end snapshots), TXN (date rule)
**Notes:** This is separate from SET-05 (M2) because M1 already uses it. It is not locked like the base currency: a later change only affects dates from then on, so transactions already imported near midnight never move between periods.

---

## 5. Non-functional requirements (NFR)
Quality bars that apply to every area:
- **Security** follows [OWASP ASVS 5.0](https://github.com/OWASP/ASVS/tree/master/5.0/en): Level 2 where account takeover, data leaks and hostile text are likely (authentication, sessions, encoding, data protection, logging), Level 1 elsewhere.
- **Privacy** means GDPR-style rights as product behaviour.
- **Integrity** means never silently losing an edit or a real transaction.
- **Freshness** is reported, not promised.
- **Performance, accessibility and browser support** have measurable targets.

Each criterion is one of two kinds:
- **Member check:** anyone can verify it by using the app.
- **Developer check:** the developer verifies it and records the result in the milestone notes, and the operator signs it off at each milestone. Criteria that need access to stored data, logs, network traffic or timing are developer checks and are labelled so.

### NFR-01 Security baseline · Must · M1
As the household, we want the app checked against a recognised standard, so that "secure" is verifiable rather than claimed.
**Acceptance criteria**
- Developer check before M1 sign-off: every ASVS 5.0 Level 2 item in Encoding and Sanitization (V1), Authentication (V6) and Session Management (V7) is marked pass, fail or not applicable in the milestone notes, with a one-line reason for each "not applicable".
- Developer check before v1 (M3) sign-off: the same for Data Protection (V14) and Security Logging (V16) at Level 2, and for all other chapters at Level 1.
- No item is marked fail at sign-off unless it is listed as an accepted deviation with its reason in the PRD appendix (e.g. the 30-day remembered session, AUTH-07, and email sign-in without 2FA, AUTH-16).
- **Outside text is only ever text.** Some text comes from outside the household: transaction descriptions and counterparty names (anyone who sends a member a transfer chooses them), CSV file contents, and members' notes, tags, rule and category names. It is shown as plain text everywhere: lists, search, rules, review inbox, reports and charts. It is never run, never turned into links or formatting, and never changes the page.
  - Developer check before each milestone sign-off: import a CSV file whose descriptions include `<b>x</b>`, `<script>alert(1)</script>`, `"><img src=x onerror=alert(1)>` and `=1+1`. Every screen shows them exactly as written, nothing runs, and the export protects them too (SET-08).
- Every page except sign-in, invite acceptance and first-run requires a signed-in member. There are no default or shared admin logins.
- Error messages shown to users never reveal internal details or other members' data. A sign-in request for an unknown email gets the same response as one for a member's email (AUTH-16).
**Notes:** Level 2 applies to the chapters that guard sign-in and stored data, not to the whole app. Encoding and Sanitization (V1) is at Level 2 from M1, because "no uploads besides CSV, no public API" does not remove attacker-controlled bank text. AUTH-10 never lets a recent sign-in replace re-authentication for changes to sign-in details or access, so ASVS 7.5.1 (Level 2) can pass at M1 and is not a deviation. Remaining risk: other chapters are checked only at Level 1.

### NFR-02 Protection of bank data · Must · M1
As the household, we want our bank data protected in transit and at rest, so that a stolen disk, backup or log doesn't expose our finances.
**Acceptance criteria**
- Member check: opening the app's plain "http://" address redirects to the encrypted "https://" one, and the browser shows the connection as secure.
- Developer check: all traffic between the app and the bank-data provider, and between the app and the email service, is encrypted.
- Developer check: a copy of the stored household data, and of a backup, opened without the app shows no readable transaction descriptions, amounts, counterparty names or account numbers.
- Bank-access secrets, meaning whatever the app uses to fetch bank data, including each member's Enable Banking registration details, never appear in the UI, exports or logs. Member check for the UI and exports; developer check for logs.
- Developer check: a full export, and a backup restored on a fresh installation, cannot be used to fetch bank data without the separately held bank-access secrets.
- Developer check: after running the main journeys with known test values, searching the diagnostic logs, and the data held by the diagnostics service (NFR-03), for those descriptions, amounts, counterparty names, account numbers, sign-in links and codes finds nothing.
- Everything the app held to fetch a member's bank data is deleted when they leave, or 7 days after they are removed unless an Owner restores them (HH-07).

### NFR-03 Privacy: household-only visibility and data rights · Must · M1
As a member, I want our data seen only by our household and to control it, so that our finances stay private.
**Acceptance criteria**
- Member check: only signed-in members of the household can see household data. There are no public or share-by-link views.
- Household data reaches no one outside the household except:
  - Enable Banking, as needed to fetch bank data;
  - the email service, which receives only an email address and an invite or sign-in link;
  - a cloud hosting provider (§10 question 6). It holds the data only in encrypted form (NFR-02). The provider is chosen in technical design.
- One more outside party receives **no household data**: a diagnostics service, which gets only scrubbed technical data (errors, traces, performance metrics and page-load timings). It never receives transaction or account data, member names or emails, sign-in links or codes, request contents, or record IDs in page addresses. It never identifies a member, records sessions or follows activity across pages or visits.
- Developer check: while the main journeys run, the app contacts no other outside party. In particular there is no third-party analytics, advertising, tracking, fonts or scripts loaded from elsewhere; the diagnostics service's browser script is bundled with the app. Product metrics (section 6) are computed in-app.
- Rights map to features:

| Right | Where |
|---|---|
| Access & portability | Full export (SET-08) |
| Rectification | Editing transactions, accounts and display name (TXN, ACC, HH-04); email (AUTH-15) |
| Erasure of a departing member | HH-08 |
| Erasure of everything | SET-09 |

- Requests made inside the app complete within the timings in HH-08 and SET-09. Both are well within the one-month limit in [GDPR Art. 12(3)](https://gdpr-info.eu/art-12-gdpr/).
**Notes:** [GDPR Recital 18](https://gdpr-info.eu/recitals/no-18/): the Regulation doesn't apply to "a purely personal or household activity" but "applies to controllers or processors which provide the means" for it. So a hosting provider stays bound by GDPR in its own role whatever the household's status. Not legal advice. The diagnostics service is chosen in technical design. If it can't be kept from tracking sessions, it gets errors only.

### NFR-04 Audit trail · Must · M1
As an Owner, I want a record of security and admin events that no member can change, so that we can see who did what if something goes wrong.
**Acceptance criteria**
- Recorded events:
  - **Own security:** successful sign-ins, sign-in emails sent, device remembered, 2FA turned on or off, own authenticator replaced, recovery code used, recovery codes regenerated, own email changed, own sessions ended.
  - **Failed access:** failed sign-ins, throttling triggered.
  - **Household events** (the AUTH-13 list):
    - invites: sent, resent, revoked, accepted or expired;
    - roles: Owner granted or removed;
    - membership: member joined, left, removed or restored;
    - Owner actions on another member: 2FA reset, email changed, sessions ended, a connection they hold disconnected;
    - deletion: data deleted, restored from or purged from Recently deleted (SET-11);
    - erasure: requested, cancelled or executed;
    - household deletion: scheduled, cancelled or executed.
  - **Household admin and data:**
    - household settings changed;
    - export created and downloaded;
    - Enable Banking registration added or replaced;
    - connection added, renewed, paused by a member's removal, resumed, disconnected (keep or delete data), expired or revoked detected;
    - accounts merged or unmerged;
    - restore from backup.
- Each entry shows when (household time zone, SET-12), who (member, or "system") and what. Own-security and failed-access entries also show the browser/device type. Entries contain no amounts, descriptions or account numbers.
- **Who sees what:**

| Events | Visible to |
|---|---|
| Own security | That member only |
| Failed access | That member and Owners |
| Household events; household admin and data | Every member |

- The log can be filtered by event type, and by member for household events.
- **Not a usage tracker.** The audit log is a security record. It shows no counts, frequencies, charts, last-active times or "time in app" for any member. No member, including an Owner, can see when another member signed in successfully. Owners see failed attempts on others' accounts because those may be an outsider's.
- No member can edit or delete entries. The only changes are pseudonymisation on erasure (HH-08) and removal on household deletion (SET-09).
- Entries are kept for 2 years, then deleted (NFR-11).
**Notes:** Matches ASVS 16.3.1 (all authentication operations logged) and 16.4.2 (logs protected from modification). Visibility matches AUTH-13 exactly. Successful sign-ins were made private because, shown to Owners per member, they would amount to the per-member usage tracking the product avoids. Ordinary transaction edits are not audit events. Edit attribution belongs to TXN. Data edits are recorded where they happen, with member and time: transaction edits, rule applies and duplicate decisions (including undone merges) in TXN (TXN-03, TXN-10), and plan edits, fund changes, category merges and settles in BUD's plan history (BUD-16, BUD-19). Undoing a CSV import is recorded here as a deletion to Recently deleted.

### NFR-05 Data integrity · Must · M1
As a member, I want every edit kept and every real transaction present, so that I can trust the numbers.
**Acceptance criteria**
- **No silent overwrite between members:** if two members edit the same item, the second to save is told it changed since they opened it, sees the other change, and chooses which to keep. Developer check: tested with two browsers signed in as two members.
- **Save feedback:** every edit shows when it is saved. A failed save shows an error with "Retry" and keeps the input on screen. Leaving a page with unsaved changes asks for confirmation.
- **Sync never discards user work:** sync, re-sync and re-consent never overwrite a user-edited field (see TXN — pending→booked, CAT — precedence).
- **Never silently drop a transaction:** an imported transaction is never removed without a visible trace. If the bank stops reporting it (e.g. a pending one that vanishes), it gets a visible state (see TXN). When the app is unsure whether two transactions are the same, it shows "possible duplicate" instead of dropping one.
- **Repeat-safe imports:** running the same sync or CSV import twice creates no duplicate transactions.
- **Totals add up:** amounts are exact to the currency's smallest unit. Any total equals the sum of its exported rows (SET-08). Developer check on the NFR-07 dataset.
- **Restore honesty:** after a restore (NFR-12), all members sign in again and see "Data restored to <date time>; changes after that time may need to be redone" until dismissed.

### NFR-06 Freshness is reported, not promised · Must · M1
As a member, I want to know how current every number is, so that I never act on stale data without realising it.
**Acceptance criteria**
- Every derived figure (in M1 the Connections page and account balances; from M2 also left to spend, budget actuals, forecast, net worth, report totals and dashboard tiles) shows its freshness ("as of <time>", or the oldest "data up to" date among its accounts) on the same screen.
- **Stale:** a figure carries a stale-data warning, naming the account(s) and the fix, if any account behind it is:
  - **connected** and its connection is broken, revoked or expired, or its last successful sync is older than the connection threshold (SET-06). Example fix: "Renew Piotr's mBank connection". For joint accounts, see HH-06.
  - **manual with an outside source** (CSV-fed, or cash with "Track freshness for this account" on) and its "data up to" date is older than the manual-account threshold (SET-06, ACC — coverage). Example fix: "Import due for Ania's Santander account".
  - **fed by a removed member's paused connection** (HH-07) and its last successful sync is older than the connection threshold. Fix: "Restore <name>, or connect this account from your own bank login".
- **Expiring is not stale:** a connection whose consent expires within 14 days but synced within the threshold makes no figure stale. The expiry is shown only as its own low-key note (BANK — expiry countdown; shown on every screen).
- **Provisional is a separate label:** a past period is shown as Provisional until it is settled. That covers its settling window and any time after it while a budget-side account's data doesn't yet reach the end of that window (INS, BUD). A period can be Provisional without anything being stale, and the reverse.
- **Freshness is not coverage:** an account can be fresh and still have a gap, a stretch of the period with no data (a CSV range never imported, or a connection that lapsed past what the bank returns). A gap keeps the period from auto-settling. Any figure that covers it carries "Missing data for <account> <range> — may be off". History that starts mid-period is shown as "History starts <date>", not as a gap (ACC — coverage, BUD, INS).
- No screen states or implies a guaranteed sync or import time or frequency. Wording is "last updated" or "data up to", never "updates every X hours".
- A figure with no stale sources shows no stale warning. A figure is never shown as fresh while one of its sources is stale.
**Notes:** Background sync is limited by PSD2 to about 4 unattended fetches per account per day and by bank availability, so freshness cannot be guaranteed. With no notifications, in-app warnings are the only signal. Manual-account staleness and the full Provisional rule are included. A CSV-only member's accounts can now be stale.

### NFR-07 Performance · Must · M2
As a member on my phone, I want the dashboard to appear quickly even with years of history, so that checking "left to spend" takes seconds.
**Acceptance criteria**
- **Reference phone:** a mid-range Android phone that cost about €200–300 new and is at most 3 years old.
- **Reference network:** a mobile connection of about 150 ms round-trip latency, 1.6 Mbit/s down and 0.75 Mbit/s up (a common "slow 4G" profile), real or simulated.
- **Reference dataset ("5 years of history"):** 60 months, 3 members, 15 accounts, 25,000 transactions, 150 categories, 200 rules, 60 recurring items, 60 net-worth snapshots.
- **Dashboard:** signed in, app visited before on that phone. Left to spend with its freshness marker, and any connection attention rows, show real values within **2.0 s**, as the median of 5 loads (INS-06). Other widgets may still show a loading placeholder, never a zero. First-ever visit on that phone: within 4.0 s.
- **Other screens** (same phone, network and measure):
  - transaction list first screen: ≤ 2.0 s;
  - search or filter results over the full dataset: ≤ 1.0 s;
  - switching budget period: ≤ 1.0 s;
  - a report covering 12 periods: ≤ 3.0 s.
- **Responsiveness:** every tap or keypress shows a visible response (pressed state, spinner or result) within 0.2 s. Anything taking more than 1 s shows progress.
- All of the above are developer checks. The full measurement runs on the reference dataset before v1 (M3) sign-off. Before M2 sign-off, only the dashboard target is measured, on the reference phone with the household's real data. Results are recorded in the milestone notes.
**Notes:** M2 because the dashboard first exists in M2. The device and network are described as classes, without naming a measuring tool. The target is a median of 5 loads with a full run once, at M3, rather than a 75th percentile over 20 loads at both M2 and M3. "At once" means 0.2 s, the usual threshold for a response that feels immediate. Remaining risk: a slow outlier load is not caught. The 12-period report target is for INS.

### NFR-08 Accessibility: WCAG 2.2 AA · Must · M1
As a member with a disability or on a small screen, I want to use every feature, so that the household app works for all of us.
**Acceptance criteria**
- The target is [WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) Level AA on every screen. Developer check: each new or changed screen is reviewed against the 2.2 AA success criteria before its milestone sign-off, and the result is recorded.
- Before each milestone sign-off, these journeys are completed with a keyboard only on a desktop browser, and with the built-in screen reader of one phone (an iPhone and an Android phone at alternate milestones): sign-in by email link and by code, sign-in with 2FA, invite acceptance, re-consent, categorise a transaction, edit the budget, export. Before v1 (M3) they are also completed with one desktop screen reader.
- Specific to this app:
  - Sign-in needs no puzzle or memorisation test, and paste and one-time-code autofill work for every code (SC 3.3.8).
  - Touch targets are at least 24×24 CSS px (SC 2.5.8).
  - Anything done by dragging, such as rebalancing budget amounts, has a non-drag alternative (SC 2.5.7).
  - The focused element is never hidden behind sticky headers or bottom bars (SC 2.4.11).
  - The session-timeout warning allows extending (SC 2.2.1, AUTH-07).
  - Every chart has a text or table equivalent.
  - Stale, expiring, Provisional, over-pace and possible-duplicate states are never shown by colour alone.
**Notes:** We chose 2.2 over 2.1. 2.2 is the current W3C Recommendation (Oct 2023) and keeps all 2.1 criteria except the removed 4.1.1 Parsing, so meeting 2.2 AA also meets 2.1 AA. That is what [EN 301 549](https://www.deque.com/en-301-549-compliance/) references. Its new AA criteria (accessible authentication, target size, dragging, focus not obscured) hit exactly our riskiest areas: email and 2FA sign-in on phones and dense 360 px budget screens. This replaces an earlier "WCAG 2.1 AA" target. An "automated checks report no serious issues" criterion would depend on a tool's severity scale, so a recorded review is used. Screen-reader runs cover 1 phone per milestone plus a desktop run before v1, not 3 platforms every milestone. Remaining risk: a regression on the phone platform that was not tested that milestone is caught one milestone later.

### NFR-09 Responsive from 360 px to desktop · Must · M1
As a member, I want every feature on my phone and on a large screen, so that I'm never told to "use a computer".
**Acceptance criteria**
- Every feature is usable at 360 px width and up to at least 1920 px, in portrait and landscape.
- At 360 px there is no horizontal page scroll. Wide tables either reflow into cards or scroll inside their own container with the first column fixed.
- Content reflows without loss at 320 CSS px equivalent / 400% zoom (WCAG 1.4.10).
- Charts may simplify on phones but their data stays reachable (NFR-08).
- Developer check before each milestone sign-off: every new or changed screen is checked at 360 px and 1920 px and at 400% zoom, and the result is recorded.

### NFR-10 Supported browsers · Must · M1
As a member, I want the app to work in the browser I already use, so that I don't need to install anything.
**Acceptance criteria**
- Supported: the latest 2 major versions of Chrome (desktop and Android), Safari (macOS and iOS), Firefox, Edge and Samsung Internet.
- Developer check before each milestone sign-off: the key journeys (sign-in, invite, connect and re-consent, categorise, budget, export) are tested on Safari on iPhone, Chrome on Android and one desktop browser. The other supported browsers are spot-checked before v1 (M3).
- Member check: in an unsupported browser the app still loads and shows "This browser isn't supported; some features may not work."
**Notes:** Key journeys are tested, not "every requirement on two phone browsers every milestone". Remaining risk: a browser-specific bug outside those journeys surfaces later.

### NFR-11 Data retention · Must · M1
As the household, we want clear rules on how long data is kept, so that nothing lingers after we delete it.
**Acceptance criteria**

| Data | Kept |
|---|---|
| Accounts, transactions, budgets and all user data | Until the household deletes them (no automatic expiry) |
| Data from a disconnected connection, "keep data" chosen | Until deleted by a member |
| Recently deleted (SET-11), including a removed member's login and bank-access data | 7 days, then purged |
| Audit log | 2 years, then deleted |
| Security notices and the household-event list in Settings → Security (AUTH-13); the same events stay in the audit log for 2 years | 90 days |
| Leaver's sessions | Ended when they leave or are removed |
| Voluntary leaver's sign-in data and bank-access data | Deleted when they leave |
| Sign-in links and codes (AUTH-16) | 15 minutes, or until used |
| Erased member data / deleted household / purged Recently deleted | Gone from the live app at execution; from backups within 30 days |
| Exports | 24 hours |
| Expired invites | 30 days |
| Diagnostic logs (no financial content, NFR-02) | 30 days |
| Backups | 30 days rolling (NFR-12) |
| Raw bank history kept from SPIKE-01 | Encrypted, outside the app, until the user records a decision to delete it (SPIKE-01 Data handling) |

- Retention is described in plain language in Settings → Data.

### NFR-12 Backups and restore · Must · M1
As the household, we want our history recoverable after a failure, so that years of edits and the one-time full-history import are never lost.
**Acceptance criteria**
- **Recovery point:** at most 24 hours of changes are lost in a full failure.
- **First imports backed up at once:** when a first full-history import (BANK — first import) or a CSV backfill finishes, a backup is made straight away. The connection page shows "First history not in a backup yet" until that backup has finished, then "First history backed up on <date>" (BANK — first import).
- **Recovery time:** the app is usable again within 48 hours of the failure being noticed.
- Backups are encrypted, kept 30 days, and stored separately from the live data, so that one failure cannot destroy both.
- **Backup status is reported, like bank freshness.** Settings → Data shows "Last successful backup <time>". If no backup has succeeded for 48 hours, every Owner sees a warning on every screen, "Backups have not succeeded since <date> — tell whoever runs the app", until one succeeds. Developer check, on a test installation: backups are stopped and the warning appears after 48 hours.
- Developer check: a full restore is rehearsed before M1 sign-off, before v1 (M3) sign-off, and after any change to how backups are made. The result is recorded.
- **A restore never gives back access that was taken away**. Before anyone can sign in, every access-reducing event executed after the backup was taken is re-applied, and every session ends, so every member signs in again (AUTH-16). Access-reducing events:
  - member removals and leaves, Owner demotions, revoked invites;
  - authenticator, recovery-code and email changes, 2FA turned on, and 2FA resets: an authenticator, recovery code or email replaced after the backup never works again, and 2FA turned on after the backup stays on;
  - deleted Enable Banking registration details and disconnected connections;
  - erasures (HH-08), purges from Recently deleted (SET-11) and household deletions (SET-09). Purged or erased data is never brought back.
- Developer check during each restore rehearsal: after the backup is taken, remove a member and replace another member's authenticator, then restore. The removed member cannot sign in, the old authenticator's codes are rejected, and no earlier session still works.
- After a restore, the NFR-05 restore notice is shown and the next sync fetches what banks still return for the gap (see BANK).
- After a restore, each account whose earlier history is now missing because the restored backup predates its first import or backfill is listed. The notice reads: "<Account>: history before <date> was lost in the restore. The bank may no longer return it — import a CSV file to fill it" (TXN — CSV import). Coverage is re-checked for every account, so any stretch the restore left uncovered shows as "Missing data for <account> <date range>" (ACC — coverage).
**Notes:** Backups matter more than usual here: many banks return extended history only right after the first consent, so the full-history import can't be repeated. The immediate backup closes the gap a 24-hour recovery point left for that one-shot import. Remaining risk: a failure between the import finishing and its backup completing. The after-restore list then tells the household exactly which history to backfill by CSV. Restore rehearsals happen at milestones and backup changes. The backup-status warning means a silent backup failure shows up within 2 days instead of at the next failure. 48 hours is twice the recovery point. A restore that rolled back removals, demotions and credential changes would let a removed member or a lost authenticator get back in, so all access-reducing events are re-applied.

### NFR-13 English now, other languages later · Must · M1
As a household member, I want the app in English now and able to take other languages later, so that adding a language doesn't mean rebuilding every screen.
**Acceptance criteria**
- v1 is in English and has no language setting.
- Every text a member sees (labels, messages, empty states, emails, default category names) is kept apart from the screens, one set per language. Adding a language means adding a translation, not changing screens.
- Text built from parts ("3 banks to renew") handles plural forms and word order per language, including Polish plurals.
- Dates, numbers and amounts are formatted separately from the language. v1 follows the browser's regional settings, so English text can show "1 234,56 zł".
- Screens stay usable with text 40% longer than the English (NFR-09).
- Text members enter, and text from banks, is never translated.
- Developer check before each milestone sign-off: with a test language that marks every string, no screen shows unmarked text.
**Notes:** Household decision (§10 question 1). Translations themselves are Later. Doing this from M1 is cheap; retrofitting it touches every screen.

---

## 6. Success metrics

### 6.1 How metrics work in this product
- **Few, and each one leads to an action.** There are six metrics: MET-01, 02, 05, 06, 08 and 10. Each says who reads it, when, and what the household changes if it's breached. With one household of two people these are guardrails, not statistics.
- **No external analytics, no tracking of individual members.** No metric counts any member's opens, visits or activity, and none says who did something. There's no "Household health" page in v1 (at most a Could, Later). Metrics are read from screens that exist anyway (the review's closing summary, the recap, the account details) or from the full export (SET-08).
- **Only records the app keeps anyway.** Every metric is computed from records that exist for product reasons. No record is kept only to measure something; a metric that would need one was cut (MET-11) or became a manual check (MET-02). The records used:
  - the weekly review record: "week reviewed on <date>" and the inbox counts at the start and the end (INS-24);
  - settle records: when a period settled, automatically or by "Settle now", and what was missing (INS-23, BUD-16);
  - BUD's snapshot at settle (BUD-19) and the plan history with times (BUD-16);
  - each transaction's first category source (CAT-05) and its member edits (TXN-03);
  - duplicate decisions, with whether the app had flagged the pair first (TXN-10);
  - history coverage and coverage gaps per account (ACC-13).
- **Learning period.** The first budget period, which starts mid-period (J-01 9e, BUD-13), never counts. Targets for categorisation and the budget apply from the **3rd full budget period** after the first budget is accepted; periods 1–2 are the baseline. Only Settled periods count; Provisional ones aren't complete. Habit targets apply from 8 weeks after M2 ships.
- **Fixed bars, not settings.** No metric uses a threshold a member can change. MET-06 uses a fixed 3 days after the settling window, not SET-06's staleness thresholds. MET-10 compares against the plan as it stood at month close, so editing the plan later in the period doesn't improve it. "Settle now" never counts as data arriving on time (MET-06).
- **Moved to acceptance criteria.** These are true or false for every case, so each failure is a bug rather than a number to watch:
  - "edits never lost" (removed MET-09) → NFR-05, TXN-04;
  - "history captured" (removed MET-12) → BANK-05, ACC-13;
  - the "every consent expiry visible ≥14 days before lapse" → BANK-03;
  - the "left to spend always shown with its freshness" → INS-01, BUD-17;
  - "the low-balance warning appears before the balance drops" → FC-06 (MET-11 removed).
- **Dropped.** MET-03 (per-member use), MET-04 (month close done), MET-07 (consent lapses), MET-11 (forecast accuracy) and MET-13 (insight usefulness).
- **The five core metrics, mapped:**
  - weekly review <10 min → MET-02, checked by hand (INS-24 doesn't time reviews);
  - <10% of auto-categorised transactions changed → MET-05a (first-source-automatic transactions in Settled periods);
  - 0 user-reported duplicates → MET-08a;
  - consent expiry visible ≥14 days ahead → acceptance criterion (BANK-03);
  - left to spend shown with freshness → acceptance criterion (INS-01), with MET-06 as its outcome.

  Added: MET-01 review habit, MET-06 data in on time, MET-10 plan accuracy.

### MET-01 Weekly review kept · Habit · M2
- **Question:** does the household come back weekly without notifications?
- **Definition:** of the last 12 review weeks (a week starts on the household's review day, SET-05), the number that have a "week reviewed on <date>" record dated within that week. A catch-up review counts only for the week in which the week was marked reviewed. This measures coming back, not diligence: a one-tap review of an empty inbox counts, and that's intended. Review quality is MET-05.
- **Measured from:** the weekly review records (INS-24). They say nothing about who reviewed.
- **Target:** at least 10 of the last 12 weeks (allows two weeks off).
- **Baseline:** first 8 weeks after M2 ships, reported without a target.
- **Read by · when · if breached:** whoever marks the week reviewed, on the closing summary ("Reviewed 10 of the last 12 weeks", proposed to INS; until then, counted from the export) every week. If breached, the household talks about why. If the review takes too long, see MET-02. If the day doesn't suit them, an Owner changes it (SET-05). No reminder is added.

### MET-02 Weekly review effort · Effort · manual check
- **Question:** is the weekly upkeep within the 10-minute budget?
- **Definition:** the time one ordinary weekly review takes, from opening the inbox to "Mark week reviewed", timed by the member doing it with their own watch. It's a manual check: the app stores no duration. Read it together with MET-05: a fast review that leaves wrong categories isn't a win.
- **When:** once a quarter, and once after adding a bank or a member.
- **In-app context, no target:** the inbox count at the start of each review (INS-24). If it falls as rules accumulate, effort is falling too.
- **Target:** ≤10 minutes for an ordinary week (not a catch-up).
- **Baseline:** the first check, in the first month after M2.
- **Read by · when · if breached:** whoever timed it, at that review. If breached, they look at which step took the time and add rules, merge categories or fix grouping (CAT). If possible duplicates are the cause, see MET-08b.

### MET-05 Categorisation quality · Effort / Trust · Depends on: SPIKE-01
- **Question:** are automatic categories right, and do they cover most transactions?
- **Definition:**
  - (a) **Changed after automatic categorisation:** of the transactions in the last 3 Settled periods whose first category came from an automatic source (Learned, Rule, Recurring item, Transfer detection or Bank data), the share whose category value a member later changed (TXN-03). A suggestion the member had to accept isn't automatic: its first source is Manual (CAT-05).
  - (b) **Coverage:** of the transactions in the same periods, the share whose first source is automatic.
  - **Caveat:** (a) counts only the wrong categories a member noticed. It falls when nobody looks, so read it with MET-01: a low (a) in weeks without reviews means nothing.
- **Measured from:** each transaction's first category source (CAT-05) and its member edits (TXN-03), in the full export (SET-08). A transaction counts as changed only if its category value changed. Accepting a suggestion isn't a change: it makes the first source Manual.
- **Target:** from period 3, (a) <10% and (b) ≥80%. Re-set both after SPIKE-01. If descriptions turn out unusable, the decision gate lowers (b).
- **Baseline:** periods 1–2.
- **Read by · when · if breached:** any member, from the export, once a quarter (proposed: a line on the recap). If breached, they look at which rules or merchants produced the changed categories and fix or delete those rules (CAT).

### MET-06 Data in on time · Trust
- **Question:** does every account's data arrive in time for the household to close the month, and is anything lost for good?
- **Definition:**
  - (a) **On time:** of the last 6 Settled periods, the number that settled automatically within 3 days after their settling window ended. It covers every budget-side account: connected ones, CSV-fed ones, cash accounts with "Track freshness for this account" on, and accounts waiting for a decision. Turning that option on for a cash account can therefore lower (a). A period held back by a coverage gap isn't on time either. A period closed with "Settle now", or settled later, doesn't count as on time.
  - (b) **Lost data:** date ranges in the last 6 periods that are shown as a coverage gap on an account (ACC-13) and that neither the bank nor a CSV import has filled by the time the period settles. Each gap counts once, in the period it starts.
  - Freshness in the middle of a period isn't a metric. It's shown live on every number (INS-01, BANK-09).
- **Measured from:** settle records (INS-23: "Settled automatically on <date>", or who settled and what was missing) and coverage gaps (ACC-13).
- **Target:** (a) at least 5 of the last 6. (b) 0. Re-check (a) after SPIKE-01 shows real refresh limits and posting lags.
- **Baseline:** the first 3 Settled periods after M2.
- **Read by · when · if breached:** any member, on the recap, at month close. If breached, the settle record says what held the period back:
  - a connection that failed repeatedly: a BANK issue or an outage, worth checking against SPIKE-01's limits;
  - a CSV import that came late: the holder's import cadence (J-02 5f);
  - a lapse: renew earlier (J-06 1b);
  - an account decision left open: decide it (J-11);
  - a coverage gap ("Missing data for <account> <date range>"): fill the range by CSV or have the bank return it (J-06 4a, J-07 4b).

### MET-08 Duplicate handling · Trust
- **Question:** does duplicate detection catch real duplicates without crying wolf?
- **Definition**, from the duplicate decisions TXN-10 keeps:
  - (a) **Missed duplicates:** "Duplicate of …" marked by hand on a pair from different sources that the app had *not* flagged.
  - (a′) **Marked within one source:** the same, for a pair from one source. TXN-10 deliberately never flags identical transactions from one source (two real coffees), so these are reported without a target. Many of them mean a bank reuses identifiers (SPIKE-01, G7).
  - (b) **Duplicate noise:** flagged pairs resolved as "Not a duplicate".
- **Measured from:** TXN-10's duplicate decisions (date, decision, whether flagged first) and the two transactions' sources.
- **Target:** (a) 0 per month. (b) ≤5 per month, since more means the app is too eager and lengthens the review.
- **Baseline:** (b) from the first 2 months after M1.
- **Read by · when · if breached:** any member, by filtering the duplicate decisions or from the export, at month close. If (a) is breached, duplicate detection is too cautious. If (b) is breached, it's too eager. The two pull against each other, which is why both are tracked.

### MET-10 Plan accuracy · Trust / No surprises
- **Question:** does the budget plan match reality, so left to spend can be trusted?
- **Definition:** each Settled period's actuals from BUD's snapshot (BUD-19), compared with the plan **as it stood at month close**: when the previous period settled, or when its settling window ended if that was later. The plan history gives that version (BUD-16). Fixing the plan at month close (J-04 step 8) is rewarded. Changing it later in the period doesn't improve the score.
  - (a) |fixed actual − planned fixed| as a share of planned fixed.
  - (b) Income shortfall: max(0, planned expected income − income received) as a share of planned expected income. Irregular income is already planned at 0 or at a base amount (BUD-04), so no member is excluded.
  - (c) Funds short: the number of sinking funds shown as short at settle (BUD-19).
- **Excluded periods:** the period in which the first budget was accepted, and any period in which a member's accounts were first added (J-02 step 6) or a member left (J-09 step 7).
- **Target:** from the 3rd full period, (a) and (b) within 5% in at least 5 of the last 6 counted periods. (c) is reported in v1, with a target set after 12 months.
- **Baseline:** periods 1–2 (or the short-history estimates, J-01 9a).
- **Read by · when · if breached:** any member, from the full export (SET-08: BUD-16 plan history and BUD-19 snapshots), once a quarter. If breached, they fix the current period's plan (J-04 step 8): a bill that changed, income that moved, or a fund set aside too little.

---

## 7. Milestones

Each milestone leaves the household with something usable on its own. **v1 is done when every Must in M1–M3 and every Must NFR is met.** Should and Could items may slip without blocking v1. Every M1–M3 milestone closes with a walk-through of its key journeys (section 3) as an end-to-end acceptance test.

| Milestone | Goal: what the household can do afterwards | Areas in scope | Exit criteria |
|---|---|---|---|
| **M0 Research** | Know what the household's banks actually deliver through Enable Banking, before anyone designs categorisation, history import or the household model. | SPIKE-01 (Appendix B) | Findings note written. Every SPIKE-01 decision gate is decided and recorded. Every requirement tagged *Depends on: SPIKE-01* is confirmed, rewritten or moved. |
| **M1 Sign-in & bank data** | Sign in safely. Connect every member's banks. See every account and transaction in one place, with the full history (including a CSV backfill) and honest freshness labels. | AUTH, HH, BANK, ACC, TXN core, CSV import, SET (base currency, time zone, staleness threshold, export), M1 NFRs | All 70 M1 Musts (AUTH-01–02, 07–11, 13, 16; HH-01–07; BANK-01–07, 09–10, 12, 14–16; ACC-01–03, 06, 09–10, 12–13; TXN-01–07, 09–10, 18, 21, 24; SET-01–03, 06–09, 11–12; NFR-01–06, 08–13) are met. Journeys J-01 (steps 1–6), J-02, J-06, J-07, J-08, J-09 (M1 steps), J-10 and J-11 (M1 steps) pass. |
| **M2 Categorise & budget** | Every transaction categorised. A working flex budget with left to spend, a weekly review, and the first period settled. | CAT, BUD (including the minimal period close), core recurring detection (feeds the budget wizard), basic dashboard, basic reports, weekly review, manual/cash transactions, minimal recap with Settle | All 58 M2 Musts (HH-08; ACC-04; TXN-13–16, 19–20; CAT-01–02, 04–05, 07–08, 12–13; BUD-01–08, 10–11, 13, 15–19; REC-01–09, 13, 18–19; INS-01–06, 08–10, 13, 23–24; SET-05; NFR-07) are met. Journeys J-01 (steps 7–10), J-03, J-04 (minimal close) and J-05 (without the forecast) pass. One full budget period has been settled using the app alone. |
| **M3 Plan ahead** | See what's coming (bills, a 30–90-day forecast) and where the household stands overall (net worth), with insights and the full dashboard. | Rest of REC (statuses, calendar, price changes), FC, NW, INS insights and breakdowns, full dashboard and recap | All 31 M3 Musts (ACC-05, 08; REC-10–11, 14–16; FC-01–07, 09–10; NW-01–04, 06, 08–09, 12; INS-07, 12, 18–20, 25–26) are met. Journeys J-03, J-04, J-05 and J-09 pass in full, including the forecast, recap and net worth steps. |
| **Later** | — | Savings goals, notifications of any kind, PWA/native apps, AI Q&A, receipts, investment holdings, Google sign-in (AUTH-17), email change (AUTH-15), translations (NFR-13), payment initiation, an Enable Banking commercial agreement (only if the household ever needs it), public launch | Not scheduled. |

**Scope per milestone by area** (Must / Should / Could counts):

| Area | M1 | M2 | M3 | Later | Total |
|---|---|---|---|---|---|
| AUTH | 9/3/0 | — | — | 0/0/2 | 9/3/2 |
| HH | 7/0/0 | 1/0/0 | — | — | 8/0/0 |
| BANK | 13/1/0 | — | — | — | 13/1/0 |
| ACC | 8/0/0 | 1/0/1 | 2/1/0 | — | 11/1/1 |
| TXN | 12/0/0 | 6/3/0 | — | — | 18/3/0 |
| CAT | — | 8/6/0 | 0/2/1 | — | 8/8/1 |
| BUD | — | 16/2/0 | 0/2/0 | — | 16/4/0 |
| REC | — | 12/0/0 | 5/1/1 | — | 17/1/1 |
| FC | — | — | 9/1/1 | 0/0/1 | 9/1/2 |
| NW | — | — | 8/3/0 | — | 8/3/0 |
| INS | — | 12/0/0 | 7/6/1 | — | 19/6/1 |
| SET | 9/0/0 | 1/0/0 | 0/1/1 | — | 10/1/1 |
| NFR | 12/0/0 | 1/0/0 | — | — | 13/0/0 |
| **Total** | 70/4/0 | 58/11/1 | 31/17/5 | 0/0/3 | 159/32/9 |

## 8. Out of scope

| Item | Why |
|---|---|
| Notifications of any kind (email alerts, push, digests, downloadable calendar reminders) | Household decision. Everything is shown in the app, with stale-data and "expiring" labels instead. Email is used only for invites and sign-in links. |
| Payment initiation, moving money, bill cancellation or negotiation | Read-only product. It would need a different Enable Banking product and a regulatory scope we don't want. |
| Savings goals (user-defined targets) | Deferred to Later. The virtual sinking funds in BUD cover irregular expenses in v1. |
| Investment holdings, positions, returns | Later. Investments are manual accounts with a value in v1. |
| Credit score, tax reporting, crypto | Not needed by the household. |
| Splitting costs with people outside the household | The household is fully shared. External splitting is a different product. |
| Per-member private accounts or hidden transactions | Household decision: fully shared. Filtering by member is for reporting only. |
| Public sign-up, multi-tenancy, billing, marketing | One private household, invite-only. |
| PWA, offline mode, native apps | Household decision: responsive web only. |
| A "household health" metrics page; per-member usage tracking | Metrics are read from records the app already keeps, on existing screens or in the data export (section 6). Tracking individual members isn't wanted. |
| Accessing another person's bank data through one member's Enable Banking setup | Not allowed by the Enable Banking terms for restricted mode (see RISK-01). Each member links their own accounts. |

## 9. Risks & dependencies

| ID | Risk | Likelihood / impact | Mitigation | Areas |
|---|---|---|---|---|
| RISK-01 | **Partner accounts under the Enable Banking terms.** The restricted-mode terms (updated 9 Jan 2026) limit production use to "Linked Accounts … solely for evaluation purposes or for the personal use of private individuals". They prohibit "accessing account information that does not belong to the Control Panel user who associated the Linked Accounts". They also say "the number of Linked Accounts per Application may be limited". One member therefore cannot connect the partner's accounts. | Certain / medium | **Decided (§10 question 7): one registration, the household lead's, links every account the household needs, each of them the lead's own or a joint account they co-hold.** An account that belongs only to the partner is never linked there, even with their login. If a member later brings such an account, they set up their own Enable Banking Control Panel (BANK-16) or use CSV import. SPIKE-01 must find the linked-account limit. Enable Banking's written confirmation that this setup is personal use is needed only before anyone outside the household uses the app (§10 question 8). | BANK, HH, AUTH, SPIKE-01 |
| RISK-02 | **One-shot history window missed.** Many banks return more than 90 days of history only for a short time after consent (Enable Banking FAQ: "around one hour"). Missing it leaves a permanent gap. | Medium / high | SPIKE-01 finds out which SCA opens the window. The first import runs straight after consent, and everything fetched is kept. CSV backfill in M1. The budget wizard works with short history. | BANK, TXN, BUD |
| RISK-03 | **Consent revoked early with no signal.** A password change or a revocation in the banking app ends the consent and nothing tells the app. | Medium / medium | Connection health checked on every sync. Stale labels on every derived number. Re-consent stays low-friction. | BANK, NFR |
| RISK-04 | **Stale data goes unnoticed**, because there are no notifications. | High / medium | Every derived number shows its freshness. Expiring consents get a header note for at least 14 days before they lapse, promoted in the final 3 days. Stale and expiring are kept distinct so the warnings don't wear out. | INS, BANK, NFR |
| RISK-05 | **Poor transaction data** (thin descriptions, no merchant category, reused or duplicate transaction IDs at some banks) makes categorisation, deduplication and recurring detection unreliable. | Unknown until SPIKE-01 / high | SPIKE-01 gates: merchant cleanup becomes a Must and the categorisation target is lowered if needed. Possible duplicates stay visible and count until resolved. Matching never relies on a single identifier. | TXN, CAT, REC |
| RISK-06 | **Single-provider dependency.** Enable Banking could change its terms, limit restricted mode, or a bank could drop out. | Low / high | CSV import is always available as a second path. Full data export (SET). | BANK, SET |
| RISK-07 | **A cloud-hosted app holding the household's bank data.** A breach exposes everything. With email sign-in, a member's inbox is the key to their account unless they turn on 2FA. | Low / high | Security NFRs (encryption, single-use sign-in links, optional 2FA, audit trail, re-authentication for sensitive actions). The provider is decided in tech design. | AUTH, NFR |
| RISK-08 | **v1 is large for a household-sized team.** | High / medium | Every milestone is usable on its own. Should and Could items slip first. Issues are created in stages (section 11). | All |

**External dependencies:**
- An Enable Banking account and Control Panel for each member who connects banks.
- Each member's bank logins for SCA.
- The list of target banks, which feeds SPIKE-01.
- A hosting decision, made in tech design.

## 10. Open questions

**Household decisions** (16 Oct 2026):
1. **UI language:** decided: **English** in v1, built so other languages can be added later (NFR-13).
2. **Sign-in options:** decided: sign-in by **email link or code** (AUTH-16), with no passwords. 2FA is optional (AUTH-04, Should). Google sign-in is Later (AUTH-17).
3. **Security emails:** decided: none in v1. Email carries only invites and sign-in links.
4. **Automated categorisation:** decided after SPIKE-01 shows how good the descriptions are. The long-term direction is the app's own deployed machine-learning model for categorisation.
5. **Target banks:** decided: **Erste and Alior**. SPIKE-01 tests these two. The accounts held at each are listed at SPIKE-01 step 2.
6. **Hosting and the operator role:** decided: the app is deployed in the cloud and the developer runs it. The provider and setup are technical design.
7. **Partner setup:** decided: the partner creates **no** Enable Banking registration. The household lead can access every account the household needs and has already linked them in their own registration. The partner joins as a member with no connections of their own (J-02). This holds only while every linked account is the lead's own or a joint account they co-hold (RISK-01). If a member later brings an account only they hold, BANK-16's own-registration path or the CSV fallback applies.
8. **Enable Banking's personal-use confirmation:** decided: not needed while only this household uses the app. It is needed before anyone outside the household uses it. SPIKE-01 still finds the linked-account limit (G1).
9. **Trust between Owners:** decided: Owners are fully trusted. There are no waiting periods on demotion or recovery; protection is re-authentication, an audit entry visible to all, and 7-day "Recently deleted".
10. **Email change (AUTH-15):** decided: deprioritised to Could · Later. Until then the operator changes a member's email by hand.
11. **Everyone locked out:** decided: not productised. The operator handles it by hand, outside the app. A second Owner stays suggested, not required (AUTH-12).
12. **SPIKE-01 window probes:** decided: yes. The user names the expendable account at SPIKE-01 step 2, and the probes run on it.
13. **Scope cuts in categories and budget:** to keep M2 achievable, these were moved from Must to Should: CAT-06, CAT-09, CAT-10 and CAT-15; CAT-07's account-holder and day-of-month conditions; creating and deleting category groups (CAT-02); BUD-04's "add to a sinking fund"; the BUD-08 surplus card. BUD-12 (changing the budget period) moved to Should · M3. Decided: confirmed. Separately, REC-17 (the bills calendar) is low priority and is now Could · M3. INS-07's Upcoming bills widget and REC-16's totals answer "what's due".
14. **Insights:** decided: the defaults stand (unusual spending at 1.5× the 3-period average with an excess of at least 5% of the flexible budget; a large transaction at 20% or more of the flexible budget; at most 5 insights per period). Year in review (INS-16) and the merchant report (INS-11) stay as written.
15. **Repository visibility:** decided: the code repository may be public. No personal data is ever committed (Appendix B, Data handling).

**Answered by SPIKE-01:** see Appendix B for the full list. Key items:
- Enable Banking's personal-use confirmation;
- the linked-account limit;
- how a joint account looks when linked by either holder;
- which SCA opens the history window;
- how pending turns into booked;
- the balance types for cards and loans.

**Smaller decisions and defaults to confirm:** 

Most of these are defaults the drafts already follow. Say only where you want something different.

*People and household*
- **The partner's view.** Has the partner been asked what they want from the app? Do they expect to use it as section 2.2 describes (glances on the phone, no bookkeeping)? Does the household split money in a way the personas don't assume, such as separate incomes with only bills shared? Until this is answered, the personas are assumptions.
- **Per-member money.** Confirm the non-goal in section 1.4: no per-member budgets, allowances or settling up in v1.
- **Members' rights (HH-02).** Members can edit the budget, categories, rules and area settings, and export everything. Deleting accounts and restoring from Recently deleted are Owner-only. Confirm. Will the household ever have a member who isn't an Owner?
- **Erasure (HH-07, HH-08).** Confirm the erasure policy in HH-08, and that a removed member can ask for erasure only through an Owner, not by themselves during the 7-day window. (Not legal advice.)
- **A joint account connected only by the member who leaves (HH-08).** A partner on the CSV fallback can't connect it from their own bank login, so their history in that account is erased with the leaver's. Accept this, or let a remaining member's CSV import during the 7-day wait keep the account?
- **"Ask <member>".** Should a member be able to mark a transaction "Ask <member>", so it shows in that member's dashboard attention rows next time they open the app (in-app only, not a notification; J-03 3a)? Proposed: Could · M3, owned by TXN and INS.
- **Review history on screen.** Should the weekly review's closing summary show "Reviewed N of the last 12 weeks" (MET-01), and should the recap show categorisation quality for the last 3 settled periods (MET-05)? Proposed: no. Metrics stay off everyday screens and are read from the export (section 6).
- **Insight-dismissal metric.** Should section 6 track the share of INS-20/INS-21 insights dismissed per period (target under 50%)? It needs only records the app already keeps, but it can be gamed by switching an insight type off, raising thresholds or not dismissing. Proposed: leave it out. If it's kept, report it with the insight types and thresholds in force.

*Sign-in and security*
- **Remembered sessions (AUTH).** 30 days, with a 7-day idle limit. NIST's AAL2 guidance is at most 24 hours. Acceptable for a read-only household app, or 7 days? And should the app show "Sign-in on this device ends in N days" in the last few days, so a member isn't signed out unexpectedly when they need it (J-05)? Proposed: yes, as an in-app note.
- **PSD2 5-minute timeout.** Assumed not to apply, because the app isn't a payment service provider (Enable Banking is). Confirm against Enable Banking's restricted-mode terms.

*Settings, currency and periods*
- **Staleness threshold for CSV-fed accounts (SET-06).** At the 7-day default, a member who imports once per period sees "Import due" about three weeks in four. A longer threshold hides spending not yet imported. Which default, and should it differ for accounts the household agreed to import once per period?
- **Locked period setting (SET-05).** The first settle locks the budget period type and anchor until BUD-12 (Should, M3) exists. If BUD-12 slips, a household that picked the wrong period is stuck. Warn at the first settle ("This locks the budget period setting"), make BUD-12 a Must, or accept?
- **Base currency (SET-10).** Changing it is a Should in M3. Until then, the choice is locked once the first account exists. Acceptable?
- **Exchange rates.** ECB euro reference rates (cross rates via EUR), or the national central bank's daily table (e.g. NBP Table A if the base currency is PLN)?

*Bank data, accounts and transactions*
- **Bank and CSV overlap (TXN-10).** With "Import all rows, check for duplicates", a daily purchase at the same price (coffee) gives about one possible duplicate per day of overlap, and a 1-day booking lag can pair the wrong two. Is the default "Import only rows before the bank's coverage" enough, or should "Import all" warn about this, or be removed?
- **Cancelled after booking, plus a reversal (TXN-06).** If a bank both marks a booked transaction cancelled and books a separate reversal credit, the money comes back twice. Should the app pair the two? SPIKE-01 shows whether any bank does this.
- **Credit cards (ACC-06)** show what is owed as the main figure, not available credit. Confirm.
- **Budget date (TXN-05)** is the transaction date where the bank gives one, so an end-of-month card purchase lands in the month it was made. Confirm.
- **Replacement accounts (ACC-09).** When an account is marked "Replacement for <account>", do the old account's rules, budget lines, recurring links and sinking-fund setting move to the new account? Proposed: the app offers each one for moving, and nothing moves silently.
- **"Keep data" on disconnect (BANK-14).** The accounts stay in the budget by default. Or archive them by default?
- **History target (BANK-05).** Is 12 months the target that triggers the backfill offer, or "as much as the bank had", for multi-year trends?

*Categories and budget*
- **Per-category limits** inside the flexible bucket: none in v1. Spending per category is shown, and pace (BUD-15) covers the whole bucket. Confirm.
- **Cash withdrawals** count as flexible spending when withdrawn. If the household tracks cash in a manual account, the default should be a transfer instead.
- **Budget defaults** (the table after BUD's worked example): confirm, especially the 5% threshold for the unplanned-income card and the 5-day payday warning.
- **"Catch up"** as the wizard's default for sinking funds that would start behind (BUD-07)? In the worked example it lowers the flexible budget by 1,150 for the first three periods.
- **Plan-based savings rate** (set-asides and planned savings counted as saved): left out of v1 (BUD-18). Proposed: Later.
- **Where sinking-fund money lives (BUD-20, FC-10, REC-07).** Is it kept in a separate real account, and does that account also hold savings? Should it be in the forecast (which then counts fund money as spendable), and should the monthly transfer into it be a plain transfer rather than savings? This decides whether BUD-20 is needed in M2.
- **Suggested transfer pairs** (TXN-13) need one tap each, every time, when the bank gives no account number to match. Should a rule be able to confirm a recurring pair (CAT-07)? Proposed: Later.
- **Lumpy flexible spending** (one monthly bulk shop) trips pace early. Allow marking a flexible category as a lump sum? Proposed: not in v1.
- **Rollover per line.** Rollover carries a whole income shortfall but no unplanned income, even when the two offset (salary −500, interest +500). Proposed: net differences below the card threshold before carrying.
- **BUD-20 and past periods.** Proposed: turning on "Include in budget" changes live results of past Settled periods, which show "Changed since settled". Carried amounts and fund balances don't change.
- **BUD-20 when set-asides aren't moved in full.** Proposed: the setting can hold a fixed monthly amount of fund money.
- **Skipping a non-monthly occurrence.** Proposed: no set-aside changes, and the fund keeps the money (BUD-07).
- **Late income and the surplus card** both look at the first 7 days. If one transfer could answer both, proposed: the late-income prompt (BUD-04) comes first.
- **Bills every 2 months.** Are the household's electricity or gas bills issued every 2 months? If so, the wizard should suggest a non-monthly category for them (BUD-06).

*Bills, forecast and net worth*
- **Price-change thresholds (REC-14):** 5% and 2.00. Right for the household? Adjustable (Could)?
- **Grace periods (REC-02, REC-10):** 2 days for weekly items, 5 days for the rest. SPIKE-01's pending → booked timing will show whether that's enough.
- **Splitting thresholds (REC-01):** amounts more than 20% apart, days at least 7 apart. Check against the household's own history before M2.
- **Two annual policies with one year of history** show as one every-6-months suggestion with a wide range. Better than no suggestion?
- **"Link in order from now on" (REC-06).** For two items with the same counterparty, account, amount and description but different categories, a member accepts that their categories may be swapped. Acceptable, or merge such items?
- **A second payment soon after an "Us" due date** links to the next occurrence as an early payment and counts in the next period. Should a second payment within the same interval raise a possible match instead?
- **Correction invoices (REC-14)** paid instead of the regular bill aren't told apart automatically; the member can mark the flag "One-off". Enough?
- **Annual items with short history.** If banks give 90 days or less, annual and every-6-months items rely on manual entry. Acceptable for the M2 wizard?
- **Bank "scheduled" transactions (FC-03).** The forecast ignores them until they book. Should it show them as known outflows on their date (Could, Depends on: SPIKE-01)?
- **Forecast spending (FC-05)** defaults to Recent spending. Or default to Our budget?
- **Forecast accounts (FC-02)** include every member's current accounts by default, not only Joint ones. Confirm.
- **Low-balance threshold (FC-06):** one combined threshold, or one per account?
- **A missed "Them" bill (FC-04)** (a failed direct debit) is projected on day 0 until resolved or the next one is due. Too pessimistic when the provider simply skipped a month?
- **Manual value jumps (NW-08)** show as one step in the month they're entered. Or spread them over the months since the previous value?
- **Automated valuations** of property or vehicles: none; values are always manual. Confirm.

*Insights*
- **"By member" (INS-25)** means by account holder. Attributing joint-account card spending to the cardholder would need a reliable cardholder field (SPIKE-01) and would be Later. Wanted?

*Also waiting on SPIKE-01* (beyond the Appendix B checklist)
- Metric targets MET-05, MET-06a and MET-08a′.
- Fetch counting (BANK-06): if balances, transactions and each account count as separate unattended fetches, a joint account kept fresh through two connections could use 6 a day, and BANK-06's schedule must shrink.
- Decision gate G2: should it also trigger for a single bank below a floor, so one bad bank isn't hidden by the household-wide score?
- Does ending a connection on our side revoke the consent at the bank? This changes the wording in HH-07 and SET-09.

## 11. GitHub Project mapping

The PRD is the source of truth. An issue mirrors a requirement and links back to its PRD heading. When a requirement changes, the PRD changes first and the issue follows. IDs are never reused.

**Structure**
- **Repository:** `kozlovvski/budget_app`. The tracker is the project "Product development".
- **Milestones:** `M0 Research`, `M1 Sign-in & bank data`, `M2 Categorise & budget`, `M3 Plan ahead`. Later items get no milestone.
- **Project fields:**
  - `Status`: Backlog / Ready / In progress / In review / Done
  - `Priority`: P0 / P1 / P2, set by hand to order the work. It is not the PRD's Must / Should / Could.
  - `MoSCoW`: Must / Should / Could, copied from the requirement
  - `Area`: AUTH, HH, BANK, ACC, TXN, CAT, BUD, REC, FC, NW, INS, SET, NFR, SPIKE
  - `Needs spike`: Yes / No
- **Labels:** `epic`, `requirement`, `spike`, `needs-spike`, `journey-checklist`, `bug`, plus `area:<prefix>`.

**Issues**
- **Issues are thin.** The PRD keeps the acceptance criteria. An issue never copies them, so there is one place to change.
- **One epic per area** (`[EPIC] CAT Categorisation`). The body is the area intro and a link to the section.
- **One issue per requirement**, titled `CAT-03 Rules engine`. The body holds:
  - a one-line user story;
  - the "Depends on" line;
  - a link to the PRD heading.
- Each requirement issue is a sub-issue of its area's epic.
- **Dependencies** are GitHub "blocked by" links, one for each requirement ID named in a "Depends on" line. A reference to a whole area is text only. Every requirement tagged *Depends on: SPIKE-01* is also blocked by the SPIKE-01 issue and labelled `needs-spike`.
- **NFRs** become issues under an `NFR` epic. Cross-cutting NFRs (accessibility, freshness labels, browser support) are also added to the Definition of Done.
- **Journeys (J-NN)** become one checklist issue per milestone, used as its exit test.

**Status lives in the tracker only.** The PRD never records what is done. Work is done when a merged pull request that says `Closes #N` closes its issue. The next work is the open issues in the current milestone that no open issue blocks (`scripts/next-issues.sh`).

**Creation.** All issues are created up front. Requirements that depend on SPIKE-01 stay blocked until the findings note exists. Then the affected requirements are rewritten in the PRD first and the issues follow.

## 12. Appendix

### A. Market research
Researched in October 2026 from public product pages, reviews and documentation (see Appendix D). The goal was to find what a household-only app should borrow, not to copy any one product.

| App | Budget model | What we borrow | What we leave |
|---|---|---|---|
| **Monarch Money** | Flex budgeting (fixed / non-monthly / flexible), plus category budgets | Flex types and one "left to spend" number; rollovers; recurring detection that the user confirms; net worth; Sankey cash-flow report; rules; household collaborators; weekly recap | Investment holdings; AI assistant; US-only aggregators |
| **YNAB** | Zero-based ("give every unit a job") | Plan-ahead mindset; targets for irregular expenses (our virtual sinking funds); honest overspending | Zero-based assignment of every unit (too much work for this household) |
| **Copilot** | Category budgets with rebalancing | Categorisation that learns from corrections; a "to review" inbox; mid-month rebalancing | Apple-only platform |
| **Lunch Money** | Category budgets, multi-currency | Rules engine; tags alongside categories; recurring items matched to imports; calendar view; splits; multi-currency; CSV import | Developer API, crypto |
| **Emma** | Category budgets, payday period | Subscription detection; payday-based budget period; splits; net worth | Upsells, cashback and "rewards" |
| **Actual Budget / Firefly III** | Envelope / double-entry | Evidence that Enable Banking works for personal, self-hosted use; local-first data ownership | Accounting-style complexity (double entry, manual reconciliation) |

**Patterns common to the category leaders, all included in v1:**
- automatic import plus a review inbox;
- rules with a "create a rule?" prompt after a manual fix;
- recurring detection that the user confirms;
- one headline number;
- connection health shown in the app.

**Gaps none of them fill for this household, all addressed in v1:**
- PSD2 consent expiry handled honestly, with no notifications to fall back on;
- a fully shared household budget where each member connects their own banks;
- EU banks (Polish banks first) through Enable Banking.

### B. SPIKE-01: Enable Banking test connection
**Milestone:** M0. M1 waits only for the gates that feed it (see "What M1 waits for"). **Owner:** the user (developer). The partner has no registration of their own (§10 question 7), so every step runs on the developer's registration.
**Timebox:** at most 7 working days of effort over 4–5 calendar weeks. The observation period must include one month-end with a salary payment, a direct debit and, if the household has a credit card, a card statement and repayment. If a gate can't be decided within the timebox, the conservative default next to it applies and the question is recorded as open.
**Order and effort.** Calendar-bound and history-critical work comes first. Day 1: run the sandbox (step 1) and, optionally, email Enable Banking (Prerequisites). Next: connect the developer's banks (step 2), fetching "longest" straight after each connection. Then start observation (step 5), which must cross a month-end. Steps 6 and 7 run during observation, only on banks whose first history is already kept. Effort budget (7 days): tooling 1.5; sandbox (step 1) 0.5; connections and the joint account (steps 2–4) 1; daily diff review during observation (step 5, about 15 minutes a day for 14–30 days) and filling the checklist 1.5; limits and revocation (steps 6–7) 0.5; description scoring and lag 0.5; anonymisation 0.5; write-up (step 8) 1. Converting the kept history for CSV import is M1 work, not spike effort. "The timebox runs out" means whichever comes first: 7 effort days used, or 5 calendar weeks after day 1.
**What M1 waits for.** M1 starts when G1, G3, G4, G5, G6, G7, G8, G9, G10 and G13 are decided. If the timebox runs out first, those gates take their conservative defaults at its end. G2, G11, G12 and G14 feed M2 work, so observation may continue for them after M1 starts.
**Tooling:** the spike needs small throwaway scripts (signed requests to Enable Banking, scheduled fetches, diffs, encrypted storage). They run on the developer's own machine. Whatever the spike uses decides nothing about the product's technical design.

#### Purpose
Turn every `Depends on: SPIKE-01` in the PRD into a known fact or a recorded decision, using real data from the household's own banks. The spike answers questions and builds nothing that ships. It does keep the history it fetches (see Data handling).

#### Prerequisites
- The developer's Enable Banking registration, with a sandbox application and a production application in restricted mode ([EB linked accounts](https://enablebanking.com/docs/api/linked-accounts/)).
- **Day 1, optional:** email Enable Banking, quoting the three clauses from the facts above. The answers to (1) and (2) are needed only before anyone outside the household uses the app (§10 question 8); the spike doesn't wait for them. Ask: (1) Is it within "personal use of private individuals" for one member's registration, linking their own and joint accounts, to feed one cloud-hosted household app that both members of the household use? (2) Does the clause against making the API "accessible to any third party" apply to the other member seeing the data? (3) What is the linked-account limit per application? (4) Can either holder link a joint account?
- The household banks: **Erste and Alior** (§10 question 5). The accounts at each (current, savings, credit card, loan, mortgage, joint) are listed at step 2.
- The partner agrees to have anonymised samples of joint-account data in the spike document.
- A machine that stays on for the observation period. If there isn't one, the developer fetches by hand at 4 set times a day and records that unattended limits were only partly tested.

#### Method
1. **Sandbox (≤0.5 day).** Run the full flow end to end against EB's sandbox bank: choose bank → SCA → session → accounts → balances → transactions (both "default" and "longest"). Record the session states and the errors for expired, revoked and rate-limited requests. Sandbox data is synthetic, so it is **not** evidence for any data-richness question.
2. **Own banks and the history window (day 1–2).** The developer linked the household's accounts in the Control Panel before the spike started. So for each account, first record whether a new app session on the existing link still returns the full "longest" history. If it doesn't, the extended-history window for that account is already spent: record the oldest date returned, and decide G13 on that evidence. Add the developer's registration to the spike tooling first. Then, one bank at a time: link the account in the Control Panel (approval 1), create an app session for it straight away (approval 2), and fetch "longest" at once, before moving to the next bank. Record the oldest date returned and the minutes since each approval, and keep the full raw response (Data handling). No real account is ever left unconnected, or connected late, to probe the window. Window probes run only on an account the user names as expendable (its older history can be lost): repeat its "longest" fetch at about 5, 30, 60 and 90 minutes after approval 2, and, if a second expendable account exists at the same bank, link it but wait more than 2 hours before its first app session, to see whether the link alone used up the window. Make every probe a member-present request (developer at the keyboard, presence signalled), so the probes don't use up the unattended fetches. For each probe record the oldest date and any error code: fewer days with no error means the window closed, while an error means rate limiting. With no expendable account, the timed probes are skipped and G13 takes its conservative default. Some days later, make a fresh approval for an already-imported account and fetch "longest": does the window reopen?
3. **Second member's registration: skipped** (§10 question 7). Instead, link as many accounts as the household needs in the developer's registration, or until Enable Banking refuses, and record any limit message. Record Enable Banking's written answer when it arrives.
4. **Joint account (if one exists).** Link it in one holder's registration and connect it. Linking it from the other holder's registration is tested only if a second registration is ever added. Compare account identifiers (including IBAN and domestic forms), account type, holder or co-holder flag, balances and transaction identifiers seen from each login.
5. **Observation (≥14 days, crossing one month-end).** Run up to 4 unattended fetches per day per connection, plus a few member-present refreshes. Plan real activity to cover each case in the checklist: a card purchase (pending → booked), a restaurant or fuel purchase (amount change, including a fuel pre-authorisation that changes while still pending), a foreign-currency card purchase, a transfer between own accounts, a transfer into and out of a savings account, a transfer between members, a card repayment, a loan repayment (if any), a refund (if possible), a salary, a direct debit and a standing order. Diff consecutive fetches. For each purchase, record its transaction date and the day it first appears booked (item 20).
6. **Limits.** Make one deliberate 5th unattended fetch in a day at one bank, then stop. Make member-present refreshes beyond 4 per day. Record what each bank returns.
7. **Revocation and re-consent.** Revoke the consent for one connection in the bank's own app (a password change only if the account holder agrees). Record what the next fetch returns and whether it differs from a temporary error. Re-consent, then record whether account and transaction identifiers are the same as before and whether an earlier session to the same bank ended. End access for one connection from the spike tooling, then check the bank's own app and try a fetch with the old session (item 21).
8. **Write-up (≤1 day).** Fill in the output document, propose a decision for each gate, and list the PRD requirements to update.

#### Checklist (one column per bank, one row per item)
| # | Item | Answer format |
|---|---|---|
| 1 | Max consent length the bank allows; length actually granted | days |
| 2 | History depth on the first fetch and after the window closes; window length; which approval opened the window (Control Panel link or app session); does a later approval reopen it | dates; minutes; yes/no |
| 3 | Account types returned (current / savings / card / loan / other); are cards and loans exposed as accounts at all | list |
| 4 | Account identifiers: IBAN / domestic number / masked card number / none; are both IBAN and domestic forms present; holder name; co-holder flag | per account |
| 5 | Balance types returned per account type (booked, available, other); is the credit limit returned; does the booked balance include pending or holds | per account type |
| 6 | Transaction fields populated (% of transactions): identifier, transaction date, booking date, value date, counterparty name, counterparty account, remittance / description, merchant category code, bank transaction code, balance after transaction, original amount / currency, exchange rate | % per field |
| 7 | 10–20 anonymised description samples per account type (card purchase, transfer, direct debit, salary, fee, FX) | samples |
| 8 | Description usability: share of transactions where a person can tell the merchant/payee from the description alone | each bank's share of the ~50 household transactions scored for G2, with each score recorded |
| 9 | Pending: statuses used (PDNG, HOLD, SCHD, OTHR); has an identifier; identifier kept when booked; does the pending item disappear in the same fetch the booked one appears (if not, days between); do amount, date or description change; does a pending change while still pending (a new pending replacing an old one, such as a fuel pre-authorisation), and does the old one disappear in the same fetch; days to booking (min/median/max) | per bank |
| 10 | Pending that never books: does it disappear, or is it marked cancelled or rejected (CNCL, RJCT); is a booked transaction ever later reported as cancelled or rejected | observed / not observed |
| 11 | Missing, changed or reused identifiers (same identifier with a different amount or date); identical same-day transactions present | yes/no + examples |
| 12 | Joint account: same identifier from both logins; same transaction identifiers from both logins; do the two logins return different transactions | yes/no |
| 13 | Unattended limit observed; response when exceeded; are member-present refreshes counted; do balance and transaction requests, and each account, count as separate fetches | per bank |
| 14 | Early revocation: what the next fetch returns; can it be told apart from a temporary error; how long until it was detected | per bank |
| 15 | Re-consent: account and transaction identifiers stable; does connecting again end another session | per bank |
| 16 | Any enrichment from EB (clean merchant names, categories, logos) | yes/no + sample |
| 17 | Restricted mode: a second member's registration works end to end (only if one is added, §10 question 7); linked-account limit per application; a newly opened account appears only after linking, and needs re-consent; any time limit on restricted mode; Enable Banking's written answer, if asked (§10 question 8) | yes/no + quote |
| 18 | The bank's own CSV export: format, encoding, columns (for TXN-21 presets and backfill) | sample header |
| 19 | How card and loan repayments, and transfers, look from the paying account: counterparty account, bank code, description pattern (for TXN-13/14) | per bank + sample |
| 20 | Days from transaction date to first booked appearance: longest typical lag (as defined in G14) for ordinary purchases (leaving out long holds such as hotels or car rental, which are listed separately), and the maximum seen | days per bank |
| 21 | Ending access from the app (BANK-14): does the bank's own app then show the consent as revoked; does a later fetch with the old session fail | per bank |

#### Data handling
- The raw responses are the household's real bank history, and some of it may not be fetchable again. Keep them complete on the developer's machine, outside the repository and encrypted at rest, plus a second encrypted copy on separate media (for example an external drive kept apart from the machine). Refresh the second copy after each day's fetches. Don't delete them when the spike ends. In M1 they are imported into the app as backfill through CSV import (TXN-21), with the bank's identifiers mapped so that later bank data doesn't duplicate them. They are deleted only by a recorded decision of the user, once the window behaviour is known (G13) and the history is in the app or judged not needed.
- Only anonymised extracts go into `docs/research/`. Anonymisation rules for those extracts:
  - Keep: merchant and business names, merchant category codes, bank transaction codes, field names, structure, currency codes.
  - Replace consistently within the document: people's names → `[PERSON_1]`, `[PERSON_2]`; IBANs and account numbers → `[ACCT_A]` (country code kept); card numbers → `[CARD]`; addresses, phone numbers, emails, national ID or tax numbers, invoice and customer numbers → `[REDACTED]`.
  - Amounts: round to whole units, except where the exact difference is the finding (pending → booked, FX). There, give the difference as a percentage, not the raw amounts.
  - Dates: shift all dates for one bank by the same unstated number of days, so gaps and booking lags are preserved.
  - Before committing, a second read of every sample checks that no personal data remains. The repository may be public (§10 question 15), so apply the rules as though it already is.

#### Decision gates
The user decides every gate on the spike's evidence. A per-bank gate changes the PRD only for that bank's accounts.

| Gate | Scope | Trigger | Decision / PRD change | Conservative default if undecided |
|---|---|---|---|---|
| G1 | household | The linked-account limit is below the household's account count. (Enable Banking's written personal-use confirmation is not a gate: §10 question 8) | CSV for the accounts over the limit (BANK-02). A commercial agreement is out of scope. Re-check BANK-16, J-01 | No limit assumed until Enable Banking refuses a link; CSV for any account it refuses |
| G2 | household | Description score below 50% (item 8). The user scores ~50 transactions across the household's banks, taken in order from the observation period (for a bank with few transactions, from its older history): usable = 1, partly usable = 0.5, unusable = 0, and records each score. 50% is the literal reading of "most" in the household's goals (section 1.3). There is no undecided band. Accounts on the CSV fallback are outside G2 | Merchant cleanup becomes Must; lower the categorisation target (CAT, MET) | Treat as below 50% |
| G3 | per account type | Card or loan balances not exposed | NW uses manual liabilities for them (ACC-06, ACC-08) | Manual liabilities |
| G4 | household | ≤90 days of history and no extended window | CSV backfill is Must in M1 (already planned); the budget wizard is designed for short history (BUD) | Assume ≤90 days |
| G5 | per bank | Pending not provided, or no usable link between pending and booked | Pending items are shown only if provided; left to spend says "excludes purchases not yet booked" for those banks (TXN-06, BUD) | Pending shown and counted; matches flagged more often (TXN-07) |
| G6 | per bank | No transaction date for card transactions | Budget date falls back to the booking date for that bank (TXN-05); expect month-end shifts | Booking date |
| G7 | per bank | One observed case of a missing, changed or reused identifier | No rule change (TXN-10 already covers reuse). Record the expected rate of "possible duplicate" and "the bank may have corrected this" flags | Assume triggered |
| G8 | per joint account | Joint account doesn't show the same identifier from both logins | The manual "same account?" merge (BANK-15) becomes the main path | Manual merge |
| G9 | per bank | Revocation can't be told apart from temporary errors | BANK-10 offers "May need renewing" sooner than 3 days | 1 day |
| G10 | per bank | Unattended limit <4/day, or member-present refreshes counted | Reduce the BANK-06 schedule; limit BANK-07 | Assume member refreshes are counted |
| G11 | per bank | Counterparty account number not provided | Internal transfers (TXN-13) mostly by suggestion rather than automatic | Suggestions only |
| G12 | household | EB provides usable enrichment or categories | CAT may use them as an extra signal | Not used |
| G13 | per bank | The Control Panel link opens and uses up the extended-history window, or a later approval doesn't reopen it (item 2) | The BANK-16 guide says "connect in the app within N minutes of linking"; BANK-05 option (b) is hidden for that bank; the kept spike history is imported in M1 | Assume the link uses up the window and nothing reopens it |
| G14 | household | Always (calibration): item 20 | One household-wide settling window = the largest, across the household's banks, of each bank's longest typical lag: the number of days within which 9 in 10 ordinary purchases first appear booked (a bank with fewer than 10 observed purchases counts as 7; INS-23). Rounded up to whole days, capped at 14 (BUD, INS) | 7 days (default) |

#### Exit criteria
- Every checklist cell is filled for every household bank, or marked "not available" with the reason.
- Every gate has a decision with evidence (sample or quote).
- If Enable Banking was emailed, its answer is quoted or recorded as not yet received.
- The raw history is kept as described in Data handling, and its location is recorded outside the repository. The second encrypted copy has been opened on another machine or after a restart, and its newest fetch matches the main copy.
- Every PRD requirement marked `Depends on: SPIKE-01` is listed with "unchanged" or the change to make.

#### Output: `docs/research/spike-01-enable-banking.md`
1. Summary: gate decisions in one table; top 5 findings.
2. Setup: banks and accounts tested (anonymised), dates, each member's registration and application mode, what was not tested and why.
3. Per-bank findings: the checklist table, one column per bank.
4. Samples: anonymised description samples per account type; pending → booked examples; an FX example.
5. Joint accounts and limits: the linked-account limit, Enable Banking's written answer if received, the joint-account comparison.
6. Consent lifecycle: granted length, history window, revocation behaviour, re-consent behaviour, detection latency.
7. Limits: unattended and member-present results.
8. Decision gates: for each, whether the trigger was observed, the decision, the evidence and the requirements affected.
9. PRD impact: a list of requirement tags, each marked "unchanged" or with the change to make.
10. Open questions: anything still unknown, with the conservative assumption used.
11. Data handling: confirmation that the anonymisation rules were applied, and that the raw history is kept encrypted outside the repository until the user decides to delete it.

---

### C. Glossary
| Term | Meaning |
|---|---|
| Household | The single group using the app. |
| Member | A person with a login in the household. |
| Owner | A role: a member with admin rights. There can be several. Never used for "whose account". |
| Operator | Whoever installs and hosts the app. This role exists outside the app. |
| Account holder | Whose bank account it is: a member's name, or **Joint**. |
| Connection | One Enable Banking consent for one bank login. |
| Consent | The PSD2 authorisation to read an account. It has an expiry and can end early. |
| SCA | Strong customer authentication at the bank. |
| Control Panel / linked account | Each member's own Enable Banking setup. In restricted mode, an account must be linked there before the app can read it. |
| Restricted mode | Enable Banking's contract-free production use, limited to the Control Panel user's own linked accounts for personal use. |
| Sync / re-consent | Fetching new data / renewing an expiring or expired consent. |
| Booked / pending | Final transaction / transaction the bank has not yet settled. |
| Possible duplicate | Two transactions that may be the same. Both count until a member resolves it. |
| Internal transfer | Money moving between the household's own accounts. Neutral: neither income nor spending. |
| Moved to savings | The net of savings categories in a period (money in minus money out). Never spending or income, and counted once. |
| Net saved | Income minus spending for a period. Different from moved to savings. |
| Between own accounts | A neutral transfer between two tracked accounts that is not savings. Neither spending nor income. |
| Money leaving / arriving from untracked accounts | One-leg transfers to or from accounts the household doesn't track. Two separate report lines; neither spending nor income. |
| Credit card repayment (untracked card) | Repaying a card the household doesn't track. Counted as Flexible spending. |
| Refund / split | Money returned against an earlier expense / one transaction divided across categories. |
| Flex type | Fixed, non-monthly, flexible, income, transfer or savings. Set per category. |
| Left to spend | What remains of the flexible plan in the current budget period. |
| Budget period / payday anchor | The month, or the period starting on the household's chosen payday. |
| Sinking fund | A virtual set-aside for a non-monthly expense. No money moves. |
| Rollover | Carrying unspent or overspent flexible money into the next period. |
| Settling window | The days after a period ends while late transactions are still expected (default 5). |
| Settled / Settle now | A period whose result has been snapshotted: automatically once its data reaches the end of the settling window (INS-23), or early by a member with "Settle now" ("Settled with N open items"). Later changes show as "Changed since settled". |
| Provisional | A period that is not yet Settled. Used only for periods; plans not yet confirmed are "Draft". |
| Uncertain items | Transactions that count as they are but may be wrong, such as a possible duplicate, a pending that vanished without a match, or one the bank no longer reports (TXN defines them). Totals that include them say "Includes N uncertain items (<amount>) — may be off". |
| Coverage gap | A stretch of a period with no data for a budget-side account. Blocks automatic settling and shows "Missing data for <account> <date range>". |
| Import due | The cue for a CSV-fed account whose "Data up to" date is older than the household's threshold (SET-06): "Import due for <account>". A period waiting for that account's data says "Waiting for <account> data up to <date>" instead (INS-23). |
| Keep data / end date | Disconnecting a connection while keeping its accounts and history. The accounts get an end date and never block settling; figures after that date say "Not updating since <date>: <account> — may be off". |
| Recently deleted | Where deleted data waits for 7 days, restorable by any Owner. GDPR erasure is the exception. |
| Paused — member removed | The state of a removed member's connections. Nobody else is asked to renew them; a restored member taps "Resume my connections". |
| Changed since settled | A label on a settled period whose live figures have since changed. |
| Late adjustment | A line in the current period showing a later change to a Settled period's carried rollover or fund balance. |
| Recurring item | A bill, subscription, recurring income or recurring transfer, confirmed by a member. |
| Review inbox | The list of transactions and items needing a member's decision. |
| Rule | A member-defined categorisation rule. Precedence (CAT-05): manual edit > rule > recurring item > transfer detection > learned pattern > bank data > uncategorised. |
| Stale / freshness | Stale: the data behind a figure is older than the household's threshold. Freshness: how old that data is. Freshness is not coverage: recent data can still have a gap. |
| Expiring | A consent nearing its end. Shown as a separate note, not as stale. |
| Base currency | The household's reporting currency. |

### D. Sources
Researched October 2026. This list collects the links cited in sections 1–6 and Appendix B, plus the market research behind Appendix A.

**Enable Banking**
- <https://enablebanking.com/accounts-api>
- <https://enablebanking.com/blog/2023/08/20/changelog-july-2023>
- <https://enablebanking.com/docs/api/linked-accounts/>
- <https://enablebanking.com/docs/api/quick-start/alt>
- <https://enablebanking.com/docs/api/reference/>
- <https://enablebanking.com/docs/faq/>
- <https://enablebanking.com/terms>

**Open-source apps that use Enable Banking**
- <https://actualbudget.org/docs/advanced/bank-sync/enable-banking>
- <https://actualbudget.org/docs/transactions/importing>
- <https://docs.firefly-iii.org/tutorials/data-importer/eb/>
- <https://github.com/firefly-iii/docs/blob/main/docs/docs/references/data-importer/duplicate-detection.md>

**Budgeting apps and market research**
- <https://community.emma-app.com/t/review-of-year-2020/3416>
- <https://emma-app.com/blog/payday-sync-budgets-track-salary>
- <https://emma-app.com/features/tracking/net-worth>
- <https://feedback.lunchmoney.app/bugs/p/pending-transaction-changes-lost-once-transaction-is-posted>
- <https://feedback.lunchmoney.app/bugs/p/recurring-item-with-fluctuating-amount-displays-average-instead-of-range>
- <https://feedback.lunchmoney.app/recurring-items/p/automatically-identify-and-flag-possible-recurring-transaction-price-increases>
- <https://help.copilot.money/en/articles/11157550-quick-start-guide>
- <https://help.copilot.money/en/articles/5327632-multiple-recurrings-for-the-same-merchant>
- <https://help.copilot.money/en/articles/8182433-copilot-intelligence-for-spending>
- <https://help.emma-app.com/en/article/what-is-a-period-in-emma-o5u7bx>
- <https://help.monarch.com/hc/en-us/articles/20504904768020-Cash-Flow>
- <https://help.monarch.com/hc/en-us/articles/20926382202004-Monarch-for-Couples-and-Households>
- <https://help.monarch.com/hc/en-us/articles/28953573066260-Tips-Tricks-for-Using-Monarch>
- <https://help.monarch.com/hc/en-us/articles/360058127551-Customize-Your-Dashboard>
- <https://help.monarch.com/hc/en-us/articles/4404739126548>
- <https://help.monarch.com/hc/en-us/articles/4411119762196-Rollover-Budgets>
- <https://intercom.help/copilotmoney/en/articles/6045480-dashboard-tab-overview>
- <https://learn.pocketsmith.com/article/256-pending-transactions-from-a-bank-feed>
- <https://lunchmoney.app/blog/11-lunch-money-features-you-should-be-using-and-why>
- <https://lunchmoney.app/features/web-first>
- <https://moneytothemasses.com/banking/emma-review-is-it-the-best-budgeting-app>
- <https://pocketsmith.com/tour/cash-flow-forecasts>
- <https://releasebot.io/updates/monarch>
- <https://support.lunchmoney.app/finances/analyze>
- <https://support.lunchmoney.app/finances/recurring-items/creating-recurring-items>
- <https://support.lunchmoney.app/finances/recurring-items/the-basics-of-recurring.md>
- <https://support.lunchmoney.app/home/net-worth.md>
- <https://support.lunchmoney.app/setup/rules>
- <https://support.lunchmoney.app/setup/tags>
- <https://support.simplifi.quicken.com/en/articles/3357429-using-projected-cash-flow>
- <https://support.ynab.com/en_us/income-v-expense-Byu1BYWRq>
- <https://support.ynab.com/en_us/starting-ynab-in-the-middle-of-the-month-a-guide-rJH96acA9>
- <https://support.ynab.com/en_us/when-the-month-rolls-over-a-guide-rkyyd6qC9>
- <https://support.ynab.com/en_us/ynab-together-B1nS78Cki.md>
- <https://suprsend.com/post/alert-fatigue>
- <https://useorigin.com/resources/blog/the-10-best-budgeting-apps-for-2026-unbiased-reviews-and-comparisons>
- <https://www.monarch.com/blog/fixed-flex-spending-what-it-is-and-how-to-get-started>
- <https://www.monarch.com/blog/flex-budgeting-simplify-your-spending-with-just-one-number>
- <https://www.monarch.com/blog/rollovers-and-referral-rewards>
- <https://www.monarch.com/blog/saved-reports-and-more>
- <https://www.monarch.com/blog/track-recurring-bills-and-subscriptions>
- <https://www.monarch.com/blog/visualize-your-cash-flow-like-never-before>
- <https://www.monarch.com/features/collaboration>
- <https://www.nerdwallet.com/blog/finance/budgeting-saving-tools/>
- <https://www.rocketmoney.com/learn/personal-finance/is-there-an-app-that-can-tell-me-when-my-subscription-price-increased>
- <https://www.thepennyhoarder.com/budgeting/monarch-money-review/>
- <https://www.wral.com/amp/17100108>
- <https://www.ynab.com/blog/what-is-a-sinking-fund>
- <https://www.ynab.com/five-minute-budget-routine/>

**Bank data aggregation (other providers)**
- <https://docs.yapily.com/guides/financial-data/data-restrictions>
- <https://plaid.com/docs/transactions/transactions-data/>
- <https://support.truelayer.com/hc/en-us/articles/360025818054>

**Regulation, security and accessibility standards**
- <https://eur-lex.europa.eu/eli/reg_del/2018/389/oj>
- <https://eur-lex.europa.eu/eli/reg_del/2022/2360/oj>
- <https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32018R0389>
- <https://gdpr-info.eu/art-12-gdpr/>
- <https://gdpr-info.eu/art-17-gdpr/>
- <https://gdpr-info.eu/art-20-gdpr/>
- <https://gdpr-info.eu/recitals/no-18/>
- <https://github.com/OWASP/ASVS/blob/master/5.0/en/0x10-V1-Encoding-and-Sanitization.md>
- <https://github.com/OWASP/ASVS/blob/master/5.0/en/0x15-V6-Authentication.md>
- <https://github.com/OWASP/ASVS/blob/master/5.0/en/0x16-V7-Session-Management.md>
- <https://github.com/OWASP/ASVS/tree/master/5.0/en>
- <https://pages.nist.gov/800-63-4/sp800-63b.html>
- <https://pages.nist.gov/800-63-4/sp800-63b/events/>
- <https://www.deque.com/en-301-549-compliance/>
- <https://www.eba.europa.eu/single-rule-book-qa/qna/view/publicId/2018_4172>
- <https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/>

**Reference data and local practice (Poland / EU)**
- <https://enerad.pl/co-to-jest-okres-rozliczeniowy/>
- <https://globenergia.pl/rozliczenie-miesieczne-dla-wszystkich-prosumentow-co-zmieni-sie-od-wrzesnia-2026-roku/>
- <https://nbp.pl/statystyka-i-sprawozdawczosc/kursy/informacja-o-terminach-publikacji-kursow-walut/>
- <https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html>
