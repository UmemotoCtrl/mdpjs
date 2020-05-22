# MarkdownParser
A somewhat functional JavaScript Markdown parser, strong in formulas [Web Site](https://umemotoctrl.github.io/MarkdownParser/)

## Usage

Download [mdp.js](https://github.com/UmemotoCtrl/MarkdownParser/blob/master/docs/js/mdp.js), and add to header 

```html
<script type="text/javascript" src="js/mdp.js"></script>
```

where src should match your environment, then`var parsed_html = mdp(markdown_text);`. Of course, you can download and use it. Copy and paste is also valid because this script is very short.

## Feature

### Advantage

* Do not react to markdown control symbols in formulas and comments.
* Supports semi-infinite nested lists, with or without numbers.

### Limiatation

* Title must be placed at the beginning of the file with "#".
* Blank lines behind the table are required.
* Table does not support cell joining.
* Lists are separated by a blank line.
* No `<p>` tags are created in the list.
* List is nested by spaces (non-tab), nested with more than 2 spaces.
* The beginning of the number list is always 1, there is no beginning in 2 or more.
* Only $$ is supported for independent line formulas. Putting $$ in a line which should have only $$.
* For code blocks, the code type MUST be required, such as "````clang".
* (may not a problem) dedicated delim+"..." Paragraphs denoted by +delim cannot be processed.	

