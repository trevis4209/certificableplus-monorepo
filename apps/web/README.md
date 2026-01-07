# CertificablePlus

A comprehensive cross-platform application for certificate management and maintenance tracking, built with React Native for web and mobile platforms.

## Features

- **Multi-role Authentication System** - Separate dashboards for companies and employees
- **Certificate Management** - Track and manage certificates with expiration dates
- **Maintenance Scheduling** - Schedule and monitor maintenance activities
- **Product Catalog** - Manage and display product information
- **Interactive Maps** - Location-based features for maintenance and services
- **Dark/Light Theme** - Responsive design with theme switching
- **Cross-platform** - Works on web, iOS, and Android

## Tech Stack

- **Frontend**: Next.js 15 with React 18
- **Styling**: Tailwind CSS with shadcn/ui components
- **Language**: TypeScript for type safety
- **Authentication**: Custom auth system with role-based access
- **State Management**: React Context and custom hooks
- **Form Validation**: React Hook Form with Zod validation

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app` - Next.js app router pages and layouts
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and validations
- `/src/types` - TypeScript type definitions
- `/src/hooks` - Custom React hooks
- `/src/services` - API service functions

## User Roles

### Company Dashboard
- Manage employees and certificates
- Schedule maintenance activities
- Monitor compliance and expiration dates
- Product management

### Employee Dashboard
- View assigned tasks and certificates
- Update maintenance status
- Access product information
- Location-based services

### Public Access
- View public product information
- Access company locations on map
- General information display
