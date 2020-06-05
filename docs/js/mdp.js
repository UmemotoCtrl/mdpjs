//
// MIT License
// Copyright (c) 2020 Kazuki UMEMOTO
// see https://github.com/UmemotoCtrl/MarkdownParser/blob/master/LICENSE for details
//

// 
// Usage
// 
// var mdp = makeMDP();
// var html_text = mdp.render( markdown_test );
// 
// ============
// CHANGE SYNTAX
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
// 		convertedHTML: new Array()
// });
// mdp.addInlineSyntax ({	// this is sample for img
// 	tag: "IG",
// 	priority: 60,
// 	provisionalText: '<img url="$2" alt="$1"></img>',
// 	matchRegex: new RegExp("!\\[(.+?)\\]\\((.+?)\\)", 'g'),
// 	converter: function ( argBlock ) {
// 		return null;
// 	},
// 	convertedHTML: new Array()
// });
// mdp.addBlockSyntax ({	// this is sample for Setext headings
// 		tag: "SH",
// 		priority: 60,
// 		provisionalText: "\n"+mdp.config.delimiter+"SH"+mdp.config.delimiter+"\n",	// should include delimiter+tag+delimiter
// 		matchRegex: new RegExp("\\n.+\\n *=+[ =]*=+ *(?=\\n)", 'g'),
// 		converter: function ( argBlock ) {
// 			var temp = argBlock.replace(/"/g, '')
// 			.replace( new RegExp('^\\n*(.+)\\n *=+[ =]*=+ *'), '<h1 id="$1">$1</h1>' );
// 			return mdp.mdInlineParser(temp, null, null);
// 		},
// 		convertedHTML: new Array()
// });
// mdp.removeBlockSyntax("H1");

