# Elliana Hau / Kinetic portfolio

Version 2: a black, motion-led portfolio with original generative forms, generously spaced typography, and authentic project galleries.

Live site: https://charlesryanpaul-droid.github.io/elliana-hau-portfolio/

## Editing

- `index.html`: page structure and homepage copy.
- `styles.css`: black palette, responsive layout, type spacing, CSS loops.
- `app.js`: project descriptions, image ordering, accessible dialogs, motion controls, and original procedural canvas forms.
- `build.py`: imports and optimizes the 20 publicly displayed artwork images from Elliana's original portfolio. Images are cached as WebP and deployed locally, not hotlinked in the browser.
- `.github/workflows/pages.yml`: builds the public `_site` directory and deploys it to GitHub Pages after a push to main.

No JavaScript libraries, external fonts, analytics, passwords, or credentials are included in the website. YouTube loads only after the visitor chooses to play the reel.

To build locally: install Python and Pillow (`python -m pip install Pillow`), then run `python build.py` and `python -m http.server --directory _site`. The first artwork import requires internet access.

## Design and attribution

The original website content and project imagery come from https://www.ellianahau.com/. Internship and collaboration credits are retained. The new sculpture, Elastic, Orbit, and Rhythm graphics are original website motion studies, not presented as historical client work.

Visual direction reference: Studio Dumbar's Adidas Futurenatural case study, https://studiodumbar.com/work/adidas-futurenatural. The influence is the integration of kinetic organic forms, graphic contrast, and motion into one visual language. No Adidas or Studio Dumbar artwork, footage, logos, or fonts are incorporated.

All client work and trademarks belong to their respective owners.

## Verification

The actual HTML, CSS, and JavaScript were rendered in Chromium using local copies of the artwork. Tested at 320, 360, 390, 768, 1024, 1440, and 1920 CSS pixels. No horizontal overflow or out-of-bounds heading text was detected at those widths. Tested four project galleries, image loading, Escape closing, reel iframe creation and cleanup, interactive color changes, continuously changing hero frames, motion pause, and reduced-motion mode. No JavaScript exceptions occurred in those checks.

Full YouTube streaming and native Safari/iOS rendering were not tested in that local environment. The site uses standard browser APIs, but those remain manual compatibility checks. Motion is optional and honors the visitor's reduced-motion setting.
