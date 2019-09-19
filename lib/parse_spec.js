const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const dasherize = require("string-dasherize");
const striptags = require("striptags");
const Entities = require("html-entities").XmlEntities;
const entities = new Entities();

const MarkdownIt = require("markdown-it");
const md = new MarkdownIt();

const Octokit = require("@octokit/rest");
const octokit = Octokit({
  auth: process.env.GITHUB_AUTH,
  userAgent: "TOML.io Builder; @octokit/rest v1.2.3"
});

const REGEXES = {
  header: /^\n([\S ]+)\n[-=]+\n\n/gms
};
const SPEC_TEMPLATE_PATH = path.join(
  __dirname,
  "..",
  "code",
  "html",
  "v1",
  "_spec_template.template"
);

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function textToIdAttr(text) {
  return `user-content-${dasherize(text.toLowerCase()).replace("/", "-")}`;
}

function textFromHeader(text) {
  const html = entities.decode(text);
  const headerText = striptags(html);

  return { html, headerText };
}

function extractIdFromHtml(html) {
  const match = html.match(/id\=["'](.*?)["']/);

  if (match) {
    return match[1];
  }
}

class Formatter {
  static format(text) {
    return this.style(this.anchor(text));
  }

  static anchor(text) {
    return text.replace(/<h2>(.*?)<\/h2>/g, ($0, $1) => {
      const { html, headerText } = textFromHeader($1);
      let anchor = extractIdFromHtml(html) || textToIdAttr(headerText);

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
}

class NavExtractor {
  constructor(input) {
    this.input = input;
  }

  process() {
    return `<ul>\n${this.listItems().join("\n")}</ul>`;
  }

  listItems() {
    return this.headers().map(([id, content]) => {
      return `  <li><a href="#${id}" data-target="nav.link" data-action="click->nav#click" data-id="${id}">${content}</a></li>`;
    });
  }

  headers() {
    let output = [];

    this.input.replace(/<h2.*?id=["'](.*?)["'].*?>(.*?)<\/h2>/gs, (regex, id, content) => {
      output.push([id, striptags(content).trim()]);
    });

    return output;
  }
}

class SpecParser {
  constructor(url, locale, template) {
    this.url = url;
    this.locale = locale;
    this.indexTemplate = template;
    this.navTitle = "Spec";

    this.raw = "";
    this.html = "";
    this.nav = [];
  }

  get outputPath() {
    return path.join(__dirname, "..", "code", "html", "v1", this.locale, "spec");
  }

  async process() {
    await this.get();
    this.convert();
    this.format();
    this.extractNav();
    this.save();
  }

  async get() {
    console.log(`Downloading ${this.url}`);
    const response = await fetch(this.url);
    this.raw = await response.text();
  }

  convert() {
    console.log(`Converting from Markdown to HTML`);
    this.html = md.render(this.raw);
  }

  format() {
    console.log(`Formatting`);
    this.html = Formatter.format(this.html);
  }

  extractNav() {
    console.log(`Extracting nav`);
    const extractor = new NavExtractor(this.html);
    const headers = extractor.headers();

    this.navTitle = headers[3][1];
    this.nav = extractor.process();
  }

  save() {
    fs.mkdirSync(this.outputPath, { recursive: true });

    fs.writeFileSync(path.join(this.outputPath, "_spec.html"), this.html);
    console.log(`Saved ${this.outputPath}/_spec.html`);

    fs.writeFileSync(path.join(this.outputPath, "_nav.html"), this.nav);
    console.log(`Saved ${this.outputPath}/_nav.html`);

    let template = this.indexTemplate.replace(/\{\{\s+locale\s+\}\}/g, this.locale);
    template = template.replace(/\{\{\s+specTitle\s+\}\}/g, this.navTitle);
    fs.writeFileSync(path.join(this.outputPath, "index.html"), template);
    console.log(`Saved ${this.outputPath}/index.html`);
  }
}

(async () => {
  const specIndex = fs.readFileSync(SPEC_TEMPLATE_PATH).toString();

  console.log(`\nGetting versions...`);

  const versions = await octokit.repos.getContents({
    owner: "toml-lang",
    repo: "toml",
    path: "/versions"
  });

  console.log(`Found ${versions.data.length} versions`);

  asyncForEach(versions.data, async file => {
    const locale = file.path.split("/")[1];

    if (
      process.env.LOCALES === undefined ||
      process.env.LOCALES.split(",").indexOf(locale) !== -1
    ) {
      console.group();
      console.log(`Working on ${file.path}`);
      const content = await octokit.repos.getContents({
        owner: "toml-lang",
        repo: "toml",
        path: file.path
      });

      console.group();
      const specUrl = content.data.pop().download_url;
      let parser = new SpecParser(specUrl, locale, specIndex);
      await parser.process();
      console.groupEnd();
      console.groupEnd();
    }
  });
})();
