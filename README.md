# 🗞️ NeoPress - AI-Powered News Platform

<div align="center">

![NeoPress Banner](https://img.shields.io/badge/NeoPress-AI%20News%20Platform-blue?style=for-the-badge)
[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](YOUR_DEMO_URL_HERE)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)](LICENSE)

A modern, full-stack news platform that leverages AI to generate and manage news articles with real-time analytics and advanced content management capabilities.

[Features](#-features) • [Demo](#-live-demo) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Docs](#-api-endpoints)

</div>

---

## 🚀 Live Demo

### 🌐 Try It Now!

**Frontend URL:** [YOUR_FRONTEND_URL_HERE](YOUR_FRONTEND_URL_HERE)

**Backend API:** [YOUR_BACKEND_URL_HERE](YOUR_BACKEND_URL_HERE)

### 🔐 Demo Admin Access

Want to test the admin dashboard? Use these credentials:

```
📧 Email: demo@neopress.com
🔑 Password: Demo123!
```

**What you can do:**
- ✅ View analytics dashboard
- ✅ Generate AI-powered articles
- ✅ Manage existing articles
- ✅ View real-time statistics
- ✅ Test article generation with Gemini AI
- ✅ Explore the content management system

> **Note:** Demo account has full admin access. Please be respectful and don't delete existing content.

## ✨ Features

### 🤖 AI & Content
- **AI-Powered Article Generation** - Leverage Google Gemini to create high-quality news articles
- **Real-time News Integration** - Fetch latest news from NewsAPI across multiple categories
- **Multi-Region Support** - Tunisia, MENA region, and global news coverage
- **Smart Content Categorization** - Auto-categorize articles by topic

### 📊 Analytics & Insights
- **Advanced Analytics Dashboard** - Track views, engagement, and performance metrics
- **Trending Articles** - Real-time trending content based on user engagement
- **Performance Metrics** - Detailed analytics per article and category
- **Visual Data Representation** - Charts and graphs for easy data interpretation

### 🎨 User Experience
- **Modern Responsive Design** - Beautiful UI that works on all devices
- **Dark Mode Support** - Easy on the eyes, day or night
- **Intuitive Navigation** - Clean, user-friendly interface
- **Fast Loading** - Optimized performance for quick page loads

### 🔒 Security & Performance
- **JWT Authentication** - Secure token-based admin authentication
- **Rate Limiting** - Protect API endpoints from abuse
- **Input Validation** - Comprehensive request validation
- **Security Headers** - Helmet.js for enhanced security
- **Database Optimization** - Indexed queries for faster performance
- **Error Handling** - Graceful error management with detailed logging

### 🛠️ Development
- **RESTful API** - Clean, well-documented API endpoints
- **MongoDB Integration** - Efficient NoSQL database with Mongoose ODM
- **Docker Support** - Easy containerized deployment
- **Modular Architecture** - Clean code structure for easy maintenance

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| ![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react&logoColor=white) | UI Framework |
| ![React Router](https://img.shields.io/badge/React_Router-7.7.1-CA4245?logo=react-router&logoColor=white) | Client-side routing |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white) | Styling framework |
| ![Axios](https://img.shields.io/badge/Axios-1.11.0-5A29E4?logo=axios&logoColor=white) | HTTP client |
| ![Lucide React](https://img.shields.io/badge/Lucide-Icons-orange) | Icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white) | Runtime environment |
| ![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white) | Web framework |
| ![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white) | Database |
| ![Mongoose](https://img.shields.io/badge/Mongoose-8.x-880000) | ODM |
| ![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=json-web-tokens) | Authentication |
| ![Google Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?logo=google&logoColor=white) | AI article generation |
| ![Winston](https://img.shields.io/badge/Winston-Logging-yellow) | Logging system |
| ![Helmet](https://img.shields.io/badge/Helmet-Security-green) | Security middleware |

### DevOps & Tools
- **Docker** - Containerization
- **Render** - Cloud hosting
- **Git & GitHub** - Version control

## 📸 Screenshots

### Homepage - Article Feed
![Homepage](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=NeoPress+Homepage)

### Admin Dashboard
![Dashboard](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Admin+Dashboard)

### AI Article Generation
![AI Generation](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=AI+Article+Generation)

### Analytics View
![Analytics](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Analytics+Dashboard)

> **Note:** Replace these placeholder images with actual screenshots of your application

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- ✅ **Node.js** 18+ ([Download](https://nodejs.org/))
- ✅ **MongoDB** local or [Atlas](https://www.mongodb.com/cloud/atlas)
- ✅ **Git** ([Download](https://git-scm.com/))

And obtain these API keys:

- 🔑 **Google Gemini API Key** - [Get it here](https://makersuite.google.com/app/apikey)
- 🔑 **NewsAPI Key** - [Get it here](https://newsapi.org/register)

---

## 🚀 Installation & Setup

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

## 📊 Project Structure

```
NeoPress/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Context providers
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── index.js          # Server entry point
│   └── package.json
│
├── .github/              # GitHub workflows
├── docker-compose.yml    # Docker configuration
└── README.md            # You are here!
```

---

## 🎯 Use Cases

### For Content Creators
- Generate article ideas using AI
- Quick drafts for breaking news
- Multi-language article support

### For News Organizations
- Automated news aggregation
- Real-time content management
- Performance analytics

### For Developers
- RESTful API for integration
- Webhook support
- Open-source and customizable

---

## 🔄 Roadmap

### v1.1 (Coming Soon)
- [ ] Multi-language support
- [ ] Social media sharing
- [ ] Comment system
- [ ] Article scheduling
- [ ] Email notifications

### v1.2 (Planned)
- [ ] User accounts and profiles
- [ ] Bookmarking system
- [ ] Advanced search filters
- [ ] Mobile app (React Native)
- [ ] RSS feed support

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Contribution Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Be respectful and constructive

---

## � License

This project is licensed under the **ISC License**.

```
Copyright (c) 2025 NeoPress Team

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.
```

---

## 👥 Authors & Contributors

- **Your Name** - *Initial work* - [@YourGitHub](https://github.com/Yosr-Bejaoui)

See also the list of [contributors](https://github.com/Yosr-Bejaoui/NeoPress/contributors) who participated in this project.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for powering article generation
- **NewsAPI** for real-time news data
- **MongoDB** for robust database solution
- **React** team for amazing frontend framework
- **Open Source Community** for inspiration and tools

---

## 📧 Contact & Support

### Having Issues?
- 📖 Check the [Documentation](./DEPLOYMENT_GUIDE.md)
- 🐛 Report bugs via [GitHub Issues](https://github.com/Yosr-Bejaoui/NeoPress/issues)
- 💬 Join discussions on [GitHub Discussions](https://github.com/Yosr-Bejaoui/NeoPress/discussions)

### Connect With Us
- 🌐 Website: [YOUR_WEBSITE](YOUR_WEBSITE)
- 📧 Email: [your.email@example.com](mailto:your.email@example.com)
- 🐦 Twitter: [@YourTwitter](https://twitter.com/YourTwitter)
- 💼 LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

[![GitHub stars](https://img.shields.io/github/stars/Yosr-Bejaoui/NeoPress?style=social)](https://github.com/Yosr-Bejaoui/NeoPress/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Yosr-Bejaoui/NeoPress?style=social)](https://github.com/Yosr-Bejaoui/NeoPress/network/members)

---

<div align="center">

**Made with ❤️ by the NeoPress Team**

[⬆ Back to Top](#-neopress---ai-powered-news-platform)

</div>

