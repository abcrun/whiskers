# whiskers.js

---

A New Way To Deal With Template - selector styles template with javascript

基于CSS Selector API的Javascript模板视图模块，可以快速生成HTML代码碎片

---

The *whiskers* takes a new way(CSS Selector API) to deal with template.

More information about [**CSS SLECTOR**](http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#selectors).

## Define and Usage (用法)

### Syntax (语法)
	Whiskers.render(template,data,fn)
### Parameters (参数)
###### render(template,data,fn)
- `template:Required` -- A CSS Selector Style string stands for template. More detail below.
- `data:Optional` -- The Data To be Filled.
- `fn:Optional` -- A function excutes when rendering.

###### template (模板)
- `#` -- id
- `.` -- className
- `[name=value]` -- attributes
- `>` -- parent and children relationship
- `+` -- siblings
- `*` -- node repeat times
- `{{=Hello World}}` -- text node
- `{{=$abc}}` -- $abc is the variable

## Examples (实例)
###### template: string
`var template = div#wrapper>ul.lists[data-type=news]>li*2>span>{{=Hello World}}`

###### Whiskers.render(template,data,fn)
`Whiskers.render(template)`

	<div id="wrapper">
		<ul id="lists" data-type="news">
			<li><span>Hello World</span></li>
			<li><span>Hello World</span></li>
		</ul>
	</div>

Add Datas to the template: 


	Whiskers.render(
		'div>(span>{{=$0}} + span.$className>{{=$1}}) + span>{{=$2}})',
		[0,1,2],
		function(data,index){
			$['className'] = 'libg';
		}
	)
	<div>
		<span>0</span>
		<span class="libg">1</span>
		<span>2</span>
	</div>
	
Complex Example:

	var data = [[1,2,3],[4,5,6]];
	var template = 'ul>li.{{=$clss}}*2>(span[name={{=$value}}]>{{=$0}} + span>{{=$1}} + span>{{=$2}})';
	var fn = function(data,index){
		data['clss'] = 'index' + index;
		data['value'] = 'attributes';
	}
	var output = Whiskers.render(template,data,fn)
	
Output:

	<ul>
		<li class="index0"><span name="attributes">1</span><span>2</span><span>3</span></li>
		<li class="index1"><span name="attributes">4</span><span>5</span><span>6</span></li>
	</ul>
	
**Notice**:
- `li.list*3` -- Node repeat times should be placed at the last of the corresponding node. `li*3.list` is invalidate.
- `template` -- Strongly recommended to split a complex template into small units when `data` or `fn` is needed. For examples:

> `var template = 'ul>li*2>(span>{{=$1}}+span>{{=$0}}+span>{{=$2}}) + ul>li*2>(span>{{=$1}}+span>{{=$0}}+span>{{=$2}})';`
> `var data = [[[1,2,3],[4,5,6]],[[7,8,9],[10,11,12]]];`

> It is better to split like this:

> `li*2>(span>{{=$1}}+span>{{=$0}}+span>{{=$2}})` with data `[[1,2,3],[4,5,6]]`
> `li*2>(span>{{=$1}}+span>{{=$0}}+span>{{=$2}})` with data `[[7,8,9],[10,11,12]]`

> However `span>$0 + span>$1` with data `[1,2]` needn't to be splited.

