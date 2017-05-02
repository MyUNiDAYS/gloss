	var Gloss = (function ($) {
		function f(termsByTag) {
			this.view = new glossView();
			this.model = new glossModel(termsByTag);
			this.view.init(
				this.model.getAllTerms(),
				this.model.getAllIds(),
				this.model.getAllTermsByLetter());

			listenToViewEvents.call(this, this.view, this.model);
		}

		function listenToViewEvents(v,m) {
			v.events.searchTermSelected.attach(function (ev, item) {
				v.showAll();
				v.scrollToTermID(m.getIdForTerm(item[0]));
			});

			v.events.referenceClicked.attach(function (termID) {
				if(!v.isVisible(termID)) {
					v.showAll();
					v.resetTagFilter();
				}
				v.scrollToTermID(termID);
			});

			v.events.error.attach(function (error) {
				//Prob should be alerting from the view
				alert(error);
			});
			
			v.events.tagFilterOptionChosen.attach(function (tagID, tagName) {
				var ids = [];
				if (tagID == "all") {
					v.showAll();
					v.resetTagFilter();
				} else {
					//Find ids we have to show
					var terms = m.getTermsByTagID(tagID);
					var ids = terms.map(m.getIdForTerm);
					v.showOnlyTheseIds(ids);
					v.setTagFilterTo(tagName);
				}
			});	

			v.events.letterScrollerOptionChosen.attach(function (letter) {
				v.scrollToLetter(letter);
			});	

			v.events.clearAllFilters.attach(function () {
				v.resetTagFilter();
				v.showAll();
			});		

			v.events.changeScrollDirection.attach(function(direction) {
				if(direction=="down") {
					v.collapseHeader();
				} else {
					v.resetHeader();
				}
			});						
			v.events.mouseIntoHeader.attach(function() {
				v.resetHeader();
				v.resetScrollingDirection();
			});
		}

		return f;
	})(jQuery);