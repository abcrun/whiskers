/**
* Javascript Templating Engine (Selector Styles) - A New Way To Deal With Templates 
* The MIT License - Copyright (c) Hongbo Yang <abcrun@gmail.com>
* Repository - https://github.com/abcrun/whiskers.git
* Version - 0.2.1
*/

(function(name,factory){
	if(typeof define === 'function' && define.amd) define(factory);//AMD
	else if(typeof module === 'object' && module.exports) module.exports = factory();//CommonJS
	else this[name] = factory();//Global
})('Whiskers',function(){
	//Template RegExp Unit
	var TEMPLATE = /^\s*([^\+\(\)]+)\s*>\s*(?:([^>\(\)]+)|(\(.+\)))\s*$/;
	var NODE = /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)?(\{\{=([^\{\}]+)\}\})?/,
	    ID = /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
	    CLASS = /\.(?:(?:[\w\u00c0-\uFFFF\-]|\\.)+|\{\{=\$?[^\$\{\}]+\}\})/g,
	    ATTR = /\[\s*(?:[\w\u00c0-\uFFFF\-]|\\.)+\s*=.+\]/g;
	var varReg = /\{\{=\$((?:[\w\u00c0-\uFFFF\-\[\]\.\*]|\\.)+)\}\}/,
	    braceReg = /(?:^\(\s*|\s*\)$)/g;
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
		return results;
	}
	//Fill Datas
	var dataFormat = function(html,data,isFull){
		var varConReg = isFull?/\{\{=\s*\$((?:[\w\u00c0-\uFFFF\-\[\]\.\*]|\\.)+)\s*\}\}/g:/\$((?:[\w\u00c0-\uFFFF\-\[\]\.\*]|\\.)+)/g;
		return (html.replace(varConReg,function($0,$1){
			var keys = $1.match(/[^\[\]\.]+/g),results;
			if(keys) while(keys.length) results = (results || data)[keys.shift()];
			return (!/(?:undefined|null)/.test(results) ? results : $0);
		}))
	}
	//Create Node
	var createNode = function(str){
		var nodes = NODE.exec(str),elm = nodes[1],txt = nodes[3];
		if(elm){
			node = document.createElement(elm);
			setAttribute(str,node);
		}else if(txt){
			if(nodes[3].indexOf('$') > -1) txt = nodes[2];
			node = document.createTextNode(txt);
		}
		return node;
	}
	//Set Node Attributes
	var setAttribute = function(str,tag){
		var id = ID.exec(str),attrs = str.match(ATTR),classes,naReg = /\{\{=((?:[\w\u00c0-\uFFFF\-]|\\.)+)\}\}/;
		if(id) tag.id = id[1]; 
		if(attrs){
			var simpleAttr = /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*=(.+)\]/;
			for(var i = 0;i < attrs.length;i++){
				var attr = simpleAttr.exec(attrs[i]),name = attr[1],value = attr[2],value_arr = naReg.exec(value);
				if(value_arr) value = value_arr[1];
				tag.setAttribute(name,value);
			}
			str = str.replace(ATTR,'');//Remove Attributes String As It May Include Dot Symbol Such As 'url=www.pkmyself.com' Which May Conflict With Class RegExp
		}
		classes = str.match(CLASS);
		if(classes){
			var clArr = [];
			for(var j = 0;j < classes.length;j++){
				var clss = classes[j],clss_arr = naReg.exec(clss);
				if(clss_arr) clss = clss_arr[1];
				else clss = clss.replace('.','');
				clArr.push(clss)
			}
			tag.className = clArr.join(' ');
		} 
		return tag;
	}
	

	var whiskers = function(selector,data,fn){
		var template_arr = analysis(selector),groups = template_arr.length,frags = document.createDocumentFragment();
		if(fn) fn(data);
		if(groups == 1) return template(selector,data);
		for(var i = 0;i < template_arr.length;i++){
			var template_str = template_arr[i];
			if(/^\s*\(.+\)\s*$/.test(template_str)) template_str = template_str.replace(braceReg,'');
			frags.appendChild(template(template_str,data));
		}
		return frags;
	};
	var template = function(selector,data){
		var template_arr = analysis(selector),frags = document.createDocumentFragment();
		if(varReg.test(selector) && !/\*/.test(selector) && data) selector = dataFormat(selector,data);

		template_arr = analysis(selector);
		for(var i = 0; i < template_arr.length;i++){
			var template_str = template_arr[i],
			    matches = TEMPLATE.exec(template_str),
				ancestor = descendant = null;

			if(!matches) ancestor = template_str;
			else{
				if(matches[3]){
					ancestor = matches[1];
					descendant = matches[3];
				}else{
					ancestor = template_str;
				}
			}

			if(descendant) descendant = template(descendant.replace(braceReg,''),data);

			if(ancestor){
				var ancestor_arr = ancestor.split('>'),frg = descendant || document.createDocumentFragment();
				while(ancestor_arr.length){
					var ancestor_cur = ancestor_arr.pop(),
						node,times = 1,index = 0;

					node = ancestor_cur.replace(/\*(\d+)/,function($0,$1){
						if($1) times = parseInt($1);
						return '';
					})
					ancestor = createNode(node);

					if(ancestor.nodeName != '#text') ancestor.appendChild(frg)
					if(times == 1){
						frg.appendChild(ancestor);
					}else{
						var tag = ancestor.nodeName,html = ancestor.innerHTML,hasAttrVar = varReg.test(node),hasConVar = varReg.test(html),clone = null;
						while(index != times){
							if(data && (hasAttrVar || hasConVar)){
								var results;
								clone = document.createElement(tag);
								if(hasAttrVar){
									var fnode = node.replace(/\*/g,index);
									results = dataFormat(fnode,data,true);
									setAttribute(results,clone);
								}
								if(hasConVar){
									var fhtml = html.replace(/(\.|\[)\*(\.|\]|\})/g,'$1' + index + '$2');
									results = dataFormat(fhtml,data,true);
									if(window.ActiveXObject && tag.toLowerCase() == 'tr'){//Table Elements Are ReadOnly In IE Except TD
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

	//Basic Information
	var Whiskers = {};
	Whiskers.render = whiskers;

	return Whiskers;
})
