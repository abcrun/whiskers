# whiskers.js

---

A New Way To Deal With Template - selector styles template with javascript

基于CSS Selector API的Javascript模板视图模块，可以快速生成HTML代码碎片

---

The *whiskers* takes a new way(CSS Selector API) to deal with template.

More information about [**CSS SLECTOR**](http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#selectors).

## Define and Usage (用法)

### Syntax (语法)
	Whiskers.render(template,data,fn) //render template
	Whiskers.create(template) //create template
### Parameters (参数)
###### .render(template,data,fn)
- `template:Required` -- A string stands for template or template created by `Whiskers.create(template)`.
- `data:Optional` -- The Data To be Filled.
- `fn:Optional` -- A function excutes when rendering.

###### template (模板)
- `#` -- id : `div#test` stands for `<div id="test"></div>`
- `.` -- className : `div.test` stands for `<div class="test"></div>`
- `[name=value]` -- attributes : `div[name=value]` stands for `<div name="value"></div>`
- `>` -- parent and children relationship : `div>p` stands for `<div><p></p></div>`
- `+` -- siblings : `div + p` stands for `<div></div><p></p>`
- `*` -- node repeat times : `li*3` stands for `<li></li><li></li><li></li>`
- `{{=Hello World}}` -- text node : `span>{{=Hello World}}` stands for `<span>Hello World</span>`
- `{{=$.abc}}` -- $abc is the variable

###### variable (变量)
`$.name` and `$[name]` are standing for the same variable.

**name** is the *index* of an array or the *key* in an object. 

	{
		title:'whiskers',
		keywords:['whiskers','template']
	}

`$.keywords.0` and `$['keywords'][0]` are standing for the string 'whiskers'

### Examples (实例)
###### template: string
`var template = 'div#wrapper>ul.lists[data-type=news]>li*2>span>{{=Hello World}}'`

It is the same as :

	var template = Whiskers.create('div#wrapper'),
	    ul = Whikers.create('ul.lists[data-type=news]'),
	    lis = Whiskers.create('li*2');
	lis.append('span>{{=Hello World}}');
	ul.append('lis');

**Notice**: The methods of `template` created by `Whiskers.create()` are :
- `template.append(tmpl)` -- Add `tmpl` as the last child of `template`.
- `template.prepend(tmpl)` -- Add `tmpl` as the first child of `template`.
- `template.toString()` -- Change the `template` to string.

###### Whiskers.render(template,data,fn)
`Whiskers.render(template)`

	<div id="wrapper">
		<ul class="lists" data-type="news">
			<li><span>Hello World</span></li>
			<li><span>Hello World</span></li>
		</ul>
	</div>

Add Datas to the template: 


	Whiskers.render(
		'div>(span>{{=$.0}} + span.{{=$.className}}>{{=$.1}} + span>{{=$.2}})',
		[0,1,2],
		function(data){
			data['className'] = 'libg';
		}
	)
	<div>
		<span>0</span>
		<span class="libg">1</span>
		<span>2</span>
	</div>
	
Complex Example:

	var data = [[1,2,3],[4,5,6]];
	var template = 'ul>li*2.{{=$[*][clss]}}>(span[name={{=$[*][value]}}]>{{=$[*][0]}} + span>{{=$[*][1]}} + span>{{=$[*][2]}})';
	var fn = function(data){
		for(var i = 0; i < data.length; i++){
			data[i]['clss'] = 'index' + i;
			data[i]['value'] = 'attributes';
		}
	}
	var output = Whiskers.render(template,data,fn)
	
Output:

	<ul>
		<li class="index0"><span name="attributes">1</span><span>2</span><span>3</span></li>
		<li class="index1"><span name="attributes">4</span><span>5</span><span>6</span></li>
	</ul>
	
**Notice**:
- `template` -- Strongly recommended to split a complex template into small units. For examples:

> `var template = 'ul>li*2>(span>{{=$.*.1}}+span>{{=$.*.0}}+span>{{=$.*.2}}) + ul>li*2>(span>{{=$.*.1}}+span>{{=$.*.0}}+span>{{=$.*.2}})';`

> It is better to split like this:

> `li*2>(span>{{=$.*.1}}+span>{{=$.*.0}}+span>{{=$.*.2}})` and `li*2>(span>{{=$.*.1}}+span>{{=$.*.0}}+span>{{=$.*.2}})`


**Notice**:Compatible with AMD and CommonJS

