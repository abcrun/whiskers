#whiskers.js

whiskers.js是一个Javascript模板组件，它可以用来将一段 **特殊标记的字符串(whiskers模板<sup>见下文</sup>)** 转换为相应的HTML代码，如果你熟悉Zen Coding，那么对whiskers自然不会陌生。

下面是一个简单的示例：

###### 快速预览

	var template = 'div#wrapper>ul.lists[data-type=news]>li*2>span>{{=Hello World}}'; //whiskers模板
	Whiskers.render(template);

将会生成如下HTML代码：

	<div id="wrapper">
		<ul class="lists" data-type="news">
			<li><span>Hello World</span></li>
			<li><span>Hello World</span></li>
		</ul>
	</div>


### 使用范围

由于whiskers.js是由Javascript编写的，所以我们可以在任何支持Javascript的地方都使用，如Web浏览器，Node.js等。同时whiskers.js还支持CommonJS和AMD标准规范，所以我们能够很方便的调用。

### 什么是whiskers模板

**whiskers模板** 其实就是一段带有 **特殊标记的字符串** ，它是将HTML代码按照一定的规则简化成一段特殊的字符串。 它遵循[**CSS SLECTOR**](http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#selectors)规范，并在此基础上添加了变量和文本标记的特殊字符。

###### whiskers模板规范

- `#` -- id : `div#test` 相当于 `<div id="test"></div>`
- `.` -- className : `div.test` 相当于 `<div class="test"></div>`
- `[name=value]` -- 属性 : `div[name=value]` 相当于 `<div name="value"></div>`
- `>` -- 父子节点 : `div>p` 相当于 `<div><p></p></div>`
- `+` -- 兄弟节点 : `div + p` 相当于 `<div></div><p></p>`
- `*` -- 节点重复次数 : `li*3` 相当于 `<li></li><li></li><li></li>`
- `()` -- 包含标识符,用于包含多个子元素 : div>(h2 + p) 相当于 `<div><h2></h2><p></p></div>`
- `{{=Hello World}}` -- 文本节点 : `span>{{=Hello World}}` 相当于 `<span>Hello World</span>`
- `{{=$.abc}}` -- $.abc表示 **变量** <sup>见下文</sup> 

###### 创建模板

由于whiskers模板是一段带有 **特殊标记的字符串** ，所以我们可以在Javascript中直接定义：

	var template = "div#wrapper>ul.lists[data-type=news]>li*2>span>{{=Hello World}}";

也可以写在html页面 **自定义的script标签** 中，通过获取这个节点innerHTML来得到模板字符串:

	<script type="javascript/template">
		div#wrapper>ul.lists[data-type=news]>li*2>span>{{=Hello World}}	
	</script>

###### 关于变量

拿后端来说，程序可以从数据库获取数据，并将其输出到WEB页面。同理Javascript可以通过与后台交互（如异步请求等）获取数据，将这些数据按照 **whikers模板** 规则组合成HTML字符串，回填到页面中。而这里说的 **变量** 就是用来表示获取到的数据。

示例：

	{
		title:'whiskers',
		keywords:['whiskers','template']
	}

`$.keywords.0` 或者 `$['keywords'][0]` 相当于以上对象中的 'whiskers'

### 渲染模板
	
	Whiskers.render(template,data,fn);
	
就是将 **whiskers模板** 转换成HTML代码的函数。

###### 参数说明

- `template:必选` -- whiskers模板 - 特殊标记的字符串，或通过`whiskers.create(tmpl)`创建的模板对象。
- `data:可选` -- 用于回填到变量中的数据。
- `fn:可选` -- 在回填数据之前，可以用来处理这些数据。

### 一些示例

	Whiskers.render(
		'div>(span>{{=$.0}} + span.{{=$.className}}>{{=$.1}} + span>{{=$.2}})',
		[0,1,2],
		function(data){
			data['className'] = 'libg';
		}
	)

以上代码将会输出如下字符串:

	<div>
		<span>0</span>
		<span class="libg">1</span>
		<span>2</span>
	</div>
	
较为复杂的例子:

	var data = [[1,2,3],[4,5,6]];
	var template = 'ul>li*2.{{=$[*][clss]}}>(span[name={{=$[*][value]}}]>{{=$[*][0]}} + span>{{=$[*][1]}} + span>{{=$[*][2]}})';
	var fn = function(data){
		for(var i = 0; i < data.length; i++){
			data[i]['clss'] = 'index' + i;
			data[i]['value'] = 'attributes';
		}
	}
	var output = Whiskers.render(template,data,fn)
	
输出:

	<ul>
		<li class="index0"><span name="attributes">1</span><span>2</span><span>3</span></li>
		<li class="index1"><span name="attributes">4</span><span>5</span><span>6</span></li>
	</ul>

### 许可协议

The MIT License
