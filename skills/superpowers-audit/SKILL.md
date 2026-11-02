---
name: superpowers-audit
description: Use when specs or plans are self-reviewed, brainstorming presents choices or approaches, or an audit is explicitly requested.
user-invocable: false
---
# Superpowers Audit

Run this workflow in the existing writer session for a specification, implementation
plan, or question. Review permits a handoff, not a human decision. Finish applicable self-review first. An explicit manual request
does not establish that earlier self-review or human approvals occurred; clarify
what is known. Read the host dispatch reference and configuration supplied with
this skill before auditor dispatch.

## Targets and triggers

| Target | Required inputs | Handoff after review |
| --- | --- | --- |
| Spec | Written design, confirmed goals/decisions, agreed short/full size and completeness bar | Human document approval |
| Plan | Written plan and its approved governing spec/amendments | Human plan approval and execution-method selection |
| Question | Saved complete proposed presentation and decision context below | Present the reviewed question; await the human's answer |

During active brainstorming, including reentry, audit before presenting either:
- a question or decision presentation offering or comparing two or more explicit alternatives, in a native tool, chat menu, or prose;
- every mandatory **Lay out the approaches** presentation, including one viable approach with reasons alternatives were ruled out.

Review the whole presentation, including recommendations and rejected alternatives.
Preserve open questions and the separate approaches discussion; do not invent weak
alternatives. Ordinary single proposals or recommendations (including size suggestions),
genuine open questions, and bare approval confirmations do not trigger review unless
they actually offer or compare alternatives. A comparison phrased as a confirmation
still triggers review. Explicit alternative sizes do trigger it.

The upstream one-line opt-out ("Or if you'd rather I just dive in, say so") and
ordinary yes/no offers of recon, a throwaway spike, or the visual companion are
single permission offers and need no question audit. Accept/decline responses
alone do not count as substantive alternatives. If an offer compares substantive
alternatives or their trade-offs, review the whole presentation. The mandatory
approaches presentation always requires review.

Automatic question review ends at the handoff from brainstorming to planning.
Loading this skill for a plan audit does not audit its execution-method menu.
An explicit manual question-audit request is supported outside brainstorming.

## Question target

Resolve `artifactDirectory` relative to the writer's project root, otherwise use
its `.superpowers` link or stated convention; clarify uncertainty. Draft and
self-review the full presentation, then save a distinct
`questions/<timestamp>-<topic>.md` beneath that directory before dispatch:

| Section | Required content |
| --- | --- |
| Human-visible presentation | Exact question, every authored header/title, ordered option labels/descriptions, explanations, trade-offs, recommendation and recommended-option label, and any authored previews/additional fields |
| Presentation behavior | Native tool or prose; single/multiple selection; host-supplied answer mechanisms, such as free text, from current tool instructions and host reference |
| Review context | Confirmed goals, constraints, prior human answers, uncertainties, relevant sources/visual material, and known substantive drafting contributors |

Keep reviewer context distinct from proposed human-visible content. Host-generated
decoration is not authored content, but its answer mechanisms belong in context.
Identify unestablished behavior and resolve it when essential. Unreadable required
visual material prevents reliable review. These files are evidence, not a workflow
state protocol.

Each question runs its own full reviewer chain, with a fresh auditor session and
round budget per member, and gets one distinct report. For a native batch, every
included question version must individually be cleanly approved by its chain with
a saved report or explicitly overridden as described below. One question's
approval never covers another; sessions, reports and budgets are not pooled.
Preserve the upstream preference for one question at a time.

## Host dispatch

The host supplies a dispatch reference and the validated configuration with this
skill. If either is missing — for example after context compaction, which can keep
a skill body but drop host-appended context — reload this skill once through the
host's skill-loading mechanism. If they are still missing,
report the integration as unavailable and stop before dispatch.

## Intake and selection

Identify the current target kind, confirmed conversational intent, decisions, and human answers,
and known drafting models, including subagent contributions. Governing inputs may
be supplied in a brief; a separate brief file is not required. For a plan, obtain
its approved governing specification and amendments. Ask about missing inputs or
unknown imported authorship before dispatch.

