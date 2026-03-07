# Interface Design System - Sistema_Facturacion

## Direction And Feel
- Product context: facturacion operativa (admin/POS), enfoque en velocidad y confianza de datos.
- Visual intent: interfaz administrativa clara, semantica y orientada a accion.
- Tone: tecnico-amigable, con señales visuales explicitas para estado y validacion.

## Palette
- Base surface: `#ffffff`
- Secondary surface: `#f8fbff`
- Elevated notice: `#eef5ff`
- Border default: `#dbe2ea`
- Input/control border: `#cbd5e1`
- Text primary: `#0f172a`
- Text secondary: `#475569`
- Success: `#166534`, bg `#dcfce7`, border `#86efac`
- Warning: `#92400e`, bg `#fef3c7`, border `#fcd34d`
- Error: `#b91c1c`

## Depth Strategy
- Borders-first (no heavy shadows).
- Hierarchy by border + subtle background shifts.
- Modal backdrop for elevation: dark overlay with centered card.

## Spacing And Radius
- Base unit: `8px`
- Section gap: `16px`
- Small gap: `6px`
- Card padding: `14px`
- Input/button padding: `8px`
- Radius: `8px` (controls), `10px-12px` (cards/panels).

## Iconography Pattern
- Single icon set: FontAwesome solid.
- Icons are functional, not decorative.
- Required coverage for operational pages:
  - section titles
  - field labels
  - primary/secondary actions
  - status/feedback messages
  - key data rows (sku, price, stock, id)
- Rule: if icon does not add meaning, remove it.

## Validation Pattern (Forms)
- Real-time validation + submit-time validation.
- Field state model: `pending | valid | invalid`.
- Each field shows:
  - status icon
  - short helper/error text
  - semantic color by state
- Frontend validation is preventive; backend remains source of truth.

## Customer Data Rules (Ecuador)
- Cedula:
  - exactly 10 digits
  - province `01..24`
  - third digit `< 6`
  - modulo-10 checksum
- Email: optional, valid format when present.
- Phone: optional, numeric digits only for validation, min 10 digits.

## Search And Empty-State Rules
- Search inputs should use clear domain placeholders.
- Empty hint ("No se encontraron...") only shown when:
  - search term exists
  - filtered list is empty
  - no successful selection just happened
- After create-and-select flow, hide conflicting empty-state hints.

## Page Pattern: Nueva Factura
- Fixed structure:
  - Notice header with operational status chips
  - Customer search + quick create modal
  - Product search and add
  - Invoice detail table (only quantity editable)
  - Summary + submit action
- Keep history/visualization separated in dedicated invoices pages.
