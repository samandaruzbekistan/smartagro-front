# 🚜 Machines API Documentation

Qishloq xo'jaligi texnikasini boshqarish uchun API.

---

## Umumiy ma'lumot

**Machines** moduli quyidagilarni boshqaradi:
- **Texnikalar** (traktor, kombayn, qurilmalar)
- **Ta'mirlash tarixi** (texnik xizmat ko'rsatish)
- **Ish jurnallari** (qaysi dalada, qancha ishladi)

---

## Base URL

```
https://maktab.ideal-study.uz/api
```

---

## Endpointlar

### Texnikalar (Machines)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/machines` | Barcha texnikalar ro'yxati |
| POST | `/api/machines` | Yangi texnika qo'shish |
| GET | `/api/machines/{id}` | Bitta texnika |
| PUT | `/api/machines/{id}` | Texnikani yangilash |
| DELETE | `/api/machines/{id}` | Texnikani o'chirish |

### Ta'mirlash (Maintenance)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/machines/{id}/maintenance` | Ta'mirlash tarixi |
| POST | `/api/machines/{id}/maintenance` | Ta'mirlash yozuvi qo'shish |

### Ish jurnallari (Work Logs)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/machines/{id}/work-logs` | Ish jurnallari |
| POST | `/api/machines/{id}/work-logs` | Ish yozuvi qo'shish |

---

## Texnikalar (Machines)

### GET `/api/machines`

Barcha texnikalar ro'yxatini olish.

**Query Parameters:**

| Parametr | Turi | Tavsif |
|----------|------|--------|
| `farm_id` | integer | Ferma bo'yicha filtrlash |
| `page` | integer | Sahifa raqami |

**Request:**

```bash
curl -X GET "https://maktab.ideal-study.uz/api/machines?farm_id=1" \
  -H "Accept: application/json"
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": 1,
      "farm_id": 1,
      "name": "Traktor #1",
      "type": "tractor",
      "brand": "John Deere",
      "model": "6130M",
      "year": 2020,
      "engine_hours": 1250.5,
      "service_interval_hours": 250,
      "last_service_hours": 1000,
      "last_service_date": "2024-01-15",
      "created_at": "2024-01-01T10:00:00.000000Z",
      "updated_at": "2024-01-15T14:30:00.000000Z"
    },
    {
      "id": 2,
      "farm_id": 1,
      "name": "Kombayn #1",
      "type": "combine",
      "brand": "CLAAS",
      "model": "Lexion 770",
      "year": 2019,
      "engine_hours": 850,
      "service_interval_hours": 200,
      "last_service_hours": 800,
      "last_service_date": "2024-01-10",
      "created_at": "2024-01-01T10:00:00.000000Z",
      "updated_at": "2024-01-10T12:00:00.000000Z"
    }
  ],
  "links": {
    "first": "https://maktab.ideal-study.uz/api/machines?page=1",
    "last": "https://maktab.ideal-study.uz/api/machines?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "per_page": 15,
    "to": 2,
    "total": 2
  }
}
```

---

### POST `/api/machines`

Yangi texnika qo'shish.

**Request Body:**

| Maydon | Turi | Majburiy | Tavsif |
|--------|------|----------|--------|
| `farm_id` | integer | ✅ | Ferma ID |
| `name` | string | ✅ | Texnika nomi |
| `type` | string | ✅ | Turi: `tractor`, `combine`, `implement`, `other` |
| `brand` | string | ❌ | Brend (John Deere, CLAAS, ...) |
| `model` | string | ❌ | Model |
| `year` | integer | ❌ | Ishlab chiqarilgan yili (1950-2100) |
| `engine_hours` | number | ❌ | Dvigatel soatlari |
| `service_interval_hours` | number | ❌ | Texnik xizmat oralig'i (soat) |
| `last_service_hours` | number | ❌ | Oxirgi texnik xizmatdagi soat |
| `last_service_date` | date | ❌ | Oxirgi texnik xizmat sanasi |

