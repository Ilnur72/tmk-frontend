# Dashboard Module

TMK Backend loyihasidagi Dashboard moduli - barcha asosiy ko'rsatkichlarni bitta joyda to'playdi.

## 📊 Xususiyatlari

Dashboard moduli turli modullardan ma'lumotlarni yig'ib, frontend uchun qulay formatda taqdim etadi:

- ✅ **Umumiy Overview** - Barcha tizim ko'rsatkichlari
- ✅ **Energiya Dashboard** - Zavodlar energiya sarfi va taqqoslash
- ✅ **Transport Dashboard** - Transportlar va haydovchilar holati
- ✅ **Moliya Dashboard** - Metal narxlari va statistika
- ✅ **Zavodlar Dashboard** - Zavodlar holati va kategoriyalari
- ✅ **Quyosh Energiyasi Dashboard** - FusionSolar statistika
- ✅ **HET Dashboard** - HET import statistikasi

## 🔗 Endpoints

### 1. Umumiy Dashboard Overview

**GET** `/dashboard/overview`

Barcha asosiy ko'rsatkichlarni bitta so'rovda olish.

**Response:**
```json
{
  "success": true,
  "data": {
    "transport": {
      "total": 150,
      "online": 120,
      "moving": 45,
      "idle": 30,
      "stopped": 45
    },
    "drivers": {
      "total": 200,
      "active": 180,
      "inactive": 15,
      "suspended": 5,
      "expiredLicenses": 12
    },
    "finance": {
      "totalPrices": 25,
      "totalSources": 5,
      "recentChanges": 8,
      "topChangedMetals": [...]
    },
    "energy": {
      "today": [...]
    },
    "solar": {
      "stationCount": 3,
      "totalCapacity": "1500.00",
      "totalInverterPower": "1200.50",
      "totalPowerProfit": "850.25",
      "totalTheoryPower": "1400.00"
    },
    "factories": {
      "total": 45,
      "counts": {
        "registrationCount": 10,
        "constructionCount": 15,
        "startedCount": 20
      }
    },
    "het": {
      "totalReadings": 15000,
      "latestImport": "2026-01-22T10:30:00.000Z",
      "oldestReading": "2025-01-01T00:00:00.000Z",
      "newestReading": "2026-01-22T00:00:00.000Z",
      "meterTypes": [
        { "type": "electric", "count": 8000 },
        { "type": "water", "count": 7000 }
      ]
    },
    "timestamp": "2026-01-22T12:00:00.000Z"
  }
}
```

### 2. Energiya Dashboard

**GET** `/dashboard/energy?days=7`

Energiya sarfi bo'yicha batafsil ma'lumotlar.

**Query Parameters:**
- `days` (optional) - Qancha kunlik ma'lumotlar (default: 7)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": [
      {
        "factory_id": 1,
        "meter_type": "electric",
        "avg_consumption": "1250.50",
        "max_consumption": "1800.00",
        "min_consumption": "900.00",
        "total_readings": 168
      }
    ],
    "topConsumers": [...],
    "today": [...],
    "period": 7,
    "timestamp": "2026-01-22T12:00:00.000Z"
  }
}
```

### 3. Transport Dashboard

**GET** `/dashboard/transport`

Transport va haydovchilar holati.

**Response:**
```json
{
  "success": true,
  "data": {
    "vehicles": {
      "total": 150,
      "online": 120,
      "moving": 45,
      "idle": 30,
      "stopped": 45
    },
    "drivers": {
      "total": 200,
      "active": 180,
      "inactive": 15,
      "suspended": 5,
      "expiredLicenses": 12
    },
    "expiringLicenses": {
      "count": 8,
      "list": [
        {
          "id": 1,
          "fullName": "John Doe",
          "licenseExpiryDate": "2026-02-15T00:00:00.000Z"
        }
      ]
    },
    "timestamp": "2026-01-22T12:00:00.000Z"
  }
}
```

### 4. Moliya Dashboard

**GET** `/dashboard/finance`

Metal narxlari va moliya statistikasi.

**Response:**
```json
{
  "success": true,
  "data": {
    "metalPrices": [
      {
        "id": 1,
        "symbol": "STEEL",
        "currentPrice": 850.50,
        "changePercent": 2.5,
        "source": {...}
      }
    ],
    "statistics": {
      "totalPrices": 25,
      "totalSources": 5,
      "recentChanges": 8,
      "topChangedMetals": [...]
    },
    "timestamp": "2026-01-22T12:00:00.000Z"
  }
}
```

### 5. Zavodlar Dashboard

**GET** `/dashboard/factories?lang=uz`

Zavodlar holati va statistika.

**Query Parameters:**
- `lang` (optional) - Til (uz, ru, en)

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "counts": {
      "registrationCount": 10,
      "constructionCount": 15,
      "startedCount": 20
    },
    "factories": [
      {
        "id": 1,
        "name": "Zavod #1",
        "status": "STARTED",
        "location": "Toshkent",
        ...
      }
    ],
    "timestamp": "2026-01-22T12:00:00.000Z"
  }
}
```

