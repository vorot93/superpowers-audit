## Host dispatch: Claude Code

The superpowers-audit plugin supplies this reference with the skill just loaded.
Follow it wherever the skill defers to the host dispatch reference. The auditor
runs in OpenCode, started from Claude Code's Bash tool.

### Writer identity

Take the current model ID from Claude Code's system context. The vendor is
Anthropic whichever gateway serves it (Bedrock, Vertex, and Foundry do not change
lineage), so the writer's `reviewers` key is `anthropic/<base model id>`. First
strip gateway and context forms: a Bedrock `anthropic.` prefix, with any region
prefix such as `us.`, `eu.`, or `apac.` before it, and its `-v<N>:<N>` suffix; a
Vertex `@<date>` suffix; and a context-window suffix such as `[1m]`. For example,
`us.anthropic.claude-opus-5-5-v1:0` and `claude-opus-5-5[1m]` both become
`anthropic/claude-opus-5-5`. If the ID is neither a plain model ID nor one of
these forms (for example, an unfamiliar Foundry deployment name), do not guess:
ask the human which mapping entry applies.

### Availability

Run `opencode models` and resolve the candidate's `provider/model` in its output.
The catalog lists no variants, so a `#variant` is confirmed only at dispatch; a
dispatch error naming the variant is a tool failure.

### Auditor session

Before each chain member's round 1, choose a new session ID
`ses_audit<YYYYMMDDHHMMSS><slug>`: the current UTC time, then the topic as at most
12 lowercase letters and digits. Confirm it is absent from
`opencode session list --format json`. `-s` creates or continues a session, so
never reuse an existing ID for a new audit or member; a member's follow-up rounds
reuse its own ID.

The auditor is OpenCode's `explore` agent. It cannot load skills, edit files, or
launch subagents; its shell remains available, so read-only is still an instruction.

### Work files

The work directory is `audits/work/<YYYYMMDDHHMMSS>-<slug>/` in the resolved
artifact directory, with the session ID's time and slug. Write each round's filled
assignment or follow-up prompt to `round<N>-prompt.md` there with the Write tool;
the dispatch writes the reply to `round<N>-reply.md` and diagnostics to
`round<N>.log`. These files are evidence to link from the report, not audit state.

### Dispatch

From the project root, run each round as one Bash call with
`run_in_background: true` and `timeout: 1860000` (31 minutes). The host timeout
leaves a minute beyond the shell's 30-minute limit below; an unattended text-prompt
session otherwise defaults to stopping background commands after 10 minutes.

```sh
timeout 30m opencode run --agent explore -m '<provider/model#variant>' -s '<session id>' --title 'audit: <slug>' -f '<work dir>/round<N>-prompt.md' 'Your audit assignment for this round is the attached file, already delivered with this message; follow it exactly and reply in the format it specifies.' < /dev/null > '<work dir>/round<N>-reply.md' 2> '<work dir>/round<N>.log'
```

Pass the resolved model with its `#variant`, if any. `-f` attaches the prompt
file, so the command needs no command substitution. Where `timeout` is absent
(macOS), replace `timeout 30m` with `perl -e 'alarm shift; exec @ARGV' 1800`. Keep
`< /dev/null`: without it, `opencode run` waits for end of input and can stall
before creating the session. Do not pass `--auto`: it would approve requests that
the user's OpenCode permissions leave to `ask`. Wait for Claude Code's completion
notice; do not poll or sleep.

If Claude Code denies the output redirections (for example into an artifact
directory outside the project), run the same command without the output
redirections, keeping `< /dev/null`. When it completes, read the background task's
output and save the reply text to `round<N>-reply.md` with the Write tool. The
auditor session's export, below, remains the recovery source.

### Reading a round

Read `round<N>-reply.md` with the Read tool; commentary before `## Assessment` is
normal. Prompt delivery and assessment completion are separate: exit 0, nonempty
text, or an approval heading alone establishes no completed assessment. Before
accepting any round, including a normal exit, check its session export below.

