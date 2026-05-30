import { marked } from "marked";

// Рендер Markdown у HTML. Контент пишемо ми (адмін), тож джерело довірене.
// marked налаштований на GitHub-подібний markdown.
marked.setOptions({ gfm: true, breaks: true });

export function Markdown({ content }: { content: string }) {
  const html = marked.parse(content) as string;
  return (
    <div
      className="prose-ardis max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
