# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Penguin Auto Repair is a full-stack web application for an auto repair shop. It features a React frontend with mobile-focused UI and an Express backend API with PostgreSQL database. The app includes both customer-facing appointment booking and manager-facing appointment management with automatic technician assignment.

**Tech Stack:**
- Backend: Node.js + Express
- Database: PostgreSQL (via `pg`)
- Frontend: React 18 + React Router v6
- Authentication: bcrypt/bcryptjs for password hashing
- API Communication: Axios
- Styling: CSS3 with CSS variables and shared stylesheets

## Development Commands

### Running the application

```bash
# Development mode (runs both server and client concurrently)
npm run dev

# Server only (with nodemon hot reload)
npm run server

# Client only
npm run client

# Production build
npm run build

# Production start
npm start
```

### Client-specific commands

```bash
cd client
npm start      # Development server
npm run build  # Production build
npm test       # Run tests
```

## Architecture

### Backend Architecture (server.js)

The backend is a monolithic Express server that handles:

1. **Database Connection**: PostgreSQL pool configuration with SSL support for production (Render deployment)
2. **Authentication Endpoints**:
   - `/api/auth/login` - Email/password login with bcrypt verification
   - `/api/auth/signup` - Customer registration with transaction-based account creation
3. **Resource Endpoints**:
   - `/api/vehicles` - Add vehicles for customers
   - `/api/services` - List available repair services
   - `/api/appointments` - Create appointments
4. **Health Checks**: `/api/health` and `/api/db-health`

**Key Patterns:**
- Email normalization: `LOWER(email)` for case-insensitive lookups
- Phone normalization: digits-only format
- Transaction-based signup to ensure customer + auth records are created atomically
- Structured error handling with PostgreSQL error code mapping (23505 = unique violation, 23503 = FK violation, etc.)

### Frontend Architecture

**Routing Structure:**
- Desktop: `/` (Home component - landing page)
- Mobile app: `/mobile/*` routes with dedicated mobile components

**Mobile Flow:**
1. `/mobile` → MobileHome (landing)
2. `/mobile/login` → MobileLogin (authentication)
3. `/mobile/signup` → MobileSignup (new customer registration)
4. `/mobile/customer-results` → MobileCustomerResults (vehicle selection dashboard)
5. `/mobile/new-vehicle` → MobileNewVehicle (add vehicle)
6. `/mobile/schedule` → MobileScheduleService (select service)
7. `/mobile/schedule/date` → MobileScheduleDate (pick date/time)
8. `/mobile/confirm` → MobileConfirmAppointment (review before booking)
9. `/mobile/appointment-confirmed` → MobileAppointmentConfirmed (success screen)

**State Management:**
- `AuthContext.js`: Provides authentication context (user, login, logout, isAuthed)
- `sessionStorage`: Used to cache customer/vehicle data across mobile navigation
- React Router `location.state`: Primary method for passing data between pages
- Fallback pattern: Components check `location.state` first, then `sessionStorage` cache

**API Client (Api.js):**
Centralized axios instance with `/api` base URL. All API calls are exported functions.

### Database Schema (Inferred)

**Tables:**
- `customers` (customer_id, first_name, last_name, phone, email)
- `customer_auth` (customer_id FK, password_hash)
- `vehicles` (vehicle_id, customer_id FK, make, model, year, color, plate_number, vin)
- `services` (service_id, name, description, hourly_rate, default_hours)
- `appointments` (appointment_id, customer_id FK, vehicle_id FK, service_id FK, start_time, end_time)

**Constraints:**
- Email uniqueness on `customers` table
- VIN uniqueness on `vehicles` table
- Foreign key relationships enforced

## Configuration

### Environment Variables (.env)

Required for database connection:
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (defaults to 5000)
- `NODE_ENV`: Set to 'production' to serve React build

### Proxy Configuration

Client development server proxies `/api` requests to `http://localhost:5000` (see client/package.json).

## Key Implementation Notes

1. **Password Requirements**: Minimum 8 characters (enforced in signup endpoint)

2. **Mobile UI Pattern**: All mobile components use a consistent "bubble" background decoration system with blue ocean-themed styling

3. **Navigation State Pattern**:
   - Always pass `customer` object through navigation state
   - Use `sessionStorage` as backup for page refreshes
   - Components check both sources: `location.state || cached`

4. **Authentication Flow**:
   - Login returns customer object + vehicles array
   - No JWT tokens currently - stateless requests with customer_id in request bodies
   - Logout clears localStorage keys: 'token', 'userData', 'customerId'

5. **Production Deployment**:
   - Configured for Render.com
   - Trust proxy setting enabled for correct client IP detection
   - Static file serving for React build in production mode
   - SSL required for database connection in production

6. **Utility Script**: `set-password.js` - Command-line tool for setting customer passwords (presumably for admin use)

## Styling System

**Shared Styles:**
- `client/src/shared-mobile-styles.css` - Common components (buttons, inputs, bubbles, logos)
- `client/src/styles-config.css` - CSS variables for colors, spacing, typography
- Import shared styles with `@import './shared-mobile-styles.css'` at the top of component CSS files

**Color Palette:**
- Primary Blue: `#0d5a8a` (buttons, headings, interactive elements)
- Primary Blue Dark: `#094a72` (hover states)
- Primary Blue Light: `#1e6fa1` (accents)
- Background: `#fff` (main) / `#f5f5f5` (manager screens)
- Gray tones: `#e8e8e8`, `#666666`, `#e0e0e0`

**Button Styling:**
- Primary buttons: Blue background (`#0d5a8a`), white text, 28px border-radius
- Secondary buttons: White background, blue border, blue text
- All buttons: 90% width, centered, with hover/active states and transitions
- Disabled state: 60% opacity, no transform

**Input Styling:**
- Border-radius: 22px
- Box-shadow: `0 4px 10px rgba(13, 79, 122, 0.12)`
- Focus state: Border color changes to `#0d5a8a` with enhanced shadow
- Width: 100% within form containers

## Common Patterns to Follow

- Always validate required fields before database operations
- Use transactions for multi-table operations (see signup endpoint)
- Normalize email addresses using `normalizeEmail()` helper
- Include comprehensive error handling with specific PostgreSQL error codes
- Pass full objects (customer, vehicle, service) through navigation state, not just IDs
- Use React Router's `navigate(-1)` for back buttons to maintain history
- Use shared CSS files for consistent styling across components
- All colors should use the standardized blue palette (`#0d5a8a` family)
- Buttons should have hover states with `translateY(-2px)` and enhanced shadows
- Import shared-mobile-styles.css for common UI elements
