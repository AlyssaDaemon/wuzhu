function registerEditor(doc){
  class WikiEditor extends HTMLElement {
     createdCallback(){
      this._root = this.createShadowRoot();
      this._template = doc.querySelector('#editor');
      this._root.appendChild(doc.importNode(this._template.content, true));
      this._dirty = false;
      this._idle = 0;
      this._initialValue = "";

      this._editor = this._root.querySelector('#editspace');
      this._previewButton = this._root.querySelector('#previewButton');

      this._markdown = new showdown.Converter();

      this._addMarkdown = this._addMarkdown.bind(this);
      this._addMarkdownChar = this._addMarkdownChar.bind(this);
      this._addMarkdownLink = this._addMarkdownLink.bind(this);
      this._addMarkdownEnvelop = this._addMarkdownEnvelop.bind(this);
      this._addMarkdownHTML = this._addMarkdownHTML.bind(this);
      this._addMarkdownTable = this._addMarkdownTable.bind(this);
      this._getIdle = this._getIdle.bind(this);
      this._resetIdle = this._resetIdle.bind(this);
      this._togglePreview = this._togglePreview.bind(this);
      this._save = this._save.bind(this);
      this._toolbarRules = {
        "link": {
          regex: new RegExp(/\[\]\(\)/),
          method: this._addMarkdownLink
        },
        "enveloping": {
          regex: new RegExp(/(\[\]\(\))|[*_`~]/g),
          method: this._addMarkdownEnvelop
        },
        "character": {
          regex: new RegExp(/(1. )|[>#-]/g),
          method: this._addMarkdownChar
        },
        "htmlElement": {
          regex: new RegExp(/[a-z]/ig),
          method: this._addMarkdownHTML
        },
        "table": {
          regex: new RegExp(/\|/g),
          method: this._addMarkdownTable
        }
      }

      this._idleTimer = setInterval(5000, this._getIdle);

      this._addEventHandlers();
    }

    getHtml() {
      return this._markdown.makeHtml(this._editor.value);
    }

    set content(v) {
      this._initialValue = v;
      this._editor.textContent = v;
    }

    attachedCallback(){

    }

    get value() {
      return this._editor.value;
    }

    characterCount(){
      let v = this._editor.value;
      let urlEater = new RegExp(/https?:\/+[\w./-]+/,"ig");
      let characterCounter = new RegExp(/\w/ig);
      let checkmarkEater = new RegExp(/\[x\]/ig);
      v = v.replace(checkmarkEater, "")
      v = v.replace(urlEater, "");

      return v.match(characterCounter).length;
    }

    wordCount(){
      let v = this._editor.value;
      let urlEater = new RegExp(/https?:\/+[\w./-]+/,"ig");
      let wordCounter = new RegExp(/\w+/ig);
      let checkmarkEater = new RegExp(/\[x\]/ig);
      v = v.replace(checkmarkEater, "")
      v = v.replace(urlEater, "");

      return v.match(wordCounter).length;

    }

    get textContent(){
      return this._editor.textContent;
    }

    set textContent(v){
      this._editor.textContent = v;
    }

    _togglePreview(evt) {
      let hidden = this._root.querySelector('#previewArea').classList.contains("hidden");
      let previewArea = this._root.querySelector('#previewArea');
      if (hidden) { //Show Preview
        previewArea.innerHTML = this._markdown.makeHtml(this._editor.value);
        this._previewButton.classList.add("previewActive");
        this._editor.classList.add("hidden");
        previewArea.classList.remove("hidden");
      } else {
        this._previewButton.classList.remove("previewActive");
        this._editor.classList.remove("hidden");
        previewArea.classList.add("hidden");
        let fc = previewArea.firstChild;
        while (fc) {
          previewArea.removeChild(fc);
          fc = previewArea.firstChild;
        }
      }
    }

    _getIdle() {
      this._idle++;
      this._dirty = this._dirty || (this._editor.value !== this._page.markdown);
      if (this._idle > this._autoSaveTime && this._dirty) {
        this._save();
      }
    }

    _save() {
      this._dirty = false;
      this.dispatchEvent(new Event("auto-save"));
    }


    _resetIdle() {
      this.idle = 0;
    }

    _addEventHandlers(){
      let buttons = this._root.querySelectorAll("#toolbar a[data-character]");
      for (let button of buttons) {
        button.addEventListener("click", this._addMarkdown);
      }
      this._previewButton.addEventListener("click", this._togglePreview);
      this._editor.addEventListener("keydown click touchstart", this._resetIdle);
    }

    _addMarkdown(evt) {
      let character = evt.target.attributes["data-character"].value;
      let content = this._editor.value;
      let selectStart = this._editor.selectionStart;
      let selectEnd = this._editor.selectionEnd;
      for (let i in this._toolbarRules){
        let rule = this._toolbarRules[i];
        if(rule.regex.test(character)) {
          this._editor.value = content.substring(0, selectStart) + rule.method(character, selectStart, selectEnd, content) + content.substring(selectEnd);
          this._dirty = true;
          break;
        }
      }
      //this._editor.selectionStart += character.length;
      //this._editor.selectionEnd = this._editor.selectionStart;
      this._editor.focus();
    }

    _addMarkdownChar(char, start, end, content) {
      return `${char}${content.substring(start,end)}`;

    }

    _addMarkdownEnvelop(char,start,end, content) {
      return `${char}${content.substring(start,end)}${char}`;
    }

    _addMarkdownLink(char, start,end,content) {
      let link = char === "![]()" ? "![" : "[";
      return link + content.substring(start,end) + "]()";
    }
    _addMarkdownHTML(char,start,end,content) {
      return `<${char}>${content.substring(start,end)}</${char}>`;
    }
    _addMarkdownTable(char,start,end,content) {
      return "| h1    |    h2   |      h3 |\n" +
             "|:------|:-------:|--------:|\n" +
             "| 100   | [a][1]  | ![b][2] |\n" +
             "| *foo* | **bar** | ~~baz~~ |\n";
    }
   }

   document.registerElement("wiki-editor", WikiEditor);
}