### 6. Quyosh Energiyasi Dashboard

**GET** `/dashboard/solar`

FusionSolar statistika va quyosh energiyasi.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "stationCount": 3,
      "totalCapacity": "1500.00",
      "totalInverterPower": "1200.50",
      "totalPowerProfit": "850.25",
      "totalTheoryPower": "1400.00"
    },
    "stations": {
      "total": 3,
      "list": [
        {
          "id": "uuid",
          "stationCode": "NE=12345",
          "stationName": "Solar Plant #1",
          "capacity": 500
        }
      ]
    },
    "devices": {
      "total": 15,
      "list": [...]
    },
    "timestamp": "2026-01-22T12:00:00.000Z"
  }
}
```

### 7. HET Integration Dashboard

**GET** `/dashboard/het`

HET tizimidan import qilingan ma'lumotlar statistikasi.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReadings": 15000,
    "latestImport": "2026-01-22T10:30:00.000Z",
    "oldestReading": "2025-01-01T00:00:00.000Z",
    "newestReading": "2026-01-22T00:00:00.000Z",
    "meterTypes": [
      { "type": "electric", "count": 8000 },
      { "type": "water", "count": 7000 },
      { "type": "gas", "count": 100 }
    ],
    "timestamp": "2026-01-22T12:00:00.000Z"
  }
}
```

## 🏗️ Arxitektura

### Module Structure

```
src/modules/dashboard/
├── dashboard.module.ts       # Dashboard moduli
├── dashboard.controller.ts   # Dashboard endpoints
└── dashboard.service.ts      # Dashboard business logic
```

### Dependencies

Dashboard moduli quyidagi modullardan ma'lumot oladi:

- **EnergyModule** - Energiya sarfi
- **FactoryModule** - Zavodlar ma'lumotlari
- **DriverModule** - Haydovchilar
- **FinanceModule** - Moliya va metal narxlari
- **FusionSolarModule** - Quyosh energiyasi
- **HetIntegrationModule** - HET import
- **TrackingModule** - Transport tracking
- **TechniquesModule** - Texnikalar

## 💡 Foydalanish

### Frontend Integration

```javascript
// React/Vue/Angular example
const getDashboardData = async () => {
  try {
    const response = await fetch('http://localhost:8085/dashboard/overview');
    const data = await response.json();
    
    if (data.success) {
      console.log('Transport:', data.data.transport);
      console.log('Drivers:', data.data.drivers);
      console.log('Energy:', data.data.energy);
      // ...
    }
  } catch (error) {
    console.error('Dashboard error:', error);
  }
};

// Energiya dashboard (7 kunlik)
const getEnergyDashboard = async (days = 7) => {
  const response = await fetch(`/dashboard/energy?days=${days}`);
  return await response.json();
};

// Transport dashboard
const getTransportDashboard = async () => {
  const response = await fetch('/dashboard/transport');
  return await response.json();
};
```

