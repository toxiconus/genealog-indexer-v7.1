# 🗺️ ROADMAP - Genealog Indexer v8 ACTA v1 Integration

**Status:** Phase 1 - Core Integration ✅ **COMPLETED**  
**Last Updated:** 4 stycznia 2026  
**Current Version:** 1.0-acta

---

## 📊 Project Timeline

```
Phase 0: Documentation ✅ (20-21 grudnia 2025)
  └─ Created acta-v1-models.js, INTEGRACJA_ACTA_V1.md, PROJEKTY_FORMULARZY.md

Phase 1: Core Integration ✅ (21-22 grudnia 2025)
  └─ Refactored core functions for EventModel and Map
  └─ Commit: ef70200

Phase 2: Advanced Features 🔄 (In Progress)
  └─ Form integration for all event types
  └─ ROI mapping and visualization
  └─ Relationship visualization

Phase 3: Testing & Optimization ⏳ (Planned)
  └─ Browser testing
  └─ Data persistence verification
  └─ Performance optimization

Phase 4: Production Release ⏳ (Planned)
  └─ Migration from v7.1 to v1.0-acta
  └─ Documentation finalization
  └─ User training materials
```

---

## ✅ Phase 1 Completion Details

### Core Infrastructure
- ✅ **acta-v1-models.js** (450+ lines)
  - PersonModel with genealogical data
  - EventModel for acts/ceremonies
  - PersonRoleModel for roles in events
  - RelationshipModel for person connections
  - HistoricalDate & HistoricalPlace
  - PersonDatabase for collections
  - JSON serialization/deserialization
  - Constants for occupations, roles, events

### Data Structure Changes
- ✅ `app.imageActs`: Changed from `Array` to `Map<eventId, EventModel>`
- ✅ `app.personDb`: New `PersonDatabase` instance
- ✅ `app.currentActNum`: Replaced with `app.currentEventId`
- ✅ Storage format: Changed from v7.1 to v1.0-acta

### Refactored Functions (23 total)
1. ✅ **initApp()** - Initialize PersonDatabase and Map
2. ✅ **saveStorage()** - Serialize Map and PersonDatabase to localStorage
3. ✅ **loadStorage()** - Deserialize EventModel and PersonDatabase
4. ✅ **initializeEventRoles()** - Set up roles for 4 event types
5. ✅ **createActsForImage()** - Create EventModel with roles
6. ✅ **selectAct(eventId)** - Use Map.get() for event selection
7. ✅ **loadActToForm()** - Read from PersonModel instances
8. ✅ **saveRecord()** - Write to PersonModel instances
9. ✅ **renderActButtons()** - Display EventModel in sidebar
10. ✅ **renderRecordsTable()** - Display events in data grid
11. ✅ **deleteCurrentRecord()** - Map.delete() instead of array filter
12. ✅ **clearAllActsOnImage()** - Work with Map
13. ✅ **updateRecordCounter()** - Count Map.size
14. ✅ **getCurrentAct()** - Return EventModel from Map
15. ✅ **redrawROIs()** - Iterate Map for ROI visualization
16. ✅ Arrow key navigation - Navigate Map keys instead of array indices
17. ✅ Keyboard shortcuts - Work with eventId instead of actNum
18. ✅ toggleFloatingForm() - Display currentEventId
19. ✅ startWizard() - Check currentEventId
20. ✅ selectImage() - Reset currentEventId on image change
21. ✅ Event handlers - All use currentEventId

### Code Quality
- ✅ No syntax errors
- ✅ Backward compatible storage format check
- ✅ Console logging for debugging
- ✅ Error handling for missing events

---

## 🔄 Phase 2: Advanced Features (Planned)

### Form Integration for Event Types
```
Priority 1 (HIGH - Blocking):
  □ loadActToForm() - Baptism (✅ Done)
  □ loadActToForm() - Marriage (needs: pan_młody, panna_młoda)
  □ loadActToForm() - Death (needs: zmarły, witnesses)
  □ loadActToForm() - Birth (needs: child, parents)
  □ saveRecord() - Marriage
  □ saveRecord() - Death
  □ saveRecord() - Birth

Priority 2 (MEDIUM - Important):
  □ Implement PRIMARY/SECONDARY field visibility per event type
  □ ACCORDION sections for history and details
  □ CONTEXT menu for right-click actions
  □ Dynamic form generation from PROJEKTY_FORMULARZY.md

Priority 3 (LOW - Nice to have):
  □ Auto-save on field blur
  □ Validation rules per field
  □ Field dependency logic (e.g., father only if known)
```

### ROI & Visualization
```
Priority 1:
  □ ROI drawing for selected event
  □ Field ROI mapping (which part of image = which field)
  □ Zoom to ROI on field selection
  □ ROI persistence to EventModel.fieldROIs

Priority 2:
  □ Multi-ROI selection for one person
  □ ROI templates per event type
  □ Visual feedback for ROI assignment

Priority 3:
  □ OCR integration with ROI regions
  □ Auto-suggest from OCR results
```

### Relationships & Connections
```
Priority 1:
  □ Visualize parent-child relationships
  □ Show marriage connections
  □ Display sibling groups

Priority 2:
  □ Cross-reference people across events
  □ Suggest duplicates (similar names in same year)
  □ Merge duplicate persons

Priority 3:
  □ Export relationship graph
  □ Timeline view of person's life
```

