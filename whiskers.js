/**
* Javascript Templating Engine (Selector Styles) - A New Way To Deal With Templates 
* The MIT License - Copyright (c) 2013 Hongbo Yang <abcrun@gmail.com>
* Repository - https://github.com/abcrun/whiskers.git
* Version - 0.4.2
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
    // http://velocity.apache.org/engine/devel/user-guide.html#variables
    // Extention: $[*][0] or $.*.0
    var identifier = '([a-zA-Z][\\w-]+)';
    var identifier_ext = '[\\w-\\[\\]\\.\\*]+';

    var vars = '\\{\\{=(\\$' + identifier_ext + ')\\}\\}';

    var VARS = new RegExp('\\$(' + identifier_ext + ')','g');
    var TAG = new RegExp('^' + whitespace + '*([a-zA-Z]+)' + whitespace + '*');
    var TXT = new RegExp('^' + whitespace + '*\\{\\{=(.+)\\}\\}' + whitespace + '*');

    var ID = new RegExp('#(?:' + identifier + '|' + vars + ')');
    var CLASS = new RegExp('\\.(?:' + identifier + '|' + vars  + ')');
    //Special values in attributes
    //URL - scheme://user:password@host:port/path;params?query#frag
    //STYLE - name1:value1;name2:value2
    //Others - [href="javascript:void(0)"]
	var ATTR = new RegExp('\\[' + whitespace + '*' + identifier + whitespace + '*=' + whitespace + '*([\'"]?)(?:(' + characterEncoding.replace('w','w\\."\':\\/@;\\?&#\(\)') +')\\2|' +  vars + ')' + whitespace + '*\\]'); 

    //Judge the character whether is a token
    var notToken = new RegExp('(?:\\[' + whitespace + '*' + characterEncoding + whitespace + '*=' + whitespace + '*[^\\]]+|\\{\\{=[^\\}]+)$')

    //Characters Analysis
    var analysis = function(str){
        var length = str.length,
            brackets = 0,
            temp = [],starts = [],ends = [],
            result,results = [];
        for(var i = 0;i < length;i++){
            var char = str.charAt(i);
            var isLast = false;
            //For special character "(" ")" ">" "+" or the last character
            //Judge whether it is a token
            if(/[\(\)>\+]/.test(char) || (isLast = (i == length - 1))){
                var tempStr = temp.join('');
                if(isLast) tempStr += char;//For the last character, We need add it to the string before format it

                if(notToken.test(tempStr)){
                    temp.push(char);
                }else{
                    if(char == '(') brackets++;
                    if(char == ')') brackets--;

                    if(brackets){
                        if((brackets == 1 && char != '(') || brackets != 1) temp.push(char);
                    }else{
                        if(char == ')'){
                            starts.push(analysis(tempStr));//If brackets is 0 recurse.
                        }else if(char == '>' || char == '+' || isLast){
                            //Determine the string whether is a tag or text. Default: true 
                            //If char is '>', it must be a tag node.
                            var isTag = true;
                            if(char != '>'){
                                var text = TXT.exec(tempStr);
                                if(text){
                                    isTag = false;
                                    tempStr = text[1];
                                }
                            }
                            //Sometimes tempStr = ' ' or '' which may occur between ')' and '+', ignore it. For example: In '(span + a) + em' or '(span + a)+ em'.
                            if(!/^\s*$/.test(tempStr)){
                                result = format(tempStr,isTag);
                                starts.push(result[0]);
                                ends.unshift(result[1]);
                            }
                            if(char == '+'){
                                results.push(starts.join('') + ends.join(''));
                                starts = [];
                                ends = [];
                            }
                        }
                        temp = [];
                    }
                }
            }else{
                temp.push(char);
            }
        }
        
        results.push(starts.join('') + ends.join(''));
        return results.join('');
    }

    //Format String To HTML Array
    var format = function(str,isTag){
        var starts = [],ends = [];

        if(isTag){
            var time,ids = ID.exec(str),attrs,classes,clsArr = [];
            var tag = TAG.exec(str)[1];
            str.replace(/\*(\d+)/,function($0,$1){
                if($1) time = $1;
                return '';
            })
            if(time) starts.push(time + '*(')
            starts.push('<' + tag);
            if(ids) starts.push('id=' + ids[1]);
            while(str != ''){
                if(attrs = ATTR.exec(str)){
                    var name = attrs[1].toLowerCase(),value = attrs[3] || attrs[4];
                    if(name == 'class') clsArr.push(value);
                    else starts.push(name + '=' + value);
                    str = str.replace(ATTR,'');
                }else if(classes = CLASS.exec(str)){
                    clsArr.push(classes[1] || classes[2]);
                    str = str.replace(CLASS,'');
                }else{
                    str = '';
                }
            }
            if(clsArr.length) starts.push('class="' + clsArr.join(' ') + '"');
            starts.push('>');
            ends.unshift('</' + tag + '>');
            if(time) ends.push(')*' + time)
        }else{
            starts.push(str);
            ends.unshift('');
        }
        return [starts.join(' '),ends.join('')];	
    }

    var render = function(selector,data,fn){
        var html,repeat = /(\d+)\*\(((?:\\\\.|[^\\\\])+)\)\*\1/g;
        if(data && fn) fn(data);
        html = analysis(selector);
        //Format The Repeat String: 2*(<li></li>)*2 -> <li></li><li></li>
        html = html.replace(repeat,function($0,$1,$2){
            var times = $1,base = $2,temp = [];
            for(var i = 0; i < times; i++){
                temp.push(base.replace(/\*/g,i));	
            }
            return temp.join('')
        })
        //Fill Data for variables -> $[*][0]
        if(data){
            html = html.replace(VARS,function($0,$1){
                var keys = $1.match(/[^\[\]\.]+/g),results;
                if(keys) while(keys.length) results = (results || data)[keys.shift()];
                return (!/(?:undefined|null)/.test(results) ? results : $0);
            })
        }

        return html;
    }

    var Whiskers = {
        render:render
    }

    return Whiskers;
})
