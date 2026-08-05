---
name: Bauhaus Night
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e4beba'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#ab8986'
  outline-variant: '#5b403e'
  surface-tint: '#ffb3ae'
  primary: '#ffb3ae'
  on-primary: '#68000b'
  primary-container: '#ff5352'
  on-primary-container: '#5c0008'
  inverse-primary: '#ba1724'
  secondary: '#aec6ff'
  on-secondary: '#002e6b'
  secondary-container: '#0661d2'
  on-secondary-container: '#dbe4ff'
  tertiary: '#ebc31c'
  on-tertiary: '#3b2f00'
  tertiary-container: '#cca800'
  on-tertiary-container: '#4d3e00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad7'
  primary-fixed-dim: '#ffb3ae'
  on-primary-fixed: '#410004'
  on-primary-fixed-variant: '#930014'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#aec6ff'
  on-secondary-fixed: '#001a43'
  on-secondary-fixed-variant: '#004397'
  tertiary-fixed: '#ffe17a'
  tertiary-fixed-dim: '#eac31b'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#554500'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
This design system adapts the functionalism and geometric rigor of the Bauhaus movement for high-performance digital environments. It utilizes a **Neo-Brutalist** aesthetic characterized by structural honesty, flat depth, and intentional high-contrast geometry. 

The personality is intellectual, bold, and efficient. It evokes a sense of "digital craftsmanship" through the use of visible structural lines and unyielding geometric shapes. In this dark mode adaptation, the emphasis shifts from paper-like surfaces to a technical, "blueprint" atmosphere where light is used as a functional tool rather than just an aesthetic accent.

## Colors
The palette is rooted in the Bauhaus primary triad, recalibrated for optical comfort on dark surfaces. 

- **Backgrounds:** The foundation is a near-black neutral (`#121212`). Surface containers use higher values (`#1E1E1E` and `#2C2C2C`) to define hierarchy without relying on shadows.
- **Primaries:** Red, Blue, and Yellow are saturated but adjusted to prevent "vibration" against dark backgrounds. These are used strictly for interactive elements and critical status indicators.
- **Borders:** All containers and interactive components are bounded by a solid black (`#000000`) border. On the dark background, this creates a "subtractive" depth effect where the border feels like a structural seam.

## Typography
The design system exclusively uses **Space Grotesk** to lean into its technical, geometric origins. 

- **Headlines:** Set with tight tracking and heavy weights. Large headlines should treat the font as a graphic element.
- **Body:** Maintains generous line height to ensure the idiosyncratic letterforms of Space Grotesk remain legible in long-form text against dark backgrounds.
- **Labels:** Always uppercase with increased letter spacing for maximum clarity at small sizes.

## Layout & Spacing
The layout follows a **Rigid Grid** philosophy. All spacing is derived from a 4px baseline, ensuring mathematical alignment across all components.

- **Grid:** A 12-column grid is used for desktop, 4-column for mobile.
- **Composition:** Elements should be boxed. Avoid "floating" content. Use the black borders to define the grid visually.
- **Rhythm:** Use the `xl` (48px) spacing for major section breaks to allow the heavy geometric elements room to breathe.

## Elevation & Depth
This system rejects traditional Z-axis elevation (soft shadows). Instead, it uses **Flat Offset Depth**:

- **Hard Shadows:** Depth is indicated by a solid, 100% opaque offset block (Hard Shadow). Use the primary colors for these offsets (e.g., a Blue surface with a 4px Black offset).
- **Tonal Stepping:** Hierarchy is established by "stepping" the surface color. Background → Surface → Surface Variant.
- **Active State:** When an element is pressed, it physically "moves" by removing the offset, simulating a mechanical button press.

## Shapes
In accordance with the Bauhaus principle of geometric purity, the roundedness is set to **Sharp (0)**. 

- All corners must be 90-degree angles. 
- Avoid any radii on buttons, inputs, or cards. 
- Circular elements are permitted only when the function demands it (e.g., Radio buttons or Avatars), maintaining a strict interplay between the square and the circle.

## Components
Consistent application of the design system's structural rules:

- **Buttons:** Rectangular with a 2px black border. Use a primary color (Red/Blue/Yellow) for the background. On hover, apply a 4px black hard-offset shadow. 
- **Input Fields:** Background uses `surface_variant_hex` with a 2px black border. Labels are always placed above the field in `label-md` style.
- **Cards:** Use `surface_hex`. Borders are mandatory. Use primary-colored hard-offset shadows to denote featured or interactive content.
- **Chips/Badges:** Minimalist boxes with black borders. Use primary colors to denote category or status.
- **Progress Bars:** Highly geometric. The track is `surface_variant_hex` and the indicator is a solid primary color, no rounded ends.
- **Lists:** Separated by 2px black horizontal rules. No dividers at the very top or bottom of a list container.