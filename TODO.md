# TODO

## footnotes対応

### 仕様（PHP Markdown Extra互換のサブセット）
- 定義: `[^label]: text`（v1は単一行のみ、複数行・段落は対象外）
- 参照: `[^label]` → `<sup id="fnref:label"><a href="#fn:label">N</a></sup>`（Nは参照出現順）
- 文末に脚注sectionを付加:
  `<section class="footnotes"><ol><li id="fn:label">... <a href="#fnref:label">↩</a></li></ol></section>`
- 未定義の参照は原文ママ残す

### 実装（`js/mdp.js` のみ）
1. Block構文 `FN` を priority 65（CM70とHD60の間）で追加
   - 定義行を先に抜き取り、placeholderは空に消す
   - converterで `Obj.footnotes[label]` に原文を保存
2. Inline構文 `FNREF` を priority 55（IG60の下、AC50の上）で追加
   - `[^label]` をsupリンクに変換、初出順に番号割り当て
   - IC/IMより後なのでコード・数式内は保護される
3. `render()` 先頭で footnotes state初期化、末尾で脚注sectionをappend
   - BQ再帰の save/restore で消されないよう stateは対象外にする

### テスト
- `test/repro/footnotes-*.md` 追加（基本系 / 未定義 / list・blockquote内参照）
- `test/run.js` にCASE追加
- 既存7件GREEN維持を確認
