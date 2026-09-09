# Elliana Hau / Made to move you

Black, motion-led portfolio with original procedural shapes, generously spaced typography, and authentic project galleries.

Live site: https://charlesryanpaul-droid.github.io/elliana-hau-portfolio/

## Editing

- `index.html`: page structure and homepage copy.
- `styles.css`: black palette, responsive layout, generous type spacing, and continuous CSS loops.
- `app.js`: project descriptions, galleries, accessible native dialogs, motion controls, original WebGL sculpture, Canvas 2D fallback, and three animated playground experiments.
- `build.py`: imports and optimizes the 20 publicly displayed artwork images from Elliana's original portfolio. Images are cached as WebP and deployed locally rather than hotlinked in the browser.
- `qa.py`: automated Chromium checks and screenshots of the staged site.
- `.github/workflows/pages.yml`: builds, tests, deploys, and verifies the public site.

No JavaScript libraries, analytics, passwords, or credentials are included. Optional Space Grotesk and Manrope web fonts load from Google Fonts with local system fallbacks. YouTube loads only after the visitor chooses to play the reel.

Build locally: install Python and Pillow (`python -m pip install Pillow`), run `python build.py`, then `python -m http.server --directory _site`. The first artwork import requires internet access. Browser checks additionally require Playwright and its Chromium browser.

## Controls

- Remix the shape: cycles three original 3D forms.
- Change the energy: cycles the animated forms through four palettes.
- Motion toggle: pauses or resumes animation, remembers the visitor's choice, and respects reduced-motion preferences.
- Project cards: open credited case-study galleries. Escape closes dialogs.
- Native mobile navigation, expertise disclosures, direct email contact, and explicit reel playback.

## Design and attribution

Original portfolio content and project imagery: https://www.ellianahau.com/. Internship and collaboration credits are retained. The sculpture and Orbit, Elastic, and Bloom graphics are original website visuals, not historical client work.

Visual reference: Studio Dumbar's Adidas Futurenatural case study, https://studiodumbar.com/work/adidas-futurenatural. The influence is the integration of kinetic forms, contrast, and motion into one visual language. No Adidas or Studio Dumbar artwork, footage, logos, or font files are incorporated.

All client work and trademarks belong to their respective owners.

## Verification

Local authored-source rendering tested at 320, 375, 390, 520, 768, 1024, 1440, and 1920 CSS pixels. Browser automation checks heading and page overflow, all four project galleries, images, keyboard closing, mobile navigation, animation changes, pause, palette controls, and reduced motion. CI artifacts contain browser screenshots and a machine-readable report. The post-deployment check compares live HTML, CSS, and JavaScript to the exact build and checks all 20 images.

Native Safari/iOS and full YouTube streaming remain manual compatibility checks. Animation is optional; if WebGL is unavailable, the hero falls back to Canvas 2D rendering.
