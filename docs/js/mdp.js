function mdBlockParser( argText, func=null, depth=null ) {
	// Evacuating comments and formulas --
	var evacuatedText;
	evacuatedText = argText.match(  /`(.+?)`/g );
	argText       = argText.replace(/`(.+?)`/g, "&&&IC&&&");
	var evacuatedMath;
	evacuatedMath = argText.match(  /\$(.+?)\$/g );
	argText       = argText.replace(/\$(.+?)\$/g, "&&&IM&&&");
	// -- Evacuating comments and formulas
	argText = argText.replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2'>$1</a>");	// Anchor Link
	argText = argText.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");	// Strong
	argText = argText.replace(/~~(.+?)~~/g, "<strike>$1</strike>");	// Strike
	argText = argText.replace(/\*(.+?)\*/g, "<em>$1</em>");	// Emphasize

	if (func != null && depth != null)
		argText = func(argText, depth);
	else if (func != null && depth == null)
		argText = func(argText);
	
	// Restoring comments and formulas --
	if (evacuatedMath != null)
		for (let ii = 0; ii < evacuatedMath.length; ii++)
			argText = argText.replace("&&&IM&&&", evacuatedMath[ii]);
	if (evacuatedText != null)
		for (let ii = 0; ii < evacuatedText.length; ii++)
			argText = argText.replace("&&&IC&&&",
				"<code>"+ evacuatedText[ii].replace(/`/g,"").replace(/</g,'&lt;').replace(/>/g,'&gt;') +"</code>");
	// -- Restoring comments and formulas
	return argText;
}

function mdTBParser( argText ) {
	var retText = "";
	var lineText = argText.split(/\n/);
	retText = "<table>\n";
	retText +=  "<thead><tr>\n";
	var items = lineText[0].replace(/^\|\s*/, "").replace(/\s*\|$/, "").split(/\s*\|\s*/g);
	for (let jj = 0; jj < items.length; jj++) {
		retText +=  "<th>" + items[jj] + "</th>\n";
	}
	retText +=  "</tr></thead>\n";
	retText +=  "<tbody>\n";
	for (let kk = 2; kk < lineText.length; kk++) {
		var items = lineText[kk].replace(/^\|\s*/, "").replace(/\s*\|$/, "").split(/\s*\|\s*/g);
		retText +=  "<tr>\n";
		for (let jj = 0; jj < items.length; jj++) {
			retText +=  "<td>" + items[jj] + "</td>\n";
		}
		retText +=  "</tr>\n";
	}
	retText +=  "</tbody></table>\n";
	argText = retText;
	return argText;
}
function makeChildList(argText1, num) {
	argText1 = "\n" + argText1 + "\n";
	var tempText = argText1.match(/(?<=\n)\s*?(?=\d+?\.\s)/);
	var pos = 1000000;
	var tempText2 = argText1.match(/(?<=\n)\s*?(?=[-*+]\s)/g);
	var pos2 = 1000000;
	if (tempText != null && tempText[0].length >= num+2 )
		pos = argText1.search(/(?<=\n)\s*?\d+?\.\s/);
	if (tempText2 != null && tempText2[0].length >= num+2 )
		pos2 = argText1.search(/(?<=\n)\s*?[-*+]\s/g);

	if (pos < pos2)
		return mdOLParser( argText1, tempText[0].length );
	else if  (pos2 < pos)
		return mdULParser( argText1, tempText2[0].length );
	else
		return argText1;
}
function mdULParser( argText, num ) {
	argText = "\n" + argText;
	var retText = "";
	var regexpDiv = new RegExp('(?<=\\n)\\s{'+num+'}[-*+]\\s', 'g');
	var divText1 = argText.split(regexpDiv);
	if (divText1 != null) {
		retText = divText1[0] + "\n<ul>\n";
		for (let ii = 1; ii < (divText1||[]).length; ii++) {
			retText += "<li>" + makeChildList(divText1[ii], num) + "</li>\n";
		}
		retText += "</ul>\n";
	}
	argText = retText;
	return argText;
}
function mdOLParser( argText, num ) {
	argText = "\n" + argText;
	var retText = "";
	var regexpDiv = new RegExp('(?<=\\n)\\s{'+num+'}\\d+?\\.\\s', 'g');
	var divText = argText.split(regexpDiv);
	if (divText != null) {
		retText = divText[0] + "\n<ol>\n";
		for (let ii = 1; ii < (divText||[]).length; ii++) {
			retText += "<li>" + makeChildList(divText[ii], num) + "</li>\n";
		}
		retText += "</ol>\n";
	}
	argText = retText;
	return argText;
}

function mdp( argText ) {
	// settings
	delim = "&&";

	argText = argText.replace(/\r\n?/g, "\n");	// Commonize line break codes between Win and mac.
	argText += "\n\n";
	var evH1 = argText.match(/^\n*?#\s+.*?(?=\n)/);
	if (evH1 != null)
		argText = argText.replace(/^\n*?#\s+.*?(?=\n)/, delim+"H1"+delim+"\n");
	var evCB = argText.match(/(?<=\n)\`\`\`.+?\n[\s\S]*?\n\`\`\`(?=\n)/g);
	if (evCB != null)
		argText = argText.replace(/(?<=\n)\`\`\`.+?\n[\s\S]*?\n\`\`\`(?=\n)/g, "\n"+delim+"CB"+delim+"\n");
	var evMB = argText.match(/(?<=\n)\${2}\n[\s\S]+?\n\${2}(?=\n)/g);
	if (evMB != null)
		argText = argText.replace(/(?<=\n)\${2}\n[\s\S]+?\n\${2}(?=\n)/g, "\n"+delim+"MB"+delim+"\n");
	var evHR = argText.match(/(?<=\n)\s*?-{3,}\s*(?=\n)/g);
	if (evHR != null)
		argText = argText.replace(/(?<=\n)\s*?-{3,}\s*(?=\n)/g, "\n"+delim+"HR"+delim+"\n");
	var evH2 = argText.match(/(?<=\n)##\s+.*?(?=\n)/g);
	if (evH2 != null)
		argText = argText.replace(/(?<=\n)##\s+.*?(?=\n)/g, "\n"+delim+"H2"+delim+"\n");
	var evH3 = argText.match(/(?<=\n)###\s+.*?(?=\n)/g);
	if (evH3 != null)
		argText = argText.replace(/(?<=\n)###\s+.*?(?=\n)/g, "\n"+delim+"H3"+delim+"\n");
	var evH4 = argText.match(/(?<=\n)####\s+.*?(?=\n)/g);
	if (evH4 != null)
		argText = argText.replace(/(?<=\n)####\s+.*?(?=\n)/g, "\n"+delim+"H4"+delim+"\n");
	var evUL = argText.match(/(?<=\n)[-+*]\s[\s\S]*?(?=\n\n)/g);
	if (evUL != null)
		argText = argText.replace(/(?<=\n)[-+*]\s[\s\S]*?(?=\n\n)/g, "\n"+delim+"UL"+delim);
	var evOL = argText.match(/(?<=\n)\d+?\.\s[\s\S]*?(?=\n\n)/g);
	if (evOL != null)
		argText = argText.replace(/(?<=\n)\d+?\.\s[\s\S]*?(?=\n\n)/g, "\n"+delim+"OL"+delim);
	var evTB = argText.match(/(?<=\n\n)\|.+?\|\s*?\n\|[-|\s]*?\|\s*?\n\|.+?\|[\s\S]*?(?=\n\n)/g);
	if (evTB != null)
		argText = argText.replace(/(?<=\n\n)\|.+?\|\s*?\n\|[-|\s]*?\|\s*?\n\|.+?\|[\s\S]*?(?=\n\n)/g, delim+"TB"+delim);

	var regexpDiv = new RegExp('^'+delim+'..'+delim+'$', 'g');
	evPP = argText.match(/(?<=\n{2,}).[\s\S]*?(?=\n{2,})/g);
	evPP = evPP.filter(function(value) {
		var tempValue = value.match(regexpDiv);
		if (tempValue == null) return value;
		else return null;
	});
	for (let ii = 0; ii < (evPP||[]).length; ii++) {
		argText = argText.replace(evPP[ii], delim+"PP"+delim);
	}

	argText = argText.replace(/&&H1&&/, mdBlockParser(evH1[0]).replace(/^\n{0,}#\s+(.+?)$/, "<h1 class='$1'>$1</h1>"));
	for (let ii = 0; ii < (evHR||[]).length; ii++) {
		argText = argText.replace(/&&HR&&/, "<hr>");
	}
	for (let ii = 0; ii < (evH2||[]).length; ii++) {
		argText = argText.replace(/&&H2&&/, mdBlockParser(evH2[ii]).replace(/^\n{0,}#{2}\s+(.+?)$/, "<h2 class='$1'>$1</h2>") );
	}
	for (let ii = 0; ii < (evH3||[]).length; ii++) {
		argText = argText.replace(/&&H3&&/, mdBlockParser(evH3[ii]).replace(/^\n{0,}#{3}\s+(.+?)$/, "<h3 class='$1'>$1</h3>") );
	}
	for (let ii = 0; ii < (evH4||[]).length; ii++) {
		argText = argText.replace(/&&H4&&/, mdBlockParser(evH4[ii]).replace(/^\n{0,}#{4}\s+(.+?)$/, "<h4 class='$1'>$1</h4>") );
	}
	for (let ii = 0; ii < (evPP||[]).length; ii++) {
		argText = argText.replace(/&&PP&&/, "<p>"+mdBlockParser(evPP[ii])+"</p>" );
	}
	for (let ii = 0; ii < (evTB||[]).length; ii++) {
		argText = argText.replace(/&&TB&&/, mdBlockParser(evTB[ii], mdTBParser) );
	}
	for (let ii = 0; ii < (evUL||[]).length; ii++) {
		argText = argText.replace(/&&UL&&/, mdBlockParser(evUL[ii], makeChildList, -2) );
		// argText = argText.replace(/&&UL&&/, mdBlockParser(evUL[ii], mdULParser, 0) );
	}
	for (let ii = 0; ii < (evOL||[]).length; ii++) {
		argText = argText.replace(/&&OL&&/, mdBlockParser(evOL[ii], makeChildList, -2) );
		// argText = argText.replace(/&&OL&&/, mdBlockParser(evOL[ii], mdOLParser, 0) );
	}

	// Formatting the html output.
	argText = argText.replace(/\n{2,}/g, "\n");

	for (let ii = 0; ii < (evMB||[]).length; ii++) {
		// For some reason, $ is reduced.
		argText = argText.replace("&&MB&&", "$"+evMB[ii]+"$" );
	}
	for (let ii = 0; ii < (evCB||[]).length; ii++) {
		var langText = evCB[ii].match(/(?<=\`{3}).+?(?=\n)/);
		var mainText = evCB[ii].match(/(?<=\`{3}.+?\n)[\s\S]*?(?=\n\`{3})/);
		// For some reason, $ is reduced.
		mainText[0] = mainText[0].replace(/(\$)/g, "$1$1");
		argText = argText.replace(/&&CB&&/, "<pre><code class='language-" + langText[0] + "'>" + mainText[0] + "</code></pre>" );
	}
	return argText;
}
