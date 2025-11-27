# O'simliklar (Plants) API - To'liq Hujjat

## Umumiy ko'rinish

O'simliklar moduli qishloq xo'jaligi ekinlarini boshqarish uchun ishlatiladi. Har bir o'simlik tuproq tahlili va o'g'it tavsiyalari bilan bog'langan.

### Asosiy funksiyalar

1. **O'simliklar ro'yxati** — Barcha ekinlar katalogi
2. **Tahlil bilan bog'lanish** — Qaysi ekin uchun tuproq tahlil qilinmoqda
3. **Oqibatlar (Consequences)** — Har bir ekin uchun element me'yorlari

### Arxitektura

```
┌─────────────────────────────────────────────────────────┐
│                O'simliklar (Plants)                      │
├─────────────────────────────────────────────────────────┤
│  id          │ Unikal identifikator                     │
│  name        │ O'simlik nomi (Paxta, Bug'doy, ...)      │
│  description │ Qisqa tavsif                             │
└─────────────────────────────────────────────────────────┘
           │
           │ hasMany
           ▼
┌─────────────────────────────────────────────────────────┐
│                   Tahlillar (Analyses)                   │
├─────────────────────────────────────────────────────────┤
│  Tuproq tahlili qaysi ekin uchun qilinmoqda             │
│  plant_id → O'simlik ID                                  │
└─────────────────────────────────────────────────────────┘
           │
           │ hasMany
           ▼
┌─────────────────────────────────────────────────────────┐
│                 Oqibatlar (Consequences)                 │
├─────────────────────────────────────────────────────────┤
│  Har bir ekin uchun element me'yorlari                  │
│  plant_id + element_id + period_name                    │
│  target_min, target_max                                 │
└─────────────────────────────────────────────────────────┘
```

---

## API Endpointlari

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/plants` | Barcha o'simliklar ro'yxati |
| GET | `/api/plants/{id}` | Bitta o'simlik |

> **Eslatma:** O'simliklar faqat o'qish uchun. CRUD operatsiyalari admin panel orqali amalga oshiriladi.

---

## GET `/api/plants`

Barcha o'simliklar ro'yxatini olish.

### Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "name": "Paxta",
      "description": "O'zbekistonning asosiy texnik ekini. Tolasi to'qimachilik sanoatida ishlatiladi.",
      "created_at": "2024-01-15T10:00:00.000000Z",
      "updated_at": "2024-01-15T10:00:00.000000Z"
    },
    {
      "id": 2,
      "name": "Kuzgi bug'doy",
      "description": "Kuzda ekilib, yozda hosilga kiradigan don ekini. Non tayyorlash uchun ishlatiladi.",
      "created_at": "2024-01-15T10:00:00.000000Z",
      "updated_at": "2024-01-15T10:00:00.000000Z"
    },
    {
      "id": 3,
      "name": "Makkajo'xori",
      "description": "Don va silos uchun yetishtiriladigan ekin. Chorvachilikda keng qo'llaniladi.",
      "created_at": "2024-01-15T10:00:00.000000Z",
      "updated_at": "2024-01-15T10:00:00.000000Z"
    }
  ]
}
```

---

## GET `/api/plants/{id}`

Bitta o'simlikni ID bo'yicha olish.

### Path Parameters

| Parameter | Type | Tavsif |
|-----------|------|--------|
| `id` | integer | O'simlik ID |

### Response (200)

```json
{
  "data": {
    "id": 1,
    "name": "Paxta",
    "description": "O'zbekistonning asosiy texnik ekini. Tolasi to'qimachilik sanoatida ishlatiladi.",
    "created_at": "2024-01-15T10:00:00.000000Z",
    "updated_at": "2024-01-15T10:00:00.000000Z"
  }
}
```

### Response (404)

```json
{
  "message": "No query results for model [App\\Models\\Plant] 999"
}
```

---

## O'zbekistondagi ekinlar katalogi

Tizimda quyidagi ekinlar mavjud:

### Texnik ekinlar

| ID | Nomi | Tavsif |
|----|------|--------|
| 1 | Paxta | O'zbekistonning asosiy texnik ekini |
| 14 | Kungaboqar | Yog' olish uchun yetishtiriladigan texnik ekin |

### Don ekinlari

