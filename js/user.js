/* globals Toast */
function registerUserView(doc){
  class UserView extends HTMLElement {
    createdCallback(){
      this._root = this.createShadowRoot();
      this._template = doc.querySelector("#user-view");
      this._root.appendChild(document.importNode(this._template.content, true));
      this._security = this._root.querySelector("#right-side .security");
      this._rightSide = this._root.querySelector("#right-side");
      this._leftSide = this._root.querySelector("#left-side");
      this._closeButton = this._root.querySelector("#closeButton");
      this._container = this._root.querySelector("#container");

      this._selectRightSide = this._selectRightSide.bind(this);
      this._handlePasswordSubmit = this._handlePasswordSubmit.bind(this);
      this._handleResetPasswordFields = this._handleResetPasswordFields.bind(this);
      this.hide = this.hide.bind(this);
      this.show = this.show.bind(this);

      this._registerEventHandlers();
    }

    _selectRightSide(evt){
      let entry = evt.target.classList[0];
      let rightSideEntry = this._rightSide.querySelector(`.${entry}`);
      if (rightSideEntry === null) {
        return;
      }
      // If the entry doesn't exist / can't be found, chuck it.
      for(var i of this._rightSide.children){
        if (i !== rightSideEntry && !i.classList.contains("hidden")){
          // Why make it add hidden all over again?
          i.classList.add("hidden");
        } else if (i === rightSideEntry) {
          i.classList.remove("hidden");
        }
      }
    }

    _handlePasswordSubmit(){
      let oldPass    = this._root.querySelector("#oldPassword");
      let newPass    = this._root.querySelector("#newPassword");
      let repeatPass = this._root.querySelector("#repeatPassword");

      if (newPass.value !== repeatPass.value){
        return new Toast("Passwords don't match", "alert");
      }
      document.dispatchEvent(new CustomEvent("changePassword", {detail: {
        oldPass: oldPass,
        newPass: newPass
      }}));


    }

    _handleResetPasswordFields(){
      // This feels a little clunky, but it's less code.
      [this._root.querySelector("#oldPassword"),
       this._root.querySelector("#newPassword"),
       this._root.querySelector("#repeatPassword")].forEach( field => {
         field.value = "";
       })
    }

    hide(){
      this._container.classList.add("hidden");
    }

    show(){
      this._container.classList.remove("hidden");
    }

    set username(v){
      this._root.querySelector("span.username").textContent = v;
    }

    _registerEventHandlers(){
      for (let i of this._leftSide.querySelectorAll("li")){
        if (i.classList.contains("logout")){
          i.addEventListener("click", () => {
            document.dispatchEvent(new Event("logout"));
          })
        } else {
          i.addEventListener("click", this._selectRightSide);
        }
      } //End of For loop.
      this._security.querySelector("#passwordSubmit").addEventListener("click", this._handlePasswordSubmit);
      this._security.querySelector("#passwordReset").addEventListener("click", this._handleResetPasswordFields);
      this._closeButton.addEventListener("click", this.hide);

      document.addEventListener("user-view-show", this.show);
    }
  }
  document.registerElement("user-view", UserView);
}