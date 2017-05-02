//Class to implement observer pattern
var Observable = (function() {
	function f() {
    	this._listeners = [];
	}

	//Add listener to our array of listeners
	f.prototype.attach = function (listener) {
	        this._listeners.push(listener);
	};
	
	//Traverse through the array of listeners(functions) and call each of 
	//them with the arguments passed to the notify method.
	f.prototype.notify = function () {
		var args = arguments;
    	this._listeners.forEach(function(l) {
    		l.apply(window, args);
    	});
    };
    return f;
})();
