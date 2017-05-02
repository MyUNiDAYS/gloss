var glossModel = (function () {

	function f(termsByTag) {
		this._byTagID = termsByTag;
		
		this._allTerms = generateAllTerms(termsByTag);

		this._allIds = generateAllIds.call(this);
		
		this._byLetter = generateByLetter(this._allTerms);
	};

	f.prototype.getAllTerms = function () {
		return this._allTerms;
	}

	f.prototype.getAllIds = function () {
		return this._allIds;
	}

	f.prototype.getAllTermsByLetter = function () {
		return this._byLetter;
	}

	f.prototype.getTermsByLetter = function (letter) {
		return this._byLetter[letter];
	}
	f.prototype.getTermsByTagID = function (tagID) {
		return this._byTagID[tagID];
	}

	f.prototype.getIdForTerm = function (t) {
		return t.toLowerCase().replace(/[^a-z]/g, '-');
	}

	function generateAllTerms(termsByTag) {
		var added = [];
		var allTerms = [];
		
		Object.keys(termsByTag).forEach(function (tag) {
			termsByTag[tag].forEach(function (term) {
				if (!added[term]) {
					allTerms.push(term);
					added[term] = true;
				}
			});
		}); 
		
		allTerms.sort();
		return allTerms;
	}
	
	function generateAllIds() {
		return this._allTerms.map(this.getIdForTerm);
	}
	
	function generateByLetter(allTerms) {
		var byLetter = {};
		allTerms.forEach(function (term) {
			try { byLetter[term.substr(0, 1).toLowerCase()].push(term); }
			catch (e) { byLetter[term.substr(0, 1).toLowerCase()] = [term]; }
		}.bind(this));
		return byLetter;
	}
	
	return f;
})(jQuery);