### Polling Strategy

Dashboard ma'lumotlarini avtomatik yangilash uchun:

```javascript
// Auto-refresh har 30 sekundda
setInterval(async () => {
  const dashboard = await getDashboardData();
  updateUI(dashboard.data);
}, 30000);

// Yoki React Query bilan
import { useQuery } from '@tanstack/react-query';

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => fetch('/dashboard/overview').then(r => r.json()),
    refetchInterval: 30000, // 30 seconds
  });
  
  // ...
}
```

## 🎯 Best Practices

### 1. Caching Strategy

Dashboard ma'lumotlari har 30 sekundda yangilanishi tavsiya etiladi:

- ✅ `/dashboard/overview` - 30 sekund
- ✅ `/dashboard/energy` - 1 minut
- ✅ `/dashboard/transport` - 30 sekund (real-time)
- ✅ `/dashboard/finance` - 5 minut
- ✅ `/dashboard/factories` - 5 minut
- ✅ `/dashboard/solar` - 1 minut
- ✅ `/dashboard/het` - 5 minut

### 2. Error Handling

Barcha endpoint'lar xatolikda graceful degradation qo'llab-quvvatlaydi:

```json
{
  "success": false,
  "error": "Failed to fetch vehicle stats",
  "timestamp": "2026-01-22T12:00:00.000Z"
}
```

Agar bitta servis ishlamasa, boshqa ma'lumotlar qaytadi:

```json
{
  "success": true,
  "data": {
    "transport": {
      "total": 0,
      "error": "Tracking service unavailable"
    },
    "drivers": { /* normal data */ },
    // ...
  }
}
```

### 3. Performance Optimization

- Barcha ma'lumotlar parallel ravishda yuklanadi (`Promise.all`)
- Har bir servis o'z error handling ga ega
- Lazy loading qo'llab-quvvatlanadi

## 🔧 Configuration

Dashboard moduli hech qanday alohida konfiguratsiya talab qilmaydi. Barcha sozlamalar tegishli modullarda (Energy, Factory, etc.) amalga oshiriladi.

## 📝 Notes

- Dashboard endpointlari authentication talab qilmaydi (public)
- Agar auth kerak bo'lsa, `@UseGuards(UniversalAuthGuard)` qo'shing
- Barcha vaqtlar ISO 8601 formatida (`timestamp` field)
- Til qo'llab-quvvatlash: `lang=uz|ru|en` parameter bilan

## 🚀 Future Enhancements

- [ ] Redis caching qo'shish
- [ ] GraphQL support
- [ ] WebSocket real-time updates
- [ ] Custom dashboard builder
- [ ] Export to PDF/Excel
- [ ] Notification alerts
- [ ] Historical data comparison

## 📊 Example Dashboard Layout

```
┌─────────────────────────────────────────────────┐
│  Overview Dashboard                              │
├─────────────┬─────────────┬─────────────────────┤
│  Transport  │   Drivers   │     Energy          │
│  150 total  │  200 total  │   1250 kW today     │
│  120 online │  180 active │   ↑ 5% vs yesterday │
└─────────────┴─────────────┴─────────────────────┘
├─────────────────────────────────────────────────┤
│  Factories Status                                │
│  Registration: 10 | Construction: 15 | Active: 20│
└─────────────────────────────────────────────────┘
├─────────────────────────────────────────────────┤
│  Solar Energy                                    │
│  3 Stations | 1500 kW capacity | 850 kW profit  │
└─────────────────────────────────────────────────┘
```

## 🤝 Contributing

Dashboard moduli ochiq o'zgartirishlar uchun. Yangi dashboard qo'shish:

1. `dashboard.service.ts` da yangi metod yarating
2. `dashboard.controller.ts` da endpoint qo'shing
3. Kerakli modulni `dashboard.module.ts` ga import qiling
4. README.md ni yangilang

---

**Version:** 1.0.0  
**Last Updated:** 22.01.2026  
**Maintainer:** TMK Backend Team