After a non-zero exit or empty reply, also Read `round<N>.log`; delivery is unknown.
Exit 124 (`timeout`), 142 (`perl`'s alarm), or a host time-limit stop requires checking
the export, reporting a tool failure, and asking the human even if a final reply is
recoverable. A host stop need not produce 124 or 142. Keep the shared skill's
Failed-member pause and round budget; incomplete output is not a format defect.

Only a verified completed reply that otherwise answers the assignment but lacks
`## Assessment` is a format problem, not non-delivery. If a round remains, ask the
auditor to restate it in the required format in the same session and model; that
follow-up counts as a round. At the limit, use the shared skill's exhaustion rules.

### Export and completion check

Export the auditor session and Read the complete file, for normal results as well
as recovery after an interrupted, killed, expired, or uncertain round:

```sh
opencode session export '<session id>' > '<work dir>/round<N>-export.json' 2>&1
```

If that redirection is denied, run `opencode session export '<session id>'`
without redirections. Read its complete output, following any truncated-output
file references, and save it to `round<N>-export.json` with the Write tool.
If saving is also denied, use the complete output to check delivery and report
the evidence-save failure; do not resend merely because no export file was saved.

OpenCode 2.2.5 CLI exports have top-level `info` and `messages`. Match this round's
prompt/attachment, then inspect its assistant messages before the next user prompt.
Do not substitute a reply from another round. A completed final assessment requires
the final assistant message's `time.completed`, `finish: "stop"`, no `error`, no
pending tools, and complete text answering the assignment. A tool-call step can
also have `time.completed`; that field alone is insufficient. Treat `length`,
`tool-calls`, `content-filter`, `error`, `unknown`, missing completion evidence, and
cut-off text as insufficient, even with an approval heading or a normal CLI exit.
For other export shapes, establish equivalent completion evidence; do not infer
CLI fields from the experimental HTTP schema or assume absent metadata means success.

- A reliable `Session not found` result establishes no session. Otherwise use only
  a successful, complete export to establish prompt absence. Export errors,
  unreadable output, or ambiguous identity require human direction, not a resend.
- resend only if the round's prompt is absent and no outstanding failure or human
  cancellation requires direction first. Retry within that round, without resetting
  the budget.
- If a completed final assessment follows the matching prompt, recover it;
  recovering an existing reply adds no round. Retain any separate tool-failure pause.
- If the host confirms the original turn is still running, wait for its completion
  notice without polling, resending, or counting another round. Client termination
  alone does not establish that the auditor stopped. Retain any tool-failure pause.
- Otherwise ask the human if the prompt arrived without a reply or with incomplete,
  failed, or ambiguous completion evidence. Follow the shared skill's Failed-member
  rules; do not charge an interruption as a format-repair round or reset the budget.

After compaction, the chain position, session ID, and round count come from the
conversation; the work files and the OpenCode sessions are evidence for
re-establishing them.

### Permissions

Claude Code's permission prompts for these commands remain the user's; nothing is
pre-authorized. A permission that the non-interactive run cannot ask about is
auto-rejected and the auditor continues; the assignment already requires it to
state any input it could not examine, so weigh that statement in the reply.
Auto-rejection blocks only that tool call, not the auditor: its shell can still
read the same file, so keeping credentials out of review rests on the assignment's
instruction alone.

### Question presentation

Claude Code's native question tool is `AskUserQuestion`, with a `questions` array.
Consult the active tool schema/instructions for question text, headers, ordered
option labels/descriptions, multi-selection behavior, and any authored previews or
additional fields. Establish the actual host's free-text/other-answer mechanisms;
an SDK example does not establish the CLI renderer's behavior. Include all authored
fields and answer mechanisms in review context. Every question in a batch has its
own target, auditor, budget and report. Prose choices receive the same complete
presentation review, including surrounding explanation and recommendation.
