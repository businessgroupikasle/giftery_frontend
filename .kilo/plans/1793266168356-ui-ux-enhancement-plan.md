# Giftery — Frontend & Backend UI Enhancement (UI/UX Only)

## Goal

Premium, polished visual design for the Giftery Product Customization page and the customer/admin customized-order views (invoice modal + admin orders table), with **zero changes to business functionality**.

## Context & baseline

- Monorepo: frontend `D:\Giftery\ecommerce-project\frontend` (React 18 + Vite), backend `D:\Giftery\ecommerce-project\backend` (Express + Prisma, API-only — no view templates, so no backend UI exists to enhance).
- Customization feature is already present in the working tree (uncommitted / untracked): `CustomizationEditor.jsx`, `CustomizationEditor.module.css`, `OriginalArtwork.jsx`, `PrivateImage.jsx`; backend `customizationRoutes.js`, `artworkStorage.js`, `customizationService.js`, `orderPricing.js`; Prisma models `CustomizationDraft`, `CustomizationAsset`, plus `OrderItem.customization` / `CartItem.customization` JSON fields.
- Both repos have uncommitted changes in the working tree. UI work layers on top; nothing is committed here.
- Backend-connected admin/customer order views are frontend pages: `Dashboard/components/OrdersSection.jsx` (admin) and `Orders/index.jsx` + `Orders/InvoiceModal.jsx` (shared customer+admin order detail).
- Design tokens live in `frontend/src/styles/variables.css` (colors, type scale, spacing, shadows, radius, transitions); utilities in `mixins.css`; base/reset + focus-visible + reduced-motion in `global.css` / `responsive.css`; shared UI kit in `src/components/ui/*` (Button, Input, Modal, Spinner).

## Scope boundaries (do NOT touch)

- No backend files. No API contracts, endpoints, request/response formats, or field names.
- No Prisma schema, migrations, or database records.
- No auth/authorization, no customization state/save/load logic, no image upload/storage, no pricing/stock/cart/checkout/payment, no order persistence, no routing.
- Preserve every event handler, state binding, prop, ARIA attribute, and API integration. Markup tweaks are additive className-only where needed.
- Do not replace working components with mock data.

## E2e tests that lock behavior (must keep passing)

- `e2e/customization.spec.js` — button names 'Save draft' / 'Add saved design to cart' / 'ADD TO CART' / 'BUY NOW' / 'Retry loading draft' / 'Discard customization'; region 'Customize your gift '; alt texts 'Selected product mockup' / 'Your artwork'; labels 'Personalized text' / 'Horizontal position' / 'Vertical position' / 'Text box width:' / 'Text size:'; mobile overlay must stay inside the product image bounding box on a 375px viewport.
- `e2e/customization-font.spec.js` — 'Font' combobox, canvas font output `(bold|700) 80px Georgia`, draft restore.
- `e2e/customization-guards.spec.js` — guest sign-in redirect, draft failure blocking purchase, discard recovery, cart failures.
- `e2e/dashboard-order-details.spec.js`, `e2e/customer-invoice.spec.js` — invoice dialog content + download.
- `e2e/responsive.spec.js`, `e2e/responsive-matrix.spec.js` — desktop/tablet/mobile.

## Files to change (frontend only)

### 1. `src/pages/Product/Product.module.css`

Refine the product page shell around the editor:

- Main product image: subtle hover zoom (scale ~1.03–1.05), smooth transition, elegant elevation/shadow; keep `object-fit: cover` and aspect ratio.
- Thumbnail gallery: refined borders, active state, hover ring.
- Badge pill, title, rating row, pricing (current/compare/discount), tax subtext: improved hierarchy and contrast.
- Quantity stepper: consistent input height, hover/focus/active states, disabled `+` state.
- CTA group: 'ADD TO CART' / 'BUY NOW' / 'REQUEST QUOTE' — unified heights, hover/focus/active, disabled opacity, loading-safe disabled styling; preserve inline disabled styles already on the buttons.
- Trust/security badges bar and related-products card polish.
- Responsive: tablet/mobile breakpoints already present; tighten spacing, font sizes, stacked CTAs on mobile.

### 2. `src/pages/Product/CustomizationEditor.module.css`

Core customization UI polish:

