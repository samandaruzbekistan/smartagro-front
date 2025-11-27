# Tuproq Tahlili API - To'liq Hujjat

## Umumiy ko'rinish

Bu modul tuproq namunalarini boshqarish, tahlil qilish va ekin uchun tayyorgarlikni aniqlash imkonini beradi.

### Asosiy funksiyalar

1. **Tuproq namunalari** — CRUD operatsiyalari
2. **Tahlil parametrlari** — Makro/mikro elementlar, pH, og'ir metallar
3. **Tuproq tayyorgarligi** — Ekin uchun tayyor yoki yo'qligini aniqlash
4. **O'g'it tavsiyalari** — Kam elementlar uchun o'g'it hisoblash

### Arxitektura

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                  │
├─────────────────────────────────────────────────────────┤
│  /soils/new          → Yangi namuna yaratish            │
│  /soils/[id]/edit    → Namunani tahrirlash              │
│  /analyses/[id]/conclusions → Tayyorgarlik + tavsiyalar │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Laravel API                            │
├─────────────────────────────────────────────────────────┤
│  SoilController        → CRUD operatsiyalari            │
│  AnalysisController    → Tahlil yaratish/yangilash      │
│  ConclusionController  → Tayyorgarlik + O'g'it          │
├─────────────────────────────────────────────────────────┤
│  SoilAnalysisService              → Element status      │
│  FertilizerRecommendationService  → O'g'it hisoblash    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Database (MySQL)                       │
├─────────────────────────────────────────────────────────┤
│  soils                 → Tuproq namunalari              │
│  analyses              → Tahlillar                      │
│  analysis_element_values → Element qiymatlari           │
│  elements              → Element katalogi               │
│  fertilizers           → O'g'itlar katalogi             │
└─────────────────────────────────────────────────────────┘
```

---

## API Endpointlari

### Tuproq namunalari (Soils)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/soils` | Barcha namunalar |
| POST | `/api/soils` | Yangi namuna |
| GET | `/api/soils/{id}` | Bitta namuna |
| PUT | `/api/soils/{id}` | Yangilash |
| DELETE | `/api/soils/{id}` | O'chirish |
| GET | `/api/soils/{id}/ai-analysis` | 🤖 AI tahlil (Gemini) |

### Tahlillar (Analyses)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/analyses` | Barcha tahlillar |
| POST | `/api/analyses` | Yangi tahlil |
| GET | `/api/analyses/{id}` | Bitta tahlil |
| PUT | `/api/analyses/{id}` | Yangilash |
| DELETE | `/api/analyses/{id}` | O'chirish |

### Xulosalar (Conclusions)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/analyses/{id}/readiness` | Tuproq tayyorgarligi |
| GET | `/api/analyses/{id}/ai-analysis` | 🤖 AI tahlil (Gemini) |
| GET | `/api/analyses/{id}/conclusions/fertilizers` | O'g'itlar ro'yxati |
| GET | `/api/analyses/{id}/conclusions/amounts` | O'g'it tavsiyalari |

---

## Tuproq parametrlari

Barcha element qiymatlari **mg/kg (ppm)** birligida saqlanadi.

### A) Asosiy ma'lumotlar

| Field | Type | Tavsif |
|-------|------|--------|
| `field_id` | integer | Dala ID (majburiy) |
| `name` | string | Namuna nomi |
| `sampled_at` | date | Olingan sana |
| `humus` | float | Gumus (%) |
| `texture` | string | Tuproq tuzilishi |

### B) Makro elementlar

| Field | Kod | O'zbekcha | Birlik |
|-------|-----|-----------|--------|
| `nitrogen` | N | Azot | mg/kg |
| `phosphorus` | P | Fosfor | mg/kg |
| `potassium` | K | Kaliy | mg/kg |
| `magnesium` | Mg | Magniy | mg/kg |
| `calcium` | Ca | Kalsiy | mg/kg |
| `sulfur` | S | Oltingugurt | mg/kg |
| `sodium` | Na | Natriy | mg/kg |

### C) Mikro elementlar

