# Hermes Agent (ACP 用) のビルド依存を追加した Node.js イメージ
# base: node:24-bookworm
# - build-essential: hermes-agent の npm install (node-pty の node-gyp ビルド) に必要
# - xz-utils       : hermes 公式インストーラが Node.js (.tar.xz) を展開するのに必要
FROM node:24-bookworm

# Hermes Agent (ACP 用) のビルド依存を追加する
# - build-essential: hermes-agent の npm install (node-pty の node-gyp ビルド) に必要
# - xz-utils       : hermes 公式インストーラが Node.js (.tar.xz) を展開するのに必要
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        xz-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Marp CLI をインストールする
RUN npm install -g @marp-team/marp-cli

# Hermes Agent を node ユーザーとしてインストールする
# - ファイルに保存してから実行する (curl 失敗時もビルドを失敗させるため)
# - --skip-setup        : 対話式セットアップ (APIキー設定) をスキップ。後で `hermes setup` で実行可能
# - --non-interactive   : プロンプトをデフォルト値で自動応答 (無人インストール)
# - --skip-browser      : Playwright Chromium を導入しない。本イメージには Chromium の
#                         システムライブラリが無く起動できないため。必要な場合は後で
#                         `cd ~/.hermes/hermes-agent && npx playwright install --with-deps chromium`
# - --skip-computer-use : cua-driver (Computer Use) のダウンロードをスキップ
RUN curl -fsSL https://hermes-agent.nousresearch.com/install.sh -o /tmp/hermes-install.sh \
    && bash /tmp/hermes-install.sh --skip-setup --non-interactive --skip-browser --skip-computer-use \
    && rm -f /tmp/hermes-install.sh

# Claude Code をインストールする (公式インストーラスクリプト経由)
# RUN curl -fsSL https://claude.ai/install.sh | bash
# RUN npm install -g @agentclientprotocol/claude-agent-acp

# Codex ACP アダプタをインストールする (ACP 接続・APIキー持ち込み型)
# - @agentclientprotocol/codex-acp: zed-industries/codex-acp から移管された現行版
# - Codex CLI (@openai/codex) は依存として同梱されるが、CLI から直接呼び出す場合は別途インストールする必要がある
# - 認証はビルド時に行わず、実行時に環境変数 CODEX_API_KEY / OPENAI_API_KEY で渡す
# RUN npm install -g @openai/codex
# RUN npm install -g @agentclientprotocol/codex-acp

# Git の出力を pager で止めないようにする
RUN git config --global git.pager cat

# Claude Code 等のインストール先 (~/.local/bin) を PATH に追加
ENV PATH="/root/.local/bin:$PATH"

# hermes コマンド (~/.local/bin) を PATH に追加
# ('node' ユーザーでインストールした場合)
# ENV PATH="/home/node/.local/bin:$PATH"

