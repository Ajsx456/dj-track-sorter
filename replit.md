# Track Sorting DJ Application

## Overview

This is a full-stack music track sorting application built for DJs to efficiently organize and curate their music collections. The application allows users to upload MP3 files, listen to tracks, and sort them into liked/disliked categories with an intuitive swipe-like interface.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server:

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **File Storage**: Local file system with multer for file uploads
- **UI Framework**: shadcn/ui components with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management

## Key Components

### Frontend Architecture
- **React Router**: Using wouter for lightweight client-side routing
- **Component Structure**: 
  - Pages: Home, Sorting, Statistics, NotFound
  - UI Components: Extensive shadcn/ui component library
  - Custom Components: FileUpload, LoadingScreen, TrackCard, Waveform
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Audio Handling**: Custom useAudio hook for audio playback controls

### Backend Architecture
- **Express Server**: RESTful API with middleware for logging and error handling
- **Route Structure**: Modular route handling in `/server/routes.ts`
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **File Management**: Multer-based file upload handling with MP3 validation

### Database Schema
```typescript
// Sessions table for tracking user sessions
sessions: {
  id, sessionId, createdAt
}

// Tracks table for storing music file metadata
tracks: {
  id, sessionId, fileName, originalName, fileSize, 
  duration, liked, processed, filePath
}
```

## Data Flow

1. **Session Creation**: User starts by creating a new sorting session
2. **File Upload**: Multiple MP3 files are uploaded and stored on the server
3. **Track Processing**: Files are processed and metadata is extracted
4. **Sorting Interface**: Users can play tracks and mark them as liked/disliked
5. **Statistics View**: Final results showing liked tracks with download capability

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connection (configured for PostgreSQL)
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **multer**: File upload handling
- **express**: Web server framework

### UI Dependencies
- **@radix-ui**: Headless UI components
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **wouter**: Lightweight routing

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking
- **tsx**: TypeScript execution for development

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

- **Development**: `npm run dev` - Runs TypeScript server with hot reload
- **Build**: `npm run build` - Builds client and server for production
- **Production**: `npm run start` - Runs compiled JavaScript server
- **Database**: PostgreSQL module configured in `.replit`
- **Port Configuration**: Server runs on port 5000, exposed as port 80

### Environment Configuration
- Requires `DATABASE_URL` environment variable for PostgreSQL connection
- Supports both development and production modes
- Includes Vite plugins for Replit integration

## Changelog
- June 26, 2025: Initial setup
- June 26, 2025: Successfully built and deployed DJ Track Sorter application with all requested features

## Recent Changes
✓ Created complete DJ track sorting application
✓ Implemented drag & drop MP3 upload system
✓ Built Tinder-style sorting interface with waveform visualization  
✓ Added audio playback controls and keyboard shortcuts
✓ Created statistics page with download functionality
✓ Fixed all TypeScript and CSS compilation errors
✓ Successfully tested file upload, sorting, and download features
✓ Application ready for deployment on Replit

## User Preferences

Preferred communication style: Simple, everyday language.
User feedback: "приложение супер, все четко то, что надо" - application meets all requirements perfectly.