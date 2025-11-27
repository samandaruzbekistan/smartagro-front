
## Tuproq Tahlili (Soil Analysis) - To'liq API

Tuproq namunalarini boshqarish va tahlil qilish uchun API. Makro elementlar, mikro elementlar, pH va og'ir metallarni o'z ichiga oladi.

### Endpointlar jadvali

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/soils` | Barcha namunalar ro'yxati |
| POST | `/soils` | Yangi namuna yaratish |
| GET | `/soils/{id}` | Bitta namunani olish |
| PUT | `/soils/{id}` | Namunani yangilash |
| DELETE | `/soils/{id}` | Namunani o'chirish |

---

### Tahlil parametrlari

Barcha element qiymatlari **mg/kg (ppm)** birligida saqlanadi.

#### A) Asosiy ma'lumotlar

| Field | Type | Tavsif |
|-------|------|--------|
| `field_id` | integer | Dala ID (majburiy) |
| `name` | string | Namuna nomi (ixtiyoriy) |
| `sampled_at` | date | Olingan sana |
| `humus` | float | Gumus miqdori (%) |
| `texture` | string | Tuproq tuzilishi |

#### B) Makro elementlar (NPK va boshqalar)

| Field | Kod | Nomi | Birlik |
|-------|-----|------|--------|
| `nitrogen` | N | Azot | mg/kg |
| `phosphorus` | P | Fosfor | mg/kg |
| `potassium` | K | Kaliy | mg/kg |
| `magnesium` | Mg | Magniy | mg/kg |
| `calcium` | Ca | Kalsiy | mg/kg |
| `sulfur` | S | Oltingugurt | mg/kg |
| `sodium` | Na | Natriy | mg/kg |

#### C) Mikro elementlar

| Field | Kod | Nomi | Birlik |
|-------|-----|------|--------|
| `boron` | B | Bor | mg/kg |
| `copper` | Cu | Mis | mg/kg |
| `iron` | Fe | Temir | mg/kg |
| `molybdenum` | Mo | Molibden | mg/kg |
| `manganese` | Mn | Marganets | mg/kg |
| `cobalt` | Co | Kobalt | mg/kg |
| `zinc` | Zn | Rux | mg/kg |
| `chromium` | Cr | Xrom | mg/kg |

#### D) Tuproq reaktsiyasi

| Field | Tavsif | Diapazon |
|-------|--------|----------|
| `ph` | pH qiymati | 0-14 |

**pH talqini:**
- `< 5.5` — Juda kislotali (ohak tavsiya etiladi)
- `5.5 - 7.5` — Maqbul diapazon
- `> 7.5` — Ishqoriy (organik modda tavsiya etiladi)

#### E) Og'ir metallar (ifloslanish)

| Field | Kod | Nomi | Birlik |
|-------|-----|------|--------|
| `lead` | Pb | Qo'rg'oshin | mg/kg |
| `mercury` | Hg | Simob | mg/kg |
| `cadmium` | Cd | Kadmiy | mg/kg |
| `silver` | Ag | Kumush | mg/kg |

---

### GET `/soils`

Barcha tuproq namunalarini olish (pagination bilan).

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `field_id` | integer | ❌ | Dala bo'yicha filter |
| `page` | integer | ❌ | Sahifa raqami |

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "field_id": 1,
      "name": "Shimoliy dala - Namuna #1",
      "sampled_at": "2024-01-15",
      "humus": 3.2,
      "texture": "loam",
      "nitrogen": 45.5,
      "phosphorus": 28.3,
      "potassium": 180.0,
      "magnesium": 120.5,
      "calcium": 2500.0,
      "sulfur": 15.0,
      "sodium": 45.0,
      "boron": 0.8,
      "copper": 2.5,
      "iron": 150.0,
      "molybdenum": 0.15,
      "manganese": 25.0,
      "cobalt": 0.3,
      "zinc": 4.5,
      "chromium": 0.8,
      "ph": 6.8,
      "lead": 12.0,
      "mercury": 0.05,
      "cadmium": 0.2,
      "silver": null,
      "field": {
        "id": 1,
        "name": "Shimoliy dala"
      },
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z"
    }
  ],
  "links": {
    "first": "https://maktab.ideal-study.uz/api/soils?page=1",
    "last": "https://maktab.ideal-study.uz/api/soils?page=3",
    "prev": null,
    "next": "https://maktab.ideal-study.uz/api/soils?page=2"
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

### GET `/soils/{id}`

Bitta tuproq namunasini olish.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Namuna ID |

**Response (200):** Yuqoridagi `data` obyekti bilan bir xil.

---

### POST `/soils`

Yangi tuproq namunasi yaratish.

**Request Body (minimal):**

```json
{
  "field_id": 1,
  "name": "Yangi namuna",
  "sampled_at": "2024-01-20"
}
```

**Request Body (to'liq):**

```json
{
  "field_id": 1,
  "name": "Shimoliy dala - Namuna #1",
  "sampled_at": "2024-01-15",
  "humus": 3.2,
  "texture": "loam",
  
  "nitrogen": 45.5,
  "phosphorus": 28.3,
  "potassium": 180.0,
  "magnesium": 120.5,
  "calcium": 2500.0,
  "sulfur": 15.0,
  "sodium": 45.0,
  
  "boron": 0.8,
  "copper": 2.5,
  "iron": 150.0,
  "molybdenum": 0.15,
  "manganese": 25.0,
  "cobalt": 0.3,
  "zinc": 4.5,
  "chromium": 0.8,
  
  "ph": 6.8,
  
  "lead": 12.0,
  "mercury": 0.05,
  "cadmium": 0.2,
  "silver": null
}
```

**Validation Rules:**

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
| `magnesium` | nullable, numeric, min:0, max:10000 |
| `calcium` | nullable, numeric, min:0, max:50000 |
| `sulfur` | nullable, numeric, min:0, max:10000 |
| `sodium` | nullable, numeric, min:0, max:10000 |
| `boron` | nullable, numeric, min:0, max:1000 |
| `copper` | nullable, numeric, min:0, max:1000 |
| `iron` | nullable, numeric, min:0, max:50000 |
| `molybdenum` | nullable, numeric, min:0, max:100 |
| `manganese` | nullable, numeric, min:0, max:5000 |
| `cobalt` | nullable, numeric, min:0, max:100 |
| `zinc` | nullable, numeric, min:0, max:1000 |
| `chromium` | nullable, numeric, min:0, max:1000 |
| `ph` | nullable, numeric, min:0, max:14 |
| `lead` | nullable, numeric, min:0, max:1000 |
| `mercury` | nullable, numeric, min:0, max:100 |
| `cadmium` | nullable, numeric, min:0, max:100 |
| `silver` | nullable, numeric, min:0, max:100 |

**Response (201):** Yaratilgan namuna.

---

### PUT `/soils/{id}`

Tuproq namunasini yangilash.

**Request Body:** Faqat o'zgartirmoqchi bo'lgan fieldlarni yuboring.

```json
{
  "ph": 7.0,
  "nitrogen": 50.0,
  "phosphorus": 32.5
}
```

**Response (200):** Yangilangan namuna.

---

### DELETE `/soils/{id}`

Tuproq namunasini o'chirish.

**Response (200):**

```json
{
  "message": "Tuproq namunasi muvaffaqiyatli o'chirildi."
}
```

---

### Tuproq tuzilishi (texture) qiymatlari

| Qiymat | O'zbekcha |
|--------|-----------|
| `sandy` | Qumloq |
| `loamy_sand` | Qumloq-soz |
| `sandy_loam` | Soz-qumloq |
| `loam` | Soz (Loam) |
| `silt_loam` | Gil-soz |
| `silt` | Gil |
| `sandy_clay_loam` | Qumloq-loy-soz |
| `clay_loam` | Loy-soz |
| `silty_clay_loam` | Gil-loy-soz |
| `sandy_clay` | Qumloq-loy |
| `silty_clay` | Gil-loy |
| `clay` | Loy |

---

### TypeScript Types

```typescript
// types/soil.ts

