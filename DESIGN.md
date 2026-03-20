# Design System Specification: The Architectural Blueprint

## 1. Overview & Creative North Star: "The Master Craftsman"

The Creative North Star for this design system is **The Master Craftsman**. This system moves beyond the generic "utility app" aesthetic to create a digital environment that feels as structured, precise, and dependable as a master-built home.

We reject the "template" look of flat grids and heavy borders. Instead, we embrace **Architectural Layering**—using tonal depth, intentional asymmetry, and sophisticated editorial typography to guide the user. The experience should feel like high-end blueprints: clean, authoritative, yet approachable through soft geometry and breathing room.

---

## 2. Colors & Tonal Depth

Our palette balances the "Reliability" of deep blues with the "Kinetic Energy" of tool-inspired ochre and orange.

### The Palette (Material 3 Logic)

- **Primary (Reliability):** `#003fb1` (Primary) to `#1a56db` (Container). Use this for core brand moments and high-conviction actions.
- **Secondary (Action):** `#855300` (Secondary) to `#fea619` (Container). This is our "Safety Orange"—reserved for tools, active status, and primary CTAs.
- **Neutral Surfaces:** From `#ffffff` (Lowest) to `#d1dbec` (Dim).

### The "No-Line" Rule

**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Structural boundaries must be defined solely through background color shifts.

- *Example:* A `surface-container-low` (`#eef4ff`) sidebar sitting on a `surface` (`#f8f9ff`) main content area.

### Surface Hierarchy & Nesting

Treat the UI as a series of physical layers. Use the tiers to create nested importance:

1. **Base:** `surface` (`#f8f9ff`) - The foundation.
2. **Sections:** `surface-container-low` (`#eef4ff`) - Defining large functional areas.
3. **Cards/Interaction:** `surface-container-lowest` (`#ffffff`) - For content that needs to "pop" against the background.

### The "Glass & Gradient" Rule

To elevate the "HandyBox" experience from a tool to a premium service:

- **Signature Gradients:** Use a subtle linear gradient from `primary` (`#003fb1`) to `primary-container` (`#1a56db`) for hero sections and main action buttons to add "soul" and dimension.
- **Glassmorphism:** Floating navigation or top bars should use `surface_bright` at 80% opacity with a `20px` backdrop-blur to allow content to bleed through softly.

---

## 3. Typography: Editorial Authority

We pair the structural precision of **Plus Jakarta Sans** for displays with the hyper-readability of **Inter** for utility.

- **Display (Plus Jakarta Sans):** Used for marketing hooks. The `display-lg` (3.5rem) should feel massive and confident, with tight letter-spacing (-0.02em).
- **Headline (Plus Jakarta Sans):** `headline-md` (1.75rem) provides the "Editorial" feel. Use these to introduce service categories (e.g., "Plumbing," "Electrical").
- **Body (Inter):** All functional text uses Inter. `body-lg` (1rem) is the workhorse for descriptions, while `label-md` (0.75rem) handles the metadata of tool types and timestamps.

---

## 4. Elevation & Depth: Tonal Layering

We do not "drop shadows" on everything. We "lift" surfaces through light.

- **The Layering Principle:** Avoid shadows for static cards. Instead, place a `surface-container-lowest` card on a `surface-container-high` background. This creates a "soft lift" that feels architectural.
- **Ambient Shadows:** For floating elements (Modals/Poppovers), use a "Tinted Shadow":
  - *Value:* `0px 20px 40px rgba(18, 28, 40, 0.06)` (using `on-surface` as the tint).
- **The "Ghost Border" Fallback:** If a container lacks contrast (e.g., a white card on a white background), use a "Ghost Border": `outline-variant` (`#c3c5d7`) at **15% opacity**. Never use 100% opaque lines.

---

## 5. Components

Our components are "Robust but Approachable"—thick tap targets with sophisticated `0.75rem` (md) to `1rem` (lg) corner radii.

- **Buttons:**
  - **Primary:** Gradient of `primary` to `primary_container`. White text. `xl` (1.5rem) roundedness for a pill-like, friendly feel.
  - **Action (Tool):** Use `secondary_container` (`#fea619`) for "Book Now" or "Emergency" buttons. It represents the tool in the hand.
- **Cards:** No dividers. Separate the "Price" from the "Description" using a `1.5` (0.375rem) vertical spacing shift or a subtle background change to `surface-container-low`.
- **Input Fields:** Use `surface-container-lowest` for the fill. The label should be `title-sm` (Inter) for a bold, professional look. Avoid the "box" look; use a `2px` bottom-weighted focus state in `primary`.
- **Chips:** Use `secondary_fixed` (`#ffddb8`) with `on_secondary_fixed` (`#2a1700`) for "Active Job" status. These should feel like physical tags.
- **The "Toolbox" Drawer:** An additional component for this system. A bottom-anchored sheet (using `surface-container-highest`) that holds active tools, cart items, or pro-filters, mimicking the physical act of reaching into a toolbox.

---

## 6. Do’s and Don’ts

### Do:

- **Do** use asymmetrical layouts. Let a headline sit 24px further left than the body text to create a modern, editorial rhythm.
- **Do** use `surface-dim` for inactive states rather than grey-outs, keeping the interface feeling "warm."
- **Do** leverage the `lg` (1rem) roundedness scale for images to make heavy machinery/tools look friendly and integrated.

### Don’t:

- **Don’t** use black (`#000000`). Always use `on-surface` (`#121c28`) to maintain the sophisticated deep-blue undertone.
- **Don’t** use dividers or "rules." If you need to separate content, use an `8` (2rem) spacing gap.
- **Don’t** use high-contrast borders. If the design feels "loose," adjust your background tonal shifts (e.g., darken the background, don't outline the card).
