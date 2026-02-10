# Component Specifications

## ChipSelector Component

### Features Implemented ✓

**1. Open/Close Logic**
- Closed by default
- Opens when user clicks/taps the selector field
- Toggles between open and closed states

**2. Auto-close on Select**
- When a chip is clicked, the selection is made
- Selector automatically closes after selection
- Selected value is displayed in the field

**3. Close on Outside Click**
- Uses `useRef` and `useEffect` to detect clicks outside the component
- Automatically closes when user clicks anywhere outside the selector
- Event listener is properly cleaned up to prevent memory leaks

**4. Chevron Icon Toggle**
- Chevron (▼) rotates 180° when selector is open
- Smooth CSS transition animation
- Visual feedback for open/closed state

**5. Single-Select Only**
- Only one option can be selected at a time
- Previous selection is replaced when new option is chosen
- Selected chip is visually highlighted with different background color

### Visual Feedback

- **Hover effects** on chips (scale up slightly)
- **Active state** on selector field (scale down on click)
- **Slide-down animation** when chips container appears
- **Color changes** to indicate selected state
- **Smooth transitions** for all interactive elements

### Props

```jsx
<ChipSelector
  label="Select Level"           // Placeholder text when nothing selected
  options={['P1', 'P2', 'P3']}  // Array of options to display as chips
  value={selectedValue}          // Currently selected value
  onChange={handleChange}        // Callback when selection changes
  icon="📖"                      // Icon to display in the selector field
/>
```

### Usage Example

```jsx
const [level, setLevel] = useState('')

<ChipSelector
  label="Select Level"
  options={LEVELS}
  value={level}
  onChange={setLevel}
  icon="📖"
/>
```
