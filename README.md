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