| Field | Kod | O'zbekcha | Birlik |
|-------|-----|-----------|--------|
| `boron` | B | Bor | mg/kg |
| `copper` | Cu | Mis | mg/kg |
| `iron` | Fe | Temir | mg/kg |
| `molybdenum` | Mo | Molibden | mg/kg |
| `manganese` | Mn | Marganets | mg/kg |
| `cobalt` | Co | Kobalt | mg/kg |
| `zinc` | Zn | Rux | mg/kg |
| `chromium` | Cr | Xrom | mg/kg |

### D) Tuproq reaktsiyasi (pH)

| Field | Tavsif | Diapazon |
|-------|--------|----------|
| `ph` | pH qiymati | 0-14 |

**pH talqini:**

| Diapazon | Status | Tavsiya |
|----------|--------|---------|
| < 5.5 | `too_acidic` | Ohak (lime) qo'llash |
| 5.5 - 7.5 | `optimal` | Maqbul |
| > 7.5 | `too_alkaline` | Organik modda qo'shish |

### E) Og'ir metallar

| Field | Kod | O'zbekcha | Birlik |
|-------|-----|-----------|--------|
| `lead` | Pb | Qo'rg'oshin | mg/kg |
| `mercury` | Hg | Simob | mg/kg |
| `cadmium` | Cd | Kadmiy | mg/kg |
| `silver` | Ag | Kumush | mg/kg |

---

## 🌱 Ekin Tavsiyasi (Crop Recommendation)

Dala + Tuproq + Ekin tanlab, AI yordamida ekin ekish mumkinmi yoki yo'qligini aniqlash.

### Endpointlar

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/crop-recommendation/options` | Formalar uchun ma'lumotlar |
| GET/POST | `/api/crop-recommendation` | AI tavsiya olish |

### GET `/api/crop-recommendation/options`

Forma uchun dalalar, tuproq namunalari va ekinlar ro'yxatini olish.

**Response:**

```json
{
  "data": {
    "fields": [
      {
        "id": 1,
        "name": "Shimoliy dala",
        "area_ha": 25.5,
        "soils": [
          {
            "id": 1,
            "field_id": 1,
            "name": "Namuna #1",
            "sampled_at": "2024-01-10",
            "ph": 6.8
          }
        ]
      }
    ],
    "plants": [
      {
        "id": 1,
        "name": "Paxta",
        "description": "G'o'za - asosiy texnik ekin"
      },
      {
        "id": 2,
        "name": "Bug'doy",
        "description": "Kuzgi bug'doy"
      }
    ]
  }
}
```

### POST `/api/crop-recommendation`

AI yordamida ekin tavsiyasi olish.

**Request Body:**

```json
{
  "field_id": 1,
  "soil_id": 1,
  "plant_id": 3
}
```

**Response:**

```json
{
  "data": {
    "success": true,
    "field_id": 1,
    "field_name": "Shimoliy dala",
    "soil_id": 1,
    "soil_name": "Namuna #1",
    "plant_id": 3,
    "plant_name": "Paxta",
    "recommendation": "## 🎯 XULOSA: Paxta eksa bo'ladimi?\n\n**SHARTLI** - Tuproqni tayyorlash kerak...\n\n## 📊 Tuproq tayyorgarligi bahosi\n\n**75/100**\n\n...",
    "generated_at": "2024-01-15T12:30:00.000000Z"
  }
}
```

### AI javob tarkibi

AI javob quyidagi bo'limlarni o'z ichiga oladi:

1. **🎯 XULOSA** - Ekin eksa bo'ladimi? (HA/YO'Q/SHARTLI)
2. **📊 Tuproq tayyorgarligi bahosi** - 100 balldan necha ball
3. **✅ Yaxshi tomonlar** - Tuproqning afzalliklari
4. **⚠️ Muammolar va yechimlar** - Har bir muammo uchun yechim
5. **🚜 Yer tayyorlash bosqichlari** - Bosqichma-bosqich
6. **🧪 O'g'itlash rejasi** - Jadval ko'rinishida
7. **🌱 Alternativ ekinlar** - Boshqa variantlar
8. **📅 Ekish vaqti** - Eng yaxshi vaqt
9. **💰 Kutilayotgan natija** - Hosil va daromad

### TypeScript Types

```typescript
export interface CropRecommendationOptions {
  fields: FieldWithSoils[];
  plants: PlantOption[];
}

