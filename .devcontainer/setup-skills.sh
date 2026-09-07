#!/usr/bin/env bash
# Hermes Agent のスキルディレクトリおよび SOUL.md をワークスペース (git管理) に移行する
#
# 背景: Hermes のスキルや SOUL.md は ~/.hermes に固定保存される。
#       ~/.hermes はコンテナ再構築で消えるため、git 管理するには
#       リポジトリ側のファイル/ディレクトリへ symlink する。
#
# 使い方:
#   setup-skills.sh <target_dir>
#   例: setup-skills.sh /workspaces/PlaneTextPresen
#
# 動作 (冪等):
#   1. ~/.hermes/skills  -> <target_dir>/hermes_skills
#   2. ~/.hermes/SOUL.md -> <target_dir>/SOUL.md
set -eu

TARGET_DIR="${1:-${TARGET_DIR:-}}"

if [ -z "$TARGET_DIR" ]; then
    echo "Usage: $0 <target_dir>" >&2
    exit 1
fi

TARGET_DIR="$(realpath -m "$TARGET_DIR")"
SKILLS_GIT="$TARGET_DIR/hermes_skills"
SOUL_GIT="$TARGET_DIR/SOUL.md"

SKILLS_SRC="$HOME/.hermes/skills"
SOUL_SRC="$HOME/.hermes/SOUL.md"

# 1. Skills の移行とシンボリックリンク
if [ -L "$SKILLS_SRC" ] && [ "$(readlink -f "$SKILLS_SRC")" = "$(readlink -f "$SKILLS_GIT")" ]; then
    echo "OK: $SKILLS_SRC is already a symlink to $SKILLS_GIT"
else
    mkdir -p "$SKILLS_GIT"
    mkdir -p "$(dirname "$SKILLS_SRC")"

    if [ -d "$SKILLS_SRC" ] && [ ! -L "$SKILLS_SRC" ]; then
        if cp --update=none --help >/dev/null 2>&1; then
            cp -a --update=none "$SKILLS_SRC"/. "$SKILLS_GIT"/
        else
            cp -a -n "$SKILLS_SRC"/. "$SKILLS_GIT"/
        fi
        rm -rf "$SKILLS_SRC"
    fi

    ln -sfn "$SKILLS_GIT" "$SKILLS_SRC"
    echo "Migrated: $SKILLS_SRC -> $SKILLS_GIT (git managed)"
fi

# 2. SOUL.md の移行とシンボリックリンク
if [ -L "$SOUL_SRC" ] && [ "$(readlink -f "$SOUL_SRC")" = "$(readlink -f "$SOUL_GIT")" ]; then
    echo "OK: $SOUL_SRC is already a symlink to $SOUL_GIT"
else
    mkdir -p "$(dirname "$SOUL_SRC")"
    if [ ! -f "$SOUL_GIT" ] && [ -f "$SOUL_SRC" ]; then
        cp "$SOUL_SRC" "$SOUL_GIT"
    fi
    if [ -f "$SOUL_GIT" ]; then
        rm -f "$SOUL_SRC"
        ln -sfn "$SOUL_GIT" "$SOUL_SRC"
        echo "Migrated: $SOUL_SRC -> $SOUL_GIT (git managed)"
    fi
fi
