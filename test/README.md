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

Phase 0 exit: 0/5 PASS (all RED, reproduced). Phases 1–3 turn them GREEN
without changing the assertions in `run.js`.
