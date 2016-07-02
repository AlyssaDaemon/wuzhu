/* global PouchDB, page, Toast, emit, Page, showdown  */
//PouchDB.debug.enable('*');

showdown.setOption("strikethrough", 'true');
showdown.setOption("tables", 'true');
showdown.setOption("tasklists", 'true');
showdown.setOption("tablesHeaderId", 'true');
showdown.setOption("omitExtraWLInCodeBlocks", 'true');
showdown.setOption("literalMidWordUnderscores","true");

class WuZhu {
  static get defaults(){
    return {};
  }
  constructor(){
    this.db = {
      local: new PouchDB(window.config.db_name),
      remote: new PouchDB(`https://${window.config.db_host}/${window.config.db_name}`, { skipSetup: true })
    }
    this._sidenav = document.querySelector("side-nav");
    this._stage = document.querySelector("view");
    this._searchEl = document.querySelector("search-results");


    this.showIndex = this.showIndex.bind(this);
    this.getArticle = this.getArticle.bind(this);
    this.showArticle = this.showArticle.bind(this);
    this._handleLogin = this._handleLogin.bind(this);
    this._checkSession = this._checkSession.bind(this);
    this._saveMetadata = this._saveMetadata.bind(this);
    this._getMetadata = this._getMetadata.bind(this);
    this._clearStage = this._clearStage.bind(this);
    this._toggleFav = this._toggleFav.bind(this);
    this.newArticle = this.newArticle.bind(this);
    this._addFav = this._addFav.bind(this);
    this._delFav = this._delFav.bind(this);
    this._saveMetadata = this._saveMetadata.bind(this);
    this._saveArticle = this._saveArticle.bind(this);
    this._deleteArticle = this._deleteArticle.bind(this);
    this._search = this._search.bind(this);
    this._parseTitles = this._parseTitles.bind(this);
    this._initServiceWorker = this._initServiceWorker.bind(this);


    this._addEventListeners();
    this._addRoutes();
    this._initDbFuncs();
    this._initServiceWorker();
  }

