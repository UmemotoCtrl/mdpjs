# Detailed Inspection and Remediation Recipes for Public Repositories

This reference provides concrete one-liners and scripts for repository sanitization.

## 1. Quick Author / Committer Audit
Inspect all distinct author names and emails ever recorded in the commit history:
```bash
git log --all --format='%h | %an | %ae' | sort -t'|' -k3 -u
```
Check if any commits used a personal Gmail, Yahoo, iCloud, or university email rather than a noreply address.

## 2. Scan Deleted Files in Past Commits
List every file that was ever deleted in Git history:
```bash
git log --diff-filter=D --summary | grep delete
```
To view the full diff where a deleted file was introduced or removed:
```bash
git log -p --full-history -- <path/to/file>
```

## 3. High-Signal Grep Patterns Across Entire Git History
```bash
# High-entropy / Token strings
git log -p | grep -E -n "(AKIA[0-9A-Z]{16}|ghp_[0-9a-zA-Z]{36}|sk-[a-zA-Z0-9]{20,}|Bearer [a-zA-Z0-9_\-\.]{20,})"

# Private URLs and team resources
git log -p | grep -E -i "(drive\.google\.com|docs\.google\.com|notion\.so|teams\.microsoft\.com|zoom\.us|slack\.com)"

# PII keywords (Japanese / English)
git log -p | grep -E -i "(password|passwd|secret|api_key|token|認証|パスワード|秘密鍵)"
```

## 4. Inspect Tracked Binary and Media Assets
Identify tracked media files by size:
```bash
git ls-files -z | xargs -0 -I{} du -h "{}" 2>/dev/null | sort -h -r | head -n 30
```
For images and videos:
- Verify that experimental videos do not capture identifiable student/employee faces without explicit consent.
- Verify diagrams and figures do not disclose unpublished patent claims or confidential lab schematics.

## 5. Advanced Sanitization with `git-filter-repo`

### Install
```bash
python3 -m pip install git-filter-repo
# or
pipx install git-filter-repo
```

### Delete a file completely from all commits
```bash
git filter-repo --invert-paths --path "marp/lab_orien.md" --path "marp/lab_orien.html"
```

### Replace sensitive strings (e.g. real names or passwords) across all files and commit messages
Create `replace-expressions.txt`:
```
regex:John Doe==>Anonymous Contributor
regex:john\.doe@example\.com==>user@users.noreply.github.com
regex:MySecretPassword123==>REDACTED
```
Run:
```bash
git filter-repo --replace-text replace-expressions.txt
```

### Overwrite commit author / email
Create a Python callback file or inline expression:
```bash
git filter-repo --email-callback '
if b"personal@gmail.com" in email:
    return b"username@users.noreply.github.com"
return email
'
```
