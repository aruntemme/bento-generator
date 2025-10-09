# Contributing to Bento Grid Generator

First off, thank you for considering contributing to Bento Grid Generator! It's people like you that make this tool great.

## 🌟 Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🎨 Design improvements
- 💻 Submit code changes
- 🧪 Write tests
- 🌍 Translate to other languages

## 🚀 Getting Started

### Setting Up Development Environment

1. **Fork and clone**
   ```bash
   git clone https://github.com/aruntemme/bento-generator.git
   cd bento-gen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-description
   ```

4. **Start developing**
   ```bash
   npm run dev
   ```

## 📋 Pull Request Process

### Before Submitting

1. **Ensure code quality**
   ```bash
   npm run lint          # Check for linting issues
   npm run typecheck     # TypeScript type checking
   npm run build         # Ensure production build works
   ```

2. **Test your changes**
   - Test on multiple screen sizes
   - Test drag and drop functionality
   - Test on mobile devices if applicable
   - Verify no console errors

3. **Update documentation**
   - Update README.md if adding features
   - Add JSDoc comments for new functions
   - Update type definitions if needed

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add undo/redo functionality
fix: resolve mobile drag issue
docs: update installation instructions
style: format code with prettier
refactor: simplify collision detection
perf: optimize card rendering
test: add unit tests for grid utils
chore: update dependencies
```

**Examples:**
```bash
git commit -m "feat: add keyboard shortcuts for card manipulation"
git commit -m "fix: prevent card overlap on edge cases"
git commit -m "docs: add contributing guidelines"
git commit -m "perf: memoize expensive calculations"
```

### Pull Request Template

When creating a PR, please include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Screenshots (if applicable)
Add screenshots to demonstrate changes

## Checklist
- [ ] My code follows the project's code style
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested this on mobile
```

## 🎨 Code Style

### TypeScript

```typescript
// ✅ Good
interface CardProps {
  card: BentoCard;
  onEdit: (card: BentoCard) => void;
}

const BentoCard: React.FC<CardProps> = ({ card, onEdit }) => {
  // Component logic
};

// ❌ Avoid
const BentoCard = (props: any) => {
  // Missing types
};
```

### React Components

```typescript
// ✅ Good - Functional component with hooks
import { useState, useCallback } from 'react';

const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = useState<Type>(initialValue);
  
  const handleClick = useCallback(() => {
    // Handler logic
  }, [dependencies]);
  
  return (
    <div>...</div>
  );
};

export default MyComponent;
```

### Styling

```typescript
// ✅ Good - Use Tailwind classes
<button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
  Click me
</button>

// ❌ Avoid - Inline styles (unless dynamic)
<button style={{ padding: '8px 16px', background: '#111' }}>
  Click me
</button>
```

### File Structure

```
components/
  ├── ComponentName.tsx      # Component file
  └── SubComponent.tsx       # Related component

utils/
  └── utilityName.ts         # Utility functions

types.ts                     # Shared types
```

## 🐛 Reporting Bugs

### Before Reporting

1. Check [existing issues](https://github.com/aruntemme/bento-generator/issues)
2. Try the latest version
3. Check if it's a known browser limitation

### Bug Report Template

```markdown
## Bug Description
A clear and concise description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Drag to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Environment
- Browser: [e.g., Chrome 119]
- OS: [e.g., macOS 14, Windows 11]
- Device: [e.g., Desktop, iPhone 14]
- Screen size: [e.g., 1920x1080]

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem It Solves
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
Other solutions you've thought about

## Mockups/Examples
Visual examples if applicable

## Additional Context
Any other relevant information
```

## 🏗️ Development Guidelines

### Adding New Components

1. Create component in `src/components/`
2. Define TypeScript interfaces
3. Use functional components with hooks
4. Style with Tailwind CSS
5. Add JSDoc comments
6. Export as default

### Modifying Grid Logic

The grid system is in `src/utils/gridUtils.ts`. When modifying:
- Maintain the 12×6 grid structure
- Ensure collision detection works
- Test all card sizes
- Verify edge cases

### Performance Considerations

- Use `React.memo` for expensive components
- Use `useCallback` for event handlers
- Use `useMemo` for expensive calculations
- Avoid unnecessary re-renders
- Use `requestAnimationFrame` for animations

### Accessibility

- Add `aria-label` to icon buttons
- Ensure keyboard navigation works
- Use semantic HTML
- Maintain color contrast ratios
- Test with screen readers if possible

## 🧪 Testing

Currently, testing is manual. Areas to focus on:

### Canvas Operations
- [ ] Add cards of all sizes
- [ ] Drag and drop cards
- [ ] Swap cards of same size
- [ ] Swap cards of different sizes
- [ ] Resize cards
- [ ] Delete cards

### Card Customization
- [ ] Change background colors
- [ ] Add background images
- [ ] Change text content
- [ ] Change text alignment
- [ ] Change border styles
- [ ] Preview updates in real-time

### Save/Load
- [ ] Save layout
- [ ] Load saved layout
- [ ] Export as PNG
- [ ] Export as JSON
- [ ] Import from JSON

### Mobile Testing
- [ ] Touch drag and drop
- [ ] Responsive layout
- [ ] Toolbar dropdown
- [ ] Canvas scrolling
- [ ] Modal interactions

## 📚 Resources

### Learning Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### Project-Specific
- [Grid Calculations](src/utils/gridUtils.ts)
- [Type Definitions](src/types.ts)
- [Drag & Drop Logic](src/components/GridCanvas.tsx)

## 🤔 Questions?

- 💬 [Start a Discussion](https://github.com/aruntemme/bento-generator/discussions)
- 🐛 [Report an Issue](https://github.com/aruntemme/bento-generator/issues)

## 🙏 Recognition

All contributors will be recognized in our README and releases. Thank you for making Bento Grid Generator better!

---

**Happy coding! 🎨**