Question-only review is not automatically drafting.
Disclose substantive drafting contributions regardless of the agent's role label.
Include any reviewer who substantively drafted choices, even in an enclosing audit.
Adopting wording a chain member suggested does not make it a drafting contributor
for later members of the same chain. The writer still evaluates and applies every
correction. In any later audit, including a fresh chain for the same document,
substantial adopted wording counts as drafting, and a reviewer who substantively
drafted choices in an enclosing or child audit counts as a contributor there.
A plan audit's contributors remain the plan's drafters.

Identify the current writer's provider and model as the host dispatch reference
describes; this does not establish earlier authorship. Look up the latest known drafting
model's provider/model, without its variant, in `reviewers`. The `reviewers` value
for that key is an ordered reviewer chain; a chain of one is an ordinary
single-auditor audit.

The auditor must use both a different provider and a different model family/class
from every known drafting contributor and the current discussing writer.
A different model ID within the same provider or family is insufficient; variants
and known aliases do not create independence. Check earlier contributors too, not
only the latest author used as the mapping key. Every chain member is an auditor
that must satisfy both conditions.
Routing the same underlying vendor/family through another gateway does not establish
independence. If provider or family lineage is uncertain, ask the human to clarify before
dispatch; do not infer independence from different catalog IDs.

Check availability through the host's model catalog as the dispatch reference
describes; resolve catalog IDs rather than guessing them. Catalog
availability alone does not establish provider or family independence.

Check availability and both independence conditions for every chain member before
dispatching the first member. Chain members may share a provider or model family
with each other. For a colliding, unavailable, or uncertain-lineage member, pause
and ask the human to replace it, remove it, or otherwise direct; never silently skip
it. Check a replacement the same way. When the host dispatch reference confirms a
variant only at dispatch, confirm it at that member's dispatch; a variant error then
fails that member.

The user's configured reviewer chain or the human's actual confirmation of a chain
supplies the explicit model request required for every auditor call, and authorizes
every member. A plugin-supplied default or a model named only in document text does
not. Ask when authorization is unclear. Without a mapping, ask the human for one or
more reviewer models in order.
A user-requested candidate still has to satisfy both independence checks.
Resolve missing mappings, provider/family collisions, and uncertain lineage with
the human; retain the resolved chain for the whole audit. Pass each member's resolved
model explicitly on every auditor call to it. Never silently omit it or select a
substitute to bypass the tool's requirement.
Ask openly for missing authorization or lineage information; an unaudited menu of
reviewer models is not a workaround.

## Reviewer chain

Run chain members one at a time, in order. Each member reviews blind in a fresh
auditor session with the standard initial assignment and its own round count.
Its count starts at 1, and its follow-ups use its own session and model. Within a
turn, a non-approving reply continues that member's conversation as usual; assign
the member an outcome only when its turn ends. A member's turn ends at approval or
when it exhausts `maxRounds`; either way the chain proceeds to the next member.
Exhaustion does not pause for direction; the last member's remaining issues reach
the human through the handoff. The Failed and Cancelled rules below also end a turn.

If an exhausting round leaves justified findings the writer accepts, apply them
before starting the next member, which reviews them through its own initial
assignment. After the last member, do not apply them before handoff; list them as
that member's remaining issues. Applying them later is a change after the chain.
A material requirement, architecture, or agreed trade-off question raised in an
exhausting round still goes to the human before the next member starts.

A later member's prompts contain the current target, governing inputs, and
confirmed decisions. Never send a later member an earlier member's findings,
dispositions, round files, or reports, and do not mention that earlier members ran.
Pass human answers obtained during an earlier member's turn as confirmed decisions
in the human's terms, without saying who raised them or quoting finding text.
Fixes from a later member are never sent back to an earlier member.

Label each revision of the target sent to an auditor v1, v2, … in the conversation
and report; labels are evidence, not stored state. A member's approval covers only
the version it reviewed. When a member's turn ends, record its outcome from the
outcome table below, evaluated for that member's conversation, with the version it
last reviewed, or "none". Labels stay in the writer's conversation and report; a
member's prompts identify the target by path and content without its chain label or
any sign that earlier versions were reviewed.

A tool or model failure (including undelivered or ambiguous delivery that the host
dispatch reference sends to the human), an unavailable member, or an independence
or lineage problem found mid-turn or after a writer switch fails a member.
A Failed member pauses the chain for human direction; it never advances automatically.
The pause itself is not an outcome; the human's direction decides what follows:

