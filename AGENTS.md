# AGENTS.md

A private budgeting app for one household: it pulls in the household's bank data, categorises spending, runs a flex budget and shows where the money goes.

**Status:** requirements are drafted and the high-level technical design is agreed (`docs/architecture.md`); there is no application code yet. The repo uses OpenSpec (`openspec/`) for change proposals.

## Where to start

- **`docs/PRD.md` is the source of truth for business requirements.** Read the brief below first, then go to the PRD section you need. Don't read the whole PRD up front; it is long.
- Find a requirement by its ID: `grep -n "^#### BUD-07" docs/PRD.md`. Area sections are `### 4.x`; NFRs are `### NFR-NN`.
- Useful sections: §1 overview and principles, §3 user journeys, §4 functional requirements by area, §5 NFRs, §7 milestones, §8 out of scope, §10 decisions taken, Appendix B (SPIKE-01), Appendix C (glossary).

## Product brief

**Vision:** one number the whole household trusts (how much we can still spend this period), kept true in about ten minutes a week.

**Users:** one household, two adults. The *household lead* sets things up and does the weekly review. The *partner* mostly glances at the phone. Everyone sees everything; roles (Owner/Member) only gate admin actions.

**How it works:**
- **Bank data** comes from **Enable Banking** in restricted mode (the household's own registration, PSD2 consents that expire about every 180 days, about 4 unattended fetches a day). Banks that can't be connected use CSV import. Cash, property and loans are tracked by hand.
- **Flex budgeting:** income − fixed bills − sinking funds for irregular costs − savings = **left to spend**, the one number to watch. It is not envelope or zero-based budgeting.
- **Honest numbers:** every derived figure shows how fresh it is and what may be missing (stale, pending, possible duplicate, coverage gap). A period is *Provisional* until its settling window passes, then *Settled*.
- **Low effort:** automation suggests (categories, transfers, recurring items, duplicates), and people confirm in one review queue.
- **Pull, not push:** the app sends no notifications. Everything waiting on a person shows on the dashboard.

**Areas:** AUTH sign-in and sessions · HH household and roles · BANK bank connections · ACC accounts · TXN transactions and CSV import · CAT categorisation · BUD flex budget · REC bills and subscriptions · FC cash-flow forecast · NW net worth · INS insights, reports and dashboard · SET settings and data · NFR non-functional.

**Milestones:**
- **M0 Research:** SPIKE-01 tests real Enable Banking data from the household's banks.
- **M1 Sign-in & bank data:** sign-in, household, connections, accounts, transactions, CSV.
- **M2 Categorise & budget:** categories, flex budget, weekly review, first settled period.
- **M3 Plan ahead:** bills calendar, forecast, net worth, insights, full dashboard.
- **Later:** unscheduled.

**Key decisions:**
- Sign-in by email link or code, with no passwords. 2FA is optional; Google sign-in is Later.
- Responsive web from 360 px wide, with no PWA or native app.
- English UI, built to be translated later.
- Cloud-hosted.
- Read-only: the app never moves money.

**Non-goals:**
- Not a public product: no multiple households or billing.
- No privacy between members and no per-member budgets.
- No tracking of individual members.
- No savings goals or investment tracking in v1.

## Working rules

- **PRD first.** When a requirement changes, edit the PRD, then the issue or spec follows. Cite PRD IDs (`AUTH-16`, `J-05`) in specs, issues, commits and code comments where they explain why.
- **IDs are never reused.** A removed requirement stays as a stub heading marked `· removed`.
- **Respect `Depends on: SPIKE-01`.** Those requirements rest on unverified assumptions about Enable Banking data. Don't design or build them as written until the spike's findings are in.
- **The PRD names no technology.** Stack and architecture choices belong in the technical design (`docs/architecture.md`), not the PRD.
- **PRD style:** British spelling, plain words, and exact UI wording in "quotes".
- **No personal data in the repo** (the repo may become public): no real transactions, account numbers or bank exports. Spike samples are anonymised (Appendix B, Data handling).
- **Ask before creating outside-facing things:** a GitHub remote, Project, issues, or emails to Enable Banking.

## Technical design

**`docs/architecture.md` is the source of truth for how the app is built.** Read it before designing or building anything; change it when a technical decision changes. If it disagrees with the PRD, the PRD wins.

In short:
- **Stack:** NestJS modular monolith with CQRS, MikroORM v7 on PostgreSQL, BullMQ on Redis; React with TanStack Start and shadcn/ui; Kubernetes on OCI, deployed with ArgoCD.
- **Patterns:** DDD aggregates only where the logic is hard; a framework-free domain; pure functions for ingestion and counting rules, tested with the PRD's worked examples.
- **Reads** are computed on request, with no stored projections. Optimise only after a measurement shows the need.
- **Background work:** events are queued after commit, and every consumer has a sweep that finds work it missed.
- **Conventions:** module layout and adapter naming in §5.3; open questions in §13; pending PRD changes in §14.
