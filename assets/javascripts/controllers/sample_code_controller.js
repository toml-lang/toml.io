import { Controller } from "stimulus"

export default class extends Controller {
  static get targets() {
    return ['tab', 'code']
  }

  connect() {
    this._changeLanguage('toml')
  }

  change(event) {
    event.preventDefault()
    this._changeLanguage(event.currentTarget.dataset.language)
  }

  _changeLanguage(language) {
    this._swapTabs(language)
    this._showCode(language)
  }

  _swapTabs(language) {
    this.tabTargets.forEach(target => {
      if (target.dataset.language === language) {
        target.parentElement.classList.add('tab-active')
      } else {
        target.parentElement.classList.remove('tab-active')
      }
    })
  }

  _showCode(language) {
    this.codeTargets.forEach(target => {
      if (target.dataset.language === language) {
        target.classList.add('block')
        target.classList.remove('hidden')
      } else {
        target.classList.remove('block')
        target.classList.add('hidden')
      }
    })
  }
}
