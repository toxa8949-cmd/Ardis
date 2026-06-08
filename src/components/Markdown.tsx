import { marked } from "marked";

// Рендер Markdown у HTML. Контент пишемо ми (адмін), тож джерело довірене.
// marked налаштований на GitHub-подібний markdown.
marked.setOptions({ gfm: true, breaks: true });

export function Markdown({
  content,
  className = "prose-ardis",
}: {
  content: string;
  className?: string;
}) {
  const html = marked.parse(content) as string;
  return (
    <div
      className={`${className} max-w-none`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
