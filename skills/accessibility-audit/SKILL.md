---
slug: accessibility-audit
name: Accessibility Audit
version: 0.2.0
description: Audit a UI or component for accessibility issues and fixes.
category: dev-tools
tags: ['a11y', 'accessibility', 'wcag', 'frontend']
inputs:
  - name: ui_description
    type: string
    required: true
    description: Description or markup of the UI
  - name: wcag_level
    type: enum
    required: false
    description: Target WCAG conformance level
    values: ["A", "AA", "AAA"]
    default: AA
output:
  format: markdown
  description: Accessibility findings mapped to WCAG criteria with fix examples.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-22
---

# When to use

Before shipping a new UI, reviewing a component library, or responding to an a11y bug.

# Inputs

Describe the UI and target WCAG level. Prefer providing actual HTML/JSX markup when possible—text descriptions miss subtle issues like missing labels or incorrect ARIA.

# Output

Findings mapped to WCAG criteria with severity and example fixes.

# Prompt

```prompt
Audit the described UI for accessibility against the target WCAG level.

Check:
1. Keyboard navigation: tab order, focus indicators, trap avoidance
2. Screen readers: labels, headings, landmarks, live regions
3. Color: contrast ratios, not color-only information
4. Motion: reduced-motion support, no auto-playing content
5. Forms: labels, error association, required field indication
6. Touch/target sizes for mobile

Output:

## Findings
- **[Severity] WCAG X.X.X**: issue + fix example

## Manual Tests
List 3-5 manual checks a human should perform.

## Tools
Suggest automated tools appropriate for the UI stack.

```

# When NOT to use

- Backend-only services with no user interface
- Internal admin tools with a known narrow user base and separate audit process
- PDFs or documents where the audit scope is document remediation, not UI

---

# axe-core Rule Reference (WCAG AA / axe 4.x)

Use this rule catalog to map findings to specific rules when auditing with axe-core.

## Critical Rules (Always Fail)

| Rule ID | WCAG | Description |
|---------|------|-------------|
| `area-alt` | 1.1.1 | `<area>` elements must have alt text |
| `aria-duplicate-id` | 4.1.1 | ARIA IDs must be unique |
| `aria-hidden-body` | 4.1.2 | `aria-hidden="true"` must not be on `<body>` |
| `aria-required-attr` | 4.1.2 | Required ARIA attributes must be present |
| `button-name` | 4.1.2 | Buttons must have accessible names |
| `color-contrast` | 1.4.3 | Elements must have sufficient color contrast |
| `form-field-multiple-labels` | 1.3.1 | No more than one `<label>` per field |
| `image-alt` | 1.1.1 | Images must have alt text |
| `input-button-name` | 4.1.2 | Input buttons must have accessible names |
| `label` | 1.3.1 | Form elements must have labels |
| `link-name` | 4.1.2 | Links must have discernible text |
| `list` | 1.3.1 | Lists must be properly structured (`<ul>`, `<ol>`, `<li>`) |
| `meta-viewport` | 1.3.1 | Zooming must not be disabled |
| `object-alt` | 1.1.1 | Object elements must have alt text |
| `td-has-data-cells` | 1.3.1 | Data table cells must have headers |
| `th-has-data-cells` | 1.3.1 | Table headers must be present |

## Common Violations (Often Fail)

| Rule ID | WCAG | Description |
|---------|------|-------------|
| `aria-allowed-attr` | 4.1.2 | ARIA attributes used incorrectly |
| `aria-hidden-focus` | 2.1.2 | Focusable elements must not be `aria-hidden` |
| `aria-required-children` | 1.3.1 | Required ARIA children missing |
| `aria-valid-attr-value` | 4.1.2 | ARIA attributes must have valid values |
| `blink` | 2.2.2 | `<blink>` elements are deprecated |
| `definition-list` | 1.3.1 | Definition lists must use proper structure |
| `dlitem` | 1.3.1 | Definition list items must have parent `<dl>` |
| `fieldset` | 1.3.1 | Fieldset must contain legend |
| `flash` | 2.2.2 | Flashing content must not exceed 3/sec |
| `frame-focusable-content` | 2.1.1 | Frames must not be focusable |
| `html-has-lang` | 3.1.1 | `<html>` must have `lang` attribute |
| `html-lang-valid` | 3.1.1 | `lang` attribute must be valid IANA code |
| `identical-links-same-prompt` | 2.4.4 | Links with same text must have same destination |
| `image-alt` | 1.1.1 | Decorative images should have `alt=""` |
| `input-image-alt` | 1.1.1 | Image inputs must have alt text |
| `marquee` | 2.2.2 | `<marquee>` is deprecated and fails |
| `meta-refresh` | 2.2.2 | Page must not auto-refresh |
| `nested-interactive` | 2.1.1 | Interactive elements cannot nest |
| `no-autoplay-audio` | 1.4.2 | Audio must not auto-play |
| `p-as-heading` | 1.3.1 | Don't use `<p>` as headings |
| `scrollable-region-focusable` | 2.1.2 | Scrollable regions must be keyboard accessible |
| `select-name` | 4.1.2 | Select elements must have accessible names |
| `server-side-image-map` | 1.1.1 | Server-side image maps not accessible |
| `svg-alt` | 1.1.1 | SVG elements must have accessible names |
| `table-fake-caption` | 1.3.1 | Tables with captions should use `<caption>` |
| `td-headers-attr` | 1.3.1 | Header cells must use `headers` correctly |
| `valid-lang` | 3.1.2 | Language attributes must be valid |
| `video-alt` | 1.1.1 | Video elements must have captions |

