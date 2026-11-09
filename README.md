# PROXIMA Marketing website

A static, multi-page website for PROXIMA Marketing. The site is served directly from the repository; there is no build step or package manager.

Public site: https://proximamarketing.github.io/Proxima/

## Pages

- `index.html` — homepage and interactive solar-system journey.
- `journey.html` — content formats, release walkthrough and monthly packages.
- `views.html` — Jean White project evidence and the illustrative monthly report preview.
- `about.html` — founder and project background.
- `application.html` — artist and label enquiry form.
- `labels.html` — separately scoped release campaigns for independent record labels.
- `examples.html` — portfolio placeholder.
- `privacy.html`, `terms.html`, `cookies.html` — legal information.

## Shared assets

- `style.css` — global styles, homepage journey, responsive behaviour and shared visual system.
- `site-pages.css` — styles for the content, results, enquiry and examples pages.
- `script.js` — navigation, scroll journey, reveal effects, content-card interactions and enquiry submission.

The site uses a standard Arial / Helvetica sans-serif stack throughout. No external web fonts are required.

## Enquiry form

The form in `application.html` submits URL-encoded form data to the deployed Google Apps Script web app whose URL is stored in `script.js`. The script expects a JSON response containing `{ "success": true }` before it displays the success message.

Do not replace the endpoint casually: it is connected to the enquiry workflow. To test a change, use a controlled test destination or remove the test row from the connected Sheet afterwards. Never submit fake enquiries to the production sheet without checking first.

The form has client-side required-field validation, a 30-second request timeout, and a visible email fallback for visitors without JavaScript.

## Making changes

1. Edit the relevant HTML, CSS or JavaScript file.
2. When changing an asset, update its query-string version in the HTML pages so browsers request the new file.
3. Keep local page links and fragment targets in sync with the actual file names and element IDs.
4. Keep the Jean White figures labelled as the founder's own project, not a PROXIMA client campaign. Keep example report metrics labelled as illustrative.
5. Commit changes to the default branch. GitHub Pages publishes the repository according to its Pages settings.

## Quick checks

There is no automated build pipeline at present. Before considering a change complete:

- Check that all nine HTML pages have balanced markup, unique IDs and valid local links.
- Check that every form field has a matching label and every ARIA reference points to an existing element.
- Check JavaScript syntax with `node --check script.js`.
- Test the mobile menu with mouse, keyboard and Escape; check keyboard focus returns to the menu button.
- Test the solar-system journey, the release-format flip cards, the results tabs and reduced-motion behaviour.
- Check the artist pricing page and the separate record-label page; the label enquiry link should preselect the label campaign options.
- Check the home page at desktop and mobile widths, including with JavaScript disabled.
- Test the enquiry form only with an agreed test destination or a controlled test row. Confirm the Sheet receives the expected fields and the response JSON is `success: true`.

Do not claim that the live form or Pages deployment has been tested unless it has been tested in a real browser.
