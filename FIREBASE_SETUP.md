# Firebase Console Setup Guide

## IMPORTANT: Complete These Steps BEFORE Testing

Your app has been updated to use email/password authentication, but you **MUST enable this feature in your Firebase Console** for it to work.

---

## Step 1: Access Firebase Console

1. Go to: **https://console.firebase.google.com/**
2. Sign in with your Google account
3. Click on your project: **gains4brains**

---

## Step 2: Enable Email/Password Authentication

1. In the left sidebar, click **"Authentication"** (or **"Build" → "Authentication"**)
2. If this is your first time, click **"Get started"**
3. Click on the **"Sign-in method"** tab at the top
4. You should see a list of sign-in providers

---

## Step 3: Configure Email/Password Provider

1. Find **"Email/Password"** in the providers list
2. Click on it to open the configuration
3. **Toggle ON** the first switch: **"Email/Password"**
   - ⚠️ Do NOT enable "Email link (passwordless sign-in)" unless you want that feature
4. Click **"Save"**

**Screenshot Reference:**

```
┌─────────────────────────────────────────┐
│ Email/Password                          │
│ ───────────────────────────────────     │
│                                         │
│ ☑ Enable                               │
│   Allow users to sign up using their   │
│   email address and password           │
│                                         │
│ ☐ Email link (passwordless sign-in)   │
│   Allow users to sign in using a link │
│   sent to their email                  │
│                                         │
│   [Cancel]              [Save]         │
└─────────────────────────────────────────┘
```

---

## Step 4: Verify Configuration

After saving, you should see:

- **Email/Password** status: **Enabled** (with a green checkmark)
- Provider name: **Email/Password**

---

## Step 5: Update Firestore Security Rules (Recommended)

1. In the left sidebar, click **"Firestore Database"**
2. Click on the **"Rules"** tab
3. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Anyone authenticated can read any user (for leaderboard)
      allow read: if request.auth != null;

      // Users can only write to their own document
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Click **"Publish"**

**Why these rules?**

- `allow read: if request.auth != null` - Any logged-in user can read user profiles (needed for leaderboard)
- `allow write: if request.auth.uid == userId` - Users can only modify their own data (security)

---

## Step 6: Test Your Setup

### Test Account Creation

1. Open your app: `index.html`
2. You should see the login/signup screen
3. Click **"Sign Up"** tab
4. Enter:
   - Email: `test@example.com`
   - Password: `test123` (at least 6 characters)
   - Confirm Password: `test123`
5. Click **"Create Account"**
6. You should be logged in and see the main app

### Verify in Firebase Console

1. Go back to Firebase Console
2. Navigate to **Authentication** → **Users** tab
3. You should see your new user listed with:
   - Email: test@example.com
   - Provider: Email/Password
   - Created date
   - User UID

### Test Login

1. Click the logout button in your app
2. You should return to login screen
3. Enter your email and password
4. Click **"Log In"**
5. You should be logged in again

---

## Common Issues & Solutions

### Issue: "auth/operation-not-allowed"

**Solution:** Email/Password authentication is not enabled in Firebase Console. Return to Step 2.

### Issue: Can't see users in Firebase Console

**Solution:**

- Make sure you're looking at the correct project
- Check the "Users" tab under "Authentication"
- Try refreshing the page

### Issue: "Permission denied" errors

**Solution:**

- Update your Firestore security rules (Step 5)
- Make sure the rules are published

### Issue: Users not staying logged in

**Solution:**

- Check browser console for errors
- Verify `setPersistence` is being called in firebase-init.js
- Clear browser cache and try again

### Issue: Can't access leaderboard

**Solution:**

- Make sure you're logged in first
- Check that Firestore rules allow authenticated reads
- Verify user document exists in Firestore

---

## Monitoring & Management

### View All Users

1. Firebase Console → Authentication → Users
2. You can see all registered users, their emails, and when they signed up

### Delete a User

1. Firebase Console → Authentication → Users
2. Click on the user
3. Click "Delete Account" (three dots menu)
4. Confirm deletion

### Disable a User

1. Firebase Console → Authentication → Users
2. Click on the user
3. Click "Disable Account"

### View User Activity

1. Firebase Console → Firestore Database
2. Navigate to `users` collection
3. Click on a user document to see their data:
   - xp (experience points)
   - username
   - lastSeen (last activity)
   - email

---

## Security Best Practices

✅ **Enabled:**

- Email/Password authentication
- Browser persistence (users stay logged in)
- User-specific security rules

🔔 **Consider Adding:**

1. **Email Verification** - Require users to verify their email
2. **Password Reset** - Let users reset forgotten passwords
3. **Rate Limiting** - Prevent brute force attacks
4. **Two-Factor Authentication** - Extra security layer

---

## Testing Checklist

Before going live, test:

- [ ] Email/Password enabled in Firebase Console
- [ ] Can create new account
- [ ] New user appears in Firebase Console
- [ ] Can log in with created account
- [ ] User stays logged in after refresh
- [ ] User stays logged in after browser restart
- [ ] Can log out successfully
- [ ] Firestore security rules are active
- [ ] Can access leaderboard when logged in
- [ ] Cannot access leaderboard when logged out
- [ ] Error messages show correctly
- [ ] Form validation works

---

## Next Steps

Once everything is working:

1. **Test with multiple accounts** - Create several test accounts to verify everything works
2. **Test on different browsers** - Chrome, Firefox, Safari
3. **Test on mobile devices** - iOS and Android
4. **Monitor Firebase Console** - Watch for any errors or issues
5. **Consider adding email verification** - Make accounts more secure

---

## Support & Resources

- **Firebase Authentication Docs:** https://firebase.google.com/docs/auth
- **Firebase Console:** https://console.firebase.google.com/
- **Firestore Security Rules:** https://firebase.google.com/docs/firestore/security/get-started
- **Firebase Support:** https://firebase.google.com/support

---

## Summary

✅ **What You Did:**

- Converted app from anonymous → email/password auth
- Added login/signup forms
- Added logout functionality
- Protected leaderboard access
- Enabled session persistence

🔧 **What You Need To Do:**

1. Enable Email/Password in Firebase Console (Steps 1-3)
2. Update Firestore security rules (Step 5)
3. Test thoroughly (Step 6)

**Estimated Time:** 5-10 minutes

Once completed, your app will be fully secured with email/password authentication! 🎉
