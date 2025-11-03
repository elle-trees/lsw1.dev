# Firestore Indexes Setup Guide

## Quick Setup

### Option 1: Deploy via Firebase CLI (Recommended)

1. **Make sure you're logged into Firebase:**
   ```bash
   firebase login
   ```

2. **Select your project:**
   ```bash
   firebase use lsw1live
   ```
   (Or use `firebase use --add` to add your project if not already set)

3. **Deploy the indexes:**
   ```bash
   firebase deploy --only firestore:indexes
   ```

4. **Wait for indexes to build** (usually 1-5 minutes). You can check progress in the Firebase Console.

### Option 2: Manual Setup via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `lsw1live`
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **Create Index** and add each index manually:

#### Index 1: Player Runs Query
- Collection: `leaderboardEntries`
- Fields:
  - `verified` (Ascending)
  - `playerId` (Ascending)

#### Index 2: Recent Runs (with date)
- Collection: `leaderboardEntries`
- Fields:
  - `verified` (Ascending)
  - `date` (Descending)

#### Index 3: Category Filter
- Collection: `leaderboardEntries`
- Fields:
  - `verified` (Ascending)
  - `category` (Ascending)

#### Index 4: Platform Filter
- Collection: `leaderboardEntries`
- Fields:
  - `verified` (Ascending)
  - `platform` (Ascending)

#### Index 5: Run Type Filter
- Collection: `leaderboardEntries`
- Fields:
  - `verified` (Ascending)
  - `runType` (Ascending)

## What These Indexes Do

These indexes speed up your queries by allowing Firestore to:
- Quickly find documents matching `verified == true`
- Efficiently filter by `playerId`, `category`, `platform`, or `runType`
- Sort by `date` for recent runs queries

## Checking Index Status

After deployment, you can check index build status in:
- Firebase Console → Firestore → Indexes
- Green checkmark = ready to use
- Building = in progress (wait a few minutes)

## Notes

- Indexes are built in the background and may take a few minutes
- Single-field queries on `verified` don't need a composite index (Firestore auto-creates single-field indexes)
- The indexes defined here will work for most query patterns in your app
- If you see index errors in the console, click the link in the error to auto-create the needed index

