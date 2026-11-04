# Superpowers 7.0.2 fixtures

Unmodified upstream files from Jesse Vincent's
[Superpowers](https://github.com/obra/superpowers), licensed under MIT; see the
adjacent LICENSE. Release tag `v7.0.2` resolves to immutable upstream revision
`22f0b463e7a5e579904dd6211a520321035526f7`. Use that revision, not a transient
cache directory, to recover upstream provenance.

| Fixture | Upstream path | Original SHA-256 |
| --- | --- | --- |
| brainstorming.md | skills/brainstorming/SKILL.md | 2c9ca71f94886f9ca9f4aef055f7cafb3e1a9bdf3aeebf8f4cb547c69405d207 |
| writing-plans.md | skills/writing-plans/SKILL.md | a6c67c1900064347c2a329990dd3c555657c51c3ec53b259a08aa01a2c26139a |

Canonical body hashes are the `supportedHashes` baseline pins in
[`src/superpowers.ts`](../../../src/superpowers.ts). They remove only leading YAML
frontmatter and normalize CRLF to LF, preserving remaining whitespace.
`tests/expected/` contains independently edited
full bodies derived from these fixtures, under the same upstream license. These
files are test data, excluded from the package; runtime never reads them.
