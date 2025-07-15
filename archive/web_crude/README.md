# Preceptoria Web App

A simplified Next.js web application for the Preceptoria internship management system.

## Features

- **Simple Landing Page** - Clean welcome page with login link
- **Basic Login Form** - Ready for API integration
- **Dashboard** - Simple overview with mock data
- **Documents Page** - Basic document management interface

## Tech Stack

- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Bun** - Package manager and runtime

## Getting Started

1. Install dependencies:

   ```bash
   bun install
   ```

2. Start the development server:

   ```bash
   bun run dev
   ```

3. Open [http://localhost:4123](http://localhost:4123) in your browser.

## Project Structure

```
app/
├── layout.tsx          # Root layout
├── page.tsx           # Landing page
├── globals.css        # Global styles
├── login/
│   └── page.tsx       # Login form
├── dashboard/
│   ├── layout.tsx     # Dashboard layout
│   └── page.tsx       # Dashboard content
└── documents/
    └── page.tsx       # Documents page
```

## Next Steps

This is a simplified version ready for:

1. API integration with the backend
2. Authentication implementation
3. Real data fetching
4. Additional features as needed

## Development

- **Build**: `bun run build`
- **Start**: `bun run start`
- **Lint**: `bun run lint`
