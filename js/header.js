function registerHeader(doc){
    class WuZhuHeader extends HTMLElement {
    createdCallback(){
      this._root = this.createShadowRoot();
      this._template = doc.querySelector('#headerTemplate');
      this._root.appendChild(doc.importNode(this._template.content, true));
      this._menu = this._root.querySelector('a');
      this._searchBar = this._root.querySelector('input');
      this._handleKeyUp = this._handleKeyUp.bind(this);

      this._addEventHandlers();
    }

    get search(){
      return this._searchBar.value;
    }

    set search(v){
      this._searchBar.value = v;
    }


    _handleClick(evt){
      document.dispatchEvent(new Event("toggleNav"));
    }

    _handleInput(evt){
      document.dispatchEvent(new CustomEvent("search", {detail: evt.target.value}));
    }

    _handleKeyUp(evt){
      if (evt.keyCode === 13){
        this._handleInput(evt);
      }
      return true;
    }

    _addEventHandlers(){
      this._menu.addEventListener('click', this._handleClick);
      this._searchBar.addEventListener('input', this._handleInput);
      this._searchBar.addEventListener('keyup', this._handleKeyUp);
    }


  }

  document.registerElement("wuzhu-header", WuZhuHeader);
}