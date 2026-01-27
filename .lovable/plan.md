

# Digital Signage Builder - Implementation Plan

## Overview
A visual drag-and-drop digital signage editor with live preview and shareable player links. Clean, minimal interface designed for ease of use.

---

## 🖥️ Core Layout

### Three-Panel Interface
- **Left Sidebar** - Media library with draggable elements (images, video, text, slideshows, tickers)
- **Center Canvas** - The main design area where users build their signage
- **Right Panel** - Live preview showing exactly how the signage will appear on displays

---

## 📐 Ratio & Canvas System

### Ratio Selection Bar (Top)
- Quick-select buttons: 16:9 (Landscape TV), 9:16 (Portrait), 1:1 (Square)
- Custom ratio input option
- Canvas and preview resize instantly when ratio changes

### Canvas Behavior
- Grid-aware design surface
- Drag elements freely within canvas boundaries
- Resize handles on each element
- Elements stay proportional when ratio changes

---

## 🎨 Draggable Elements

### From Left Sidebar
1. **Single Image** - Upload from device or paste URL
2. **Image Slideshow** - Multiple images with transition timing
3. **Video** - Upload or embed YouTube/Vimeo
4. **Scrollable Ticker** - Horizontal scrolling text
5. **Text Overlay** - Static text with fonts, colors, sizing

### Element Controls
- Drag to position anywhere on canvas
- Resize via corner/edge handles
- Delete, duplicate, layer ordering (bring to front/back)
- Property panel for detailed settings

---

## 📚 Starter Templates

### Pre-built Layouts
- Welcome screen (image + text)
- Menu board (text-heavy layout)
- Promotion display (image slideshow + ticker)
- Video with overlay text
- Portrait social media style

Users can start from a template or blank canvas.

---

## 👀 Live Preview

### Real-time Sync
- Shows exact output as it will appear on display
- Updates instantly with every canvas change
- Respects selected ratio
- Plays slideshows and tickers in real-time

---

## 💾 Save & Publish Flow

### Save Project
- Stores: ratio, layout, element positions/sizes, content
- Projects saved with auto-generated names (editable)

### Publish
- Generates unique public URL (e.g., `yourapp.lovable.app/player/abc123`)
- Public link displays:
  - Fullscreen signage
  - Correct ratio maintained
  - All animations/slideshows playing
  - Ready for Smart TV, Kiosk, or browser

---

## 🎯 Design Style

### Light/Clean Interface
- Crisp white backgrounds with subtle shadows
- Clear visual hierarchy
- Intuitive icons and labels
- Comfortable spacing for drag-and-drop

---

## 🔧 Technical Notes

This will require **Lovable Cloud** for:
- Storing signage layouts (database)
- File storage for uploaded images/videos
- Generating public player URLs

Authentication can be added later when you're ready for multi-user support.

---

## 📱 Screens Summary

1. **Editor Page** - Main 3-panel layout for building signage
2. **Player Page** - Public fullscreen display of published signage