**Request:**

```bash
curl -X POST "https://maktab.ideal-study.uz/api/machines" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "farm_id": 1,
    "name": "Traktor #2",
    "type": "tractor",
    "brand": "Беларус",
    "model": "МТЗ-82",
    "year": 2018,
    "engine_hours": 2500,
    "service_interval_hours": 250
  }'
```

**Response (201 Created):**

```json
{
  "data": {
    "id": 3,
    "farm_id": 1,
    "name": "Traktor #2",
    "type": "tractor",
    "brand": "Беларус",
    "model": "МТЗ-82",
    "year": 2018,
    "engine_hours": 2500,
    "service_interval_hours": 250,
    "last_service_hours": null,
    "last_service_date": null,
    "created_at": "2024-01-20T09:00:00.000000Z",
    "updated_at": "2024-01-20T09:00:00.000000Z"
  }
}
```

**Validation Errors (422):**

```json
{
  "message": "The farm id field is required. (and 1 more error)",
  "errors": {
    "farm_id": ["The farm id field is required."],
    "type": ["The selected type is invalid."]
  }
}
```

---

### GET `/api/machines/{id}`

Bitta texnikani olish.

**Request:**

```bash
curl -X GET "https://maktab.ideal-study.uz/api/machines/1" \
  -H "Accept: application/json"
```

**Response (200 OK):**

```json
{
  "data": {
    "id": 1,
    "farm_id": 1,
    "name": "Traktor #1",
    "type": "tractor",
    "brand": "John Deere",
    "model": "6130M",
    "year": 2020,
    "engine_hours": 1250.5,
    "service_interval_hours": 250,
    "last_service_hours": 1000,
    "last_service_date": "2024-01-15",
    "created_at": "2024-01-01T10:00:00.000000Z",
    "updated_at": "2024-01-15T14:30:00.000000Z"
  }
}
```

---

### PUT `/api/machines/{id}`

Texnikani yangilash.

**Request:**

```bash
curl -X PUT "https://maktab.ideal-study.uz/api/machines/1" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "farm_id": 1,
    "name": "Traktor #1 (yangilangan)",
    "type": "tractor",
    "engine_hours": 1300
  }'
```

**Response (200 OK):**

```json
{
  "data": {
    "id": 1,
    "farm_id": 1,
    "name": "Traktor #1 (yangilangan)",
    "type": "tractor",
    "brand": "John Deere",
    "model": "6130M",
    "year": 2020,
    "engine_hours": 1300,
    "service_interval_hours": 250,
    "last_service_hours": 1000,
    "last_service_date": "2024-01-15",
    "created_at": "2024-01-01T10:00:00.000000Z",
    "updated_at": "2024-01-20T10:00:00.000000Z"
  }
}
```

---

### DELETE `/api/machines/{id}`

Texnikani o'chirish.

**Request:**

```bash
curl -X DELETE "https://maktab.ideal-study.uz/api/machines/1" \
  -H "Accept: application/json"
```

**Response (200 OK):**

```json
{
  "message": "Machine deleted successfully."
}
```

---

## Ta'mirlash (Maintenance)

### GET `/api/machines/{id}/maintenance`

Texnikaning ta'mirlash tarixini olish.

**Request:**

```bash
curl -X GET "https://maktab.ideal-study.uz/api/machines/1/maintenance" \
  -H "Accept: application/json"
```

