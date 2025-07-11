# URL Shortener Application

A full-stack URL shortener application with a Node.js/Express backend microservice and React frontend, featuring comprehensive logging, analytics tracking, and a modern Material UI interface.

## 🚀 Features

### Backend Microservice
- **Express.js API** with TypeScript
- **In-memory storage** (no external database required)
- **Comprehensive logging** middleware
- **URL validation** and shortcode generation
- **Click analytics** tracking with mock location/source data
- **Automatic cleanup** of expired URLs
- **Rate limiting** and security middleware

### Frontend Application
- **React 18** with TypeScript and Vite
- **Material UI** for modern, responsive design
- **React Router** for navigation
- **Real-time form validation**
- **Copy-to-clipboard** functionality
- **Detailed analytics** dashboard
- **Mobile-responsive** design

## 📋 API Endpoints

### POST /shorturls
Creates a new short URL
```json
{
  "url": "https://example.com",
  "validity": 30,
  "shortcode": "optional"
}
```

### GET /shorturls/:code
Retrieves URL data and analytics
```json
{
  "originalUrl": "https://example.com",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-01T00:30:00.000Z",
  "clicks": [
    {
      "timestamp": "2024-01-01T00:15:00.000Z",
      "source": "direct",
      "location": "US"
    }
  ]
}
```

### GET /:code
Redirects to original URL and tracks click

### GET /stats
Returns all URLs and statistics

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start

1. **Install dependencies**
```bash
npm run install:all
```

2. **Start both applications**
```bash
npm run dev
```

This will start:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

### Manual Setup

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🏗️ Architecture

### Backend Structure
```
backend/
├── src/
│   ├── middleware/
│   │   └── logger.ts          # Logging middleware
│   ├── services/
│   │   └── urlShortener.ts    # Core business logic
│   ├── routes/
│   │   └── urlRoutes.ts       # API routes
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── index.ts               # Express server
├── package.json
└── tsconfig.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   └── Navigation.tsx     # App navigation
│   ├── pages/
│   │   ├── ShortenerPage.tsx  # URL shortening form
│   │   └── StatsPage.tsx      # Analytics dashboard
│   ├── services/
│   │   └── api.ts             # API service
│   ├── utils/
│   │   └── logger.ts          # Frontend logging
│   ├── App.tsx                # Main app component
│   └── main.tsx               # Entry point
├── package.json
└── vite.config.ts
```

## 🔧 Configuration

### Environment Variables
- `PORT` (Backend): Server port (default: 8000)
- `NODE_ENV`: Environment mode (development/production)

### API Configuration
- Base URL: http://localhost:8000
- CORS: Enabled for frontend origin
- Rate Limiting: 100 requests per 15 minutes

## 📊 Logging

### Backend Logging
- Request/response logging
- Error tracking with context
- Click analytics logging
- Cleanup operations logging

### Frontend Logging
- User interactions
- API call successes/failures
- Navigation events
- Form submissions

## 🎨 UI/UX Features

### Design Principles
- **Material Design** guidelines
- **Responsive** layout for all devices
- **Accessible** components
- **Intuitive** navigation
- **Clear** user feedback

### Key Components
- **Form validation** with real-time feedback
- **Loading states** for better UX
- **Error handling** with user-friendly messages
- **Copy functionality** with success indicators
- **Analytics dashboard** with detailed metrics

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm run lint
```

## 🚀 Deployment

### Backend Deployment
```bash
cd backend
npm run build
npm start
```

### Frontend Deployment
```bash
cd frontend
npm run build
```

## 📈 Performance

### Backend Optimizations
- In-memory storage for fast access
- Automatic cleanup of expired URLs
- Rate limiting to prevent abuse
- Efficient shortcode generation

### Frontend Optimizations
- Vite for fast development and building
- Code splitting with React Router
- Optimized Material UI components
- Efficient state management

## 🔒 Security

### Backend Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation
- Error handling without sensitive data exposure

### Frontend Security
- HTTPS enforcement in production
- Input sanitization
- XSS prevention
- Secure API communication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

---

**Built with ❤️ using Express.js, React, TypeScript, and Material UI** 