export interface FieldWithSoils {
  id: number;
  name: string;
  area_ha: number;
  soils: SoilOption[];
}

export interface SoilOption {
  id: number;
  field_id: number;
  name: string | null;
  sampled_at: string | null;
  ph: number | null;
}

export interface PlantOption {
  id: number;
  name: string;
  description: string | null;
}

export interface CropRecommendationRequest {
  field_id: number;
  soil_id: number;
  plant_id: number;
}

export interface CropRecommendationResult {
  success: boolean;
  field_id: number;
  field_name: string;
  soil_id: number;
  soil_name: string | null;
  plant_id: number;
  plant_name: string;
  recommendation: string; // Markdown formatda
  generated_at: string;
  error?: string;
}
```

### API Functions

```typescript
// Forma uchun ma'lumotlar
export async function getCropRecommendationOptions(): Promise<{ data: CropRecommendationOptions }> {
  const res = await fetch(`${API_BASE}/crop-recommendation/options`);
  if (!res.ok) throw new Error('Ma\'lumotlarni olishda xatolik');
  return res.json();
}

// AI tavsiya olish
export async function getCropRecommendation(
  data: CropRecommendationRequest
): Promise<{ data: CropRecommendationResult }> {
  const res = await fetch(`${API_BASE}/crop-recommendation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('AI tavsiyasida xatolik');
  return res.json();
}
```

### React Component

```tsx
// pages/crop-recommendation/page.tsx

'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface FieldWithSoils {
  id: number;
  name: string;
  area_ha: number;
  soils: { id: number; name: string | null; ph: number | null }[];
}

interface Plant {
  id: number;
  name: string;
}

export default function CropRecommendationPage() {
  const [fields, setFields] = useState<FieldWithSoils[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  
  const [selectedField, setSelectedField] = useState<number | null>(null);
  const [selectedSoil, setSelectedSoil] = useState<number | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ma'lumotlarni yuklash
  useEffect(() => {
    fetch('/api/crop-recommendation/options')
      .then(res => res.json())
      .then(data => {
        setFields(data.data.fields);
        setPlants(data.data.plants);
      });
  }, []);

  // Tanlangan dala uchun tuproqlar
  const availableSoils = fields.find(f => f.id === selectedField)?.soils || [];

  // AI tavsiya olish
  const handleGetRecommendation = async () => {
    if (!selectedField || !selectedSoil || !selectedPlant) {
      setError('Barcha maydonlarni to\'ldiring');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/crop-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field_id: selectedField,
          soil_id: selectedSoil,
          plant_id: selectedPlant,
        }),
      });
      
      const data = await res.json();
      
      if (data.data.success) {
        setResult(data.data.recommendation);
      } else {
        setError(data.data.error);
      }
    } catch (e) {
      setError('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🌱 Ekin Tavsiyasi</h1>
      
      {/* Forma */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Dala */}
          <div>
            <label className="block text-sm font-medium mb-2">Dala</label>
            <select
              value={selectedField || ''}
              onChange={(e) => {
                setSelectedField(Number(e.target.value));
                setSelectedSoil(null);
              }}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Tanlang...</option>
              {fields.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.area_ha} ga)
                </option>
              ))}
            </select>
          </div>

          {/* Tuproq */}
          <div>
            <label className="block text-sm font-medium mb-2">Tuproq namunasi</label>
            <select
              value={selectedSoil || ''}
              onChange={(e) => setSelectedSoil(Number(e.target.value))}
              disabled={!selectedField}
              className="w-full border rounded-lg p-2 disabled:bg-gray-100"
            >
              <option value="">Tanlang...</option>
              {availableSoils.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name || `Namuna #${s.id}`} (pH: {s.ph || '—'})
                </option>
              ))}
            </select>
          </div>

          {/* Ekin */}
          <div>
            <label className="block text-sm font-medium mb-2">Ekin</label>
            <select
              value={selectedPlant || ''}
              onChange={(e) => setSelectedPlant(Number(e.target.value))}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Tanlang...</option>
              {plants.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGetRecommendation}
          disabled={loading || !selectedField || !selectedSoil || !selectedPlant}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? '⏳ AI tahlil qilmoqda...' : '🤖 AI Tavsiya Olish'}
        </button>
      </div>

      {/* Xatolik */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          ❌ {error}
        </div>
      )}

      {/* Natija */}
      {result && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">📋 AI Tavsiyasi</h2>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🤖 AI Tahlil (OpenAI Integration)

OpenAI (GPT-4) yordamida tuproq namunalari va tahlillarni chuqur tahlil qilish.

### GET `/api/soils/{id}/ai-analysis`

Tuproq namunasini AI bilan tahlil qilish.

**Response:**

```json
{
  "data": {
    "success": true,
    "soil_id": 1,
    "field_name": "Shimoliy dala",
    "analysis": "## 📊 Umumiy baho\n\nTuproq holati **yaxshi** darajada...\n\n## 🌱 Ekin tavsiyalari\n\n1. **Paxta** - eng mos ekin...\n\n## ⚠️ Muammolar\n\n- Azot (N) miqdori past...\n\n## 💡 Tavsiyalar\n\n1. Karbamid o'g'iti - 150 kg/ga...",
    "generated_at": "2024-01-15T12:30:00.000000Z"
  }
}
```

### GET `/api/analyses/{id}/ai-analysis`

Tahlilni AI bilan chuqur o'rganish (ekin bilan bog'liq).

