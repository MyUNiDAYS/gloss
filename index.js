var fs = require('fs'),
	copydir = require('copy-dir'),
	path = require('path'),
	YAML = require('yamljs'),
	gloss = require('./core/gloss');
  
//YAML.load(process.argv[2], function(terms) {
//	// Sort the input yaml if requested
//	if(process.argv[4] == '--sort-yaml')
//		sortYaml(process.argv[2], terms)
//});

var inFile = process.argv[2] || 'example.yml';
var outFile = process.argv[3] || 'output/' + path.basename(inFile, path.extname(inFile)) + '.html';

fs.readFile(inFile, 'utf-8', function(error, file){
	var parsed = gloss.parse(file);
	var prepared = gloss.prepare(parsed);
	
	fs.readFile('lib/template.html', 'utf-8', function(error, source){
		
		var html = gloss.generateHtml(source, prepared);
		
		fs.writeFile(outFile, html, function(error) {
			process.exit();
		});
		
		if(!error) 
		{
			copyDir.sync('lib/clientside', 'output/clientside');
			console.log(inFile + ' has been compiled into ' + outFile);			
		}
	});
});