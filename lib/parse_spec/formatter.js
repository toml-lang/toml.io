// * Adds HTML attributes to header tags
// * Adds HTML attributes to <code> tags
// * Auto-links any URLs that aren't already linked in Markdown

const striptags = require("striptags");
const Entities = require("html-entities").XmlEntities;
const entities = new Entities();

module.exports = class Formatter {
  static textFromHeader(text) {
    const html = entities.decode(text);
    const headerText = striptags(html);

    return { html, headerText };
  }

  static format(text) {
    return this.style(this.anchor(text));
  }

  static anchor(text) {
    let count = 0;

    return text.replace(/<h2>(.*?)<\/h2>/g, ($0, $1) => {
      const { html, headerText } = this.textFromHeader($1);
      // let anchor = extractIdFromHtml(html) || textToIdAttr(headerText);
      let anchor = `section-${++count}`;

      return `<h2 id="${anchor}" data-target="nav.header">
        <a href="#${anchor}">${headerText}</a>
      </h2>`;
    });
  }

  static style(text) {
    return this.styleCode(text);
  }

  static styleCode(text) {
    let output = text.replace(/<pre><code>/g, `<pre><code class="language-toml">`);
    return output.replace(/<pre><code /g, `<pre><code data-controller="snippet" `);
  }
};
