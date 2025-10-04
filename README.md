# HackWave - FinTech Application

A comprehensive FinTech application with gamified learning, expense tracking, and financial management features.

## 🚀 Features

- **🔐 Secure Authentication** - JWT-based authentication with refresh tokens
- **👤 User Management** - Complete user profiles with coins and levels
- **🎮 Gamified Learning** - Interactive games for financial education
- **💰 Expense Tracking** - Smart expense categorization and tracking
- **📊 Dashboard** - Comprehensive financial overview
- **🌐 Multi-language Support** - English, Hindi, and Marathi
- **🎨 Modern UI** - Beautiful, responsive design with dark mode
- **📱 Mobile Responsive** - Works seamlessly on all devices

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens with refresh token rotation
- **UI Components**: Radix UI + Tailwind CSS

## 📁 Project Structure

```
HackWave/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API services
│   │   ├── utils/           # Utility functions
│   │   └── styles/          # CSS styles
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   └── server.ts        # Main server file
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd HackWave
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Update .env with your configuration
# Edit .env file with your MongoDB URI and JWT secrets

# Start MongoDB (if using local instance)
mongod

# Start the backend server
npm run dev
```

The backend will be running on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Start the frontend development server
npm run dev
```

The frontend will be running on `http://localhost:5173`

### 4. Environment Configuration

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hackwave
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRE=30d
CORS_ORIGIN=http://localhost:5173
BCRYPT_ROUNDS=12
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🔧 Development

### Backend Commands
```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
npm test         # Run tests
```

### Frontend Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/logout` | Logout user | Private |
| GET | `/api/auth/me` | Get current user | Private |
| POST | `/api/auth/refresh` | Refresh access token | Public |

### User Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users/profile` | Get user profile | Private |
| PUT | `/api/users/profile` | Update user profile | Private |
| POST | `/api/users/update-coins` | Update user coins | Private |
| POST | `/api/users/complete-quiz` | Complete quiz and update level | Private |
| DELETE | `/api/users/account` | Delete user account | Private |

## 🔒 Security Features

- **Password Hashing**: bcryptjs with configurable rounds
- **JWT Authentication**: Access and refresh token system
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **CORS Protection**: Configurable cross-origin requests
- **Security Headers**: Helmet middleware
- **Input Validation**: Joi schema validation
- **Error Handling**: Secure error responses

## 🎮 Game Features

- **Budget Master**: Learn budgeting skills
- **Debt Destroyer**: Understand debt management
- **SIP Challenge**: Systematic Investment Planning
- **Stock Market Game**: Learn stock trading basics
- **Tax Optimizer**: Tax planning strategies

## 🌐 Multi-language Support

- English (en)
- Hindi (hi)
- Marathi (mr)

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Dark mode support

## 🚀 Deployment

### Backend Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Heroku, AWS, DigitalOcean, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update API URL in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions, please open an issue in the repository.

## 🔄 Version History

- **v1.0.0** - Initial release with authentication and basic features
- **v1.1.0** - Added gamified learning features
- **v1.2.0** - Multi-language support
- **v1.3.0** - Enhanced UI and mobile responsiveness
>>>>>>> 65a5226 (Basic Authentication and Database Setup)