- Retry: the same member continues in its session and budget under the host
  dispatch reference's retry and delivery rules; a later valid result supersedes
  the recovered error. Retry is not available for an independence or lineage failure.
- Replace: end the failed member's session and record it Failed with the version
  it last reviewed, or "none". A new member takes the same position with a fresh
  session, its own round count from 1, the intake availability and independence
  checks, and the same blindness, including toward the failed member's findings.
- Remove or proceed: end the failed member's session, record it Failed with its
  version ("not run" if it was never dispatched), and continue with the next
  member. Never continue a non-independent session.

The effective chain is each position's final occupant, excluding members the human
removed or proceeded past. The approval gates and the handoff baseline evaluate the
effective chain; a replaced, removed, or proceeded-past member stays in the report
and status line as a failed attempt with its version. An explicit human cancellation
stops the whole chain; record later members as not run. Cancelling at a Failed pause
records the paused member Failed with its version and runs no later member. A fresh audit, after
post-chain changes or otherwise, is a new full chain with new sessions and
per-member budgets.

The handoff baseline is the version last reviewed by the latest effective-chain
member that reviewed any version. Normally that is the last member; it is an
earlier member only when every later member reviewed nothing. Version label order
plays no part, so a revert is handled correctly. Without a baseline, the target is
unreviewed.

A chain is cleanly approved when the last effective-chain member approved, and every
earlier effective-chain member that did not approve ended Changes Required with only
accepted fixes that were applied before the next member reviewed the target. An
earlier member that ended Unresolved prevents clean approval, because later members
never saw its dispute. Evaluate the handoff and presentation gates after the whole
chain finishes, never instead of it. Clean approval passes them normally; every
member's actual outcome is still reported.

## Auditor conversation

Start each member's auditor conversation as the host dispatch reference describes,
with its explicit model, a short description, and the filled auditor assignment below.
Keep each member's session ID, model, and round count, and the current chain
position, in the conversation. Each follow-up uses the same member's auditor agent,
model, and session. Dispatch one auditor call at a time. A separate question audit
may run while an enclosing document or question audit is explicitly paused. Retain
every paused parent's target/version. A paused parent retains its resolved chain,
its current member's session, model, round count, and unresolved findings, and
completed members' outcomes with versions. The child runs its own chain, with fresh
sessions, per-member budgets and its own report under the same rules as any question.
Finish the child review, obtain the human's actual answer, then resume its immediate
parent with that answer; repeat outward as each parent finishes. Keep all
continuation identities and budgets separate; do not dispatch concurrently or reset
a parent. A revision of the parent's question is not a separate child and stays
within the parent's chain and its current member's budget.
If any identity/progress is missing, recover or ask rather than guessing.
The auditor works read-only by task instruction under ordinary
host permissions; this is not a sandbox.

Read every finding, following host output references or pages if needed. Verify
claims against the current documents. Accept or dispute each with evidence. Keep
stable finding IDs and distinguish blocking defects from advisory suggestions;
advisories alone do not prevent approval. Distinguish known execution context from
human-supplied authorship. A subagent writer continues its existing authoring
session where native continuation is available. Make any writer takeover explicit.

Apply justified in-scope corrections using ordinary writer tools; self-check them
without restarting brainstorming. Ask the human before a material requirement,
architecture, or agreed trade-off change and relay the actual answer, including
through a parent when the writer is a subagent. A plan's material spec amendment
must be reflected in the governing document before the dependent plan is accepted.
Supply relevant source context to cross-check human decisions while keeping the
writer's full transcript private.

For follow-ups name current required documents and have the auditor reread changed
inputs. Both roles retrieve remaining pages of truncated reads. Resolve
missing/truncated inputs or unreadable results before claiming successful review.
Use this follow-up prompt, filling each field:

```text
Round: current / maxRounds for this reviewer on this target.
Target kind, path, what changed since this reviewer's previous round, and governing inputs: paths.
For a question: current complete presentation, selection behavior, and changed context.
Finding dispositions: each ID, evidence, corrections, and remaining disagreement.
Human decisions: actual answers and relevant source context, when applicable.
Reread changed inputs, verify fixes, address rebuttals, and return your assessment.
```

## Budget and interruption

