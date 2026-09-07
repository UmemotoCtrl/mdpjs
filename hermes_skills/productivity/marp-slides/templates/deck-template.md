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

---

## Standard Content Slide

- Point 1: Key explanation or context
- Point 2: Supporting arguments or data
- Point 3: Actionable next step

---

## Two-Column Comparison

<div class="columns">
<div>

### Column A
- Left side overview
- Point 1
- Point 2

</div>
<div>

### Column B
- Right side comparison
- Point 1
- Point 2

</div>
</div>

<style scoped>
.columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem;
}
</style>

---

## Three-Column Layout

<div class="columns-3">
<div>

### Step 1
- Initial planning
- Scope definition

</div>
<div>

### Step 2
- Prototyping
- User validation

</div>
<div>

### Step 3
- Production release
- Continuous monitor

</div>
</div>

<style scoped>
.columns-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
}
</style>

---

## Information-Dense Slide (Fit Scale)

<div class="fit">

### Section 1
- Detailed item 1 with <span style="font-size: 1.25em;">highlighted text</span>
- Detailed item 2 with <small>secondary footnote</small>

### Section 2
- Detailed item 3
- Detailed item 4

</div>

<style scoped>
.fit {
  transform: scale(0.86);
  transform-origin: top left;
  width: calc(100% / 0.86);
}
</style>

---

## Media Slide (Video & Image)

<video src="movie/demo.mp4" controls width="680"></video>

- HTML5 `<video>` tag supports `controls`, `autoplay`, `muted`, and `loop`.

