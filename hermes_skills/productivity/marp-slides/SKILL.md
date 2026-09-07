---
name: marp-slides
description: Use when creating or styling Marp presentation slides.
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [marp, markdown, presentation, slides, deck, css]
    category: productivity
    related_skills: [powerpoint]
---

# Marp Slides Skill

Author clean, modern presentation decks in Markdown using Marp. Covers two-column layouts, scoped scale adjustment for overflow handling, image positioning, and slide directives.

## When to Use

- Creating or formatting Marp presentations (`.md`).
- Implementing multi-column (2-column) slide layouts cleanly.
- Handling content overflow cleanly with CSS `transform: scale(...)` without breaking slide dimensions.
- Applying per-slide styling via `<style scoped>`.

## Core Conventions & Patterns

### 1. Minimal Deck Frontmatter & Lead Title Slide

Always start decks with a clean frontmatter and disable headers/footers/pagination on the title slide:

```markdown
---
marp: true
theme: default
paginate: true
header: "Presentation Header"
footer: "Author / Organization"
---

<!-- _class: lead -->
<!-- _header: "" -->
<!-- _footer: "" -->
<!-- _paginate: false -->

# Presentation Title
Subtitle / Author Name
```

- `_class: lead`: Centers title content vertically and horizontally.
- `_class: invert`: Inverts slide colors to dark mode (useful for conclusion or accent slides).
- `size: 4:3`: Switch aspect ratio from default 16:9 to 4:3 for legacy projectors or academic standards.
- Underscore prefix `_directive`: Applies to that specific slide only.

---

### 2. Multi-Column Layout (2-Column & 3-Column Grid)

Define reusable grid classes in the frontmatter `style` block or inside the slide's `<style scoped>`:

```markdown
---
marp: true
theme: default
paginate: true
style: |
  .columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem;
  }
  .columns-3 {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.5rem;
  }
---

## Two-Column Comparison

<div class="columns">
<div>

### Column A
- Feature or problem description
- Point 1

</div>
<div>

### Column B
- Comparison or solution
- Point 1

</div>
</div>

---

## Three-Column Flow

<div class="columns-3">
<div>

### Step 1
- Planning & Discovery

</div>
<div>

### Step 2
- Prototyping & Testing

</div>
<div>

### Step 3
- Deployment & Review

</div>
</div>
```

> **Crucial formatting note**: Always leave empty blank lines immediately after `<div>` and before `</div>` so Marp's parser parses the inner content as standard Markdown.

---

### 3. Handling Content Overflow with Scoped Scale

When a slide has too much text, tables, or lists that overflow vertically, shrink the content block using CSS `transform: scale(...)`.

**Preferred practice**: Use `<style scoped>` at the bottom of the individual slide rather than bloating the global style block.

```markdown
---

## Information-Dense Slide

<div class="fit">

### Detailed Topic
- Detailed description point 1
- Detailed description point 2
- Code block, table, or extended list items

</div>

<style scoped>
.fit {
  transform: scale(0.86);
  transform-origin: top left;
  width: calc(100% / 0.86);
}
</style>
```

#### Scale Guidelines
| Level | Scale Value | Width Setting | Use Case |
|---|---|---|---|
| Light squeeze (ちょっと詰め) | `scale(0.92)` | `width: calc(100% / 0.92)` | 1–2 lines overflowing at the bottom |
| Standard squeeze (標準詰め) | `scale(0.86)` | `width: calc(100% / 0.86)` | High-density text or medium lists |
| Heavy squeeze (しっかり詰め) | `scale(0.80)` | `width: calc(100% / 0.80)` | Long lists, code blocks, complex sections |

#### Why wrap `<div class="fit">` instead of scaling `section`?
Applying `transform: scale(...)` directly to `section` shrinks the entire 16:9 slide canvas, creating unwanted borders/letterboxing and shrinking backgrounds/headers. Wrapping the slide body content in `<div class="fit">` preserves the slide boundary while scaling only the inner content.

---

### 4. Image Positioning & Split Layouts (Marp Extensions)

Marp provides concise directives for backgrounds and side-by-side images:

```markdown
<!-- Right-side image split (40% width) -->
![bg right:40%](https://example.com/image.jpg)

<!-- Background image with opacity/blur -->
![bg brightness:0.8 blur:3px](https://example.com/bg.jpg)

<!-- Explicit width/height resize -->
![w:400 h:250](https://example.com/diagram.png)
```

---

### 5. Video Embedding & Output Formats

