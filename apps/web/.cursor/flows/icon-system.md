# Icon System Documentation

This guide explains how to work with our enhanced icon system, which provides a flexible and accessible way to use icons throughout the application.

## 1. Icon Types

### Available Icon Sources

- Built-in Icons: Using `lucide-react` package
- Custom Icons: Located in `src/components/icons/`
- Icon Registry: Managed in `src/components/ui/icons.tsx`

### Icon Properties

```typescript
type IconBaseProps = {
  label?: string; // Screen reader label (required for standalone icons)
  className?: string; // Custom classes
  spin?: boolean; // Enable spin animation
};
```

## 2. Icon Variants

### Sizes

```typescript
{
  '2xs': 'size-2',    // 8px
  'xs': 'size-3',     // 12px
  'sm': 'size-4',     // 16px
  'md': 'size-5',     // 20px (default)
  'lg': 'size-6',     // 24px
  'xl': 'size-8',     // 32px
  '2xl': 'size-10',   // 40px
  '3xl': 'size-12',   // 48px
  '4xl': 'size-16',   // 64px
}
```

### Variants

```typescript
{
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  brand: 'text-brand',
  menuItem: 'mr-2 size-5 text-muted-foreground',
  toolbar: 'size-5 text-muted-foreground hover:text-foreground',
  button: 'mr-2 size-4',
  placeholder: 'text-muted-foreground/50'
}
```

### Stroke Weights

```typescript
{
  thin: 'stroke-[1]',
  regular: 'stroke-[1.5]',    // default
  medium: 'stroke-[1.75]',
  bold: 'stroke-[2]',
  black: 'stroke-[2.25]'
}
```

## 3. Creating Icons

### Standard Icon

```typescript
import { createIcon } from '@/components/ui/icon';

export const CustomIcon = createIcon((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    {...props}
  >
    {/* SVG paths */}
  </svg>
));
```

### Colored Brand Icon

```typescript
import { createColoredIcon } from '@/components/ui/icon';

export const BrandIcon = createColoredIcon((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    {...props}
  >
    {/* SVG paths with specific colors */}
  </svg>
));
```

## 4. Using Icons

### Basic Usage

```typescript
import { Icons } from '@/components/ui/icons';

// Default
<Icons.search />

// With variants
<Icons.alert
  size="lg"
  variant="danger"
  weight="bold"
/>

// Accessible standalone icon
<Icons.info
  label="More information"
  variant="info"
/>

// In buttons
<Button icon={<Icons.plus variant="button" />}>
  Add Item
</Button>

// In toolbars
<Icons.edit variant="toolbar" />

// Brand icon (preserves colors)
<Icons.google size="xl" />
```

## 5. Accessibility Guidelines

### Icon Types

1. **Decorative Icons**

   - Used alongside text
   - Should have `aria-hidden="true"`
   - No label required

2. **Standalone Icons**
   - Used without text
   - Must have a label
   - Use either:
     ```typescript
     <Icons.search label="Search" />
     // or
     <Icons.search aria-label="Search" />
     ```

### Best Practices

- Always provide labels for standalone icons
- Use semantic variants for meaning (e.g., `danger` for delete actions)
- Ensure sufficient contrast with backgrounds
- Maintain minimum touch target size (40px) for interactive icons

## 6. Icon Design Guidelines

### SVG Requirements

- Use 24x24 as the base size
- Include proper viewBox
- Use currentColor for theme compatibility
- Keep paths simple and optimized
- Use relative commands in paths

### Optimization Tips

- Remove unnecessary attributes
- Use SVGO for optimization
- Combine paths when possible
- Remove unused elements
- Use relative commands

## 7. Performance Considerations

### Loading

- Icons are tree-shakeable
- Use dynamic imports for rarely used icons
- Consider icon sprites for frequently used icons

### Rendering

- Use appropriate size variants
- Avoid unnecessary animations
- Use weight variants instead of CSS transforms
- Consider using cached instances for repeated icons

## 8. Troubleshooting

Common Issues:

1. Icon size inconsistencies

   - Ensure proper size variant is used
   - Check parent container constraints

2. Color inheritance issues

   - Verify variant is correctly set
   - Check parent text color inheritance

3. Blurry icons
   - Confirm SVG is properly optimized
   - Verify viewBox settings
   - Check if size is scaled properly

## Reference Files

- `src/components/ui/icon.tsx`: Core icon system
- `src/components/ui/icons.tsx`: Icon registry
- `src/components/icons/`: Custom icon components
