# Elliana Hau / Made to move you

Black, motion-led portfolio with generously spaced typography and authentic project galleries.

Live site: https://charlesryanpaul-droid.github.io/elliana-hau-portfolio/

## Featured project slideshow

The green hero sculpture has been replaced with an animated deck of three projects:

1. Fresh Fizz, identity, packaging, and custom typography.
2. Independent voices, music and identity artwork.
3. Acuity Brands, marketing and visual storytelling.

Projects rotate automatically every 5.2 seconds with layered, rotating card transitions. Click the visible card to open its existing case-study gallery. Arrow buttons, numbered selectors, keyboard arrows, and horizontal touch swipes browse the projects manually.

The Pause/Play control stops or starts the slideshow. Hovering pauses temporarily. Keyboard focus stops autoplay until Play is explicitly selected. Global Motion off, reduced-motion preferences, open dialogs, a hidden browser tab, and scrolling the hero offscreen also stop rotation. Reduced-motion mode still supports manual navigation without animated transitions. All three hero images use contain sizing so the original artwork stays intact.

## Editing

- `index.html`: page structure, hero slides, and homepage copy.
- `styles.css`: the existing black layout and responsive typography, unchanged by the slideshow update.
- `slideshow.css`: scoped artwork deck styling and responsive slideshow controls.
- `app.js`: project descriptions, galleries, dialogs, motion controls, slideshow behavior, and three unchanged playground experiments.
- `build.py`: imports and optimizes 20 original artwork images, caches them as WebP, and stages the public files.
- `qa.py`: automated Chromium checks for the slideshow, eight layout widths, galleries, navigation, and reduced motion.
- `.github/workflows/pages.yml`: builds, tests, deploys, verifies public routes, and renders the live site in a fresh browser.

No JavaScript libraries, analytics, passwords, or credentials are included. Optional Space Grotesk and Manrope web fonts load from Google Fonts with system fallbacks. YouTube loads only after explicit reel playback.

Build locally: install Python and Pillow (`python -m pip install Pillow`), run `python build.py`, then `python -m http.server --directory _site`. The first artwork import requires internet access. Browser checks additionally require Playwright and its Chromium browser.

## Design and attribution

Original portfolio content and project imagery: https://www.ellianahau.com/. Internship and collaboration credits are retained. The Orbit, Elastic, and Bloom graphics are original website visuals, not client projects.

Visual reference: https://studiodumbar.com/work/adidas-futurenatural. No Adidas or Studio Dumbar artwork, footage, logos, or font files are incorporated. All client work and trademarks belong to their respective owners.

The slideshow follows the interaction principles of https://www.w3.org/WAI/ARIA/apg/patterns/carousel/ with visible rotation controls and inactive slides removed from the keyboard and accessibility tree.

CI artifacts contain machine-readable test results and screenshots. Native Safari/iOS and full YouTube streaming remain separate manual compatibility checks.
