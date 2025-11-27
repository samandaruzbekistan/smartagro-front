# Smart Farm API Documentation

## Overview

The Smart Farm API is a comprehensive backend system for agricultural management, providing endpoints for:

- **Autentifikatsiya** – Login, register, profil boshqaruvi (Laravel Sanctum)
- **Soil Analysis** – Collect soil samples, run analyses, and get fertilizer recommendations
- **Field Management** – Manage fields with GeoJSON geometry and weather data
- **Machinery** – Track tractors, combines, maintenance records, and work logs
- **Workers & Payroll** – Manage farm workers and calculate payments
- **Expenses** – Track farm expenses by category
- **Analytics** – Get AI-ready insights on field performance and finances

### Architecture

| Component | Technology |
|-----------|------------|
| Backend | Laravel 10+ (PHP 8.2+) |
| Database | MySQL / SQLite |
| Weather API | Mocked (OpenWeather-ready) |
| Authentication | Laravel Sanctum (Bearer Token) |

### Services

| Service | Purpose |
|---------|---------|
| `SoilAnalysisService` | Calculate element statuses (low/optimal/high) and pH classification |
| `FertilizerRecommendationService` | Recommend fertilizers and calculate kg/ha amounts |
| `AnalyticsService` | Compute field insights and financial analytics |
| `PayrollService` | Calculate worker payments based on rate and units |
| `WeatherService` | Fetch weather data for field coordinates (mocked) |

---

## Base URL

All endpoints are prefixed with `/api`.

| Environment | Base URL |
|-------------|----------|
| Local Development | `https://maktab.ideal-study.uz/api` |
| Production | `https://maktab.ideal-study.uz/api` |

**Next.js Configuration:**

```typescript
// .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';
```

---

## Common Response & Error Formats

### Success Response

Most endpoints return data wrapped in a `data` key:

```json
{
  "data": { ... }
}
```

For paginated lists:

```json
{
  "data": [...],
  "links": {
    "first": "http://localhost:8000/api/machines?page=1",
    "last": "http://localhost:8000/api/machines?page=5",
    "prev": null,
    "next": "http://localhost:8000/api/machines?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "per_page": 15,
    "to": 15,
    "total": 73
  }
}
```

### Validation Error (422)

```json
{
  "message": "The farm_id field is required.",
  "errors": {
    "farm_id": ["The farm_id field is required."],
    "name": ["The name field is required."]
  }
}
```

### Server Error (500)

```json
{
  "message": "Server Error"
}
```

### Not Found (404)

```json
{
  "message": "No query results for model [App\\Models\\Machine] 999"
}
```

### Unauthorized (401)

```json
{
  "message": "Unauthenticated."
}
```

---

## Autentifikatsiya (Authentication)

API himoyalangan endpointlarga kirish uchun **Bearer Token** autentifikatsiyasidan foydalanadi. Token olish uchun avval `/api/auth/login` orqali tizimga kiring.

### Tokenni so'rovlarga qo'shish

Barcha himoyalangan endpointlarga so'rov yuborishda `Authorization` headerini qo'shing:

```
Authorization: Bearer {your-token}
```

---

### POST `/auth/login`

Tizimga kirish va token olish.

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `email` | required, email |
| `password` | required, string, min:6 |

**Success Response (200):**

```json
{
  "message": "Tizimga muvaffaqiyatli kirdingiz.",
  "data": {
    "user": {
      "id": 1,
      "name": "Administrator",
      "email": "admin@example.com"
    },
    "token": "1|abc123def456ghi789...",
    "token_type": "Bearer"
  }
}
```

**Error Response (422):**

```json
{
  "message": "Email yoki parol noto'g'ri.",
  "errors": {
    "email": ["Email yoki parol noto'g'ri."]
  }
}
```

---

### POST `/auth/register`

Yangi foydalanuvchi ro'yxatdan o'tkazish.

**Request Body:**

```json
{
  "name": "Alisher Navoiy",
  "email": "alisher@example.com",
  "password": "secret123",
  "password_confirmation": "secret123"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `name` | required, string, max:255 |
| `email` | required, email, unique:users |
| `password` | required, string, min:6, confirmed |

**Success Response (201):**

```json
{
  "message": "Ro'yxatdan muvaffaqiyatli o'tdingiz.",
  "data": {
    "user": {
      "id": 2,
      "name": "Alisher Navoiy",
      "email": "alisher@example.com"
    },
    "token": "2|xyz789abc123...",
    "token_type": "Bearer"
  }
}
```

---

### POST `/auth/logout`

Tizimdan chiqish (joriy tokenni o'chirish).

🔒 **Requires Authentication**

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "message": "Tizimdan muvaffaqiyatli chiqdingiz."
}
```

---

### POST `/auth/logout-all`

Barcha qurilmalardan chiqish (barcha tokenlarni o'chirish).

🔒 **Requires Authentication**

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "message": "Barcha qurilmalardan chiqdingiz."
}
```

---

### GET `/auth/profile`

Joriy foydalanuvchi ma'lumotlarini olish.

🔒 **Requires Authentication**

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "data": {
    "id": 1,
    "name": "Administrator",
    "email": "admin@example.com",
    "email_verified_at": null,
    "created_at": "2024-01-15T10:30:00.000000Z",
    "updated_at": "2024-01-15T10:30:00.000000Z"
  }
}
```

---

### PUT `/auth/profile`

Foydalanuvchi profilini yangilash.

🔒 **Requires Authentication**

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "name": "Yangi ism",
  "email": "yangi@example.com"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `name` | sometimes, required, string, max:255 |
| `email` | sometimes, required, email, unique:users (except current) |

**Response (200):**

```json
{
  "message": "Profil muvaffaqiyatli yangilandi.",
  "data": {
    "id": 1,
    "name": "Yangi ism",
    "email": "yangi@example.com"
  }
}
```

---

### PUT `/auth/password`

Parolni o'zgartirish.

🔒 **Requires Authentication**

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "current_password": "eski_parol",
  "password": "yangi_parol",
  "password_confirmation": "yangi_parol"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `current_password` | required, string |
| `password` | required, string, min:6, confirmed |

**Success Response (200):**

```json
{
  "message": "Parol muvaffaqiyatli o'zgartirildi."
}
```

**Error Response (422):**

```json
{
  "message": "Joriy parol noto'g'ri.",
  "errors": {
    "current_password": ["Joriy parol noto'g'ri."]
  }
}
```

---

## Dalalar (Fields) - CRUD API

Ferma dalalarini boshqarish uchun to'liq CRUD API.

### Endpointlar jadvali

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/fields` | Barcha dalalar ro'yxati |
| POST | `/fields` | Yangi dala yaratish |
| GET | `/fields/{id}` | Bitta dalani olish |
| PUT | `/fields/{id}` | Dalani yangilash |
| DELETE | `/fields/{id}` | Dalani o'chirish |
| PUT | `/fields/{id}/geometry` | Geometriyani yangilash |
| GET | `/fields/{id}/weather` | Ob-havo ma'lumoti |

---

### GET `/fields`

Barcha dalalar ro'yxatini olish (pagination bilan).

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `farm_id` | integer | ❌ | Farm bo'yicha filter |
| `page` | integer | ❌ | Sahifa raqami (default: 1) |

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "farm_id": 1,
      "name": "Shimoliy dala",
      "area_ha": 25.5,
      "soil_type": "qora tuproq",
      "geometry": null,
      "center_lat": null,
      "center_lng": null,
      "crop_seasons": []
    },
    {
      "id": 2,
      "farm_id": 1,
      "name": "Janubiy dala",
      "area_ha": 30.0,
      "soil_type": "loam",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[69.20, 41.30], [69.25, 41.30], [69.25, 41.25], [69.20, 41.25], [69.20, 41.30]]]
      },
      "center_lat": 41.275,
      "center_lng": 69.225,
      "crop_seasons": [
        { "id": 1, "crop_type": "bug'doy", "year": 2024 }
      ]
    }
  ],
  "links": {
    "first": "https://maktab.ideal-study.uz/api/fields?page=1",
    "last": "https://maktab.ideal-study.uz/api/fields?page=3",
    "prev": null,
    "next": "https://maktab.ideal-study.uz/api/fields?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 3,
    "per_page": 15,
    "to": 15,
    "total": 42
  }
}
```

