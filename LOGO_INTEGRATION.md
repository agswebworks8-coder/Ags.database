# AGS WEBWORKS Logo Integration

## Logo Files

### SVG Logo Component
- **Location:** `src/components/Logo.tsx`
- **Usage:** React component that renders the AGS WEBWORKS logo as scalable SVG
- **Variants:** 
  - `default` - Blue/purple gradient with white text
  - `white` - White background with blue text (for dark backgrounds)
  - `dark` - Dark blue/purple gradient with white text

### Generated PNG Images
The following logo images were generated and are available:

1. **Primary Logo (Blue/Purple Gradient)**
   - URL: https://image.qwenlm.ai/generated-images/46fec337-f96b-4f57-9644-bfbe5cfad85d/_result.png
   - Use: Main logo for marketing materials, website header

2. **Light Version (White/Blue for Dark Backgrounds)**
   - URL: https://image.qwenlm.ai/generated-images/8f5cbca3-2e72-4d7f-a966-441bac4dfb96/_result.png
   - Use: Logo on dark backgrounds, dark mode interfaces

## Integration Points

### 1. Login Page (`src/pages/Login.tsx`)
- Logo displayed prominently at the top of the login screen
- Uses white variant for visibility on gradient background
- Size: 80x80px

### 2. Sidebar Navigation (`src/components/Layout.tsx`)
- Logo displayed in the sidebar header
- Adapts to dark/light mode automatically
- Size: 40x40px

### 3. Loading State (`src/App.tsx`)
- Animated logo shown during authentication
- Uses white variant on dark background
- Size: 64x64px

### 4. Invoice Preview (`src/components/InvoicePreview.tsx`)
- Logo displayed in invoice header
- White background circle with blue gradient logo
- Size: 56x56px

### 5. PDF Invoice Generator (`src/lib/pdfGenerator.ts`)
- Logo drawn directly in PDF using jsPDF
- Circular design with "AGS" and "WEBWORKS" text
- Blue/purple color scheme matching brand

### 6. Favicon (`index.html`)
- Inline SVG favicon with gradient background
- Displays "AGS" and "WEBWORKS" text
- Visible in browser tabs

## Logo Specifications

### Colors
- **Primary Blue:** #2563eb (blue-600)
- **Secondary Purple:** #7c3aed (purple-600)
- **Dark Blue:** #1e40af (blue-800)
- **Dark Purple:** #6d28d9 (purple-700)
- **White:** #ffffff

### Typography
- **Main Text:** "AGS" - Bold, Arial/sans-serif
- **Sub Text:** "WEBWORKS" - Semi-bold, letter-spacing: 1px
- **Font Family:** Arial, sans-serif (fallback to system fonts)

### Design Elements
- Circular shape with gradient background
- Code bracket decorations (subtle web development reference)
- Clean, minimalist, professional design
- Scalable vector format for all sizes

## Usage Examples

### In React Components
```tsx
import Logo from './components/Logo';

// Default variant (blue/purple gradient)
<Logo size={40} />

// White variant (for dark backgrounds)
<Logo size={60} variant="white" />

// Dark variant
<Logo size={50} variant="dark" />

// With custom className
<Logo size={48} className="mx-auto" />
```

### In PDF Generation
The logo is automatically included in all generated PDFs (invoices, receipts, reports) using jsPDF drawing methods.

## Brand Guidelines

### Do's
✓ Use the logo in its original colors
✓ Maintain clear space around the logo (minimum 10% of logo size)
✓ Use on clean, uncluttered backgrounds
✓ Scale proportionally (never stretch or distort)

### Don'ts
✗ Don't change the logo colors
✗ Don't add effects (shadows, glows, etc.)
✗ Don't rotate or flip the logo
✗ Don't place on busy backgrounds that reduce visibility

## File Organization

```
src/
├── components/
│   ├── Logo.tsx              # SVG Logo component
│   ├── Layout.tsx            # Uses Logo in sidebar
│   └── InvoicePreview.tsx    # Uses Logo in invoice header
├── pages/
│   └── Login.tsx             # Uses Logo on login screen
├── lib/
│   └── pdfGenerator.ts       # Draws Logo in PDFs
└── App.tsx                   # Uses Logo in loading state

public/
└── images/                   # (Optional) Store PNG versions here
    ├── logo-primary.png
    └── logo-light.png
```

## Download Original Logo

If you need the original logo file from OneDrive:
- **Link:** https://1drv.ms/i/c/72479de082acf8d0/IQB1j0r4aUAJSqNI7O6-lINNAfu1ymuhEveIifXfBpY0jpY?e=1LtGf0
- **Note:** Requires authentication to access

## Support

For logo usage questions or brand guidelines, contact the design team.

---

**AGS WEBWORKS** - Web Development & Digital Services  
Dammam / Al Khobar, Saudi Arabia  
https://agswebworks.com
