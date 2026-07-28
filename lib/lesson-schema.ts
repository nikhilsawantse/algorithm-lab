export const supportedLanguageIds = ["javascript", "python", "java", "cpp"] as const;
export const supportedLanguages = ["JavaScript", "Python", "Java", "C++"] as const;

export type SupportedLanguageId = (typeof supportedLanguageIds)[number];
export type SupportedLanguage = (typeof supportedLanguages)[number];
export type AlgorithmDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type LessonQuizQuestion = {
  id: string;
  prompt: string;
  options: readonly string[];
  correctOption: number;
  explanation: string;
};

export type LessonMistake = {
  title: string;
  symptom: string;
  correction: string;
};

export type LessonStudyGuide = {
  objectives: readonly string[];
  prerequisites: readonly string[];
  quiz: readonly LessonQuizQuestion[];
  mistakes: readonly LessonMistake[];
};

export type LessonExample = {
  id: string;
  type: string;
  title: string;
  values: readonly number[];
  description: string;
  result: string;
};

export type LessonCodeExample = {
  label: SupportedLanguage;
  filename: string;
  highlight: readonly number[];
  code: string;
};

export type LessonComplexityCase = {
  label: string;
  value: string;
  context?: string;
};

export type LessonUseCase = {
  icon: string;
  title: string;
  description: string;
  recommendation: string;
  avoid?: boolean;
};

export type LessonCompletionCriterion = {
  id: string;
  label: string;
  description: string;
};

export type AlgorithmLessonDefinition = {
  slug: string;
  name: string;
  lessonNumber: number;
  track: string;
  category: string;
  difficulty: AlgorithmDifficulty;
  description: string;
  metadataDescription: string;
  hero: {
    eyebrow: string;
    title: string;
    emphasis: string;
    introduction: string;
    keyIdea: string;
  };
  mentalModel: {
    title: string;
    question: string;
    steps: readonly {
      title: string;
      description: string;
    }[];
  };
  learningPath: readonly string[];
  studyGuide: LessonStudyGuide;
  examples: readonly LessonExample[];
  codeExamples: Record<SupportedLanguageId, LessonCodeExample>;
  complexity: {
    best: LessonComplexityCase;
    average: LessonComplexityCase;
    worst: LessonComplexityCase;
    space: LessonComplexityCase;
    property: {
      label: string;
      description: string;
      symbol: string;
      tone: "positive" | "caution";
      proofLabel: string;
      before: readonly string[];
      after: readonly string[];
      proof: string;
    };
  };
  challenge: {
    title: string;
    description: string;
    rule: string;
    startValues: readonly number[];
  };
  completionCriteria: readonly LessonCompletionCriterion[];
  useCases: readonly LessonUseCase[];
};

const expectedLanguageLabels: Record<SupportedLanguageId, SupportedLanguage> = {
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
};

function duplicates(values: readonly string[]) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

export function defineLesson<const T extends AlgorithmLessonDefinition>(lesson: T): T {
  const errors: string[] = [];

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(lesson.slug)) errors.push("slug must use lowercase kebab-case");
  if (!Number.isInteger(lesson.lessonNumber) || lesson.lessonNumber < 1) errors.push("lessonNumber must be a positive integer");
  if (lesson.studyGuide.objectives.length < 3) errors.push("at least three learning objectives are required");
  if (lesson.mentalModel.steps.length < 3) errors.push("at least three mental-model steps are required");
  if (lesson.studyGuide.prerequisites.length < 1) errors.push("at least one prerequisite is required");
  if (lesson.examples.length < 3) errors.push("at least three curated examples are required");
  if (lesson.studyGuide.quiz.length < 3) errors.push("at least three quiz questions are required");
  if (lesson.studyGuide.mistakes.length < 2) errors.push("at least two common mistakes are required");
  if (lesson.completionCriteria.length < 3) errors.push("at least three completion criteria are required");
  if (lesson.useCases.length < 2) errors.push("at least two use cases are required");
  if (!["positive", "caution"].includes(lesson.complexity.property.tone)) errors.push("complexity property tone must be positive or caution");

  const duplicateExampleIds = duplicates(lesson.examples.map((example) => example.id));
  if (duplicateExampleIds.length) errors.push(`duplicate example ids: ${duplicateExampleIds.join(", ")}`);

  const duplicateQuizIds = duplicates(lesson.studyGuide.quiz.map((question) => question.id));
  if (duplicateQuizIds.length) errors.push(`duplicate quiz ids: ${duplicateQuizIds.join(", ")}`);

  const duplicateCompletionIds = duplicates(lesson.completionCriteria.map((criterion) => criterion.id));
  if (duplicateCompletionIds.length) errors.push(`duplicate completion ids: ${duplicateCompletionIds.join(", ")}`);

  for (const question of lesson.studyGuide.quiz) {
    if (question.options.length < 2) errors.push(`quiz ${question.id} needs at least two options`);
    if (question.correctOption < 0 || question.correctOption >= question.options.length) {
      errors.push(`quiz ${question.id} has an invalid correctOption`);
    }
  }

  for (const languageId of supportedLanguageIds) {
    const example = lesson.codeExamples[languageId];
    if (!example) {
      errors.push(`missing ${languageId} code example`);
      continue;
    }
    if (example.label !== expectedLanguageLabels[languageId]) {
      errors.push(`${languageId} must use the ${expectedLanguageLabels[languageId]} label`);
    }
    const lineCount = example.code.split("\n").length;
    if (example.highlight.some((line) => !Number.isInteger(line) || line < 1 || line > lineCount)) {
      errors.push(`${languageId} has a highlighted line outside its code sample`);
    }
  }

  if (errors.length) throw new Error(`Invalid lesson definition for ${lesson.name}: ${errors.join("; ")}`);
  return lesson;
}

export const lessonSectionOrder = [
  "Understand",
  "Visualize",
  "Trace",
  "Code",
  "Complexity",
  "Quiz",
  "Challenge",
  "Use cases",
] as const;
