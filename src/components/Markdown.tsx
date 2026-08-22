import { marked } from "marked";

// Рендер Markdown у HTML.
//
// БЕЗПЕКА: результат вставляється через dangerouslySetInnerHTML, тож джерело
// має значення. Тексти блогу пише адмін — їм можна довіряти, і HTML у них
// дозволений навмисно. А ось описи 2300+ аксесуарів приходять із чужого фіду
// postачальника: будь-який тег звідти рендерився б як є. Для такого контенту
// вмикаємо untrusted — він знешкоджує "<" ще до marked, тому сирий HTML
// перетворюється на текст, а markdown-розмітка працює далі як раніше.
marked.setOptions({ gfm: true, breaks: true });

export function Markdown({
  content,
  className = "prose-ardis",
  untrusted = false,
}: {
  content: string;
  className?: string;
  /** true для контенту з зовнішніх джерел (фід постачальника). */
  untrusted?: boolean;
}) {
  const source = untrusted ? content.replace(/</g, "&lt;") : content;
  const html = marked.parse(source) as string;
  return (
    <div
      className={`${className} max-w-none`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
