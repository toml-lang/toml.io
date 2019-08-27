import { Controller } from "stimulus"

export default class extends Controller {
  static get targets() {
    return ['tab', 'code']
  }

  connect() {
    this._changeLanguage('toml')
  }

  change(event) {
    this._changeLanguage(event.currentTarget.dataset.language)
  }

  preventDefault(event) {
    event.preventDefault()
  }

  _changeLanguage(language) {
    this._swapTabs(language)
    this._showCode(language)
  }

  _swapTabs(language) {
    this.tabTargets.forEach(target => {
      if (target.dataset.language === language) {
        target.classList.add(this._activeTabClass)
      } else {
        target.classList.remove(this._activeTabClass)
      }
    })
  }

  _showCode(language) {
    this.codeTargets.forEach(target => {
      if (target.dataset.language === language) {
        target.classList.add(this._showClass)
        target.classList.remove(this._hideClass)
      } else {
        target.classList.remove(this._showClass)
        target.classList.add(this._hideClass)
      }
    })
  }

  get _activeTabClass() {
    return this.data.get('active-tab-class')
  }

  get _hideClass() {
    return this.data.get('hide-class')
  }

  get _showClass() {
    return this.data.get('show-class')
  }
}
