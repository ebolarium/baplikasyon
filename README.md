# Baplikasyon - Support Case Tracking App

A mobile-friendly web application for tracking support cases developed for personal use.

## Features

- Track support cases with company, person, topic, and details
- Open and close cases with automatic timestamps
- Mobile-responsive design with Material UI
- View case details and history
- Reports section with statistics

## Technologies Used

- MongoDB
- Express
- React
- Node.js
- Material UI

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account

### Installation

1. Clone the repository
```
git clone https://github.com/ebolarium/baplikasyon.git
cd baplikasyon
```

2. Install server dependencies
```
npm install
```

3. Install client dependencies
```
cd client
npm install
cd ..
```

4. Create a `.env` file in the root directory with your MongoDB connection string:
```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

### Running the Application

#### Development Mode
```
npm run dev
```
This will run both the server and client in development mode.

#### Production Build
```
npm run build
npm start
```

## API Endpoints

- `GET /api/cases` - Get all support cases
- `GET /api/cases/:id` - Get a specific support case
- `POST /api/cases` - Create a new support case
- `PUT /api/cases/:id` - Update a support case
- `DELETE /api/cases/:id` - Delete a support case

## Docker Deployment (Coolify / Hetzner)

This repo now includes a production `Dockerfile` that:
- Builds the React app
- Runs the Node/Express API
- Serves `client/build` from Express

### Coolify setup

1. Create a new application from this Git repo.
2. Build Pack: `Dockerfile` (root).
3. Exposed port: `5000`.
4. Add environment variables:
```
NODE_ENV=production
PORT=5000
MONGO_URI=...
JWT_SECRET=...
JWT_EXPIRES_IN=90d
RESEND_API_KEY=...
RESEND_FROM=...
ADMIN_EMAILS=you@example.com
SIGNUP_INVITE_CODE=
```
5. Deploy.

Notes:
- `JWT_SECRET` is required; app will not start without it.
- If `SIGNUP_INVITE_CODE` is set, signup requires that code.
