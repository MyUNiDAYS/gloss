"use strict"
class Term {
	constructor(termName,  data, parent) {
		let synonims = termName.split(',').map((x)=>{return x.trim()});
		let name = synonims.shift();
        
		this.name=name;
		this.id=Term.getIDFromName(name);
		this.parent=parent;
		
		this.types=new Map();
		this.tags=[];
		this.descs=[];
		this.refs={};
        this.refs.see = new Map();
        this.refs.notA = [];
        
        this.descOrSeeRef = [];
        
        //process term data
        if(!(data instanceof Array))  data = [data];
        data.forEach(function(dataPiece){
            this.parseItem(dataPiece);
        }.bind(this));
        
        //subtypes inherit parent's tags
        this.getSubTypes().forEach(function(val,key){
            val.tags = this.tags;
        }.bind(this));
        
        this.synonims=new Map();
        createSynonims.call(this,synonims);	
	}
    parseItem(data) {
        if(data instanceof Array) {
            //If it's an array, we got a tag(s)
            data.forEach((t)=>{
               this.tags.push({
                    tagID:Term.getIDFromName(t),
                    tag:t    
               });
            });
        } else if (typeof data == 'object') {
            //If it's an object, our term has subtypes
            Object.keys(data).forEach(function(key){
                //Object keys will be descriptions.
                this.descOrSeeRef.push(key);
                
                var subtypes = data[key];
                if(!(subtypes instanceof Array)) 
                    subtypes = [subtypes];
                
                subtypes.forEach(function(s) {
                    this.createSubType(s);
                }.bind(this));
            }.bind(this));
            
        } else if (typeof data == 'string') {
            //It's a disambiguation
            if(data.substr(0, 1) == '¬') {
                this.refs.notA.push(data);
            } else {
                //If none of the above, it's a description
                this.descOrSeeRef.push(data);   
            }     
        }
    }
    createSubType(subtype) {
        var subtypeName, data;
        if(typeof subtype == "string") {
            subtypeName = subtype;
            data = [];
        } else {
            subtypeName = Object.keys(subtype)[0];
            data = subtype[subtypeName];
        }
        
		let term = new Term(subtypeName, data, this);
		this.types.set(term.id, term);
    }
    getSubTypes() {
        var subtypes = new Map();
        this.types.forEach((val,key)=>{
            subtypes.set(key,val);
            //for each subtype, its synonims are also subtypes
			let synonims = val.getSynonims();
			synonims.forEach((val,key)=>{
				subtypes.set(key,val);
			});	
            //now get subtype's subtypes
            val.getSubTypes().forEach((val,key)=>{
               subtypes.set(key,val); 
            });
        });
        return subtypes;
    }
    getSynonims() {
        return this.synonims;
    }    
    resolveDescOrSeeRef(termsMap) {
        this.descOrSeeRef.forEach(function(d) {
            let t = termsMap.get(Term.getIDFromName(d));
            if(!t) {
                this.descs.push(d);
            } else {
                this.refs.see.set(Term.getIDFromName(d),t)
            }
        }.bind(this));
        delete this.descOrSeeRef;
    }    
    extractNegativeRefs(termsMap) {
        var refsMap = new Map();
        this.refs.notA.forEach(function(d) {
            let termId = Term.getIDFromName(d.substring(1));
            refsMap.set(termId,termsMap.get(termId))
        }.bind(this));
        this.refs.notA = refsMap;
    }
    addSeeRef(term) {
        this.refs.see.set(term.id, term);
    }
	static getIDFromName (name) {
		return name.toLowerCase().replace(/[^a-z]/g, '-');
	}
}
function  createSynonims(synonims) {
    var thisTerm = this;
    synonims.forEach((s)=>{
        let synonim = new Term(s,[]);
        synonim.addSeeRef(thisTerm);
        synonim.parent = thisTerm.parent;
        synonim.tags = thisTerm.tags;
        thisTerm.synonims.set(synonim.id, synonim);
    });
}

module.exports = Term;