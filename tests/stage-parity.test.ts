import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import type { SupportedSkill } from '../src/skill.js';
import { adaptSkill } from '../src/superpowers.js';
import { expected, fixture, skillIDs } from './support/fixtures.js';

// Claude Code adds each stage beside the unchanged upstream skill; OpenCode
// splices it into the body. These expectations keep the two hosts' stages aligned.
const amendment = (id: SupportedSkill) =>
  readFileSync(new URL(`../integration/claude-code/${id}.md`, import.meta.url), 'utf8');

const flat = (text: string) => text.replace(/\s+/g, ' ');

const sharedStages: Record<SupportedSkill, readonly string[]> = {
  brainstorming: [
    'Question Review',
    'Spec Self-Review',
    'Adversarial Review',
    'Human Document Review',
    'builder check',
    'self-review',
    'superpowers-audit',
    'fresh audit',
    'Do you approve this design for planning?',
    'Spec: `<spec path>`. Audit: <each reviewer\'s outcome and reviewed version>; report: `<report path>`. My calls: <short list>.',
    "each reviewer's actual outcome",
    'Clean chain approval of a question permits presentation, not an answer or design approval.',
    "builder check's one question round does not waive",
  ],
  'writing-plans': [
    'superpowers-audit',
    'fresh audit',
    'execution method',
    'Plan: `<plan path>`. Audit: <each reviewer\'s outcome and reviewed version>; report: `<report path>`. Please review both.',
    "each reviewer's actual outcome",
    "state each reviewer's actual outcome for your human partner",
    'Which execution approach would you prefer?',
    'Does the plan capture what you want?',
  ],
};

// Upstream 7.0.2 steps each amendment quotes as superseded.
const superseded: Record<SupportedSkill, readonly string[]> = {
  brainstorming: [
    "Don't hand over the document until the check is back.",
    'then hand it over with a short list of the calls you made',
    '3. Get their approval of that doc.',
    "If nothing is open when you write your first message and there's one sensible way, steps 1 to 3 happen in that message (see Your First Message).",
    'Their approval covers the approach and the design: write the short design doc as approved and go on to the plan.',
    'For a small change, the short design covers the same points in a line or two each and goes straight to your human partner, without the builder check.',
    'After the design doc is approved, the next step is the plan: invoke superpowers:writing-plans and no other skill.',
  ],
  'writing-plans': [
    'No need to re-review — just fix and move on.',
    'After saving and self-reviewing the plan, link it for your human partner to read.',
    'Plan complete and saved to `docs/superpowers/plans/<filename>.md`. Please review the plan.',
  ],
};

function expectInOrder(text: string, parts: readonly string[]) {
  let previous = -1;
  for (const part of parts) {
    const at = text.indexOf(part);
    expect(at).toBeGreaterThan(previous);
    previous = at;
  }
}

test('shared stage strings appear in both hosts', () => {
  for (const id of skillIDs) {
    for (const text of sharedStages[id]) {
      expect(expected(id)).toContain(text);
      expect(amendment(id)).toContain(text);
    }
  }
});

test('the first-message short-design route receives both reviews before approval in both hosts', () => {
  const adapted = adaptSkill('brainstorming', fixture('brainstorming')).content;
  for (const body of [adapted, expected('brainstorming'), amendment('brainstorming')]) {
    const text = flat(body);
    expect(text).toContain('save the short design before Spec Self-Review and Adversarial Review');
    expect(text).toContain('complete Question Review of the combined approach, design, and handoff presentation before showing it');
    expect(text).toContain('Then use Human Document Review to request approval of the current saved design');
    expect(text).toContain('Earlier conversational approval does not approve an unaudited document.');
  }
  const text = flat(adapted);
  expect(text).not.toContain('steps 1 to 3 happen in that message');
  expect(text).not.toContain('write the short design doc as approved and go on to the plan');
});

test('Claude Code amendments are complete on their own', () => {
  const brainstorming = amendment('brainstorming');
  expectInOrder(brainstorming, [
    '### Spec Self-Review', '### Adversarial Review', '### Human Document Review', 'Do you approve this design for planning?',
  ]);
  const applicability = flat(brainstorming.split('### When it applies\n')[1]!.split('\n### ')[0]!);
  for (const route of [
    'Both short and full written designs receive the document stages below.',
    'quick, clear task', 'skip the questions', 'authorized throwaway spike retain upstream document-stage exemptions',
  ]) {
    expect(applicability).toContain(route);
  }
  // Inspect the replacement, not the quoted upstream route it supersedes.
  expect(flat(brainstorming)).toContain('Instead: Short designs omit the builder check, then receive Spec Self-Review, Adversarial Review, and Human Document Review.');
  expectInOrder(amendment('writing-plans'), ['superpowers-audit:superpowers-audit', 'Execution Handoff']);

  for (const id of skillIDs) {
    expect(amendment(id)).toStartWith(`## superpowers-audit amendment to superpowers:${id}\n`);
    expect(amendment(id)).toContain('supersede');
    for (const step of superseded[id]) {
      expect(flat(fixture(id))).toContain(step);
      expect(flat(amendment(id))).toContain(step);
    }
  }
});

test('both authoring hosts explicitly gate short/full designs and every mandatory approaches presentation', () => {
  for (const body of [expected('brainstorming'), amendment('brainstorming')]) {
    const text = flat(body);
    expect(text).toContain('Short designs omit the builder check, then receive Spec Self-Review, Adversarial Review, and Human Document Review.');
    expect(text).toContain('Full designs complete the builder check before that sequence.');
    expect(text).toContain('agreed short/full size and completeness bar');
    expect(text).toContain('including one viable approach with reasons alternatives were ruled out');
    expect(text).toContain('before showing it');
    expect(text).toContain('including reentry');
    expect(text).toContain("writing-plans' execution-method menu is exempt");
    expect(text.toLowerCase()).toContain('menus actually presented while brainstorming is active still receive question review');
    expect(text).not.toContain('Only a project with a written design');
    expect(text).not.toContain('small change described in chat');
    expect(text).not.toContain('For software, invoke');
  }
});