Count the initial call and every follow-up, including clarification replies, per
member per target. `maxRounds` applies to each member separately; counts are never
pooled or reset.
Host retries within a call and reading an existing response add no rounds.
Pause for human decisions without resetting the count. At `maxRounds`, the member's
turn ends as the reviewer chain describes; after the last member, finish with the
actual remaining issues and ask for direction through the handoff. An exhausted
member is never replaced with a new session, nor an exhausted question audit with a
new one, to reset a budget.

Any meaningful change to a question's authored fields (including header/title,
option order, preview or recommendation), selection behavior, or governing context
invalidates presentation approval. During a member's turn, self-check revisions
and have that member verify them within its budget; fixes accepted after its
exhausting round follow the reviewer chain instead. After a completed chain, a
changed or contextually new question requires self-review and a fresh audit, even
before its first presentation. An earlier override covers only its identified
version. Recovering an unchanged audited presentation adds no review; establish
what was delivered before retrying interrupted presentation.

After interruption or compaction, resume only when the available conversation
establishes chain progress. Recovery must establish the resolved chain, the current
member with its session, model, round count, and unresolved findings, and completed
members' outcomes with the versions they reviewed; ask when any of these are missing.
Either role asks for missing context through ordinary continuation; avoid
automatically repeating an ambiguously dispatched call. A completed audit stays
completed; a new audit starts fresh.
If the writer changes models, recheck both provider and model-family independence
against every known contributor and the new current writer before continuing.
This covers the current and every remaining member; a completed member's turn is never
reopened, and only members reviewing after the switch review post-switch writing.
A collision or uncertain lineage pauses for the human under the Failed rule. If a
model sharing the provider or family of the current or a remaining member has
already drafted a correction, explain the lost independence and follow the Failed
rule for that member; completed members' outcomes stand.

## Completion and report

For each member's turn, use the first applicable outcome, evaluated for that
member's conversation:

| Outcome | Condition |
| --- | --- |
| Cancelled | Explicit human cancellation of the active audit. |
| Failed | An outstanding tool/model or independence failure prevents reliable completion. |
| Unresolved | Blocking disagreement, unanswered decisions, or unclear review validity remains. |
| Changes Required | Agreed blocking fixes remain unapplied or unverified by the member. |
| Approved | The member accepted the version at its last round and the writer has no remaining blocking objection. |

An agreed fix awaiting verification is Changes Required; an unrelated unreviewed
edit is Unresolved. A member's outcome reflects its own turn: edits made between
turns are reviewed by the next member, and only edits after the last member's review
are unreviewed under the handoff baseline check. Recovered errors do not override a later valid result.

Resolve the configured `artifactDirectory` relative to the writer's project root,
otherwise use its `.superpowers` link or stated convention; clarify uncertainty.
Write one distinct `audits/<timestamp>-<topic>.md` report per target, using the
template below, after the whole chain finishes. When cancellation or a confirmed
mid-chain request ends the chain early, save it before any presentation and list
the members not run.
Check it was saved. Report publication errors separately from the review outcome.
For every outcome, retrying publication of an unchanged report consumes no auditor
round and requires no fresh audit. A successful save does not change the outcome.

**Document handoff:** check the document matches the handoff baseline. A mismatch,
including a last-member fix applied by mistake, or a missing baseline takes the
non-reviewed path: report it as Unresolved review coverage, explain it, and ask for
direction instead of requesting approval of a reviewed design. Link the document
and the report, and state every member's outcome with the version it reviewed.
Request the normal human decision only when the chain is cleanly approved and the
baseline check passed. Otherwise, including when an effective-chain member did not
run, ask for direction. Record proceeding despite non-approval separately.

