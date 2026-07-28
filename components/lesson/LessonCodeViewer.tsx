"use client";

import { useState } from "react";
import { supportedLanguageIds, type LessonCodeExample, type SupportedLanguageId } from "../../lib/lesson-schema";

type LessonCodeViewerProps = {
  algorithmName: string;
  codeExamples: Record<SupportedLanguageId, LessonCodeExample>;
};

export function LessonCodeViewer({ algorithmName, codeExamples }: LessonCodeViewerProps) {
  const [language, setLanguage] = useState<SupportedLanguageId>("javascript");
  const activeCode = codeExamples[language];

  return (
    <div className="code-window">
      <div className="code-language-tabs" role="tablist" aria-label="Code language">
        {supportedLanguageIds.map((languageId) => (
          <button
            type="button"
            role="tab"
            aria-selected={language === languageId}
            className={language === languageId ? "is-active" : ""}
            key={languageId}
            onClick={() => setLanguage(languageId)}
          >
            {codeExamples[languageId].label}
          </button>
        ))}
      </div>
      <div className="code-toolbar">
        <span><i /><i /><i /></span>
        <small>{activeCode.filename}</small>
        <button type="button" onClick={() => navigator.clipboard?.writeText(activeCode.code)}>Copy</button>
      </div>
      <pre aria-label={`${activeCode.label} ${algorithmName} implementation`}><code>
        {activeCode.code.split("\n").map((line, index) => (
          <span className={activeCode.highlight.some((lineNumber) => lineNumber === index + 1) ? "line highlight-line" : "line"} key={`${language}-${index}`}>
            <i>{String(index + 1).padStart(2, "0")}</i><span>{line || " "}</span>
          </span>
        ))}
      </code></pre>
    </div>
  );
}
