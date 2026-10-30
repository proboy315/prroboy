# Hero and Navigation Verification

Tested against the production Vite preview using Chromium headless. No Lighthouse, Safari, Firefox or deployed Vercel results are claimed.

## Layout and Navigation

Tested viewport sizes: 1536x1024, 1440x900, 1280x720, 1280x560, 1280x420, 1100x650, 1024x768, 820x1100, 844x390, 390x844 and 320x680.

- No horizontal overflow at these sizes.
- Sidebar Home stays below the 96px desktop header. At 1280x420 its top is 118px, and the collapse control ends at 401px.
- The rail scrolls to its final item on short viewports, and Home can be reached again without scrolling the main page.
- Expand, collapse, Escape and focus-based tooltips work.
- The mobile drawer captures focus, supports Escape and returns focus to its opener.
- Header auto-hide on downward scroll and reveal on upward scroll work.
- The logo returns to the top even when already on the homepage.
- Project and showcase links, documentation and the not-found page render.
- No JavaScript runtime errors were recorded in these checks.

## Portrait

The unavailable supplied maroon photo was not claimed as installed or tested. A clearly labeled synthetic fixture was used only in isolated browser contexts.

- The new photo input accepts a valid image and rejects a text file.
- Browser refresh restores a selected local preview.
- The rendered image has zero CSS border and radius.
- Natural and rendered aspect ratios match; no stretching or letterbox-sized mask.
- Mobile artwork precedes the introduction.
- No requests for the old blue profile images or generated hero image.
- The importer preserves original image bytes and updates one configured source.
- The synthetic test image is not in the deployed `public/` or `dist/` directories.

## Intro

The actual 300 frames and audio are still missing. Temporary intercepted test responses, not files deployed to the website, verified:

- Automatic playback without an Enter/Experience button.
- First drawn frame 0, last drawn frame 299; numeric, nondecreasing frame order.
- Requests for all 300 frames.
- Replay after a refresh.
- Skip ends playback without restarting it.
- Missing assets fall back to the portfolio.

Actual soundtrack synchronization remains unverified.

## Reproduce

Build and serve the production output, then run `node tests/layout.mjs` and `node tests/interactions.mjs` with Playwright available. Set `QA_BASE` to change the default `http://localhost:4173`. Set `PLAYWRIGHT_MODULE` to the installed Playwright module path if it is outside the project's `node_modules`.

The scripts write temporary fixtures, screenshots and JSON reports to ignored `.work/`. These are not production assets.