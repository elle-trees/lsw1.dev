# Deploy Firestore Rules

The Firestore rules have been updated to allow admins to recalculate points for co-op runs. **You must deploy these rules for them to take effect.**

## Deploy Rules

### Option 1: Firebase CLI (Recommended)

```bash
# Make sure you're logged in
firebase login

# Select your project
firebase use lsw1live

# Deploy rules
firebase deploy --only firestore:rules
```

### Option 2: Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `lsw1live`
3. Go to **Firestore Database** → **Rules** tab
4. Copy the contents of `firestore.rules`
5. Paste into the rules editor
6. Click **Publish**

## Verify Admin Status

Make sure your admin account has `isAdmin: true` in the Firestore `players` collection:

1. Go to Firebase Console → **Firestore Database** → **Data** tab
2. Navigate to `players/{your-uid}`
3. Verify `isAdmin` field is set to `true`
4. If it's missing or `false`, update it to `true`

## After Deploying

1. Hard refresh your browser (Ctrl+Shift+R)
2. Log out and log back in
3. Try recalculating points again

The permission errors should be resolved once the rules are deployed and your admin status is verified.

