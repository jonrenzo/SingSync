# SingSync

A real-time karaoke queue app that lets users search and queue YouTube videos from their phones while a main display shows the current song.

## Features

- **YouTube Search** - Search and queue songs from YouTube
- **Queue Management** - Add, remove, reorder, and advance through the queue
- **Dual Interface** - Main display page (`/display`) shows current song, queue page (`/`) for managing the queue
- **QR Code Access** - Scan QR code on display to access the queue from your phone
- **Real-time Sync** - Queue state synchronized via Redis

## Live Demo

The app is deployed at: https://sing-sync-xi.vercel.app

- Queue: https://sing-sync-xi.vercel.app
- Display: https://sing-sync-xi.vercel.app/display

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables for Redis:
   ```
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to access the queue

5. Open [http://localhost:3000/display](http://localhost:3000/display) on your main display/screen

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Upstash Redis for state management
- QRCode for generating access codes