---

# Real-World Anti-Patterns with Fixes

## 1. Missing or Duplicate Labels

**Bad (React/JSX):**
```jsx
<input type="email" placeholder="Email address" />
<button onClick={toggle}>▼</button>
```

**Issues:**
- Placeholder is not a label—screen readers announce "Edit text, Email address" but it's not programmatically associated
- Icon-only button has no accessible name

**Good:**
```jsx
<label htmlFor="email">Email address</label>
<input id="email" type="email" placeholder="user@example.com" aria-describedby="email-hint" />
<span id="email-hint">We'll send a confirmation link</span>

<button onClick={toggle} aria-label="Toggle menu expanded" aria-expanded={isOpen}>
  <ChevronIcon />
</button>
```

## 2. Wrong ARIA Role on Interactive Elements

**Bad:**
```jsx
<div className="tabs">
  <div className="tab" onClick={() => setActive(0)}>Tab 1</div>
  <div className="tab" onClick={() => setActive(1)}>Tab 2</div>
</div>
```

**Issues:**
- Not keyboard focusable (no `tabindex`)
- No `role="tablist"`, `role="tab"`, `role="tabpanel"`
- No `aria-selected` or `aria-controls`

**Good:**
```jsx
<div role="tablist" aria-label="Settings sections">
  <button role="tab" aria-selected={activeTab === 0} aria-controls="panel-0"
          onClick={() => setActive(0)} tabIndex={activeTab === 0 ? 0 : -1}>
    Tab 1
  </button>
  <button role="tab" aria-selected={activeTab === 1} aria-controls="panel-1"
          onClick={() => setActive(1)} tabIndex={activeTab === 1 ? 0 : -1}>
    Tab 2
  </button>
</div>
<div role="tabpanel" id="panel-0" aria-labelledby="tab-0">Content</div>
```

## 3. Focus Trapping (Modal/Dialog Failures)

**Bad:**
```jsx
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal">{children}</div>
    </div>
  );
}
```

**Issues:**
- No focus trap—when Tab cycles through modal, focus leaves to background
- Clicking overlay closes modal but doesn't return focus to trigger
- Escape key not handled

**Good:**
```jsx
import { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  const triggerRef = useRef(null); // Pass in from parent

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;

      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Move focus into modal
    modalRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" ref={modalRef} role="dialog" aria-modal="true" tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}
```

## 4. Color Contrast Failures (Common "Footgun")

**Bad:**
```css
/* Gray text on white - contrast ratio ~2.5:1, fails AA */
.text-muted { color: #999; background: #fff; }

/* Light blue link on white - contrast ratio ~2.7:1, fails AA */
.link-blue { color: #5b9bd5; }
```

**Fix - Use sufficient contrast:**
```css
/* Dark gray on white - contrast ratio 10:1 */
.text-muted { color: #595959; background: #fff; }

/* Dark blue on white - contrast ratio 7:1 */
.link-blue { color: #0049d6; }

/* Tool for checking: use axe DevTools or WebAIM contrast checker */
```

**Minimums for WCAG AA:**
- Normal text (< 18pt regular / < 14pt bold): **4.5:1**
- Large text (≥ 18pt regular / ≥ 14pt bold): **3:1**
- UI components / graphical objects: **3:1**

## 5. Auto-Playing Media Without Controls

**Bad:**
```html
<video src="hero.mp4" autoplay muted loop></video>
<audio src="bg-music.mp3" autoplay></audio>
```

