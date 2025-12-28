# Genealog Indexer - Copilot Instructions

**Version:** 3.2 | **Last Updated:** 20 grudnia 2025 | **Status:** Production (v7.1 latest, v5 stable)

## 🎯 TL;DR for AI Agents

**This is a single-file genealogical document editor** for indexing historical records with visual region marking.

- **Tech:** Vanilla JS + OpenSeadragon (image viewer) + Vite + localStorage
- **Latest version:** v7.1 (`public/viewer-osd-v7.html`, ~3500 lines)
- **Stable version:** v5 (`public/viewer-osd-v5.html`, ~2200 lines)
- **Key files:** Only 2 main files: `public/viewer-osd-v5.html` and `public/viewer-osd-v7.html`
- **No external APIs:** All data persisted locally to browser localStorage
- **Polish UI:** All user-facing text is in Polish

**Immediate setup:**
```bash
npm install && npm run dev  # Starts on port 5173
# Then navigate to http://localhost:5173/public/viewer-osd-v7.html
```

**Most common task:** Edit the single HTML file (either v5 or v7.1) directly. No build step needed for HTML—just refresh browser.

**Critical patterns:**
- ROI coordinates MUST be normalized to 0-1 range (not pixels)
- Two independent drawing modes: Field ROI (for individual fields) and Act ROI (for entire document boundary)
- Form events use delegation on container, not individual inputs (prevent listener duplication)
- localStorage sync is explicit: always call `saveStorage()` after data changes

**If v7.1 has bugs:** Use v5 immediately (localStorage independent, same data format).



## 🎯 Project Overview

**Genealog Indexer v3.2** is a professional genealogical document editing tool for indexing and metadata extraction from historical registry documents with visual Region of Interest (ROI) marking. The project contains **multiple parallel versions** reflecting different architectural iterations.

**Stack:** Vanilla JS + OpenSeadragon (image viewer) + Vite (dev server) + localStorage (persistence)  
**Current:** Monolithic single-file HTML applications (`public/viewer-osd-v7.html` latest, 3083 lines)

### Version Status
- **v7.1** (`viewer-osd-v7.html`): Latest production. Features A-E (Suggestions Fan, Keyboard Shortcuts, Clipboard, OCR, Post-processing). Build: ~3500 lines.
- **v5.0** (`viewer-osd-v5.html`): Stable fallback. Flat record structure, no OCR/image processing. ~2200 lines. Use if v7.1 bugs occur.
- **v6.0** (`viewer-osd-v6.html`): Experimental hierarchical acts, **DO NOT USE** (incomplete ROI implementation, CSV bugs)
- **v4.x**: Legacy, reference only

## 🚀 Quick Start: Developer Workflow

### Running Locally
```bash
npm install          # Install Vite
npm run dev          # Start dev server → http://localhost:5173
npm run build        # Build for production → dist/
```
**Dev Server Note:** Vite auto-opens `/public/viewer-osd-v5.html` by default. To test v7, manually navigate to `http://localhost:5173/public/viewer-osd-v7.html`

### Key Files to Edit
- **`public/viewer-osd-v5.html`** - Main application (current production version)
  - v5: Stable, flat record structure (RECOMMENDED for changes)
  - v4.1: Hierarchy system backup
  - v4: Earlier version (reference only)
- **`public/viewer-osd-v7.html`** - Experimental: OCR + post-processing
- **Versioning strategy:** Before major changes, backup: `cp viewer-osd-v5.html "viewer-osd-v5.html.backup-$(date +%Y%m%d-%H%M%S)"`

### Testing & Debugging Workflow

#### Console Logging Strategy
The app uses emoji prefixes for categorization:
```js
console.log('🔵 Focus: pole aktywne', fieldId);     // User actions
console.log('📑 Act overlay drawn:', recordId);     // Act system
console.log('🎨 ROI START:', { x, y });           // Drawing system
console.log('✅ redrawROIs: narysowano X overlays'); // Success
console.error('❌ Error message');                 // Errors
console.log('💡 Suggestion fan created:', suggestions); // v7.1 new
console.log('⌨️ Keyboard shortcut:', key);         // v7.1 new
console.log('🖼️ OCR result:', extractedText);      // v7.1 new
```

**localStorage Inspection:**
```js
// Check all records:
JSON.parse(localStorage.getItem('genealog_data')).records

// Check specific record's ROIs:
JSON.parse(localStorage.getItem('genealog_data')).records[0].rois

// Verify coordinate normalization (should all be 0-1):
Object.values(record.rois).forEach(roi => {
    console.assert(roi.x >= 0 && roi.x <= 1, 'X out of bounds');
    console.assert(roi.y >= 0 && roi.y <= 1, 'Y out of bounds');
});
```

