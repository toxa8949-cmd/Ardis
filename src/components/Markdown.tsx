import { marked } from "marked";

// Рендер Markdown у HTML.
//
// БЕЗПЕКА: результат вставляється через dangerouslySetInnerHTML, тож джерело
// має значення. Тексти блогу пише адмін — HTML у них дозволений навмисно.
// А описи 2300+ аксесуарів приходять із чужого фіду постачальника: будь-який
// тег звідти рендерився б як є. Для такого контенту вмикаємо untrusted.
//
// ЧОМУ САМЕ ЗНІМАЄМО ТЕГИ, А НЕ ЕКРАНУЄМО: у базі вже лежать описи з живими
// <br /> — спадок старого імпортера. Якби ми просто екранували "<", читач
// побачив би на сторінці буквальний текст «<br />». Тому теги вирізаємо
// повністю: сирий HTML не виконується, і сміття на очі не потрапляє.
// Порядок важливий — спершу знімаємо теги, і лише потім екрануємо залишкові
// "<", щоб ніщо не проскочило.
marked.setOptions({ gfm: true, breaks: true });

function stripHtml(input: string): string {
  return input
    .replace(/<br\s*\/?\s*>?/gi, "\n")   // <br>, <br/>, <br /> і обрізаний "<br /"
    .replace(/<\/(p|div|li|tr)\s*>?/gi, "\n")
    .replace(/<[^>]*>/g, " ")            // повноцінні теги
    .replace(/<[^<]*$/g, " ")            // незакритий тег у кінці рядка
    .replace(/</g, "&lt;")               // страхувальна сітка
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

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
  const source = untrusted ? stripHtml(content) : content;
  const html = marked.parse(source) as string;
  return (
    <div
      className={`${className} max-w-none`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
