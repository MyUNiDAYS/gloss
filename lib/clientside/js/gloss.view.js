var glossView = (function () {
	function f() {
		this.$searchInput = $('#Search input');
		this.DOM = {
			activeAZFilter:false
		};
		this._numFilters=0;
		this._lastScrollPos = 0;
		measure.call(this);
	};
	f.prototype.init = function (terms, termIds, termsByLetter) {
		initSearch.call(this, terms);
		cacheDOM.call(this, termIds);
		bindInternalEventListeners.call(this);

		createEventDispatchers.call(this);
	}
	//tag filter
	f.prototype.openTagFilter = function() {
		this.resetTagFilter();
		this.showAll();
		this.DOM.tagFilter.classList.add("open");
		this._tagFilterOpen=true;
		if(!this._tagFilterClickOnBodyHandler)
			this._tagFilterClickOnBodyHandler = function() {
				this.closeTagFilter();
			}.bind(this);
		this.DOM.body.addEventListener("click",this._tagFilterClickOnBodyHandler);
	}
	f.prototype.closeTagFilter = function() {
		this.DOM.tagFilter.classList.remove("open");
		this._tagFilterOpen=false;
		this.DOM.body.removeEventListener("click",this._tagFilterClickOnBodyHandler);
	}
	f.prototype.setTagFilterTo = function(content) {
		this.DOM.tagFilterCurrentTag.innerHTML = "tag: "+content;
		this.DOM.tagFilter.classList.add("withValue");
		this._numFilters++;
		this.DOM.clearAllFilters.classList.add("visible"); 
	}
	f.prototype.resetTagFilter = function(content) {
		this.DOM.tagFilterCurrentTag.innerHTML = "Filter by tag";
		this.DOM.tagFilter.classList.remove("withValue");
		
		if(this._numFilters>0) this._numFilters--;
		if(!this._numFilters)
			this.DOM.clearAllFilters.classList.remove("visible");
	}
	//letter scroller	
	f.prototype.openLetterScroller = function() {
		this.DOM.letterScroller.classList.add("open");
		this._letterScrollerOpen=true;
		if(!this._letterScrollerClickOnBodyHandler)
			this._letterScrollerClickOnBodyHandler = function() {
				this.closeLetterScroller();
			}.bind(this);
		this.DOM.body.addEventListener("click",this._letterScrollerClickOnBodyHandler);
	}
	f.prototype.closeLetterScroller = function() {
		this.DOM.letterScroller.classList.remove("open");
		this._letterScrollerOpen=false;
		this.DOM.body.removeEventListener("click",this._letterScrollerClickOnBodyHandler);
	}		

	f.prototype.scrollToLetter = function (letter) {
		//find px position where the letter starts
		this.scrollToPx(elementStart(this.DOM.separators[letter]));
	}
	f.prototype.scrollToPx = function(newScrollTop) {

		var headerHeight = 140,
			start = window.pageYOffset,
			change = newScrollTop - start - headerHeight,
			currentTime = 0,
			secondsNow = new Date().getTime(),
			dur = 500;

		animateScroll.call(this,start,change,secondsNow, dur);
	}
	f.prototype.scrollToTermID = function (termID) {
		testID.call(this, termID);

		this.scrollToPx(elementStart(this.DOM.terms[termID]));
		
		if(!this.DOM.terms[termID].classList.contains("focused")) {
			this.DOM.terms[termID].classList.add("focused");
			window.setTimeout(function() {
				this.DOM.terms[termID].classList.remove("focused");
			}.bind(this),2000);
		}
		window.location.hash = '#Term_' + termID;
		//Offset by header height (plus extra 50 pixels)
		window.scrollBy(0, - this.measures.headerHeight - 50);
	}
	f.prototype.isVisible = function (termID) {
		testID.call(this, termID);
		return this.DOM.terms[termID].style.display != "none";
	}
	f.prototype.showOnlyTheseIds = function (termIds) {
		hideAllTerms.call(this);
		termIds.forEach(this.showId.bind(this));
	}
	f.prototype.showAll = function () {
		Object.keys(this.DOM.terms).forEach(this.showId.bind(this));
	}
	f.prototype.showId = function (termID) {
		testID.call(this, termID);

		this.DOM.terms[termID].style.display = "";
		var firstLetter = termID.substr(0,1);
		this.DOM.separators[firstLetter].style.display = "";
		this.DOM.letterOptions[firstLetter].style.display = "";
	}
	f.prototype.collapseHeader = function() {
		this.DOM.header.classList.add("collapsed");
	}
	f.prototype.resetHeader = function() {
		this.DOM.header.classList.remove("collapsed");
	}
	f.prototype.resetScrollingDirection = function() {
		
		var once = function () {
			console.log("once running", window.scrollY,this._lastScrollPos);
			if(window.scrollY<this._lastScrollPos) {
				this.scrollingDown = false;
				this.events.changeScrollDirection.notify("up");
			}
			if(window.scrollY>this._lastScrollPos) {
				this.scrollingDown = true;
				this.events.changeScrollDirection.notify("down");
			}
			window.removeEventListener("scroll",once);
		}.bind(this);

		window.addEventListener("scroll",once);
	}

	function testID(termID) {
		if(this.DOM.terms[termID]) return true;
		this.events.error.notify('The term "' + termID+'" does not appear in the glossary');
	}

	function hideAllTerms() {
		Object.keys(this.DOM.terms).forEach(function (id) {
			this.DOM.terms[id].style.display = "none";
		}.bind(this));
		Object.keys(this.DOM.separators).forEach(function (letter) {
			//hide all separators
			this.DOM.separators[letter].style.display = "none";
			//hide all letters in scroller
			this.DOM.letterOptions[letter].style.display = "none";
		}.bind(this));	
	}


	function initSearch(terms) {
		var dis = this;
		this.$searchInput.autocomplete(terms, {
			matchContains: true,
			resultsClass: "ac_results",
			scroll: false,
			inputFocus: false,
			hideOnBlur: true,
			noResults: 'no results'
		}).result(function (ev, item) {
			dis.$searchInput.blur().val('');
			//notify listeners
			dis.events.searchTermSelected.notify(ev, item);
		});
	}

	function cacheDOM(termIds) {
		this.DOM.terms = {};
		termIds.forEach(function (t) {
			this.DOM.terms[t] = document.getElementById('Term_' + t);
			if (!this.DOM.terms[t]) throw "Definition for term " + t + " not found.";
		}.bind(this));

		this.DOM.body = document.body;

		
		this.DOM.header = document.querySelector("header");

		this.DOM.tagFilter = document.querySelector(".tagFilter");
		this.DOM.tagFilterCurrentTag = this.DOM.tagFilter.querySelector(".chosenOption span");
		this.DOM.clearAllFilters = document.getElementById("clearFilters");

		this.DOM.letterScroller = document.querySelector(".letterScroller");

		this.DOM.separators = {};
		var separators = document.querySelectorAll(".separator");	
		for (var i=0;i<separators.length;i++) {
			this.DOM.separators[separators[i].textContent.toLowerCase()] = separators[i];
		}

		this.DOM.letterOptions = {};
		var letterOptions = this.DOM.letterScroller.querySelectorAll("a");	
		for (var i=0;i<letterOptions.length;i++) {
			this.DOM.letterOptions[letterOptions[i].getAttribute("data-letter").toLowerCase()] = letterOptions[i];
		}
	}
	function bindInternalEventListeners() {
		this.DOM.tagFilter.querySelector(".chosenOption").addEventListener("click",function(e) {
			if(!this._tagFilterOpen) {
				this.openTagFilter();
				e.stopPropagation();
			}
		}.bind(this));

		this.DOM.letterScroller.querySelector(".chosenOption").addEventListener("click",function(e) {
			if(!this._letterScrollerOpen) {
				this.openLetterScroller();
				e.stopPropagation();
			}
		}.bind(this));		

		window.addEventListener("scroll",function() {
			if(this.scrollingDown) {
				if(window.scrollY<this._lastScrollPos) {
					this.scrollingDown = false;
					this.events.changeScrollDirection.notify("up");
				}
			} else {
				if(window.scrollY>this._lastScrollPos) {
					this.scrollingDown = true;
					this.events.changeScrollDirection.notify("down");
				}

			}
			this._lastScrollPos = window.scrollY;
		}.bind(this));
	}
	function createEventDispatchers() {
		this.events = {};
		this.events.error = new Observable();
		this.events.searchTermSelected = new Observable();
		this.events.referenceClicked = new Observable();
		$('a.reference').click(function (e) {
			this.events.referenceClicked.notify(e.currentTarget.getAttribute("data-term"));
		}.bind(this));


		//tag filter opens
		this.events.tagFilterOpened = new Observable();
		this.DOM.tagFilter.addEventListener("click",function() {
			this.events.tagFilterOpened.notify();
		}.bind(this));

		//tag clicking
		this.events.tagFilterOptionChosen = new Observable();
		var tagOptions = this.DOM.tagFilter.querySelectorAll('a');
		for (var i=0;i<tagOptions.length;i++) {
			tagOptions[i].addEventListener("click",function (optionClicked) {
				return function() {
					this.events.tagFilterOptionChosen.notify(optionClicked.getAttribute("data-tag"), optionClicked.textContent);
				}.bind(this);
			}.call(this,tagOptions[i]));
		}	
		var tagsInDefinitions = document.querySelectorAll('a.tag-link');
		for (var i=0;i<tagsInDefinitions.length;i++) {
			tagsInDefinitions[i].addEventListener("click",function (optionClicked) {
				return function() {
					this.events.tagFilterOptionChosen.notify(optionClicked.getAttribute("data-tag"), optionClicked.textContent);
				}.bind(this);
			}.call(this,tagsInDefinitions[i]));
		}	

		//letter scrolling
		this.events.letterScrollerOptionChosen = new Observable();
		var letterOptions = this.DOM.letterScroller.querySelectorAll('a');
		for (var i=0;i<letterOptions.length;i++) {
			letterOptions[i].addEventListener("click",function (optionClicked) {
				return function() {
					this.events.letterScrollerOptionChosen.notify(optionClicked.getAttribute("data-letter").toLowerCase());
				}.bind(this);
			}.call(this,letterOptions[i]));
		}	

		//clear all filters
		this.events.clearAllFilters = new Observable();
		this.DOM.clearAllFilters.addEventListener("click",function() {
			this.events.clearAllFilters.notify();
		}.bind(this));		

		
		this.events.changeScrollDirection = new Observable();
		this.events.mouseIntoHeader = new Observable();
		this.DOM.header.addEventListener("mouseenter",function() {
			this.events.mouseIntoHeader.notify();
		}.bind(this));
	};

	function measure() {
		this.measures = {};
		this.measures.headerHeight = $('header')[0].offsetHeight;
	}

	function scrollEasing(t, b, c, d) {
	    t /= d/2;
	    if (t < 1) return c/2*t*t + b;
	    t--;
	    return -c/2 * (t*(t-2) - 1) + b;
	};
	
	function animateScroll(start,change,now, dur) {
		currentTime = new Date().getTime()-now;
		var val = scrollEasing(currentTime, start, change, dur);                        
		window.scrollTo(0,val); 
		if(currentTime < dur) {
			window.requestAnimationFrame(function() {
				animateScroll(start,change,now, dur);
			});
		} else {
			window.scrollTo(0,start+change);
		}
	};

	function elementStart(element) {
		var curTop = 0;
		do {curTop+=element.offsetTop;} while(element=element.offsetParent);
		return curTop;
	}	
	return f;
})(jQuery);