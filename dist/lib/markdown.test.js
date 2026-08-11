import { test, expect, is } from "@benchristel/taste";
import { htmlFromMarkdown } from "./markdown.js";
test("htmlFromMarkdown", {
    "renders an empty document"() {
        expect(htmlFromMarkdown(""), is, "");
    },
    "renders markdown to HTML"() {
        expect(htmlFromMarkdown("# Hello"), is, `<h1 id="hello">Hello</h1>\n`);
    },
    "converts wiki-style links to HTML links"() {
        expect(htmlFromMarkdown("[[MyWikiPage]]"), is, `<p><a href="MyWikiPage.html">MyWikiPage</a></p>\n`);
    },
    "ignores wiki-style links with an alias"() {
        // Obsidian and GitHub Pages have opposite conventions for which half is
        // the filename and which half is the alias, so we can't do anything
        // sensible with these links.
        expect(htmlFromMarkdown("[[Foo|Bar]]"), is, `<p>[[Foo|Bar]]</p>\n`);
    },
    "renders a mermaid code block as a link to a generated SVG asset"() {
        const html = htmlFromMarkdown("```mermaid\ngraph TD;\nA-->B;\n```");
        expect(/^<img src="\/assets\/mermaid\/[0-9a-f]{16}\.svg" alt="Mermaid diagram">\n$/.test(html), is, true);
    },
    "does not inline mermaid source into the page HTML"() {
        const html = htmlFromMarkdown('```mermaid\ngraph TD;\nA["<script>"]-->B;\n```');
        expect(html.includes("<script>"), is, false);
        expect(html.includes("graph TD"), is, false);
    },
    "does not run syntax highlighting on mermaid blocks"() {
        const html = htmlFromMarkdown("```mermaid\ngraph TD;\nA-->B;\n```");
        expect(html.includes("hljs"), is, false);
    },
    "still highlights non-mermaid code blocks"() {
        const html = htmlFromMarkdown("```js\nconst x = 1;\n```");
        expect(html.includes("hljs"), is, true);
    },
});