---

### POST `/fields`

Yangi dala yaratish.

**Request Body:**

```json
{
  "farm_id": 1,
  "name": "Yangi dala",
  "area_ha": 25.5,
  "soil_type": "qora tuproq"
}
```

**Validation Rules:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `farm_id` | integer | ✅ | `farms` jadvalida mavjud bo'lishi kerak |
| `name` | string | ✅ | max 255 belgi |
| `area_ha` | number | ❌ | 0 dan katta |
| `soil_type` | string | ❌ | max 100 belgi |
| `geometry` | object | ❌ | GeoJSON Polygon (pastda tushuntirilgan) |
| `center_lat` | number | ❌ | -90 dan 90 gacha |
| `center_lng` | number | ❌ | -180 dan 180 gacha |

**Response (201 Created):**

```json
{
  "data": {
    "id": 3,
    "farm_id": 1,
    "name": "Yangi dala",
    "area_ha": 25.5,
    "soil_type": "qora tuproq",
    "geometry": null,
    "center_lat": null,
    "center_lng": null,
    "crop_seasons": []
  }
}
```

---

### GET `/fields/{id}`

Bitta dalani olish (crop seasons bilan).

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Dala ID |

**Response:**

```json
{
  "data": {
    "id": 1,
    "farm_id": 1,
    "name": "Shimoliy dala",
    "area_ha": 25.5,
    "soil_type": "loam",
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[69.1234, 41.1234], [69.2234, 41.2234], [69.1234, 41.1234]]]
    },
    "center_lat": 41.15,
    "center_lng": 69.15,
    "crop_seasons": [
      { "id": 1, "crop_type": "paxta", "year": 2024 },
      { "id": 2, "crop_type": "bug'doy", "year": 2023 }
    ]
  }
}
```

---

### PUT `/fields/{id}`

Dalani yangilash.

**Request Body (faqat o'zgartirmoqchi bo'lgan fieldlar):**

```json
{
  "name": "Yangilangan dala nomi",
  "area_ha": 30.0
}
```

**Response:** Yangilangan dala (GET bilan bir xil format).

---

### DELETE `/fields/{id}`

Dalani o'chirish.

**Response (200):**

```json
{
  "message": "Dala muvaffaqiyatli o'chirildi."
}
```

---

### PUT `/fields/{id}/geometry`

Dala geometriyasini yangilash (Google Maps dan polygon).

**Request Body:**

```json
{
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [69.20, 41.30],
        [69.25, 41.30],
        [69.25, 41.25],
        [69.20, 41.25],
        [69.20, 41.30]
      ]
    ]
  },
  "center_lat": 41.275,
  "center_lng": 69.225
}
```

**Response:** Yangilangan dala.

---

## Geometry tushuntirish (GeoJSON)

`geometry` fieldi **ixtiyoriy** - dala chegarasini xaritada ko'rsatish uchun ishlatiladi.

### Geometry strukturasi:

```
Dala shakli (to'rtburchak misol):

    A -------- B          A = [69.20, 41.30]
    |          |          B = [69.25, 41.30]
    |   DALA   |          C = [69.25, 41.25]
    |          |          D = [69.20, 41.25]
    D -------- C
```

### JSON format:

```json
{
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [69.20, 41.30],   // A nuqta [longitude, latitude]
        [69.25, 41.30],   // B nuqta
        [69.25, 41.25],   // C nuqta
        [69.20, 41.25],   // D nuqta
        [69.20, 41.30]    // A nuqta (yopish uchun)
      ]
    ]
  },
  "center_lat": 41.275,   // Markaz (latitude)
  "center_lng": 69.225    // Markaz (longitude)
}
```

> ⚠️ **Muhim:** Koordinatalar `[longitude, latitude]` tartibda - oldin **kenglik**, keyin **uzunlik**!

### Geometry'siz dala (sodda):

```json
{
  "farm_id": 1,
  "name": "Oddiy dala",
  "area_ha": 25.5,
  "soil_type": "qora tuproq"
}
```

---

## Next.js TypeScript

### Types

```typescript
// types/field.ts

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface CropSeason {
  id: number;
  crop_type: string;
  year: number;
}

export interface Field {
  id: number;
  farm_id: number;
  name: string;
  area_ha: number | null;
  soil_type: string | null;
  geometry: GeoJsonPolygon | null;
  center_lat: number | null;
  center_lng: number | null;
  crop_seasons: CropSeason[];
}

export interface CreateFieldRequest {
  farm_id: number;
  name: string;
  area_ha?: number;
  soil_type?: string;
  geometry?: GeoJsonPolygon;
  center_lat?: number;
  center_lng?: number;
}

export interface UpdateFieldRequest {
  name?: string;
  area_ha?: number;
  soil_type?: string;
  geometry?: GeoJsonPolygon;
  center_lat?: number;
  center_lng?: number;
}

export interface FieldsResponse {
  data: Field[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface FieldResponse {
  data: Field;
}
```

### API Functions

```typescript
// lib/api/fields.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://maktab.ideal-study.uz/api';

// Barcha dalalarni olish
export async function getFields(farmId?: number): Promise<FieldsResponse> {
  const url = farmId 
    ? `${API_BASE}/fields?farm_id=${farmId}` 
    : `${API_BASE}/fields`;
    
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });
  
  if (!response.ok) throw new Error('Dalalarni olishda xatolik');
  return response.json();
}

// Bitta dalani olish
export async function getField(id: number): Promise<FieldResponse> {
  const response = await fetch(`${API_BASE}/fields/${id}`, {
    headers: { 'Accept': 'application/json' },
  });
  
  if (!response.ok) throw new Error('Dalani olishda xatolik');
  return response.json();
}

// Yangi dala yaratish
export async function createField(data: CreateFieldRequest): Promise<FieldResponse> {
  const response = await fetch(`${API_BASE}/fields`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Dala yaratishda xatolik');
  }
  return response.json();
}

// Dalani yangilash
export async function updateField(id: number, data: UpdateFieldRequest): Promise<FieldResponse> {
  const response = await fetch(`${API_BASE}/fields/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Dalani yangilashda xatolik');
  }
  return response.json();
}

// Dalani o'chirish
export async function deleteField(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/fields/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' },
  });
  
  if (!response.ok) throw new Error('Dalani o\'chirishda xatolik');
}
```

### React Component misoli

```tsx
// components/FieldsList.tsx
'use client';

import { useEffect, useState } from 'react';
import { getFields, deleteField, type Field } from '@/lib/api/fields';

