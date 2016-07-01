/* eslint no-console: off */
/* Toast: Simple toast element for TyrNet
 * new Toast(message[, level[, timeout]]) or new Toast({options});
 */
class Toast {
  static get defaults(){
    return {
      msg: "",
      level: "info",
      parent: document.body,
      timeout: 3000
    }
  }
  constructor(){
    this._options = Toast.defaults;
    if (typeof arguments[0] === "object"){
      for (let i in arguments[0]) {
        this._options[i] = arguments[0][i];
      }
    } else if (typeof arguments[0] === "string") {
      this._options.msg = arguments[0];
      if (arguments[1] !== undefined ) {
        this._options.level = arguments[1];
      }
      if (arguments[2] !== undefined) {
        this._options.timeout = arguments[2];
      }
    }
    this._el = document.createElement("toast");
    this._msg = document.createElement("span");
    this._button = document.createElement("button");
    this._button.classList.add("icon");
    this._button.innerText = "close";
    this._msg.innerText = this._options.msg;
    this._el.classList.add(this._options.level);
    this._el.appendChild(this._msg);
    this._el.appendChild(this._button);

    this.show = this.show.bind(this);
    this._seppuku = this._seppuku.bind(this);
    this._handleTransitionEnd = this._handleTransitionEnd.bind(this);

    this._button.addEventListener("click", this._seppuku);
    this._el.addEventListener("mouseenter", () => {
      clearTimeout(this._setTimeout);
    });
    this._el.addEventListener("mouseleave", () => {
      this._setTimeout = setTimeout(this._seppuku, this._options.timeout);
    });
    this._promise = new Promise((resolve) => {
      this._options.parent.appendChild(this._el);
      setTimeout(resolve, 100);
    })

    this.show();
  }

  show() {
    if (document.querySelectorAll('toast').length > 1 && this._options.level === "info") {
      setTimeout(this.show, 2000);
    } else {
      this._promise.then(()=> {
        this._el.classList.add("show");
        this._setTimeout = setTimeout(this._seppuku, this._options.timeout);
      });
    }
    return this._promise;
  }

  then(){
    this._promise.apply(this._promise, arguments);
  }
  _handleTransitionEnd() {
    //Checking if this didn't somehow get called after the element was actually deleted
    if (this._el !== undefined) {
      this._el.parentElement.removeChild(this._el);
    }
  }

  _seppuku(){
    return this._promise.then(() => {
      this._el.classList.remove("show");
      this._el.addEventListener("transitionend", this._handleTransitionEnd);
    });
  }
}

window.Toast = Toast;