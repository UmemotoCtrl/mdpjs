let writeHTML = function () {
	var htmlTxt;
	var startTime;
	var endTime;
	if ( radioNodeList.value == "mdp" ) {
		startTime = performance.now();
		htmlTxt = mdp.render(mdInput.value);
		endTime = performance.now();
	} else if ( radioNodeList.value == "markdown-it" ) {
		startTime = performance.now();
		htmlTxt = markdownit1.render(mdInput.value);
		endTime = performance.now();
	} else if ( radioNodeList.value == "showdown" ) {
		startTime = performance.now();
		htmlTxt = showdownConverter.makeHtml(mdInput.value);
		endTime = performance.now();
	} else if ( radioNodeList.value == "marked" ) {
		startTime = performance.now();
		htmlTxt = marked(mdInput.value);
		endTime = performance.now();
	} else if ( radioNodeList.value == "commonmark" ) {
		var parsed;
		startTime = performance.now();
		parsed = commonmarkReader.parse(mdInput.value); // parsed is a 'Node' tree
		htmlTxt = commonmarkWriter.render(parsed); // result is a String	
		endTime = performance.now();
	} else if ( radioNodeList.value == "remarkable" ) {
		startTime = performance.now();
		htmlTxt = remarkable1.render(mdInput.value);
		endTime = performance.now();
	}
	article.innerHTML = htmlTxt;
	timeDiv.innerHTML = (endTime - startTime).toFixed(3) + "(ms)";
	raw.innerHTML = htmlTxt.replace(/</g,'&lt;').replace(/>/g,'&gt;');
	// raw.innerHTML = mdp.analyzeStructure(mdInput.value);
	if ( typeof MathJax != "undefined" )
		MathJax.typesetPromise(article.childNodes);
	// console.log ( mdInput.value.replace(/\\/g,'\\\\').replace(/\n/g,'\\n') );
}

var mdInput;
var article;
var raw;
var selector;
var radioNodeList;
var timeDiv;

var mdp = makeMDP();
var showdownConverter = new showdown.Converter();
var commonmarkReader = new commonmark.Parser();
var commonmarkWriter = new commonmark.HtmlRenderer();
var remarkable1 = new remarkable.Remarkable();
var markdownit1 = new markdownit();

window.onload = function() {
	
	mdInput = document.getElementById("mdInput");
	article = document.getElementById("article");
	raw     = document.getElementById("raw");
	selector= document.getElementById("selector") ;
	timeDiv = document.getElementById("time");
	radioNodeList = selector.parser;
	
	mdInput.value = "# Comparison Javascript Markdown Parsers\n\nThis is demo for mdp.js. For detail information, see [GitHub Repo](https://github.com/UmemotoCtrl/MarkdownParser).\n\n## You can change Markdown parser. Parser Option\n\n* markdown-it, [repo](https://github.com/markdown-it/markdown-it)\n* Showdown, [repo](https://github.com/showdownjs/showdown)\n* Marked, [repo](https://github.com/markedjs/marked)\n* commonmark, [repo](https://github.com/commonmark/commonmark.js)\n* remarkable, [repo](https://github.com/jonschlinkert/remarkable)\n\n## Inline notation\n\n1. *em*\n1. **strong**\n1. ~~strike~~\n1. `code`\n1. [Anchor link to GitHub Repo](https://github.com/UmemotoCtrl/MarkdownParser)\n1. Inline math $\\| f(x)\\|$\n\n## Block notation\n\n### Table\n\n| A | B | C |\n| :---:  | ---:  | :--- |\n| $|\\alpha |$ | $|\\beta |$ ||\n| 1 || 2 |\n\n### Math formula in independent line\n\n\\[\n\\tag{1} \\dfrac{\\partial y}{\\partial x} = x\n\\]\n\n$$\n\\tag{2} f(x) :=\\begin{cases}1,\\quad &\\mbox{if}~ x\\neq 0 \\\\ 0,\\quad &\\mbox{if}~ x = 0\\end{cases}\n$$\n\n### List\n\n* a\n* b\n  1. A\n  1. B\n\n### Code block\n\n```markdown\n* a\n* b\n  1. A\n  1. B\n```\n\n### Horizontal rule\n\n---\n\n### Comment block\n\n<!--\nThis is not shown.\n-->\n\n";
	writeHTML();
	mdInput.oninput = writeHTML;
	selector.onchange = writeHTML;

	// for MathJax IIFE (Immediately Invoked Function Expression)
	(function () {
        window.MathJax = {
          tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']]
          },
          svg: {
          fontCache: 'global'
          }
        };
        var scriptIE = document.createElement("script");
        scriptIE.src  = "https://polyfill.io/v3/polyfill.min.js?features=es6";
        scriptIE.async = true;
        document.getElementsByTagName("head")[0].appendChild(scriptIE);
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src  = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
        script.async = true;
        document.getElementsByTagName("head")[0].appendChild(script);
        script.onload = (function () {
          // console.log(MathJax);
        })();
	})();
};
