# NeoPress - AI-Powered News Platform

A modern, full-stack news platform that leverages AI to generate and manage news articles with real-time analytics and content management capabilities.

## Features

- **AI-Powered Article Generation** using Google Gemini
- **Real-time News Integration** with NewsAPI
- **Advanced Analytics Dashboard** with engagement metrics
- **Content Management System** for editors and admins
- **Responsive Design** with modern UI/UX
- **Secure Authentication** with JWT tokens
- **Rate Limiting** and security middleware
- **Database Optimization** with proper indexing
- **Docker Support** for easy deployment

## Tech Stack

### Frontend
- React 19.1.1
- Tailwind CSS
- Lucide React Icons
- Axios for API calls

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- Google Gemini AI
- Winston Logging
- Express Rate Limiting
- Helmet Security

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API Key
- NewsAPI Key

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd NeoPress
```

### 2. Install Dependencies
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 3. Environment Setup

#### Server Environment
Create `server/.env`:
```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/neopress
JWT_SECRET=your-super-secure-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
NEWSAPI_API_KEY=your-newsapi-key
CORS_ORIGIN=http://localhost:3000
# Admin credentials for initial setup (optional - can use CLI flags instead)
DEFAULT_ADMIN_NAME=Admin User
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DEFAULT_ADMIN_PASSWORD=your-secure-admin-password
```

#### Client Environment
Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_NAME=NeoPress
```

### 4. Database Setup
```bash
cd server
node setup-mongo.js

# Create admin user (choose one method):
# Method 1: Using CLI flags (recommended for production)
node seed-admin.js --name "Admin User" --email admin@yourdomain.com --password "YourSecurePassword123!"

# Method 2: Using environment variables (set in .env file)
node seed-admin.js

# Method 3: Force update existing admin password
node seed-admin.js --email admin@yourdomain.com --password "NewSecurePassword123!" --force
```

### 5. Start Development Servers
```bash
# Start server (Terminal 1)
cd server
npm run dev

# Start client (Terminal 2)
cd client
npm start
```

Visit `http://localhost:3000` to see the application.

## Docker Deployment

### Using Docker Compose
```bash
# Copy environment file
cp server/env.example .env
# Edit .env with your production values

# Build and start
docker-compose up -d

# Create admin user (choose one method):
# Method 1: Using CLI flags (recommended)
docker-compose exec neopress node seed-admin.js --name "Admin User" --email admin@yourdomain.com --password "SecurePassword123!"

# Method 2: Using environment variables (set DEFAULT_ADMIN_* in .env)
docker-compose exec neopress node seed-admin.js
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user

### Articles
- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get article by ID
- `POST /api/articles` - Create article (Auth required)
- `PUT /api/articles/:id` - Update article (Auth required)
- `DELETE /api/articles/:id` - Delete article (Auth required)
- `POST /api/articles/generate` - Generate AI article (Auth required)

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/trending` - Trending articles
- `GET /api/analytics/articles/:id` - Article analytics

### Health
- `GET /health` - Health check endpoint

## Development

### Available Scripts

#### Server
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run setup:db   # Setup MongoDB connection
npm run seed:admin # Create admin user
npm run logs       # View application logs
```

#### Client
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

## Security Features

- **JWT Authentication** with secure token handling
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **Input Validation** with express-validator
- **Security Headers** with Helmet
- **Error Handling** with proper logging
- **SQL Injection Protection** with Mongoose

## Performance Optimizations

- **Database Indexing** for faster queries
- **Connection Pooling** for MongoDB
- **Gzip Compression** for responses
- **Static Asset Caching**
- **Request Size Limits**
- **Graceful Shutdown** handling

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

### Key Production Considerations
- Use environment variables for all secrets
- Enable HTTPS with SSL certificates
- Set up proper logging and monitoring
- Configure database backups
- Use a reverse proxy (Nginx)
- Set up health checks and monitoring

## 📝 Environment Variables

### Server (.env)
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://localhost:27017/neopress
JWT_SECRET=your-super-secure-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
NEWSAPI_API_KEY=your-newsapi-key
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info

# Admin credentials for initial setup (optional - recommended to use CLI flags instead)
DEFAULT_ADMIN_NAME=Admin User
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DEFAULT_ADMIN_PASSWORD=your-super-secure-admin-password
```

### Client (.env)
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_NAME=NeoPress
REACT_APP_VERSION=1.0.0
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Review the logs for error details
- Check GitHub issues
- Contact the development team

## 🔄 Changelog

### v1.0.0
- Initial release
- AI-powered article generation
- Real-time news integration
- Analytics dashboard
- Content management system
- Security and performance optimizations

