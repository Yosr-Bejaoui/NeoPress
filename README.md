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


## Test the Dashboard

Want to explore the admin dashboard? Use these test credentials:

**Admin Login:**
- **Email:** `admin@neopress.com`
- **Password:** `admin123`

Access the dashboard at: https://neopress-n4qq.onrender.com/login


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


## 📄 License

This project is licensed under the ISC License.




