/**
 * Safely sanitizes HTML for blog posts to allow rich Word-like text formatting:
 * - In đậm (Bold): <strong>, <b>
 * - In nghiêng (Italic): <em>, <i>
 * - Gạch chân (Underline): <u>
 * - Gạch ngang (Strikethrough): <s>, <strike>, <del>
 * - Tiêu đề (Headings): <h1>, <h2>, <h3>, <h4>
 * - Đoạn văn & ngắt dòng: <p>, <br>, <hr>
 * - Danh sách: <ul>, <ol>, <li>
 * - Trích dẫn: <blockquote>
 * - Tô màu chữ & màu nền: <span style="color: ...; background-color: ...">, <mark style="...">
 *
 * Strips all dangerous tags (<script>, <iframe>, etc.), attributes (onclick, etc.)
 * and disallows unsafe style properties.
 */

const ALLOWED_TAGS = new Set([
  "strong", "b", "em", "i", "u", "s", "strike", "del",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr", "span", "mark",
  "ul", "ol", "li", "blockquote", "code", "pre"
]);

const SAFE_COLOR_REGEX = /^(?:#[0-9a-fA-F]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|hsl\(\s*[\d.]+\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*\)|hsla\(\s*[\d.]+\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+\s*\)|[a-zA-Z]+)$/;

export function sanitizeBlogHtml(html: string): string {
  if (!html) return "";

  // 1. Remove dangerous blocks: <script>...</script>, <style>...</style>, <iframe>...</iframe>, <object>...</object>, <embed>
  let clean = html.replace(/<(script|style|iframe|object|embed|svg|math|applet|meta|link|base)[^>]*>[\s\S]*?<\/\1>/gi, "");
  clean = clean.replace(/<(script|style|iframe|object|embed|svg|math|applet|meta|link|base)[^>]*\/?>/gi, "");

  // 2. Remove all on* event handlers (e.g. onclick, onerror, onload)
  clean = clean.replace(/\son[a-zA-Z]+\s*=\s*(['"]).*?\1/gi, "");
  clean = clean.replace(/\son[a-zA-Z]+\s*=[^\s>]+/gi, "");

  // 3. Remove javascript: or vbscript: or data: in any attribute
  clean = clean.replace(/(href|src|action|data)\s*=\s*(['"])\s*(javascript|vbscript|data):.*?\2/gi, "");

  // 4. Sanitize tags: allow only safe tags and safe styles
  clean = clean.replace(/<\/?([a-zA-Z0-9-]+)([^>]*)>/gi, (fullMatch, tagName, attrs) => {
    const tag = tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      return "";
    }

    const isClosing = fullMatch.startsWith("</");
    if (isClosing) {
      return `</${tag}>`;
    }

    if (attrs) {
      const styleMatch = attrs.match(/style\s*=\s*(['"])(.*?)\1/i);
      if (styleMatch) {
        const rawStyle = styleMatch[2];
        const safeStyles: string[] = [];

        // Color
        const colorMatch = rawStyle.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
        if (colorMatch) {
          const colorVal = colorMatch[1].trim();
          if (SAFE_COLOR_REGEX.test(colorVal)) {
            safeStyles.push(`color: ${colorVal}`);
          }
        }

        // Background-color
        const bgMatch = rawStyle.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i);
        if (bgMatch) {
          const bgVal = bgMatch[1].trim();
          if (SAFE_COLOR_REGEX.test(bgVal)) {
            safeStyles.push(`background-color: ${bgVal}`);
            safeStyles.push("padding: 2px 5px");
            safeStyles.push("border-radius: 4px");
          }
        }

        // Text-decoration
        const decorMatch = rawStyle.match(/(?:^|;)\s*text-decoration\s*:\s*([^;]+)/i);
        if (decorMatch && /^(?:underline|line-through|none)$/i.test(decorMatch[1].trim())) {
          safeStyles.push(`text-decoration: ${decorMatch[1].trim()}`);
        }

        if (safeStyles.length > 0) {
          return `<${tag} style="${safeStyles.join("; ")}">`;
        }
      }
    }

    return `<${tag}>`;
  });

  return clean;
}

