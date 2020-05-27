var delim = "&&";

function mdLineParser( argText, func, listType ) {
	// Evacuating comments and formulas --
	var evacuatedText;
	evacuatedText = argText.match(  /`(.+?)`/g );
	argText       = argText.replace(/`(.+?)`/g, delim+delim+"IC"+delim+delim);
	var evacuatedMath;
	evacuatedMath = argText.match(  /\$(.+?)\$/g );
	argText       = argText.replace(/\$(.+?)\$/g, delim+delim+"IM"+delim+delim);
	// -- Evacuating comments and formulas
	argText = argText.replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2'>$1</a>");	// Anchor Link
	argText = argText.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");	// Strong
	argText = argText.replace(/~~(.+?)~~/g, "<strike>$1</strike>");	// Strike
	argText = argText.replace(/\*(.+?)\*/g, "<em>$1</em>");	// Emphasize

	if (func != null && listType != null)
		argText = func(argText, listType);
	else if (func != null && listType == null)
		argText = func(argText);
	
	// Restoring comments and formulas --
	if (evacuatedMath != null)
		for (let ii = 0; ii < evacuatedMath.length; ii++)
			argText = argText.replace(delim+delim+"IM"+delim+delim, evacuatedMath[ii]);
	if (evacuatedText != null)
		for (let ii = 0; ii < evacuatedText.length; ii++)
			argText = argText.replace(delim+delim+"IC"+delim+delim,
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
function checkListDepth ( argLine ) {
	var listType = checkListType ( argLine );
	var spaceRegex;
	if (listType == "OL") {
		spaceRegex = new RegExp("^\\s*?(?=\\d+\\.\\s+.*?$)");
	} else {
		spaceRegex = new RegExp("^\\s*?(?=[-+*]\\s+.*?$)");
	}
	var depth;
	var spaceText = argLine.match(spaceRegex);
	if (spaceText == null)
		depth = 0;
	else {
		depth = spaceText[0].length;
	}
	return depth;
}
function checkListType ( argLine ) {
	argLine = argLine.replace(/\n/g, "");
	olRegex = new RegExp("^\\s*?\\d+\\.\\s+.*?$");
	ulRegex = new RegExp("^\\s*?[-+*]\\s+.*?$");
	if ( olRegex.test(argLine) )
		return "OL";
	else if ( ulRegex.test(argLine) )
		return "UL";
	else {
		return "RW";
	}
}
function mdListParser ( argText, listType ) {
	var lines = argText.split(/\n/g);
	var depth = checkListDepth(lines[0]);
	var retText = "";
	var listRegex;
	if (listType == "OL")
		listRegex = new RegExp("^\\s*?\\d+\\.\\s+(.*?)$");
	else
		listRegex = new RegExp("^\\s*?[-+*]\\s+(.*?)$");
	retText += "<"+listType.toLowerCase()+"><li>";
	var lineDepth, lineType;
	for (let jj = 0; jj < (lines||[]).length; jj++) {
		lineDepth = checkListDepth(lines[jj]);
		lineType = checkListType(lines[jj]);
		if ( lineDepth == depth && lineType == listType) {	// add new item
			retText += "</li>\n<li>"+lines[jj].replace(listRegex, "$1");
			for (let kk = jj+1; kk < (lines||[]).length; kk++) {
				if ( checkListType(lines[kk]) == "RW" ) {
					retText += lines[kk]+"\n";
				} else {
					jj = kk-1;
					break;
				}
			}
		} else if ( lineDepth >= depth+2 ) {	// create nested list
			var tempText = "";
			for (let kk = jj; kk < (lines||[]).length; kk++) {
				if ( checkListType(lines[kk]) == "RW" ){
					tempText += lines[kk]+"\n";
					if ( kk+1==(lines||[]).length ) {
						retText += mdListParser ( tempText, lineType ).replace(/\n$/, "");
						jj = kk;
						break; 
					}
				} else if ( lineDepth>checkListDepth(lines[kk]) ) {
					retText += mdListParser ( tempText, lineType ).replace(/\n$/, "");
					jj = kk-1;
					break;
				} else {
					tempText += lines[kk]+"\n";
					if ( kk+1==(lines||[]).length ) {
						retText += mdListParser ( tempText, lineType ).replace(/\n$/, "");
						jj = kk;
						break; 
					}
				}
			}
		}
	}

	retText += "</li></"+listType.toLowerCase()+">\n";
	return retText.replace(/<li>\n*<\/li>/g, "");
}

function restore( argText, tag, aftText, regex, restore) {
	for (let jj = 0; jj < (aftText||[]).length; jj++) {
		switch (tag){
			case "MB":case "CB":case "CM":	// $ is reduced in replace method
				var temp = aftText[jj].replace( /\$/g, "$$$$").replace( regex, restore );
				argText = argText.replace( delim+tag+delim, temp );
				break;
			case "TB":
				var temp = aftText[jj].replace( regex, restore );
				argText = argText.replace( delim+tag+delim, mdLineParser( temp, mdTBParser, null ) );
				// argText = argText.replace( delim+tag+delim, mdTBParser(temp) );	// without md parse in table
				break;
			case "UL":case "OL":
				var temp = aftText[jj].replace( regex, restore );
				argText = argText.replace( delim+tag+delim, mdLineParser( temp, mdListParser, tag ) );
				// argText = argText.replace( delim+tag+delim, mdListParser(temp, tag) );	// without md parse in list
				break;
			default:
				if (/H\d/.test(tag)) {
					var temp = aftText[jj].replace(/'/g, "").replace( regex, restore );
					temp = mdLineParser(temp, null, null);
					argText = argText.replace( delim+tag+delim, temp );
				} else {
					var temp = aftText[jj].replace( regex, restore );
					temp = mdLineParser(temp, null, null);
					argText = argText.replace( delim+tag+delim, temp );
				}
				break;
		}
	}
	return argText;
}

function mdp( argText ) {
	// settings
	argText = argText.replace(/\r\n?/g, "\n");	// Commonize line break codes between Win and mac.
	argText = "\n"+ argText + "\n\n";

	var regexArray = new Array();
	var tagArray = new Array();
	var stringArray = new Array();
	var restoreArray = new Array();
	var resRegexArray = new Array();
	tagArray.push("CB");
	regexArray.push( new RegExp("\\n\\`\\`\\`.+?\\n[\\s\\S]*?\\n\\`\\`\\`(?=\\n)", 'g') );
	restoreArray.push( "<pre><code class='language-$1'>$2</code></pre>" );
	resRegexArray.push( new RegExp("^\\n*\\`\\`\\`(.+?)\\n([\\s\\S]*)\\n\\`\\`\\`\\n*$") );
	tagArray.push("CM");
	regexArray.push( new RegExp("\\n<!--[\\s\\S]*?-->(?=\\n)", 'g') );
	restoreArray.push( "$1" );
	resRegexArray.push( new RegExp("^\\n*(<!--[\\s\\S]*?-->)\\n*$") );
	tagArray.push("MB");
	regexArray.push( new RegExp("\\n\\${2}\\n[\\s\\S]+?\\n\\${2}(?=\\n)", 'g') );
	restoreArray.push( "$1" );
	resRegexArray.push( new RegExp("^\\n*([\\s\\S]*)\\n*$") );

	for (let jj = 1; jj < 5; jj++) {
		tagArray.push("H"+jj);
		regexArray.push( new RegExp("\\n#{"+jj+"}\\s+.*?(?=\\n)", 'g') );
		restoreArray.push( "<h"+jj+" class='$1'>$1</h"+jj+">" );
		resRegexArray.push( new RegExp("^\\n*#{"+jj+"}\\s+(.*?)\\n*$") );
	}

	tagArray.push("TB");
	regexArray.push( new RegExp("\\n\\n\\|.+?\\|\\s*?\\n\\|[-|\\s]*?\\|\\s*?\\n\\|.+?\\|[\\s\\S]*?(?=\\n\\n)", 'g') );
	restoreArray.push( "$1" );
	resRegexArray.push( new RegExp("^\\n*([\\s\\S]*)\\n*$") );
	tagArray.push("UL");
	regexArray.push( new RegExp("\\n\\s*[-+*]\\s[\\s\\S]*?(?=\\n\\n)", 'g') );
	restoreArray.push( "$1" );
	resRegexArray.push( new RegExp("^\\n*([\\s\\S]*)\\n*$") );
	tagArray.push("OL");
	regexArray.push( new RegExp("\\n\\s*\\d+?\\.\\s[\\s\\S]*?(?=\\n\\n)", 'g') );
	restoreArray.push( "$1" );
	resRegexArray.push( new RegExp("^\\n*([\\s\\S]*)\\n*$") );
	tagArray.push("HR");
	regexArray.push( new RegExp("\\n\\s*?-{3,}\\s*(?=\\n)", 'g') );
	restoreArray.push( "<hr>" );
	resRegexArray.push( new RegExp("^\\n*[\\s\\S]*\\n*$") );
	tagArray.push("PP");
	regexArray.push( new RegExp("\\n[^&\\n][\\s\\S]*?(?=\\n\\n)", 'g') );
	restoreArray.push( "<p>$1</p>" );
	resRegexArray.push( new RegExp("^\\n*([\\s\\S]*)\\n*$") );

	// Convert Structure Notation
	for (let ii = 0; ii < tagArray.length; ii++) {
		stringArray.push( argText.match(regexArray[ii]) );
		argText = argText.replace( regexArray[ii], "\n\n"+delim+tagArray[ii]+delim+"\n\n" );
	}
	argText = argText.replace(/\n{2,}/g, "\n");

	// Restore to html
	for (let ii = 0; ii < tagArray.length; ii++) {
		argText = restore( argText, tagArray[ii], stringArray[ii], resRegexArray[ii], restoreArray[ii]);
	}
	// argText = argText.replace(/\n{2,}/g, "\n");
	return argText;
}
