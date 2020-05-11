import { Controller } from "stimulus";

export default class extends Controller {
  static get targets() {
    return ["link", "menuLink", "header", "menu"];
  }

  onMenuClick(event) {
    this.menuTarget.classList.toggle("hidden");
    if (event) {
      event.preventDefault();
    }
  }

  click(event) {
    // if the menu link is not hidden then we're on mobile and need to hide it
    if (this.hasCompactMenu) {
      this.onMenuClick();
    }
  }

  scroll() {
    console.log("scroll");
    let scrolledElements = this.headerTargets
      .map(target => {
        if (target.offsetTop <= window.scrollY) {
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

  get hasCompactMenu() {
    return !this.menuTarget.classList.contains("hidden");
  }
}
