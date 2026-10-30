import { createHash } from 'node:crypto';
import type { SupportedSkill } from './skill.js';

export interface SkillAdaptation {
  status: 'integrated' | 'incompatible';
  content: string;
  reason?: string;
}

// Superpowers 7.0.1 bodies live only in attributed tests. Normalize only CRLF.
export const supportedHashes: Record<SupportedSkill, { baseline: string; transformed: string }> = {
  brainstorming: {
    baseline: '8e43c8181a17642ac8c8b6e1c3fa29294ef5d3fa64f67eaa917ff709298a0b96',
    transformed: '621f59c0cf5d19780447e0d40d3eeeefda4394a69bcad24d7cb7187eb9b75288',
  },
  'writing-plans': {
    baseline: '1fa01b954171b1d2b8bc0208dfbc6a01edf8a2ca715d18f76f043952e37e744f',
    transformed: 'b69c375817015fb0c382f7b5e2c2514f9974947cebafc5bfd8b4b1373ae8df65',
  },
};

const edits: Record<SupportedSkill, readonly (readonly [string, string])[]> = {
  brainstorming: [
    [
      '3. Get their approval of that doc.',
      '3. Complete the applicable builder check, Spec Self-Review, and Adversarial\n'
        + '   Review, then get their approval of the current doc (see Human Document Review).',
    ],
    [
      '## Look Before You Ask',
      '## Question Review\n\n'
        + 'Throughout active brainstorming, including reentry, load the native\n'
        + '`superpowers-audit` skill before presenting a question or decision presentation\n'
        + 'that offers or compares two or more explicit alternatives, in a tool or prose.\n'
        + 'Also review every **Lay out the approaches** presentation before showing it,\n'
        + 'including one viable approach with reasons alternatives were ruled out.\n'
        + "Follow the shared skill's question workflow for self-review, saved presentation,\n"
        + 'independent review, report, version matching, and explicit per-question overrides.\n'
        + 'Question approval permits presentation, not an answer or design approval.\n\n'
        + 'Keep open questions and ordinary single recommendations or size suggestions;\n'
        + 'they need no question audit unless they compare alternatives or are the mandatory\n'
        + 'approaches presentation. The upstream one-line opt-out offer and ordinary yes/no\n'
        + 'offers of recon, a throwaway spike, or the visual companion need no question audit.\n'
        + 'If an offer compares substantive alternatives or their trade-offs, review it;\n'
        + 'the mandatory approaches presentation always requires review.\n'
        + 'Quick-task, question opt-out, and throwaway-spike routes\n'
        + 'retain their document-stage exemptions; menus actually presented while\n'
        + 'brainstorming is active still receive Question Review. This stage includes builder\n'
        + 'and audit clarifications, including questions needed by another question audit;\n'
        + "follow the shared skill's enclosing-audit rules.\n"
        + "It ends at the handoff to planning: writing-plans'\n"
        + 'execution-method menu is exempt. Reentry into brainstorming restores this stage.\n\n'
        + '## Look Before You Ask',
    ],
    [
      '**Lay out the approaches.** Once you understand what they want, and',
      '**Lay out the approaches.** Complete Question Review before presenting this message,\n'
        + 'including when only one approach is viable. Once you understand what they want, and',
    ],
    [
      'If it grows mid-task, stop, say so, and step up a size.',
      'If it grows mid-task, stop, say so, and step up a size.\n'
        + 'If a short design becomes project-sized, write the full design, complete its\n'
        + 'builder check, self-review, and a fresh audit, then obtain human approval of the\n'
        + 'full current design. Earlier short-design review or approval does not cover growth.',
    ],
    [
      'For a small change, the short design covers the same points in a line\n'
        + 'or two each and goes straight to your human partner, without the\nbuilder check.',
      'For a small change, the short design covers the same points in a line or two each.\n'
        + 'Short designs omit the builder check, then receive Spec Self-Review,\n'
        + 'Adversarial Review, and Human Document Review. Full designs complete the builder\n'
        + "check before that sequence. Honor the human's size override and assess completeness\n"
        + 'at the agreed size; do not inflate a short design merely to satisfy review.',
    ],
    [
      "may come back once with a few questions. Don't hand over the document\n"
        + 'until the check is back. Sort what the builder asks into three piles:',
      'may come back once with builder questions; additional audit questions are possible.\n'
        + "Don't hand over the document until the builder check, self-review, and audit\n"
        + 'are complete. Sort what the builder asks into three piles:',
    ],
    [
      'document with their answers, then hand it over with a short list of the\n'
        + "calls you made so they can check those while reading. That's the only\n"
        + 'round of questions the check produces. Without a subagent tool, read the\n'
        + 'document as that builder yourself.',
      'document with their answers, then complete self-review and adversarial review\n'
        + 'before human handoff. That is the only round of questions the builder check produces.\n'
        + 'Without a subagent tool, read the document as that builder yourself.',
    ],
    [
      '<HARD-GATE>',
      '## Spec Self-Review\n\n'
        + 'For either design size, after its applicable builder check, review the current\n'
        + 'document yourself for placeholders, contradictions, scope, and ambiguity.\n'
        + "Fix issues inline; preserve the human's decisions and label your own calls.\n"
        + 'Then complete Adversarial Review before handing over the document.\n\n'
        + '## Adversarial Review\n\n'
        + 'For either design size, load the native `superpowers-audit` skill after spec\n'
        + 'self-review. Supply the written design, agreed short/full size and completeness bar,\n'
        + 'confirmed conversational intent/decisions and human answers (in a brief if available),\n'
        + 'and known drafting models; remain in this writer session.\n'
        + 'Complete its discussion and report before human handoff.\n'
        + 'Present a non-approved result and ask for direction; preserve the actual result\n'
        + 'if the human proceeds. Audit questions about material decisions still go to the human;\n'
        + "the builder check's one question round does not waive that requirement.\n\n"
        + '## Human Document Review\n\n'
        + 'For either design size, hand over the current design and audit report,\n'
        + 'state the actual outcome, and include a short list of calls you made so the human\n'
        + 'can check those while reading:\n\n'
        + '> "Spec: `<spec path>`. Audit: <actual outcome>; report: `<report path>`. My calls: <short list>. Please review the full document and report. Do you approve this design for planning?"\n\n'
        + "Wait for the human's decision. After handoff, for direct human edits or changes they request,\n"
        + 'rerun self-review and a fresh audit before renewed handoff. Only proceed to\n'
        + 'planning once the human approves the current written design.\n\n'
        + '<HARD-GATE>',
    ],
    [
      'After the design doc is approved, the next step is the plan: invoke\n'
        + 'superpowers:writing-plans and no other skill.',
      'After either design size completes its applicable builder check, self-review,\n'
        + 'audit, and human document approval, invoke superpowers:writing-plans and no other\n'
        + 'skill. This handoff applies to software and non-software designs alike.',
    ],
  ],
  'writing-plans': [
    [
      'If you find issues, fix them inline. No need to re-review — just fix and move on. If you find a spec requirement with no task, add the task.',
      'If you find issues, fix them inline. If you find a spec requirement with no task, add the task. Then complete the Adversarial Review stage below.',
    ],
    [
      '## Execution Handoff',
      '## Adversarial Review\n\n'
        + 'After completing self-review, load the native `superpowers-audit` skill. Supply\n'
        + 'the plan, approved governing spec/amendments, relevant decisions, and known drafting models.\n'
        + 'Run its conversation in this writer session and write its report before handoff.\n'
        + 'Present the actual outcome and ask for direction when it is not Approved.\n\n'
        + '## Execution Handoff',
    ],
    [
      'After saving and self-reviewing the plan, link it for your human partner\nto read.',
      'After saving, self-reviewing, and auditing the plan, link the current plan\n'
        + 'and audit report and state the actual outcome for your human partner.',
    ],
    [
      '**"Plan complete and saved to `docs/superpowers/plans/<filename>.md`. Please review the plan. Which execution approach would you prefer?**',
      '**"Plan: `<plan path>`. Audit: <actual outcome>; report: `<report path>`. Please review both. Which execution approach would you prefer?**',
    ],
    [
      '**"Plan complete and saved to `docs/superpowers/plans/<filename>.md`. Please review the plan. Does it capture what you want?"**',
      '**"Plan: `<plan path>`. Audit: <actual outcome>; report: `<report path>`. Please review both. Does the plan capture what you want?"**',
    ],
    [
      '## Execution Handoff',
      '## Execution Handoff\n\n'
        + 'After handoff, direct human edits or changes they request receive self-review and\n'
        + 'a fresh audit before renewed handoff. Preserve an already selected execution\n'
        + 'method and wait for approval of the revised plan.',
    ],
  ],
};