**Response:**

```json
{
  "data": {
    "success": true,
    "analysis_id": 1,
    "plant_name": "Paxta",
    "field_name": "Shimoliy dala",
    "ai_analysis": "## 🎯 Paxta uchun tayyorgarlik\n\nBu tuproq Paxta ekini uchun **75% tayyor**...\n\n## ✅ Yetarli elementlar\n\n- Kaliy (K): 180 mg/kg - optimal\n\n## ⚠️ Kam elementlar\n\n- Azot (N): 15 mg/kg - kam\n\n## 🧪 O'g'itlash rejasi\n\n1. Ekishdan oldin: Karbamid 150 kg/ga...",
    "generated_at": "2024-01-15T12:30:00.000000Z"
  }
}
```

### AI javob strukturasi

AI javob quyidagi bo'limlarni o'z ichiga oladi:

**Tuproq tahlili uchun:**
- 📊 Umumiy baho
- 🌱 Ekin tavsiyalari (3-5 ta)
- ⚠️ Muammolar
- 💡 Tavsiyalar (o'g'it, miqdor, vaqt)
- 🔬 pH tahlili

**Analysis tahlili uchun:**
- 🎯 Ekin uchun tayyorgarlik (foizda)
- ✅ Yetarli elementlar
- ⚠️ Kam elementlar
- 🧪 O'g'itlash rejasi
- 📅 Ekish vaqti tavsiyasi
- 💰 Kutilayotgan hosil

### TypeScript Types

```typescript
export interface AiSoilAnalysis {
  success: boolean;
  soil_id: number;
  field_name: string | null;
  analysis: string; // Markdown formatda
  generated_at: string;
  error?: string;
}

export interface AiAnalysisResult {
  success: boolean;
  analysis_id: number;
  plant_name: string | null;
  field_name: string | null;
  ai_analysis: string; // Markdown formatda
  generated_at: string;
  error?: string;
}
```

### API Functions

```typescript
// AI tahlil olish (tuproq)
export async function getSoilAiAnalysis(soilId: number): Promise<{ data: AiSoilAnalysis }> {
  const res = await fetch(`${API_BASE}/soils/${soilId}/ai-analysis`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error('AI tahlilida xatolik');
  return res.json();
}

// AI tahlil olish (analysis)
export async function getAnalysisAiResult(analysisId: number): Promise<{ data: AiAnalysisResult }> {
  const res = await fetch(`${API_BASE}/analyses/${analysisId}/ai-analysis`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error('AI tahlilida xatolik');
  return res.json();
}
```

### React Component

