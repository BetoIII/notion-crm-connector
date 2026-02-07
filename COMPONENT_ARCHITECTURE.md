# Component Architecture

## Message Templates Page

```
MessageTemplatesSection (orchestrator)
├─ Header with icon
├─ TemplateTable
│  ├─ Search bar
│  ├─ Create New Template button (CTA)
│  ├─ Table (wood header + paper body)
│  │  ├─ Name column
│  │  ├─ Content Preview column
│  │  ├─ Variables column (badges)
│  │  └─ Actions column (Edit/Delete)
│  └─ Footer with count
└─ TemplateEditorModal
   ├─ Wood panel header
   ├─ Two-panel layout
   │  ├─ Left: Editor
   │  │  ├─ Template name input
   │  │  ├─ Variable insertion buttons
   │  │  ├─ Content textarea
   │  │  └─ Character counter + progress bar
   │  └─ Right: Live Preview
   │     ├─ Mock contact info card
   │     └─ iMessage bubble preview
   └─ Wood panel footer (Cancel/Save)
```

## Send SMS Page (3-Step Flow)

```
SendSMSFlowStepper (orchestrator)
├─ Header with icon
├─ SMSStepper (progress indicator)
│  └─ Step circles with labels (1, 2, 3)
│
├─ Step 1: Choose Template
│  ├─ Wood panel header
│  ├─ TemplateSelectorCards
│  │  ├─ Search bar
│  │  └─ Template cards grid
│  │     ├─ Icon + Name
│  │     ├─ Content preview
│  │     └─ Variable badges
│  └─ Navigation (Continue →)
│
├─ Step 2: Select Contacts
│  ├─ Wood panel header
│  ├─ Two-column layout
│  │  ├─ Left: ContactSelector
│  │  │  ├─ Database selector
│  │  │  └─ Contact list with checkboxes
│  │  └─ Right: MessagePreviewCarousel
│  │     ├─ Navigation controls
│  │     ├─ Contact info card
│  │     ├─ Warning badges
│  │     └─ iMessage bubble
│  └─ Navigation (← Back | Review & Send →)
│
└─ Step 3: Review & Send
   ├─ Wood panel header
   ├─ Two-column layout
   │  ├─ Left: PromptGeneratorEnhanced
   │  │  ├─ Readiness stats card (wood panel)
   │  │  │  ├─ Ready count (green)
   │  │  │  ├─ Missing data count (amber)
   │  │  │  └─ No phone count (red)
   │  │  ├─ Copy All Messages button
   │  │  ├─ Warning cards
   │  │  └─ Generated prompt preview
   │  └─ Right: MessagePreviewCarousel
   │     └─ (same as Step 2)
   └─ Navigation (← Back | Start New Campaign)
```

## Component Dependencies

### Core UI Components (src/components/ui/)
- Button
- Input
- Label
- Badge
- Dialog (modal)
- Select
- Checkbox
- Tabs
- AlertDialog

### Message Components (src/components/messages/)

**Template Management:**
- `template-table.tsx` - Table view with search
- `template-editor-modal.tsx` - Full-screen editor with preview
- `template-list.tsx` - (Legacy, not used)
- `template-editor.tsx` - (Legacy, not used)

**SMS Sending:**
- `send-sms-flow-stepper.tsx` - Main stepper orchestrator
- `sms-stepper.tsx` - Progress indicator component
- `template-selector-cards.tsx` - Card-based template picker
- `message-preview-carousel.tsx` - Multi-contact preview
- `prompt-generator-enhanced.tsx` - Stats + prompt generation
- `contact-selector.tsx` - Database + contact picker (reused)
- `send-sms-flow.tsx` - (Legacy, not used)
- `prompt-generator.tsx` - (Legacy, not used)
- `message-preview-example.tsx` - (Legacy, not used)

**Section Containers:**
- `message-templates-section.tsx` - Templates page orchestrator

## Data Flow