function replaceOnce(text: string, from: string, to: string): string {
  const first = text.indexOf(from);
  if (first < 0 || text.indexOf(from, first + from.length) >= 0) {
    throw new Error('Invalid supported Superpowers edit anchor');
  }
  return text.slice(0, first) + to + text.slice(first + from.length);
}

const hash = (text: string) => createHash('sha256').update(text).digest('hex');

export function adaptSkill(id: SupportedSkill, content: string): SkillAdaptation {
  const normalized = content.replaceAll('\r\n', '\n');
  const digest = hash(normalized);
  const known = supportedHashes[id];
  if (digest === known.transformed) return { status: 'integrated', content: normalized };
  if (digest !== known.baseline) {
    return {
      status: 'incompatible',
      content: withIntegrationNotice(id, content, 'Unsupported Superpowers definition.'),
      reason: 'Unsupported Superpowers definition.',
    };
  }
  const transformed = edits[id].reduce((text, [from, to]) => replaceOnce(text, from, to), normalized);
  if (hash(transformed) !== known.transformed) throw new Error(`Unexpected transformed body: ${id}`);
  return { status: 'integrated', content: transformed };
}

export function withIntegrationNotice(id: SupportedSkill, content: string, reason: string): string {
  const marker = `<!-- superpowers-audit:unavailable:${id} -->`;
  const notice = (message: string) => `${marker}\n## Audit integration unavailable\n`
    + `Tell the human that automatic audit integration for ${id} is unavailable\n`
    + `for this definition. Reason: ${message}\n`
    + 'Its original workflow follows unchanged. Manual `/audit` remains available after\n'
    + 'self-review when the command and shared audit skill are loaded and permitted.\n'
    + 'Automatic integration requires a supported Superpowers definition.\n\n';
  const reasons = [reason, 'Unsupported Superpowers definition.',
    'Automatic adaptation failed; see native plugin diagnostics.'];
  if (reasons.some(message => content.replaceAll('\r\n', '\n').startsWith(notice(message)))) return content;
  return notice(reason) + content;
}
