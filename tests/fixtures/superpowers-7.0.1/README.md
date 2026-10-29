# Superpowers 7.0.1 fixtures

Unmodified upstream files from Jesse Vincent's
[Superpowers](https://github.com/obra/superpowers), licensed under MIT; see the
adjacent LICENSE. The captured package manifest declares version 7.0.1; its
package lock resolves immutable upstream revision
`2ce8aa15d05bd57213e6f746f953aafb7ded7a8b`. Use that revision, not the package
version or a transient cache directory, to recover upstream provenance.

| Fixture | Upstream path | Original SHA-256 |
| --- | --- | --- |
| brainstorming.md | skills/brainstorming/SKILL.md | 61a7ef918652108c76a3fd01e02dd92d39996c6b46d4cb2819cbd03f6c45e46a |
| writing-plans.md | skills/writing-plans/SKILL.md | a6c67c1900064347c2a329990dd3c555657c51c3ec53b259a08aa01a2c26139a |

Canonical body hashes are the `supportedHashes` baseline pins in
[`src/superpowers.ts`](../../../src/superpowers.ts). They remove only leading YAML
frontmatter and normalize CRLF to LF, preserving remaining whitespace.
`tests/expected/` contains independently edited
full bodies derived from these fixtures, under the same upstream license. These
files are test data, excluded from the package; runtime never reads them.
