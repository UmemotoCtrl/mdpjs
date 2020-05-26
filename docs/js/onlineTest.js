// for MathJax
window.MathJax = {
	tex: {
		inlineMath: [['$', '$'], ['\\(', '\\)']]
	}
};

$(function() {
	if (location.search=="") {
		$data = "# MarkdownParser\n\n## Markdown Notation\n\n### Subsection\n\n### List\n\nComment\n```markdown\n* 1st\n  - Item 1-1\n  - Item 1-2\n    1. a\n    2. b\n    3. c\n* 2nd\n\n1. 1st\nSentence w/o inserted blank line.\n  1. 1-1\n  1. 1-2\n  1. 1-3\n1. 2nd\nSentence w/o inserted blank line.\n  - Item 1-1\n  - Item 1-1\n  - Item 1-2\n1. 3rd\nSentence w/o inserted blank line.\n```\n\nis displayed as\n\n* 1st\n  - Item 1-1\n  - Item 1-2\n    1. a\n    2. b\n    3. c\n* 2nd\n\n1. 1st\nSentence w/o inserted blank line.\n  1. 1-1\n  1. 1-2\n  1. 1-3\n1. 2nd\nSentence w/o inserted blank line.\n  - Item 1-1\n  - Item 1-1\n  - Item 1-2\n1. 3rd\nSentence w/o inserted blank line.\n\n### EM: `*`, Strong: `**`, and Strike: `~~`\n\n*abc*, **xyz**, ~~strike~~.\n\n### Codes\n\nInline code is `code`.\n\n```markdown\n ```Python\nprint('hoge')\nprint('hoge')\nprint('hoge')\nprint('hoge')\n ```\n```\n\nis displayed as follows:\n\n```Python\nprint('hoge')\nprint('hoge')\nprint('hoge')\nprint('hoge')\n```\n\n### Anchor and Image\n\n[GitHub](https://github.com/UmemotoCtrl/MarkdownParser)\n`![alternative word](url)`\n\n### Table\n\n```markdown\n| A | B |\n| ---  | ---  |\n| $\\alpha$ | $\\beta$ |\n| a | b |\n```\n\n| A | B |\n| ---  | ---  |\n| $\\alpha$ | $\\beta$ |\n| a | b |\n\n### Horizontal Line\n\n`---`\n\n---\n\n### Math Formula\n\nInline math $x \\in X$.\n\n$$\n\\tag{1} y = f_1(x) = \\dfrac{\\partial y}{\\partial x}\n$$\n\n$$\n\\tag{*} f(x) :=\\begin{cases}1,\\quad &\\mbox{if}~ x\\neq 0 \\\\ 0,\\quad &\\mbox{if}~ x = 0\\end{cases}\n$$\n\n";
		$("textarea#mdinput").val( $data );
		// $("#article").html( $data );
		$("#article").html( mdp($data) );
		$("#raw").html( mdp($data).replace(/</g,'&lt;').replace(/>/g,'&gt;') );
		try {
			MathJax.typeset();
		} catch (e) {
		}
	} else {
		$strs = location.search.split("?id=")[1].split(":");
		$file = "./md";
		for (let i = 0; i < $strs.length; i++) {
			$file = $file + "/" + $strs[i];
		}
		$file = $file + ".md";
		$.ajax({
			url: $file,
			success: function($data) {
				$("textarea#mdinput").val( $data );
				$("#article").html( mdp($data) );
				$("#raw").html( mdp($data).replace(/</g,'&lt;').replace(/>/g,'&gt;') );
				try {
					MathJax.typeset();
				} catch (e) {
				}
			}
		});
	}
	
	$("textarea#mdinput").on('input', function() {
		// console.log("input event");
		$("#article").html( mdp($("textarea#mdinput").val()) );
		$("#raw").html( mdp($data).replace(/</g,'&lt;').replace(/>/g,'&gt;') );
		// for MathJax
		try {
			MathJax.typeset();
		} catch (e) {
		}
	});
});
