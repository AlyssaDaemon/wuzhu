function registerLogin(doc) {
  class LoginModal extends HTMLElement {
    createdCallback(){
      this._root = this.createShadowRoot();
      this._template = doc.querySelector('#loginTemplate');
      this._root.appendChild(document.importNode(this._template.content, true));

      this._username = this._root.querySelector('#username');
      this._password = this._root.querySelector('#password');
      this._submitButton = this._root.querySelector('#submit');

      this._handleClick = this._handleClick.bind(this);

      this._registerEventHandlers();
    }

    get value(){
      return {
        username: this._username.value,
        password: this._password.value
      }
    }

    _handleClick(evt) {
      evt.preventDefault();
      this.dispatchEvent(new CustomEvent("login", { detail: this.value }));

    }

    _registerEventHandlers(){
      this._submitButton.addEventListener("click", this._handleClick);
      this._root.querySelector('form').addEventListener("submit", this._handleClick);
    }
  }

  document.registerElement("login-modal", LoginModal);
}