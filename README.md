# MarkdownParser
A somewhat functional JavaScript Markdown parser, affinity with formulas [Web Site](https://umemotoctrl.github.io/MarkdownParser/).

This script aims to use in Client-side and was made as alternative for existing js parsers because their do not work well with math formulas.

Probably the only option intended to be used in conjunction with mathjax (or katex)!

## Feature

* Do not react to markdown control symbols in formula and code blocks. The math keeps the original structure.
*  `$$ ... $$` and `\[ ... \]` are supported for independent line formulas. Putting a line which should have only `$$`, `\[`, or `\]`.

## Usage

Add the following to header 

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/UmemotoCtrl/MarkdownParser@0.1.4/js/mdp.js"></script>
```

then execute

```javascript
var mdp = makeMDP();
var html_text = mdp.render( markdown_test );
```

The script is pluggable, for examples,

```javascript
mdp.addInlineSyntax ({	// this is sample for img
	tag: "IG",
	priority: 60,
	provisionalText: '<img url="$2" alt="$1"></img>',
	matchRegex: new RegExp("!\\[(.+?)\\]\\((.+?)\\)", 'g'),
	converter: function ( argBlock ) {
		return null;
	},
	convertedHTML: new Array()
});
mdp.addBlockSyntax ({	// this is sample for Setext headings
	tag: "SH",
	priority: 60,
	provisionalText: mdp.config.delimiter+"SH"+mdp.config.delimiter,	// should include delimiter+tag+delimiter
	matchRegex: new RegExp("^.+\\n *=+[ =]*=+ *(?=\\n)", 'gm'),
	converter: function ( argBlock ) {
		var temp = argBlock.replace(/"/g, '')
			.replace( new RegExp('^ *(.+)\\n.*$'), '<h1 id="$1">$1</h1>' );
		return mdp.mdInlineParser(temp, null);
	},
	convertedHTML: new Array()
});
```
