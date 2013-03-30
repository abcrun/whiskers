<h1>whiskers.js - A New Way To Deal With Template - selector styles template with javascript</h1>
<p>There are plenty famous javascript template modules such as mustache.js,but they are all using the same style. The whiskers give you a new way to think about template. If you are familiar with css or jquery selector, you will find that whiskers is easy to generate html</p>
<p>Yes,You are clever. The whiskers is using selector style as the template. More information about <a href="http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#selectors" target="_blank"><strong>CSS SLECTOR</strong></a></p>
<h2>Where to use it</h2>
<p>You can use it any where you can use javascript</p>
<h2>How to use it</h2>
<code>
	Whiskers.render(template[,data[,fn]])
</code>
<p>
Here is an example about template. We use Selector API styles. <strong>ul#id[name=value]>li.classname*2>(a+span)</strong>
The repeat tag symbol <strong>*2</strong> should at last behind all attributes
It is a template stands for:
<ul id="id" name="value">
	<li class="className">
		<a></a>
		<span></span>
	</li>
	<li class="className">
		<a></a>
		<span></span>
	</li>
</ul>
The whiskers add data to the html elment use <strong>{{=data}}</strong>. For example: div>{{=Hello World}},It will generate the code below:
<code><div>Hello World</div></code>
If we need to fill data to the template,the whiskers use <strong>{{=$}}</strong>
</p>
<p>The option data are the data collections for the template and the option fn is a function which is used for other variabal that aren't in the data option or some logic.Data must be Array or Object</p>
<h2>Demos</h2>
<p>Below are some examples how to use Class.js</p>
<strong>#demo1</strong>
<pre>
	<code>var data = [1,2,3];
	var template = 'ul>li*3>({{=Data:}} + {{=$0}})';
	var output = Whiskers.render(template,data)</code>
</pre>
<p>Output:</p>
<ul>
	<li>Data:1</li>
	<li>Data:2</li>
	<li>Data:3</li>
</ul>
<strong>#demo2</strong>
<pre>
	<code>var data = [[1,2,3],[4,5,6]];
	var template = 'ul>li.{{=$clss}}*2>(span[name={{=$value}}]>{{=$0}} + span>{{=$1}} + span>{{=$2}})';
	var fn = function(data,index){
		data['clss'] = 'index' + index;
		data['value'] = 'attributes';
	}
	var output = Whiskers.render(template,data,fn)</code>
</pre>
<p>Output:</p>
<ul>
	<li class="index0"><span name="attributes">1</span><span>2</span><span>3</span></li>
	<li class="index1"><span name="attributes">4</span><span>5</span><span>6</span></li>
</ul>
<p>More examples to see Example directory</p>
