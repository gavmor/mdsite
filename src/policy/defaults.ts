import { basename } from "path";
import { trimMargin } from "../testing/formatting.js";

export const DEFAULT_INPUTDIR = "src";
export const DEFAULT_OUTPUTDIR = "docs";
export const DEFAULT_TEMPLATEFILE = "template.html";

export function defaultIndexMdContent(dir: string) {
  const title = dir === "/" ? "Homepage" : basename(dir);
  return "# " + title + "\n\n{{toc}}";
}

export const defaultTemplate = trimMargin`
  <!DOCTYPE html>
  <html>
    <head>
      <title>{{title}}</title>
    </head>
    <body>
      {{content}}
      <nav>
        {{home}} | {{up}} | {{prev}} | {{next}}
      </nav>
      <script type="module">
        import mermaid from "https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs";
        mermaid.initialize({ startOnLoad: true });
      </script>
    </body>
  </html>
`;