export function FieldsList({ farmId }: { farmId: number }) {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFields();
  }, [farmId]);

  async function loadFields() {
    try {
      const { data } = await getFields(farmId);
      setFields(data);
    } catch (error) {
      console.error('Xatolik:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Dalani o\'chirishni xohlaysizmi?')) return;
    
    try {
      await deleteField(id);
      setFields(fields.filter(f => f.id !== id));
    } catch (error) {
      alert('O\'chirishda xatolik!');
    }
  }

  if (loading) return <div>Yuklanmoqda...</div>;

  return (
    <div className="grid gap-4">
      {fields.map((field) => (
        <div key={field.id} className="border p-4 rounded-lg">
          <h3 className="font-bold">{field.name}</h3>
          <p>Maydon: {field.area_ha} ga</p>
          <p>Tuproq turi: {field.soil_type || 'Noma\'lum'}</p>
          <button 
            onClick={() => handleDelete(field.id)}
            className="text-red-500 mt-2"
          >
            O'chirish
          </button>
        </div>
      ))}
    </div>
  );
}
```

```tsx
// components/CreateFieldForm.tsx
'use client';

import { useState } from 'react';
import { createField, type CreateFieldRequest } from '@/lib/api/fields';

export function CreateFieldForm({ farmId, onSuccess }: { 
  farmId: number;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateFieldRequest>({
    farm_id: farmId,
    name: '',
    area_ha: 0,
    soil_type: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await createField(formData);
      onSuccess();
      setFormData({ farm_id: farmId, name: '', area_ha: 0, soil_type: '' });
    } catch (error) {
      alert('Xatolik yuz berdi!');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">Dala nomi *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block font-medium">Maydon (ga)</label>
        <input
          type="number"
          step="0.1"
          value={formData.area_ha}
          onChange={(e) => setFormData({ ...formData, area_ha: parseFloat(e.target.value) })}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Tuproq turi</label>
        <select
          value={formData.soil_type}
          onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Tanlang...</option>
          <option value="qora tuproq">Qora tuproq</option>
          <option value="loam">Loam (aralash)</option>
          <option value="qumloq">Qumloq</option>
          <option value="loyqa">Loyqa</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Saqlanmoqda...' : 'Dala yaratish'}
      </button>
    </form>
  );
}
```

---

## Ob-havo (Weather)

### GET `/fields/{field}/weather`

Get current weather for field location using center coordinates.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `field` | integer | Field ID |

**Response:**

```json
{
  "data": {
    "field_id": 1,
    "temp": 28.5,
    "humidity": 45,
    "wind_speed": 3.2,
    "description": "clear sky"
  }
}
```

**Error (422) - No coordinates:**

```json
{
  "error": "Field #1 does not have center coordinates set."
}
```

> **Note:** Weather data is currently mocked. Real OpenWeather API integration is prepared in `WeatherService`.

---

## Soil Samples

### GET `/soils`

List all soil samples with optional filtering.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `field_id` | integer | No | Filter by field |

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "field_id": 1,
      "name": "Top soil sample #1",
      "humus": 3.2,
      "ph": 6.8,
      "texture": "loam",
      "sampled_at": "2024-01-10T08:00:00+00:00",
      "field": { "id": 1, "name": "Shimoliy dala" },
      "created_at": "2024-01-10T08:00:00.000000Z",
      "updated_at": "2024-01-10T08:00:00.000000Z"
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

---

### GET `/soils/{soil}`

Get a single soil sample.

---

### POST `/soils`

Create a new soil sample.

**Request Body:**

```json
{
  "field_id": 1,
  "name": "Sample A - North corner",
  "humus": 2.8,
  "ph": 7.1,
  "texture": "sandy loam",
  "sampled_at": "2024-01-15"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `field_id` | required, exists:fields,id |
| `name` | nullable, string, max:255 |
| `humus` | nullable, numeric, min:0, max:100 |
| `ph` | nullable, numeric, min:0, max:14 |
| `texture` | nullable, string, max:100 |
| `sampled_at` | nullable, date |

---

### PUT/PATCH `/soils/{soil}`

Update a soil sample. Same fields as POST (all optional).

---

### DELETE `/soils/{soil}`

Delete a soil sample.

**Response:**

```json
{
  "message": "Soil sample deleted successfully."
}
```

---

## Reports

Reports group multiple analyses together for a farm.

### GET `/reports`

List all reports.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `farm_id` | integer | No | Filter by farm |

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "farm_id": 1,
      "name": "Spring 2024 Analysis",
      "description": "Pre-season soil analysis for all fields",
      "reported_at": "2024-03-01",
      "farm": { "id": 1, "name": "Toshkent Fermer Xo'jaligi" },
      "analyses_count": 5,
      "created_at": "2024-03-01T10:00:00.000000Z",
      "updated_at": "2024-03-01T10:00:00.000000Z"
    }
  ]
}
```

---

### POST `/reports`

Create a new report.

**Request Body:**

```json
{
  "farm_id": 1,
  "name": "Spring 2024 Analysis",
  "description": "Pre-season soil analysis for all fields",
  "reported_at": "2024-03-01"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `farm_id` | required, exists:farms,id |
| `name` | required, string, max:255 |
| `description` | nullable, string, max:1000 |
| `reported_at` | required, date |

---

### GET `/reports/{report}`

Get report with all analyses, element values, and fertilizer amounts.

---

### PUT/PATCH `/reports/{report}`

Update a report.

---

### DELETE `/reports/{report}`

Delete a report (cascades to analyses).

---

## Analyses

Analyses contain element measurements for a soil sample.

### GET `/analyses`

List all analyses.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `report_id` | integer | Filter by report |
| `soil_id` | integer | Filter by soil sample |
| `plant_id` | integer | Filter by plant type |

---

### GET `/analyses/{analysis}`

Get analysis with all related data.

**Response:**

```json
{
  "data": {
    "id": 1,
    "report_id": 1,
    "soil_id": 1,
    "plant_id": 1,
    "notes": "Sample taken from field center",
    "report": {
      "id": 1,
      "name": "Spring 2024 Analysis",
      "reported_at": "2024-03-01"
    },
    "soil": {
      "id": 1,
      "name": "Top soil sample #1",
      "ph": 6.8,
      "humus": 3.2
    },
    "plant": {
      "id": 1,
      "name": "Cotton"
    },
    "element_values": [
      {
        "id": 1,
        "analysis_id": 1,
        "element_id": 1,
        "value": 15.5,
        "difference_code": -1,
        "status": "low",
        "element": {
          "id": 1,
          "name": "Nitrogen",
          "code": "N",
          "unit": "mg/kg",
          "optimal_min": 20,
          "optimal_max": 50
        }
      },
      {
        "id": 2,
        "analysis_id": 1,
        "element_id": 2,
        "value": 25.0,
        "difference_code": 0,
        "status": "optimal",
        "element": {
          "id": 2,
          "name": "Phosphorus",
          "code": "P",
          "unit": "mg/kg",
          "optimal_min": 15,
          "optimal_max": 40
        }
      }
    ],
    "fertilizer_amounts": [
      {
        "id": 1,
        "analysis_id": 1,
        "fertilizer_id": 1,
        "amount_kg_per_ha": 173.9,
        "fertilizer": {
          "id": 1,
          "name": "Urea",
          "n_percent": 46,
          "p_percent": 0,
          "k_percent": 0,
          "price_per_kg": 5000
        }
      }
    ],
    "created_at": "2024-03-01T10:30:00.000000Z",
    "updated_at": "2024-03-01T10:30:00.000000Z"
  }
}
```

---

### POST `/analyses`

Create a new analysis with element values.

The `SoilAnalysisService` automatically:
1. Calculates `status` for each element (`low`, `optimal`, `high`, `unknown`)
2. Calculates `difference_code` (-1 for low, 0 for optimal, 1 for high)

The `FertilizerRecommendationService` automatically:
1. Identifies deficient (low) elements
2. Calculates required nutrient amounts (kg/ha)
3. Recommends fertilizers and application rates

**Request Body:**

```json
{
  "report_id": 1,
  "soil_id": 1,
  "plant_id": 1,
  "notes": "Sample taken from field center",
  "elements": [
    { "element_id": 1, "value": 15.5 },
    { "element_id": 2, "value": 25.0 },
    { "element_id": 3, "value": 180.0 }
  ]
}
```

> **Note:** You can use either `elements` or `element_values` as the key name.

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `report_id` | required, exists:reports,id |
| `soil_id` | required, exists:soils,id |
| `plant_id` | nullable, exists:plants,id |
| `notes` | nullable, string, max:2000 |
| `elements` | required (or element_values), array, min:1 |
| `elements.*.element_id` | required, exists:elements,id |
| `elements.*.value` | required, numeric, min:0 |

**Element Status Calculation Logic:**

| Condition | Status | Difference Code |
|-----------|--------|-----------------|
| `min` or `max` is null | `unknown` | 0 |
| `value < optimal_min` | `low` | -1 |
| `value > optimal_max` | `high` | 1 |
| otherwise | `optimal` | 0 |

---

### PUT/PATCH `/analyses/{analysis}`

Update an analysis. If `elements` are provided, they are recalculated.

---

### DELETE `/analyses/{analysis}`

Delete an analysis.

---

## Conclusions (Fertilizer Recommendations)

### GET `/analyses/{analysis}/conclusions/fertilizers`

Get all available fertilizers for an analysis.

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Urea",
      "description": "High nitrogen fertilizer",
      "n_percent": 46,
      "p_percent": 0,
      "k_percent": 0,
      "price_per_kg": 5000
    },
    {
      "id": 3,
      "name": "DAP",
      "description": "Diammonium Phosphate",
      "n_percent": 18,
      "p_percent": 46,
      "k_percent": 0,
      "price_per_kg": 7000
    }
  ],
  "analysis_id": 1
}
```

---

### GET `/analyses/{analysis}/conclusions/amounts`

Get calculated fertilizer recommendations based on element deficiencies.

**Response:**

```json
{
  "data": [
    {
      "analysis_id": 1,
      "element_id": 1,
      "element_code": "N",
      "fertilizer_id": 1,
      "fertilizer_name": "Urea",
      "required_nutrient_kg_per_ha": 80.0,
      "fertilizer_kg_per_ha": 173.9,
      "basis": "N_low_default"
    },
    {
      "analysis_id": 1,
      "element_id": 2,
      "element_code": "P",
      "fertilizer_id": 3,
      "fertilizer_name": "DAP",
      "required_nutrient_kg_per_ha": 100.0,
      "fertilizer_kg_per_ha": 217.4,
      "basis": "P2O5_deficiency"
    }
  ],
  "analysis_id": 1,
  "total_recommendations": 2
}
```

**Deficiency Calculation (from FertilizerRecommendationService):**

| Element | Formula | Basis |
|---------|---------|-------|
| N | Fixed 80 kg/ha when low | `N_low_default` |
| P/P2O5 | `(optimal_min - value) × 20` kg/ha | `P2O5_deficiency` |
| K/K2O | `(optimal_min - value) × 10` kg/ha | `K2O_deficiency` |

**Fertilizer Rate Calculation:**

```
fertilizer_kg_per_ha = required_nutrient_kg_per_ha / (nutrient_percent / 100)
```

---

## Elements (Reference Data)

### GET `/elements`

List all soil elements with optimal ranges.

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Nitrogen",
      "code": "N",
      "unit": "mg/kg",
      "optimal_min": 20,
      "optimal_max": 50
    },
    {
      "id": 2,
      "name": "Phosphorus",
      "code": "P",
      "unit": "mg/kg",
      "optimal_min": 15,
      "optimal_max": 40
    },
    {
      "id": 3,
      "name": "Potassium",
      "code": "K",
      "unit": "mg/kg",
      "optimal_min": 100,
      "optimal_max": 250
    }
  ]
}
```

