# Superpowers Audit

Independent review of specifications, implementation plans, and saved questions in
OpenCode v2 and Claude Code. The plugin adds `/audit`, a shared audit skill, and automatic audit
stages for Superpowers **7.0.2** brainstorming and writing-plans skills. In both
hosts, auditors run as OpenCode's `explore` agent on the models you choose, one after another.

> Write → self-review → independent audit → human document review.

Short designs receive self-review, audit, and human approval without a builder
check; full designs complete Superpowers' builder check first. If scope grows from
short to full, the expanded design needs its builder check, renewed review and
approval. Both approved sizes hand off to writing-plans, including non-software work.
Quick tasks, question opt-outs, and authorized throwaway spikes keep their document
exemptions; choices actually presented during active brainstorming still need review.
The first-message short-design shortcut saves and reviews the design before asking
for approval; its combined approach/design presentation also receives question review.

The existing writer discusses findings with an auditor, verifies claims, applies
justified corrections, and saves a Markdown report. Material design changes go to
the human. Auditor approval does not replace human document approval.

## Installation

### OpenCode

Add the plugin to `opencode.json(c)` **after Superpowers**:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": [
    "github:obra/superpowers",
    "github:vorot93/superpowers-audit"
  ]
}
```

The package loads TypeScript directly through OpenCode's Bun runtime; installation
requires no compilation. See [Integration and limits](#integration-and-limits) for
version-scoped installation and workflow evidence.

For a local checkout, run `bun install --production` and replace the GitHub target
with its absolute package directory. Configure the directory rather than an
individual source file.

If a previously failed installation cannot be updated, rerun
`opencode plugin add <same-target>` with the exact package string from your config.
Re-adding the same target preserves its existing position in the configuration.

### Claude Code

The same repository is a Claude Code plugin and a single-plugin marketplace:

```text
/plugin marketplace add vorot93/superpowers-audit
/plugin install superpowers-audit@superpowers-audit
/plugin configure superpowers-audit@superpowers-audit
```

Configure reviewers, the round limit, and the artifact directory with
`/plugin configure` (list options are not `/config` rows). Each `reviewers` entry
is `writer-provider/model=reviewer-provider/model[#variant]`. Repeat a writer to
form an ordered reviewer chain: entries with the same writer run in entry order. The other options
match the [Configuration](#configuration) table. Run
`/audit path/to/spec-plan-or-question.md` as described under [Usage](#usage).

#### Claude Code prerequisites

- The OpenCode CLI (`opencode`) with an authorized non-Anthropic provider: the
  auditor runs as OpenCode's `explore` agent through `opencode run`.
- The Superpowers plugin, for the automatic stages.
- Linux or macOS: the plugin's hook is a POSIX `sh` script, and Windows is not
  supported.
- Unattended auditor runs auto-reject any OpenCode permission that would ask
  (including `explore`'s built-in ask before reading `*.env` files); the auditor
  reports what it could not read. Rejection blocks only that tool call: the
  auditor's shell can still read the same file, so keeping credentials out of
  review is an instruction to the auditor, not a guarantee.
- Each round uses a 30-minute shell limit and an explicit 31-minute background
  Bash timeout, avoiding Claude Code's shorter unattended default. On macOS, which
  ships `perl` but not `timeout`, the writer uses `perl` for the shell limit.
- The writer runs these commands with the Bash tool, under your Claude Code
  permission rules; approve them when asked or allow them in your settings, as
  the plugin pre-authorizes nothing: `opencode models`,
  `opencode session list --format json`,
  `timeout 30m opencode run …` (or `perl -e … opencode run …`) with its output
  redirected into that directory, and `opencode session export`. If you deny the
  redirection, the writer saves each reply or session export itself.
- The writer's `reviewers` key is `anthropic/<base model id>`, with gateway and
  context-window forms such as Bedrock `us.anthropic.…-v1:0`, Vertex `@<date>`, and
  `[1m]` stripped, to match OpenCode's `anthropic/<model>` keys. If your writer IDs
  normalize differently in the two hosts, repeat the chain's entries for each writer form.

## Usage

Run `/audit path/to/spec-plan-or-question.md` in the writer's session after self-review.
Provide confirmed intent, governing decisions and human answers, and known drafting
models; a brief file is optional. A plan also needs its approved specification.
Missing inputs or an ambiguous path prompt clarification.

Each reviewer in the chain, in turn, starts a fresh blind `explore` auditor session
(OpenCode's built-in read-only exploration agent; it cannot edit files or launch
subagents, though read-only is still an instruction rather than a sandbox). It
receives the current, already revised target but not earlier reviewers' findings.
Follow-ups continue that reviewer's session and model, with its own `maxRounds`
limit (default five calls). A reviewer's turn ends at approval or exhausted rounds,
and the chain continues either way. The writer reports each reviewer's outcome with
the version it reviewed, links the reviewed document and saved report, and asks for
the human's decision.
After handoff, direct human edits or changes they request receive self-review and
a fresh audit.

In Claude Code, the writer checks the auditor's session export before accepting
each round, including a normal CLI exit. It exports to a file and reads a `jq`
summary that omits the auditor's tool output; without `jq` it reads the whole
export. A delivered prompt, tool-call message, or approval heading does not
establish a completed assessment. Acceptance requires the round's final-message
completion evidence, a succeeded end-of-turn record, and a complete answer, from a
complete export. The writer waits only while the dispatch command itself is still
running; incomplete or uncertain completion goes to the human under the
Failed-member rules. Recovering an existing final reply consumes no extra round;
only a completed answer with a genuine format defect can need a counted restatement.

### Question targets

A manual `/audit` can review a saved question outside brainstorming too. Save the
complete proposed presentation: question/header, ordered choices and descriptions,
surrounding explanation, trade-offs, recommendation, previews, selection behavior,
and relevant goals, prior answers, sources and drafting contributors. The shared
workflow stores question evidence in `questions/` and a distinct report in `audits/`.
Each question runs the whole reviewer chain with fresh sessions and per-reviewer
round budgets, including questions in a native batch.

Present the reviewed version only after clean chain approval, a match with the
reviewed baseline, and a saved report. Changed
authored fields, selection behavior or context invalidate presentation approval;
changes after a completed audit require a fresh review. If review cannot finish or
the report cannot be saved, the writer withholds choices and asks openly for
direction. You may explicitly request that question anyway: it is shown with the
actual review status, unresolved concerns and any save failure. That override is
recorded separately; it neither claims auditor approval nor waives later questions.

The automatic Question Review stage loads the shared skill before brainstorming presentations of
multiple explicit alternatives and every mandatory approaches discussion, including
one viable approach with reasons others were rejected. Ordinary single suggestions,
open questions, the lightweight upstream opt-out offer, and ordinary yes/no offers
of recon, a throwaway spike or the visual companion are exempt. Comparing substantive
alternatives or their trade-offs triggers review. Loading the skill for a plan
audit does not add review to its execution-method menu. A question audit may run
while a document or question audit is paused, with serialized calls and distinct
sessions, budgets and reports. The writer retains every paused parent and resumes
the immediate parent after obtaining your actual answer, then works outward.

Every chain member must differ in **both provider and model family/class** from
every known drafting contributor and the current writer; members may share a vendor
with each other. Variants, aliases, or gateways
serving the same underlying vendor/family do not establish independence. Unknown
authorship or lineage requires clarification, and a writer-model switch triggers
a new independence check.

Without a reviewer mapping or explicit human selection, the writer asks you for
one or more reviewer models in order. It resolves availability from OpenCode's model catalog: native
`opencode.models` in OpenCode, the `opencode models` command in Claude Code. A model
named only in a document does not authorize its use.

## Configuration

In OpenCode, use the object form to set options; Claude Code uses
`/plugin configure` as [described above](#claude-code). These model references are
placeholders; replace them with explicit choices from your OpenCode model catalog.

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": [
    "github:obra/superpowers",
    {
      "package": "github:vorot93/superpowers-audit",
      "options": {
        "reviewers": {
          "provider/writer-model": ["other/reviewer-model#high", "another/reviewer-model"]
        },
        "maxRounds": 5
      }
    }
  ]
}
```

| Option | Default | Meaning |
| --- | --- | --- |
| `reviewers` | `{}` | User-selected reviewer chains keyed by drafting `provider/model`, without its variant. Each value is a reviewer string or a non-empty array of them, in chain order; the same reviewer string twice in one chain is rejected. Reviewers accept an optional `#variant`; model IDs may contain `/`, but entries cannot contain commas or `=`. Candidates must still satisfy independence and availability checks. |
| `maxRounds` | `5` | Integer from 1 to 9007199254740991 (JavaScript's maximum safe integer) per reviewer per target counting the initial auditor call and every explicit follow-up, including clarifications. Native retries and reading existing replies do not add rounds. |
| `artifactDirectory` | Project convention | Nonempty path for audit artifacts. Relative paths resolve from the writer's project root; reports go in `audits/` beneath it. When omitted, the writer uses the project's `.superpowers` link or stated convention, asking when unclear. |

Invalid or unknown options produce a visible correction request before dispatch
rather than silently activating defaults.

Both hosts reject Unicode whitespace in model references and trim it from the
ends of `artifactDirectory`. Claude Code hook context has a 10,000-byte budget
(conservatively within its character cap). Oversized context produces a complete
correction notice: shorten the configured mappings or directory, then reload the
skill. If defaults also exceed the budget, the plugin's reference or amendment
needs shortening.

## Integration and limits

In OpenCode, automatic integration checks each skill independently against the
exact supported Superpowers 7.0.2 body, normalizing CRLF line endings. Package
version is not checked: an identical skill body from another release also matches,
even when that release's other skill does not. Changed or customized definitions
retain their content with an **Audit integration unavailable** notice; missing
skills stay absent. Check plugin order and the status in the shared audit skill
when integration is unavailable. Installed Superpowers files are never modified.

In Claude Code, the audit stages are added beside the upstream skill rather than
spliced into it: when `superpowers:brainstorming` or `superpowers:writing-plans`
loads through the Skill tool or is typed as a slash command, the plugin adds an
amendment that names the upstream steps it supersedes. There is no body check, so
the stages are added for any Superpowers version, but the amendments are written
against Superpowers 7.0.2 and may misdescribe the steps of other releases, earlier
or later.

Claude Code re-attaches invoked skill bodies after compaction but not hook output,
so on compaction the plugin adds a pointer telling the writer to reload the
Superpowers authoring skill and the shared audit skill with the Skill tool, then
continue where it was rather than restart the authoring checklist. Recovery relies
on the writer obeying it and on the shared skill's interruption rules; it is not
enforced and has not been verified in a live session.

Manual `/audit` remains usable independently of automatic integration when its
command and shared skill are loaded and permitted. In OpenCode, registry
integration status is separate from native permission denials.

The writer runs the audit using ordinary native tools and permissions. Model
independence, round limits, read-only auditing, and human gates are instructions,
not programmatic enforcement or an additional sandbox. The complete workflow and
report templates live in the [shared skill](skills/superpowers-audit/SKILL.md).

**Verification scope:**

The native runs below predate the routine-offer and nested-question clarifications.

- Older GitHub installation and native registration were verified on OpenCode
  **2.0.15**, before the Superpowers 7.0.0 adaptation. Earlier selected live audits
  do not establish acceptance of the current authoring bodies.
- The initial Superpowers 7.0.1 integration was registry-verified on OpenCode **2.2.1**
  using a production-only local tarball: complete adapted skill bodies and exact
  upstream paths, the shared skill with its OpenCode dispatch reference naming
  `explore`, and three skill/command reloads. This check uses no model.
- Live on OpenCode 2.2.1, manual question auditing saved an Approved report and
  presented the exact reviewed prose. Automatic brainstorming loaded the then-current
  stages, dispatched native `explore` with `xai/grok-4.7#xhigh`, corrected an
  auditor finding, and obtained verification in the same auditor session. A later
  controlled title change received a fresh auditor session and distinct report;
  the final prose matched the saved target and report snapshot exactly.
- Live on Claude Code **2.1.312**, both Skill-tool and typed-command brainstorming
  loads delivered the then-current amendment. After explicitly authorized scoped probe
  permissions, the writer used the shipped background `opencode run -f` dispatch
  with closed stdin for three rounds, corrected findings, saved an Approved report,
  and presented its exact reviewed prose without repeating the completed audit.
- Auditor searches in both automatic-authoring probes exposed earlier report or
  transcript excerpts despite scope instructions; native tools do not enforce that
  boundary. These runs establish dispatch, revision and presentation behavior,
  not strict isolation from earlier reviews.
- Earlier, in Claude Code with the plugin loaded by `--plugin-dir`, manual `/audit`
  ran two auditor rounds to Approved and saved its report. It used the shipped `-f`
  dispatch with stdin closed and saved round prompt and reply files; the fallback of
  saving a reply with the Write tool when output is not redirected was exercised.
  The automatic stages appeared after a typed `/superpowers:writing-plans` and after
  a Skill-tool load of `superpowers:brainstorming`. Both `/audit` and
  `/superpowers-audit:audit` resolve and deliver the dispatch reference and
  configuration.
- Reviewer chains were registry-verified on OpenCode **2.2.5** with no model, for a
  string-form plugin entry with default options and for a configured two-member
  chain rendered as an array.
- Superpowers **7.0.2** was registry-verified on OpenCode **2.2.5** from a
  production-only local tarball, with default and configured options: complete
  adapted authoring bodies, the complete shared skill and configuration, exact
  upstream paths, `/audit` registration, and three reloads. No model was used.
- Live on Claude Code **2.1.316** with `--plugin-dir`, repeated `reviewers` entries
  arrived in entry order. A manual `/audit` of a spec with a seeded contradiction
  ran a two-member chain (`xai/grok-4.7#xhigh`, then `openai/gpt-6-astra#high`) with
  `maxRounds` 1. The first member's single round ended Changes Required. The writer
  applied the accepted fixes, and the second member reviewed the revision in a fresh
  session. Its prompt carried no earlier findings, and its only tool call read the
  target. It approved. The report listed both members in order with versions, and
  the handoff stated clean chain approval.

**Live verification limit:** not exercised live are interactive native question UI,
question batches and question chains, explicit overrides, a chain in OpenCode, the
Failed-member pause, the last member exhausting its budget, question status lines,
report-save failure,
routine-offer exemptions, paused enclosing document or question audits,
compaction recovery, and oversized-context recovery; a round expiring (exit 124 or
142) under the shipped reference, though expiry, session export, and resend
were exercised manually during development; the Superpowers 7.0.2 first-message
short-design shortcut; complete automatic Superpowers 7.0.2
spec and plan authoring, audit, and handoff in either host; and renewed document
audits after actual human edits or requested changes. The question-revision probe
used a controller-authored instruction. Unit/package tests, registry checks, and
interpretation scenarios do not close these gaps.

The completion gate's CLI fields were checked on existing OpenCode 2.2.5 session
exports, one with a provider transport failure: tool-call steps and final replies
both carry `time.completed` with different `finish` values, each round ends with an
`idle` record (`succeeded` or `failed`), and completed tool parts report
`executed: false`. OpenCode 2.2.1 auditor exports also show settled `error` tool
parts (missing paths) in rounds that still ended `succeeded`, so a recovered tool
error does not refuse a round. The reference's `jq` summary was checked on those
shapes. This verifies the CLI export shape, not live recovery from interruption,
token-limit truncation, or a client disconnect with a still-running auditor; nor
whether Claude Code's Bash tool truncates an export captured without redirection.

## Development

```sh
bun install
bun run test
bun run typecheck
bun run test:package
bun run test:claude
```

`test:claude` runs `claude plugin validate .` and needs the `claude` CLI. The unit
suite needs `jq` to check the Claude Code reference's export summary.

Package tests exercise a source-only tarball with production dependencies. To
distribute one after these checks, run
`bun pm pack --destination <artifact-directory>`. A consumer can install it with
`bun add /absolute/path/to/the.tgz` and configure the installed package directory.

See [AGENTS.md](AGENTS.md) for maintenance and verification conventions and
[DESIGN.md](DESIGN.md) for architectural decisions.

## Licensing

This project is licensed under [Apache-2.0](LICENSE). Superpowers instruction
excerpts and fixtures are derived from Jesse Vincent's MIT-licensed Superpowers.
See [NOTICE](NOTICE) and the [fixture attribution](tests/fixtures/superpowers-7.0.2/README.md).
