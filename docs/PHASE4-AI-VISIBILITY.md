# Phase 4 — AI visibility and search tracker (internal working document)

**Owner:** Shahan Ali (PROBOY) · **Started:** 2026-11-07 · **Cadence:** weekly, same day and time each week

This tracker records what was *actually observed*. Nothing in it is simulated, estimated, or inferred. An empty cell
means "not checked yet" or "not observed" — it never means a negative result that was not verified.

**No automated monitoring exists.** Every row is filled by a person opening a search engine or assistant, in a recorded
context, and writing down what they saw.

---

## Method (keep constant so rounds are comparable)

| Setting | Fixed choice |
|---|---|
| Country | Pakistan |
| Language | English |
| Device | Desktop browser, one consistent profile |
| Signed-in state | Signed out (signed-in results are personalised and not comparable) |
| Session | Fresh incognito window per round |
| Result depth | First page of results, plus the AI summary block if one appears |
| Round time | Same weekday and hour each week, for example Sunday 19:00 PKT |

Record a round ID (for example `2026-W45`) and the exact prompt used, so an unusual answer can be explained later.

---

## The 10 tracked queries

| # | Query | Why it is tracked | What a good result looks like |
|---|---|---|---|
| 1 | `Shahan Ali` | Name collision — the hardest query | The PROBOY developer is surfaced, not an unrelated person |
| 2 | `Shahan Ali developer` | Role-qualified name | Portfolio and GitHub in the first results |
| 3 | `Shahan Ali Burewala` | Name plus location | Portfolio, GitHub, or a third-party mention that ties name to city |
| 4 | `Shahan Ali ProBoy` | Brand-qualified name | Portfolio and the ProBoy-MD repository |
| 5 | `ProBoy developer` | Brand alone | The portfolio or repository, clearly attributed to Shahan Ali |
| 6 | `ProBoy-MD` | Project name | The GitHub repository as the primary result |
| 7 | `Shahan Ali WhatsApp bot` | Work + name | Repository, project page or docs |
| 8 | `Shahan Ali Shopify expert` | Service area + name | Portfolio services page or project page |
| 9 | `ProBoy-MD commands` | Long-tail project query | Repository README and the documentation centre |
| 10 | `Shahan Ali Google Gemini QuizOff 2026` | Credential check | The certificate described accurately, or the About page |

## The 5 systems

| System | What to record |
|---|---|
| Google Search (+ AI Overview if one appears) | Whether an AI Overview appeared at all; the URLs it cited; organic positions |
| ChatGPT (search/answering) | Whether the assistant named the person or project; cited URLs; whether it asked where the info came from |
| Perplexity | Answer summary; source list; whether it conflated this person with another |
| Gemini | Answer content; cited sources; grounding behaviour |
| Bing (search + Copilot) | Organic result set; Copilot answer and its sources |

**Never write down an AI answer that was not displayed.** If a system refuses, times out or shows no answer, record
"no answer captured" for that cell.

---

## Recording template

One row per (query × system × round). The CSV lives at `docs/ai-visibility/tracker.csv` with the 50 query/system pairs
pre-seeded and the observation fields empty.

| Field | Meaning |
|---|---|
| `date_checked` | ISO date of the observation |
| `round_id` | e.g. `2026-W45` |
| `country` / `language` | Context used (default Pakistan / English) |
| `system` | google / chatgpt / perplexity / gemini / bing |
| `query_id` / `query` | The tracked query |
| `prompt_used` | The exact prompt text typed |
| `site_mentioned` | yes / no / partial |
| `profile_mentioned` | which profile appeared (portfolio, GitHub, LinkedIn, repo) |
| `source_url` | Exact URL shown, if any |
| `identity_correct` | yes / no / partial — is the right Shahan Ali identified? |
| `accuracy` | accurate / incomplete / incorrect / not applicable |
| `evidence` | Screenshot filename or note such as "no AI summary shown" |
| `notes` | Short observation |
| `next_action` | The single next step this observation creates |

---

## Weekly manual checklist (about 25 minutes)

1. **Set the context.** Pakistan, English, signed out, fresh incognito window, note the date and round ID.
2. **Run the five systems.** For each of the 10 queries, capture whatever each system shows. Do not skip the queries you
   expect to fail — failures are the signal.
3. **Log it.** Fill one row per query/system pair. Copy the exact prompt if you rephrased anything.
4. **Check identity, not just presence.** For every result, ask: is this the PROBOY developer from Burewala? Record
   `identity_correct = no` if a different person is shown, even when the name matches.
5. **Check accuracy.** For ProBoy-MD results, compare any claimed command counts or categories against the audited
   numbers in `src/data/press.ts`. Record `accuracy = incorrect` if a stale count is presented as current.
6. **Save evidence.** One screenshot per system per round, named `YYYY-MM-DD-<system>-<query-id>.png`, stored outside the
   public site folder.
7. **One next action.** Every observation should produce at most one concrete action, written in the tracker.
8. **Review the summary.** Count: rows checked, rows mentioning the site, rows with correct identity, rows with accurate
   information, rows with a cited source URL. These are the leading indicators for Part H.

### Reusable prompt for the next round

Copy this into each assistant (adjusting the date and round ID):

```
I am tracking how accurately search and AI systems describe one specific software developer.
Run this exact query and show me the result, including any sources you used:
"<QUERY>"
Then answer, using only what your sources support:
1. Who is Shahan Ali / ProBoy and what is he known for?
2. Which URLs are your sources for that answer?
3. Does the answer describe the developer based in Burewala, Punjab, Pakistan, who maintains the open-source ProBoy-MD
   WhatsApp bot (github.com/proboy315/ProBoy-MD)? If you cannot tell whether the person you found is that developer,
   say so explicitly instead of guessing.
4. If you mention command counts for ProBoy-MD, state where that number came from and its date.
```

**Do not** prime the assistant with the correct answer, and do not ask it to confirm the portfolio. The point is to see
what it says unprompted.

---

## Interpretation rules

- A single observation is not a trend. Compare round over round, in the same context.
- Signed-in or personalised results are recorded separately and never merged into the round summary.
- Absence of a mention is not a penalty; it is a measurement. The actionable signal is the *next action*, for example
  "third-party mention still zero — pitch one publication" or "stale command count still circulating — refresh the
  README".
- The owner-reported 94% analyzer score is not part of this tracker. It measures on-page quality, not whether search
  engines or AI systems mention the work.