**Response (200 OK):**

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
      "description": "Moy va filtr almashtirildi",
      "created_at": "2024-01-15T14:00:00.000000Z",
      "updated_at": "2024-01-15T14:00:00.000000Z"
    },
    {
      "id": 2,
      "machine_id": 1,
      "date": "2023-10-20",
      "type": "repair",
      "cost": 2500000,
      "engine_hours_at_service": 750,
      "description": "Gidravlika tizimi ta'mirlandi",
      "created_at": "2023-10-20T10:00:00.000000Z",
      "updated_at": "2023-10-20T10:00:00.000000Z"
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

---

### POST `/api/machines/{id}/maintenance`

Ta'mirlash yozuvi qo'shish.

**Request Body:**

| Maydon | Turi | Majburiy | Tavsif |
|--------|------|----------|--------|
| `date` | date | ✅ | Ta'mirlash sanasi |
| `type` | string | ✅ | Turi: `oil_change`, `repair`, `filter_change`, ... |
| `cost` | number | ❌ | Xarajat (so'm) |
| `engine_hours_at_service` | number | ❌ | Ta'mirlash paytidagi soat |
| `description` | string | ❌ | Izoh |

**Ta'mirlash turlari:**

| Kod | Tavsif |
|-----|--------|
| `oil_change` | Moy almashtirish |
| `filter_change` | Filtr almashtirish |
| `repair` | Ta'mirlash |
| `tire_change` | Shinalarni almashtirish |
| `inspection` | Tekshirish |
| `other` | Boshqa |

**Request:**

```bash
curl -X POST "https://maktab.ideal-study.uz/api/machines/1/maintenance" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "date": "2024-01-20",
    "type": "oil_change",
    "cost": 450000,
    "engine_hours_at_service": 1250,
    "description": "Dvigatel moyi va filtr almashtirildi"
  }'
```

**Response (201 Created):**

```json
{
  "data": {
    "id": 3,
    "machine_id": 1,
    "date": "2024-01-20",
    "type": "oil_change",
    "cost": 450000,
    "engine_hours_at_service": 1250,
    "description": "Dvigatel moyi va filtr almashtirildi",
    "created_at": "2024-01-20T09:00:00.000000Z",
    "updated_at": "2024-01-20T09:00:00.000000Z"
  }
}
```

> ℹ️ **Eslatma:** Ta'mirlash qo'shilganda texnikaning `last_service_date` va `last_service_hours` avtomatik yangilanadi.

---

## Ish jurnallari (Work Logs)

### GET `/api/machines/{id}/work-logs`

Texnikaning ish jurnallarini olish.

**Query Parameters:**

| Parametr | Turi | Tavsif |
|----------|------|--------|
| `date_from` | date | Boshlanish sanasi |
| `date_to` | date | Tugash sanasi |
| `page` | integer | Sahifa raqami |

**Request:**

```bash
curl -X GET "https://maktab.ideal-study.uz/api/machines/1/work-logs?date_from=2024-01-01&date_to=2024-01-31" \
  -H "Accept: application/json"
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": 1,
      "machine_id": 1,
      "farm_id": 1,
      "field_id": 1,
      "crop_season_id": 1,
      "date": "2024-01-15",
      "operation": "plowing",
      "hours": 8.5,
      "area_ha": 12,
      "fuel_liters": 85,
      "field": {
        "id": 1,
        "name": "Shimoliy dala"
      },
      "created_at": "2024-01-15T18:00:00.000000Z",
      "updated_at": "2024-01-15T18:00:00.000000Z"
    },
    {
      "id": 2,
      "machine_id": 1,
      "farm_id": 1,
      "field_id": 2,
      "crop_season_id": 1,
      "date": "2024-01-16",
      "operation": "sowing",
      "hours": 6,
      "area_ha": 10,
      "fuel_liters": 60,
      "field": {
        "id": 2,
        "name": "Janubiy dala"
      },
      "created_at": "2024-01-16T17:00:00.000000Z",
      "updated_at": "2024-01-16T17:00:00.000000Z"
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

---

### POST `/api/machines/{id}/work-logs`

Ish yozuvi qo'shish.

**Request Body:**

| Maydon | Turi | Majburiy | Tavsif |
|--------|------|----------|--------|
| `farm_id` | integer | ✅ | Ferma ID |
| `field_id` | integer | ❌ | Dala ID |
| `crop_season_id` | integer | ❌ | Ekin mavsumi ID |
| `date` | date | ✅ | Ish sanasi |
| `operation` | string | ✅ | Operatsiya turi |
| `hours` | number | ❌ | Ishlangan soat |
| `area_ha` | number | ❌ | Ishlov berilgan maydon (ga) |
| `fuel_liters` | number | ❌ | Sarflangan yoqilg'i (litr) |

**Operatsiya turlari:**

| Kod | Tavsif |
|-----|--------|
| `plowing` | Haydash |
| `sowing` | Ekish |
| `cultivating` | Kultivatsiya |
| `spraying` | Purkash |
| `harvesting` | Hosilni yig'ish |
| `transport` | Tashish |
| `other` | Boshqa |

**Request:**

```bash
curl -X POST "https://maktab.ideal-study.uz/api/machines/1/work-logs" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "farm_id": 1,
    "field_id": 1,
    "crop_season_id": 1,
    "date": "2024-01-20",
    "operation": "cultivating",
    "hours": 5,
    "area_ha": 8,
    "fuel_liters": 50
  }'
```

**Response (201 Created):**

```json
{
  "data": {
    "id": 3,
    "machine_id": 1,
    "farm_id": 1,
    "field_id": 1,
    "crop_season_id": 1,
    "date": "2024-01-20",
    "operation": "cultivating",
    "hours": 5,
    "area_ha": 8,
    "fuel_liters": 50,
    "field": {
      "id": 1,
      "name": "Shimoliy dala"
    },
    "created_at": "2024-01-20T17:00:00.000000Z",
    "updated_at": "2024-01-20T17:00:00.000000Z"
  }
}
```

> ℹ️ **Eslatma:** Ish yozuvi qo'shilganda texnikaning `engine_hours` avtomatik oshiriladi.

---

## TypeScript Types

```typescript
// Texnika turlari
export type MachineType = 'tractor' | 'combine' | 'implement' | 'other';

// Ta'mirlash turlari
export type MaintenanceType = 
  | 'oil_change' 
  | 'filter_change' 
  | 'repair' 
  | 'tire_change' 
  | 'inspection' 
  | 'other';

// Operatsiya turlari
export type OperationType = 
  | 'plowing' 
  | 'sowing' 
  | 'cultivating' 
  | 'spraying' 
  | 'harvesting' 
  | 'transport' 
  | 'other';

// Texnika
export interface Machine {
  id: number;
  farm_id: number;
  name: string;
  type: MachineType;
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

// Yangi texnika yaratish
export interface CreateMachineRequest {
  farm_id: number;
  name: string;
  type: MachineType;
  brand?: string;
  model?: string;
  year?: number;
  engine_hours?: number;
  service_interval_hours?: number;
  last_service_hours?: number;
  last_service_date?: string;
}

// Ta'mirlash yozuvi
export interface MaintenanceRecord {
  id: number;
  machine_id: number;
  date: string;
  type: string;
  cost: number | null;
  engine_hours_at_service: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Yangi ta'mirlash yozuvi
export interface CreateMaintenanceRequest {
  date: string;
  type: string;
  cost?: number;
  engine_hours_at_service?: number;
  description?: string;
}

// Ish jurnali
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
  field?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

// Yangi ish yozuvi
export interface CreateWorkLogRequest {
  farm_id: number;
  field_id?: number;
  crop_season_id?: number;
  date: string;
  operation: string;
  hours?: number;
  area_ha?: number;
  fuel_liters?: number;
}

// API javob
export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}
```

---

## API Functions

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://maktab.ideal-study.uz/api';

// Texnikalar
export async function getMachines(farmId?: number): Promise<PaginatedResponse<Machine>> {
  const url = farmId 
    ? `${API_BASE}/machines?farm_id=${farmId}` 
    : `${API_BASE}/machines`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Texnikalarni olishda xatolik');
  return res.json();
}

export async function getMachine(id: number): Promise<ApiResponse<Machine>> {
  const res = await fetch(`${API_BASE}/machines/${id}`);
  if (!res.ok) throw new Error('Texnikani olishda xatolik');
  return res.json();
}

export async function createMachine(data: CreateMachineRequest): Promise<ApiResponse<Machine>> {
  const res = await fetch(`${API_BASE}/machines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Texnika yaratishda xatolik');
  return res.json();
}

export async function updateMachine(id: number, data: CreateMachineRequest): Promise<ApiResponse<Machine>> {
  const res = await fetch(`${API_BASE}/machines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Texnikani yangilashda xatolik');
  return res.json();
}

export async function deleteMachine(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/machines/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Texnikani o\'chirishda xatolik');
}

// Ta'mirlash
export async function getMaintenance(machineId: number): Promise<PaginatedResponse<MaintenanceRecord>> {
  const res = await fetch(`${API_BASE}/machines/${machineId}/maintenance`);
  if (!res.ok) throw new Error('Ta\'mirlash tarixini olishda xatolik');
  return res.json();
}

export async function addMaintenance(
  machineId: number, 
  data: CreateMaintenanceRequest
): Promise<ApiResponse<MaintenanceRecord>> {
  const res = await fetch(`${API_BASE}/machines/${machineId}/maintenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Ta\'mirlash yozuvini qo\'shishda xatolik');
  return res.json();
}

// Ish jurnallari
export async function getWorkLogs(
  machineId: number, 
  dateFrom?: string, 
  dateTo?: string
): Promise<PaginatedResponse<MachineWorkLog>> {
  let url = `${API_BASE}/machines/${machineId}/work-logs`;
  const params = new URLSearchParams();
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo) params.append('date_to', dateTo);
  if (params.toString()) url += `?${params.toString()}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Ish jurnallarini olishda xatolik');
  return res.json();
}

export async function addWorkLog(
  machineId: number, 
  data: CreateWorkLogRequest
): Promise<ApiResponse<MachineWorkLog>> {
  const res = await fetch(`${API_BASE}/machines/${machineId}/work-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Ish yozuvini qo\'shishda xatolik');
  return res.json();
}
```

---

## React Component misoli

```tsx
'use client';

