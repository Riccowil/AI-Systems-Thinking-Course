# Agent Visual Vocabulary

**Phase:** 07-content-foundations
**Created:** 2026-03-21
**Status:** Design specification

## Design Principles

- **Shape-coded nodes:** Each component type has a distinct SVG shape. Shapes do the heavy lifting for identification -- a student should be able to distinguish node types by shape alone even without color.
- **Subtle color tints:** Muted palette colors per shape as secondary reinforcement. Not the primary differentiator.
- **Dark cybernetic consistency:** All colors are from the existing palette family (#0f1117 background, teal/coral/blue accents).
- **Same edge/link styles:** Curved bezier paths with polarity labels, identical to existing CLD artifacts.
- **Inline React rendering:** All SVG specs are for inline rendering (no external CSS files).
- **Fonts:** DM Sans for body/labels, JetBrains Mono for code/data.

## Node Type Specifications

### 1. Agent -- Hexagon

- **Shape:** Regular hexagon (6 sides)
- **SVG element:** `<polygon>`
- **Default size:** 80px wide x 70px tall
- **Fill:** `#1a2744` (deep blue-navy, muted from `#6b8aff` family)
- **Stroke:** `#6b8aff` (blue accent), 2px
- **Label:** Centered, DM Sans 12px, color `#e8ecf4`
- **Rationale:** Hexagon = hub/orchestrator. Visually distinct and central, conveys the agent as the decision-making core.

**SVG path data** (origin at top-left, width 80, height 70):
```svg
<polygon points="40,0 80,17.5 80,52.5 40,70 0,52.5 0,17.5" />
```

### 2. Tool -- Rectangle (Rounded Corners)

- **Shape:** Rectangle with border-radius 6px
- **SVG element:** `<rect>` with `rx="6"` `ry="6"`
- **Default size:** 90px wide x 50px tall
- **Fill:** `#1a3a2e` (deep teal-green, muted from `#00d4aa` family)
- **Stroke:** `#00d4aa` (teal accent), 2px
- **Label:** Centered, DM Sans 12px, color `#e8ecf4`
- **Rationale:** Rectangle = functional unit. Familiar "block" metaphor, the most common shape for actionable components.

**SVG path data:**
```svg
<rect x="0" y="0" width="90" height="50" rx="6" ry="6" />
```

### 3. Memory -- Cylinder

- **Shape:** Cylinder (rectangle body with elliptical top/bottom caps)
- **SVG element:** Composite `<path>` drawing cylinder shape
- **Default size:** 60px wide x 70px tall
- **Fill:** `#2a1a3a` (deep purple, muted from `#9b6bff` family)
- **Stroke:** `#9b6bff` (purple accent), 2px
- **Label:** Centered vertically in body section, DM Sans 12px, color `#e8ecf4`
- **Rationale:** Cylinder = database/storage. Universal data persistence symbol recognized across all technical disciplines.

**SVG path data** (origin at top-left, width 60, height 70):
```svg
<!-- Top ellipse cap -->
<ellipse cx="30" cy="10" rx="30" ry="10" />
<!-- Body sides -->
<rect x="0" y="10" width="60" height="50" />
<!-- Bottom ellipse cap -->
<ellipse cx="30" cy="60" rx="30" ry="10" />
```

Simplified composite path approach:
```svg
<path d="M0,10 C0,0 60,0 60,10 L60,60 C60,70 0,70 0,60 Z" />
<!-- Top cap overlay (visible ellipse) -->
<ellipse cx="30" cy="10" rx="30" ry="10" />
```

### 4. Evaluator -- Diamond

- **Shape:** Diamond (rotated square)
- **SVG element:** `<polygon>` with 4 diamond points
- **Default size:** 70px wide x 70px tall
- **Fill:** `#3a2a1a` (deep amber, muted from `#ffb86b` family)
- **Stroke:** `#ffb86b` (amber accent), 2px
- **Label:** Centered, DM Sans 11px (slightly smaller to fit), color `#e8ecf4`
- **Rationale:** Diamond = decision point. Familiar from flowcharts as a yes/no branching node, maps naturally to evaluation logic.

**SVG path data** (origin at top-left, width 70, height 70):
```svg
<polygon points="35,0 70,35 35,70 0,35" />
```

### 5. Constraint -- Octagon

- **Shape:** Regular octagon (8 sides)
- **SVG element:** `<polygon>` with 8-point coordinate calculation
- **Default size:** 70px wide x 70px tall
- **Fill:** `#3a1a1a` (deep red, muted from `#ff6b6b` family)
- **Stroke:** `#ff6b6b` (coral accent), 2px
- **Label:** Centered, DM Sans 12px, color `#e8ecf4`
- **Rationale:** Octagon = stop sign. Universal constraint/limit signal, immediately communicates "boundary" or "restriction."

**SVG path data** (origin at top-left, width 70, height 70):
```svg
<polygon points="20,0 50,0 70,20 70,50 50,70 20,70 0,50 0,20" />
```

## Edge Specifications (Unchanged from Existing)

Edges follow the same style as existing CLD artifacts. No changes needed.

- **Positive polarity (+):** Teal `#00d4aa`, curved bezier path, "+" label at midpoint
- **Negative polarity (-):** Coral `#ff6b6b`, curved bezier path, "-" label at midpoint
- **Stroke width:** 2px
- **Arrow:** Filled triangle at target end, same color as edge stroke
- **Label font:** JetBrains Mono 11px, color matches edge color
- **Bezier control points:** Offset perpendicular to the straight-line path between nodes, creating a gentle curve

## Canvas Background

- **Background:** `#0f1117` (dark charcoal, same as existing)
- **Grid dots:** `#1e2130` (subtle grid pattern, optional for visual alignment)

## Color Palette Summary

| Type | Shape | Fill | Stroke | Accent Family | Size (W x H) |
|------|-------|------|--------|---------------|---------------|
| Agent | Hexagon | `#1a2744` | `#6b8aff` | Blue | 80 x 70 |
| Tool | Rectangle | `#1a3a2e` | `#00d4aa` | Teal | 90 x 50 |
| Memory | Cylinder | `#2a1a3a` | `#9b6bff` | Purple | 60 x 70 |
| Evaluator | Diamond | `#3a2a1a` | `#ffb86b` | Amber | 70 x 70 |
| Constraint | Octagon | `#3a1a1a` | `#ff6b6b` | Coral | 70 x 70 |

## Interaction States

### Selected State
- Stroke width increases from 2px to 3px
- Subtle glow effect via SVG filter or CSS box-shadow: `0 0 12px {stroke_color}40`
- Fill opacity remains unchanged

### Hover State
- Fill opacity increases from 0.8 to 1.0 (subtle brightening)
- Cursor changes to pointer
- No size change (prevents layout jitter)

### Drag State
- Opacity drops to 0.6
- Drop shadow appears: `0 4px 8px rgba(0,0,0,0.4)`

## Usage Notes

- All 5 shapes render in the ST-004 CLD canvas (agent architecture mapping) and ST-005 dependency graph (tool stack analysis)
- Node labels are always centered inside the shape, truncated with ellipsis if they exceed shape width minus 16px padding
- Nodes are draggable on the canvas with position persistence
- No separate rendered legend graphic needed -- text descriptions with SVG specs are sufficient for artifact builders
- The visual vocabulary document is the single source of truth for all agent node rendering

---

*Specification for Phase 7: Content Foundations*
*Satisfies: CFND-04 (Agent visual vocabulary)*
