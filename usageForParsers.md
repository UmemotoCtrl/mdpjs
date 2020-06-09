# Usage for Various Javascript Markdown Parsers in Client Side

## Introduction

There are many javascript markdown parsers. For some of them, client-side usage is not introduced familiar with noobs. Therefore, I introduce simple usage for their parsers in client side.

## Marked

There is enough usage description in [Github Repository](https://github.com/markedjs/marked).

In html header, add

```html
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
```

Then, in your script,

```javascript
var parsedHtml = marked(markdown_source);
```

## commonmark.js

There is almost enough usage description in [Github Repository](https://github.com/commonmark/commonmark.js).

In html header, add

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/commonmark/0.29.1/commonmark.min.js" integrity="sha256-cJ/MjQVItrJja/skVD57W8McWNeVq14/h4qOuq++CvI=" crossorigin="anonymous"></script>
```

Then, in your script,

```javascript
var commonmarkReader = new commonmark.Parser();
var commonmarkWriter = new commonmark.HtmlRenderer();
var nodeTree = commonmarkReader.parse(markdown_source);
var parsedHtml = commonmarkWriter.render(nodeTree);	
```

The two steps procedure is required.

## Showdown

There is also almost enough usage description in [Github Repository](https://github.com/showdownjs/showdown).

In html header, add

```html
<script <script src="https://cdn.jsdelivr.net/npm/showdown@1.9.1/dist/showdown.min.js"></script>
```

Then, in your script,

```javascript
var converter = new showdown.Converter(),
var parsedHtml = converter.makeHtml(markdown_source);
```

## makdown-it

See [Github Repository](https://github.com/markdown-it/markdown-it). In html header, add

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/markdown-it/11.0.0/markdown-it.min.js" integrity="sha256-3mv+NUxFuBg26MtcnuN2X37WUxuGunWCCiG2YCSBjNc=" crossorigin="anonymous"></script>
```

Then, in your script,

```javascript
var md = window.markdownit();
var parsedHtml = md.render(markdown_source);
```

## remarkable

See [Github Repository](https://github.com/jonschlinkert/remarkable). The usage description may not be enough.

In html header, add

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/markdown-it/11.0.0/markdown-it.min.js" integrity="sha256-3mv+NUxFuBg26MtcnuN2X37WUxuGunWCCiG2YCSBjNc=" crossorigin="anonymous"></script>
```

Then, in your script,

```javascript
var remarkable1;  // For convenience, global variable is defined.
window.onload = function() {
	// This need to be in onload function.
	remarkable1 = new window.remarkable.Remarkable;
}

// You can write follows anywhere in your script.
var parsedHtml = remarkable1.render(markdown_source);
```


