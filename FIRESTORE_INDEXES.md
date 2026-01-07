# Required Firestore Composite Indexes

Firestore requires composite indexes when you query with multiple fields. This app needs the following indexes to work properly.

## How to Create Indexes

### Option 1: Click the Error Link (Easiest)
When you see "Failed to load daily content", check the browser console. Firestore will provide a direct link to create the missing index. Just click it and wait for the index to build.

### Option 2: Manual Creation via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click "Firestore Database" → "Indexes" tab
4. Click "Create Index"
5. Add the fields as specified below

## Required Indexes

### 1. Daily Content Query
**Collection**: `dailyContent`
**Query**: Get latest published content

| Field | Order |
|-------|-------|
| published | Ascending |
| date | Descending |
| __name__ | Descending |

**Why**: Used by `getLatestDailyContent()` to fetch the most recent published daily content

---

### 2. Prayer Requests by Status
**Collection**: `prayerRequests`
**Query**: Get approved prayer requests

| Field | Order |
|-------|-------|
| status | Ascending |
| createdAt | Descending |
| __name__ | Descending |

**Why**: Used by `getPrayerRequests()` to show approved requests in the community feed

---

### 3. User Prayer Requests
**Collection**: `prayerRequests`
**Query**: Get prayer requests by specific user

| Field | Order |
|-------|-------|
| userId | Ascending |
| createdAt | Descending |
| __name__ | Descending |

**Why**: Used by `getUserPrayerRequests()` to show a user's prayer request history

---

### 4. Flagged Requests
**Collection**: `flaggedRequests`
**Query**: Get pending flagged content

| Field | Order |
|-------|-------|
| status | Ascending |
| createdAt | Descending |
| __name__ | Descending |

**Why**: Used by `getFlaggedRequests()` in admin moderation panel

---

### 5. Daily Content - Scheduling by Status
**Collection**: `dailyContent`
**Query**: Filter content by status (draft/scheduled/published)

| Field | Order |
|-------|-------|
| status | Ascending |
| date | Descending |
| __name__ | Descending |

**Why**: Used by `getAllDailyContentWithStatus()` to show content filtered by status

---

### 6. Daily Content - Auto-Publish Scheduled
**Collection**: `dailyContent`
**Query**: Find scheduled content ready to publish

| Field | Order |
|-------|-------|
| status | Ascending |
| publishDate | Ascending |
| __name__ | Ascending |

**Why**: Used by `getScheduledContentToPublish()` to auto-publish content at scheduled time

---

### 7. Comments (Collection Group) - All Comments
**Collection Group**: `comments`
**Query**: Get all comments across all prayer requests

| Field | Order |
|-------|-------|
| status | Ascending |
| createdAt | Descending |
| __name__ | Descending |

**Why**: Used by `getAllComments()` for comment moderation view

**⚠️ Important**: This is a **Collection Group** index, not a regular collection index!

---

## Current Status

- ✅ Prayer Requests by Status (Index #2)
- ✅ User Prayer Requests (Index #3)
- ✅ Daily Content Query (Index #1)
- ❓ Flagged Requests (Index #4) - **Create if you see errors when viewing flagged content**
- ⏳ Daily Content - Scheduling by Status (Index #5) - **Required for content scheduling**
- ⏳ Daily Content - Auto-Publish (Index #6) - **Required for auto-publishing scheduled content**
- ⏳ Comments Collection Group (Index #7) - **Required for comment moderation view**

## How to Check Index Build Status

After creating an index:
1. Go to Firebase Console → Firestore → Indexes
2. Watch the status change from "Building" to "Enabled"
3. Building can take a few seconds to several minutes depending on data size
4. Refresh your app once the index shows "Enabled"

## Troubleshooting

**"Index already exists" error**: The index is already created, wait for it to finish building.

**"Failed to load" persists after index is enabled**: Clear your browser cache and refresh the page.

**Console shows different index needed**: Follow the link in the error message - Firestore will tell you exactly what index is missing.
