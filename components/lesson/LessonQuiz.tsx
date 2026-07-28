"use client";

import { useEffect, useMemo, useState } from "react";
import type { LessonQuizQuestion } from "../../lib/lesson-schema";

type QuizAnswers = Record<string, number>;

type LessonQuizProps = {
  questions: readonly LessonQuizQuestion[];
  storageKey: string;
  sectionLabel?: string;
};

export function LessonQuiz({ questions, storageKey, sectionLabel = "05 — Check yourself" }: LessonQuizProps) {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [checked, setChecked] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const answeredCount = useMemo(
    () => questions.filter((question) => answers[question.id] !== undefined).length,
    [answers, questions],
  );
  const complete = answeredCount === questions.length;
  const score = useMemo(
    () => questions.filter((question) => answers[question.id] === question.correctOption).length,
    [answers, questions],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const storedQuiz = window.localStorage.getItem(storageKey);
        if (storedQuiz) {
          const parsed = JSON.parse(storedQuiz) as { answers?: QuizAnswers; checked?: boolean };
          if (parsed.answers) setAnswers(parsed.answers);
          if (parsed.checked) setChecked(true);
        }
      } catch {
        // Storage can be unavailable in private or restricted browser contexts.
      } finally {
        setLoaded(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ answers, checked }));
    } catch {
      // The quiz still works for the current session when persistence is blocked.
    }
  }, [answers, checked, loaded, storageKey]);

  function answerQuestion(questionId: string, optionIndex: number) {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [questionId]: optionIndex }));
    setChecked(false);
  }

  function resetQuiz() {
    setAnswers({});
    setChecked(false);
  }

  return (
    <section className="quiz-section" id="quiz" aria-labelledby="quiz-title">
      <div className="quiz-intro">
        <p className="section-number">{sectionLabel}</p>
        <h2 id="quiz-title">Check your understanding</h2>
        <p>Answer {questions.length} questions, then reveal the reasoning. Your progress stays on this device—no account required.</p>
        <div className="quiz-progress" aria-label={`${answeredCount} of ${questions.length} questions answered`}>
          <span style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }} />
        </div>
        <small>{answeredCount} of {questions.length} answered</small>
      </div>
      <div className="quiz-questions">
        {questions.map((question, questionIndex) => {
          const selectedAnswer = answers[question.id];
          const isCorrect = selectedAnswer === question.correctOption;

          return (
            <fieldset className="quiz-question" key={question.id}>
              <legend><span>Q{questionIndex + 1}</span>{question.prompt}</legend>
              <div className="quiz-options">
                {question.options.map((option, optionIndex) => {
                  const selected = selectedAnswer === optionIndex;
                  const optionState = checked && selected ? (isCorrect ? " is-correct" : " is-incorrect") : "";
                  return (
                    <label className={`quiz-option${selected ? " is-selected" : ""}${optionState}`} key={option}>
                      <input
                        type="radio"
                        name={question.id}
                        value={optionIndex}
                        checked={selected}
                        onChange={() => answerQuestion(question.id, optionIndex)}
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
              {checked && (
                <p className={isCorrect ? "quiz-explanation is-correct" : "quiz-explanation is-incorrect"}>
                  <strong>{isCorrect ? "Correct." : `Not quite. The answer is ${question.options[question.correctOption]}.`}</strong> {question.explanation}
                </p>
              )}
            </fieldset>
          );
        })}
        <div className="quiz-actions">
          <button className="button button-primary" type="button" disabled={!complete} onClick={() => setChecked(true)}>Check answers</button>
          <button type="button" onClick={resetQuiz}>Reset quiz</button>
          <p aria-live="polite">
            {checked ? `Score: ${score} of ${questions.length}. ${score === questions.length ? "You are ready for the challenge." : "Review the explanations and try again."}` : complete ? "All questions answered. Check your work when ready." : "Answer every question to check your work."}
          </p>
        </div>
      </div>
    </section>
  );
}
