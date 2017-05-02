const assert = require("chai").assert;
const gloss = require("../core/gloss.js");
const YAML = require('yamljs');
const fs = require('fs');


var testInput = fs.readFileSync("./tests/testInput.yml","utf8");
var result = gloss.parse(testInput);

function literal(f) { 
	return f.toString().
	replace(/^[^\/]+\/\*!?/, '').
	replace(/\*\/[^\/]+$/, '');
}
 
describe("parse", function(){
	it('should handle simple descriptions', function(){
		var termA = result.get('Thing-A');
		assert.isOk(termA);
		assert.isAtLeast(termA.descs.indexOf('A description'),0);
		assert.isAtLeast(termA.descs.indexOf('Another description'),0);
		
		
		var termB = result.get('Thing-B');
		assert.isOk(termB);
		assert.isAtLeast(termB.descs.indexOf('Description for B'),0);
	});
	
	it('should handle tags', function(){
		var term = result.get('Thing-A');
		assert.isOk(term);
		assert.isAtLeast(term.tags.indexOf('Tag1'),0);
		assert.isAtLeast(term.tags.indexOf('Tag2'),0);
	});   

});

 
function a() {
	
	it('should handle indented descriptions', function(){
		var result = gloss.parse(literal(function() {/*!
Thing:
  Description of thing
*/}));

		assert.equal(result[0].term, 'Thing');
		assert.equal(result[0].desc, 'Description of thing');
	});
	
	it('should handle multiple indented descriptions', function(){
		var result = gloss.parse(literal(function() {/*!
Thing:
  - Description of thing
  - Other Description of thing
*/}));

		assert.equal(result[0].term, 'Thing');
		assert.equal(result[0].descs[0], 'Description of thing');
		assert.equal(result[0].descs[1], 'Other Description of thing');
	});
	
	
	it('should handle descriptions and tags', function(){
		var result = gloss.parse(literal(function() {/*!
Thing:
  - Description of thing
  - [One Tag, Another Tag]
*/}));
		
		assert.equal(result[0].term, 'Thing');
		assert.equal(result[0].desc, 'Description of thing');
		assert.equal(result[0].tags[0], 'One Tag');
		assert.equal(result[0].tags[1], 'Another Tag');
	});
	
	
	it('should handle references', function(){
		var result = gloss.parse(literal(function() {/*!
Thing A: 
  Description of Thing A
Thing B: 
  - Description of Thing B
  - Other desc
  - Thing A
*/}));
		
		assert.equal(result[0].term, 'Thing A');
		assert.equal(result[0].desc, 'Description of Thing A');
		assert.equal(result[1].term, 'Thing B');
		assert.equal(result[1].descs[0], 'Description of Thing B');
		assert.equal(result[1].descs[1], 'Other desc');
	});
	
	it('should handle mutliple terms', function(){
		var result = gloss.parse(literal(function() {/*!
Thing A,A,Also A: 
  Description of Thing A
*/}));
		
		assert.equal(result[0].term, 'A');
		assert.equal(result[0].refs.see[0], 'Thing A');
		assert.equal(result[1].term, 'Also A');
		assert.equal(result[1].refs.see[0], 'Thing A');
		assert.equal(result[2].term, 'Thing A');
		assert.equal(result[2].desc, 'Description of Thing A');
	});
	
	
	it('should sort alphabetically', function(){
		var result = gloss.parse(literal(function() {/*!
Thing B: 
  Description of Thing B
Thing A: 
  - Description of Thing A
*/}));
		
		assert.equal(result[0].term, 'Thing A');
		assert.equal(result[0].desc, 'Description of Thing A');
		assert.equal(result[1].term, 'Thing B');
		assert.equal(result[1].desc, 'Description of Thing B');
	});
	
	it('should handle disambiguations', function(){
		var result = gloss.parse(literal(function() {/*!
Thing A: Description of Thing A
Thing B: 
  - Description of Thing B
  - Thing A
  - ¬Thing C
Thing C: Description of Thing C
*/}));
		
		assert.equal(result[0].term, 'Thing A');
		assert.equal(result[0].desc, 'Description of Thing A');
		assert.equal(result[1].term, 'Thing B');
		assert.equal(result[1].desc, 'Description of Thing B');
		assert.equal(result[1].refs.see[0], 'Thing A');
		assert.equal(result[1].refs.not[0], 'Thing C');
		assert.equal(result[2].term, 'Thing C');
		assert.equal(result[2].desc, 'Description of Thing C');
	});
}