### Message Templates Page
```
User Action → MessageTemplatesSection
  ↓
  ├─ Click "Create" → Opens TemplateEditorModal (template=null)
  ├─ Click "Edit" → Opens TemplateEditorModal (template=selected)
  ├─ Type in Search → Filters TemplateTable
  ├─ Save Template → API call → Reload templates → Close modal
  └─ Delete Template → Confirmation → API call → Reload templates
```

### Send SMS Page
```
User Action → SendSMSFlowStepper
  ↓
Step 1: Select template from cards → setSelectedTemplate → Enable "Continue"
  ↓
Step 2: Select contacts from ContactSelector → setSelectedContacts → Enable "Review & Send"
  ↓
Step 3: Review stats → Copy prompt → Log messages → Reset flow
```

## State Management

### MessageTemplatesSection
```typescript
const [templates, setTemplates] = useState<MessageTemplate[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [editorOpen, setEditorOpen] = useState(false);
const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
```

### SendSMSFlowStepper
```typescript
const [currentStep, setCurrentStep] = useState(1);
const [templates, setTemplates] = useState<MessageTemplate[]>([]);
const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
const [selectedContacts, setSelectedContacts] = useState<ContactRecord[]>([]);
```

## API Endpoints Used

### Templates
- `GET /api/templates` - List all templates
- `POST /api/templates` - Create new template
- `PUT /api/templates/[id]` - Update template
- `DELETE /api/templates/[id]` - Delete template

### Contacts
- `GET /api/notion/databases` - List available databases
- `GET /api/notion/databases/[id]/records` - Get contacts from database

### Messages
- `POST /api/messages` - Log sent message

## Styling Architecture

### Design Tokens (from globals.css)
```css
--color-wood-dark: 25 35% 25%;      /* Headers, borders */
--color-wood-medium: 28 42% 48%;    /* Backgrounds */
--color-wood-light: 35 55% 68%;     /* Subtle borders */
--color-amber-glow: 38 92% 58%;     /* Primary actions */
--color-cream: 42 28% 88%;          /* Paper backgrounds */
--color-tan: 36 38% 72%;            /* Soft backgrounds */
--color-burnt-orange: 18 78% 52%;   /* Warnings/errors */
--color-olive: 82 28% 45%;          /* Success states */
--color-charcoal: 0 0% 18%;         /* Text */
--color-smoke: 30 8% 25%;           /* Muted text */
```

### Utility Classes
```css
.texture-wood       /* Wood grain pattern */
.texture-paper      /* Paper noise texture */
.texture-shag       /* Carpet pattern */
.card-paper         /* Paper card with shadow */
.glow-amber         /* Amber glow effect */
.text-embossed      /* 3D text shadow */
.border-beveled     /* Beveled border */
.grain-overlay      /* Film grain overlay */
```

### Component Patterns

**Headers (Wood Panel):**
```tsx
<div className="texture-wood border-4 border-wood-dark p-6 rounded">
  <h2 className="text-3xl font-heading font-bold text-cream text-embossed">
    Title
  </h2>
</div>
```

**Content Cards (Paper):**
```tsx
<div className="texture-paper card-paper rounded-lg p-6">
  {/* Content */}
</div>
```

**Primary Buttons (Amber Glow):**
```tsx
<Button className="gap-2 shadow-lg glow-amber font-heading text-base">
  Action
</Button>
```

**Stats Cards:**
```tsx
<div className="texture-wood border-4 border-wood-dark rounded-lg p-8">
  <div className="grid grid-cols-3 gap-6">
    <div className="texture-paper card-paper rounded-lg p-6 text-center">
      <Icon className="h-8 w-8 mx-auto" />
      <p className="text-4xl font-heading font-bold">{count}</p>
      <p className="text-xs font-body uppercase">{label}</p>
    </div>
  </div>
</div>
```

## Responsive Breakpoints

- Mobile: Default (< 640px)
- Tablet: `sm:` (640px+)
- Desktop: `md:` (768px+), `lg:` (1024px+)

### Key Responsive Changes
- Template cards: 1 column → 2 columns (md:grid-cols-2)
- SMS flow: Stacked → 2 columns (lg:grid-cols-2)
- Stepper: Vertical labels on mobile → Horizontal on desktop
- Tables: Scroll on mobile → Full view on desktop
