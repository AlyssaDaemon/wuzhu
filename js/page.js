class Page {
  static get defaults() {
    return {
      _id: null,
      _rev: undefined,
      title: null,
      markdown: null,
      tags: [],
      created: {
        at: new Date(),
        by: null
      },
      edited: {
        at: new Date(),
        by: null
      }
    }
  }
  constructor() {
    this.doc = Page.defaults;
    if (typeof arguments[0] === "object") {
      for(let i in arguments[0]){
        this.doc[i] = arguments[0][i];
      }
    }

  }

  get id(){
    return this.doc._id;
  }

  get title(){
    return this.doc.title;
  }

  set title(v){
    this.doc.title = v;
  }

  get markdown(){
    return this.doc.markdown;
  }

  get url(){
    return this.doc._id;
  }

  set markdown(v){
    this.doc.edited.at = new Date();
    this.doc.markdown = v;
  }

  get tags(){
    return this.doc.tags;
  }

  addTag(tag){
    this.doc.tags.push(tag);
  }
  removeTag(tag){
    if (this.doc.tags.includes(tag)){
      this.doc.tags.splice(this.doc.tags.indexOf(tag),1);
    }
  }

  set rev(v){
    this.doc._rev = v;
  }

  get json(){
    return this.doc;
  }

}

window.Page = Page;