// See https://cameronjs.com/stimulus for more info

import { Controller } from "stimulus";

export default class extends Controller {
  static get targets() {
    return ["versions", "languages"];
  }

  connect() {
    for (let el of document.getElementsByTagName("code")) {
      if (el.parentElement.nodeName === "PRE") {
        let container = el.parentElement;
        let div = document.createElement("div");
        let link = document.createElement("a");

        div.classList.add("text-right");
        link.href = "#";
        link.classList.add("block", "text-right", "text-sm");
        link.dataset.action = "click->application#copy";
        link.textContent = "Copy to Clipboard";
        div.appendChild(link);
        container.parentElement.insertBefore(div, container.nextSibling);
      }
    }
  }

  copy(event) {
    event.preventDefault();
    this.copyContent(event.target.previousSibling.children[0]);
  }

  copyContent(target) {
    const range = document.createRange();
    window.getSelection().removeAllRanges();
    range.selectNode(target);
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
  }

  showVersions(event) {
    event.preventDefault();
    event.stopPropagation();
    this.versionsTarget.classList.toggle("hidden");
    this.languagesTarget.classList.add("hidden");
  }

  showLanguages(event) {
    event.preventDefault();
    event.stopPropagation();
    this.languagesTarget.classList.toggle("hidden");
    this.versionsTarget.classList.add("hidden");
  }

  closeAllMenus(event) {
    this.versionsTarget.classList.add("hidden");
    this.languagesTarget.classList.add("hidden");
  }
}
