"use strict"
const Term = require('./term.class.js');

var handlebars = require('handlebars'),
	YAML = require('yamljs');


module.exports.parse = function(yaml) {
	
	var YAMLdata = YAML.parse(yaml);
	var terms=new Map();
	
	var termNames = Object.keys(YAMLdata);
	
	termNames.forEach((termName)=>{
		let term = new Term(termName, YAMLdata[termName]);
		terms.set(term.id, term);

		//Add the synonims to our main terms map
		let synonims = term.getSynonims();
		synonims.forEach((val,key)=>{
			terms.set(key,val);
		});
		
		//Add the subtypes to our main terms map
		let subtypes = term.getSubTypes();
		subtypes.forEach((val,key)=>{
			terms.set(key,val);		
		});
	});
	
	//Now that we have all our terms created, need to go descOrSeeRef
	//to see which of them are actually references to other terms
	terms.forEach((val,key)=>{
		val.resolveDescOrSeeRef(terms);
	});
	
	//Now that we have all our terms created, we can resolve the negative
	//references from strings into actual objects
	terms.forEach((val,key)=>{
		val.extractNegativeRefs(terms);
	});	
	return terms;
};


module.exports.prepare = function(terms){	
	var preparedData = {};
	
	var tags = [], tagAdded=[];
	var byTag = {}, byLetter = {};
	
	terms.forEach(function (term, id) {

		//Search in the descriptions, and replace references
		//with markup to generate link
		term.descs.forEach(function (t,index) {
			term.descs[index] = term.descs[index].replace(/`([^`]+)`('?s?)/g, function(math,dollar1,dollar2) {
				return '<a data-term="'+Term.getIDFromName(dollar1)+'" class="reference">'+dollar1+dollar2+'</a>'
			});

		})

		//Populate byTag and tag list
		if (term.tags.length) {
			term.tags.forEach(function (t) {
				if (!byTag[t.tagID]) byTag[t.tagID] = [];
				byTag[t.tagID].push(term.name);

				if (!tagAdded[t.tagID]) {
					tags.push(t);
					tagAdded[t.tagID] = true;
				}
			});
		} else {
			if (!byTag["-"]) byTag["-"] = [];
			byTag["-"].push(term.name);
		}
		
		//Populate byLetter
		var firstLetter = term.name.substr(0, 1).toUpperCase();
		if (!byLetter[firstLetter]) byLetter[firstLetter] = [];
		byLetter[firstLetter].push(term);
	});

	//sort byLetter (add properties in order so taht iteration is in order)
	var sortedByLetter = {};
	Object.keys(byLetter).sort().forEach((key)=>{
		sortedByLetter[key] = byLetter[key];	
	});
	
	tags.sort(function (a, b) {
		a = a.tag.toLowerCase();
		b = b.tag.toLowerCase();
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	});
	preparedData.tags = tags;
	preparedData.byTag = byTag;
	preparedData.byLetter = sortedByLetter;
	
	return preparedData;
};


module.exports.generateHtml = function(source, data){
	var template = handlebars.compile(source);
	
	handlebars.registerHelper( 'eachInMap', function ( context, options ) {
		var out = '';
		context.forEach((val,key)=>{
			out+=options.fn({
				key:key,
				val:val
			});
		});
		return out;
	} );	
	
	data.byTagStringified = JSON.stringify(data.byTag);
	var html = template(data);
	return html;
}