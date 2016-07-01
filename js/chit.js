function registerChit(doc){
  class WikiChit extends HTMLElement {
    createdCallback() {
      this._root = this.createShadowRoot();
      this._template = doc.querySelector('#wiki-chit');
      this._root.appendChild(document.importNode(this._template.content, true));
      this._del = this._root.querySelector('#delete');
      this._chit = this._root.querySelector('#chit');

      this._handleDelClick = this._handleDelClick.bind(this);

      this._registerEventHandlers();
    }

    get textContent(){
      return this._chit.textContent;
    }

    set readonly(v){
      if (v){
        this._del.classList.add("hidden");
      }
    }

    set textContent(v){
      this._chit.textContent = v;
    }

    _registerEventHandlers() {
      this._del.addEventListener("click", this._handleDelClick);
    }

    _handleDelClick (evt) {
      this.dispatchEvent(new CustomEvent("deleteClick", {detail: this._chit.textContent}));
    }
  }

  document.registerElement("wiki-chit", WikiChit);
}