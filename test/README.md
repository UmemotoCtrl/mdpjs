# Issue #4 — Phase 0 reproduction harness

Source issue: https://github.com/UmemotoCtrl/mdpjs/issues/4
Fixture: `fixtures/TEST.md` — pinned copy of
https://raw.githubusercontent.com/mxstbr/markdown-test-file/master/TEST.md
(etag `8ebd851fd42c3a41fa366a8340b56bcfb201e4b4c6c68a1ffa3d100d04062b22`,
sha256 `a986b489d7024e6ee43f13127d3d914fe9665c11f8c523b6d3a0fbf52b99d2eb`).

## Layout

- `repro/*.md` — minimal failing cases cut from TEST.md, one per bug family:
  - `blockquote-paragraphs.md` (Phase 1): `> ` blank line must not split/nest
  - `blockquote-nested.md` (Phase 1): `> >` = exactly outer + one inner
  - `blockquote-with-blocks.md` (Phase 1): header / list / code inside quote
  - `loose-list.md` (Phase 2): multi-paragraph `<ol>` item
  - `indented-code.md` (Phase 3): 4-space code block
- `run.js` — renders each repro with `js/mdp.js`, checks structural
  assertions, prints PASS/FAIL per case. Exit 1 while any case is RED.
- `reference/` — `mdp-current.html` (regenerated each run),
  `TEST.markdown-it.html` (one-time reference via `markdown-it`, html:true).

## Usage

```sh
node test/run.js            # summary only, exit 1 while RED
node test/run.js --dump     # also print rendered HTML per case
```

`mdp.js` has no exports, so `run.js` evaluates it in isolation via
`new Function(src + '; return makeMDP;')` — no changes to `js/` needed.

## Status

- Phase 0 exit: 0/5 PASS (all RED, reproduced).
- Phase 3 exit: 1/5 PASS (`indented-code.md` GREEN; other 4 still RED —
  `blockquote-*` needs Phase 1 inner re-parse, `loose-list` needs Phase 2).
  Assertions in `run.js` unchanged except a regex fix in the
  `leakedAsPara` check (old pattern matched across tags).
- Phase 1 exit: 4/5 PASS (all `blockquote-*` GREEN; only `loose-list` RED).
  BQ converter now strips one `>` level incl. lazy continuations and
  re-renders inner content via recursive `render` with `matchedString`
  save/restore (`mdBlockquoteParser` left unused).
- Phase 2 exit: 5/5 PASS (ALL GREEN). `mdListParser` buffers continuation
  lines into paragraph groups when loose; tight path byte-identical.

Known Phase 3 limitations (deliberate, minimal scope):
- `    1. ...` is claimed by the list parser first (runs before `IB`);
  `#` after indent is safe (header needs `#` at column 0).
- Code blocks split by a blank line render as two `<pre>` (CommonMark
  would merge); `&` is left raw, same as the existing fenced-code
  converter (keeps `$`→`subsDollar` restore working).
