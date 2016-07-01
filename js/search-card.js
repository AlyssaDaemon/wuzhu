function registerSearchCard(doc){
    class SearchCard extends HTMLElement {
    createdCallback(){
      this._root = this.createShadowRoot();
      this._template = doc.querySelector("#searchCard");
      this._root.appendChild(document.importNode(this._template.content, true));
      this._tagsEl = this._root.querySelector("#tags");
      this._titleEl = this._root.querySelector("#title");
      this._blurbEL = this._root.querySelector("#blurb");
      this.path = "";
      this._page = new Page();

      this._handleClick = this._handleClick.bind(this);

      this._registerEventHandlers();
    }

    set page(v){
      this._page = v;
      this._titleEl.textContent = v.title;
      this._blurbEL.innerHTML = new showdown.Converter().makeHtml(v.markdown);
      for (let i of v.tags) {
        let tag = document.createElement("div");
        tag.classList.add("tag");
        tag.textContent = i;
        this._tagsEl.appendChild(tag);
      }
    }

    get page() {
      return this._page;
    }

    _registerEventHandlers() {
      this.addEventListener("click", this._handleClick);
    }

    _handleClick(evt) {
      evt.preventDefault();
      page(`/${this._page.url}`);
    }

  }
  document.registerElement("search-card", SearchCard);
}