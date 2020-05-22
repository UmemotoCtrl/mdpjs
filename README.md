# MarkdownParser
A somewhat functional JavaScript Markdown parser, strong in formulas [Web Site](https://umemotoctrl.github.io/MarkdownParser/)

## Usage

## Feature

### Advantage

* Do not react to markdown control symbols in formulas and comments.
* Supports semi-infinite nested lists, with or without numbers.

### Limiatation

* Title must be placed at the beginning of the file with "#".
* Blank lines behind the table are required.
* Table does not support cell joining.
* Lists are separated by a blank line.
* No <p> tags are created in the list.
* List is nested by spaces (non-tab), nested with more than 2 spaces.
* The beginning of the number list is always 1, there is no beginning in 2 or more.
* Only $$ is supported for independent line formulas. Putting $$ in a line which should have only $$.
* For code blocks, the code type MUST be required, such as "````clang".
* (may not a problem) dedicated delim+"..." Paragraphs denoted by +delim cannot be processed.	

