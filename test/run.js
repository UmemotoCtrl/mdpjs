// Phase 0 reproduction harness for Issue #4.
// Usage: node test/run.js [--dump]
// Exit 0 = all expectations met (GREEN), exit 1 = at least one RED.
// Right now every case is expected to be RED; Phases 1-3 turn them GREEN.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MDP_SRC = path.join(ROOT, 'js', 'mdp.js');
const REPRO_DIR = path.join(__dirname, 'repro');
const FIXTURE = path.join(__dirname, 'fixtures', 'TEST.md');
const CURRENT_OUT = path.join(__dirname, 'reference', 'mdp-current.html');

function loadMDP() {
  const src = fs.readFileSync(MDP_SRC, 'utf8');
  // mdp.js defines `let makeMDP = ...` with no exports; evaluate in isolation.
  const factory = new Function(src + '\n; return makeMDP;');
  const makeMDP = factory();
  return makeMDP();
}

function count(html, tag) {
  const m = html.match(new RegExp(tag, 'g'));
  return m ? m.length : 0;
}

const CASES = [
  {
    file: 'blockquote-paragraphs.md',
    phase: 1,
    desc: 'One blockquote with two paragraphs separated by blank `>` line',
    check(html) {
      const opens = count(html, '<blockquote>');
      const closes = count(html, '</blockquote>');
      const hasBoth = html.includes('Lorem ipsum') && html.includes('Donec sit amet nisl');
      const pass = opens === 1 && closes === 1 && hasBoth;
      return { pass, detail: `blockquote open=${opens} close=${closes} hasBothParas=${hasBoth}` };
    },
  },
  {
    file: 'blockquote-nested.md',
    phase: 1,
    desc: 'Nested `> >` yields exactly outer + one inner, Back in outer',
    check(html) {
      const opens = count(html, '<blockquote>');
      const closes = count(html, '</blockquote>');
      // "Back to the first level." must be in the OUTER quote: after the
      // inner </blockquote> but before the final </blockquote>.
      const idxBack = html.indexOf('Back to the first level');
      const firstClose = html.indexOf('</blockquote>');
      const lastClose = html.lastIndexOf('</blockquote>');
      const backInOuter = idxBack !== -1 && firstClose !== -1 && idxBack > firstClose && idxBack < lastClose;
      const pass = opens === 2 && closes === 2 && backInOuter;
      return { pass, detail: `opens=${opens} closes=${closes} backInOuter=${backInOuter}` };
    },
  },
  {
    file: 'blockquote-with-blocks.md',
    phase: 1,
    desc: 'Header / list / indented code inside blockquote are parsed as blocks',
    check(html) {
      const hasH = /<h2/.test(html);
      const hasList = /<(ol|ul)>/.test(html);
      const hasCode = /<pre><code>/.test(html);
      const pass = hasH && hasList && hasCode;
      return { pass, detail: `h2=${hasH} list=${hasList} precode=${hasCode}` };
    },
  },
  {
    file: 'loose-list.md',
    phase: 2,
    desc: 'Multi-paragraph ordered item: 2 <p> in item 1, no split/empty <p>',
    check(html) {
      const hasOl = /<ol>/.test(html);
      const idxVest = html.indexOf('Vestibulum enim wisi');
      const idxCloseOl = html.indexOf('</ol>');
      const insideList = idxVest !== -1 && idxCloseOl !== -1 && idxVest < idxCloseOl;
      // Correct loose rendering: item1 = 2 paras, item2 = 1 para => 3 <p> total.
      // Current code wraps every continuation line + blank line in its own <p>.
      const pCount = count(html, '<p>');
      const hasSplitPara = /<p> {2,}sit amet/.test(html);
      const hasEmptyP = html.includes('<p></p>');
      const pass = hasOl && insideList && pCount === 3 && !hasSplitPara && !hasEmptyP;
      return { pass, detail: `ol=${hasOl} 2ndParaInsideList=${insideList} pCount=${pCount} splitPara=${hasSplitPara} emptyP=${hasEmptyP}` };
    },
  },
  {
    file: 'indented-code.md',
    phase: 3,
    desc: '4-space indented block becomes <pre><code>',
    check(html) {
      const hasPre = /<pre><code>/.test(html);
      const hasText = html.includes('This is a code block.');
      const leakedAsPara = /<p>[^<]*This is a code block/.test(html);
      const pass = hasPre && hasText && !leakedAsPara;
      return { pass, detail: `precode=${hasPre} hasText=${hasText} leakedAsPara=${leakedAsPara}` };
    },
  },
  {
    file: 'emphasis-underscore.md',
    phase: 4,
    desc: '_em_ and __strong__ render like *em* and **strong**',
    check(html) {
      const hasEmStar = html.includes('<em>single asterisks</em>');
      const hasEmUnder = html.includes('<em>single underscores</em>');
      const hasStrongStar = html.includes('<strong>double asterisks</strong>');
      const hasStrongUnder = html.includes('<strong>double underscores</strong>');
      const pass = hasEmStar && hasEmUnder && hasStrongStar && hasStrongUnder;
      return { pass, detail: `em*=${hasEmStar} em_=${hasEmUnder} strong*=${hasStrongStar} strong__=${hasStrongUnder}` };
    },
  },
];

function main() {
  const mdp = loadMDP();
  let red = 0;
  console.log('Issue #4 Phase 0 repro — expecting RED on all cases before fix\n');
  for (const c of CASES) {
    const md = fs.readFileSync(path.join(REPRO_DIR, c.file), 'utf8');
    const html = mdp.render(md);
    const r = c.check(html);
    if (!r.pass) red++;
    console.log(`[${r.pass ? 'PASS' : 'FAIL'}] (Phase ${c.phase}) ${c.file} — ${c.desc}`);
    console.log(`       ${r.detail}`);
    if (process.argv.includes('--dump')) {
      console.log('       --- html ---');
      console.log(html.split('\n').map((l) => '       ' + l).join('\n').slice(0, 2000));
    }
  }
  // Full fixture smoke: harness must render TEST.md end-to-end.
  const full = fs.readFileSync(FIXTURE, 'utf8');
  const fullHtml = mdp.render(full);
  fs.writeFileSync(CURRENT_OUT, fullHtml);
  console.log(`\nFixture: test/fixtures/TEST.md (${full.split('\n').length} lines) -> ${fullHtml.length} chars HTML`);
  console.log(`Saved current output: test/reference/mdp-current.html`);
  console.log(`\nResult: ${CASES.length - red}/${CASES.length} PASS${red ? ` — ${red} RED (reproduced)` : ' — ALL GREEN'}`);
  process.exit(red ? 1 : 0);
}

main();