---

### GET `/elements/{element}`

Get a single element.

---

## Plants (Reference Data)

### GET `/plants`

List all plant types.

**Response:**

```json
{
  "data": [
    { "id": 1, "name": "Cotton", "description": "Cash crop widely grown in Uzbekistan" },
    { "id": 2, "name": "Wheat", "description": "Winter and spring wheat varieties" },
    { "id": 3, "name": "Corn", "description": "Maize for grain and silage" }
  ]
}
```

---

### GET `/plants/{plant}`

Get a single plant.

---

## Fertilizers (Reference Data)

### GET `/fertilizers`

List all fertilizers with NPK composition.

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Urea",
      "description": "High nitrogen fertilizer",
      "n_percent": 46,
      "p_percent": 0,
      "k_percent": 0,
      "price_per_kg": 5000
    },
    {
      "id": 6,
      "name": "NPK 15-15-15",
      "description": "Balanced compound fertilizer",
      "n_percent": 15,
      "p_percent": 15,
      "k_percent": 15,
      "price_per_kg": 6000
    }
  ]
}
```

---

### GET `/fertilizers/{fertilizer}`

Get a single fertilizer.

---

## Consequences (Plant/Period Element Norms)

Consequences define target element ranges for specific plants and growth periods.

### GET `/consequences`

List all consequences.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `plant_id` | integer | Filter by plant |
| `element_id` | integer | Filter by element |

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "plant_id": 1,
      "element_id": 1,
      "period_name": "before sowing",
      "target_min": 25,
      "target_max": 40,
      "plant": { "id": 1, "name": "Cotton" },
      "element": { "id": 1, "name": "Nitrogen", "code": "N", "unit": "mg/kg" }
    }
  ]
}
```

---

### POST `/consequences`

Create a new consequence.

**Request Body:**

```json
{
  "plant_id": 1,
  "element_id": 1,
  "period_name": "tillering",
  "target_min": 30,
  "target_max": 45
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `plant_id` | required, exists:plants,id |
| `element_id` | required, exists:elements,id |
| `period_name` | required, string, max:100 |
| `target_min` | nullable, numeric, min:0 |
| `target_max` | nullable, numeric, min:0, gte:target_min |

---

### GET `/consequences/plant/{plant}/period`

Get consequences for a specific plant and period.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | Yes | Period name (e.g., "before sowing") |

**Example:** `GET /consequences/plant/1/period?period=before%20sowing`

---

## Machines

### GET `/machines`

List all machines.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `farm_id` | integer | Filter by farm |

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "farm_id": 1,
      "name": "Traktor #1",
      "type": "tractor",
      "brand": "John Deere",
      "model": "6M Series",
      "year": 2020,
      "engine_hours": 1250.5,
      "service_interval_hours": 500,
      "last_service_hours": 1000,
      "last_service_date": "2024-01-15",
      "created_at": "2023-06-01T10:00:00.000000Z",
      "updated_at": "2024-01-15T10:00:00.000000Z"
    }
  ]
}
```

---

### GET `/machines/{machine}`

Get a single machine.

---

### POST `/machines`

Create a new machine.

**Request Body:**