```tsx
// components/AiAnalysisCard.tsx

'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { getSoilAiAnalysis } from '@/lib/api/soils';
import type { AiSoilAnalysis } from '@/lib/types';

interface Props {
  soilId: number;
}

export function AiAnalysisCard({ soilId }: Props) {
  const [analysis, setAnalysis] = useState<AiSoilAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getSoilAiAnalysis(soilId);
      setAnalysis(response.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          🤖 AI Tahlil
        </h2>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              Tahlil qilinmoqda...
            </span>
          ) : (
            '✨ AI bilan tahlil qilish'
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-4">
          ❌ {error}
        </div>
      )}

      {analysis?.success && (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{analysis.analysis}</ReactMarkdown>
          <p className="text-xs text-gray-400 mt-4">
            Tahlil vaqti: {new Date(analysis.generated_at).toLocaleString('uz-UZ')}
          </p>
        </div>
      )}

      {!analysis && !loading && !error && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🧠</div>
          <p>Gemini AI yordamida tuproqni tahlil qiling</p>
          <p className="text-sm">Ekin tavsiyalari va o'g'itlash rejasini oling</p>
        </div>
      )}
    </div>
  );
}
```

### Konfiguratsiya

`.env` faylga qo'shing:

```env
OPENAI_API_KEY=sk-your_openai_api_key_here
```

---

## Tuproq tayyorgarligi (Readiness)

### Endpoint

```
GET /api/analyses/{id}/readiness
```

### Mantiq

Tuproq tayyorgarligi quyidagilarga asoslanadi:

1. **pH holati** — Maqbul (5.5-7.5) yoki yo'q
2. **Asosiy elementlar (N, P, K)** — Optimal diapazonda yoki kam

### Algoritm

```php
if (pH === optimal && N,P,K === optimal) {
    overall_status = 'ready'
} else {
    overall_status = 'needs_improvement'
}
```

### Response misoli (tayyorgarlik kerak)

```json
{
  "data": {
    "analysis_id": 1,
    "plant_id": 3,
    "plant_name": "Paxta",
    "soil_id": 1,
    "field_id": 1,
    "field_name": "Shimoliy dala",
    "overall_status": "needs_improvement",
    "ph": {
      "value": 5.2,
      "status": "too_acidic",
      "recommendation": "Tuproq juda kislotali, ohak (lime) qo'llash tavsiya etiladi."
    },
    "deficient_elements": [
      {
        "element_code": "N",
        "element_name": "Azot",
        "value": 15.0,
        "status": "low",
        "difference_code": -1,
        "optimal_min": 30.0,
        "optimal_max": 60.0
      },
      {
        "element_code": "P",
        "element_name": "Fosfor",
        "value": 8.5,
        "status": "low",
        "difference_code": -1,
        "optimal_min": 15.0,
        "optimal_max": 30.0
      }
    ],
    "summary_text": "\"Shimoliy dala\" dalasidagi tuproq Paxta ekini uchun to'liq tayyor emas. Quyidagi elementlar yetarli emas: N, P. pH holati: juda kislotali. Mos o'g'it tavsiyalari uchun fertilizatsiya bo'limiga qarang."
  }
}
```

### Response misoli (tayyor)

```json
{
  "data": {
    "analysis_id": 2,
    "plant_id": 1,
    "plant_name": "Bug'doy",
    "soil_id": 2,
    "field_id": 2,
    "field_name": "Janubiy dala",
    "overall_status": "ready",
    "ph": {
      "value": 6.8,
      "status": "optimal",
      "recommendation": "pH ko'pchilik ekinlar uchun maqbul diapazonda."
    },
    "deficient_elements": [],
    "summary_text": "Tahlil natijasiga ko'ra \"Janubiy dala\" dalasidagi tuproq Bug'doy ekini uchun yetarli holatda. Asosiy ozuqa elementlari (N, P, K) optimal diapazonda, pH esa maqbul."
  }
}
```

### Status qiymatlari

| overall_status | Tavsif |
|----------------|--------|
| `ready` | Tuproq ekin uchun tayyor |
| `needs_improvement` | Tuproq tayyorgarlik talab qiladi |

