# FaithGuard - Community Lost & Found System

A premium, mobile-first Progressive Web App for temple-based lost and found services.

## 🚀 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Smooth animations
- **React Three Fiber** - 3D graphics
- **React Router** - Navigation
- **Lucide React** - Icons

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Design System

### Colors
- Background: `#FFF7ED` (soft cream)
- Primary: `#F59E0B` (warm orange)
- Text Primary: `#1E293B`
- Text Secondary: `#475569`

### Components
- `Button` - Primary, secondary, and ghost variants
- `Card` - Glassmorphism cards with depth
- `Input` - Form inputs with validation states
- `Layout` - Page wrapper with 3D background
- `Background3D` - Ambient 3D temple silhouette

## 📱 Pages

1. **Landing Page** (`/`) - Welcome screen with hero section
2. **Check-In** (`/checkin`) - QR scan or code entry
3. **Lost Items Feed** (`/feed`) - Browse all items
4. **Report Item** (`/report`) - Report lost or found items
5. **Item Detail** (`/item/:id`) - View item and chat
6. **Case Closed** (`/closed`) - Success screen

## 🎯 Features

- ✨ Premium 3D-enhanced UI
- 📱 Mobile-first responsive design
- 🎭 Smooth Framer Motion animations
- 🎨 Consistent design system
- ♿ Accessibility-friendly
- ⚡ Performance optimized

```

## 🎨 3D Background

The app includes a subtle 3D temple silhouette in the background using React Three Fiber. The 3D elements:
- Stay in the background
- Move very slowly
- Are GPU-optimized
- Can be disabled on low-end devices

## 📝 Development

The project uses:
- **Vite** for fast HMR
- **Tailwind CSS** for utility-first styling
- **ESLint** for code quality
- **React Router** for navigation

## 🚀 Deployment

Build the project:
```bash
npm run build
```

The `dist` folder contains the production-ready files.

## 📄 License

MIT
