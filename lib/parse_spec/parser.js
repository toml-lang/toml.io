// Coordinates formatting and nav extraction of a spec file

const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const MarkdownIt = require("markdown-it");
const md = new MarkdownIt();

const NavExtractor = require("./nav_extractor.js");
const Formatter = require("./formatter.js");

module.exports = class Parser {
  constructor(url, locale, template, root) {
    this.url = url;
    this.locale = locale;
    this.indexTemplate = template;
    this.rootPath = root;
    this.navTitle = "Spec";

    this.raw = "";
    this.html = "";
    this.nav = [];
  }

  get outputPath() {
    return path.join(this.rootPath, this.locale, "spec");
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
};
