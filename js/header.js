function registerHeader(doc){
    class WuZhuHeader extends HTMLElement {
    createdCallback(){
      this._root = this.createShadowRoot();
      this._template = doc.querySelector('#headerTemplate');
      this._root.appendChild(doc.importNode(this._template.content, true));
      this._menu = this._root.querySelector('a');
      this._searchBar = this._root.querySelector('input');

      this._addEventHandlers();
    }


    _handleClick(evt){
      document.dispatchEvent(new Event("toggleNav"));
    }

    _handleInput(evt){
      document.dispatchEvent(new CustomEvent("search", {detail: evt.target.value}));
    }

    _addEventHandlers(){
      this._menu.addEventListener('click', this._handleClick);
      this._searchBar.addEventListener('input', this._handleInput);
    }


  }

  document.registerElement("wuzhu-header", WuZhuHeader);
}