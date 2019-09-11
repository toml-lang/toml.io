import { Controller } from "stimulus";

export default class extends Controller {
  static get targets() {
    return ["link", "header"];
  }

  scroll() {
    let scrolledElements = this.headerTargets
      .map(target => {
        if (target.offsetTop < window.scrollY) {
          return target;
        }
      })
      .filter(target => target);
    let id = null;

    this.linkTargets.forEach(target => target.classList.remove("active"));

    if (scrolledElements.length) {
      id = scrolledElements.pop().id;

      this.linkTargets
        .find(target => {
          return target.dataset.id === id;
        })
        .classList.add("active");
    }
  }
}
