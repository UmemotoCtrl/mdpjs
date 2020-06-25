//
// MIT License
// Copyright (c) 2020 Kazuki UMEMOTO
// see https://github.com/UmemotoCtrl/MarkdownParser for details
//

// 
// Usage
// 
// var mdp = makeMDP();
// var html_text = mdp.render( markdown_test );
// 
// ============
// TO CHANGE SYNTAX
// ============
// 
// mdp.addBlockSyntax ({	// this is sample for Horizontal Rule
// 		tag: "HR",
// 		priority: 35,
// 		provisionalText: "\n\n"+mdp.config.delimiter+"HR"+mdp.config.delimiter+"\n",	// should include delimiter+tag+delimiter
// 		matchRegex: new RegExp("\\n *[-+*=] *[-+*=] *[-+*=][-+*= ]*(?=\\n)", 'g'),
// 		converter: function ( argBlock ) {
// 			return "<hr>";
// 		},
// 		matchedString: new Array()
// });
// mdp.addInlineSyntax ({	// this is sample for img
// 	tag: "IG",
// 	priority: 60,
// 	provisionalText: '<img src="$2" alt="$1">',
// 	matchRegex: new RegExp("!\\[(.*?)\\]\\((.+?)\\)", 'g'),
// 	converter: function ( argBlock ) {
// 		return null;
// 	},
// 	matchedString: new Array()
// });
// mdp.addBlockSyntax ({	// this is sample for Setext headings
// 	tag: "SH",
// 	priority: 60,
// 	provisionalText: mdp.config.delimiter+"SH"+mdp.config.delimiter,	// should include delimiter+tag+delimiter
// 	matchRegex: new RegExp("^.+\\n *=+[ =]*=+ *(?=\\n)", 'gm'),
// 	converter: function ( argBlock ) {
// 		var temp = argBlock.replace(/"/g, '')
// 			.replace( new RegExp('^ *(.+)\\n.*$'), '<h1 id="$1">$1</h1>' );
// 		return mdp.mdInlineParser(temp, null);
// 	},
// 	matchedString: new Array()
// });
// mdp.removeBlockSyntax("H1");

