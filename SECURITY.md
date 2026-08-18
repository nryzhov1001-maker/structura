# Security policy

## Reporting

Do not publish a suspected vulnerability in a public issue. Use the repository host's private vulnerability-reporting feature and include reproduction steps, affected versions and likely impact.

## Data-handling invariants

- Imported documents stay in the active browser session by default.
- No document content is included in analytics or error reporting.
- Downloads and clipboard actions require explicit user interaction.
- Future persistence features must be opt-in and clearly identify storage scope.
- Structured documents are untrusted input and must never be interpreted as executable code.

Security fixes target the latest release and the default branch while Structura is pre-1.0.
