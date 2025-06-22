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

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Environment variables**

   Create a `.env.local` file and define `MONGODB_URI` with your MongoDB connection string.

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

## Contributing

We welcome contributions from the community!

1. Fork this repository and create a feature branch.
2. Make your changes following the existing code style.
3. Run `npm run lint` before committing.
4. Open a pull request describing your changes and why they're useful.

Thank you for helping improve the Equipment Booking System.

