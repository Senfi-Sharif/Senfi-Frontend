# شورای صنفی دانشجویان دانشگاه شریف (Senfi Sharif)

A modern web application for managing student council campaigns and publications at Sharif University of Technology. Built with React, TypeScript, and Docusaurus.

## 🌟 Features

### 🔐 Authentication & Security
- **JWT-based authentication** with secure token management
- **Role-based access control** (Student, Admin, Superadmin, Head)
- **XSS protection** with DOMPurify
- **Content Security Policy** implementation
- **Secure session management** with SecureTokenManager

### 📋 Campaign Management
- **Create campaigns** with rich text descriptions
- **Anonymous and public** campaign types
- **Label-based categorization** (Faculties, Dormitories, University Issues)
- **Campaign signing** with user verification
- **Admin approval workflow** for campaign moderation
- **Campaign status tracking** (Pending, Approved, Rejected)
- **End date management** with automatic closure

### 🔍 Advanced Filtering & Search
- **Multi-criteria filtering** (Status, Labels, Signatures)
- **Real-time search** across campaign content
- **Sorting options** (Most signatures, Deadline, Creation date)
- **Responsive filter interface** optimized for mobile

### 📱 Responsive Design
- **Mobile-first approach** with comprehensive responsive design
- **Touch-friendly interface** with optimized touch targets
- **Progressive Web App** features
- **Cross-browser compatibility**

### 🎨 User Experience
- **Dark/Light theme** toggle with system preference detection
- **Persian (Farsi) language** support with RTL layout
- **Real-time notifications** for user actions
- **Loading states** and error handling
- **Accessibility features** (ARIA labels, keyboard navigation)

### 📊 Analytics & Statistics
- **Campaign statistics** (total signatures, active campaigns)
- **User activity tracking** (signed campaigns, participation)
- **Admin dashboard** with comprehensive metrics

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/senfi-sharif/senfi-sharif.ir.git
cd senfi-sharif.ir

# Install dependencies
npm install
# or
yarn install
```

### Environment Setup

Create a `.env` file in the root directory:

```bash
# API Configuration
REACT_APP_API_BASE=https://api.senfi-sharif.ir

# For local development
# REACT_APP_API_BASE=http://localhost:8000
```

### Development

```bash
# Start development server
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
# Build the application
npm run build
# or
yarn build
```

### Deployment

#### Using Liara (Recommended)
```bash
# Deploy to Liara
npm run deploy
# or
yarn deploy
```

#### Manual Deployment
```bash
# Build the application
npm run build

# Serve the build directory
npm run serve
# or
yarn serve
```

## 🏗️ Project Structure

```
senfi.sharif.ir/
├── src/
│   ├── components/          # React components
│   │   ├── ApprovedCampaigns.tsx
│   │   ├── CampaignCard.tsx
│   │   ├── Header.tsx
│   │   ├── NewCampaignForm.tsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── campaigns.tsx
│   │   ├── profile.tsx
│   │   └── ...
│   ├── api/                # API integration
│   │   └── auth.js
│   ├── contexts/           # React contexts
│   │   └── NotificationContext.tsx
│   ├── utils/              # Utility functions
│   │   └── security.ts
│   ├── css/                # Stylesheets
│   │   ├── custom.css
│   │   └── campaignsStyles.ts
│   └── theme/              # Docusaurus theme
│       └── Layout/
├── static/                 # Static assets
│   ├── img/
│   ├── fonts/
│   └── security-headers.js
├── docs/                   # Documentation
├── docusaurus.config.ts    # Docusaurus configuration
└── package.json
```

## 🔧 Configuration

### Docusaurus Configuration
The main configuration is in `docusaurus.config.ts`:

```typescript
const config: Config = {
  title: 'شورای صنفی دانشجویان',
  url: 'https://senfi-sharif.ir',
  baseUrl: '/',
  customFields: {
    apiUrl: process.env.REACT_APP_API_BASE || 'https://api.senfi-sharif.ir',
  },
  // ... other configuration
};
```

### Security Headers
Security headers are configured in `static/security-headers.js`:

- Content Security Policy (CSP)
- XSS protection
- Clickjacking prevention
- Security monitoring

## 🎯 Key Components

### Authentication System
- **SecureTokenManager**: Handles JWT tokens and user session
- **Auth API**: Backend communication for authentication
- **Role-based routing**: Access control based on user roles

### Campaign System
- **Campaign Creation**: Rich form with validation
- **Campaign Display**: Responsive cards with filtering
- **Campaign Signing**: User interaction with campaigns
- **Admin Moderation**: Approval/rejection workflow

### Notification System
- **Real-time notifications**: Success, error, warning, info
- **Context-based**: Global notification management
- **Auto-dismiss**: Configurable notification duration

## 🛠️ Development Guidelines

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **React Hooks**: Functional components with hooks

### Component Structure
```typescript
interface ComponentProps {
  // Props interface
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    // JSX
  );
};
```

### Styling
- **CSS Modules**: Component-scoped styles
- **CSS Variables**: Theme-aware styling
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme toggle support

## 🔒 Security Features

### Frontend Security
- **Input Sanitization**: DOMPurify for XSS prevention
- **Token Management**: Secure storage and rotation
- **CSP Headers**: Content Security Policy
- **Rate Limiting**: API call throttling

### Authentication Flow
1. User login with Sharif email
2. JWT token generation and storage
3. Token validation on each request
4. Automatic token refresh
5. Secure logout with token cleanup

## 📱 Mobile Optimization

### Responsive Features
- **Flexible Layouts**: CSS Grid and Flexbox
- **Touch Optimization**: Larger touch targets
- **Performance**: Optimized for mobile networks
- **Progressive Enhancement**: Core functionality on all devices

### Mobile Breakpoints
```css
/* Tablet: 768px and below */
@media (max-width: 768px) { }

/* Mobile: 480px and below */
@media (max-width: 480px) { }

/* Small Mobile: 700px and below */
@media (max-width: 700px) { }
```

## 🚀 Deployment

### Production Environment
- **Liara Platform**: Iranian cloud hosting
- **CDN**: Global content delivery
- **SSL**: HTTPS encryption
- **Monitoring**: Performance and error tracking

### Environment Variables
```bash
# Required
REACT_APP_API_BASE=https://api.senfi-sharif.ir

# Optional
NODE_ENV=production
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Review Process
- All changes require review
- Tests must pass
- Code style guidelines must be followed
- Security review for sensitive changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Sharif University of Technology** for supporting the student council
- **Docusaurus** team for the excellent documentation framework
- **React** community for the powerful frontend library
- **All contributors** who have helped improve this project

## 📞 Support

For support and questions:
- **Telegram**: [@sharif_senfi](https://t.me/sharif_senfi)
- **Email**: stu.senfi@sharif.edu
- **Website**: [senfi-sharif.ir](https://senfi-sharif.ir)

---

**Built with ❤️ for the Sharif University student community**
