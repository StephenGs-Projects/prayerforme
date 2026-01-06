# Firestore Security Rules Deployment Guide

This guide will help you deploy the Firestore security rules to fix the permission errors.

## Option 1: Deploy via Firebase CLI (Recommended)

### Prerequisites
1. Install Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Accept the default `firestore.rules` file
   - Accept the default `firestore.indexes.json` file

### Deploy the Rules
Run this command from your project root:
```bash
firebase deploy --only firestore:rules
```

This will deploy the `firestore.rules` file to your Firebase project.

## Option 2: Deploy via Firebase Console (Alternative)

If you prefer to use the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on "Firestore Database" in the left sidebar
4. Click on the "Rules" tab
5. Copy the entire contents of `firestore.rules` file
6. Paste it into the rules editor
7. Click "Publish"

## What These Rules Do

The new security rules:

- ✅ **Allow admins** to create, read, update, and delete daily content
- ✅ **Allow authenticated users** to read published daily content
- ✅ **Allow authenticated users** to create prayer requests
- ✅ **Allow users** to manage their own journal entries
- ✅ **Allow users** to comment on prayer requests
- ✅ **Allow admins** to moderate flagged content
- ✅ **Protect user data** - users can only access their own data unless they're admin

## Testing After Deployment

1. Make sure your user role in Firestore is set to `admin`:
   - Go to Firestore Database
   - Navigate to `users/{your-uid}`
   - Set `role: "admin"`

2. Try creating daily content in the Admin Panel
3. The permission error should be resolved

## Troubleshooting

If you still get permission errors after deployment:

1. **Check your role**: Make sure your user document has `role: "admin"` in Firestore
2. **Clear cache**: Sign out and sign back in to refresh your authentication token
3. **Check deployment**: Verify the rules were deployed by viewing them in Firebase Console
4. **Check the error**: Use the improved error popup to see specific error details

## Current User Roles

- `admin` - Full access to all features including content management
- `premium` - Access to premium features
- `free` - Basic access (default)
