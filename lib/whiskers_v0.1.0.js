/**
* @brief selector styles template with javascript - A New Way To Deal With Template
* @author Hongbo Yang <abcrun@gmail.com>
*/

(function(exports){
	//Template RegExp Unit
	var TEMPLATE = /([^\(\)\+]+)?(?:$|(^(?!>)[^\(\)\+]+\+.+$|\(.+\)$))/;
	var	NODE = /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)?(\{\{=([^\{\}]+)\}\})?/,
		ID = /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
	    CLASS = /\.(?:[\w\u00c0-\uFFFF\-\{=\$\}]|\\.)+/g,
		ATTR = /\[\s*(?:[\w\u00c0-\uFFFF\-]|\\.)+\s*=\s*[^\[\]]+\]/g;
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
		var id = ID.exec(str),attrs = str.match(ATTR),classes;
		if(id) tag.id = id[1]; 
		if(attrs){
			var simpleAttr = /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*=\s*([^\[\]]+)\]/;
			for(var i = 0;i < attrs.length;i++){
				var attr = simpleAttr.exec(attrs[i]),name = attr[1],value = attr[2];
				tag.setAttribute(name,value);
			}
			str = str.replace(ATTR,'');//Remove Attributes String As It May Include Dot Symbol Such As 'url=www.pkmyself.com' Which May Conflict With Class RegExp
		}
		classes = str.match(CLASS);
		if(classes){
			var clArr = [];
			for(var j = 0;j < classes.length;j++){
				clArr.push(classes[j].replace('.',''))
			}
			tag.className = clArr.join(' ');
		} 
		return tag;
	}
	//Fill Datas
	var dataFormat = function(html,data,isFull){
		var varReg = isFull?/\{\{=\$((?:[\w\u00c0-\uFFFF\-]|\\.)+)\}\}/g:/\$((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
		if(varReg.test(html)){
			html = html.replace(varReg,function($0,$1){
				var results = data[$1];
				if(typeof results == 'undefined') results = data;
				return results;
			})
		}
		return html;
	}

	var template = function(selector,data,fn,isFormated){
		var template_arr,frags = document.createDocumentFragment();

		if(!isFormated && !/\*\d/.test(selector) && data){
			if(fn) fn(data);
			selector = dataFormat(selector,data);
			isFormated = true;
		}
		template_arr = analysis(selector);

		for(var i = 0; i < template_arr.length;i++){
			var template_str = template_arr[i],
			    matches = TEMPLATE.exec(template_str);

			if(!matches) return;
			var ancestor = matches[1]?matches[1].replace(/>\s*$/,''):null,descendant = matches[2];
			if(descendant){
				isFormated = true;
				descendant = template(descendant.replace(/(?:^\(|\)$)/g,''),data,fn,isFormated);
			}
			if(ancestor){
				var ancestor_arr = ancestor.split('>'),frg = descendant || document.createDocumentFragment();
				while(ancestor_arr.length){
					var ancestor_cur = ancestor_arr.pop(),
					    groups = ancestor_cur.split('*'),
						node = groups[0],times = groups[1] || 1,
						hasVarReg = /{\{=\$([^\{\}]+)\}\}/g,
						index = 0;

					ancestor = createNode(node);
					if(ancestor.nodeName != '#text') ancestor.appendChild(frg)
					if(times == 1){
						frg.appendChild(ancestor);
					}else{
						var tag = ancestor.nodeName,html = ancestor.innerHTML,hasAttrVar = hasVarReg.test(node),hasConVar = hasVarReg.test(html),clone;
						while(index != times){
							clone = document.createElement(tag);
							if(data && (hasAttrVar || hasConVar)){
								var results;
								if(fn) fn(data[index],index);
								if(hasAttrVar){
									results = dataFormat(node,data[index],true);
									setAttribute(results,clone);
								}
								if(hasConVar){
									results = dataFormat(html,data[index],true);
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
	Whiskers.version = '0.1.0';
	Whiskers.author = 'abcrun@gmail.com';
	Whiskers.render = template;

	exports.Whiskers = Whiskers;
})(this)
