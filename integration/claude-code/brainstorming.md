## superpowers-audit amendment to superpowers:brainstorming

This is the superpowers-audit plugin's amendment to the brainstorming skill you
just loaded. It adds independent question review before presentation and design
review before human handoff. Follow the skill together with this amendment;
where they differ, the amendment governs.

### When it applies

Both short and full written designs receive the document stages below. A quick,
clear task, a human partner who chose to skip the questions, and an authorized
throwaway spike retain upstream document-stage exemptions. Menus actually
presented while brainstorming is active still receive Question Review.

### Question Review

Throughout active brainstorming, including reentry, use the Skill tool to load
`superpowers-audit:superpowers-audit` before presenting a question or decision
presentation offering or comparing two or more explicit alternatives, in a tool
or prose. Also review every **Lay out the approaches** presentation before showing it,
including one viable approach with reasons alternatives were ruled out.
Follow the shared skill's question workflow for self-review, saved presentation,
independent review, report, version matching, and explicit per-question overrides.
Question approval permits presentation, not an answer or design approval.

Keep open questions and ordinary single recommendations or size suggestions;
they need no question audit unless they compare alternatives or are the mandatory
approaches presentation. This stage includes builder and audit clarifications.
It ends at the handoff to planning: writing-plans' execution-method menu is exempt.
Reentry into brainstorming restores this stage.

### What it supersedes

- In the opening sequence, "3. Get their approval of that doc." Instead, complete
  the applicable builder check, Spec Self-Review, and Adversarial Review, then get
  approval of the current document through Human Document Review.
- In **The Written Design**, "For a small change, the short design covers the same
  points in a line or two each and goes straight to your human partner, without the
  builder check." Instead: Short designs omit the builder check, then receive Spec Self-Review,
  Adversarial Review, and Human Document Review. Full designs complete the builder
  check before that sequence. Honor the human's size override and assess completeness
  at the agreed size; do not inflate a short design merely to satisfy review.
- In **Builder check**, "may come back once with a few questions. Don't hand
  over the document until the check is back." Instead, when you say you're
  writing it up, say a reviewer will read it first and you may come back once
  with builder questions; additional audit questions are possible. Don't hand
  over the document until the builder check, self-review, and audit are complete.
- In **Builder check**, "Update the document with their answers, then hand it
  over with a short list of the calls you made so they can check those while
  reading." Instead, update the document with their answers, then complete Spec
  Self-Review and Adversarial Review below before human handoff; the short list
  of your calls goes into the Human Document Review handoff. That is still the
  only round of questions the builder check produces.
- In the **HARD-GATE**, "After the design doc is approved, the next step is the plan:
  invoke superpowers:writing-plans and no other skill." Instead: after either design
  size completes its applicable builder check, self-review, audit, and human document
  approval, invoke superpowers:writing-plans and no other skill. This handoff applies
  to software and non-software designs alike.

If a short design becomes project-sized, stop, explain the growth, write the full
design, complete its builder check, self-review, and a fresh audit, then obtain human
approval of the full current design. Earlier short-design review or approval does
not cover growth.

The builder check itself is unchanged: dispatch it with `builder-check-prompt.md`
as the skill says (without a subagent tool, read the document as that builder
yourself) and sort what it asks into the three piles.

### Spec Self-Review

For either design size, after its applicable builder check, review the current
document yourself for placeholders, contradictions, scope, and ambiguity.
Fix issues inline; preserve the human's decisions and label your own calls.
Then complete Adversarial Review before handing over the document.

### Adversarial Review

For either design size, use the Skill tool to load
`superpowers-audit:superpowers-audit` after spec self-review and follow its
workflow, which defines every audit rule. Supply the written design,
agreed short/full size and completeness bar, confirmed
conversational intent/decisions and human answers (in a brief if available), and
known drafting models; remain in this writer session. Complete its discussion and
report before human handoff. Present a non-approved result and ask for direction;
preserve the actual result if the human proceeds.
Audit questions about material decisions still go to the human;
the builder check's one question round does not waive that requirement.

### Human Document Review

For either design size, hand over the current design and audit report,
state the actual outcome, and include a short list of calls you made so the human
can check those while reading:

> "Spec: `<spec path>`. Audit: <actual outcome>; report: `<report path>`. My calls: <short list>. Please review the full document and report. Do you approve this design for planning?"

Wait for the human's decision. After handoff, for direct human edits or changes
they request, rerun self-review and a fresh audit before renewed handoff. Only
proceed to planning once the human approves the current written design.