| ph.status | Tavsif |
|-----------|--------|
| `optimal` | pH 5.5-7.5 oralig'ida |
| `too_acidic` | pH < 5.5 |
| `too_alkaline` | pH > 7.5 |
| `unknown` | pH qiymati mavjud emas |

---

## O'g'it tavsiyalari

### Endpoint

```
GET /api/analyses/{id}/conclusions/amounts
```

### Hisoblash formulasi

| Element | Formula | Basis |
|---------|---------|-------|
| N (Azot) | 80 kg/ha (default) | `N_low_default` |
| P (Fosfor) | `(optimal_min - value) × 20` kg/ha | `P2O5_deficiency` |
| K (Kaliy) | `(optimal_min - value) × 10` kg/ha | `K2O_deficiency` |

### O'g'it miqdori hisoblash

```
fertilizer_kg_per_ha = required_nutrient_kg_per_ha / (nutrient_percent / 100)
```

### Response misoli

```json
{
  "data": [
    {
      "analysis_id": 1,
      "element_id": 1,
      "element_code": "N",
      "fertilizer_id": 1,
      "fertilizer_name": "Karbamid (Urea)",
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

---

## TypeScript Types

```typescript
// types/soil.ts

// Tuproq namunasi
export interface Soil {
  id: number;
  field_id: number;
  name: string | null;
  sampled_at: string | null;
  humus: number | null;
  texture: string | null;
  
  // Makro elementlar
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  magnesium: number | null;
  calcium: number | null;
  sulfur: number | null;
  sodium: number | null;
  
  // Mikro elementlar
  boron: number | null;
  copper: number | null;
  iron: number | null;
  molybdenum: number | null;
  manganese: number | null;
  cobalt: number | null;
  zinc: number | null;
  chromium: number | null;
  
  // pH
  ph: number | null;
  
  // Og'ir metallar
  lead: number | null;
  mercury: number | null;
  cadmium: number | null;
  silver: number | null;
  
