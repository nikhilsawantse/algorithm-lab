# Algorithm Lab

Algorithm Lab is a free, open learning platform for understanding algorithms through interactive visualizations, tested implementations, guided examples, and small challenges.

There are no accounts, paid tiers, or locked lessons. The goal is to make high-quality algorithm education available to every learner.

## Available lessons

| Category | Lesson | Level | JavaScript | Python | Java | C++ | Visualizer | Challenge |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sorting | [Bubble Sort](./app/sorting/bubble-sort/page.tsx) | Beginner | Yes | Yes | Yes | Yes | Yes | Yes |
| Sorting | [Selection Sort](./app/sorting/selection-sort/page.tsx) | Beginner | Yes | Yes | Yes | Yes | Yes | Yes |
| Sorting | [Insertion Sort](./app/sorting/insertion-sort/page.tsx) | Beginner | Yes | Yes | Yes | Yes | Yes | Yes |
| Sorting | [Merge Sort](./app/sorting/merge-sort/page.tsx) | Intermediate | Yes | Yes | Yes | Yes | Yes | Yes |
| Sorting | [Quick Sort](./app/sorting/quick-sort/page.tsx) | Intermediate | Yes | Yes | Yes | Yes | Yes | Yes |

## Learning method

Every complete lesson follows four connected steps:

1. **Understand** — build a plain-language mental model.
2. **Visualize** — inspect every important state change.
3. **Implement** — compare tested JavaScript, Python, Java, and C++ code.
4. **Practice** — use examples, games, and challenges.

Each lesson also documents complexity, edge cases, practical use cases, limitations, and relevant properties such as stability or in-place operation.

## Run locally

You need Node.js 22.13 or newer and pnpm. Running every language test also requires Python 3, a JDK, and a C++17 compiler.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validate the project

```bash
pnpm build
pnpm test
pnpm test:python
pnpm test:java
pnpm test:cpp
```

## Repository structure

```text
algorithm-lab/
├── app/                         # Catalog, glossary, and lesson routes
│   └── sorting/                # Interactive sorting lessons
├── algorithms/                  # Tested reference implementations
│   └── sorting/                # Tested implementations for each lesson
├── components/                  # Shared platform components
├── lib/lesson-schema.ts         # Validated definition shared by every lesson
├── lib/lessons/                 # Data-driven lesson content
├── lib/algorithms.ts            # Central lesson and category registry
├── docs/LESSON_STANDARD.md      # Definition of a complete lesson
└── tests/                       # Rendering and implementation tests
```

## Roadmap

The planned curriculum includes:

- Sorting and searching
- Recursion and backtracking
- Trees and graphs
- Greedy algorithms
- Dynamic programming
- String algorithms
- Pathfinding and data structures

See [ROADMAP.md](./ROADMAP.md) for the current sequence.

## Contributing

Contributions are welcome from learners, educators, designers, and developers. Read [CONTRIBUTING.md](./CONTRIBUTING.md) and the [lesson standard](./docs/LESSON_STANDARD.md) before proposing a lesson.

You can help by:

- Correcting an explanation or implementation
- Adding edge cases and tests
- Improving accessibility
- Translating a lesson
- Building a planned algorithm lesson
- Designing a useful algorithm-specific challenge

## Free and open licensing

- Source code is available under the [MIT License](./LICENSE).
- Original educational text and lesson material is available under [Creative Commons Attribution 4.0 International](./CONTENT-LICENSE.md).

This allows the project to stay free while letting educators and learners reuse and improve the material with attribution.