export interface Soil {
  id: number;
  field_id: number;
  
  // Asosiy
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
  
  // Bog'lanishlar
  field?: { id: number; name: string };
  
  created_at: string;
  updated_at: string;
}

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

export type UpdateSoilRequest = Partial<CreateSoilRequest>;
```

---

### Next.js API Functions

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
export async function updateSoil(id: number, data: UpdateSoilRequest) {
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
```

---

### Foydalanish misoli (React)

```tsx
// Namuna yaratish
const handleCreate = async () => {
  const newSoil = await createSoil({
    field_id: 1,
    name: 'Yangi namuna',
    sampled_at: '2024-01-20',
    ph: 6.5,
    nitrogen: 45,
    phosphorus: 30,
    potassium: 200,
    humus: 2.8,
    texture: 'loam',
  });
  console.log('Yaratildi:', newSoil.data);
};

// pH bo'yicha tavsiya
function getPhRecommendation(ph: number | null): string {
  if (ph === null) return 'Ma\'lumot yo\'q';
  if (ph < 5.5) return '⚠️ Juda kislotali - ohak qo\'llash tavsiya etiladi';
  if (ph > 7.5) return '⚠️ Ishqoriy - organik modda qo\'shish tavsiya etiladi';
  return '✅ Maqbul diapazon';
}
```