| ID | Nomi | Tavsif |
|----|------|--------|
| 2 | Kuzgi bug'doy | Kuzda ekilib, yozda hosilga kiradigan don ekini |
| 3 | Bahori bug'doy | Bahorda ekiladigan bug'doy turi |
| 4 | Makkajo'xori | Don va silos uchun yetishtiriladigan ekin |
| 5 | Sholi (guruch) | Suv havzalari yaqinida yetishtiriladigan don ekini |

### Sabzavotlar

| ID | Nomi | Tavsif |
|----|------|--------|
| 6 | Pomidor | Eng ko'p yetishtiriladigan sabzavot |
| 7 | Bodiring | Issiqxona va ochiq dalada yetishtiriladigan |
| 8 | Piyoz | Oshxonada keng ishlatiladigan sabzavot |
| 9 | Sabzi | Vitaminlarga boy ildizmeva sabzavot |
| 10 | Kartoshka | Tuganakli sabzavot ekini |

### Dukkaklilar

| ID | Nomi | Tavsif |
|----|------|--------|
| 11 | Mosh | Oqsilga boy dukkakli ekin |
| 12 | No'xat | Tuproqni azot bilan boyitadi |
| 13 | Soya | Oqsil va yog'ga boy dukkakli ekin |

### Yem-xashak

| ID | Nomi | Tavsif |
|----|------|--------|
| 15 | Beda | Ko'p yillik yem-xashak ekini |

### Poliz ekinlari

| ID | Nomi | Tavsif |
|----|------|--------|
| 16 | Qovun | O'zbekistonning mashhur poliz ekini |
| 17 | Tarvuz | Yozda yetiladigan shirin poliz ekini |

### Mevalar

| ID | Nomi | Tavsif |
|----|------|--------|
| 18 | Uzum | Ko'p yillik mevali o'simlik |
| 19 | Olma | Eng keng tarqalgan mevali daraxt |
| 20 | O'rik | Bahorda gullaydi, yozda meva beradi |

---

## O'simlik bilan bog'liq endpointlar

### Tahlil yaratishda o'simlik tanlash

```
POST /api/analyses
```

```json
{
  "report_id": 1,
  "soil_id": 1,
  "plant_id": 1,
  "notes": "Paxta uchun tuproq tahlili"
}
```

### O'simlik bo'yicha oqibatlarni olish

```
GET /api/consequences/plant/{plant_id}/period?period=ekish_oldidan
```

---

## TypeScript Types

```typescript
// types/plant.ts

export interface Plant {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlantListResponse {
  data: Plant[];
}

export interface PlantResponse {
  data: Plant;
}
```

---

## API Functions (Next.js)

```typescript
// lib/api/plants.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://maktab.ideal-study.uz/api';

/**
 * Barcha o'simliklarni olish
 */
export async function getPlants(): Promise<PlantListResponse> {
  const res = await fetch(`${API_BASE}/plants`, {
    headers: { 'Accept': 'application/json' },
  });
  
  if (!res.ok) {
    throw new Error('O\'simliklarni olishda xatolik');
  }
  
  return res.json();
}

/**
 * Bitta o'simlikni olish
 */
export async function getPlant(id: number): Promise<PlantResponse> {
  const res = await fetch(`${API_BASE}/plants/${id}`, {
    headers: { 'Accept': 'application/json' },
  });
  
  if (!res.ok) {
    throw new Error('O\'simlikni olishda xatolik');
  }
  
  return res.json();
}
```

---

## React Komponentlar

### PlantSelect

O'simlik tanlash dropdown komponenti.

```tsx
// components/PlantSelect.tsx

'use client';

import { useEffect, useState } from 'react';
import { getPlants } from '@/lib/api/plants';
import type { Plant } from '@/lib/types';

interface Props {
  value: number | null;
  onChange: (plantId: number | null) => void;
  placeholder?: string;
  required?: boolean;
}

export function PlantSelect({ 
  value, 
  onChange, 
  placeholder = 'Ekin tanlang...', 
  required = false 
}: Props) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlants()
      .then(res => setPlants(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
      required={required}
      disabled={loading}
    >
      <option value="">
        {loading ? 'Yuklanmoqda...' : placeholder}
      </option>
      {plants.map((plant) => (
        <option key={plant.id} value={plant.id}>
          {plant.name}
        </option>
      ))}
    </select>
  );
}
```

### PlantCard

O'simlik ma'lumotlarini ko'rsatuvchi karta.

