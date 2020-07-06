// * Adds HTML attributes to header tags
// * Adds HTML attributes to <code> tags
// * Auto-links any URLs that aren't already linked in Markdown

const striptags = require("striptags");
const Entities = require("html-entities").XmlEntities;
const entities = new Entities();

const TABLE_OF_CONTENTS_POSITION = 2;

module.exports = class Formatter {
  static textFromHeader(text) {
    const html = entities.decode(text);
    const headerText = striptags(html);

    return headerText;
  }

  static format(text) {
    return this.style(this.anchor(this.stripTableOfContents(text)));
  }

  static stripTableOfContents(text) {
    let headerCount = 0,
      removed = false,
      removing = false,
      output = [];

    text.split("\n").forEach(line => {
      if (removed) return output.push(line);

      if (line.match(/<h2/)) {
        headerCount++;
      }

      if (headerCount === TABLE_OF_CONTENTS_POSITION) {
        removing = true;
      } else if (headerCount > TABLE_OF_CONTENTS_POSITION) {
        removing = false;
        removed = true;
      }

      if (removing) {
        return;
      } else {
        output.push(line);
      }
    });

    return output.join("\n");
  }

  static anchor(text) {
    return text.replace(/<h2.*?id="(.*?)".*?>(.*?)<\/h2>/g,(_, $1, $2) => {
      const headerText = this.textFromHeader($2);

      return `<h2 id="${$1}" data-target="nav.header">
        <a href="#${$1}">${headerText}</a>
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