  field?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

// Tuproq yaratish
export interface CreateSoilRequest {
  field_id: number;
  name?: string | null;
  sampled_at?: string | null;
  humus?: number | null;
  texture?: string | null;
  nitrogen?: number | null;
  phosphorus?: number | null;
  potassium?: number | null;
  magnesium?: number | null;
  calcium?: number | null;
  sulfur?: number | null;
  sodium?: number | null;
  boron?: number | null;
  copper?: number | null;
  iron?: number | null;
  molybdenum?: number | null;
  manganese?: number | null;
  cobalt?: number | null;
  zinc?: number | null;
  chromium?: number | null;
  ph?: number | null;
  lead?: number | null;
  mercury?: number | null;
  cadmium?: number | null;
  silver?: number | null;
}

// Tuproq tayyorgarligi
export type ReadinessOverallStatus = 'ready' | 'needs_improvement';
export type PhStatus = 'unknown' | 'too_acidic' | 'too_alkaline' | 'optimal';

export interface DeficientElementSummary {
  element_code: string;
  element_name: string;
  value: number;
  status: 'low' | 'optimal' | 'high' | 'unknown';
  difference_code: number;
  optimal_min: number | null;
  optimal_max: number | null;
}

export interface ReadinessSummary {
  analysis_id: number;
  plant_id: number | null;
  plant_name: string | null;
  soil_id: number | null;
  field_id: number | null;
  field_name: string | null;
  overall_status: ReadinessOverallStatus;
  ph: {
    value: number | null;
    status: PhStatus;
    recommendation: string | null;
  };
  deficient_elements: DeficientElementSummary[];
  summary_text: string;
}

// O'g'it tavsiyasi
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
```

---

## API Functions (Next.js)

```typescript
// lib/api/soils.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://maktab.ideal-study.uz/api';

// Barcha namunalarni olish
export async function getSoils(fieldId?: number) {
  const query = fieldId ? `?field_id=${fieldId}` : '';
  const res = await fetch(`${API_BASE}/soils${query}`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error('Namunalarni olishda xatolik');
  return res.json();
}

// Bitta namunani olish
export async function getSoil(id: number) {
  const res = await fetch(`${API_BASE}/soils/${id}`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error('Namunani olishda xatolik');
  return res.json();
}

// Yangi namuna yaratish
export async function createSoil(data: CreateSoilRequest) {
  const res = await fetch(`${API_BASE}/soils`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Yaratishda xatolik');
  }
  return res.json();
}

// Namunani yangilash
export async function updateSoil(id: number, data: Partial<CreateSoilRequest>) {
  const res = await fetch(`${API_BASE}/soils/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Yangilashda xatolik');
  }
  return res.json();
}

// Namunani o'chirish
export async function deleteSoil(id: number) {
  const res = await fetch(`${API_BASE}/soils/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error('O\'chirishda xatolik');
}

// Tuproq tayyorgarligini olish
export async function getAnalysisReadiness(analysisId: number) {
  const res = await fetch(`${API_BASE}/analyses/${analysisId}/readiness`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error('Tayyorgarlikni olishda xatolik');
  return res.json();
}

// O'g'it tavsiyalarini olish
export async function getAnalysisAmounts(analysisId: number) {
  const res = await fetch(`${API_BASE}/analyses/${analysisId}/conclusions/amounts`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error('Tavsiyalarni olishda xatolik');
  return res.json();
}
```

---

## React Komponentlar

### SoilReadinessCard

Tuproq tayyorgarligini ko'rsatuvchi karta.

```tsx
// components/SoilReadinessCard.tsx

'use client';

import { useEffect, useState } from 'react';
import type { ReadinessSummary } from '@/lib/types';

interface Props {
  analysisId: number;
}

export function SoilReadinessCard({ analysisId }: Props) {
  const [readiness, setReadiness] = useState<ReadinessSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analyses/${analysisId}/readiness`)
      .then(res => res.json())
      .then(data => setReadiness(data.data))
      .finally(() => setLoading(false));
  }, [analysisId]);

  if (loading) return <div>Yuklanmoqda...</div>;
  if (!readiness) return null;

  const isReady = readiness.overall_status === 'ready';

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Status */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">🌱 Tuproq tayyorgarligi</h2>
        <span className={`px-3 py-1 rounded-full text-sm ${
          isReady 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isReady ? '✅ Tayyor' : '⚠️ Tayyorgarlik kerak'}
        </span>
      </div>

      {/* Summary */}
      <p className="text-gray-700 mb-4">{readiness.summary_text}</p>

      {/* Details */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* pH */}
        <div className="border rounded p-3">
          <h3 className="font-medium mb-2">⚗️ pH holati</h3>
          <p>Qiymat: <strong>{readiness.ph.value ?? '—'}</strong></p>
          <p>Holat: <strong>{readiness.ph.status}</strong></p>
          {readiness.ph.recommendation && (
            <p className="text-sm text-gray-600 mt-2">
              💡 {readiness.ph.recommendation}
            </p>
          )}
        </div>

        {/* Deficient Elements */}
        <div className="border rounded p-3">
          <h3 className="font-medium mb-2">🧪 Kam elementlar</h3>
          {readiness.deficient_elements.length === 0 ? (
            <p className="text-green-600">✅ Barcha elementlar yetarli</p>
          ) : (
            <ul className="space-y-1">
              {readiness.deficient_elements.map(el => (
                <li key={el.element_code} className="text-red-600">
                  ⚠️ {el.element_code}: {el.value} (min: {el.optimal_min})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
```

### FertilizerTable

O'g'it tavsiyalari jadvali.

```tsx
// components/FertilizerTable.tsx

'use client';

import type { FertilizerRecommendation } from '@/lib/types';

interface Props {
  recommendations: FertilizerRecommendation[];
}

export function FertilizerTable({ recommendations }: Props) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        ✅ O'g'it tavsiyasi yo'q — barcha elementlar optimal
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b bg-gray-50">
          <th className="text-left py-3 px-4">Element</th>
          <th className="text-left py-3 px-4">O'g'it</th>
          <th className="text-right py-3 px-4">Kerakli (kg/ga)</th>
          <th className="text-right py-3 px-4">O'g'it (kg/ga)</th>
        </tr>
      </thead>
      <tbody>
        {recommendations.map((rec, idx) => (
          <tr key={idx} className="border-b">
            <td className="py-3 px-4 font-medium">{rec.element_code}</td>
            <td className="py-3 px-4">{rec.fertilizer_name}</td>
            <td className="py-3 px-4 text-right">
              {rec.required_nutrient_kg_per_ha.toFixed(1)}
            </td>
            <td className="py-3 px-4 text-right font-semibold text-green-600">
              {rec.fertilizer_kg_per_ha.toFixed(1)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## Backend Servislari

### SoilAnalysisService

```php
// app/Services/SoilAnalysisService.php

class SoilAnalysisService
{
    // Element statusini hisoblash
    public function calculateElementStatus(Element $element, float $value): array
    {
        // value < optimal_min → 'low', difference_code = -1
        // value > optimal_max → 'high', difference_code = 1
        // optimal oralig'ida → 'optimal', difference_code = 0
    }

    // pH klassifikatsiyasi
    public function classifyPh(?float $ph): array
    {
        // < 5.5 → 'too_acidic'
        // > 7.5 → 'too_alkaline'
        // 5.5-7.5 → 'optimal'
    }

    // Tuproq tayyorgarligi
    public function buildReadinessSummary(Analysis $analysis): array
    {
        // pH + N,P,K tekshiruvi
        // overall_status = 'ready' | 'needs_improvement'
        // O'zbekcha xulosa matni
    }
}
```

### FertilizerRecommendationService

```php
// app/Services/FertilizerRecommendationService.php

class FertilizerRecommendationService
{
    // O'g'it tavsiyalarini hisoblash
    public function getAmountsForAnalysis(Analysis $analysis): Collection
    {
        // Kam elementlarni aniqlash
        // Mos o'g'itni tanlash
        // kg/ga hisoblash
    }
}
```

---

## Validation Rules

### CreateSoilRequest

| Field | Rules |
|-------|-------|
| `field_id` | required, exists:fields,id |
| `name` | nullable, string, max:255 |
| `sampled_at` | nullable, date |
| `humus` | nullable, numeric, min:0, max:100 |
| `texture` | nullable, string, max:100 |
| `nitrogen` | nullable, numeric, min:0, max:10000 |
| `phosphorus` | nullable, numeric, min:0, max:10000 |
| `potassium` | nullable, numeric, min:0, max:10000 |
| `ph` | nullable, numeric, min:0, max:14 |
| ... | (boshqa elementlar ham shunga o'xshash) |

---

## Tuproq tuzilishi (texture)

| Qiymat | O'zbekcha |
|--------|-----------|
| `sandy` | Qumloq |
| `loamy_sand` | Qumloq-soz |
| `sandy_loam` | Soz-qumloq |
| `loam` | Soz (Loam) |
| `silt_loam` | Gil-soz |
| `silt` | Gil |
| `clay_loam` | Loy-soz |
| `clay` | Loy |

---

## Foydalanish misollari

### 1. Yangi namuna yaratish

```typescript
const newSoil = await createSoil({
  field_id: 1,
  name: 'Shimoliy dala - Namuna #1',
  sampled_at: '2024-01-15',
  ph: 6.5,
  nitrogen: 45,
  phosphorus: 30,
  potassium: 200,
  humus: 2.8,
  texture: 'loam',
});
```

### 2. Tuproq tayyorgarligini tekshirish

```typescript
const readiness = await getAnalysisReadiness(1);

if (readiness.data.overall_status === 'ready') {
  console.log('✅ Tuproq ekin uchun tayyor!');
} else {
  console.log('⚠️ Tayyorgarlik kerak:');
  readiness.data.deficient_elements.forEach(el => {
    console.log(`  - ${el.element_code}: ${el.value} (min: ${el.optimal_min})`);
  });
}
```

### 3. O'g'it tavsiyalarini olish

```typescript
const amounts = await getAnalysisAmounts(1);

amounts.data.forEach(rec => {
  console.log(`${rec.element_code}: ${rec.fertilizer_name} - ${rec.fertilizer_kg_per_ha} kg/ga`);
});
```

---

*Oxirgi yangilanish: Noyabr 2024*

