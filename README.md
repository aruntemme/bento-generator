# Bento Builder

React + TypeScript app for creating draggable bento-style grids. Drag and drop cards, customize with colors/gradients, export as JSON or PNG.

## Features

### ✅ Implemented
- [x] Drag-and-drop card reordering
- [x] Card sizes: small, medium, large, wide, tall, featured
- [x] Solid colors and gradients
- [x] Custom color picker
- [x] Font size controls (12-48px)
- [x] Text alignment (horizontal/vertical)
- [x] Layout preset: wide (fully supported)
- [x] JSON export/import (for sharing templates with others)
- [x] PNG export (1x, 1.5x, 2x, 3x quality)
- [x] localStorage persistence

### 🔄 In Progress
- [ ] Layout preset: mobile
- [ ] Layout preset: square
- [ ] Mobile Responsiveness

### 📋 Planned
- [ ] Image backgrounds for bento cards
- [ ] PNG images support in bento cards
- [ ] Sharable links for templates
- [ ] Community platform to share templates
- [ ] Advanced bento card styles (beyond solid/gradient)



## Tech Stack

- React 18 + TypeScript
- Vite
- TailwindCSS
- @dnd-kit (drag-and-drop)
- html2canvas + html-to-image (PNG export)
- react-colorful (color picker)
- lucide-react (icons)
- ESLint

## Getting Started

### Prerequisites
- Node.js 18+

### Install
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── BentoGrid.tsx    # Main grid with drag-and-drop
│   ├── BentoCard.tsx    # Individual card component
│   ├── EditModal.tsx    # Card editor modal
│   └── Toolbar.tsx      # Top toolbar controls
├── data/
│   └── sampleCards.ts   # Default cards
├── hooks/
│   └── useLocalStorage.ts # Persistence hook
├── types/
│   └── index.ts         # TypeScript definitions
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## Key Files

- `src/App.tsx` - State management and main logic
- `src/components/BentoGrid.tsx` - Drag-and-drop grid implementation
- `src/components/EditModal.tsx` - Card editing interface
- `src/types/index.ts` - TypeScript interfaces
- `src/hooks/useLocalStorage.ts` - Data persistence

## Contributing

1. Fork and clone
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit PR

## License

MIT