```json
{
  "farm_id": 1,
  "name": "Traktor #2",
  "type": "tractor",
  "brand": "Case IH",
  "model": "Magnum 380",
  "year": 2022,
  "engine_hours": 0,
  "service_interval_hours": 500,
  "last_service_hours": 0,
  "last_service_date": "2022-06-01"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `farm_id` | required, exists:farms,id |
| `name` | required, string, max:255 |
| `type` | required, string, in:tractor,combine,implement,other |
| `brand` | nullable, string, max:255 |
| `model` | nullable, string, max:255 |
| `year` | nullable, integer, min:1950, max:2100 |
| `engine_hours` | nullable, numeric, min:0 |
| `service_interval_hours` | nullable, numeric, min:0 |
| `last_service_hours` | nullable, numeric, min:0 |
| `last_service_date` | nullable, date |

---

### PUT/PATCH `/machines/{machine}`

Update a machine.

---

### DELETE `/machines/{machine}`

Delete a machine.

---

## Machine Maintenance Records

### GET `/machines/{machine}/maintenance`

List maintenance records for a machine.

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "machine_id": 1,
      "date": "2024-01-15",
      "type": "oil_change",
      "cost": 500000,
      "engine_hours_at_service": 1000,
      "description": "Changed engine oil and filter"
    }
  ]
}
```

---

### POST `/machines/{machine}/maintenance`

Create a maintenance record. Also updates machine's `last_service_date` and `last_service_hours`.

**Request Body:**

```json
{
  "date": "2024-06-15",
  "type": "oil_change",
  "cost": 500000,
  "engine_hours_at_service": 1250,
  "description": "Changed engine oil and filter"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `date` | required, date |
| `type` | required, string, max:255 |
| `cost` | nullable, numeric, min:0 |
| `engine_hours_at_service` | nullable, numeric, min:0 |
| `description` | nullable, string, max:1000 |

---

## Machine Work Logs

### GET `/machines/{machine}/work-logs`

List work logs for a machine.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `date_from` | date | Filter from date |
| `date_to` | date | Filter to date |

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "machine_id": 1,
      "farm_id": 1,
      "field_id": 1,
      "crop_season_id": 1,
      "date": "2024-03-15",
      "operation": "plowing",
      "hours": 8.5,
      "area_ha": 12.0,
      "fuel_liters": 85.0,
      "field": { "id": 1, "name": "Shimoliy dala" }
    }
  ]
}
```

---

### POST `/machines/{machine}/work-logs`

Create a work log. Also increments machine's `engine_hours`.

**Request Body:**

```json
{
  "farm_id": 1,
  "field_id": 1,
  "crop_season_id": 1,
  "date": "2024-03-15",
  "operation": "plowing",
  "hours": 8.5,
  "area_ha": 12.0,
  "fuel_liters": 85.0
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `farm_id` | required, exists:farms,id |
| `field_id` | nullable, exists:fields,id |
| `crop_season_id` | nullable, exists:crop_seasons,id |
| `date` | required, date |
| `operation` | required, string, max:255 |
| `hours` | nullable, numeric, min:0 |
| `area_ha` | nullable, numeric, min:0 |
| `fuel_liters` | nullable, numeric, min:0 |

---

## Workers

### GET `/workers`

List all workers.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `farm_id` | integer | Filter by farm |

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "farm_id": 1,
      "name": "Alisher Karimov",
      "role": "tractor driver",
      "payment_type": "daily",
      "rate": 150000,
      "created_at": "2024-01-01T10:00:00.000000Z",
      "updated_at": "2024-01-01T10:00:00.000000Z"
    }
  ]
}
```

---

### POST `/workers`

Create a new worker.

**Request Body:**

```json
{
  "farm_id": 1,
  "name": "Bobur Toshmatov",
  "role": "agronomist",
  "payment_type": "monthly",
  "rate": 5000000
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `farm_id` | required, exists:farms,id |
| `name` | required, string, max:255 |
| `role` | nullable, string, max:255 |
| `payment_type` | required, in:monthly,daily,per_ha,per_ton,hourly |
| `rate` | required, numeric, min:0 |

**Payment Types:**
| Type | Description |
|------|-------------|
| `monthly` | Fixed monthly salary |
| `daily` | Rate per day worked |
| `per_ha` | Rate per hectare processed |
| `per_ton` | Rate per ton harvested |
| `hourly` | Rate per hour worked |

---

### GET `/workers/{worker}`

Get a single worker.

---

### PUT/PATCH `/workers/{worker}`

Update a worker.

---

### DELETE `/workers/{worker}`

Delete a worker.

---

## Worker Work Logs

### GET `/worker-work-logs`

List worker work logs with filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `farm_id` | integer | Filter by farm |
| `worker_id` | integer | Filter by worker |
| `field_id` | integer | Filter by field |
| `crop_season_id` | integer | Filter by crop season |
| `date_from` | date | Filter from date |
| `date_to` | date | Filter to date |

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "worker_id": 1,
      "farm_id": 1,
      "field_id": 1,
      "crop_season_id": 1,
      "date": "2024-03-15",
      "unit_type": "day",
      "units": 1,
      "calculated_amount": 150000,
      "worker": {
        "id": 1,
        "name": "Alisher Karimov",
        "role": "tractor driver"
      },
      "field": { "id": 1, "name": "Shimoliy dala" }
    }
  ]
}
```

---

### POST `/worker-work-logs`

Create a work log. The `calculated_amount` is automatically computed using `PayrollService`:

```
calculated_amount = worker.rate × units
```

**Request Body:**

```json
{
  "worker_id": 1,
  "farm_id": 1,
  "field_id": 1,
  "crop_season_id": 1,
  "date": "2024-03-15",
  "unit_type": "day",
  "units": 1
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `worker_id` | required, exists:workers,id |
| `farm_id` | required, exists:farms,id |
| `field_id` | nullable, exists:fields,id |
| `crop_season_id` | nullable, exists:crop_seasons,id |
| `date` | required, date |
| `unit_type` | required, in:day,ha,ton,hour,month |
| `units` | required, numeric, min:0 |

---

## Expense Categories

### GET `/expense-categories`

List all expense categories.

**Response:**

```json
{
  "data": [
    { "id": 1, "name": "Seed", "code": "seed" },
    { "id": 2, "name": "Fertilizer", "code": "fertilizer" },
    { "id": 3, "name": "Pesticide", "code": "pesticide" },
    { "id": 4, "name": "Fuel", "code": "fuel" },
    { "id": 5, "name": "Labor", "code": "labor" },
    { "id": 6, "name": "Repair", "code": "repair" },
    { "id": 7, "name": "Water", "code": "water" },
    { "id": 8, "name": "Lab analysis", "code": "lab" },
    { "id": 9, "name": "Other", "code": "other" }
  ]
}
```

---

## Expenses

### GET `/expenses`

List expenses with filtering.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `farm_id` | integer | **Yes** | Filter by farm |
| `field_id` | integer | No | Filter by field |
| `crop_season_id` | integer | No | Filter by crop season |
| `category_id` | integer | No | Filter by expense category |
| `date_from` | date | No | Filter from date |
| `date_to` | date | No | Filter to date |

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "farm_id": 1,
      "field_id": 1,
      "crop_season_id": 1,
      "expense_category_id": 2,
      "date": "2024-03-10",
      "amount": 2500000,
      "description": "Urea fertilizer 500kg",
      "category": { "id": 2, "name": "Fertilizer", "code": "fertilizer" },
      "field": { "id": 1, "name": "Shimoliy dala" },
      "crop_season": { "id": 1, "crop_type": "cotton", "year": 2024 }
    }
  ]
}
```

