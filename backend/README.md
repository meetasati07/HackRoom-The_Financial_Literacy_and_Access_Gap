# HackWave Backend API

A robust Node.js backend API for the HackWave FinTech application with authentication, user management, and database integration.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👤 **User Management** - Complete user registration, login, and profile management
- 🗄️ **MongoDB Integration** - Scalable database with Mongoose ODM
- 🛡️ **Security** - Password hashing, rate limiting, CORS protection
- ✅ **Validation** - Request validation with Joi
- 🚀 **TypeScript** - Full type safety and better development experience
- 📊 **Error Handling** - Comprehensive error handling and logging

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Programming language
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Joi** - Data validation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackwave/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
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

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/logout` | Logout user | Private |
| GET | `/api/auth/me` | Get current user | Private |
| POST | `/api/auth/refresh` | Refresh access token | Public |

### User Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users/profile` | Get user profile | Private |
| PUT | `/api/users/profile` | Update user profile | Private |
| POST | `/api/users/update-coins` | Update user coins | Private |
| POST | `/api/users/complete-quiz` | Complete quiz and update level | Private |
| DELETE | `/api/users/account` | Delete user account | Private |

### Health Check

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/health` | API health status | Public |

## API Usage Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "mobile": "9876543210",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "9876543210",
    "password": "password123"
  }'
```

### Get User Profile (with token)
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema

### User Model
```typescript
{
  name: string;           // User's full name
  mobile: string;         // 10-digit mobile number (unique)
  email: string;          // Email address (unique)
  password: string;        // Hashed password
  coins: number;          // User's coins (default: 0)
  level: string;          // User level (Beginner, Intermediate, Advanced, Expert)
  completedQuiz: boolean; // Quiz completion status
  refreshTokens: string[]; // Array of refresh tokens
  createdAt: Date;        // Creation timestamp
  updatedAt: Date;        // Last update timestamp
}
```

## Security Features

- **Password Hashing** - bcryptjs with configurable rounds
- **JWT Tokens** - Access and refresh token system
- **Rate Limiting** - Prevents abuse and DDoS attacks
- **CORS Protection** - Configurable cross-origin requests
- **Helmet** - Security headers
- **Input Validation** - Joi schema validation
- **Error Handling** - Secure error responses

## Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests

### Project Structure
```
src/
├── config/
│   └── database.ts      # Database configuration
├── middleware/
│   ├── auth.ts          # Authentication middleware
│   ├── errorHandler.ts  # Error handling
│   └── validation.ts    # Request validation
├── models/
│   └── User.ts          # User model
├── routes/
│   ├── auth.ts          # Authentication routes
│   └── user.ts          # User management routes
└── server.ts            # Main server file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/hackwave |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_REFRESH_EXPIRE` | Refresh token expiration | 30d |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