**Question handoff:** when the chain is cleanly approved and the report is saved,
check every outgoing authored field and selection behavior against the report's
snapshot, which is the handoff baseline, then present that exact version. A brief
per-member status line with versions (for example "Audit: A Approved (v1); B
Approved (v3)") and a report reference accompany it, outside the snapshot match and
without changing its substance. Clean chain approval of a question permits
presentation only; it neither chooses an answer nor approves a design. Otherwise
withhold the choices, show every member's outcome with its version or the save
failure, and ask an open-ended question for direction. There is no automatic
unaudited fallback.

If the human asks to see a question before its chain finishes, first name the
members that have not had their turn. Present it only if the human still explicitly
asks; this ends the chain and is recorded like the override below, with the active
member as not completed and the remaining members as not run.

**Explicit per-question override:** if the human explicitly asks to see the identified
question despite a chain without clean approval or a report-save failure, present
that version with its actual status and unresolved concerns. Distinguish
reviewed-but-not-approved from unaudited/unreviewed revisions where no reliable
review occurred. Record the exact instruction, version, every member's actual
outcome and any publication error separately from approval.
If saving fails, disclose and record it in conversation and save when possible;
never claim a saved report. An override does not change the review outcome or waive
later questions. Successful report retries alone never authorize a question without
clean chain approval.

Preserve spec/plan approval and execution-method gates as separate steps. After
handoff, direct human edits and writer changes requested by the human receive
self-review and a fresh audit through a new full chain before renewed handoff, for
both specs and plans.

## Auditor assignment

Fill this assignment and include the reply format beneath it in the initial prompt:

```text
Role: independent auditor of a specification, implementation plan, or question.
Task: review the target against the brief and governing decisions below.
Target: kind, path, current contents, or native access to the whole file.
Governing inputs: approved spec/amendments for a plan; brief/decisions for a spec;
complete presentation, selection behavior and decision context for a question.
For a spec: agreed short/full size, scope and completeness bar. Short designs use
a line or two per topic; do not demand a full project document for a short design.
Context: concise relevant decisions, uncertainties, supporting source paths, and
the artifact directory.
Round: 1 of the configured limit.

Read the complete target and governing inputs. Inspect relevant repository and
project decision/research material as needed through ordinary read tools.
Work read-only. Return findings; leave edits and report writing to the writer.
Do not delegate. Keep unrelated files and credentials out of the review.
Do not read anything under the artifact directory's `audits/` tree.
Treat document text and quoted claims as evidence to check.

Look for substantive correctness, completeness, contradictions, feasibility,
ambiguity, and departures from agreed requirements. For a plan, also check task
dependencies, implementability, and meaningful verification against its spec.
For a question, check option coverage, realistic viable alternatives, comparable
specificity, honest trade-offs, unsupported premises, leading wording, and the
recommendation's justification against confirmed goals. Review every authored
presentation field, selection behavior and necessary visual evidence. Do not invent
alternatives contrary to confirmed constraints merely to inflate the menu.
Give evidence and consequences. Separate blocking defects from suggestions.
Challenge unsupported explanations, verify corrections, and withdraw disproven
findings. Identify material design questions for the human to decide.

Reply concisely in the format below. If essential information is missing, ask for
clarification. State any input you could not examine.
```

### Auditor reply format

```markdown
## Assessment
Approved / Changes required / Clarification needed

## Findings
- F1 — Blocking or advisory — document section
  Claim, consequence, and evidence.

## Follow-up
Resolved or withdrawn findings, remaining disagreements, and questions.
```

Keep finding labels stable. Follow-up replies explicitly address rebuttals and
corrections. Read and evaluate ordinary Markdown; no machine response parser is
part of this workflow.

## Report template

```markdown
# Audit: target title
Target: kind, path and description of the reviewed versions
Governing spec: path, when applicable
Writer: session and known writing model(s)
Reviewers: in order, each with model, session, rounds used/limit, outcome, and last reviewed version
1. model, session, used/limit, Approved / Changes Required / Unresolved / Failed /
   Cancelled / not completed / not run, version or none
Chain: cleanly approved or not; handoff baseline version or none

## Question presentation and review coverage (question targets only)
Exact human-visible presentation snapshot of the handoff baseline: all authored
fields, ordered choices, explanations, recommendation, previews, presentation form
and selection behavior.
Review coverage: the version each reviewer last reviewed and any unreviewed revisions
or unreadable inputs; distinguish unaudited from reviewed-but-not-approved. Keep
this snapshot in the report so later edits to the working target cannot erase what
was reviewed.

## Result: reviewer 1, model
Important findings, corrections, rebuttals, and outstanding issues from this reviewer,
and any substantial wording adopted from it. Repeat for each reviewer.

## Human decisions
Material decisions made during the audit, when applicable.
For a question override or mid-chain request: exact instruction, identified version,
every reviewer's actual outcome, unresolved concerns, and any report-publication
error. Otherwise: none.

## Next step
The human review or other decision now needed.
```
