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

    location.href = `/v1/${target.value}`;
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