**Issues:**
- Cannot be paused/stopped by users
- No captions/transcripts
- Violates WCAG 1.4.2 (Audio Control)

**Good:**
```html
<video src="hero.mp4" autoplay muted loop playsinline aria-label="Promotional video">
  <track kind="captions" src="hero.vtt" srclang="en" label="English" />
</video>

<!-- OR provide user control -->
<video src="hero.mp4" controls>
  <track kind="captions" src="hero.vtt" srclang="en" label="English" />
</video>
```

---

# Footguns: The Most Common Accessibility Mistakes

1. **Placeholder-only labels** — Placeholders disappear on focus and aren't reliable. Always use `<label>`.

2. **`aria-label` on non-interactive elements** — `aria-label` on `<div>` or `<span>` with no interactive role is ignored.

3. **Focus indicators removed via `outline: none`** — Never remove focus rings without providing alternative `:focus-visible` styles.

4. **Semantic HTML ignored in favor of `<div>` and `<span>`** — Native `<button>`, `<nav>`, `<main>`, `<article>` carry built-in a11y semantics.

5. **Color as the only means of conveying information** — Error states indicated only by red color fail colorblind users.

6. **Keyboard trap in custom widgets** — Custom dropdowns, modals, and sliders must trap focus correctly.

7. **Missing `alt` on informative images** — Decorative images should use `alt=""`, not `alt="spacer"` or no alt.

8. **Zoom disabled via `maximum-scale=1.0`** — Users with low vision cannot zoom, violating WCAG 1.4.4.

9. **Dynamic content changes not announced** — After login or form submission, screen readers need `aria-live` regions.

10. **Assuming mobile gestures work for everyone** — Touch targets need ≥44x44px (WCAG 2.5.5).

---

# Manual Testing Checklist

Perform these checks after automated testing passes.

## Keyboard Navigation
- [ ] Tab through entire page—can you reach every interactive element?
- [ ] Does each interactive element have a visible focus indicator?
- [ ] Do modals trap focus? Can you exit with Escape?
- [ ] Do dropdowns/menus open on Enter/Space and close on Escape?
- [ ] Do custom widgets (tabs, sliders, tree views) respond to arrow keys?

## Screen Reader (NVDA/VoiceOver/JAWS)
- [ ] Are all images announced correctly (informative vs. decorative)?
- [ ] Are form fields labeled—name, purpose, any constraints?
- [ ] Are errors announced with `aria-describedby` or `aria-live`?
- [ ] Does the page have correct heading hierarchy (no skips)?
- [ ] Are dynamic changes (toasts, updates, loading states) announced?

## Visual
- [ ] Run WAVE or axe DevTools—any contrast errors?
- [ ] Can UI be zoomed to 200% without horizontal scroll?
- [ ] Is information conveyed through color also available non-visually?

## Touch / Mobile
- [ ] Are touch targets at least 44x44px?
- [ ] Does pinch-zoom work?
- [ ] Are there unintended scroll or swipe traps?

## Motion
- [ ] Does `prefers-reduced-motion` disable animations?
- [ ] Does content not flash more than 3 times per second?

---

# Example

**Input:**

```
ui_description: 'A modal dialog with a form, opened by a button. The close button is an icon only.'
wcag_level: AA
```

**Output:**

```markdown
## Findings
- **[HIGH] WCAG 4.1.2**: Icon-only close button lacks accessible name. Fix: `aria-label="Close dialog"`.
- **[MED] WCAG 2.4.3**: Focus should move to the modal heading on open; return focus to trigger on close.
- **[MED] WCAG 2.4.7**: Ensure visible focus ring on all interactive elements in the modal.
- **[MED] WCAG 1.4.11**: Close button icon may fail contrast if it's SVG with currentColor.
- **[LOW] WCAG 3.2.2**: Modal opening should not trigger context change unexpectedly.

## Manual Tests
1. Open modal with keyboard (Enter/Space on trigger). Tab through—can you reach all fields and close button?
2. Press Escape—does modal close and focus return to trigger?
3. With screen reader (NVDA/VoiceOver), enter modal—announces "dialog" role, heading, and content?
4. Check color contrast on close button icon against overlay background.
5. Zoom to 200%—can you still close the modal without horizontal scrolling?

## Tools
- axe DevTools browser extension (automated)
- WAVE API (visual contrast check)
- NVDA + Firefox (screen reader testing on Windows)
- Accessibility Insights (guided tests)
```

# See Also

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Rules Documentation](https://github.com/dequelabs/axe-core)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAIARIAAPG/)
