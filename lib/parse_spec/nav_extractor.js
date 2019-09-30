// Pulls out headers in each section of the spec and turns them into an HTML list

const striptags = require("striptags");

module.exports = class NavExtractor {
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
};