**ROI Validation Checklist:**
- [ ] `roi.x, roi.y, roi.w, roi.h` all between 0-1
- [ ] `roi.w, roi.h` are positive (not negative)
- [ ] `roi.x + roi.w <= 1` (doesn't exceed image width)
- [ ] `roi.y + roi.h <= 1` (doesn't exceed image height)
- [ ] Canvas pointer-events toggled correctly (none → auto → none)
- [ ] Overlays removed before redrawing (no duplicates)

## � Version Compatibility & Migration Guide

### Which Version to Use?

**Production (Choose One):**
- **v7.1** ← USE THIS for new projects
  - All v7.0 features (OCR, post-processing, adaptive threshold)
  - PLUS v7.1 features A-E (suggestions, keyboard shortcuts, clipboard, enhanced OCR, image pipeline)
  - File: `public/viewer-osd-v7.html`
  - Testing status: ✅ All 5 features implemented (as of Dec 20, 2025)
  
- **v5.0** ← USE THIS for stability
  - Proven stable, no advanced features
  - Flat record structure, basic ROI system
  - No OCR, no image processing
  - File: `public/viewer-osd-v5.html`
  - ~2200 lines, minimal dependencies

**DO NOT USE:**
- **v6.0** (`viewer-osd-v6.html`) - Abandoned hierarchical experiment. Multiple bugs.
- **v4.x** - Legacy only, reference for architecture decisions

### Data Format Compatibility

**v5 ↔ v7.1 (Compatible):**
- Both use flat `app.records[]` array
- Both store ROI as `record.rois[fieldId] = { x, y, w, h }`
- Both save to localStorage under key `genealog_data`
- **Migration:** Export v5 JSON → Import to v7.1 works perfectly
- **Reverse:** Export v7.1 JSON (without processed images) → Import to v5 works

**v6 (Incompatible):**
- Uses `app.acts[]` with hierarchy structure
- ROI stored as `act.rois` and `transaction.rois` (nested)
- CSV export format different
- **Migration required:** Extract v6 data, transform to v5 format, reimport

### Upgrade Path v5 → v7.1

**Recommended for users with production v5 data:**
1. In v5: **Export Data** (CSV + JSON)
2. Close v5 tab
3. Open v7.1 (`http://localhost:5173/public/viewer-osd-v7.html`)
4. **Import JSON** (uses same format)
5. All records/ROIs appear exactly as before
6. Now can use new v7.1 features (suggestions fan, OCR, etc.)
7. If issues, switch back to v5 (localStorage independent)

### Development Workflow by Version

**Working on v5 (bug fixes, small features):**
```bash
# Edit viewer-osd-v5.html directly
# Backup before major changes:
cp public/viewer-osd-v5.html "public/viewer-osd-v5.html.backup-$(date +%Y%m%d-%H%M%S)"
# Test: http://localhost:5173/public/viewer-osd-v5.html
```

**Working on v7.1 (adding features A-E or beyond):**
```bash
# ALWAYS backup v7.1 first (it's large, easy to break)
cp public/viewer-osd-v7.html "public/viewer-osd-v7.html.backup-$(date +%Y%m%d-%H%M%S)"
# Edit viewer-osd-v7.html
# Test: http://localhost:5173/public/viewer-osd-v7.html
# If broken: restore backup, debug in smaller steps
```

**Never edit v6** (it's abandoned). If you need hierarchical acts:
- Consider implementing in v7.1 (would require significant refactor)
- Or document v6's approach in BRAINSTORM.md for future reference



### Data Model
The application uses a flat document model with deep nesting:
- **Global `app` object:** Central state container (viewer instance, records array, current selections)
  - `app.viewer` - OpenSeadragon instance (never null after init)
  - `app.records[]` - All document records (persisted to localStorage)
  - `app.images[]` - Loaded image data (base64 or URLs)
  - `app.roiOverlays[]` - Currently rendered OSD overlay divs (cleared & redrawn constantly)
  - `app.drawingCanvas` - Canvas element for temporary user drawing
  - `app.drawingCtx` - Canvas 2D context
  - `app.roiMode`, `app.actMode` - Boolean flags for drawing modes
  - `app.activeField` - Current form input with focus (used to bind ROI to field)
  - `app.currentRecordId`, `app.currentTemplate`, `app.currentImageIdx` - Selection state

- **Records:** `{ id, template, data{}, rois{}, imageIdx, imageName, timestamp, actROI }`
  - `id` - Unix timestamp (unique enough for this use case)
  - `template` - One of: 'births', 'marriages', 'deaths'
  - `data{}` - Form values keyed by fieldId: `{ 'child_name': 'Jan', 'mother_name': 'Maria' }`
  - `rois{}` - Map of fieldId → ROI. Example: `{ 'child_name': { x: 0.1, y: 0.2, w: 0.3, h: 0.05 } }`
  - `actROI` - Single boundary for entire document (optional, only set if user marks it)
  - `imageIdx` - Index into `app.images[]` (allows filtering records by image)
  - `imageName` - Cached image filename for export/reference

- **ROI Format (CRITICAL):** Normalized coordinates `{ x, y, w, h }` as fraction of image dimensions (0-1 range)
  - `x, y` - Top-left corner as fractions (0.0 = left edge, 1.0 = right edge)
  - `w, h` - Width and height as fractions
  - **Why normalized?** OpenSeadragon can be zoomed/panned/rotated. Normalized coords stay valid regardless of viewport state.

### Core Workflows

#### 1. **Image & Record Management**
- Images stored in `app.images` array with base64 data or URLs
- Each record links to an image via `imageIdx`
- Records automatically filtered by `app.currentImageIdx` when rendering
- localStorage persists: records, images, currentTemplate

#### 2. **ROI (Region of Interest) System** ⭐ CRITICAL
The ROI system has two independent modes:
1. **Field ROI** (`roiMode`): Mark areas for individual form fields
   - Flow: Click field → Ctrl+R → Draw rectangle → Auto-saves to `record.rois[fieldId]`
   - Visual: Orange borders (active), blue borders (other records' ROIs)
   - Validation: Requires active field AND active record before drawing

### ROI Drawing System: Two Independent Modes

#### Mode 1: Field ROI (`app.roiMode`)
**Purpose:** Mark specific fields/areas within an act (child_name, mother_name, etc.)

**Flow:**
```
1. User focuses on a form field (e.g., "child_name")
   → app.activeField is set in setupFormEvents() focusin handler

2. User clicks toggleROI() or presses Ctrl+R
   → Validates: activeField exists AND currentRecordId exists
   → Sets app.roiMode = true
   → Changes canvas.pointerEvents from 'none' → 'auto'
   → Shows status: "ROI dla: child_name"

3. User draws rectangle on image
   → mousedown: Capture start point (app.roiStartX, roiStartY)
   → mousemove: Clear canvas, redraw saved overlays, draw dashed blue rectangle
   → mouseup: Convert coords, save to record.rois[fieldId], set input.classList('has-roi')

4. toggleROI() called again (or user presses Ctrl+R again)
   → Clears app.roiMode, changes canvas.pointerEvents back to 'none'
   → Calls redrawROIs() to refresh display
```

**Storage:**
```js
record.rois = {
  'child_name': { x: 0.5, y: 0.6, w: 0.1, h: 0.05 },
  'mother_name': { x: 0.5, y: 0.75, w: 0.1, h: 0.05 },
  'father_name': { x: 0.5, y: 0.85, w: 0.1, h: 0.05 }
}
```

**Visual Feedback:**
- Field input has green left border: `.form-group input.has-roi`
- Canvas shows live dashed blue rectangle while drawing
- `redrawROIs()` shows blue overlays for current record, lighter colors for other records
- Hover on field → yellow highlight of that field's ROI

#### Mode 2: Act ROI (`app.actMode`)
**Purpose:** Mark the entire document boundary (top-level act outline)

**Flow:**
```
1. User clicks toggleActMode() or presses Ctrl+A
   → Validates: currentRecordId exists (no field check needed)
   → Sets app.actMode = true
   → Changes canvas.pointerEvents from 'none' → 'auto'
   → Shows status: "Rysuj granicę aktu..."

2. User draws rectangle around entire document
   → Same mousedown/mousemove/mouseup as ROI mode
   → But saves to: record.actROI (singular, not rois{})

3. toggleActMode() called again
   → Clears app.actMode, disables drawing
   → Calls redrawROIs() which includes green act overlays
```

**Storage:**
```js
record.actROI = { x: 0.02, y: 0.01, w: 0.96, h: 0.98 }  // Outer boundary
record.rois = { ... }  // Fields inside that boundary
```

**Visual Feedback:**
- Canvas shows live dashed green rectangle while drawing
- `redrawROIs()` shows green overlays with template label (📑 Births)
- Act ROI appears behind field ROIs (lower visual priority, larger areas)

#### Why Two Separate Modes?
1. **Different storage:** One field → many ROIs; one record → one act ROI
2. **Different validation:** Field ROI needs activeField, Act ROI doesn't
3. **Different UI interaction:** Field ROI triggered by form focus, Act ROI by toolbar button
4. **Different visual hierarchy:** Acts are "containers", fields are "contents"
5. **Different use cases:** Acts for document structure, fields for data extraction

#### They Are Independent
- You can have Act ROI without any field ROIs
- You can have field ROIs without Act ROI
- Both can exist on same record simultaneously
- Toggling one doesn't affect the other

#### 3. **Form & Template System**
Three hardcoded templates in `app.templates` array (Births/Marriages/Deaths):
- Each template has `id, name, fields[]`
- Fields have: `id, label, type (text/textarea), required (boolean)`
- Form sections dynamically created with event delegation
- **Key pattern:** Event listeners attached to `#formsContainer`, not individual inputs (prevents duplicates)

### Visual Hierarchy & Canvas System

This is the most complex part - three rendering layers working together:

#### Layer 1: OpenSeadragon Viewer
- **Purpose:** Display large images with zoom/pan/rotate
- **DOM element:** `<div id="viewer">`
- **Handles:** Image loading, viewport transforms, mouse gestures
- **Key API:**
  - `viewer.world.getItemAt(0)` - Get loaded image item
  - `item.getContentSize()` - Image dimensions in pixels
  - `viewer.viewport.pointFromPixel(screenPoint)` - Screen px → viewport coords
  - `item.viewportToImageCoordinates(viewportPoint)` - Viewport → image coords (absolute pixels)
  - `viewer.addOverlay(element, location)` - Add HTML element at image location
  - `viewer.removeOverlay(element)` - Remove overlay

#### Layer 2: Drawing Canvas (Temporary)
- **Purpose:** Show live rectangle while user is drawing ROI/Act
- **DOM element:** `<canvas id="drawingCanvas">`
- **Positioned:** Absolutely over the viewer, same dimensions as viewer container
- **Key property:** `pointer-events: none` by default (OSD handles all clicks)
  - Toggles to `auto` when `toggleROI()` or `toggleActMode()` activates
  - Toggles back to `none` after drawing finishes
- **What it shows:** Dashed blue/green rectangles while user drags mouse
- **Lifecycle:**
  1. `setupDrawingCanvas()` - Create canvas, attach mouse listeners, calculate sizes
  2. `mousedown` → Set `app.drawingROI = true`, capture start coords
  3. `mousemove` → Clear canvas, call `redrawROIs()`, draw dashed rect on top
  4. `mouseup` → Convert screen coords → image coords, save ROI, clear canvas

#### Layer 3: OSD Overlay Divs (Permanent)
- **Purpose:** Display all saved ROI/Act boundaries as colored boxes with labels
- **Rendering:** In `redrawROIs(highlightField?)` function
- **Key details:**
  - Created as DOM divs with CSS classes (`.roi-overlay`, `.act-overlay`)
  - Positioned by OSD using `viewer.addOverlay(element, viewportRect)`
  - OSD automatically scales/rotates them with zoom/pan/rotation
  - Each overlay stored in `app.roiOverlays[]` array
  - **CRITICAL:** Old overlays must be removed before redrawing, or duplicates accumulate
  - `redrawROIs()` is called frequently (on form focus, after drawing, on mouse events)

#### Color Scheme
| Component | Color | Purpose |
|-----------|-------|---------|
| Active field ROI (being drawn) | Blue `#0078d4` | Current user action |
| Act boundary | Green `#10b981` | Entire document outline |
| Highlight on hover | Yellow `#ffb300` | Visual feedback for form hover |
| ROI labels | Black bg, white text | Identify which field |

#### Why This Architecture?
- **Separate layers** prevent OSD from interfering with temporary drawing
- **Canvas for temporary drawing** because OSD overlays don't have "in-progress" state
- **Three coordinate systems** (screen → viewport → image) because OSD applies transforms
- **Frequent redraw** needed because form interactions (focus, hover) change which ROIs are highlighted

#### Performance Consideration
- `redrawROIs()` removes ALL overlays and recreates them
- For images with many ROIs (20+), this could stutter
- **Optimization idea:** Only update changed overlays instead of full rebuild
- **Current workaround:** Typically images have 5-10 records × 5-10 fields = 50 overlays (acceptable)

## � Critical Patterns & Conventions

### Coordinate System: The Three Conversions ⭐ MOST CRITICAL
**You MUST track which coordinate system you're in:**

1. **Screen Coordinates** (canvas pixels): Origin top-left of viewport. Used in mouse events (`e.offsetX`, `e.offsetY`)
2. **Viewport Coordinates** (OSD internal): Handles zoom/pan/rotate transforms. OSD API: `viewer.viewport.pointFromPixel()`
3. **Image Coordinates** (absolute pixels): Origin top-left of file (e.g., 3000×4000 px). OSD API: `item.viewportToImageCoordinates()`
4. **Normalized Coordinates** (0-1 range): **STORAGE FORMAT** for all ROIs. `normalized = imageCoord / imageSize`. Why: Survives zoom/pan/rotate/image reload

**Pipeline (What happens when user draws ROI):**
```
Screen px (100,200)→(400,500) 
  → viewport coords (0.5, 0.6)
    → image coords (1500, 2400) 
      → normalized (0.5, 0.6)
        → stored in record.rois[fieldId]
```

**Common Bugs When Refactoring:**
- ❌ Forgetting to normalize before save → ROI is screen-size dependent
- ❌ Using viewport coords instead of image coords → breaks on zoom
- ❌ Not dividing by image size → saves pixels instead of fractions
- ❌ Not calling `imageToViewportRectangle()` → overlay doesn't follow OSD transforms

### Form Event Delegation Pattern
Events attached to `#formsContainer`, not individual inputs (prevents duplicate listeners on re-render):
```js
setupFormEvents() {
    container.addEventListener('focusin', (e) => {
        if (e.target.classList.contains('field-input')) {
            app.activeField = e.target;
            redrawROIs();
        }
    }, true); // capture phase for early event catching
}
```
**Why:** Inputs are dynamically created; direct listeners would duplicate on every form switch.

### Two Independent ROI Modes
Both can be active simultaneously on same record:
- **Field ROI** (`app.roiMode`): Mark individual fields → saved to `record.rois[fieldId]`
  - Needs `activeField` + `currentRecordId` validation
  - Visual: Blue rectangles, orange when active
- **Act ROI** (`app.actMode`): Mark entire document boundary → saved to `record.actROI`
  - Only needs `currentRecordId` validation
  - Visual: Green rectangles with template label

**Key Design:** Different storage (many rois vs one actROI), different validation, different UI triggers.

### localStorage Persistence Pattern
Always call `saveStorage()` after ANY data change:
```js
record.rois[fieldId] = roi;  // Store changed
saveStorage();               // Persist (must be explicit!)
```
**Why:** Not automatic—localStorage only syncs when explicitly called.

## �📋 Key Functions & Their Roles

### Image & File Handling
- `addImages()` - File picker dialog, converts to base64
- `handleFiles(files)` - Batch process dropped/selected files
- `updateThumbs()` - Render thumbnail bar with image previews
- `selectImage(idx)` - Load image into viewer, refresh ROIs

### Record Lifecycle
- `createNewRecord()` - New record for current image, auto-selects template
- `selectRecord(recordId)` - Load record data into form, highlight in sidebar
- `saveRecord()` - Extract form data → `record.data`, persist to localStorage
- `deleteCurrentRecord()` - Remove record, cleanup ROI overlays
- `renderRecordsSidebar()` - Pill-style selector in left sidebar

### ROI Drawing & Rendering
- `toggleROI()` / `toggleActMode()` - Enable/disable drawing mode, show visual feedback
- `drawROI(x, y, w, h)` - Mouse-down to mouse-up: canvas drawing, then save
- `redrawROIs(highlightField?)` - Render all ROI overlays for current image (OSD-managed)
- `screenToImageROI(x, y, w, h)` - **Critical conversion** function: screen px → normalized image coords
- `zoomToROI(roi)` - Fit viewport to specific ROI area

### Template & Form
- `selectTemplate(templateId)` - Switch active template, show/hide form sections
- `renderForms()` - Generate form HTML for all templates
- `setupFormEvents()` - Attach event handlers (focusin/mouseenter/keydown) with delegation
- `clearForm()` - Reset all inputs in current form section

### Export & Storage
- `exportData()` - Generate CSV + JSON, trigger downloads
- `convertToCSV(records)` - Flatten records to CSV format
- `saveStorage()` / `loadStorage()` - localStorage sync for app state

### Viewer & UI
- `initViewer()` - Initialize OpenSeadragon with configuration
- `setupDrawingCanvas()` - Bind temporary canvas for ROI drawing
- `rotateImage(degrees)` - OSD rotation transformation
- `togglePanel('right'|'thumbs')` - Collapse/expand side panels
- `toggleFullscreen()` - Request fullscreen API

## 🔑 Key Patterns & Conventions

### Coordinate Systems ⭐ MOST CRITICAL
Three coordinate systems work together - **you MUST track which one you're in**:

#### System 1: Screen Coordinates (Canvas Pixels)
- Origin: Top-left of viewport
- Units: Pixels
- Used in: Mouse event handlers (`e.offsetX`, `e.offsetY`)
- Example: User drags from `(100px, 200px)` to `(400px, 500px)` on their screen

#### System 2: Viewport Coordinates (OSD Internal)
- Origin: Top-left of image in OSD coordinate space
- Handles: Zoom, pan, rotation transforms
- Used internally by OpenSeadragon
- **Key OSD API:** `viewer.viewport.pointFromPixel(screenPoint)` converts screen → viewport

#### System 3: Image Coordinates (Absolute Pixels)
- Origin: Top-left of image file
- Units: Pixels (absolute image size)
- Example: 3000×4000 pixel document
- Used by: `item.viewportToImageCoordinates(viewportPoint)` converts viewport → image coords

#### System 4: Normalized Coordinates (0-1 Range)
- Origin: Top-left of image
- Range: 0.0 to 1.0 (fractional)
- **STORAGE FORMAT:** This is what we save to `record.rois[]`
- Conversion: `normalized = imageCoord / imageSize`
- Why: Survives zoom/pan/rotate, survives image reloading, works across different viewport states

### Conversion Pipeline (The Journey of a User's Rectangle)

When user draws a rectangle on the image:

```
1. Mouse event (screen pixels)
   e.offsetX, e.offsetY → (100, 200) to (400, 500)

2. Convert screen → viewport
   viewer.viewport.pointFromPixel()
   → OSD.Point { x: 0.5, y: 0.6 } (approx)

3. Convert viewport → image (absolute pixels)
   item.viewportToImageCoordinates()
   → { x: 1500, y: 2400 } (absolute image pixels)

4. Normalize to 0-1 range
   Divide by image size: { x: 1500/3000, y: 2400/4000 }
   → { x: 0.5, y: 0.6, w: 0.1, h: 0.1 }

5. Save to localStorage
   record.rois['child_name'] = { x: 0.5, y: 0.6, w: 0.1, h: 0.1 }
```

### Reverse Pipeline (Display Saved ROI)

When `redrawROIs()` displays a saved ROI:

```
1. Retrieve normalized coords from storage
   { x: 0.5, y: 0.6, w: 0.1, h: 0.1 }

2. Denormalize to absolute image pixels
   { x: 0.5*3000, y: 0.6*4000, w: 0.1*3000, h: 0.1*4000 }
   → { x: 1500, y: 2400, w: 300, h: 400 }

3. Convert to OSD rectangle
   new OpenSeadragon.Rect(1500, 2400, 300, 400)

4. Convert to viewport rectangle
   viewer.viewport.imageToViewportRectangle()
   → OSD coordinates ready for display

5. Add as overlay with automatic transform
   viewer.addOverlay(divElement, viewportRect)
   → OSD handles zoom/pan/rotate automatically
```

### Why This Matters for Refactoring
- If you change image loading, ensure normalized coords still work
- If you add image rotation/flip, normalized coords survive (but check imageToViewportRectangle)
- If you add import/export, normalize everything before saving
- If you optimize redrawing, remember both pipelines must work perfectly

**Common Bugs When Refactoring:**
- Forgetting to normalize before save → ROI is screen-size dependent
- Using viewport coords instead of image coords → breaks on zoom
- Not dividing by image size → saves pixels instead of fractions
- Not calling `imageToViewportRectangle()` → overlay doesn't follow OSD transforms

### Form Event Delegation Pattern
Form inputs use delegated events on container to avoid re-attaching listeners:
```js
setupFormEvents() {
    newContainer.addEventListener('focusin', (e) => {
        if (e.target.classList.contains('field-input')) { 
            app.activeField = e.target;  // Track which field is focused
            redrawROIs();  // Update visuals
            zoomToROI(...);  // Auto-zoom if ROI exists
        }
    }, true); // true = capture phase for better event flow
    
    newContainer.addEventListener('mouseenter', (e) => {
        if (e.target.classList.contains('field-input')) { 
            redrawROIs(fieldId);  // Highlight only this field's ROI
        }
    }, true);
}
```

**Why this approach?**
- Input elements are dynamically created in `renderForms()` (once per template switch)
- Direct listeners would duplicate on every form re-render
- Event delegation avoids listener cleanup/re-attachment
- Capture phase (`true` param) ensures we catch events before bubbling

**Lifecycle of Form Events:**
1. `setupForms()` → Creates form HTML with 3 templates
2. User loads a record → Form inputs populated via `selectRecord()`
3. User focuses field → `focusin` handler fires → `app.activeField` set → `redrawROIs()` called
4. User hovers field → `mouseenter` handler → `redrawROIs(fieldId)` highlights that ROI
5. User leaves field → `mouseleave` handler → `redrawROIs()` resets
6. User presses Enter → `keydown` handler → Navigate to next field or save record

**Critical: Cloning to Clear Listeners**
```js
setupFormEvents() {
    const formsContainer = document.getElementById('formsContainer');
    // Replace element to clear all previous listeners (cloneNode trick)
    formsContainer.replaceWith(formsContainer.cloneNode(true));
    const newContainer = document.getElementById('formsContainer');
    // Now attach fresh listeners to this clone
    newContainer.addEventListener('focusin', ...);
}
```
This prevents listener duplicates when form is re-rendered.

### Drawing Canvas Mouse Event Handlers

The drawing canvas has three main event handlers that work together:

#### `mousedown` - Start Drawing
```js
app.drawingCanvas.addEventListener('mousedown', (e) => {
    // Validate: Need record AND field for ROI mode
    if (app.roiMode && !app.activeField) {
        notify('❌ Zaznacz pole w formularzu', 'error');
        return;
    }
    
    // Validate: Need record for Act mode
    if (!app.currentRecordId) {
        notify('❌ Utwórz rekord najpierw', 'error');
        return;
    }
    
    // Capture start point
    app.drawingROI = true;
    app.roiStartX = e.offsetX;
    app.roiStartY = e.offsetY;
});
```
**Purpose:** Prevent accidental ROI drawing without proper context.

#### `mousemove` - Draw Live Preview
```js
app.drawingCanvas.addEventListener('mousemove', (e) => {
    if (!app.drawingROI) return;
    
    // Clear previous frame
    app.drawingCtx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw saved overlays (so they stay visible while drawing)
    redrawROIs();
    
    // Draw live preview rectangle
    let x = app.roiStartX;
    let y = app.roiStartY;
    let w = e.offsetX - x;
    let h = e.offsetY - y;
    
    // Handle drawing in any direction
    if (w < 0) { x += w; w = -w; }
    if (h < 0) { y += h; h = -h; }
    
    // Different colors for ROI vs Act mode
    if (app.roiMode) {
        app.drawingCtx.strokeStyle = '#0078d4';  // Blue for field ROI
        app.drawingCtx.fillStyle = 'rgba(0,120,212,0.15)';
    } else if (app.actMode) {
        app.drawingCtx.strokeStyle = '#10b981';  // Green for act
        app.drawingCtx.fillStyle = 'rgba(16,185,129,0.1)';
    }
    
    // Dashed rectangle
    app.drawingCtx.setLineDash([5, 5]);
    app.drawingCtx.strokeRect(x, y, w, h);
    app.drawingCtx.fillRect(x, y, w, h);
    app.drawingCtx.setLineDash([]);
});
```
**Purpose:** Provide real-time visual feedback while user drags.

#### `mouseup` - Save ROI
```js
app.drawingCanvas.addEventListener('mouseup', (e) => {
    if (!app.drawingROI) return;
    app.drawingROI = false;
    
    // Calculate rectangle (normalized to top-left corner)
    let startX = app.roiStartX, startY = app.roiStartY;
    let endX = e.offsetX, endY = e.offsetY;
    let x = Math.min(startX, endX);
    let y = Math.min(startY, endY);
    let w = Math.abs(endX - startX);
    let h = Math.abs(endY - startY);
    
    // Ignore tiny selections (noise)
    if (w < 10 || h < 10) {
        notify('⚠️ Zaznaczenie za małe', 'error');
        return;
    }
    
    // Convert screen coords → image coords → normalize
    const roi = screenToImageRect(x, y, w, h);
    if (!roi) return;
    
    const record = app.records.find(r => r.id === app.currentRecordId);
    if (!record) return;
    
    // Save based on mode
    if (app.roiMode) {
        record.rois[app.activeField.dataset.field] = roi;
        app.activeField.classList.add('has-roi');
        notify(`✅ ROI: ${fieldLabel}`, 'success');
    } else if (app.actMode) {
        record.actROI = roi;
        notify(`✅ Granica aktu zapisana`, 'success');
    }
    
    // Persist and redraw
    saveStorage();
    app.drawingCtx.clearRect(0, 0, canvas.width, canvas.height);
    setTimeout(redrawROIs, 50);  // Small delay for visual smoothness
});
```
**Purpose:** Convert screen drawing to normalized image coordinates and save.

**Key Implementation Details:**
- `screenToImageRect()` handles the complex coordinate conversion
- Both modes use same drawing code, different storage location
- `has-roi` class on input enables green border styling
- `setTimeout(redrawROIs, 50)` ensures smooth transition
- Global `mouseup` handler also registered to handle mouse release outside canvas

### ROI Overlay Rendering System (`redrawROIs`)

This is the heart of the visual feedback system. Called extremely frequently:
- On form focus/blur
- On form hover/leave
- After drawing ROI/Act
- On record selection
- On image selection

**Rendering Pipeline:**
```js
redrawROIs(highlightField = null) {
    // 1. Clean old overlays
    app.roiOverlays.forEach(overlay => viewer.removeOverlay(overlay));
    app.roiOverlays = [];
    
    // 2. Get current image size
    const size = item.getContentSize();  // { x: 3000, y: 4000 }
    
    // 3. Filter records for this image only
    const currentImageRecords = app.records.filter(r => r.imageIdx === app.currentImageIdx);
    
    // 4. Draw ACT overlays (green) for each record
    currentImageRecords.forEach(record => {
        if (!record.actROI) return;
        // Denormalize: 0.5 * 3000 = 1500 pixels
        const imgRect = new OpenSeadragon.Rect(
            record.actROI.x * size.x,
            record.actROI.y * size.y,
            record.actROI.w * size.x,
            record.actROI.h * size.y
        );
        // Convert to viewport coords (handles zoom/pan/rotate)
        const viewportRect = viewer.viewport.imageToViewportRectangle(imgRect);
        
        // Create overlay div with label
        const overlayDiv = document.createElement('div');
        overlayDiv.className = 'act-overlay';
        const label = document.createElement('div');
        label.textContent = `📑 ${templateName}`;
        overlayDiv.appendChild(label);
        
        // Add to viewer (OSD auto-scales it on zoom/pan/rotate)
        viewer.addOverlay({ element: overlayDiv, location: viewportRect });
        app.roiOverlays.push(overlayDiv);
    });
    
    // 5. Draw FIELD ROI overlays (blue) for each field
    currentImageRecords.forEach(record => {
        Object.entries(record.rois).forEach(([fieldId, roi]) => {
            // Skip if not highlighted
            if (highlightField && fieldId !== highlightField) return;
            
            // Same denormalize + convert process
            const imgRect = new OpenSeadragon.Rect(
                roi.x * size.x, roi.y * size.y,
                roi.w * size.x, roi.h * size.y
            );
            const viewportRect = viewer.viewport.imageToViewportRectangle(imgRect);
            
            // Create overlay with labels
            const overlayDiv = document.createElement('div');
            overlayDiv.className = 'roi-overlay';
            
            // Visual states based on current selection
            const isActive = record.id === app.currentRecordId && 
                            app.activeField?.dataset.field === fieldId;
            const isHighlight = fieldId === highlightField;
            
            if (isActive) overlayDiv.classList.add('active');
            else if (isHighlight) overlayDiv.classList.add('highlight');
            
            const label = document.createElement('div');
            label.textContent = fieldId.substring(0, 15);
            overlayDiv.appendChild(label);
            
            viewer.addOverlay({ element: overlayDiv, location: viewportRect });
            app.roiOverlays.push(overlayDiv);
        });
    });
}
```

**Key Design Decisions:**

1. **Full Rebuild vs Incremental Update**
   - Current: Remove ALL overlays, redraw ALL
   - Pro: Simple, guarantees correctness, handles state changes easily
   - Con: Performance hit with 50+ overlays (but acceptable for typical genealogy docs)
   - Future optimization: Track changed overlays, update only those

2. **Filtering by Image**
   - Only renders ROIs for `app.currentImageIdx`
   - Prevents clutter when switching images
   - Must update when user selects different image

3. **Visual State Classes**
   - `.active` - Current field in focus (orange border)
   - `.highlight` - Field under mouse hover (yellow border)
   - Default - Other fields (blue border)
   - Provides instant visual feedback

4. **Highlighting via `highlightField` Parameter**
   - Called with `redrawROIs()` - show all overlays
   - Called with `redrawROIs(fieldId)` - emphasize only one field
   - Used in hover handler to show which ROI corresponds to hovered input

5. **OSD Automatic Transform Handling**
   - `viewer.addOverlay(element, viewportRect)` registers overlay
   - OSD automatically transforms when user zooms/pans/rotates
   - No manual update needed on viewport changes
   - Must use `imageToViewportRectangle()` to ensure correct transform

### Polish UI Conventions
- Dark theme (Twitter/X style): `#0a0a0a` backgrounds, `#ddd` text
- Status indicators with emojis: 🟢 (has ROI), 🔵 (focus), 📑 (act), 🎨 (drawing)
- Notification system: `notify(message, type)` with 3s auto-dismiss
- Button styling: Uppercase labels, icon + text, 6px gaps

## 🎯 Design Decisions & Technical Trade-offs

### Why Single-File Architecture?

**Pros:**
- No build step needed for production (just open HTML in browser)
- localStorage provides simple persistence without backend
- Easy to distribute (single file to copy)
- No module resolution issues

**Cons:**
- Hard to test individual functions
- 1532 lines is getting unwieldy
- No code splitting or lazy loading
- Style & JS tightly coupled with HTML

**For Refactoring:**
If moving to modular structure:
- Use Vite's `import` + `export` (already configured)
- Separate files: `viewer.js`, `roi-system.js`, `forms.js`, `storage.js`, `ui.js`
- Keep HTML as entry point, import all modules
- Still exports to single file for distribution

### Why Canvas + OSD Overlays Together?

**Problem:** OSD overlays can't show "in-progress" drawing state.

**Solution:** Two-layer system:
1. Canvas (temporary): Shows what user is currently drawing (dashed rectangle)
2. OSD overlays (permanent): Shows saved ROIs

**Why not:** WebGL or SVG instead of Canvas?
- Canvas is simpler and faster for this use case
- SVG would require repositioning on every zoom (expensive)
- WebGL overkill for 2D rectangles

**For Refactoring:**
Could optimize by:
- Pre-rendering canvas state as texture (cache between redraws)
- Using RequestAnimationFrame for smooth continuous drawing
- Implementing dirty-rect optimization (only redraw changed areas)

### Why Normalize ROI Coordinates?

**Scenario:** User draws ROI on 4000×6000px document at zoom 200%

Without normalization:
- Save: `{ x: 800, y: 1200, w: 400, h: 300 }` (screen pixels)
- Load same image at zoom 100% → ROI appears in wrong place!

With normalization:
- Save: `{ x: 0.2, y: 0.2, w: 0.1, h: 0.05 }` (fractions)
- Works at any zoom level, any screen size, any rotation

**Side effect:** Browser-independent, works in mobile too.

### Why Form Event Delegation?

**Problem:** Templates create/destroy 5-10 input elements per template switch.

Naive approach (direct listeners):
```js
// BAD: Listener count grows with each re-render
form.querySelectorAll('.field-input').forEach(input => {
    input.addEventListener('focusin', handler);  // Duplicates!
});
```

Solution (delegation):
```js
// GOOD: Single listener on container
container.addEventListener('focusin', (e) => {
    if (e.target.classList.contains('field-input')) handler(e);
});
```

Benefit: Zero listener cleanup, no memory leaks.

### Why Frequent `redrawROIs()` Calls?

**Current:** Called on form focus, hover, blur, record select, image select, after draw

**Why:** Each interaction changes visual state:
- Focus → highlight active field (orange)
- Hover → highlight hovered field (yellow)
- Blur → reset to default colors (blue)
- Record select → show different record's ROIs
- Image select → show only that image's ROIs

**Cost:** O(records × fields) complexity per redraw

**Future Optimization:**
```js
// Instead of full rebuild:
// - Cache overlay DOMs
// - Update only CSS classes
// - Avoid viewer.removeOverlay() → viewer.addOverlay() cycle

function updateROIStyles() {
    app.roiOverlays.forEach(overlay => {
        overlay.classList.remove('active', 'highlight');
        // Recompute based on current state
        if (isActive) overlay.classList.add('active');
        if (isHighlight) overlay.classList.add('highlight');
    });
}
```

## 🧪 Testing Checklist for v7.1 Features

Before committing any changes to v7.1, verify:

### Feature A: Suggestions Fan
- [ ] Load image with 2+ records containing same field values
- [ ] Focus on input field, start typing
- [ ] Wachlarz appears with matching suggestions
- [ ] Click suggestion → value inserted
- [ ] Escape or click outside → wachlarz closes
- [ ] No console errors from `showSuggestionsForField()`

### Feature B: Keyboard Shortcuts
- [ ] Ctrl+S → Record saves (check localStorage)
- [ ] Ctrl+D → Delete confirms, then removes record
- [ ] Ctrl+C → Copies previous act's data to form
- [ ] Ctrl+N → Prompts for count, creates N records
- [ ] ← → → Navigates between records on same image
- [ ] Works cross-platform (test Cmd+S on Mac if possible)

### Feature C: Clipboard
- [ ] Select source record, press Ctrl+C
- [ ] Navigate to different record, press Ctrl+C again
- [ ] Form fields show smart suggestions from clipboard
- [ ] Clipboard persists during session (doesn't clear on image switch)

### Feature D: OCR
- [ ] Click OCR button (if exists) → Processing starts
- [ ] Form fields auto-populate with extracted text
- [ ] Check localStorage quota after first run (~70MB Tesseract added)
- [ ] Second OCR run is faster (WASM cached)
- [ ] Disable OCR toggle to save storage (if implemented)

### Feature E: Post-processing
- [ ] Select preset (e.g., "genealogy-pro")
- [ ] Image appears enhanced (contrast, threshold adjusted)
- [ ] Sliders update values in real-time
- [ ] Switch image → different post-process settings load per image
- [ ] Adaptive threshold slider visible and responsive (0-100)
- [ ] Check `app.postprocessState` has all 12 properties

### Critical Infrastructure
- [ ] localStorage not corrupted after all tests
- [ ] No memory leaks from Tesseract worker
- [ ] Fan doesn't duplicate when form re-renders
- [ ] Overlays (ROI/Act) still work with post-processing active
- [ ] Export CSV/JSON includes all original data (unmodified by features)



### Missing Features (Spotted in Code)
1. **Ctrl+A for Act Mode** - Button exists, but no keyboard shortcut handler
2. **Search functionality** - Input exists (`#searchInput`), but no handler implementation
3. **JSON Import** - Mentioned in README, not implemented yet

### Technical Debt
1. **No input validation** - Form fields accept any value
2. **No duplicate prevention** - Can create multiple records with same data
3. **No undo/redo** - Once saved to localStorage, can't revert
4. **No offline sync** - If editing same file in two tabs, last-write-wins

### Performance Bottlenecks
1. **redrawROIs() is O(n×m)** - Redraws all overlays for all records
2. **localStorage has size limit** - ~5-10MB; large image collections may overflow
3. **Base64 images are inefficient** - 33% larger than binary; consider Blob URLs

## 🚀 Planned for v7.2+ (Wachlarz Ergonomiczny)

### Parabolic Suggestions Fan (v1.5)
See dedicated specification: [WACHLARZ-SPECIFICATION.md](.github/WACHLARZ-SPECIFICATION.md)

**Target improvements over current v7.1 fan:**
- Ergonomic parabolic layout (y = 0.004·dist² with horiz offset 1.7)
- Selection time: <1 second (vs. 2-3 seconds in vertical lists)
- Fitts's Law optimized - items positioned along natural wrist movement trajectory
- 15 items × 36px height = 532px total height (fits in viewport)
- Zero overlap due to constant ΔY = 38px vertical spacing
- Perfect for genealogy workflow: wrist-only movement without arm extension

**Mathematical basis:**
```
y_center_i = startY + i × ΔY        // constant vertical spacing
dist_i = √((y_center_i - startY) / 0.004)  // parabolic curve
x_i = startX - 1.7 × dist_i         // left offset for ergonomic reach
```

**Activation methods:**
1. **v7.1 current:** Click on input field (simple)
2. **v7.2 planned:** Mouse move detection (>100px left, >50px down) for instant popup
3. **v7.2+ future:** Gesture recognition for wrist-movement-only interaction

## � v7.1-Specific Patterns

### Suggestions Fan Architecture
The fan system extends the form focus workflow:
```js
// 1. User focuses input → focusin handler in setupFormEvents()
// 2. Scans app.records for current imageIdx
// 3. Collects all values from record.data[fieldId]
// 4. Filters by current input value (partial matching)
// 5. Creates DOM elements in #suggestionsWachlarz
// 6. Positions as rotating fan, z-index above form
// 7. Click handler: element.addEventListener('click', () => inputEl.value = suggestion; saveRecord())
```

**Performance Note:** With 20+ records on image × 10 fields, fan regeneration can lag. Consider caching suggestions on record load.

### Keyboard Event Delegation
v7.1 adds global keydown handler for shortcuts:
```js
document.addEventListener('keydown', (e) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    if (isCtrl && e.key.toLowerCase() === 's') saveRecord();
    if (isCtrl && e.key.toLowerCase() === 'd') deleteCurrentRecord();
    // etc.
    
    // Arrow keys for record navigation
    if (e.key === 'ArrowLeft') selectRecord(previousRecordId);
    if (e.key === 'ArrowRight') selectRecord(nextRecordId);
});
```

**Platform Consideration:** `metaKey` for Mac, `ctrlKey` for Windows. Both checked to cover cross-platform.

### Extended postprocessState Object (v7.1)
All 12 filter properties must be persisted:
```js
app.postprocessState = {
    // 8 Canvas GPU filters (existed in v7.0)
    levels: 0,                 // 0-100
    autoContrast: false,
    archival: 0,               // 0-100
    descreen: 0,               // 0-100
    sepia: 0,                  // 0-100
    hue: 0,                    // -180 to 180
    saturation: 0,             // -100 to 100
    invert: false,
    
    // 4 NEW OpenCV.js filters (v7.1)
    adaptiveThreshold: 0,      // 0-100 (block size + threshold constant)
    gaussianBlur: 0,           // 0-10 (kernel size)
    medianBlur: 0,             // 0-10 (kernel size)
    histogramEq: false         // boolean
}
```

**Storage:** Persisted per image in `app.images[idx].postprocessState`. Load on image select via `loadPostprocessState()`.

### OCR Caching Strategy
Tesseract WASM is expensive. v7.1 implements:
1. Check if Tesseract already initialized: `if (window.Tesseract) { ... } else { load library }`
2. Reuse worker across multiple invocations (don't recreate on every OCR call)
3. Cache OCR results in `app.ocrCache = { imageIdx_fieldId: "extracted text" }`
4. Show visual progress bar during extraction

**Risk:** Cache invalidation if user re-processes image. Clear `app.ocrCache` on image modification.



### Running Locally
```bash
npm install          # Install Vite
npm run dev          # Start dev server → http://localhost:5173
npm run build        # Build for production → dist/
```

### Dev Server Config (vite.config.js)
```js
server: {
    port: 5173,
    open: '/public/viewer-osd.html'  // Auto-opens on npm run dev
}
```

### Key Files to Edit
- **`public/viewer-osd-v5.html`** - Main application (current production version)
  - v5: Canvas + OSD overlay system (latest)
  - v4.1: Hierarchy system (backup)
  - v4: Earlier version (reference)
- **Versioning strategy:** Before major changes, copy to `viewer-osd-v{N}.html.backup-{date}`

### Testing & Debugging Workflow

#### Console Logging Strategy
The app uses emoji prefixes for log categorization:
```js
console.log('🔵 Focus: pole aktywne', fieldId);     // User actions
console.log('📑 Act overlay drawn:', recordId);     // Act system
console.log('🎨 ROI START:', { x, y });           // Drawing system
console.log('✅ redrawROIs: narysowano X overlays'); // Success
console.error('❌ Error message');                 // Errors
```

#### localStorage Inspection
```js
// Check all records:
JSON.parse(localStorage.getItem('genealog_data')).records

// Check specific record's ROIs:
JSON.parse(localStorage.getItem('genealog_data')).records[0].rois

// Verify coordinate normalization (should all be 0-1):
Object.values(record.rois).forEach(roi => {
    console.assert(roi.x >= 0 && roi.x <= 1, 'X out of bounds');
    console.assert(roi.y >= 0 && roi.y <= 1, 'Y out of bounds');
});
```

#### ROI Validation Checklist
- [ ] `roi.x, roi.y, roi.w, roi.h` all between 0-1
- [ ] `roi.w, roi.h` are positive (not negative)
- [ ] `roi.x + roi.w <= 1` (doesn't exceed image width)
- [ ] `roi.y + roi.h <= 1` (doesn't exceed image height)
- [ ] Canvas pointer-events toggled correctly (none → auto → none)
- [ ] Overlays removed before redrawing (no duplicates)

#### OSD Viewer Debugging
```js
// Check if image loaded:
const item = app.viewer.world.getItemAt(0);
console.log('Image loaded:', !!item);
console.log('Image size:', item.getContentSize());

// Check viewport state:
console.log('Zoom level:', app.viewer.viewport.getZoom());
console.log('Pan position:', app.viewer.viewport.getCenter());
console.log('Rotation:', app.viewer.viewport.getRotation());

// Check overlays:
console.log('Active overlays:', app.roiOverlays.length);
```

## ⚠️ Common Pitfalls & Gotchas

1. **Coordinate Confusion:** Always verify which coordinate system you're in. ROI storage MUST be normalized (0-1).

2. **Canvas Pointer Events:** Drawing canvas has `pointer-events: none` by default; toggles to `auto` in ROI/Act modes. Restore to `none` after drawing.

3. **Overlay Cleanup:** `redrawROIs()` must remove old overlays before adding new ones, or duplicates accumulate.

4. **Form Event Delegation:** Never attach listeners directly to `.field-input` elements; they'll duplicate on re-render. Use container delegation.

5. **localStorage Sync:** Not automatic. Call `saveStorage()` after ANY data change (new record, field update, ROI save).

6. **Template Switching:** Form section visibility is CSS-based (`.form-section.active`). Ensure both template selection AND form visibility update together.

7. **Act vs Field ROI:** Both are independent. Act ROI doesn't prevent field ROIs and vice versa. Don't confuse the two modes.

## 🔄 Typical Enhancement Patterns

### Add New Template
1. Add to `app.templates` array with `id, name, fields[]`
2. Render form in `renderForms()` (already generic)
3. Update `selectTemplate()` logic if special handling needed
4. Update export CSV if template-specific fields

### Enhance ROI Drawing
- Modify `drawROI()` mouseup handler for validation
- Adjust visual feedback in `redrawROIs()` overlays
- Consider impact on `screenToImageROI()` coordinate math

### Add New Data Persistence
1. Include in `saveStorage()` JSON structure
2. Parse back in `loadStorage()`
3. Initialize defaults in `initApp()`

### Improve UI/UX
- Dark theme colors: Update CSS `#0a0a0a`, `#1a1a1a`, `#252525` etc.
- Emoji indicators: Search `notify()` calls and console.log patterns
- Responsive: Media queries already present at bottom of `<style>`

### Implementing Missing Features

#### Ctrl+A for Act Mode
Current: `toggleActMode()` function exists but no keyboard handler
```js
// In setupEvents(), add:
if (e.key === 'a') { e.preventDefault(); toggleActMode(); }
```

#### Search Functionality
Input exists (`#searchInput`) but no implementation:
```js
document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = app.records.filter(record =>
        Object.values(record.data).some(val => 
            val.toString().toLowerCase().includes(query)
        )
    );
    // Highlight/filter records in sidebar
    renderRecordsSidebar(filtered);
});
```

#### JSON Import
Mentioned in README but not coded:
```js
function importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                app.records = data.records || [];
                app.images = data.images || [];
                saveStorage();
                loadStorage();
                notify('✅ Import zakończony', 'success');
            } catch (err) {
                notify('❌ Błąd importu JSON', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}
```

## 🚀 v7.1 New Features (Latest)

### Feature A: Suggestions Fan (Wachlarz Podpowiedzi)
When user types in a field, shows a fan-shaped list of previous values used in other records on the same image.
- **Trigger:** Input event in form field
- **Implementation:** `showSuggestionsForField(inputEl)` scans `record.data[fieldId]` across all records for current image
- **DOM:** `#suggestionsWachlarz` container (position: absolute, z-index: 200)
- **CSS:** Rotating fan animation `@keyframes fanRotate`
- **UX:** Click suggestion → instant insert; Escape → close

**🎯 Current v7.1:** Basic rotating fan list (vertical arrangement with rotation transform)

**📚 For v7.2+:** See [WACHLARZ-SPECIFICATION.md](.github/WACHLARZ-SPECIFICATION.md) for ergonomic parabolic fan specification (v1.5)
- Mathematical model: `y = 0.004 · dist²` with left offset `horiz = 1.7`
- Constant vertical spacing: ΔY = 38px between centers
- 15 items max, 36px height each, 17px bold font
- Fitts's Law optimized: <1 second selection time vs. 2-3s for vertical lists
- Perfect for wrist-only movement without arm (natural genealogy workflow)

### Feature B: Keyboard Shortcuts
| Shortcut | Action | Function |
|----------|--------|----------|
| Ctrl+S | Save record | `saveRecord()` |
| Ctrl+D | Delete record | `deleteCurrentRecord()` (with confirm) |
| Ctrl+C | Duplicate prev | `copyPreviousActEnhanced()` |
| Ctrl+N | Add new record(s) | Prompt user for count |
| ← → | Navigate records | Switch between records on image |

**Implementation:** `setupKeyboardShortcuts()` function, detects Ctrl/Cmd for cross-platform

### Feature C: Clipboard Integration
- Copy/paste record data between acts on same image
- **Function:** `copyPreviousActEnhanced()` - smart copy with field value suggestions
- **Storage:** Temporary clipboard state in `app.clipboard` object

### Feature D: OCR Text Extraction
Enhanced from v7.0. Tesseract.js integration with visual feedback.
- **Trigger:** Button click or keyboard shortcut
- **Function:** `runOCR()` processes current image, auto-fills form fields
- **Warning:** First run downloads ~70MB WASM, subsequent runs cached
- **Performance:** Relatively slow, best for batch processing

### Feature E: Image Post-processing Pipeline
7-step professional enhancement chain:
1. **Canvas GPU Filters** - Brightness, contrast, sepia, etc.
2. **Histogram Equalization** - Expand dynamic range for faded docs
3. **Gaussian Blur** - Denoise
4. **Median Blur** - Remove salt-pepper artifacts
5. **Archival Enhancement** - JavaScript-based improvement
6. **Descreen** - Halftone removal
7. **Adaptive Threshold** - Local per-fragment binarization (most important for OCR)

**Presets:** 9 genealogical presets including `genealogy-pro` (default), `faded-advanced`, `text-extraction`

**State Management:** Extended `postprocessState` object with 12 properties (8 GPU, 4 OpenCV.js)



## 🇵🇱 Language & Localization

- **UI language:** Polish (pl)
- **Field labels & messages:** Polish (see PRZEWODNIK.md for standard terminology)
- **Code comments:** English preferred, but some Polish comments in logic sections are acceptable
- **Hardcoded strings:** Keep Polish in template field labels, English in comments

## 📖 Reference Documentation

- **[PRZEWODNIK.md](PRZEWODNIK.md)** - User manual (Polish, detailed workflow examples)
- **[README.md](README.md)** - Project overview and architecture overview
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and feature details
- **[BRAINSTORM.md](.github/BRAINSTORM.md)** - Design decisions and planned improvements
