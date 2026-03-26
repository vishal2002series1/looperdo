# LooperDo Frontend ↔ Backend Integration Guide

## Overview

This NextJS frontend is designed as a complete marketing + product website for LooperDo. It currently uses **mock API endpoints** that simulate the real FastAPI backend. This guide explains how to replace the mock endpoints with your real backend deployed on AWS Lambda via API Gateway.

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐
│   NextJS Frontend   │────▶│   FastAPI Backend     │
│   (This Project)    │     │   (AWS Lambda/APIGW)  │
│                     │     │                       │
│  /api/generate-test │     │  /generate_test       │
│  /api/evaluate-test │     │  /evaluate_test       │
│  /api/gen-workbook  │     │  /generate_workbook   │
│  /api/student-prof  │     │  /student_profile     │
└─────────────────────┘     └──────────────────────┘
```

## API Endpoint Mapping

| Frontend Mock Endpoint      | Real FastAPI Endpoint       | Method | Description                              |
|-----------------------------|----------------------------|--------|------------------------------------------|
| `/api/generate-test`        | `{API_GW}/generate_test`   | POST   | Generate adaptive test questions         |
| `/api/evaluate-test`        | `{API_GW}/evaluate_test`   | POST   | Evaluate answers, return diagnosis       |
| `/api/generate-workbook`    | `{API_GW}/generate_workbook`| POST  | Generate personalized study workbook     |
| `/api/student-profile`      | `{API_GW}/student_profile` | GET    | Get readiness score and progress data    |

## Environment Variables

Add these to your `.env` file:

```env
# Real backend API Gateway URL
NEXT_PUBLIC_API_URL=https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com/Prod

# Database (already configured)
DATABASE_URL=your_postgresql_url

# Auth (already configured)
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://your-domain.com
```

## Step-by-Step Integration

### Step 1: Set Up Environment Variable

Add `NEXT_PUBLIC_API_URL` pointing to your API Gateway:

```env
NEXT_PUBLIC_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/Prod
```

### Step 2: Create API Utility

Create `lib/api.ts`:

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiCall(endpoint: string, options?: RequestInit) {
  const url = API_BASE ? `${API_BASE}${endpoint}` : `/api${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

### Step 3: Replace Mock Calls

**Before (Mock):**
```typescript
// In dashboard component
const res = await fetch('/api/student-profile');
const data = await res.json();
```

**After (Real Backend):**
```typescript
import { apiCall } from '@/lib/api';

// In dashboard component
const data = await apiCall('/student_profile');
```

### Step 4: Update Request/Response Formats

#### Generate Test

**Mock request:**
```json
{ "certificationSlug": "aws-saa", "difficulty": "medium", "questionCount": 5 }
```

**Real backend request (match your FastAPI schema):**
```json
{
  "certification": "aws-saa",
  "student_id": "user_123",
  "num_questions": 20,
  "difficulty": "adaptive"
}
```

#### Evaluate Test

**Mock request:**
```json
{ "testId": "test_123", "answers": [0, 1, 2, 1, 3] }
```

**Real backend request:**
```json
{
  "test_id": "test_123",
  "student_id": "user_123",
  "answers": [
    { "question_id": "q1", "selected_answer": 0 },
    { "question_id": "q2", "selected_answer": 1 }
  ]
}
```

### Step 5: Authentication Integration

The frontend uses NextAuth.js for auth. To connect with your backend:

1. **Pass auth token in API calls:**
```typescript
import { getSession } from 'next-auth/react';

export async function apiCall(endpoint: string, options?: RequestInit) {
  const session = await getSession();
  const url = `${API_BASE}${endpoint}`;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.user?.id}`,
      ...options?.headers,
    },
  }).then(r => r.json());
}
```

2. **Map frontend user IDs to backend student IDs** in your FastAPI backend.

### Step 6: CORS Configuration

Add CORS headers in your FastAPI backend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.com",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Files to Modify

| File                                    | What to Change                                      |
|-----------------------------------------|----------------------------------------------------|
| `app/api/generate-test/route.ts`        | Replace mock data with real API proxy or remove     |
| `app/api/evaluate-test/route.ts`        | Replace mock data with real API proxy or remove     |
| `app/api/generate-workbook/route.ts`    | Replace mock data with real API proxy or remove     |
| `app/api/student-profile/route.ts`      | Replace mock data with real API call                |
| `app/dashboard/dashboard-client.tsx`    | Update fetch calls to use real API                  |
| `lib/mock-data.ts`                      | Can be removed after full integration               |

## Error Handling

Ensure all API calls have proper error handling:

```typescript
try {
  const data = await apiCall('/generate_test', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
} catch (error) {
  console.error('API call failed:', error);
  // Show user-friendly error message
  // Optionally fall back to mock data during development
}
```

## Testing Checklist

- [ ] Environment variable `NEXT_PUBLIC_API_URL` is set correctly
- [ ] CORS is configured on the FastAPI backend
- [ ] Generate Test endpoint returns questions in expected format
- [ ] Evaluate Test endpoint returns diagnosis with topic breakdown
- [ ] Generate Workbook endpoint returns structured workbook content
- [ ] Student Profile endpoint returns readiness score and progress
- [ ] Authentication tokens are passed correctly in API headers
- [ ] Error states are handled gracefully (network errors, 500s, 401s)
- [ ] Dashboard displays real data from backend
- [ ] Readiness gauge animates correctly with real scores
- [ ] Topic proficiency chart renders with real topic breakdown data
- [ ] Test history shows real test records
