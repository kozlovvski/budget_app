# UI design

**Reference design:** the "Budget App Screens" artifact, https://claude.ai/artifact/HDGP9hpEkDUcWjDEnATbkY (private; ask the household lead for access). It follows the "Finsight · Cozy" direction, adapted to the PRD. Build the UI to match it. If it disagrees with the PRD, the PRD wins; then update the design and this file.

Screens in the design: phone dashboard, phone sign-in, desktop dashboard, weekly review (inbox, budget and cash), budget, September recap, accounts & connections, foundations (markers and tokens).

## Look

- **Warm and friendly**: cream ground, white cards with a 1px warm line, large radii, bold figures. Font: Plus Jakarta Sans 400–800.
- **Charts over tables**: show amounts as bars, stacked bars, donuts and columns. Use a list or table only for transactions and other record lists (initials tile, merchant, category · holder, amount, grouped by date).
- **Few chips**: markers only where the PRD requires one (Stale, Pending, Provisional, Possible duplicate). No decorative chips on cards.
- **No underlines on links**: links are bold and coloured. Buttons are pills.
- **Tone**: factual wording, no praise, blame or peer comparison. Greeting "Hi Anna". Amounts as `1,540 zł`.

## Tokens

| Use | Value |
|---|---|
| Page ground / sidebar | `#F8F3EA` / `#FCF9F4` |
| Card line, control border | `#EEE5D8`, `#E3D7C7` |
| Ink, body text, muted | `#2A201B`, `#4D4038`, `#74675C` |
| Terracotta (brand, bars, focus ring) | `#CF5C3E` |
| Primary button, links, active nav text | `#B0482D` (hover `#8F3A24`); white on it passes 4.5:1 |
| Peach (active nav, selected, tinted card) | `#FBE4D9` |
| Open review row | `#FDF1EA` |
| Good / warning / info / error | sage `#3D7347` on `#EDF3E8`; butter `#6B4A10` on `#FCF1D3`; blue `#37598A` on `#EAF0F7`; brick `#A33A22` on `#FBE7E0` |
| Chart palette | `#CF5C3E`, `#E2B04A`, `#8FAE88`, `#8E5A86`, `#6E93C4` |
| Radii | cards 20, tiles 16, controls 10, pills 999 |

## Layout rules

- Responsive from 360 px. Desktop: sidebar (coloured icon squares, a freshness card, and an account button at the bottom that opens a menu: Settings, Household & members, Profile & security, Sign out) plus a main column up to 1200 px.
- The household name shows only in the account button ("Owner · Nowak household"). There is no brand block.
- Dashboard order: greeting, attention banner, four stat cards, month pace and "Where it went", accounts, recent transactions, bills and insights.
- Stale data: one banner at the top of the screen, plus the account's own tile. Do not repeat it on each card.
- Touch targets at least 44 px. Every status marker has an icon or words, never colour alone.
