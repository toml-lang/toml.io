// * Adds HTML attributes to header tags
// * Adds HTML attributes to <code> tags
// * Auto-links any URLs that aren't already linked in Markdown

const striptags = require("striptags");
const Entities = require("html-entities").XmlEntities;
const entities = new Entities();

const TABLE_OF_CONTENTS_POSITION = 2;

let versionDates = {
  'v0.1.0':      new Date('2013-03-17'),
  'v0.2.0':      new Date('2013-09-24'),
  'v0.3.0':      new Date('2014-11-10'),
  'v0.3.1':      new Date('2014-11-11'),
  'v0.4.0':      new Date('2015-02-12'),
  'v0.5.0':      new Date('2018-07-10'),
  'v1.0.0-rc.1': new Date('2020-04-03'),
  'v1.0.0-rc.2': new Date('2020-08-09'),
  'v1.0.0-rc.3': new Date('2020-10-07'),
  'v1.0.0':      new Date('2021-01-11'),
}

let i18n = {
  published: {
    en:      'Published on %(date)',
    'zh-CN': '发布于 %(date)',
    fr:      'Publié le %(date)',
    ja:      '%(date) 日掲載',
    ko:      '%(date) 에 게시됨',
    pl:      'Opublikowano dnia %(date) r.',
    pt:      'Publicado em %(date)',
    ru:      'Опубликовано %(date)',
  },
  textVersion: {
    en:      'Text version',
    'zh-CN': '文本版本',
    fr:      'Version texte',
    ja:      'テキスト版',
    ko:      '텍스트 버전',
    pl:      'Wersja tekstowa',
    pt:      'Versão de texto',
    ru:      'Текстовая версия',
  }
}


module.exports = class Formatter {
  static textFromHeader(text) {
    const html = entities.decode(text);
    const headerText = striptags(html);

    return headerText;
  }

  static format(text, { locale, version }) {
    return this.addTextLink(this.style(this.anchor(this.stripTableOfContents(text))), locale, version);
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

  static addTextLink(html, locale, version) {
    let l = locale === 'cn' ? 'zh-CN' : locale,
        d = new Intl.DateTimeFormat(l, {dateStyle: 'long'}).format(versionDates[version]),
        p = (i18n.published[l] || i18n.published['en']).replace(/%\(date\)/, d),
        t = (i18n.textVersion[l] || i18n.textVersion['en'])
    return html.replace(/<h1/, `
      <span class="block text-left md:text-right mt-16 md:mt-0">
        ${p} – <a href="https://raw.githubusercontent.com/toml-lang/toml.io/main/specs/${locale}/${version}.md">${t}</a>
      </span>
      <h1`)
  }
};