Embed local or remote video files using standard HTML5 `<video>` tags:

```markdown
<!-- Standard player with controls -->
<video src="movie/demo.mp4" controls width="680"></video>

<!-- Silent looping video (ideal for product/code demos during presentation) -->
<video src="movie/demo.mp4" autoplay muted loop width="680"></video>
```

> **Important on formats**: PDF export cannot play embedded `<video>` (renders blank or poster frame). For presentations with video, export to **HTML** and present in full-screen (`F` key in browser).

---

### 6. Inline Text Sizing & Styling

Markdown has no native syntax for partial text sizing; use inline HTML `<span style="...">` or `<small>`:

```markdown
- Enlarge keyword: <span style="font-size: 1.4em;">Larger text</span>
- Shrink note: <span style="font-size: 0.7em;">Smaller text</span> or <small>small tag</small>
- Color highlight: <span style="color: #e63946; font-weight: bold;">Alert</span>
```

---

### 7. Speaker Notes

Add comments starting with `<!--` at the bottom of slides to create presenter notes:

```markdown
<!-- 
Speaker Notes:
- Emphasize key takeaway from this graph.
- Pause for audience questions.
-->
```

---

### 8. CLI Commands & Export Workflow

Run Marp CLI via `marp` (or `npx @marp-team/marp-cli`):

```bash
# Export as HTML (supports video playback, transitions, fragmented lists)
marp slide.md --html

# Export as PDF (handouts / archiving)
marp slide.md --pdf

# Export as PowerPoint (Office sharing)
marp slide.md --pptx

# Live preview with auto-reload during editing
marp -w slide.md --preview
```

---

### 9. Fragmented Lists (Step-by-Step Progressive Display)

In HTML output and preview modes, you can display list items sequentially on each key press (`→`):

- **Bulleted items**: Use `*` (asterisk) instead of `-` (hyphen).
- **Numbered items**: Use `1)` (parenthesis) instead of `1.` (period).

```markdown
<!-- Items appear one by one upon each forward navigation -->
* Step 1: Displayed first
* Step 2: Appears on next click
* Step 3: Concluding point

1) Sequence 1
2) Sequence 2
```

---

### 10. Page Transitions (Slide Change Animations)

Marp supports View Transition API animations via the `transition` directive (active in HTML output on Chrome/Edge):

- Per-slide transition: `<!-- _transition: fade 0.8s -->`
- Deck-wide transition (in frontmatter): `transition: push`
- Built-in transitions include `fade` (cross-dissolve), `push` (pushes current slide out), `cover`, `uncover`, `wipe`, and `slide`.

---

### 11. HTML Presentation Features & Shortcuts

When presenting slides via the exported HTML in a browser:

- **`F` key**: Toggle fullscreen presentation mode.
- **`P` key**: Open **Presenter View** in a separate window (displays speaker notes, next-slide preview, and elapsed presentation timer).
- **`O` key**: Toggle slide overview / grid view for quick slide navigation.
- **On-Screen Controller (OSC)**: Hovering mouse over the bottom screen area displays controls for navigation, fullscreen, overview, and presenter view.
- **`Space` / `→` / `↓`**: Next slide (or next fragmented list item).
- **`Backspace` / `←` / `↑`**: Previous slide.

## Pitfalls & Best Practices

- **Blank lines in HTML**: Forgetting the blank line after `<div ...>` or before `</div>` will cause Markdown syntax (headers, bullets, tables) to render as raw plain text.
- **Always pair `transform-origin` and `width` with `scale`**:
  Without `transform-origin: top left;`, scaled content centers itself and drifts.
  Without `width: calc(100% / scale);`, the scaled container occupies less horizontal width than the slide.
- **Keep styles scoped**: Unless a custom class is universally used across the entire deck, prefer `<style scoped>` on individual slides to keep individual slide adjustments isolated and maintainable.
- **Video requires HTML**: PDF export flattens or strips `<video>` tags. Always present using HTML output for media-rich presentations.
- **Presenter notes via HTML comments**: Write presenter/speaker notes inside standard HTML comments `<!-- ... -->` at the bottom of the slide. These automatically display in presenter view (`P` key) without appearing on the slide canvas.
- **CLI setup in DevContainer**: To persist `@marp-team/marp-cli`, add `"marp-cli": "npm install -g @marp-team/marp-cli"` inside `devcontainer.json`'s object-formatted `postCreateCommand`. When typing or pasting in terminal, watch out for invisible trailing characters which cause npm `ENOENT` package lookup errors.
