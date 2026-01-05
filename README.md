# Prayer For Me

A modern, spiritual companion app for daily prayer, devotionals, journaling, and community connection.

## Features

- **Daily Prayer** - Start each day with a curated prayer and Bible verse
- **Devotionals** - Read inspiring daily devotional content
- **Journal** - Reflect and record your spiritual journey with guided prompts
- **Community** - Share and pray for others' prayer requests
- **Admin Dashboard** - Manage daily content, users, and moderation

## Tech Stack

- **Frontend**: React 19 + Vite
- **Routing**: React Router DOM v7
- **Backend**: Firebase
  - Authentication (Email/Password, Google, Facebook, Apple)
  - Firestore Database
  - Cloud Storage
- **Icons**: Lucide React
- **Styling**: Custom CSS with CSS Variables for theming

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Firebase project (free tier works great!)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd App
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project or use existing
   - Enable Authentication, Firestore, and Storage
   - Get your Firebase config from Project Settings

4. Create environment file:
```bash
cp .env.example .env.local
```

5. Add your Firebase credentials to `.env.local`:
```
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
npm run preview
```

## Firebase Setup

### Authentication Providers

Enable these in Firebase Console > Authentication > Sign-in method:
- Email/Password
- Google
- Facebook (optional)
- Apple (optional)

### Firestore Security Rules

Deploy the security rules from `firestore.rules`:
```bash
firebase deploy --only firestore:rules
```

### Storage Security Rules

Deploy the storage rules from `storage.rules`:
```bash
firebase deploy --only storage
```

## Project Structure

```
src/
├── components/        # Reusable UI components
├── context/          # React Context providers
├── firebase/         # Firebase configuration and services
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── utils/            # Utility functions
└── App.jsx           # Root component
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the app.

## Contributing

This is a private project. Please contact the maintainers for contribution guidelines.

## License

All rights reserved.

## Support

For issues or questions, please open an issue on GitHub or contact support.
