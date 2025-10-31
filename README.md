# 🎨 Caption Cursor Studio

A modern Next.js application for AI-powered image captioning and tagging. Upload images, generate intelligent descriptions and tags using AI, and manage your image gallery with ease.

## ✨ Features

### 🖼️ Image Management
- **Bulk Upload**: Upload up to 10 images at once (max 8MB each)
- **AI Analysis**: Automatic generation of descriptions and tags using AI
- **Tag Styles**: Choose between Playful, Neutral, or SEO-optimized tags
- **Smart Gallery**: Sort, filter, and search through your images
- **Bulk Operations**: Download, regenerate, or delete multiple images at once

### 🎯 Gallery Features
- **Advanced Search**: Search by filename, description, or tags
- **Flexible Sorting**: Sort by upload date, update date, or filename
- **Pagination**: Customizable items per page (12, 24, 48, or 100)
- **Real-time Editing**: Edit filenames, descriptions, and tags inline
- **Copy to Clipboard**: Quick copy for descriptions and tags

### 🔒 Security
- **Input Validation**: Comprehensive file type and size validation
- **Magic Bytes Checking**: Verify actual file content, not just extensions
- **Rate Limiting**: Client-side rate limiting to prevent abuse
- **Secure File Handling**: Sanitized filenames and secure uploads
- **CSRF Protection**: Token-based CSRF protection for all mutations

### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Large touch targets (44px+) for mobile
- **Adaptive UI**: Components scale and adapt to viewport
- **Compact Mobile**: Efficient space usage on small screens

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd caption-cursor-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

### Testing
```bash
npm test                    # Run all tests
npm run test:watch          # Run tests in watch mode
npm run test:ui             # Open Vitest UI
npm run test:coverage       # Generate coverage report
npm run test:e2e            # Run E2E tests with Playwright
npm run test:e2e:ui         # Run E2E tests with Playwright UI
npm run test:e2e:headed     # Run E2E tests in headed mode
npm run test:e2e:debug      # Debug E2E tests
```

### Playwright
```bash
npm run playwright:install  # Install Playwright browsers
```

## 🏗️ Project Structure

```
caption-cursor-studio/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── upload/            # Upload page
│   ├── components/
│   │   └── ui/                # UI components
│   │       ├── Button.tsx
│   │       ├── BulkUpload.tsx
│   │       ├── Hero.tsx
│   │       ├── MyGallery.tsx
│   │       ├── MyImageCard.tsx
│   │       ├── SearchBar.tsx
│   │       └── ...
│   ├── core/
│   │   └── services/          # Service layer
│   │       ├── container.ts   # DI container
│   │       └── implementations/
│   ├── hooks/                 # Custom React hooks
│   │   ├── useFileUpload.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── api.ts             # API client functions
│   │   ├── contexts.tsx       # React contexts
│   │   ├── secureApiClient.ts # Secure HTTP client
│   │   └── utils/             # Utility functions
│   └── middleware.ts          # Next.js middleware
├── tests/
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # E2E tests
├── public/                    # Static assets
├── .github/
│   └── workflows/             # CI/CD workflows
└── playwright.config.ts       # Playwright config
```

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests**: Component and utility function tests using Vitest
- **Integration Tests**: API client and service integration tests
- **E2E Tests**: End-to-end tests using Playwright
- **Coverage**: Code coverage reporting with v8

Run tests locally:
```bash
npm test                # Run all tests
npm run test:coverage   # Generate coverage report
npm run test:e2e        # Run E2E tests
```

## 🔧 Tech Stack

### Core
- **Next.js 15.5.5** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5.7.3** - Type safety
- **Tailwind CSS 4.1.0** - Utility-first CSS

### Testing
- **Vitest 2.1.9** - Unit and integration testing
- **Playwright 1.49.1** - E2E testing
- **React Testing Library 16.1.0** - Component testing

### Development
- **ESLint 9** - Code linting
- **PostCSS 8.4.49** - CSS processing
- **Turbopack** - Fast bundler for development

## 📐 Architecture

### Layered Architecture
- **Presentation Layer**: React components and pages
- **Business Logic Layer**: Custom hooks and services
- **Data Layer**: API client and data fetching
- **Infrastructure Layer**: Utilities and configurations

### State Management
- **React Context**: Auth and Gallery contexts
- **Local State**: Component-level state with useState
- **Persistent State**: localStorage for user preferences

### Design Patterns
- **Dependency Injection**: Service container for loose coupling
- **Repository Pattern**: Centralized data access
- **Observer Pattern**: Context-based state updates
- **Factory Pattern**: Service instantiation

## 🔐 Security Features

- **Input Validation**: All inputs validated on client and server
- **File Validation**: Magic bytes, MIME type, and extension checks
- **Rate Limiting**: Client-side request throttling
- **CSRF Protection**: Token-based protection for mutations
- **Secure Headers**: CSP, X-Frame-Options, HSTS, etc.
- **Path Traversal Prevention**: Sanitized file paths
- **XSS Prevention**: Output encoding and sanitization

## 🎨 UI/UX Features

### Responsive Breakpoints
- **Mobile**: < 640px (compact, touch-friendly)
- **Tablet**: ≥ 640px (medium spacing)
- **Desktop**: ≥ 1024px (spacious layout)

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **ARIA Labels**: Proper semantic markup
- **Focus Management**: Clear focus indicators
- **Screen Reader Support**: Descriptive labels

### Performance
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Dynamic imports and lazy loading
- **Code Splitting**: Automatic route-based splitting
- **Caching**: API response caching

## 🚢 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy!

### Other Platforms
The project can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Docker containers
- Traditional Node.js hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- All contributors and users of this project

---

Built with ❤️ using Next.js and TypeScript
