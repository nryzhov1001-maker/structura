# Contributing

Structura welcomes small, well-explained contributions across code, design, tests and documentation.

## Development

```bash
npm install
npm run dev
npm test
npm run build
```

## Before opening a pull request

- Search existing issues and proposals.
- Add a focused test for parsing or transformation behavior.
- Include before/after screenshots for interface changes.
- Update documentation when public behavior changes.
- Never commit private documents, credentials or production data.
- Avoid unrelated formatting and dependency churn.

Large features should begin with an issue describing the user problem, data-loss risks, expected behavior and proposed package boundary.

## Design constraints

- Local processing is the default; remote features must be optional and explicit.
- Conversions must never silently invent or discard information.
- The core engine remains independent from React and the browser UI.
- Errors should identify the format and the smallest useful location or path.
- New formats require documented differences from the JSON data model.

## Useful first contributions

- parser edge-case fixtures;
- accessibility labels and keyboard navigation;
- better YAML error summaries;
- JSONPath tests for quoted keys;
- empty and large-document performance fixtures;
- translations of the user-facing documentation.
