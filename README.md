# Parking Ticket System

A mobile-responsive web application for managing parking tickets, entrances, exits, and calculating charges.

## Features

- **Mobile-First Design**: Fully responsive for use on mobile devices
- **Vehicle Entry**: Generate tickets with entry time and QR code
- **Vehicle Exit**: Calculate charges based on duration, print exit receipts
- **Settings**: Configure vehicle types and hourly rates
- **Local Storage**: Data persists between sessions

## Technology Stack

- Next.js 14
- TypeScript
- TailwindCSS
- React Hooks and Context API
- Local Storage for data persistence
- React-QR-Code for QR code generation
- React-to-Print for printing receipts

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) with your browser

## User Guide

### Initial Setup
1. Navigate to the Settings page
2. Add vehicle types
3. Configure hourly rates for each vehicle type

### Using the System
1. On the main page, select "Vehicle Entry" or "Vehicle Exit"
2. For entry, select vehicle type, enter number plate, and print ticket
3. For exit, enter the vehicle number to find the record and calculate charges

## License

MIT