let makeMDP = function () {
	let makeBlockSyntax = function (argObj) {
		const delimiter = argObj.config.delimiter;
		const mathDelimiter = argObj.config.mathDelimiter;
		const codeLangPrefix = argObj.config.codeLangPrefix;
		let cAr = new Array();

		// The order is important.
		cAr.push ( {	// Code block with code name
			tag: "CB",
			priority: 100,
			provisionalText: "\n"+delimiter+"CB"+delimiter,
			matchRegex: new RegExp("\\n\\`\\`\\`.+?\\n[\\s\\S]*?\\n\\`\\`\\`(?=\\n)", 'g'),
			converter: function ( argBlock ) {
				return argBlock.replace( /\$/g, "$$$$").replace(	// $ will be reduced in replace method
					new RegExp("^\\n*\\`\\`\\`(.+?)\\n([\\s\\S]*)\\n\\`\\`\\`\\n*$"),
					'<pre><code class="'+codeLangPrefix+'$1">$2</code></pre>'
				);
			},
			convertedHTML: new Array()
		});
		cAr.push ( {	// Code block without code name
			tag: "CC",
			priority: 90,
			provisionalText: "\n"+delimiter+"CC"+delimiter,
			matchRegex: new RegExp("\\n\\`\\`\\`\\n[\\s\\S]*?\\n\\`\\`\\`(?=\\n)", 'g'),
			converter: function ( argBlock ) {
				return argBlock.replace( /\$/g, "$$$$").replace(
					new RegExp("^\\n*\\`\\`\\`\\n([\\s\\S]*)\\n\\`\\`\\`\\n*$"),
					"<pre><code>$1</code></pre>"
				);
			},
			convertedHTML: new Array()
		});
		for (let jj = 0; jj < (mathDelimiter||[]).length; jj++) {	// Math blocks
			cAr.push ( {
				tag: "M"+jj,
				priority: 80,
				provisionalText: "\n"+delimiter+"M"+jj+delimiter,
				matchRegex: new RegExp("\\n"+mathDelimiter[jj][0]+"\\n[\\s\\S]+?\\n"+mathDelimiter[jj][1]+"(?=\\n)", 'g'),
				converter: function ( argBlock ) {
					return argBlock.replace( /\$/g, "$$$$").replace( new RegExp("^\\n*([\\s\\S]*)\\n*$"), "$1" );
				},
				convertedHTML: new Array()
			});
		}
		cAr.push ( {	// HTML comment block
			tag: "CM",
			priority: 70,
			provisionalText: "\n"+delimiter+"CM"+delimiter,
			matchRegex: new RegExp("\\n<!--[\\s\\S]*?-->(?=\\n)", 'g'),
			converter: function ( argBlock ) {
				return argBlock.replace( /\$/g, "$$$$")
					.replace( new RegExp("^\\n*(<!--[\\s\\S]*?-->)\\n*$"), "$1" );
			},
			convertedHTML: new Array()
		});
		cAr.push ( {	// Horizontal Rule
			tag: "HR",
			priority: 50,
			provisionalText: "\n\n"+delimiter+"HR"+delimiter+"\n",	// to divide list, \n is added.
			matchRegex: new RegExp("\\n *[-+*=] *[-+*=] *[-+*=][-+*= ]*(?=\\n)", 'g'),
			converter: function ( argBlock ) {
				return "<hr>";
			},
			convertedHTML: new Array()
		});
		cAr.push ( {	// Blockquote
			tag: "BQ",
			priority: 40,
			provisionalText: "\n"+delimiter+"BQ"+delimiter,
			matchRegex: new RegExp("\\n *> *[\\s\\S]*?(?=\\n\\n)", 'g'),
			converter: function ( argBlock ) {
				var temp = argBlock
					.replace( new RegExp("^\\n*([\\s\\S]*)\\n*$"), "$1" );
				return Obj.mdInlineParser( temp, Obj.mdBlockquoteParser, null );
			},
			convertedHTML: new Array()
		});
		cAr.push ( {	// Table
			tag: "TB",
			priority: 30,
			provisionalText: "\n\n"+delimiter+"TB"+delimiter,
			matchRegex: new RegExp("\\n\\n\\|.+?\\| *\\n\\|[-:| ]*\\| *\\n\\|.+?\\|[\\s\\S]*?(?=\\n\\n)", 'g'),
			converter: function ( argBlock ) {
				var temp = argBlock
					.replace( new RegExp("^\\n*([\\s\\S]*)\\n*$"), "$1" );
				return Obj.mdInlineParser( temp, Obj.mdTBParser, null );
			},
			convertedHTML: new Array()
		});
		// Before this line, the blocks can be included in lists excepting table and horizontal rule.
		cAr.push ( {	// UList
			tag: "UL",
			priority: 20,
			provisionalText: "\n\n"+delimiter+"UL"+delimiter,
			matchRegex: new RegExp("\\n\\n\\ *[-+*] [\\s\\S]*?(?=\\n\\n)", 'g'),
			converter: function ( argBlock ) {
				var temp = argBlock
					.replace( new RegExp("^\\n*([\\s\\S]*)\\n*$"), "$1" );
				return Obj.mdInlineParser( temp, Obj.mdListParser, "UL" );
			},
			convertedHTML: new Array()
		});
		cAr.push ( {	// OList
			tag: "OL",
			priority: 20,
			provisionalText: "\n\n"+delimiter+"OL"+delimiter,
			matchRegex: new RegExp("\\n\\n *\\d+?\\. [\\s\\S]*?(?=\\n\\n)", 'g'),
			converter: function ( argBlock ) {
				var temp = argBlock
					.replace( new RegExp("^\\n*([\\s\\S]*)\\n*$"), "$1" );
				return Obj.mdInlineParser( temp, Obj.mdListParser, "OL" );
			},
			convertedHTML: new Array()
		});
		// After this line, the blocks are NOT included in lists.
		for (let jj = 1; jj < 5; jj++) {	// Headers
			cAr.push ( {
				tag: "H"+jj,
				priority: 10,
				provisionalText: "\n"+delimiter+"H"+jj+delimiter,
				matchRegex: new RegExp("\\n#{"+jj+"} +.+?(?=\\n)", 'g'),
				converter: function ( argBlock ) {
					var temp = argBlock.replace(/"/g, '')
						.replace( new RegExp('^\\n*#{'+jj+'} +(.+?)[\\s#]*$'), '<h'+jj+' id="$1">$1</h'+jj+'>' );
					return Obj.mdInlineParser(temp, null, null);
				},
				convertedHTML: new Array()
			});
		}
		cAr.push ( {	// Paragraph
			tag: "PP",
			priority: 0,
			provisionalText: "\n"+delimiter+"PP"+delimiter,
			matchRegex: new RegExp("\\n[^"+delimiter[0]+"\\n][\\s\\S]*?(?=\\n\\n)", 'g'),
			converter: function ( argBlock ) {
				var temp = argBlock
					.replace( new RegExp("^\\n*([\\s\\S]*)\\n*$"), "<p>$1</p>" );
					return Obj.mdInlineParser(temp, null, null);
			},
			convertedHTML: new Array()
		});
		return cAr;
	}
	let makeInlineSyntax = function (argObj) {
		const delimiter = argObj.config.delimiter;
		let cAr = new Array();
		cAr.push ({	// inline code
			tag: "IC",
			priority: 100,
			provisionalText: delimiter+delimiter+"IC"+delimiter+delimiter,
			// should include delimiter+tag+delimiter
			matchRegex: new RegExp("`.+?`", 'g'),
			converter: function ( argBlock ) {
				return "<code>"+ argBlock.replace( /\$/g, "$$$$$$").replace(/`(.+?)`/g,"$1").replace(/</g,'&lt;').replace(/>/g,'&gt;') +"</code>";
			},
			convertedHTML: new Array()
		});
		cAr.push ({	// inline math
			tag: "IM",
			priority: 90,
			provisionalText: delimiter+delimiter+"IM"+delimiter+delimiter,
			matchRegex: new RegExp("\\$.+?\\$", 'g'),
			converter: function ( argBlock ) {
				return argBlock;
			},
			convertedHTML: new Array()
		});

		cAr.push ({	// Anchor Link
			tag: "AC",	// Just for use array management.
			priority: 50,
			provisionalText: '<a href="$2">$1</a>',					// the string is used for replace.
			matchRegex: new RegExp("\\[(.+?)\\]\\((.+?)\\)", 'g'),	// the RexExp is used for replace.
			converter: function ( argBlock ) {return null;},
			convertedHTML: new Array()
		});
		cAr.push ({		// Strong
			tag: "SO",	// Just for use array management.
			priority: 40,
			provisionalText: '<strong>$1</strong>',
			matchRegex: new RegExp("\\*\\*(.+?)\\*\\*", 'g'),
			converter: function ( argBlock ) {return null;},
			convertedHTML: new Array()
		});
		cAr.push ({	// Emphasize
			tag: "EM",	// Just for use array management.
			priority: 30,
			provisionalText: '<em>$1</em>',
			matchRegex: new RegExp("\\*(.+?)\\*", 'g'),
			converter: function ( argBlock ) {return null;},
			convertedHTML: new Array()
		});
		cAr.push ({	// Strike
			tag: "SI",	// Just for use array management.
			priority: 20,
			provisionalText: '<strike>$1</strike>',
			matchRegex: new RegExp("~~(.+?)~~", 'g'),
			converter: function ( argBlock ) {return null;},
			convertedHTML: new Array()
		});
		return cAr;
	}

	let Obj = {
		config: {
			delimiter: "&&",		// delimiter for structure expression
			mathDelimiter: new Array(["\\${2}", "\\${2}"], ["\\\\\[", "\\\\\]"]),
			// in Regex form, = "$$ ... $$", and "\[ ... \]"
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

		mdInlineParser: function ( argText, argFunc, listType ) {
			const delimiter = this.config.delimiter;
			let cAr = this.inlineSyntax;
			for (let ii = 0; ii < (cAr||[]).length; ii++) {
				cAr[ii].convertedHTML = argText.match(  cAr[ii].matchRegex );
				for (let jj = 0; jj < (cAr[ii].convertedHTML||[]).length; jj++) {
					cAr[ii].convertedHTML[jj] = cAr[ii].converter(cAr[ii].convertedHTML[jj]);
				}
				argText = argText.replace( cAr[ii].matchRegex, cAr[ii].provisionalText );
			}
		
			if (argFunc != null && listType != null)
				argText = argFunc(argText, listType);
			else if (argFunc != null && listType == null)
				argText = argFunc(argText);
			
			for (let ii = 0; ii < (cAr||[]).length; ii++) {
				for (let jj = 0; jj < (cAr[ii].convertedHTML||[]).length; jj++) {
					argText = argText.replace( delimiter+delimiter+cAr[ii].tag+delimiter+delimiter, cAr[ii].convertedHTML[jj] );
				}
			}
			return argText;
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
				for (let jj = 0; jj < (colDivText||[]).length; jj++)
					if (colDivText[jj] == "|")
						retText +=  "<td"+alignText[jj]+">" + items[jj] + "</td>\n";
					else
						retText +=  "<td"+alignText[jj]+" colspan='"+colDivText[jj].length+"'>" + items[jj] + "</td>\n";
				retText +=  "</tr>\n";
			}
			retText +=  "</tbody></table>";
			return retText;
		},
		mdListParser: function ( argText, listType ) {
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
			let lines = argText.split(/\n/g);
			let depth = checkListDepth(lines[0]);
			let retText = "";
			let listRegex;
			if (listType == "OL")
				listRegex = new RegExp("^\\s*?\\d+\\.\\s+(.*?)$");
			else
				listRegex = new RegExp("^\\s*?[-+*]\\s+(.*?)$");
			retText += "<"+listType.toLowerCase()+"><li>";
			let lineDepth, lineType;
			let tempText = "";
			let nestLineType;
			for (let jj = 0; jj < (lines||[]).length; jj++) {
				lineDepth = checkListDepth(lines[jj]);
				lineType = checkListType(lines[jj]);
				if ( lineDepth == depth && lineType == listType) {	// add new item
					if (tempText != "") {
						retText += arguments.callee ( tempText.replace(/\n*$/, ""), nestLineType ).replace(/\n*$/, "");
						tempText = "";
					}
					retText += "</li>\n<li>"+lines[jj].replace(listRegex, "$1") + "\n";
				} else if ( lineDepth >= depth+2 ) {	// create nested list
					if (tempText == "")
						nestLineType = lineType;
					tempText += lines[jj]+"\n";
				} else {	// simple paragraph
					if (tempText != "") {
						tempText += lines[jj]+"\n";
					} else {
						retText += lines[jj]+"\n";
					}
				}
			}
			if (tempText != "") {
				retText += arguments.callee ( tempText.replace(/\n*$/, ""), nestLineType ).replace(/\n*$/, "");
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
						retText += arguments.callee(tempText) + "\n";
						tempText = "";
					}
					retText += lineText[kk] + "\n";
				}
			}
			if (tempText != "")
				retText += arguments.callee(tempText);
			return retText + '\n</blockquote>';
		},

		analyzeStructure: function( argText ) {
			const cAr = this.blockSyntax;
			// pre-formatting
			argText = argText.replace(/\r\n?/g, "\n");	// Commonize line break codes between Win and mac.
			argText = argText.replace(/\t/g, this.config.tabTo);
			argText = "\n"+ argText + "\n\n";
			
			// Convert to Structure Notation
			for (let ii = 0; ii < (cAr||[]).length; ii++) {
				cAr[ii].convertedHTML =  argText.match(cAr[ii].matchRegex);
				for (let jj = 0; jj < (cAr[ii].convertedHTML||[]).length; jj++) {
					cAr[ii].convertedHTML[jj] = cAr[ii].converter(cAr[ii].convertedHTML[jj]);
				}
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
				for (let jj = 0; jj < (cAr[ii].convertedHTML||[]).length; jj++) {
					argText = argText.replace( delimiter+cAr[ii].tag+delimiter, cAr[ii].convertedHTML[jj] );
				}
			}
			return argText;
		}
	}
	Obj.blockSyntax = makeBlockSyntax(Obj);
	Obj.inlineSyntax = makeInlineSyntax(Obj);
	return Obj;
}
