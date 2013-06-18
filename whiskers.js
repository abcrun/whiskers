/**
* Javascript Templating Engine (Selector Styles) - A New Way To Deal With Templates 
* The MIT License - Copyright (c) 2013 Hongbo Yang <abcrun@gmail.com>
* Repository - https://github.com/abcrun/whiskers.git
* Version - 0.4.0
*/

(function(name,factory){
	if(typeof define === 'function' && define.amd) define(factory);//AMD
	else if(typeof module === 'object' && module.exports) module.exports = factory();//CommonJS
	else this[name] = factory();//Global
})('Whiskers',function(){
	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	var whitespace = '[\\x20\\t\\r\\n\\f]';
	// http://www.w3.org/TR/css3-syntax/#characters
	var characterEncoding = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+';

	var token = '\\{\\{=(\\$?' + characterEncoding.replace('w','w\\[\\]\\.\\*\'" ') + ')\\}\\}';
	var varReg = new RegExp(token.replace('?',''),'g');
	var conReg = new RegExp(token.replace('\\$?',''),'g');

	var ID = new RegExp('#(' + characterEncoding + ')');
	var CLASS = new RegExp('\\.(' + characterEncoding + '|' + token  + ')');
	var ATTR = new RegExp('\\[' + whitespace + '*(' + characterEncoding + ')' + whitespace + '*=' + whitespace + '*([\'"]?)((?:' + token.replace('?','') + '|' + characterEncoding.replace('w','w\\."\':;') +'))\\2' + whitespace + '*\\]');// ':;' is for style attributes [style=color:red;font-size:12px;]

	var NODE = new RegExp('^' + whitespace + '*(' + characterEncoding + ')|(' + token + ')' + whitespace + '*');

	//Characters Analysis
	var analysis = function(str){
		var length = str.length,
			brackets = 0,
			temp = [],starts = [],ends = [],
			result,results = [];
		for(var i = 0;i < length;i++){
			var char = str.charAt(i);
			if(char == '(') brackets++;
			if(char == ')') brackets--;

			if(brackets){
				if((brackets == 1 && char != '(') || brackets != 1) temp.push(char);
			}else{
				if(char != ')' && char != '+' && char != '>') temp.push(char);
				if(char == ')'){
					starts.push(analysis(temp.join('')));
				}else if(char == '>' || char == '+' || i == length - 1){
					result = format(temp.join(''));
					starts.push(result[0]);
					ends.unshift(result[1]);
					temp = [];
					if(char == '+'){
						results.push(starts.join('') + ends.join(''));
						starts = [];
						ends = [];
					}
				}
			}
		}
		
		results.push(starts.join('') + ends.join(''));
		return results.join('');
	}
	
	//Generate HTML Strings
	var format = function(str){
		var nodes = NODE.exec(str),starts = [],ends = [];
		if(!nodes) return ['',''];

		var tag = nodes[1],txt = nodes[2];
		if(tag){
			var time = 1,ids = ID.exec(str),attrs,classes,clsArr = [];
			str.replace(/\*(\d+)/,function($0,$1){
				if($1) time = $1;
				return '';
			})
			if(time != 1) starts.push(time + '*(')
			starts.push('<' + tag);
			if(ids) starts.push(ids[1]);
			while(str != ''){
				if(attrs = ATTR.exec(str)){
					var name = attrs[1].toLowerCase(),value = attrs[3];
					if(name == 'class') clsArr.push(value);
					else starts.push(name + '=' + value);
					str = str.replace(ATTR,'');
				}else if(classes = CLASS.exec(str)){
					clsArr.push(classes[1]);
					str = str.replace(CLASS,'');
				}else{
					str = '';
				}
			}
			if(clsArr.length) starts.push('class="' + clsArr.join(' ') + '"');
			starts.push('>');
			ends.unshift('</' + tag + '>');
			if(time != 1) ends.push(')*' + time)
		}else if(txt){
			starts.push(txt);
			ends.unshift('');
		}
		return [starts.join(' '),ends.join('')];	
	}
	
	var render = function(selector,data,fn){
		var html,repeat = /(\d+)\*\(((?:\\\\.|[^\\\\])+)\)\*\1/g;
		if(data && fn) fn(data);
		html = analysis(selector);
		//Generate Repeat String -> 2*(<li></li>)*2(<li></li><li></li>)
		html = html.replace(repeat,function($0,$1,$2){
			var times = $1,base = $2,temp = [];
			for(var i = 0; i < times; i++){
				temp.push(base.replace(/\*/g,i));	
			}
			return temp.join('')
		})
		//Fill Data for variable -> {{=$[*][0]}}
		if(data){
			html = html.replace(varReg,function($0,$1){
				var keys = $1.match(/[^\[\]\.]+/g),results;
				if(keys) while(keys.length) results = (results || data)[keys.shift()];
				return (!/(?:undefined|null)/.test(results) ? results : $0);
			})
		}
		//Format Text Node -> {{=test}}
		html = html.replace(conReg,function($0,$1){
			return $1;
		})

		return html;
	}

	var template = function(tmpl){
		this.template = tmpl || '';
		this.childNodes = [];
		this.results = [];
	}
	template.prototype = {
		append:function(tmpl){
			this.childNodes.push(tmpl);
		},
		prepend:function(tmpl){
			this.childNodes.unshift(tmpl);
		},
		toString:function(){
			var tmpl = this.template,childNodes = this.childNodes,length = childNodes.length;
			this.results = [];
			if(tmpl) this.results.push(tmpl);

			if(childNodes.length){
				var results = [],rlength;
				for(var i = 0; i < length; i++){
					var node = childNodes[i];
					if(node.childNodes && node.childNodes.length) results.push(node.toString());
					else results.push(node['template'] || node);
				}
				if(rlength = results.length){
					results = rlength > 1 ? '(' + results.join('+') + ')' : results[0];
					this.results.push(results);
				}
			}
			return this.results.join('>');
		}
	}

	var Whiskers = {
		render:function(){
			var arg = arguments;
			if(typeof arg[0] != 'string') arg[0] = arg[0].toString();
			return render.apply(this,arg);
		},
		create:function(tmpl){
			return new template(tmpl);
		}
	}

	return Whiskers;
})