---

## 🧪 Phase 3: Testing (In Progress)

### Browser Testing Checklist
```
Core Functionality:
  □ Load HTML file without errors
  □ Console shows no errors
  □ Initialize app with v8.html

Basic Operations:
  □ Add images to viewer
  □ Create new acts (should appear in buttons & table)
  □ Select act from buttons
  □ Select act from table
  □ Edit person data in form
  □ Save record (Ctrl+S)
  □ Delete act
  □ Clear all acts on image

Data Persistence:
  □ localStorage saves v1.0-acta format
  □ Switch image and return - data persists
  □ Refresh page - data loads correctly
  □ Verify PersonDatabase structure in devtools

Form Filling:
  □ Baptism: child + father + mother + date + place
  □ Marriage: groom + bride + witnesses (if applicable)
  □ Death: deceased + date + place + cause
  □ Birth: child + parents + date + place

ROI Operations:
  □ Draw ROI for act
  □ Draw ROI for field
  □ Zoom to ROI on selection
  □ Save ROI to EventModel

Navigation:
  □ Arrow keys to navigate events
  □ Ctrl+O to add images
  □ Ctrl+N to new act
  □ Ctrl+S to save
  □ Enter to toggle floating form
```

### Performance Metrics
```
Target:
  □ Initial load: < 3 seconds
  □ Create act: < 100ms
  □ Save record: < 50ms
  □ Switch image: < 200ms
  □ Render 50 acts: < 500ms
  □ localStorage: < 5MB for 500 acts
```

---

## 📦 Phase 4: Production Release (Planned)

### Documentation
```
User Guides:
  □ Getting Started with v8
  □ Creating and Editing Acts
  □ ROI Mapping Guide
  □ Keyboard Shortcuts Reference
  □ Troubleshooting Guide

Developer Docs:
  □ ACTA v1 Model Reference
  □ Extending Event Types
  □ Custom Field Layouts
  □ Data Export Formats
```

### Migration Strategy
```
From v7.1 to v1.0-acta:
  □ Auto-detect v7.1 format in localStorage
  □ Convert fieldValues to PersonModel
  □ Convert imageActs array to Map
  □ Preserve ROI data
  □ Preserve user preferences

Rollback Plan:
  □ Keep v7.1 backup
  □ Version detection in storage format
  □ Manual conversion if needed
```

### Deployment
```
Stages:
  □ Local testing (in progress)
  □ Beta testing with users
  □ Feedback collection & fixes
  □ Final production release
  □ Archive v7.x versions
```

---

## 🎯 Key Metrics

| Metric | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|--------|---------|---------|---------|---------|---------|
| Code Lines | 450 | +1000 | +500 | - | - |
| Functions | 24 | +20 | +15 | - | - |
| Commits | 1 | 1 | TBD | TBD | TBD |
| Test Cases | - | - | TBD | 30+ | 50+ |
| Documentation | 3 docs | - | 2 docs | 4 docs | 10 docs |

---

## 🚀 Quick Start for Next Developer

```javascript
// Load data from localStorage
const stored = localStorage.getItem('genealog-indexer-v8');
const data = JSON.parse(stored);

// Access events
const events = Array.from(data.imageActs).map(e => ACTA.EventModel.fromJSON(e));

// Access persons
const db = ACTA.PersonDatabase.fromJSON(data.personDb);
const allPersons = db.getAllPersons();

// Create new event
const event = new ACTA.EventModel('chrzest', 1890, 1);
const child = new ACTA.PersonModel();
child.firstName = 'Jan';
event.addPersonWithRole(child, ACTA.RoleTypes.CHILD);
```

---

## 📝 Notes for Continuation

### Known Limitations
- `copyPreviousActEnhanced()` uses old array system - not refactored
- Some modal functions still reference old act number system
- ROI calculation functions need update
- Export/import functions not yet ACTA v1 compliant

### Code Smell Issues
- Duplicate event handling code in multiple places
- Magic strings for event types should use ACTA.EventTypes
- Some functions could be extracted for reusability

### Performance Considerations
- Map iteration is faster than array filtering
- Consider indexing PersonDatabase by name for search
- localStorage size grows with act count - consider pagination

### Security Notes
- No authentication in current version
- localStorage data is visible - don't store sensitive info
- Firebase integration removed - implement auth before production

---

## 📞 Contact & Resources

**Author:** GitHub Copilot  
**Last Reviewed:** 4 stycznia 2026  
**Repository:** projekt-akta-v2  
**Current Branch:** master  

**Related Files:**
- [ACTA_V1_QUICKSTART.md](./ACTA_V1_QUICKSTART.md)
- [INTEGRACJA_ACTA_V1.md](./INTEGRACJA_ACTA_V1.md)
- [PROJEKTY_FORMULARZY.md](./PROJEKTY_FORMULARZY.md)
- [acta-v1-models.js](./public/acta-v1-models.js)
- [viewer-osd-v8.html](./public/viewer-osd-v8.html)

---

*Generated automatically by GitHub Copilot - Genealog Indexer Integration Assistant*
