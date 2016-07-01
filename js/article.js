function registerArticle(doc){
  class WikiArticle extends HTMLElement {
    createdCallback () {
      this._root = this.createShadowRoot();
      this._template = doc.querySelector('#wiki-article');
      this._root.appendChild(document.importNode(this._template.content, true));
      this._page = new Page();

      this._title = this._root.querySelector("#title");
      this._editButton = this._root.querySelector('#editButton');
      this._saveButton = this._root.querySelector('#saveButton');
      this._editor = this._root.querySelector('wiki-editor');
      this._article = this._root.querySelector('article');
      this._articleEl = this._root.querySelector('.articleContainer');
      this._editorEl = this._root.querySelector('.editor');
      this._titleInput = this._root.querySelector('#titleInput');
      this._EtagsEl = this._root.querySelector('.editor .tags');
      this._AtagsEl = this._root.querySelector('.articleContainer .tags');
      this._tagAdder = this._root.querySelector('#tagAdder');
      this._star = this._root.querySelector('#star');
      this._delBtn = this._root.querySelector('#deleteBtn')

      this._toggleEditable = this._toggleEditable.bind(this);
      this._saveArticle = this._saveArticle.bind(this);
      this.showEditor = this.showEditor.bind(this);
      this._deleteTag = this._deleteTag.bind(this);
      this._autoSaveArticle = this._autoSaveArticle.bind(this);
      this._addTag = this._addTag.bind(this);
      this._clearTags = this._clearTags.bind(this);
      this._setTags = this._setTags.bind(this);
      this._starClick = this._starClick.bind(this);

      this._registerEventHandlers();
    }

    attachedCallback () {
      if (this._page.markdown == "") {
        this._toggleEditable(null);
      }
    }

    set page(v){
      let markdown = new showdown.Converter();
      if(! v instanceof Page) {
        return console.error(`${v} is not a Page`);
      }
      if (v._id){
        this._delBtn.classList.remove("hidden");
      }
      this._page = v;
      this._title.textContent = v.title;
      this._editor.content = v.markdown;
      this._article.innerHTML = markdown.makeHtml(v.markdown);
      this._titleInput.value = v.title;

      this._setTags(v.tags);


      if(v.markdown === null){
        this._toggleEditable();
      }
    }

    get page(){
      return this._page;
    }

    _deleteTag(evt) {
      console.log("delete event", evt);
      this._page.tags.splice(this._page.tags.indexOf(evt.detail),1);
      for(let chit of this._EtagsEl.children){
        if (chit.textContent === evt.detail){
          this._EtagsEl.removeChild(chit);
          break;
        }
      }
      for (let chit of this._AtagsEl.children){
        if (chit.textContent === evt.detail){
          this._AtagsEl.removeChild(chit);
          break;
        }
      }
    }

    _clearTags(){
      var tags = [this._EtagsEl, this._AtagsEl]
      for (let tag of tags){
        let fc = tag.firstChild;
        while (fc){
          tag.removeChild(fc);
          fc = tag.firstChild;
        }
      }
    }

    _addTag(name){
      this._page.tags.push(name);
      let atag = document.createElement('wiki-chit');
      let etag = document.createElement('wiki-chit');
      atag.readonly = true;
      etag.textContent = name;
      atag.textContent = name;
      etag.addEventListener('deleteClick', this._deleteTag);
      this._EtagsEl.appendChild(etag);
      this._AtagsEl.appendChild(atag);
    }

     _setTags(tags){
      for(let i of tags){
        let etag = document.createElement('wiki-chit');
        let atag = document.createElement('wiki-chit');
        atag.readonly = true;
        atag.textContent = i;
        etag.textContent = i;
        etag.addEventListener('deleteClick', this._deleteTag);
        this._EtagsEl.appendChild(etag);
        this._AtagsEl.appendChild(atag);
      }
    }

    showEditor(){
      if (!this._editorEl.classList.contains("hidden")){
        this._toggleEditable(null);
      }
    }

    _saveArticle(evt) {
      this._page.markdown = this._editor.value;
      this._article.innerHTML = this._editor.getHtml();
      if (this._page.title !== this._titleInput.value) {
        this._page.title = this._titleInput.value;
        this._title.textContent = this._titleInput.value;
      }
      this._toggleEditable(null);
      this.dispatchEvent(new Event("saveArticle", { bubbles: true }));
    }

    _autoSaveArticle(evt) {
      this._page.markdown = this._editor.value;
      this._article.innerHTML = this._editor.getHtml();
      if (this._page.title !== this._titleInput.value) {
        this._page.title = this._titleInput.value;
        this._title.textContent = this._titleInput.value;
      }
      new Toast("Autosaving Article");
      this.dispatchEvent(new Event("saveArticle", { bubbles: true }));
    }

    _toggleEditable(evt) {
      let hidden = this._editorEl.classList.contains("hidden");
      let actionArea = this._root.querySelector('div.actions');
      if (hidden) {
        this._editorEl.classList.remove("hidden");
        actionArea.classList.add("hidden");
        this._articleEl.classList.add("hidden");
        this._editor._editor.focus();
      } else {
        this._editorEl.classList.add("hidden");
        actionArea.classList.remove("hidden");
        this._articleEl.classList.remove("hidden");
      }

    }

    _addchit(name){

    }

    _setArticleContent(editor) {
      this._page.content = editor._editor.value;
      this._article.innerHTML = editor.getHtml();
    }

    set fav(v) {
      this._star.textContent = v ? "star" : "star_border"
    }

    _starClick(evt) {
      this.fav = !(this._star.textContent === "star");
      document.dispatchEvent(new CustomEvent("togglefav", {detail: this._page }));
    }

    set rev(v){
      this._page.rev = v;
    }

    _registerEventHandlers () {
      this._editButton.addEventListener("click", this._toggleEditable);
      this._saveButton.addEventListener("click", this._saveArticle);
      this._editor.addEventListener("auto-save", this._autoSaveArticle);
      this._tagAdder.addEventListener("keyup", (evt) => {
        if (evt.keyCode === 13){
          this._addTag(evt.target.value);
          evt.target.value = "";
        }
      });
      this._star.addEventListener("click", this._starClick);
      this._delBtn.addEventListener("click", (e) => {
        document.dispatchEvent(new CustomEvent("deleteArticle", {detail: this._page }));
      })
    }
  }
  document.registerElement("wiki-article", WikiArticle);
}