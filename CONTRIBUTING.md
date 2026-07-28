# Contributing to Algorithm Lab

Thank you for helping make algorithm education freely available.

## Before starting

1. Check [ROADMAP.md](./ROADMAP.md) and existing issues.
2. Read [docs/LESSON_STANDARD.md](./docs/LESSON_STANDARD.md).
3. Keep one pull request focused on one lesson or platform improvement.
4. For a new lesson, propose its mental model, visualization, examples, and challenge before building the full page.
5. Put lesson content in `lib/lessons/<lesson-slug>.ts` using the shared `defineLesson` schema.

## Local setup

```bash
pnpm install
pnpm dev
```

## Required checks

```bash
pnpm build
pnpm test
pnpm test:python
pnpm test:java
pnpm test:cpp
```

## Contribution checklist

- [ ] Explanations are original, accurate, and written in plain language.
- [ ] JavaScript, Python, Java, and C++ implementations agree.
- [ ] Edge cases and deterministic random inputs are tested.
- [ ] The visualization works with keyboard and touch input.
- [ ] State is communicated with labels or shapes as well as color.
- [ ] Reduced-motion preferences are respected.
- [ ] Complexity claims and example metrics are verified.
- [ ] The lesson explains both practical uses and limitations.
- [ ] No paid, proprietary, or copied study material was added.

## Community expectations

Be patient, specific, and respectful. Teaching quality matters more than clever code. Corrections should explain the underlying issue and help contributors learn.

By contributing, you agree that code is provided under the MIT License and original educational content is provided under CC BY 4.0.
