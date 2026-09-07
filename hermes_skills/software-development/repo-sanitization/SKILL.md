---
name: repo-sanitization
description: "Use when auditing a repo before making it public."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [git, github, security, privacy, pii, audit, sanitization]
    category: software-development
    related_skills: [github, requesting-code-review]
---

# Repository Sanitization & Public Release Audit

A systematic workflow to inspect, audit, and sanitize a Git repository before converting it from private to public, transferring ownership, or distributing code outside an organization.

Git retains full history: deleting a file or editing out a secret in a later commit **does not protect it**. Anyone cloning a public repository can inspect past commit patches, commit metadata, and deleted blobs.

## 5-Point Pre-Public Audit Checklist

Run through these 5 checks before making any private repository public:

| # | Check Area | What to Look For | Primary Inspection Command |
|---|---|---|---|
| 1 | **Commit Authors** | Real names, personal/work email addresses | `git log --pretty=format:"%h %an <%ae>"` |
| 2 | **Deleted Files & Patches** | Internal docs, orientation slides, deleted `.env` | `git log --diff-filter=D --summary` / `git log -p` |
| 3 | **Secrets & Tokens** | API keys, SSH keys, bearer tokens, passwords | `git log -S "API_KEY" -p` / grep pattern search |
| 4 | **PII & Internal Ops** | Names of colleagues/students, internal URLs/wikis | Grep across current tree + commit diffs |
| 5 | **Binary & Media Assets** | Large videos, proprietary figures/CAD, faces | Check `git ls-files` for `.mp4`, `.png`, etc. |

---

## Step-by-Step Audit Procedure

### 1. Author & Committer Metadata
Inspect all unique authors and committers in the repo history:
```bash
git log --format='%an <%ae>' | sort -u
```
- **Risk:** Personal email addresses (e.g. personal Gmail) or real names of contributors who expect anonymity.
- **Remediation:** If private emails must be masked, rewrite history with `git-filter-repo` (see below) or squashed fresh commit.

### 2. Search Deleted Files
Find files that existed in past commits but were later deleted:
```bash
git log --diff-filter=D --summary
```
Inspect their full content at deletion time:
```bash
git show <commit_hash>^:<path/to/deleted_file>
```

### 3. Deep Scan for Secrets & Credentials
Search the entire Git history (all branches, tags, and commits) for sensitive keywords:
```bash
git log -p | grep -E -i "(api[_-]?key|secret|token|password|passwd|bearer|private[_-]?key)"
```
Check for tracked environment files in history:
```bash
git log --all --full-history -- "**/.*env*" "**/*credential*" "**/*.pem" "**/*.key"
```

### 4. PII & Organizational Knowledge Scan
Search for full names, internal hostnames, and restricted services:
```bash
# Search current workspace
grep -rn -E "(slack\.com/archives|teams\.microsoft\.com|drive\.google\.com|internal\.)" . --exclude-dir=.git

# Search full git history
git log -S "internal." -p
```
Check for references to internal private repositories in README or documentation (e.g. broken links to private org repos).

### 5. Review Binary Files & Media
List all tracked non-text assets:
```bash
git ls-files | grep -E '\.(mp4|mov|avi|png|jpg|jpeg|pdf|zip|tar\.gz|onnx|pt|bin)$'
```
- Verify images/videos do not expose research lab whiteboards, passwords on sticky notes, faces without consent, or unreleased research/patent drawings.
- Check file sizes (`du -sh <file>`) to avoid pushing unnecessary multi-megabyte binaries to GitHub.

---

## Remediation Recipes

### Option A: Fresh Start / Single Commit (Cleanest for Templates)
If the repository is a template, framework, or presentation tool and past commit history has no standalone value:
```bash
# Create an orphan branch with current tree
git checkout --orphan temp-clean
git add -A
git commit -m "Initial commit"
# Replace main branch
git branch -D main
git branch -m main
git push -f origin main
```

### Option B: Purge Specific Files Completely (`git-filter-repo`)
To keep commit history but permanently erase a sensitive file across all revisions:
```bash
# Requires git-filter-repo (install via pip or package manager)
git filter-repo --invert-paths --path "path/to/sensitive-file.md"
```

### Option C: Rewrite Author Email Across All Commits
```bash
git filter-repo --email-callback '
return email.replace(b"old-personal@gmail.com", b"64949252+username@users.noreply.github.com")
'
```

### Verification Before Pushing Public
Always clone to a clean temporary directory and inspect:
```bash
git clone /path/to/repo /tmp/test-check
cd /tmp/test-check
git log --format='%an <%ae>' | sort -u
git log -p | grep -i "sensitive_string"
```

## Reference Documentation
- Detailed inspection one-liners, pattern greps, and `git-filter-repo` recipes: see `references/audit-recipes.md`.