---

### POST `/expenses`

Create a new expense.

**Request Body:**

```json
{
  "farm_id": 1,
  "field_id": 1,
  "crop_season_id": 1,
  "expense_category_id": 2,
  "date": "2024-03-10",
  "amount": 2500000,
  "description": "Urea fertilizer 500kg"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `farm_id` | required, exists:farms,id |
| `field_id` | nullable, exists:fields,id |
| `crop_season_id` | nullable, exists:crop_seasons,id |
| `expense_category_id` | required, exists:expense_categories,id |
| `date` | required, date |
| `amount` | required, numeric, min:0 |
| `description` | nullable, string, max:500 |

---

## Analytics

### GET `/analytics/field-insights`

Get field-level analytics for a farm.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `farm_id` | integer | **Yes** | Farm ID |
| `season_id` | integer | No | Filter by crop season |

**Response:**

```json
{
  "data": [
    {
      "field_id": 1,
      "name": "Shimoliy dala",
      "area_ha": 25.5,
      "soil_health_score": 78,
      "cost_per_ha": 1200000,
      "total_expenses": 30600000,
      "profit": 45000000
    },
    {
      "field_id": 2,
      "name": "Janubiy dala",
      "area_ha": 18.0,
      "soil_health_score": 85,
      "cost_per_ha": 980000,
      "total_expenses": 17640000,
      "profit": 32000000
    }
  ]
}
```

> **Note:** `soil_health_score` is currently computed as a placeholder (70-90 range). Future versions will calculate this from actual soil analysis data.

---

### GET `/analytics/finance`

Get financial analytics for a farm.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `farm_id` | integer | **Yes** | Farm ID |
| `year` | integer | No | Filter by year (2000-2100) |

**Response:**

```json
{
  "data": {
    "farm_id": 1,
    "farm_name": "Toshkent Fermer Xo'jaligi",
    "year": 2024,
    "expenses_by_category": [
      {
        "category_id": 2,
        "category_name": "Fertilizer",
        "category_code": "fertilizer",
        "total": 15000000
      },
      {
        "category_id": 4,
        "category_name": "Fuel",
        "category_code": "fuel",
        "total": 8500000
      },
      {
        "category_id": 5,
        "category_name": "Labor",
        "category_code": "labor",
        "total": 12000000
      }
    ],
    "crop_season_profits": [
      {
        "season_id": 1,
        "crop_type": "cotton",
        "year": 2024,
        "harvest_tons": 85.5,
        "total_income": 120000000,
        "total_cost": 45000000,
        "profit": 75000000
      }
    ],
    "totals": {
      "total_expenses": 35500000,
      "total_income": 120000000,
      "total_profit": 75000000
    },
    "summary": "Farm 'Toshkent Fermer Xo'jaligi' in 2024: Total expenses of 35500000.00, total income of 120000000.00, resulting in a profit of 75000000.00. This analysis can be enhanced with AI-powered insights in future updates."
  }
}
```

---

## TypeScript Types & Next.js Usage

### Common Types

```typescript
// lib/types/api.ts

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
}

// Auth response
export interface AuthResponse {
  message: string;
  data: {
    user: AuthUser;
    token: string;
    token_type: 'Bearer';
  };
}

// Authenticated user
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

// Validation error response
export interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}

// GeoJSON Polygon
export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}
```

### Entity Types

```typescript
// lib/types/entities.ts

export interface Field {
  id: number;
  farm_id: number;
  name: string;
  area_ha: number | null;
  soil_type: string | null;
  geometry: GeoJsonPolygon | null;
  center_lat: number | null;
  center_lng: number | null;
  crop_seasons?: CropSeasonSummary[];
  created_at: string;
  updated_at: string;
}

export interface CropSeasonSummary {
  id: number;
  crop_type: string;
  year: number;
}

export interface Weather {
  field_id: number;
  temp: number;
  humidity: number;
  wind_speed: number;
  description: string;
}