- Stage: stronger but subtle elevation (border + shadow), soft hover lift on the product image wrapper; keep `container-type: inline-size` and `%`-based layer positioning (`left`/`top`/`transform translate(-50%,-50%)`) so overlays stay aligned on hover, resize, drag, and responsive changes. Do not add padding/border to `.stage` without compensating — overlays are positioned against `stage.getBoundingClientRect()` in JS.
- Background image: subtle hover zoom transition within the overflow-hidden stage.
- Upload zone: clearer dashed border, hover/active focus states, helper text contrast.
- Fieldset controls: input/select/color/range styling consistent with design tokens, visible `:focus-visible` focus ring, disabled gray states.
- Font selector and color picker: aligned heights, badge-like active indication.
- Range sliders: accent color track/thumb, consistent height.
- Layer buttons ('Text' / 'Artwork'): pressed state, disabled 'Artwork' when no asset.
- Action buttons ('Preview design' / 'Edit design' / 'Save draft' / 'Add saved design to cart'): distinct primary/secondary styles, hover/focus/active, disabled opacity, working/loading text preserved in JS.
- Status paragraph: success/error color cues keyed off existing `message`/`saved` state (no JS change).
- 'Remove artwork' link and 'Discard customization' button: subtle hover, destructive color for discard.
- Responsive: stack stage above controls below 768px, full-width stage, touch-friendly target sizes (respect `responsive.css` 44px min-height on mobile).
- `prefers-reduced-motion`: transitions disabled/reduced via existing `responsive.css` rule; add no new non-reduced animations.

### 3. `src/pages/Orders/InvoiceModal.module.css` (shared customer + admin order detail)

- Tax invoice: refined header/brand, status badge color-coded by existing `STATUS_COLORS`, info grid cards, item table.
- Customized product row: `PrivateImage` artwork thumbnail + `OriginalArtwork` link, customization metadata ('Customized product', custom text, JSON details block) presented compactly with monospace pre, optional collapsible look preserved.
- Totals block, payment details, download/print/close buttons: consistent button heights, hover/focus states.
- Responsive: existing 700px breakpoint polish, stacked layout, readable totals on mobile.
- Empty/loading: keep existing 'No item details available' fallback.

### 4. `src/pages/Dashboard/Dashboard.module.css` (admin orders table section)

- Orders table (`ordersTable`): refined header, row hover, status pill variants (already color-coded), amount alignment, search input and filter tab styling consistency.
- Empty state and action dots ('View Details' eye, delete) polish.
- Responsive table overflow and font-size refinements already present; keep.

### 5. Minimal additive JSX className changes only (if needed for state styling)

- `src/pages/Product/index.jsx`, `src/pages/Product/CustomizationEditor.jsx`, `src/pages/Orders/InvoiceModal.jsx`, `src/pages/Orders/index.jsx`, `src/pages/Dashboard/components/OrdersSection.jsx`
- Rule: className additions only; no handler, state, prop, or API changes.

### Files NOT changed (confirmation)

- Backend: nothing (API-only, no UI).
- `CustomizationEditor.jsx` logic: save/draft/upload/validation/drag/preview math untouched.
- `Product/index.jsx` logic: add-to-cart, buy now, quote, gallery, related products untouched.
- `InvoiceModal.jsx`, `Orders/index.jsx`, `OrdersSection.jsx` logic untouched.

## Decisions

- Backend has no server-rendered admin UI (confirmed: no ejs/hbs/pug/handlebars files; Express routes only), so enhancement scope is frontend-only for both customer and admin order views.
- CSS-module-scoped changes preferred over touching the shared `ui/` kit, to avoid unintended effects on unrelated pages; shared kit may receive only safe token-aligned tweaks if needed.
- Layer alignment is JS-driven (`CustomizationEditor.jsx:224-226` reads `stage.current.getBoundingClientRect()`); CSS must not alter stage box dimensions without compensating, otherwise the mobile e2e overlay-in-image assertion breaks.

## Risks / open questions

- Playwright browsers may not be installed in this environment; if `test:e2e` cannot run, rely on `lint`, `build`, `test:unit`, and manual visual checks, and report e2e as environment-limited.
- How much JSX is needed: start with pure CSS; add classNames only where a state (loading/disabled/selected) needs styling that CSS can't target otherwise.
- CustomizationEditor class names are not asserted by e2e (role/label/alt queries used), so module class renames are safe; button text and ARIA labels are asserted and must remain exact.

## Validation plan

1. `npm run lint` — frontend eslint (`eslint src --ext .js,.jsx`).
2. `npm run build` — `vite build` (type/catch of build errors).
3. `npm run test:unit` — `node --test test/*.test.js`.
4. `npm run test:e2e` — Playwright, prioritizing `customization.spec.js`, `customization-font.spec.js`, `customization-guards.spec.js`, `dashboard-order-details.spec.js`, `customer-invoice.spec.js`, `responsive.spec.js` (if browsers available).
5. Manual checklist: image hover zoom; overlay alignment on desktop/tablet/mobile during resize; artwork upload; Save Draft / Preview Design / Remove Artwork / Add to Cart states; draft restore on refresh; admin Orders > View Details invoice; invoice download; mobile (375px) editor within viewport.

## Deliverable (to be confirmed after implementation)

- Exact files changed.
- UI enhancements completed per section above.
- Tests/commands actually run with results.
- Confirmation that API contracts, DB schema, customization logic, cart, checkout, and order workflows were not intentionally modified.
- Any regressions or remaining issues.
