# MarkdownParser
A somewhat functional JavaScript Markdown parser, affinity with formulas [Web Site](https://umemotoctrl.github.io/MarkdownParser/).

This script aims to use in Client-side and was made for Marked's alternative because Marked does not work well with math formulas.

## Usage

Download [mdp.js](https://github.com/UmemotoCtrl/MarkdownParser/blob/master/docs/js/mdp.js), and add to header 

```html
<script type="text/javascript" src="js/mdp.js"></script>
```

where src should match your environment, then execute

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
		provisionalText: "\n"+mdp.config.delimiter+"SH"+mdp.config.delimiter+"\n",	// should include delimiter+tag+delimiter
		matchRegex: new RegExp("\\n.+\\n *=+[ =]*=+ *(?=\\n)", 'g'),
		converter: function ( argBlock ) {
			var temp = argBlock.replace(/"/g, '')
			.replace( new RegExp('^\\n*(.+)\\n *=+[ =]*=+ *'), '<h1 id="$1">$1</h1>' );
			return mdp.mdInlineParser(temp, null, null);
		},
		convertedHTML: new Array()
});
```

## Feature

### Advantage

* Do not react to markdown control symbols in formulas and comments.
*  `$$ ... $$` and `\[ ... \]` are supported for independent line formulas. Putting a line which should have only `$$`, `\[`, or `\]`.
* Supports deep nested lists, with or without numbers.
* This script was confirmed in Google Chrome, safari, IE11, and Edge including android and iOS.

### Limiatation and Notation

* Paragraphs cannot start with `&` which can be changed by a setting variable.
* A blank line behind the tables and lists is required.
* No `<p>` tags are created in the list.
* The beginning of the number list is always 1, there is no beginning in 2 or more.



