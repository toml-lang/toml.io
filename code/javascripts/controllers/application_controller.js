// See https://cameronjs.com/stimulus for more info

import { Controller } from "stimulus";

export default class extends Controller {
  static get targets() {
    return ["versionsLink", "versions", "version", "languagesLink", "languages", "language"];
  }

  connect() {
    this._pickVersion()
    this._pickLanguage()
  }

  _pickVersion() {
    if (this.currentVersion) {
      this.versionTargets.every(target => {
        if (target.dataset['version'] === this.currentVersion) {
          this.versionsLinkTarget.textContent = this.currentVersion
          return false
        }
        return true
      })
    }
  }

  _pickLanguage() {
    if (this.currentLanguage) {
      this.languageTargets.every(target => {
        if (target.dataset['language'] === this.currentLanguage) {
          this.languagesLinkTarget.textContent = target.textContent
          return false
        }
        return true
      })
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

  get currentLanguage() {
    return location.pathname.split('/')[1]
  }

  get currentVersion() {
    const filename = location.pathname.split('/').pop()
    if (filename[0] === 'v') {
      let parts = filename.split('.')
      if (parts[parts.length - 1] === 'html') {
        parts.pop()
      }
      return parts.join('.')
    } else {
      return null
    }
  }
}