  _initServiceWorker(){
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/worker.js').then(function(registration) {
        // Registration was successful
        //console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }).catch(function(err) {
        // registration failed :(
        //console.log('ServiceWorker registration failed: ', err);
      });
    }
  }

  _initDbFuncs(){
    this.db.local.put({
      _id: "_design/tagView",
      views: {
        tagView: {
          map: function(doc){
            if (doc.tags){
              doc.tags.forEach(function(tag){
                emit(tag);
              });
            }
          }.toString(),
          reduce: "_count"
        }
      }
    }).catch(err => {
      if (err.name !== "conflict"){
        throw err;
      }
    })

    this.db.local.put({
      _id: "_design/titleView",
      views: {
        titleView: {
          map: function(doc){
            emit(doc.title);
          }.toString()
        }
      }
    }).catch(err => {
      if (err.name !== "conflict"){
        throw err;
      }
    })
  }

  _clearStage() {
    if (this._stage.classList.contains("hidden")){
      this._stage.classList.remove("hidden");
      this._searchEl.classList.add("hidden");
    }
    while(this._stage.firstChild){
      this._stage.removeChild(this._stage.firstChild);
    }
    if (arguments[1] && (typeof arguments[1] === "function")){
      arguments[1]();
    }
  }

  _parseTitles(term, res){
    let articles = [];
    let reg = new RegExp(term, "i");
    res.rows.forEach(r => {
      if (reg.test(r.key)){
        articles.push(r.doc);
      }
    });
    this.db.local.query("tagView", {include_docs: true, reduce: false}).then(docs => {
      let tags = [];
      let reg = new RegExp(term, "i");
      docs.rows.forEach(tag => {
        if(reg.test(tag.key)){
          let found = false;
          for(let v of tags){
            if(v.name === tag.key){
              v.articles.push(tag.doc);
              found = true;
              break;
            }
          }
          if (!found){
            tags.push({
              name: tag.key,
              articles: [tag.doc]
            });
          }
        }
      })
      return tags;
    }).then(tags => {
        if(articles.length > 0 || tags.length > 0){
        this._stage.classList.add("hidden");
        this._searchEl.classList.remove("hidden");
        this._searchEl.results = { articles: articles, tags: tags };
        }
      })
  }

  _search(evt){
    let term = evt.detail;
    if (term.length > 2){
      this.db.local.query("titleView", {include_docs: true})
        .then((docs) => {
          this._parseTitles(term, docs);
        });
    } else {
      this._stage.classList.remove("hidden");
      this._searchEl.classList.add("hidden");
    }
  }

  _getMetadata(user){
    return new Promise((resolve) => {
      this.db.remote.getUser(user).then(doc => {
        let metadata = { starred_articles: doc.starred_articles}
        localStorage.setItem("user", JSON.stringify(metadata));
        resolve(metadata);
      }).catch(() => {
        resolve(JSON.parse(localStorage.getItem('user') || '{ "starred_articles": [] }' ));
      });
    }).then(metadata => {
      this._user = { name: user, metadata: metadata };
      localStorage.setItem("user", JSON.stringify(metadata));
      metadata.starred_articles.forEach((article) => {
        let li = document.createElement("li");
       li.addEventListener('click', () => {
         page(`/${article._id || "" }`);
       });
       li.textContent = article.title;
       this._sidenav.querySelector("#favs").appendChild(li);
      })
    });
  }
  _handleLogin(evt){
    let creds = evt.detail;
    this.db.remote.login(creds.username, creds.password, { ajax: { headers: { Authorization: 'Basic ' + window.btoa(creds.username + ':' + creds.password) } }}).then(user => {
      let login = document.querySelector('login-modal');
      this._stage.removeChild(login);
      return user.name
    }).then(name => {
      this._getMetadata(name).then(() => {
        this.sync();
      });
    }).catch(err => {
      if (err.name === "unauthorized"){
        new Toast("Wrong username or password", "alert", 5000);
      } else {
        new Toast(`${err}`, "alert");
      }
    });

  }

  sync(){
    return this.db.local.sync(this.db.remote, {live: true, retry: true})
      .on("paused", () => {
          new Toast("Sync Finished");
      })
      .on("active", () => {
        new Toast("Sync active");
      });
  }

  _checkSession(){
    return this.db.remote.getSession().then(session => {
      if (session.userCtx.name === null){
        let login = document.createElement("login-modal");
        login.addEventListener("login", this._handleLogin);
        this._stage.appendChild(login);
      } else {
        this._getMetadata(session.userCtx.name);
        this.sync();
      }
    });
  }

  showArticle(doc){
    document.dispatchEvent(new Event("hideNav"));
    let page = new Page(doc);
    let article = document.createElement("wiki-article");
    article.fav = this._isFaved(page.id);
    article.page = page;
    this._stage.appendChild(article);
  }

  getArticle(ctx){
    this.db.remote.get(ctx.params.article).then(this.showArticle).catch(() => {
      this.db.local.get(ctx.params.article).then(this.showArticle).catch(() => {
        this.newArticle({params: { title: ctx.params.article }  });
      })
    })
  }

  _addRoutes(){
    this._checkSession();
    page("/new",this._clearStage, this.newArticle);
    page("/:article", this._clearStage, this.getArticle);
    page("/", this._clearStage, this.showIndex);
    page.start();
  }

  showIndex(){
      this.db.remote.get("index").then(this.showArticle).catch( () => {
        this.db.local.get("index").then(this.showArticle);
      });
  }

  newArticle(ctx){
    let page = new Page();
    if ("title" in ctx.params){
      page.title = this._titleCase(ctx.params.title);
    }
    let article = document.createElement("wiki-article");
    article.page = page;
    this._stage.appendChild(article);
  }

  _isFaved(id){
    let favs = JSON.parse(localStorage.getItem('user')).starred_articles;
    for (let fav of favs){
      if (fav._id === id){
        return true;
      }
    }
    return false;
  }

  _saveArticle(evt){
    let doc = evt.target._page.doc;
    let first = false;
    if (doc._id === null){
      doc._id = doc.title.toLowerCase().replace(/ /g, "-");
      first = true;
    }
    return this.db.local.put(doc).then(res =>{
      evt.target.rev = res.rev;
      if (first) page(`/${res.id}`);
      new Toast((evt.type === "autoSaveArticle") ? "Autosaved Article" : "Article Saved");
    }).catch(err => {
      if (err.name == "conflict"){
        new Toast("Document has a Conflict, did not save.", "alert", 5000);
      }
    });
  }

  _deleteArticle(evt){
    let doc = evt.detail;
    this.db.local.remove(doc).then(() =>{
      page("/");
    })
  }

  _saveMetadata(){
    let metadata = JSON.parse(localStorage.getItem('user'));
    this.db.remote.putUser(this._user.name, { metadata: metadata })
  }

  _addFav(fav){
    let user = JSON.parse(localStorage.getItem('user'));
    user.starred_articles.push(fav);
    localStorage.setItem('user', JSON.stringify(user));
    this._saveMetadata();
    let li = document.createElement('li');
    li.textContent = fav.title;
    li.addEventListener('click', () => {
      page(`/${fav._id}`);
    });
    this._sidenav.querySelector("#favs").appendChild(li);

  }
  _delFav(fav){
    let user = JSON.parse(localStorage.getItem('user'));
    user.starred_articles.splice(user.starred_articles.indexOf(fav), 1);
    localStorage.setItem("user", JSON.stringify(user));
    this._saveMetadata();


    let favs = this._sidenav.querySelector("#favs");
    for(let child of favs.children){
      if (child.textContent === fav._id){
        favs.removeChild(child);
      }
    }

  }

  _toggleFav(evt) {
    let doc = evt.detail;
    let fav = { _id: doc.id, title: doc.title};
    let favved = this._isFaved(fav._id);
    if (!favved){
      this._addFav(fav);
    } else {
      this._delFav(fav);
    }
    new Toast(doc.title + (favved ? " unfaved" : " faved" ));
  }

  _addEventListeners(){
    document.addEventListener("togglefav", this._toggleFav);
    document.addEventListener("saveArticle", this._saveArticle);
    document.addEventListener("autoSaveArticle", this._saveArticle);
    document.addEventListener("deleteArticle", this._deleteArticle);
    document.addEventListener("search", this._search)
  }

  _titleCase(url){
    let smalls = ['of', 'for', 'and'];
    return url.replace(/-/g, " ").replace(/(\w)(\w*)/g, function(_, i, r){
        let j = i.toUpperCase() + (r != null ? r : "");
        return (smalls.indexOf(j.toLowerCase())<0)?j:j.toLowerCase();
    });
  }

}

window.app = new WuZhu();