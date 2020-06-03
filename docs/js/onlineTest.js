// for MathJax
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
	document.getElementsByTagName("head")[0].appendChild(scriptIE);
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src  = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
	document.getElementsByTagName("head")[0].appendChild(script);
	script.onload = (function () {
		// console.log(MathJax);
	})();
})();

var mdinput;
var article;
var raw;
var selecter;
var radioList;

let writeHTML = function () {
	var htmlTxt
	if ( radioNodeList.value == "mdp" ) {
		htmlTxt = mdp(mdinput.value);
	} else {
		htmlTxt = marked(mdinput.value);
	}
	article.innerHTML = htmlTxt;
	raw.innerHTML = htmlTxt.replace(/</g,'&lt;').replace(/>/g,'&gt;');
	if ( MathJax.typesetPromise )
		MathJax.typesetPromise();
	console.log ( mdinput.value.replace(/\\/g,'\\\\').replace(/\n/g,'\\n') );
}

window.onload = function() {
	var data = "# Comparison mdp and Marked\n\nThis is demo for mdp. For detail information, see [GitHub Repo](https://github.com/UmemotoCtrl/MarkdownParser).\n\n**You can change Markdown parser.**\n\n## Inline notation\n\n1. *em*\n1. **strong**\n1. ~~strike~~\n1. `code`\n1. [Anchor link to GitHub Repo](https://github.com/UmemotoCtrl/MarkdownParser)\n1. Inline math $\\dot{x} = f(x)$\n\n## Block notation\n\n### Table\n\n| A | B |\n| :---:  | ---:  |\n| $|\\alpha |$ | $|\\beta |$ |\n| a-----a | b-----b |\n\n### Math formula in independent line\n\n\\[\n\\tag{1} \\dfrac{\\partial y}{\\partial x} = x\n\\]\n\n$$\n\\tag{2} f(x) :=\\begin{cases}1,\\quad &\\mbox{if}~ x\\neq 0 \\\\ 0,\\quad &\\mbox{if}~ x = 0\\end{cases}\n$$\n\n### List\n\n* a\n* b\n  1. A\n  1. B\n\n### Code block\n\n```markdown\n* a\n* b\n  1. A\n  1. B\n```\n\n### Horizontal rule\n\n---\n\n### Comment block\n\n<!--\nThis is not shown.\n-->\n\n";
	mdinput = document.getElementById("mdinput");
	article = document.getElementById("article");
	raw     = document.getElementById("raw");
	selecter= document.getElementById("selecter") ;
	radioNodeList = selecter.parser;

	mdinput.value = data;
	writeHTML();
	mdinput.oninput = writeHTML;
	selecter.onchange = writeHTML;
};