export interface Soil {
  id: number;
  field_id: number;
  name: string | null;
  humus: number | null;
  ph: number | null;
  texture: string | null;
  sampled_at: string | null;
  field?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: number;
  farm_id: number;
  name: string;
  description: string | null;
  reported_at: string;
  farm?: { id: number; name: string };
  analyses?: Analysis[];
  analyses_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Element {
  id: number;
  name: string;
  code: string;
  unit: string;
  optimal_min: number | null;
  optimal_max: number | null;
  created_at: string;
  updated_at: string;
}

export interface Plant {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Fertilizer {
  id: number;
  name: string;
  description: string | null;
  n_percent: number | null;
  p_percent: number | null;
  k_percent: number | null;
  price_per_kg: number | null;
  created_at: string;
  updated_at: string;
}

export type ElementStatus = 'low' | 'optimal' | 'high' | 'unknown';
export type DifferenceCode = -1 | 0 | 1;

export interface AnalysisElementValue {
  id: number;
  analysis_id: number;
  element_id: number;
  value: number;
  difference_code: DifferenceCode;
  status: ElementStatus;
  element?: Element;
  created_at: string;
  updated_at: string;
}

export interface AnalysisFertilizerAmount {
  id: number;
  analysis_id: number;
  fertilizer_id: number;
  amount_kg_per_ha: number;
  fertilizer?: Fertilizer;
  created_at: string;
  updated_at: string;
}

export interface Analysis {
  id: number;
  report_id: number;
  soil_id: number;
  plant_id: number | null;
  notes: string | null;
  report?: { id: number; name: string; reported_at: string };
  soil?: { id: number; name: string; ph: number | null; humus: number | null };
  plant?: { id: number; name: string } | null;
  element_values?: AnalysisElementValue[];
  fertilizer_amounts?: AnalysisFertilizerAmount[];
  created_at: string;
  updated_at: string;
}

export interface FertilizerRecommendation {
  analysis_id: number;
  element_id: number;
  element_code: string;
  fertilizer_id: number;
  fertilizer_name: string;
  required_nutrient_kg_per_ha: number;
  fertilizer_kg_per_ha: number;
  basis: string;
}

export interface Machine {
  id: number;
  farm_id: number;
  name: string;
  type: 'tractor' | 'combine' | 'implement' | 'other';
  brand: string | null;
  model: string | null;
  year: number | null;
  engine_hours: number;
  service_interval_hours: number | null;
  last_service_hours: number | null;
  last_service_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRecord {
  id: number;
  machine_id: number;
  date: string;
  type: string;
  cost: number;
  engine_hours_at_service: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MachineWorkLog {
  id: number;
  machine_id: number;
  farm_id: number;
  field_id: number | null;
  crop_season_id: number | null;
  date: string;
  operation: string;
  hours: number | null;
  area_ha: number | null;
  fuel_liters: number | null;
  machine?: { id: number; name: string };
  field?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

export type PaymentType = 'monthly' | 'daily' | 'per_ha' | 'per_ton' | 'hourly';
export type UnitType = 'day' | 'ha' | 'ton' | 'hour' | 'month';

export interface Worker {
  id: number;
  farm_id: number;
  name: string;
  role: string | null;
  payment_type: PaymentType;
  rate: number;
  created_at: string;
  updated_at: string;
}

export interface WorkerWorkLog {
  id: number;
  worker_id: number;
  farm_id: number;
  field_id: number | null;
  crop_season_id: number | null;
  date: string;
  unit_type: UnitType;
  units: number;
  calculated_amount: number;
  worker?: { id: number; name: string; role: string | null };
  field?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  code: string;
}

export interface Expense {
  id: number;
  farm_id: number;
  field_id: number | null;
  crop_season_id: number | null;
  expense_category_id: number;
  date: string;
  amount: number;
  description: string | null;
  category?: ExpenseCategory;
  field?: { id: number; name: string };
  crop_season?: { id: number; crop_type: string; year: number };
  created_at: string;
  updated_at: string;
}

export interface FieldInsight {
  field_id: number;
  name: string;
  area_ha: number | null;
  soil_health_score: number;
  cost_per_ha: number;
  total_expenses: number;
  profit: number;
}

export interface ExpenseByCategory {
  category_id: number;
  category_name: string;
  category_code: string;
  total: number;
}

export interface CropSeasonProfit {
  season_id: number;
  crop_type: string;
  year: number;
  harvest_tons: number | null;
  total_income: number;
  total_cost: number;
  profit: number;
}

export interface FinanceAnalytics {
  farm_id: number;
  farm_name: string;
  year: number | null;
  expenses_by_category: ExpenseByCategory[];
  crop_season_profits: CropSeasonProfit[];
  totals: {
    total_expenses: number;
    total_income: number;
    total_profit: number;
  };
  summary: string;
}
```

### Request Types

```typescript
// lib/types/requests.ts

// Auth requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateFieldGeometryRequest {
  geometry: GeoJsonPolygon;
  center_lat: number;
  center_lng: number;
}

export interface CreateSoilRequest {
  field_id: number;
  name?: string;
  humus?: number;
  ph?: number;
  texture?: string;
  sampled_at?: string;
}

export interface CreateReportRequest {
  farm_id: number;
  name: string;
  description?: string;
  reported_at: string;
}

export interface ElementValueInput {
  element_id: number;
  value: number;
}

export interface CreateAnalysisRequest {
  report_id: number;
  soil_id: number;
  plant_id?: number;
  notes?: string;
  elements: ElementValueInput[];
}

export interface CreateMachineRequest {
  farm_id: number;
  name: string;
  type: 'tractor' | 'combine' | 'implement' | 'other';
  brand?: string;
  model?: string;
  year?: number;
  engine_hours?: number;
  service_interval_hours?: number;
  last_service_hours?: number;
  last_service_date?: string;
}

export interface CreateMaintenanceRecordRequest {
  date: string;
  type: string;
  cost?: number;
  engine_hours_at_service?: number;
  description?: string;
}

export interface CreateMachineWorkLogRequest {
  farm_id: number;
  field_id?: number;
  crop_season_id?: number;
  date: string;
  operation: string;
  hours?: number;
  area_ha?: number;
  fuel_liters?: number;
}

export interface CreateWorkerRequest {
  farm_id: number;
  name: string;
  role?: string;
  payment_type: PaymentType;
  rate: number;
}

export interface CreateWorkerWorkLogRequest {
  worker_id: number;
  farm_id: number;
  field_id?: number;
  crop_season_id?: number;
  date: string;
  unit_type: UnitType;
  units: number;
}

export interface CreateExpenseRequest {
  farm_id: number;
  field_id?: number;
  crop_season_id?: number;
  expense_category_id: number;
  date: string;
  amount: number;
  description?: string;
}
```

### API Client

```typescript
// lib/api/client.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';

class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(response.status, data, data.message ?? 'API Error');
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
```

### API Functions

```typescript
// lib/api/auth.ts

import { api } from './client';
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../types';

// Token saqlash uchun
let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
}

// Auth headerlarini olish
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', data);
  setAuthToken(response.data.token);
  return response;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', data);
  setAuthToken(response.data.token);
  return response;
}

export async function logout(): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('/auth/logout', {}, {
    headers: getAuthHeaders(),
  });
  setAuthToken(null);
  return response;
}

export async function getProfile(): Promise<{ data: AuthUser }> {
  return api.get('/auth/profile', { headers: getAuthHeaders() });
}

export async function updateProfile(data: UpdateProfileRequest): Promise<{
  message: string;
  data: AuthUser;
}> {
  return api.put('/auth/profile', data, { headers: getAuthHeaders() });
}

export async function changePassword(data: ChangePasswordRequest): Promise<{
  message: string;
}> {
  return api.put('/auth/password', data, { headers: getAuthHeaders() });
}
```

```typescript
// lib/api/fields.ts

import { api } from './client';
import type { ApiResponse, Field, Weather, UpdateFieldGeometryRequest } from '../types';

export async function getField(fieldId: number): Promise<ApiResponse<Field>> {
  return api.get(`/fields/${fieldId}`);
}

export async function updateFieldGeometry(
  fieldId: number,
  data: UpdateFieldGeometryRequest
): Promise<ApiResponse<Field>> {
  return api.put(`/fields/${fieldId}/geometry`, data);
}

export async function getFieldWeather(fieldId: number): Promise<ApiResponse<Weather>> {
  return api.get(`/fields/${fieldId}/weather`);
}
```

```typescript
// lib/api/analyses.ts

import { api } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  Analysis,
  FertilizerRecommendation,
  Fertilizer,
  CreateAnalysisRequest,
} from '../types';

export async function getAnalyses(params?: {
  report_id?: number;
  soil_id?: number;
  plant_id?: number;
}): Promise<PaginatedResponse<Analysis>> {
  const searchParams = new URLSearchParams();
  if (params?.report_id) searchParams.set('report_id', String(params.report_id));
  if (params?.soil_id) searchParams.set('soil_id', String(params.soil_id));
  if (params?.plant_id) searchParams.set('plant_id', String(params.plant_id));
  
  const query = searchParams.toString();
  return api.get(`/analyses${query ? `?${query}` : ''}`);
}

export async function getAnalysis(id: number): Promise<ApiResponse<Analysis>> {
  return api.get(`/analyses/${id}`);
}

export async function createAnalysis(
  data: CreateAnalysisRequest
): Promise<ApiResponse<Analysis>> {
  return api.post('/analyses', data);
}

export async function getAnalysisFertilizers(
  analysisId: number
): Promise<{ data: Fertilizer[]; analysis_id: number }> {
  return api.get(`/analyses/${analysisId}/conclusions/fertilizers`);
}

export async function getAnalysisAmounts(
  analysisId: number
): Promise<{
  data: FertilizerRecommendation[];
  analysis_id: number;
  total_recommendations: number;
}> {
  return api.get(`/analyses/${analysisId}/conclusions/amounts`);
}
```

```typescript
// lib/api/analytics.ts

import { api } from './client';
import type { ApiResponse, FieldInsight, FinanceAnalytics } from '../types';

export async function getFieldInsights(
  farmId: number,
  seasonId?: number
): Promise<ApiResponse<FieldInsight[]>> {
  const params = new URLSearchParams({ farm_id: String(farmId) });
  if (seasonId) params.set('season_id', String(seasonId));
  
  return api.get(`/analytics/field-insights?${params}`);
}

export async function getFinanceAnalytics(
  farmId: number,
  year?: number
): Promise<ApiResponse<FinanceAnalytics>> {
  const params = new URLSearchParams({ farm_id: String(farmId) });
  if (year) params.set('year', String(year));
  
  return api.get(`/analytics/finance?${params}`);
}
```

### React Component Examples

```tsx
// components/LoginForm.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/auth';
import type { LoginRequest } from '@/lib/types';

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login(formData);
      console.log('Tizimga kirdingiz:', response.data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center">Tizimga kirish</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Parol</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Kirish...' : 'Kirish'}
      </button>
    </form>
  );
}
```

```tsx
// components/FieldInsightsCard.tsx

