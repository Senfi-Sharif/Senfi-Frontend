# Environment Setup

## Environment Variables

This project uses environment variables to configure the API base URL for different environments.

### Available Environment Files

- `.env.local` - Development environment (local machine)
- `.env.production` - Production environment

### Configuration

#### Development (Local)
```bash
REACT_APP_API_BASE=http://localhost:8000
```

#### Production
```bash
REACT_APP_API_BASE=https://your-production-api-url.com
```

### How It Works

The application automatically detects the environment and uses the appropriate API base URL:

```javascript
const API_BASE = typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE
  ? process.env.REACT_APP_API_BASE
  : "http://localhost:8000";
```

### Usage

1. **Development**: The app will use `http://localhost:8000` by default
2. **Production**: Set `REACT_APP_API_BASE` in your deployment environment
3. **Custom**: Create `.env.local` for local development overrides

### Files Updated

All API calls now use the `API_BASE` variable instead of hardcoded URLs:

- `src/api/auth.js`
- `src/pages/campaigns.tsx`
- `src/pages/profile.tsx`
- `src/pages/profile-user.tsx`
- `src/pages/profile/[id].tsx`
- `src/components/NewCampaignForm.tsx`

### Benefits

- ✅ Easy environment switching
- ✅ No hardcoded URLs
- ✅ Production-ready configuration
- ✅ Consistent API base across all components 