import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { adaptSkill, supportedHashes, withIntegrationNotice } from '../src/superpowers.js';
import { expected, fixture, mutateSentence, skillIDs } from './support/fixtures.js';

const hash = (text: string) => createHash('sha256').update(text).digest('hex');

test('fixture provenance retains the immutable upstream revision and complete-file digests', () => {
  const root = new URL('./fixtures/superpowers-7.0.1/', import.meta.url);
  const provenance = readFileSync(new URL('README.md', root), 'utf8');
  expect(provenance).toContain('https://github.com/obra/superpowers');
  expect(provenance).toContain('2ce8aa15d05bd57213e6f746f953aafb7ded7a8b');
  for (const id of skillIDs) {
    const raw = readFileSync(new URL(`${id}.md`, root));
    const digest = createHash('sha256').update(raw).digest('hex');
    const row = provenance.split('\n').find(line => line.startsWith(`| ${id}.md |`));
    expect(row).toContain(digest);
  }
});

for (const [id, from, to] of [
  ['brainstorming', 'You are very good at building.', 'You are very good at local building.'],
  ['writing-plans', '## Overview', '## Local overview'],
] as const) {
  test(`${id}: intentional mutation changes exactly one known sentence`, () => {
    expect(mutateSentence(id, fixture(id))).toBe(fixture(id).replace(from, to));
    expect(() => mutateSentence(id, 'Unrelated body.')).toThrow(`${id}: mutation anchor must occur exactly once`);
    expect(() => mutateSentence(id, `${from}\n${from}`)).toThrow(`${id}: mutation anchor must occur exactly once`);
  });
}

for (const id of skillIDs) {
  const body = fixture(id);
  const golden = expected(id);

  test(`${id}: exact complete transform, CRLF, and repeat application`, () => {
    expect(hash(body)).toBe(supportedHashes[id].baseline);
    expect(hash(golden)).toBe(supportedHashes[id].transformed);
    expect(adaptSkill(id, body)).toEqual({ status: 'integrated', content: golden });
    expect(adaptSkill(id, golden)).toEqual({ status: 'integrated', content: golden });
    expect(adaptSkill(id, body.replaceAll('\n', '\r\n')).content).toBe(golden);
    expect(adaptSkill(id, golden.replaceAll('\n', '\r\n')).content).toBe(golden);
  });

  for (const [name, changed] of [
    ['appended requirement', body + '\nAdditional project requirement.\n'],
    ['same-ID replacement', 'Use this project-specific workflow instead.\n'],
    ['audit words', 'This body mentions superpowers-audit but is not supported.\n'],
    ['marker only', `<!-- superpowers-audit:unavailable:${id} -->\n${body}`],
    ['unknown CRLF', '# Local workflow\r\nKeep these bytes.\r\n'],
    ['one changed sentence', mutateSentence(id, body)],
  ]) {
    test(`${id}: ${name} stays incompatible with original bytes below one notice`, () => {
      const notice = `<!-- superpowers-audit:unavailable:${id} -->\n`
        + '## Audit integration unavailable\n'
        + `Tell the human that automatic audit integration for ${id} is unavailable\n`
        + 'for this definition. Reason: Unsupported Superpowers definition.\n'
        + 'Its original workflow follows unchanged. Manual `/audit` remains available after\n'
        + 'self-review when the command and shared audit skill are loaded and permitted.\n'
        + 'Automatic integration requires a supported Superpowers definition.\n\n';
      const once = adaptSkill(id, changed!);
      expect(once).toEqual({
        status: 'incompatible', content: notice + changed,
        reason: 'Unsupported Superpowers definition.',
      });
      expect(adaptSkill(id, once.content)).toEqual(once);
    });
  }

  test(`${id}: complete failure notices stay single and never mark an unknown body integrated`, () => {
    const reason = 'Automatic adaptation failed; see native plugin diagnostics.';
    const once = withIntegrationNotice(id, body, reason);
    expect(once.endsWith('\n\n' + body)).toBe(true);
    expect(withIntegrationNotice(id, once, reason)).toBe(once);
    expect(adaptSkill(id, once).status).toBe('incompatible');
    expect(adaptSkill(id, once).content).toBe(once);
    const crlf = once.replaceAll('\n', '\r\n');
    expect(withIntegrationNotice(id, crlf, reason)).toBe(crlf);
  });
}

