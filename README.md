# mdpjs: MarkdownParser

[![](https://data.jsdelivr.com/v1/package/gh/UmemotoCtrl/mdpjs/badge?style=rounded)](https://www.jsdelivr.com/package/gh/UmemotoCtrl/mdpjs)
A somewhat functional JavaScript Markdown parser, affinity with formulas [Web Site](https://umemotoctrl.github.io/mdpjs/).

This script aims to use in Client-side and was made as alternative for existing js parsers because their do not work well with math formulas.

Probably the only option intended to be used in conjunction with mathjax (or katex)!

## Feature

* Do not react to markdown control symbols in formula and code blocks. The math keeps the original structure.
*  `$$ ... $$` and `\[ ... \]` are supported for independent line formulas. Putting a line which should have only `$$`, `\[`, or `\]`.

*  A single `$ ... $` is inline math. To write a literal dollar sign outside code blocks (e.g. shell variables like `$input`), write `&#36;` instead — it passes through untouched and renders as `$`.

## Usage

Add the following to header 

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/UmemotoCtrl/mdpjs@0.1.5/js/mdp.js"></script>
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

## Test

```sh
node test/run.js          # summary only, exit 1 while any case is RED
node test/run.js --dump   # also print rendered HTML per case
```

`test/run.js` renders each `test/repro/*.md` with `js/mdp.js` and checks
structural assertions (currently 7/7 PASS). Details: `test/README.md`.

| File | Covers |
|---|---|
| `blockquote-paragraphs.md` | blank `>` line keeps one quote with two paragraphs |
| `blockquote-nested.md` | `> >` yields exactly outer + one inner quote |
| `blockquote-with-blocks.md` | header / list / indented code inside quote |
| `loose-list.md` | multi-paragraph `<ol>` item (`<p>` count, no split/empty `<p>`) |
| `loose-list-nested.md` | loose item with nested list (lead `<p>` before nested `<ul>`) |
| `indented-code.md` | 4-space block becomes `<pre><code>` |
| `emphasis-underscore.md` | `_em_` / `__strong__` render like `*` / `**` |

## Size & Speed

Measured 2026-09-07 with `test/fixtures/TEST.md` (9,871 bytes) on Node v24,
500 renders each after 20 warmups (marked 18.0.11, markdown-it 15.0.1):

| Parser | Avg / render | Size (raw / gzip) |
|---|---|---|
| mdpjs | 0.78 ms | 21,216 / 5,013 bytes |
| marked | 0.64 ms | 43,800 / 13,322 bytes |
| markdown-it | 0.63 ms | 117,166 / 27,384 bytes |

Small is the win (half of marked, ~1/5 of markdown-it); speed is on par,
about 20% slower on this fixture. Times are machine-dependent.