let makeMDP = function (argConfig) {
	let makeBlockSyntax = function (argObj) {
		const delimiter = argObj.config.delimiter;
		const mathDelimiter = argObj.config.mathDelimiter;
		const codeLangPrefix = argObj.config.codeLangPrefix;
		const spacesForNest = argObj.config.spacesForNest;
		const latexEnv = argObj.config.latexEnv;
		let cAr = new Array();

		// The order is important.
		cAr.push ( {	// Code block with code name
			tag: "CB",
			priority: 100,
			matchRegex: new RegExp("^`{3}.*?\\n[\\s\\S]*?\\n`{3}$", 'gm'),
			converter: function ( argBlock ) {
				var temp = argBlock.replace(/</g,'&lt;').replace(/>/g,'&gt;');
				if (/^`{3}.+$/m.test(argBlock))
					return temp.replace(	
						new RegExp("^`{3}(.+?)\\n([\\s\\S]*)\\n`{3}$"),
						'<pre><code class="'+codeLangPrefix+'$1">$2</code></pre>'
					);
				else
					return temp.replace(
						new RegExp("^`{3}\\n([\\s\\S]*)\\n`{3}$"),
						"<pre><code>$1</code></pre>"
					);
			},
			matchedString: new Array()
		});
		var mathRegEx = '';// Math Environment
		for (let jj = 0; jj < (latexEnv||[]).length; jj++) {
			mathRegEx += '^\\\\begin{'+latexEnv[jj]+'} *.*$\\n(^ *.+ *$\\n)*^[ .]*\\\\end{'+latexEnv[jj]+'} *$|';
		}
		mathRegEx = mathRegEx.replace(/\|$/, '');
		cAr.push ( {
			tag: 'ME',
			priority: 85,
			matchRegex: new RegExp(mathRegEx, 'gm'),
			converter: function ( argBlock ) { return '<div class="mdpmath">'+argBlock+'</div>' },
			matchedString: new Array()
		});
		var mathRegEx = "";// Math blocks
		for (let jj = 0; jj < (mathDelimiter||[]).length; jj++) {
			mathRegEx += "^"+mathDelimiter[jj][0]+" *.*$\\n(^ *.+ *$\\n)*^[ .]*"+mathDelimiter[jj][1]+"$|";
		}
		mathRegEx = mathRegEx.replace(/\|$/, '');
		cAr.push ( {
			tag: "MB",
			priority: 80,
			matchRegex: new RegExp(mathRegEx, 'gm'),
			converter: function ( argBlock ) {
				return '<div class="mdpmath">'+argBlock.replace(/^\n*|\n*$/g, "")+'</div>';
			},
			matchedString: new Array()
		});
		cAr.push ( {	// HTML comment block
			tag: "CM",
			priority: 70,
			matchRegex: new RegExp("^<!--[\\s\\S]*?-->$", 'gm'),
			converter: function ( argBlock ) {
				return argBlock.replace( new RegExp("^(<!--[\\s\\S]*?-->)$"), "$1" );
			},
			matchedString: new Array()
		});
		cAr.push ( {
			tag: "HD",
			priority: 60,
			provisionalText: "\n"+delimiter+"HD"+delimiter+"\n",	// to divide list, \n is added.
			matchRegex: new RegExp("^#{1,} +.+$", 'gm'),
			converter: function ( argBlock ) {
				var num = argBlock.match(/^#{1,}(?= )/)[0].length;
				var temp = argBlock.replace(/"/g, '')
					.replace( new RegExp('^\\n*#{1,} +(.+?)[\\s#]*$'), '<h'+num+' id="$1">$1</h'+num+'>' );
				return Obj.mdInlineParser(temp, null);
			},
			matchedString: new Array()
		});
		cAr.push ( {	// Horizontal Rule
			tag: "HR",
			priority: 50,
			provisionalText: "\n"+delimiter+"HR"+delimiter+"\n",	// to divide list, \n is added.
			matchRegex: new RegExp("^ *[-+*=] *[-+*=] *[-+*=][-+*= ]*$", 'gm'),
			converter: function ( argBlock ) {
				return "<hr>";
			},
			matchedString: new Array()
		});
		cAr.push ( {	// Blockquote
			tag: "BQ",
			priority: 40,
			matchRegex: new RegExp("^ *> *[\\s\\S]*?(?=\\n\\n)", 'gm'),
			converter: function ( argBlock ) {
				var temp = argBlock
					.replace( new RegExp("^\\n*([\\s\\S]*)\\n*$"), "$1" );
				return Obj.mdInlineParser( Obj.mdBlockquoteParser(temp), null );
			},
			matchedString: new Array()
		});
		cAr.push ( {	// Table
			tag: "TB",
			priority: 30,
			matchRegex: new RegExp("^\\|.+?\\| *\\n\\|[-:| ]*\\| *\\n\\|.+?\\|[\\s\\S]*?(?=\\n\\n)", 'gm'),
			converter: function ( argBlock ) {
				argBlock = Obj.mdInlineParserFormer(argBlock);
					var temp = argBlock
					.replace( new RegExp("^\\n*([\\s\\S]*)\\n*$"), "$1" );
				return Obj.mdInlineParserLatter(Obj.mdTBParser(temp));
			},
			matchedString: new Array()
		});
		cAr.push ( {	// List
			tag: "LT",
			priority: 20,
			matchRegex: new RegExp('^ *\\d+?\\. [\\s\\S]*?$(?!\\n\\s*^ *\\d+?\\. |\\n\\s*^ {2,}.+$)(?=\\n\\n)'+'|'
					+'^ *[-+*] [\\s\\S]*?$(?!\\n\\s*^ *[-+*] |\\n\\s*^ {2,}.+$)(?=\\n\\n)', 'gm'),
			converter: function ( argBlock ) {
				var temp = argBlock
					.replace( new RegExp("^\\n*([\\s\\S]*)\\n*$"), "$1" );
				return Obj.mdInlineParser( Obj.mdListParser(temp, spacesForNest), null );
			},
			matchedString: new Array()
		});
		cAr.push ( {	// Paragraph
			tag: "PP",
			priority: 0,
			matchRegex: new RegExp('^.(?!'+delimiter[0]+'.{2}'+delimiter+')[\\s\\S]*?\\n$', 'gm'),
			converter: function ( argBlock ) {
				var temp = '<p>'+argBlock.replace( /^\n*|\n*$/g, "" )+'</p>';
				return Obj.mdInlineParser(temp, null);
			},
			matchedString: new Array()
		});
		return cAr;
	}
	let makeInlineSyntax = function (argObj) {
		const subsDollar = argObj.config.subsDollar;
		let cAr = new Array();
		cAr.push ({	// inline code
			tag: "IC",
			priority: 100,
			matchRegex: new RegExp("`.+?`", 'g'),
			converter: function ( argBlock ) {
				return "<code>"+ argBlock.replace(/`(.+?)`/g,"$1").replace(/</g,'&lt;').replace(/>/g,'&gt;') +"</code>";
			},
			matchedString: new Array()
		});
		cAr.push ({	// inline math
			tag: "IM",
			priority: 90,
			matchRegex: new RegExp(subsDollar+".+?"+subsDollar, 'g'),
			converter: function ( argBlock ) { return '<span class="mdpmath">'+argBlock+'</span>'; },
			matchedString: new Array()
		});
		cAr.push ({	// math reference
			tag: "RF",
			priority: 70,
			provisionalText: '<span class="mdpmath">\\$1ref{$2}</span>',
			matchRegex: new RegExp('\\\\(eq)?ref{(.*)}', 'g'),
			converter: function ( argBlock ) {return null;},
			matchedString: new Array()
		});
		cAr.push ({	// img
			tag: "IG",
			priority: 60,
			provisionalText: '<img src="$2" alt="$1">',
			matchRegex: new RegExp("!\\[(.*?)\\]\\((.+?)\\)", 'g'),
			converter: function ( argBlock ) {return null;},
			matchedString: new Array()
		});
		cAr.push ({	// Anchor Link
			tag: "AC",	// Just for use array management.
			priority: 50,
			provisionalText: '<a href="$2">$1</a>',					// the string is used for replace.
			matchRegex: new RegExp("\\[(.+?)\\]\\((.+?)\\)", 'g'),	// the RexExp is used for replace.
			converter: function ( argBlock ) {return null;},
			matchedString: new Array()
		});
		cAr.push ({		// Strong
			tag: "SO",	// Just for use array management.
			priority: 40,
			provisionalText: '<strong>$1</strong>',
			matchRegex: new RegExp("\\*\\*(.+?)\\*\\*", 'g'),
			converter: function ( argBlock ) {return null;},
			matchedString: new Array()
		});
		cAr.push ({	// Emphasize
			tag: "EM",	// Just for use array management.
			priority: 30,
			provisionalText: '<em>$1</em>',
			matchRegex: new RegExp("\\*(.+?)\\*", 'g'),
			converter: function ( argBlock ) {return null;},
			matchedString: new Array()
		});
		cAr.push ({	// Strike
			tag: "SI",	// Just for use array management.
			priority: 20,
			provisionalText: '<strike>$1</strike>',
			matchRegex: new RegExp("~~(.+?)~~", 'g'),
			converter: function ( argBlock ) {return null;},
			matchedString: new Array()
		});
		return cAr;
	}

	let Obj = {
		config: {
			delimiter: "&&",		// delimiter for structure expression
			subsDollar: "&MDPDL&",
			mathDelimiter: new Array(["$$", "$$"], ["\\\\\\[", "\\\\\\]"]),
			// in Regex form, = "$$ ... $$", and "\[ ... \]"
			latexEnv: new Array('equation', 'eqnarray', 'align', 'align\\*'),
			spacesForNest: 2,			// number of spaces for nested lists.
			tabTo: "  ",			// \t -> two spaces
			codeLangPrefix: "language-"		// ```clang ... ``` -> <pre><code class="language-clang"> ... </code></pre>
		},
		blockSyntax: new Array(),
		inlineSyntax: new Array(),

		// For Syntax modification
		addBlockSyntax: function ( argSyntax ) {
			if (argSyntax.tag==null||argSyntax.tag=="") {
				console.log('tag is required.');
				return false;
			} 
			if (!Number.isInteger(argSyntax.priority)) {
				console.log('priority should be integer from 0 to 100.');
				return false;
			} 
			argSyntax.priority = Math.min(100, argSyntax.priority);
			argSyntax.priority = Math.max(0, argSyntax.priority);
			this.removeBlockSyntax(argSyntax.tag);
			for (let ii = 0; ii < (this.blockSyntax||[]).length; ii++) {
				if ( argSyntax.priority > this.blockSyntax[ii].priority ) {
					this.blockSyntax.splice(ii, 0, argSyntax);
					return true;
				}
			}
			return false;
		},
		removeBlockSyntax: function ( argTag ) {
			for (let ii = 0; ii < (this.blockSyntax||[]).length; ii++)
				if (this.blockSyntax[ii].tag == argTag) {
					this.blockSyntax.splice(ii, 1);
					return true;
				}
			return false;
		},
		addInlineSyntax: function ( argSyntax ) {
			if (argSyntax.tag==null||argSyntax.tag=="") {
				console.log('tag is required.');
				return false;
			} 
			if (!Number.isInteger(argSyntax.priority)) {
				console.log('priority should be integer from 0 to 100.');
				return false;
			} 
			argSyntax.priority = Math.min(100, argSyntax.priority);
			argSyntax.priority = Math.max(0, argSyntax.priority);
			this.removeInlineSyntax(argSyntax.tag);
			for (let ii = 0; ii < (this.inlineSyntax||[]).length; ii++) {
				if ( argSyntax.priority > this.inlineSyntax[ii].priority ) {
					this.inlineSyntax.splice(ii, 0, argSyntax);
					return true;
				}
			}
			return false;
		},
		removeInlineSyntax: function ( argTag ) {
			for (let ii = 0; ii < (this.inlineSyntax||[]).length; ii++)
				if (this.inlineSyntax[ii].tag == argTag) {
					this.inlineSyntax.splice(ii, 1);
					return true;
				}
			return false;
		},

		mdInlineParserFormer: function ( argText ) {
			let cAr = this.inlineSyntax;
			for (let ii = 0; ii < (cAr||[]).length; ii++) {
				cAr[ii].matchedString = argText.match(  cAr[ii].matchRegex );
				for (let jj = 0; jj < (cAr[ii].matchedString||[]).length; jj++) {
					cAr[ii].matchedString[jj] = cAr[ii].converter(cAr[ii].matchedString[jj]);
				}
				if (typeof cAr[ii].provisionalText == 'undefined')
					cAr[ii].provisionalText = this.config.delimiter+this.config.delimiter
						+cAr[ii].tag+this.config.delimiter+this.config.delimiter;
				argText = argText.replace( cAr[ii].matchRegex, cAr[ii].provisionalText );
			}
			return argText;
		},
		mdInlineParserLatter: function ( argText ) {
			const delimiter = this.config.delimiter;
			let cAr = this.inlineSyntax;
			for (let ii = 0; ii < (cAr||[]).length; ii++) {
				for (let jj = 0; jj < (cAr[ii].matchedString||[]).length; jj++) {
					argText = argText.replace( delimiter+delimiter+cAr[ii].tag+delimiter+delimiter, cAr[ii].matchedString[jj] );
				}
			}
			return argText;
		},
		mdInlineParser: function ( argText ) {
			argText = this.mdInlineParserFormer(argText);
			return this.mdInlineParserLatter(argText);
		},
		mdTBParser: function ( argText ) {
			let retText = "";
			let lineText = argText.split(/\n/);
			// For 2nd line
			let items = lineText[1].replace(/^\|\s*/, "").replace(/\s*\|$/, "").split(/\s*\|\s*/g);
			let alignText = new Array();
			for (let jj = 0; jj < items.length; jj++)
				if ( /^:[\s-]+:$/.test(items[jj]) )
					alignText.push(" style='text-align:center'");	// center align
				else if( /^:[\s-]+$/.test(items[jj]) )
					alignText.push(" style='text-align:left'");		// left align
				else if( /^[\s-]+:$/.test(items[jj]) )
					alignText.push(" style='text-align:right'");	// right align
				else
					alignText.push("");
			// For 1st line
			retText = "<table>\n";
			retText +=  "<thead><tr>\n";
			items = lineText[0].replace(/^\|\s*/, "").replace(/\s*\|$/, "").split(/\s*\|\s*/g);
			for (let jj = 0; jj < alignText.length; jj++)
				retText +=  "<th"+alignText[jj]+">" + items[jj] + "</th>\n";
			// For 3rd and more
			retText +=  "</tr></thead>\n";
			retText +=  "<tbody>\n";
			for (let kk = 2; kk < lineText.length; kk++) {
				lineText[kk] = lineText[kk].replace(/^\|\s*/, "");
				items = lineText[kk].split(/\s*\|+\s*/g);
				let colDivText = lineText[kk].replace(/\s/g, "").match(/\|+/g);
				retText +=  "<tr>\n";
				let num = 0;
				for (let jj = 0; jj < (colDivText||[]).length; jj++) {
					if (colDivText[jj] == "|") {
						retText +=  "<td"+alignText[num]+">" + items[jj] + "</td>\n";
						num += 1;
					} else {
						retText +=  "<td"+alignText[num]+" colspan='"+colDivText[jj].length+"'>" + items[jj] + "</td>\n";
						num += colDivText[jj].length;
					}
				}
				retText +=  "</tr>\n";
			}
			retText +=  "</tbody></table>";
			return retText;
		},
		mdListParser: function ( argText, spacesForNest ) {
			let checkListDepth = function ( argLine ) {
				let listType = checkListType ( argLine );
				let spaceRegex;
				if (listType == "OL")
					spaceRegex = new RegExp("^\\s*?(?=\\d+\\.\\s+.*?$)");
				else
					spaceRegex = new RegExp("^\\s*?(?=[-+*]\\s+.*?$)");
				let depth;
				let spaceText = argLine.match(spaceRegex);
				if (spaceText == null)
					depth = 0;
				else
					depth = spaceText[0].length;
				return depth;
			}
			let checkListType = function ( argLine ) {
				argLine = argLine.replace(/\n/g, "");
				olRegex = new RegExp("^\\s*?\\d+\\.\\s+.*?$");
				ulRegex = new RegExp("^\\s*?[-+*]\\s+.*?$");
				if ( olRegex.test(argLine) )
					return "OL";
				else if ( ulRegex.test(argLine) )
					return "UL";
				else
					return "RW";
			}
			let loose;
			if ( /^ *$/m.test(argText) ) loose = true;
			else loose = false;
			let lines = argText.split(/\n/g);
			let depth = checkListDepth(lines[0]);
			let listType = checkListType(lines[0]);
			let retText = "";
			let listRegex;
			if (listType == "OL")
				listRegex = new RegExp("^\\s*?\\d+\\.\\s+(.*?)$");
			else
				listRegex = new RegExp("^\\s*?[-+*]\\s+(.*?)$");
			retText += "<"+listType.toLowerCase()+"><li>";
			let lineDepth, lineType;
			let tempText = "";
			for (let jj = 0; jj < (lines||[]).length; jj++) {
				lineDepth = checkListDepth(lines[jj]);
				lineType = checkListType(lines[jj]);
				if ( lineDepth == depth && lineType == listType) {	// add new item
					if (tempText != "") {
						retText += this.mdListParser( tempText.replace(/\n*$/, ""), spacesForNest ).replace(/\n*$/, "");
						tempText = "";
					}
					if (loose) retText += "</li>\n<li><p>"+lines[jj].replace(listRegex, "$1") + "</p>\n";
					else retText += "</li>\n<li>"+lines[jj].replace(listRegex, "$1") + "\n";
				} else if ( lineDepth >= depth+this.config.spacesForNest) {	// create nested list
					tempText += lines[jj]+"\n";
				} else {	// simple paragraph
					if (tempText != "") {
						tempText += lines[jj]+"\n";
					} else {
						if (loose) retText += '<p>'+lines[jj]+'</p>\n';
						else retText += lines[jj]+"\n";
					}
				}
			}
			if (tempText != "") {
				retText += this.mdListParser( tempText.replace(/\n*$/, ""), spacesForNest ).replace(/\n*$/, "");
			}
	
			retText += "</li></"+listType.toLowerCase()+">";
			return retText.replace(/<li>\n*<\/li>/g, "");
		},
		mdBlockquoteParser: function ( argText ) {
			let retText = '<blockquote>\n';
			argText = argText.replace( /\n\s*(?=[^>])/g, " ");
			argText = argText.replace( /^\s*>\s*/, "").replace( /\n\s*>\s*/g, "\n");
			let lineText = argText.split(/\n/);
			let tempText = "";
			for (let kk = 0; kk < (lineText||[]).length; kk++) {
				if ( /^\s*>\s*/.test(lineText[kk]) ) {
					tempText += lineText[kk] + "\n";
				} else {
					if ( tempText != "" ) {
						retText += this.mdBlockquoteParser(tempText) + "\n";
						tempText = "";
					}
					retText += lineText[kk] + "\n";
				}
			}
			if (tempText != "")
				retText += this.mdBlockquoteParser(tempText);
			return retText + '\n</blockquote>';
		},

		analyzeStructure: function( argText ) {
			const cAr = this.blockSyntax;
			// pre-formatting
			argText = argText.replace(/\r\n?/g, "\n");	// Commonize line break codes between Win and mac.
			argText = argText.replace(/\t/g, this.config.tabTo);
			argText = argText.replace(/\$/g, this.config.subsDollar);
			argText = "\n"+ argText + "\n\n";
			
			// Convert to Structure Notation
			for (let ii = 0; ii < (cAr||[]).length; ii++) {
				cAr[ii].matchedString =  argText.match(cAr[ii].matchRegex);
				if (typeof cAr[ii].provisionalText == 'undefined')
					cAr[ii].provisionalText = this.config.delimiter+cAr[ii].tag+this.config.delimiter;
				argText = argText.replace( cAr[ii].matchRegex, cAr[ii].provisionalText );
			}
			argText = argText.replace(/\n{2,}/g, "\n");
			// console.log(argText);	// to see structure
			return argText;
		},
		render: function( argText ) {
			const cAr = this.blockSyntax;
			const delimiter = this.config.delimiter;

			argText = this.analyzeStructure(argText);

			// Restore to html
			for (let ii = (cAr||[]).length-1; ii >= 0; ii--) {
				for (let jj = 0; jj < (cAr[ii].matchedString||[]).length; jj++) {
					argText = argText.replace( delimiter+cAr[ii].tag+delimiter, cAr[ii].converter(cAr[ii].matchedString[jj]) );
				}
			}
			argText = argText.replace(new RegExp(this.config.subsDollar, 'g'), '$');
			return argText;
		}
	}

	if (typeof argConfig != 'undefined') {
		let keys = Object.keys(argConfig);
		for (let ii = 0; ii < (keys||[]).length; ii++)
			Obj.config[keys[ii]] = argConfig[keys[ii]];
	}
	for (let ii = 0; ii < (Obj.config.mathDelimiter||[]).length; ii++) {
		for (let jj = 0; jj < (Obj.config.mathDelimiter[ii]||[]).length; jj++) {
			Obj.config.mathDelimiter[ii][jj] = Obj.config.mathDelimiter[ii][jj].replace(/\$/g, Obj.config.subsDollar);
		}
	}
	Obj.blockSyntax = makeBlockSyntax(Obj);
	Obj.inlineSyntax = makeInlineSyntax(Obj);
	return Obj;
}
