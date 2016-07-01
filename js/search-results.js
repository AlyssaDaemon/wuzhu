function registerSearchResults(doc){
    /*exampleResult = {
    articles: [

    ],
    tags: [
      {
        name: "index",
        articles: []
      },
      {
        name: "history",
        articles: []
      }
    ]

  }*/

  class SearchResult extends HTMLElement {
    createdCallback(){
      this._root = this.createShadowRoot();
      this._template = doc.querySelector("#searchResult");
      this._root.appendChild(document.importNode(this._template.content, true));
      this._container = this._root.querySelector("#container");
      this._articles = this._root.querySelector("#named");
      this._tagged = this._root.querySelector("#tagged");

      this._showResults = this._showResults.bind(this);
      this._hideResults = this._hideResults.bind(this);
      this._clearResults = this._clearResults.bind(this);

      this._addEventHandlers();
    }

    _showResults(){
      this._container.classList.remove("hidden");
    }

    _hideResults(){
      this._container.classList.add("hidden");
    }

    set results(v){
      this._clearResults();
      for (let i of v.articles){
        let article = document.createElement("search-card");
        article.page = i;
        this._articles.appendChild(article);
      }
      for (let tag of v.tags) {
        let tagged_articles = document.createElement("div");
        let article_title = document.createElement("span");
        article_title.classList.add("tagHead");
        article_title.textContent = tag.name;
        tagged_articles.classList.add("tagBox");
        tagged_articles.appendChild(article_title);
        for(let i of tag.articles){
          let article = document.createElement("search-card");
          article.page = i;
          tagged_articles.appendChild(article);
        }
        this._tagged.appendChild(tagged_articles);
      }
      this._showResults();
    }

    _clearResults(){
      this._hideResults();
      let fc = this._articles.firstChild;
      while (fc) {
        this._articles.removeChild(fc);
        fc = this._articles.firstChild;
      }
      fc = this._tagged.firstChild;
      while (fc) {
        this._tagged.removeChild(fc);
        fc = this._tagged.firstChild;
      }

    }

    _addEventHandlers(){

    }

  }
  document.registerElement("search-results", SearchResult);
}