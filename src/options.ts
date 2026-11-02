import { z } from 'zod';

export interface AuditOptions {
  reviewers: Record<string, string[]>;
  maxRounds: number;
  artifactDirectory?: string;
}

export type OptionsResult =
  | { ok: true; value: AuditOptions }
  | { ok: false; message: string };

// Commas and `=` are excluded because Claude Code joins list options with commas
// and writes each reviewers entry as `writer=reviewer`.
const author = z.string().regex(/^[^\s/#,=]+\/[^\s#,=]+$/);
const reviewer = z.string().regex(/^[^\s/#,=]+\/[^\s#,=]+(?:#[^\s#,=]+)?$/);
// A chain is one reviewer or an ordered list; an exact repeat is rejected.
const chain = z.preprocess(
  value => (typeof value === 'string' ? [value] : value),
  z.array(reviewer).min(1),
).superRefine((members, ctx) => {
  const seen = new Set<string>();
  members.forEach((member, index) => {
    if (seen.has(member)) ctx.addIssue({ code: 'custom', path: [index], message: `reviewer "${member}" is listed more than once` });
    seen.add(member);
  });
});
const schema = z.object({
  reviewers: z.record(author, chain).default({}),
  maxRounds: z.number().int().positive().default(5),
  artifactDirectory: z.string().trim().min(1).optional(),
}).strict();

export function parseOptions(input: unknown): OptionsResult {
  const parsed = schema.safeParse(input);
  return parsed.success
    ? { ok: true, value: parsed.data }
    : { ok: false, message: parsed.error.issues.map(i => `${i.path.join('.') || 'options'}: ${i.message}`).join('\n') };
}
