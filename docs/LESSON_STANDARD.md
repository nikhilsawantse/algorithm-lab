# Algorithm Lesson Standard

This document defines when an Algorithm Lab lesson is complete.

## Required learning sections

Every lesson must include:

1. A one-sentence problem statement
2. Learning objectives and prerequisites
3. A plain-language mental model
4. An interactive, keyboard-accessible visualization
5. Step, play, pause, reset, and speed controls where motion is involved
6. Curated best, average, worst, and edge-case examples when applicable
7. Tested JavaScript, Python, Java, and C++ reference implementations
8. Best, average, and worst time complexity
9. Extra-space complexity
10. Relevant properties such as stability, in-place operation, completeness, or optimality
11. Practical use cases and clear limitations
12. A challenge, game, or knowledge check connected to the algorithm's mechanics

## Correctness requirements

- Reference implementations must not silently mutate inputs unless the lesson explicitly teaches mutation.
- Curated metrics shown in the interface must match the implementation.
- Empty, minimal, sorted, reversed, duplicate, negative, and deterministic random inputs must be tested when relevant.
- Language implementations must produce equivalent results.
- Explanations must distinguish guarantees from common-case behavior.

## Accessibility requirements

- All controls must be keyboard accessible.
- Important state must not depend on color alone.
- Motion must honor reduced-motion preferences.
- Dynamic explanations must use appropriate live regions.
- Visualizations must have concise screen-reader descriptions.
- Text and controls must work at mobile widths without clipping.

## Editorial style

- Prefer plain language before formal terminology.
- Introduce one new idea at a time.
- Use concrete arrays, graphs, strings, or states rather than placeholders.
- Explain when not to use an algorithm.
- Avoid claims that a technique is universally “best.”

## Definition of done

A lesson is complete only after its production build, route-rendering test, JavaScript, Python, Java, and C++ tests, responsive layout, and accessibility checklist all pass.