'use client';

import { useEffect, useState } from 'react';
import { getFieldInsights } from '@/lib/api/analytics';
import type { FieldInsight } from '@/lib/types';

interface Props {
  farmId: number;
  seasonId?: number;
}

export function FieldInsightsCard({ farmId, seasonId }: Props) {
  const [insights, setInsights] = useState<FieldInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const response = await getFieldInsights(farmId, seasonId);
        setInsights(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load insights');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [farmId, seasonId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight) => (
        <div key={insight.field_id} className="rounded-lg border p-4">
          <h3 className="font-semibold">{insight.name}</h3>
          <div className="mt-2 space-y-1 text-sm">
            <p>Area: {insight.area_ha} ha</p>
            <p>Soil Health: {insight.soil_health_score}/100</p>
            <p>Cost/ha: {insight.cost_per_ha.toLocaleString()} so'm</p>
            <p className="font-medium text-green-600">
              Profit: {insight.profit.toLocaleString()} so'm
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

```tsx
// components/FertilizerRecommendations.tsx

'use client';

import { useEffect, useState } from 'react';
import { getAnalysisAmounts } from '@/lib/api/analyses';
import type { FertilizerRecommendation } from '@/lib/types';

interface Props {
  analysisId: number;
}

export function FertilizerRecommendations({ analysisId }: Props) {
  const [recommendations, setRecommendations] = useState<FertilizerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await getAnalysisAmounts(analysisId);
        setRecommendations(response.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [analysisId]);

  if (loading) return <div>Calculating recommendations...</div>;

  if (recommendations.length === 0) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-green-800">
        All soil elements are within optimal ranges. No fertilizer needed!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recommended Fertilization Plan</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Deficient Element</th>
            <th className="py-2 text-left">Fertilizer</th>
            <th className="py-2 text-right">Required (kg/ha)</th>
            <th className="py-2 text-right">Apply (kg/ha)</th>
          </tr>
        </thead>
        <tbody>
          {recommendations.map((rec, idx) => (
            <tr key={idx} className="border-b">
              <td className="py-2">{rec.element_code}</td>
              <td className="py-2">{rec.fertilizer_name}</td>
              <td className="py-2 text-right">
                {rec.required_nutrient_kg_per_ha.toFixed(1)}
              </td>
              <td className="py-2 text-right font-medium">
                {rec.fertilizer_kg_per_ha.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Appendix: Full Route List

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/auth/login` | AuthController@login | Tizimga kirish |
| POST | `/auth/register` | AuthController@register | Ro'yxatdan o'tish |
| POST | `/auth/logout` | AuthController@logout | 🔒 Tizimdan chiqish |
| POST | `/auth/logout-all` | AuthController@logoutAll | 🔒 Barcha qurilmalardan chiqish |
| GET | `/auth/profile` | AuthController@profile | 🔒 Profil ma'lumotlari |
| PUT | `/auth/profile` | AuthController@updateProfile | 🔒 Profilni yangilash |
| PUT | `/auth/password` | AuthController@changePassword | 🔒 Parolni o'zgartirish |
| GET | `/fields/{field}` | FieldController@show | Get field details |
| PUT | `/fields/{field}/geometry` | FieldGeometryController@updateGeometry | Update field geometry |
| GET | `/fields/{field}/weather` | FieldWeatherController@show | Get field weather |
| GET | `/machines` | MachineController@index | List machines |
| POST | `/machines` | MachineController@store | Create machine |
| GET | `/machines/{machine}` | MachineController@show | Get machine |
| PUT/PATCH | `/machines/{machine}` | MachineController@update | Update machine |
| DELETE | `/machines/{machine}` | MachineController@destroy | Delete machine |
| GET | `/machines/{machine}/maintenance` | MachineMaintenanceController@index | List maintenance |
| POST | `/machines/{machine}/maintenance` | MachineMaintenanceController@store | Create maintenance |
| GET | `/machines/{machine}/work-logs` | MachineWorkLogController@index | List work logs |
| POST | `/machines/{machine}/work-logs` | MachineWorkLogController@store | Create work log |
| GET | `/workers` | WorkerController@index | List workers |
| POST | `/workers` | WorkerController@store | Create worker |
| GET | `/workers/{worker}` | WorkerController@show | Get worker |
| PUT/PATCH | `/workers/{worker}` | WorkerController@update | Update worker |
| DELETE | `/workers/{worker}` | WorkerController@destroy | Delete worker |
| GET | `/worker-work-logs` | WorkerWorkLogController@index | List work logs |
| POST | `/worker-work-logs` | WorkerWorkLogController@store | Create work log |
| GET | `/expense-categories` | ExpenseCategoryController@index | List categories |
| GET | `/expenses` | ExpenseController@index | List expenses |
| POST | `/expenses` | ExpenseController@store | Create expense |
| GET | `/analytics/field-insights` | AnalyticsController@fieldInsights | Get field analytics |
| GET | `/analytics/finance` | AnalyticsController@finance | Get finance analytics |
| GET | `/elements` | ElementController@index | List elements |
| GET | `/elements/{element}` | ElementController@show | Get element |
| GET | `/plants` | PlantController@index | List plants |
| GET | `/plants/{plant}` | PlantController@show | Get plant |
| GET | `/fertilizers` | FertilizerController@index | List fertilizers |
| GET | `/fertilizers/{fertilizer}` | FertilizerController@show | Get fertilizer |
| GET | `/soils` | SoilController@index | List soils |
| POST | `/soils` | SoilController@store | Create soil |
| GET | `/soils/{soil}` | SoilController@show | Get soil |
| PUT/PATCH | `/soils/{soil}` | SoilController@update | Update soil |
| DELETE | `/soils/{soil}` | SoilController@destroy | Delete soil |
| GET | `/reports` | ReportController@index | List reports |
| POST | `/reports` | ReportController@store | Create report |
| GET | `/reports/{report}` | ReportController@show | Get report |
| PUT/PATCH | `/reports/{report}` | ReportController@update | Update report |
| DELETE | `/reports/{report}` | ReportController@destroy | Delete report |
| GET | `/analyses` | AnalysisController@index | List analyses |
| POST | `/analyses` | AnalysisController@store | Create analysis |
| GET | `/analyses/{analysis}` | AnalysisController@show | Get analysis |
| PUT/PATCH | `/analyses/{analysis}` | AnalysisController@update | Update analysis |
| DELETE | `/analyses/{analysis}` | AnalysisController@destroy | Delete analysis |
| GET | `/analyses/{analysis}/conclusions/fertilizers` | ConclusionController@getFertilizersByAnalysis | Get fertilizers |
| GET | `/analyses/{analysis}/conclusions/amounts` | ConclusionController@getAmountsByAnalysis | Get amounts |
| GET | `/consequences` | ConsequenceController@index | List consequences |
| POST | `/consequences` | ConsequenceController@store | Create consequence |
| GET | `/consequences/{consequence}` | ConsequenceController@show | Get consequence |
| PUT/PATCH | `/consequences/{consequence}` | ConsequenceController@update | Update consequence |
| DELETE | `/consequences/{consequence}` | ConsequenceController@destroy | Delete consequence |
| GET | `/consequences/plant/{plant}/period` | ConsequenceController@getByPlantAndPeriod | Get by plant/period |

---

*Last updated: November 2024*

