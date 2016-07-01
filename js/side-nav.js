function registerSideNav(doc){
    class SideNav extends HTMLElement {
    createdCallback() {
      this._root = this.createShadowRoot();
      this._template = doc.querySelector('#sideNav');
      this._root.appendChild(document.importNode(this._template.content, true));

      this.hideButtonEl       = this._root.querySelector('.js-menu-hide');
      this.sideNavEl          = this._root.querySelector('.js-side-nav');
      this.sideNavContainerEl = this._root.querySelector('.js-side-nav-container');

      this.showSideNav = this.showSideNav.bind(this);
      this.hideSideNav = this.hideSideNav.bind(this);
      this.toggleSideNav = this.toggleSideNav.bind(this);
      this.blockClicks = this.blockClicks.bind(this);
      this.onTouchStart = this.onTouchStart.bind(this);
      this.onTouchMove = this.onTouchMove.bind(this);
      this.onTouchEnd = this.onTouchEnd.bind(this);
      this.onTransitionEnd = this.onTransitionEnd.bind(this);
      this.update = this.update.bind(this);

      this.startX = 0;
      this.currentX = 0;
      this.touchingSideNav = false;

      this.supportsPassive = undefined;
      this.addEventListeners();
    }
    attachedCallback() {

    }
    detachedCallback() {

    }
    attributeChangedCalled(name,oldVal,newVal) {

    }
    // apply passive event listening if it's supported
    applyPassive () {
      if (this.supportsPassive !== undefined) {
        return this.supportsPassive ? {passive: true} : false;
      }
      // feature detect
      let isSupported = false;
      try {
        document.addEventListener('test', null, {get passive () {
          isSupported = true;
        }});
      } catch (e) { /**/ }
      this.supportsPassive = isSupported;
      return this.applyPassive();
    }

    addEventListeners () {
      document.addEventListener("showNav", this.showSideNav);
      document.addEventListener("hideNav", this.hideSideNav);
      document.addEventListener("toggleNav", this.toggleSideNav);
      this.hideButtonEl.addEventListener('click', this.hideSideNav);
      this.sideNavEl.addEventListener('click', this.hideSideNav);
      this.sideNavContainerEl.addEventListener('click', this.blockClicks);

      this.sideNavEl.addEventListener('touchstart', this.onTouchStart, this.applyPassive());
      this.sideNavEl.addEventListener('touchmove', this.onTouchMove, this.applyPassive());
      this.sideNavEl.addEventListener('touchend', this.onTouchEnd);
    }

    onTouchStart (evt) {
      if (!this.sideNavEl.classList.contains('side-nav--visible'))
        return;

      this.startX = evt.touches[0].pageX;
      this.currentX = this.startX;

      this.touchingSideNav = true;
      requestAnimationFrame(this.update);
    }

    onTouchMove (evt) {
      if (!this.touchingSideNav)
        return;

      this.currentX = evt.touches[0].pageX;
      const translateX = Math.min(0, this.currentX - this.startX);

      if (translateX < 0) {
        evt.preventDefault();
      }
    }

    onTouchEnd (evt) {
      if (!this.touchingSideNav)
        return;

      this.touchingSideNav = false;

      const translateX = Math.min(0, this.currentX - this.startX);
      this.sideNavContainerEl.style.transform = '';

      if (translateX < 0) {
        this.hideSideNav();
      }
    }

    update () {
      if (!this.touchingSideNav)
        return;

      requestAnimationFrame(this.update);

      const translateX = Math.min(0, this.currentX - this.startX);
      this.sideNavContainerEl.style.transform = `translateX(${translateX}px)`;
    }

    blockClicks (evt) {
      evt.stopPropagation();
    }

    onTransitionEnd (evt) {
      this.sideNavEl.classList.remove('side-nav--animatable');
      this.sideNavEl.removeEventListener('transitionend', this.onTransitionEnd);
    }

    showSideNav () {
      this.sideNavEl.classList.add('side-nav--animatable');
      this.sideNavEl.classList.add('side-nav--visible');
      this.sideNavEl.addEventListener('transitionend', this.onTransitionEnd);
    }

    hideSideNav () {
      this.sideNavEl.classList.add('side-nav--animatable');
      this.sideNavEl.classList.remove('side-nav--visible');
      this.sideNavEl.addEventListener('transitionend', this.onTransitionEnd);
    }

    toggleSideNav() {
      if (this.sideNavEl.classList.contains("side-nav--visible")){
        this.hideSideNav();
      } else {
        this.showSideNav();
      }
    }
  }

  document.registerElement("side-nav", SideNav);
}