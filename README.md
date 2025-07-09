# Equipment Booking System

This project is a web application for managing laboratory equipment reservations. It is built with **Next.js** and **React 19** using TypeScript, Tailwind CSS and MongoDB via Mongoose.

## Features

- User registration and login with email verification
- Browse available equipment with images and categories
- Request bookings and track their status
- Admin pages to assign equipment and approve requests
- Reusable UI components powered by [shadcn/ui](https://ui.shadcn.com)

## Project Structure

```text
.
├── app/                # Next.js app router and pages
│   ├── api/            # REST API endpoints
│   ├── admin/          # Admin dashboards
│   ├── booking/        # Booking workflows
│   ├── equipment/      # Equipment listing pages
│   └── ...             # other feature pages (login, register, etc.)
├── components/         # Shared React components
│   └── ui/             # shadcn/ui primitives
├── hooks/              # Custom React hooks
├── lib/                # Utilities such as database connection
├── models/             # Mongoose schemas
├── public/             # Static assets
├── scripts/            # Helper scripts (e.g. seeding data)
├── styles/             # Global styles
├── next.config.mjs     # Next.js configuration
└── package.json        # npm scripts and dependencies
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/equipment-booking
# or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/equipment-booking

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here

# SMTP Configuration for Email Verification
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application URL (for CORS and redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional Variables
```env
# Node Environment
NODE_ENV=development

# API Base URL (if different from app URL)
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Rate Limiting (requests per window)
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_WINDOW_MS=900000

# File Upload Limits
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

### Security Notes
- **JWT_SECRET**: Use a strong, random string (at least 32 characters)
- **SMTP_PASS**: Use app-specific passwords, not your regular email password
- **MONGODB_URI**: Never commit database credentials to version control
- **NEXT_PUBLIC_APP_URL**: Set to your production domain in production

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Environment variables**

   Create a `.env` file and define the required environment variables (see above).

3. **Run the development server**

   ```bash
   npm run dev
   ```

   The site will be available at <http://localhost:3000>.

4. **Seed sample equipment (optional)**

   ```bash
   npm run add-data
   ```

   This script populates the database with initial equipment records.

## Security Features

This application includes several security measures:

### Authentication & Authorization
- JWT-based authentication with HTTP-only cookies
- Role-based access control (User, Admin, Super-admin)
- Email verification for new registrations
- Password hashing with bcrypt

### Input Validation & Sanitization
- Comprehensive input validation using Zod schemas
- XSS protection through input sanitization
- SQL injection prevention via parameterized queries
- File upload validation and type checking

### Rate Limiting & Protection
- Rate limiting on authentication endpoints
- CORS protection with origin validation
- Brute force attack prevention
- Request throttling

### Data Protection
- Sensitive data encryption
- Secure session management
- CSRF protection (recommended implementation)
- Environment variable security

## Security Recommendations

### For Production Deployment
1. **Use HTTPS**: Always deploy with SSL/TLS encryption
2. **Environment Variables**: Store secrets securely (use Vercel, AWS Secrets Manager, etc.)
3. **Database Security**: Use MongoDB Atlas or secure your MongoDB instance
4. **Rate Limiting**: Implement Redis-based rate limiting for production
5. **Monitoring**: Set up logging and monitoring for security events
6. **Backup**: Regular database backups with encryption
7. **Updates**: Keep dependencies updated for security patches

### Additional Security Measures
1. **Two-Factor Authentication**: Consider implementing 2FA for admin accounts
2. **Audit Logging**: Log all admin actions and sensitive operations
3. **IP Whitelisting**: Restrict admin access to specific IP ranges
4. **Session Management**: Implement proper session invalidation
5. **Content Security Policy**: Add CSP headers to prevent XSS attacks

## Contributing

We welcome contributions from the community!

1. Fork this repository and create a feature branch.
2. Make your changes following the existing code style.
3. Run `npm run lint` before committing.
4. Open a pull request describing your changes and why they're useful.

### Security Contributions
If you find a security vulnerability, please:
1. **DO NOT** create a public issue
2. Email the maintainers directly with details
3. Allow time for the issue to be addressed before public disclosure

Thank you for helping improve the Equipment Booking System.