```tsx
// components/PlantCard.tsx

import type { Plant } from '@/lib/types';

interface Props {
  plant: Plant;
}

export function PlantCard({ plant }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🌱</span>
        <div>
          <h3 className="font-semibold text-gray-900">{plant.name}</h3>
          {plant.description && (
            <p className="text-sm text-gray-600 mt-1">{plant.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

### PlantsList

O'simliklar ro'yxati sahifasi.

```tsx
// app/plants/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { getPlants } from '@/lib/api/plants';
import { PlantCard } from '@/components/PlantCard';
import type { Plant } from '@/lib/types';

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getPlants()
      .then(res => setPlants(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filteredPlants = plants.filter(plant =>
    plant.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">🌾 Ekinlar katalogi</h1>
          <p className="text-gray-600">{plants.length} ta ekin mavjud</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Ekin qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Plants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>

        {/* Empty State */}
        {filteredPlants.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p>"{search}" bo'yicha ekin topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Tahlil formida o'simlik tanlash

Tahlil yaratishda o'simlik tanlanishi shart. Bu tahlil qaysi ekin uchun qilinayotganini belgilaydi.

```tsx
// app/analyses/new/page.tsx (qismi)

import { PlantSelect } from '@/components/PlantSelect';

function AnalysisForm() {
  const [plantId, setPlantId] = useState<number | null>(null);

  return (
    <form>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ekin turi *
        </label>
        <PlantSelect
          value={plantId}
          onChange={setPlantId}
          placeholder="Qaysi ekin uchun tahlil?"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Tuproq tahlili qaysi ekin uchun qilinayotganini tanlang
        </p>
      </div>
      
      {/* Boshqa formalar... */}
    </form>
  );
}
```

---

## Oqibatlar (Consequences) bilan integratsiya

Har bir o'simlik uchun ma'lum davrlarda element me'yorlari belgilanadi.

### Endpoint

```
GET /api/consequences/plant/{plant_id}/period?period=ekish_oldidan
```

### Response

```json
{
  "data": [
    {
      "id": 1,
      "plant_id": 1,
      "plant_name": "Paxta",
      "element_id": 1,
      "element_code": "N",
      "period_name": "ekish_oldidan",
      "target_min": 30.0,
      "target_max": 50.0
    },
    {
      "id": 2,
      "plant_id": 1,
      "plant_name": "Paxta",
      "element_id": 2,
      "element_code": "P",
      "period_name": "ekish_oldidan",
      "target_min": 20.0,
      "target_max": 35.0
    }
  ]
}
```

---

## Foydalanish senariylari

### 1. O'simliklar ro'yxatini ko'rsatish

```typescript
const { data: plants } = await getPlants();

plants.forEach(plant => {
  console.log(`${plant.name}: ${plant.description}`);
});
```

### 2. Tahlil uchun o'simlik tanlash

```typescript
// Foydalanuvchi Paxta tanladi
const selectedPlantId = 1;

// Tahlil yaratish
await createAnalysis({
  report_id: 1,
  soil_id: 1,
  plant_id: selectedPlantId, // Paxta
  notes: 'Paxta ekini uchun tuproq tahlili',
});
```

### 3. O'simlik bo'yicha tavsiyalarni olish

```typescript
// Tahlil yaratilgandan keyin
const readiness = await getAnalysisReadiness(analysisId);

console.log(`Ekin: ${readiness.data.plant_name}`);
console.log(`Holat: ${readiness.data.overall_status}`);
console.log(`Xulosa: ${readiness.data.summary_text}`);
```

---

## Ekin kategoriyalari

O'simliklarni kategoriyalarga ajratish uchun qo'shimcha maydon qo'shish mumkin:

```typescript
// Kelajakda qo'shilishi mumkin
export interface Plant {
  id: number;
  name: string;
  description: string | null;
  category?: 'grain' | 'vegetable' | 'fruit' | 'technical' | 'fodder';
  growing_season?: 'spring' | 'autumn' | 'perennial';
  created_at: string;
  updated_at: string;
}
```

---

## Xatolarni qayta ishlash

```typescript
try {
  const plants = await getPlants();
  // ...
} catch (error) {
  if (error instanceof Error) {
    console.error('Xatolik:', error.message);
    // UI'da xatolik ko'rsatish
  }
}
```

---

*Oxirgi yangilanish: Noyabr 2024*

