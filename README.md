# Rhino IA PWA

A Progressive Web Application built with Next.js, Shadcn UI, Tailwind CSS, and Firebase.

## Features

- **Landing Page**: Simple landing page with a Call-to-Action
- **Chat Interface**: Live chat with AI (frontend implementation)
- **Document Management**: View and upload files to Google Drive
- **Authentication**: Email and Google authentication using Firebase
- **Progressive Web App**: Installable on mobile and desktop devices

## Technologies Used

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI
- Firebase Authentication
- Google Drive API

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Firebase account
- Google Cloud project with Drive API enabled
- Service account with Drive API access

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/rhino-ia-pwa.git
cd rhino-ia-pwa
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file based on `.env.example` and fill in your configuration values
```bash
cp .env.example .env.local
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with the following variables:

```
# Firebase Configuration (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key_with_quotes"

# Google Drive API
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY="your_private_key_with_quotes"
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```

### Google Drive Setup

1. Create a Google Cloud project and enable the Drive API
2. Create a service account with the following roles:
   - Drive API > Drive File Creator
   - Drive API > Drive Viewer
3. Create a key for this service account (JSON format)
4. Use the values from the JSON key file for `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY`
5. Create a folder in Google Drive and share it with the service account email
6. Get the folder ID from the URL (the long string after `folders/` in the URL)

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
