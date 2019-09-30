// Handles discovery of each locale and initiating a parse of each

const fs = require("fs");
const path = require("path");
const Octokit = require("@octokit/rest");
const octokit = Octokit({
  auth: process.env.GITHUB_AUTH,
  userAgent: "TOML.io Builder; @octokit/rest v1.2.3"
});

const Parser = require("./parser.js");

module.exports = class Downloader {
  static async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  static async start(rootPath, githubPath) {
    const specIndex = fs.readFileSync(path.join(rootPath, "_spec_template.template")).toString();

    console.log(`\nGetting versions...`);

    const versions = await octokit.repos.getContents({
      owner: "toml-lang",
      repo: "toml",
      path: githubPath
    });

    console.log(`Found ${versions.data.length} versions`);

    this.asyncForEach(versions.data, async file => {
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
        let parser = new Parser(specUrl, locale, specIndex, rootPath);
        await parser.process();
        console.groupEnd();
        console.groupEnd();
      }
    });
  }
};
