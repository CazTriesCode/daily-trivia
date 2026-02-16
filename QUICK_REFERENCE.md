# Quick Reference: Email/Password Authentication

## New User Flow

```
User Opens App
    ↓
Not Logged In? → Show Login/Signup Screen
    ↓
User Signs Up or Logs In
    ↓
Authentication Successful
    ↓
Create/Update User Document in Firestore
    ↓
Show Main App
```

## Key Functions Added

### Authentication Functions

```javascript
// Show/Hide auth screen
showAuthScreen(); // Shows login/signup, hides app
hideAuthScreen(); // Hides login/signup, shows app

// Handle logout
handleLogout(); // Signs out user, returns to login
```

### Form Validation

- Email format validation
- Password length check (min 6 characters)
- Password confirmation matching
- Empty field detection
- Error message display

## Firebase Functions Used

```javascript
// From firebase-init.js (window.FB)
createUserWithEmailAndPassword(auth, email, password); // Signup
signInWithEmailAndPassword(auth, email, password); // Login
signOut(auth); // Logout
onAuthStateChanged(auth, callback); // Listen for auth changes
setPersistence(auth, browserLocalPersistence); // Keep users logged in
```

## UI Elements Added

### Login Form (`#login-form`)

- Email input: `#login-email`
- Password input: `#login-password`
- Login button: `#btn-login`
- Error display: `#login-error`

### Signup Form (`#signup-form`)

- Email input: `#signup-email`
- Password input: `#signup-password`
- Confirm password: `#signup-password-confirm`
- Signup button: `#btn-signup`
- Error display: `#signup-error`

### Navigation

- Tab switcher: `#tab-login`, `#tab-signup`
- Logout button (desktop): `#btn-logout`
- Logout button (mobile): `#m-logout`

## Error Messages

### Login Errors

- "Please enter both email and password"
- "No account found with this email"
- "Incorrect password"
- "Invalid email address"
- "Invalid credentials"

### Signup Errors

- "Please fill in all fields"
- "Password must be at least 6 characters"
- "Passwords do not match"
- "An account with this email already exists"
- "Invalid email address"
- "Password is too weak"

## User Data Structure (Firestore)

```javascript
users/{uid}:
{
  uid: string,           // User's unique ID
  email: string,         // User's email (NEW)
  xp: number,           // Experience points
  username: string,      // Display name (nullable)
  createdAt: timestamp,  // Account creation time
  updatedAt: timestamp,  // Last profile update
  lastSeen: timestamp    // Last activity
}
```

## Security Checks

### App Level

- Auth screen shown if not logged in
- Main content hidden until authenticated
- User state checked on every page load

### Leaderboard Level

- Authentication verified before loading data
- Redirects to login if not authenticated
- Only shows data for logged-in users

## Browser Persistence

```javascript
// Set in firebase-init.js
setPersistence(auth, browserLocalPersistence);
```

**Result:**

- Users stay logged in after browser close
- Login persists across tabs
- Survives page refreshes
- Stored in browser's local storage

## Common Tasks

### Force User to Re-login

```javascript
window.FB.signOut(window.FB.auth);
```

### Check Current User

```javascript
const user = window.FB.auth.currentUser;
if (user) {
  console.log("Logged in:", user.email);
} else {
  console.log("Not logged in");
}
```

### Get Current User ID

```javascript
const uid = window.currentUID;
const email = window.FB.auth.currentUser?.email;
```

## Testing Checklist

- [ ] Can create new account
- [ ] Can log in with existing account
- [ ] Can log out successfully
- [ ] Stays logged in after refresh
- [ ] Stays logged in after browser close/reopen
- [ ] Can't access leaderboard when logged out
- [ ] Error messages show correctly
- [ ] Form validation works
- [ ] Mobile menu logout works
- [ ] Desktop header logout works
- [ ] Tab switching works
- [ ] Enter key submits forms

## Important Notes

1. **Anonymous Users:** Previous anonymous users will need to create new accounts
2. **Local Data:** User points/stats stored locally will persist per device
3. **Firebase Setup:** Must enable Email/Password auth in Firebase Console
4. **Security Rules:** Update Firestore rules to restrict user data access

## Next Steps (Optional Enhancements)

1. Add "Forgot Password" functionality
2. Add email verification requirement
3. Add password strength indicator
4. Add social login (Google, Facebook, etc.)
5. Add profile picture upload
6. Add account deletion option
7. Add email change functionality
8. Add password change functionality