test('transformed handoffs include actual outcomes, reports, and renewed review after human edits', () => {
  const spec = adaptSkill('brainstorming', fixture('brainstorming')).content;
  const plan = adaptSkill('writing-plans', fixture('writing-plans')).content;
  expect(spec).toContain('Spec: `<spec path>`. Audit: <actual outcome>; report: `<report path>`.');
  expect(spec).toContain('rerun self-review and a fresh audit before renewed handoff');
  expect(plan).toContain('receive self-review and\na fresh audit before renewed handoff');
  for (const ending of ['Which execution approach would you prefer?**', 'Does the plan capture what you want?"**']) {
    expect(plan).toContain('**"Plan: `<plan path>`. Audit: <actual outcome>; report: `<report path>`. Please review both. ' + ending);
  }
});

test('written designs preserve the builder check before writer review and audit', () => {
  const content = adaptSkill('brainstorming', fixture('brainstorming')).content;
  const builder = content.indexOf('**Builder check** (for a project):');
  const selfReview = content.indexOf('## Spec Self-Review');
  const audit = content.indexOf('## Adversarial Review');
  const handoff = content.indexOf('## Human Document Review');
  expect(builder).toBeGreaterThan(0);
  expect(selfReview).toBeGreaterThan(builder);
  expect(audit).toBeGreaterThan(selfReview);
  expect(handoff).toBeGreaterThan(audit);
  expect(content).toContain('`builder-check-prompt.md` in this directory');
  expect(content).toContain('That is the only round of questions the builder check produces.');
});

test('document review preserves quick-task, opt-out, and spike routes', () => {
  const original = fixture('brainstorming');
  const content = adaptSkill('brainstorming', original).content;
  for (const [start, end] of [
    ['- **Everything that matters', 'Before you start implementing'],
    ['- **They didn\'t:**', "That's the whole message."],
    ['**Spike to feel things out.**', '## Play It Back'],
    ['<HARD-GATE>', 'After the design doc is approved'],
  ]) {
    const from = original.indexOf(start!);
    const to = original.indexOf(end!, from);
    expect(from).toBeGreaterThanOrEqual(0);
    expect(to).toBeGreaterThan(from);
    expect(content).toContain(original.slice(from, to));
  }
});

test('builder promise scopes its one return to builder questions, not audit questions', () => {
  const content = adaptSkill('brainstorming', fixture('brainstorming')).content;
  expect(content).toContain('may come back once with builder questions; additional audit questions are possible.');
  expect(content).toContain('Audit questions about material decisions still go to the human;');
  expect(content).toContain('Without a subagent tool, read the document as that builder yourself.');
});

test('short designs skip only the builder, and both sizes reach reviewed human handoff', () => {
  for (const content of [expected('brainstorming'), adaptSkill('brainstorming', fixture('brainstorming')).content]) {
    const flat = content.replace(/\s+/g, ' ');
    expect(flat).toContain('Short designs omit the builder check, then receive Spec Self-Review, Adversarial Review, and Human Document Review.');
    expect(flat).toContain('Full designs complete the builder check before that sequence.');
    expect(flat).toContain('agreed short/full size and completeness bar');
    expect(flat).toContain('builder check, self-review, and a fresh audit, then obtain human approval of the full current design');
    expect(flat).not.toContain('goes straight to your human partner, without the builder check');
    expect(flat).not.toContain('For software, invoke superpowers:writing-plans');
    expect(flat).toContain('This handoff applies to software and non-software designs alike.');
  }
});

test('brainstorming loads question review before even a single mandatory approach is presented', () => {
  for (const content of [expected('brainstorming'), adaptSkill('brainstorming', fixture('brainstorming')).content]) {
    const flat = content.replace(/\s+/g, ' ');
    expect(content.indexOf('## Question Review')).toBeLessThan(content.indexOf('## Look Before You Ask'));
    expect(flat).toContain('Throughout active brainstorming, including reentry, load the native `superpowers-audit` skill before presenting');
    expect(flat).toContain('**Lay out the approaches.** Complete Question Review before presenting this message, including when only one approach is viable.');
    expect(flat).toContain("writing-plans' execution-method menu is exempt");
    expect(flat).toContain('menus actually presented while brainstorming is active still receive Question Review');
  }
});

test('plan self-review fixes missing tasks before audit dispatch', () => {
  const content = adaptSkill('writing-plans', fixture('writing-plans')).content;
  expect(content).toContain('If you find issues, fix them inline. If you find a spec requirement with no task, add the task. Then complete the Adversarial Review stage below.');
  expect(content).toContain('relevant decisions, and known drafting models.');
});

test('renewed plan audit is triggered by human changes after handoff, not auditor feedback', () => {
  const content = adaptSkill('writing-plans', fixture('writing-plans')).content;
  expect(content).toContain('After handoff, direct human edits or changes they request receive self-review and\na fresh audit before renewed handoff.');
});
