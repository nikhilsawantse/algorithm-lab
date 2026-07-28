type LessonFooterProps = {
  lessonNumber: number;
  track: string;
};

export function LessonFooter({ lessonNumber, track }: LessonFooterProps) {
  return (
    <footer>
      <div><span className="brand-mark">A</span><p><strong>Algorithm Lab</strong><br /><small>Interactive algorithms, free for everyone.</small></p></div>
      <p>Lesson {String(lessonNumber).padStart(2, "0")} of the {track} track</p>
      <a href="#top">Back to top ↑</a>
    </footer>
  );
}
