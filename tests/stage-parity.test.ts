import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import type { SupportedSkill } from '../src/skill.js';
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
    'Spec: `<spec path>`. Audit: <actual outcome>; report: `<report path>`. My calls: <short list>.',
    "builder check's one question round does not waive",
  ],
  'writing-plans': [
    'superpowers-audit',
    'fresh audit',
    'execution method',
    'Plan: `<plan path>`. Audit: <actual outcome>; report: `<report path>`. Please review both.',
    'Which execution approach would you prefer?',
    'Does the plan capture what you want?',
  ],
};

// Upstream 7.0.1 steps each amendment quotes as superseded.
const superseded: Record<SupportedSkill, readonly string[]> = {
  brainstorming: [
    "Don't hand over the document until the check is back.",
    'then hand it over with a short list of the calls you made',
    '3. Get their approval of that doc.',
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
