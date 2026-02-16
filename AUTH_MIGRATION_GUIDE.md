# Authentication Migration Guide

## Overview

Your trivia app has been successfully converted from **anonymous authentication** to **email/password authentication**. Users now need to create an account and log in to access the app and leaderboard.

## What Changed

### 1. **firebase-init.js**

- Added imports for email/password authentication:
  - `createUserWithEmailAndPassword` - for signup
  - `signInWithEmailAndPassword` - for login
  - `signOut` - for logout
  - `setPersistence` & `browserLocalPersistence` - to keep users logged in
- Removed automatic anonymous sign-in
- Added persistence configuration so users stay logged in across browser sessions

### 2. **index.html**

- Added new **authentication screen** with:
  - Login form (email + password)
  - Signup form (email + password + confirm password)
  - Tab switcher between login/signup
  - Error message displays
- Added **logout button** to both:
  - Main header (desktop)
  - Mobile menu drawer
- Auth screen appears when users are not logged in

### 3. **app.js**

- Replaced anonymous authentication with email/password flow
- Added `showAuthScreen()` and `hideAuthScreen()` functions
- Added authentication event handlers:
  - Tab switching between login/signup
  - Login button handler with error handling
  - Signup button handler with validation
  - Logout button handler
  - Enter key support for forms
- Authentication state is checked on app load
- User data now includes email address in Firestore

### 4. **leaderboard.js**

- Added authentication check before loading leaderboard
- Redirects unauthenticated users back to login screen
- Shows appropriate message if user is not logged in

### 5. **style.css**

- Added authentication screen styles
- Styled login/signup forms
- Added tab switcher styles
- Added input field styles
- Added error message styles

## Features Implemented

### ✅ Sign Up

- Users can create an account with email and password
- Password must be at least 6 characters
- Passwords must match in confirmation field
- Shows error messages for:
  - Empty fields
  - Weak passwords
  - Email already in use
  - Invalid email format

### ✅ Log In

- Users can log in with existing credentials
- Shows error messages for:
  - Empty fields
  - Wrong password
  - User not found
  - Invalid credentials

### ✅ Log Out

- Logout button in header (desktop)
- Logout button in mobile menu
- Clears form data on logout
- Returns user to login screen

### ✅ Stay Logged In

- Uses Firebase Local Persistence
- Users remain logged in when they close and reopen the browser
- Session persists across page refreshes

### ✅ Login Screen Protection

- Authentication screen shows when not logged in
- Main app content hidden until authenticated
- Header and navigation hidden on auth screen

### ✅ Leaderboard Protection

- Leaderboard accessible only when logged in
- Redirects to login page if accessed while logged out
- Shows appropriate error message

## User Experience Flow

1. **First Visit**
   - User sees login/signup screen
   - Can switch between login and signup tabs
   - Must create account or log in to proceed

2. **After Signup**
   - Account created automatically in Firebase
   - User document created in Firestore with email
   - Automatically logged in
   - Taken to main app

3. **After Login**
   - Credentials validated
   - Session persisted locally
   - Taken to main app

4. **Returning User**
   - Automatically logged in (persistence)
   - Goes directly to main app
   - No need to log in again

5. **Logout**
   - Clears authentication state
   - Returns to login screen
   - Form fields cleared

## Firebase Console Setup

### Enable Email/Password Authentication

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: **gains4brains**
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Email/Password**
5. **Enable** the Email/Password provider
6. Save changes

### Security Rules (Recommended)

Update your Firestore security rules to ensure users can only access their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own document
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Anyone can read leaderboard (for top scores)
    match /users/{userId} {
      allow read: if request.auth != null;
    }
  }
}
```

## Testing Instructions

### Test Signup

1. Open the app in a browser
2. You should see the login/signup screen
3. Click the "Sign Up" tab
4. Enter a valid email (e.g., test@example.com)
5. Enter a password (at least 6 characters)
6. Re-enter the same password in confirmation
7. Click "Create Account"
8. You should be logged in and see the main app

### Test Login

1. Log out using the logout button
2. You should return to the login screen
3. Click the "Log In" tab
4. Enter your email and password
5. Click "Log In"
6. You should be logged in and see the main app

### Test Persistence

1. While logged in, refresh the page
2. You should remain logged in (no login screen)
3. Close the browser tab completely
4. Open the app again in a new tab
5. You should still be logged in

### Test Leaderboard

1. While logged in, click "Leaderboard"
2. You should see the leaderboard page
3. Log out
4. Try accessing leaderboard.html directly
5. You should be redirected to login

### Test Error Handling

- Try signing up with an existing email
- Try logging in with wrong password
- Try signing up with mismatched passwords
- Try signing up with a short password (< 6 chars)
- Try logging in with non-existent email

## Migrating Existing Anonymous Users

**Important:** Anonymous users from before this change will need to create new accounts. Their previous data (points, streaks, etc.) are stored locally and will persist on their device, but they'll need to create an email/password account to continue using the app.

If you want to migrate anonymous users:

1. You could add a "Link Account" feature using Firebase's `linkWithCredential()`
2. This would preserve their existing data in the database
3. This is a more advanced feature and not included in this basic migration

## Additional Security Recommendations

1. **Email Verification**: Consider adding email verification using Firebase's `sendEmailVerification()`
2. **Password Reset**: Add "Forgot Password" feature using `sendPasswordResetEmail()`
3. **Rate Limiting**: Implement rate limiting to prevent brute force attacks
4. **Security Rules**: Update Firestore security rules (see above)

## Troubleshooting

### Users Can't Sign Up

- Check that Email/Password is enabled in Firebase Console
- Check browser console for error messages
- Verify Firebase configuration is correct

### Users Not Staying Logged In

- Check that persistence is set to `browserLocalPersistence`
- Verify browser allows local storage
- Check for console errors related to persistence

### Leaderboard Not Loading

- Verify user is logged in
- Check Firestore security rules allow authenticated reads
- Check browser console for errors

## Files Modified

- `firebase-init.js` - Added email/password auth imports and persistence
- `index.html` - Added auth screen UI and logout buttons
- `app.js` - Replaced anonymous auth with email/password logic
- `leaderboard.js` - Added authentication check
- `style.css` - Added authentication screen styles

## Support

If you encounter any issues or need further customization, please refer to:

- Firebase Auth Documentation: https://firebase.google.com/docs/auth
- Firebase Console: https://console.firebase.google.com/
