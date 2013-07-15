/**
* Javascript Templating Engine (Selector Styles) - A New Way To Deal With Templates 
* The MIT License - Copyright (c) 2013 Hongbo Yang <abcrun@gmail.com>
* Repository - https://github.com/abcrun/whiskers.git
* Version - 0.3.1
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
	var varRegTest = new RegExp(token.replace('?',''));
	var varReg = new RegExp(token.replace('?',''),'g');
	var varCon = new RegExp('(\\$' + characterEncoding.replace('w','w\\[\\]\\.\\*\'"') + ')','g');

	var ID = new RegExp('#(' + characterEncoding + ')');
	var CLASS = new RegExp('\\.(' + characterEncoding + '|' + token  + ')');
	var ATTR = new RegExp('\\[' + whitespace + '*(' + characterEncoding + ')' + whitespace + '*=' + whitespace + '*((?:' + token.replace('?','') + '|' + characterEncoding.replace('w','w\\."\':;\\/@\\?&#') +'))' + whitespace + '*\\]');// ':;' is for style attributes [style=color:red;font-size:12px;]
	var rBracket = new RegExp('^' + whitespace + '*\\(((?:\\\\.|[^\\\\])*)\\)' + whitespace + '*');

	var TEMPLATE = new RegExp('^' + whitespace + '*' + '(' + '(?:\\\\.|[^\\\\()])+' + ')' + whitespace + '*>' + whitespace + '*(' + '(?:\\\\.|[^\\\\()>])+|\\((?:\\\\.|[^\\\\])+\\)' + ')' + whitespace + '*$');
	var NODE = new RegExp('^' + whitespace + '*(' + characterEncoding + ')|(' + token + ')' + whitespace + '*');

	//Siblings Analysis
	var analysis = function(str){
		var length = str.length,
			brackets = 0,
			temp = [],results = [];
		for(var i = 0;i < length;i++){
			var char = str.charAt(i);
			if(char == '(') brackets++;
			if(char == ')') brackets--;
			if((char == '+' && brackets) || char != '+') temp.push(char);

			if(!brackets && (char == '+' || i == (length - 1))){
				results.push(temp.join('').replace(/(?:^\s+|\s+$)/,''));
				brackets = 0;
				temp = [];
			}
		}
		return results.length ? results : [str];
	}
	//Fill Datas
	var dataFormat = function(html,data,isFull){
		var varConReg = isFull ? varReg : varCon;
		return (html.replace(varConReg,function($0,$1){
			var keys = $1.match(/[^\[\]\.]+/g),results;
			if(keys) while(keys.length) results = (results || data)[keys.shift()];
			return (!/(?:undefined|null)/.test(results) ? results : $0);
		}))
	}
	//Set Node Attributes
	var setAttribute = function(str,tag){
		var ids = ID.exec(str),attrs,classes,clsArr = [];
		if(ids) tag.id = ids[1];
		while(str != ''){
			if(attrs = ATTR.exec(str)){
				var name = attrs[1].toLowerCase(),value = attrs[2].replace(/'|"/g,'');
				if(name == 'class'){
					tag.className += value;
				}else if(name == 'style'){
					tag.style.cssText = value;
				}else{
					tag.setAttribute(name,value);
				}
				str = str.replace(ATTR,'');
			}else if(classes = CLASS.exec(str)){
				clsArr.push(classes[1]);
				str = str.replace(CLASS,'');
			}else{
				str = '';
			}
		}
		if(clsArr.length){
			tag.className = clsArr.join(' ');
		}
		return tag;		
	}
	
	var render = function(selector,data,fn,isDesc){
		var template_arr,frags = document.createDocumentFragment();
		if(!isDesc && data && fn) fn(data);
		if(varRegTest.test(selector) && !/\*/.test(selector) && data) selector = dataFormat(selector,data);

		template_arr = analysis(selector);
		for(var i = 0; i < template_arr.length;i++){
			var template_str = template_arr[i];
			if(rBracket.test(template_str)){
				frags.appendChild(render(template_str.replace(rBracket,'$1'),data,fn,true));
				continue;
			}
			var matches = TEMPLATE.exec(template_str),
				ancestor = descendant = null;

			if(!matches) ancestor = template_str;
			else{
				ancestor = matches[1];
				descendant = matches[2];
			}

			if(descendant) descendant = render(descendant.replace(rBracket,'$1'),data,fn,true);

			if(ancestor){
				var ancestor_arr = ancestor.split('>'),frg = descendant || document.createDocumentFragment();
				while(ancestor_arr.length){
					var ancestor_cur = ancestor_arr.pop(),
						node,tNode,attrStr = '',times = 1,index = 0;

					node = ancestor_cur.replace(/\*(\d+)/,function($0,$1){
						if($1) times = parseInt($1);
						return '';
					})
					if(tNode = NODE.exec(node)){
						if(tNode[1]){
							ancestor = document.createElement(tNode[1]);
							ancestor.appendChild(frg);

							attrStr = node.replace(new RegExp('^' + whitespace + '*' + tNode[1]),'');
							if(attrStr) setAttribute(attrStr,ancestor);
						}else{
							var txt = tNode[2];
							if(!varRegTest.test(txt)) txt = tNode[3];
							ancestor = document.createTextNode(txt);
						}
					}

					if(times == 1){
						frg.appendChild(ancestor);
					}else{
						var tag = ancestor.nodeName,html = ancestor.innerHTML,hasAttrVar = varRegTest.test(attrStr),hasConVar = varRegTest.test(html),clone = null;
						while(index != times){
							if(data && (hasAttrVar || hasConVar)){
								var results;
								if(hasAttrVar){
									var fnode = attrStr.replace(/\*/g,index);
									clone = document.createElement(tag);
									results = dataFormat(fnode,data,true);
									setAttribute(results,clone);
								}else{
									clone = ancestor.cloneNode(true);
								}
								if(hasConVar){
									var fhtml = html.replace(/(\.|\[)\*(\.|\]|\})/g,'$1' + index + '$2');
									results = dataFormat(fhtml,data,true);
									if(window.ActiveXObject && tag.toLowerCase() == 'tr'){
										var div = document.createElement('div');
										div.innerHTML = '<table><tr>' + results + '</tr></table>';
										var tds = div.getElementsByTagName('td');
										while(tds.length){
											clone.appendChild(tds[0])
										}
										div = null;
									}else{
										clone.innerHTML = results;
									}
								}
							}else{
								clone = ancestor.cloneNode(true);
							}
							frg.appendChild(clone);
							index++;
						}
						ancestor = clone = null;
					}
				}
			}
			frags.appendChild(frg);
		}
		return frags;
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