import { useState, useEffect } from 'react';
import { getMachines, type Machine, type PaginatedResponse } from '@/lib/api/machines';

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMachines()
      .then(res => setMachines(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Yuklanmoqda...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🚜 Texnikalar</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {machines.map(machine => (
          <div key={machine.id} className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">
                {machine.type === 'tractor' ? '🚜' : 
                 machine.type === 'combine' ? '🌾' : '🔧'}
              </span>
              <div>
                <h3 className="font-semibold">{machine.name}</h3>
                <p className="text-sm text-gray-500">
                  {machine.brand} {machine.model}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Soat:</span>
                <span className="ml-1 font-medium">{machine.engine_hours}</span>
              </div>
              <div>
                <span className="text-gray-500">Yil:</span>
                <span className="ml-1 font-medium">{machine.year || '—'}</span>
              </div>
            </div>

            {machine.service_interval_hours && (
              <div className="mt-3">
                <div className="text-xs text-gray-500 mb-1">
                  Keyingi texnik xizmat: {machine.service_interval_hours - (machine.engine_hours - (machine.last_service_hours || 0))} soat
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ 
                      width: `${Math.min(100, ((machine.engine_hours - (machine.last_service_hours || 0)) / machine.service_interval_hours) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Xatolar

| Kod | Tavsif |
|-----|--------|
| 404 | Texnika topilmadi |
| 422 | Validatsiya xatosi |
| 500 | Server xatosi |

**404 Not Found:**

```json
{
  "message": "No query results for model [App\\Models\\Machine] 999"
}
```

**422 Validation Error:**

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "farm_id": ["The farm id field is required."],
    "type": ["The selected type is invalid."]
  }
}
```

