# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2025-01-09

### Added
- 🎨 Drag and drop Bento grid builder with 12×6 grid
- 📦 Multiple card sizes: Square (1×1), Wide (2×1), Portrait (1×2), Large (2×2)
- 🎯 Smart card swapping and rearrangement logic
- ✏️ Comprehensive card customization panel
  - Background colors and images
  - Border styles (fill/border-only)
  - Text content with multiple alignments
  - Font size control
  - Text orientation (horizontal/vertical)
- 💾 Save and load layouts to local storage
- 📥 Import/Export layouts as JSON
- 🖼️ Export canvas as high-quality PNG images
- 📱 Fully responsive mobile design
- 🎭 5 pre-built templates (Portfolio, Social Links, Photography, etc.)
- 🔄 Real-time preview for all card edits
- ✨ Custom modal system for all notifications
- ⚡ Performance optimizations
  - React.memo for card components
  - useCallback for event handlers
  - requestAnimationFrame for drag throttling
- 🎨 Modern UI with Tailwind CSS
- 📋 Complete TypeScript support

### Technical Details
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- html2canvas for image export
- LocalStorage for data persistence
- Lucide React for icons

[0.0.1]: https://github.com/aruntemme/bento-generator/releases/tag/v0.0.1

