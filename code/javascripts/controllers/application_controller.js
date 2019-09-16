// See https://stimulusjs.org for more about StimulusJS

import { Controller } from "stimulus";

export default class extends Controller {
  static get targets() {
    return ["locale"];
  }

  connect() {
    this.addLocales();
  }

  changeLocale(event) {
    let target = event.currentTarget;
    let path = location.pathname;

    location.href = path.replace(/[a-z]{2}(\/|$)/, `${target.value}$1`);
  }

  addLocales() {
    Object.entries(this.locales).forEach(([value, text]) => {
      let option = this.optionForLocale(text, value);
      const regex = `/${value}(\/|$)`;
      if (location.pathname.match(regex)) {
        option.selected = true;
      }

      this.localeTarget.add(option);
    });
  }

  optionForLocale(text, value) {
    let option = document.createElement("option");
    option.value = value;
    option.text = text;

    return option;
  }

  get locales() {
    return {
      cn: "🇨🇳 cn",
      en: "🇺🇸 en",
      ja: "🇯🇵 ja",
      ko: "🇰🇷 ko"
    };
  }
}
