## Host dispatch: Claude Code

The superpowers-audit plugin supplies this reference with the skill; follow it
wherever the skill defers to the host dispatch reference. The auditor runs in
OpenCode, started from Claude Code's Bash tool.

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
`round<N>.log`. They are report evidence, not audit state.

### Dispatch

From the project root, run each round as one Bash call with
`run_in_background: true` and `timeout: 1860000` (31 minutes: the shell limit
below plus a minute; unattended text-prompt sessions otherwise stop background
commands after 10 minutes).

```sh
timeout 30m opencode run --agent explore -m '<provider/model#variant>' -s '<session id>' --title 'audit: <slug>' -f '<work dir>/round<N>-prompt.md' 'Your audit assignment for this round is the attached file, already delivered with this message; follow it exactly and reply in the format it specifies.' < /dev/null > '<work dir>/round<N>-reply.md' 2> '<work dir>/round<N>.log'
```

Pass the resolved model with any `#variant`. `-f` attaches the prompt, avoiding
command substitution. Where `timeout` is absent (macOS), replace `timeout 30m` with
`perl -e 'alarm shift; exec @ARGV' 1800`.
Keep `< /dev/null`; without it, `opencode run` can stall waiting for end of input
before creating the session.
Do not pass `--auto`: it would approve requests that the user's OpenCode
permissions leave to `ask`. Wait for Claude Code's completion notice; do not poll
or sleep.

If Claude Code denies the output redirections (for example into an artifact
directory outside the project), run the same command without the output
redirections, keeping `< /dev/null`. When it completes, read the background task's
output and save the reply text to `round<N>-reply.md` with the Write tool.

### Reading a round

Read `round<N>-reply.md`; commentary before `## Assessment` is normal. Exit 0,
nonempty text, or an approval heading does not establish a completed assessment:
accept a round only after the export check below. After a non-zero exit or empty
reply, also Read `round<N>.log`. Exit 124 (`timeout`), 142 (`perl`'s alarm), or a
Claude Code time-limit stop (which need not produce either) is a tool failure:
check the export, report the failure, and ask the human even if a final reply is
recoverable.

Only a verified completed reply that answers the assignment but lacks
`## Assessment` is a format problem, not non-delivery; incomplete output never is.
If a round remains, ask the auditor to restate it in the required format in the
same session and model; that follow-up counts as a round. At the limit, use the
shared skill's exhaustion rules.

### Export check

After every round, export the session and summarize it without tool output:

```sh
opencode session export '<session id>' > '<work dir>/round<N>-export.json' 2>> '<work dir>/round<N>.log'
jq -c '.messages[] | {type, file: ((.text // "") | [match("<file name=\"([^\"]+)\"").captures[0].string][0]), finish, completed: .time.completed, error, outcome, tools: [.content[]? | select(.type == "tool").state.status], text: ([.content[]? | select(.type == "text").text] | add)} | del(.[] | select(. == null or . == []))' '<work dir>/round<N>-export.json'
```

An export can be truncated despite exit 0 (as through a pipe); use only a
complete JSON document, which a `jq` parse error rules out. Without `jq`, Read the
whole file. If the redirection is denied, run the export without it, read the
complete output, and save it with the Write tool; if saving is denied too, report
that, but never resend merely because no file was saved.

In OpenCode 2.2.5, a round is a `user` message whose `file` is its prompt, then
`assistant` steps, `synthetic` continuations after an interruption, and an `idle`
record; use only this round's messages. A completed assessment needs `idle` with
`outcome: "succeeded"`, every tool `state.status` `completed`, and a last assistant
message with `finish: "stop"`, `completed`, no `error`, and complete text answering
the assignment. `executed: false` on tool parts and `completed` on tool-call steps
are normal. Anything else, such as a `length` or `unknown` finish, a missing `idle`,
or cut-off text, is insufficient even with an approval heading. A missing `idle`
record does not show that the turn is still running; do not wait on it. For another
version or shape, establish equivalent evidence; absent metadata is not success.

- `Session not found` for the dispatched ID means no session exists. Only a
  complete export shows a prompt is absent; export errors, unreadable output, or
  ambiguous identity go to the human, not a resend.
- Resend only if the round's prompt is absent and no outstanding failure or human
  cancellation requires direction first; a retry stays within the round's budget.
- If a completed assessment follows the matching prompt, recover it; recovering an
  existing reply adds no round. Keep any separate tool-failure pause.
- While the round's background command is still running, wait for its notice
  without polling, resending, or counting a round. Once it has stopped, no notice
  will come, though the auditor may still run.
- Otherwise ask the human if the prompt arrived without a reply or with incomplete,
  failed, or ambiguous completion evidence, under the shared skill's Failed-member
  rules; an interruption is not a format-repair round and does not reset the budget.

After compaction, the chain position, session ID, and round count come from the
conversation; the work files and the OpenCode sessions are evidence for
re-establishing them.

### Permissions

Claude Code's permission prompts for these commands remain the user's; nothing is
pre-authorized. The non-interactive run auto-rejects a permission it cannot ask
about, and the auditor continues; weigh its required statement of inputs it could
not examine. Auto-rejection blocks only that tool call: its shell can still read
the same file, so keeping credentials out of review rests on the assignment alone.

### Question presentation

Claude Code's native question tool is `AskUserQuestion`, with a `questions` array.
Consult its active schema/instructions for every authored field: question text,
headers, ordered option labels/descriptions, multi-selection, and any previews or
additional fields. Establish the actual CLI's free-text/other-answer mechanisms; an
SDK example does not establish them. Include all authored fields and answer
mechanisms in review context; each question in a batch is its own audit target.
