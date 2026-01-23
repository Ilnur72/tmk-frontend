# Dashboard Analytics API

**Faqat Analitik Ko'rsatkichlar** - Director uchun Dashboard

Backend o'zida barcha analitik ma'lumotlarni shakllantirib, frontend ga tayyor ko'rsatkichlarni beradi.

---

## 📊 Asosiy Prinsip

❌ **EMAS:** To'liq ro'yxatlar (list), batafsil ma'lumotlar  
✅ **HA:** Faqat raqamlar, foizlar, taqqoslashlar, trendlar

---

## 🎯 Overview Dashboard

**GET** `/dashboard/overview`

Barcha asosiy ko'rsatkichlar bitta so'rovda.

### Response:
```json
{
  "success": true,
  "data": {
    "transport": {
      "total": 150,
      "online": 120,
      "moving": 45,
      "idle": 30,
      "offline": 30,
      "onlinePercentage": "80.0",
      "movingPercentage": "30.0"
    },
    "drivers": {
      "total": 200,
      "active": 180,
      "inactive": 15,
      "suspended": 5,
      "expiredLicenses": 12,
      "activePercentage": "90.0",
      "expiredPercentage": "6.0"
    },
    "energy": {
      "thisMonth": 15250.50,
      "lastMonth": 14800.25,
      "change": 3.0,
      "trend": "up"
    },
    "solar": {
      "stationCount": 3,
      "deviceCount": 15,
      "thisMonthProduction": 2500.75,
      "lastMonthProduction": 2300.50,
      "change": 8.7,
      "trend": "up"
    },
    "factories": {
      "total": 45,
      "registration": 10,
      "construction": 15,
      "started": 20,
      "thisMonthNew": 2,
      "lastMonthNew": 1
    },
    "het": {
      "totalReadings": 15000,
      "meterTypes": 3,
      "lastImport": "2026-01-22T10:30:00.000Z"
    },
    "employees": {
      "total": 150
    },
    "finance": {
      "totalPrices": 25,
      "totalSources": 5,
      "recentChanges": 8
    },
    "timestamp": "2026-01-22T12:00:00.000Z"
  }
}
```

---

## ⚡ Energy Dashboard

**GET** `/dashboard/energy?days=7`

Energiya sarfi analitikasi.

### Response:
```json
{
  "success": true,
  "data": {
    "today": 450.75,
    "thisMonth": 15250.50,
    "lastMonth": 14800.25,
    "monthlyChange": 3.0,
    "trend": "up",
    "topConsumersCount": 10,
    "timestamp": "2026-01-22T12:00:00.000Z"
  }
}
```

### Ko'rsatkichlar:
- **today** - Bugungi umumiy sarf (kWh)
- **thisMonth** - Shu oyda sarf (kWh)
- **lastMonth** - O'tgan oyda sarf (kWh)
- **monthlyChange** - O'zgarish foizi (%)
- **trend** - Yo'nalish (up/down/stable)
- **topConsumersCount** - Top sarflovchilar soni

---

## 🚗 Transport Dashboard

**GET** `/dashboard/transport`

Transport va haydovchilar analitikasi.

### Response:
```json
{
  "success": true,
  "data": {
    "vehicles": {
      "total": 150,
      "online": 120,
      "moving": 45,
      "idle": 30,
      "offline": 30,
      "onlinePercentage": "80.0",
      "movingPercentage": "30.0"
    },
    "drivers": {
      "total": 200,
      "active": 180,
      "inactive": 15,
      "suspended": 5,
      "expiredLicenses": 12,
      "activePercentage": "90.0",
      "expiredPercentage": "6.0"
    },
    "expiringLicensesNext30Days": 8,
    "timestamp": "2026-01-22T12:00:00.000Z"
  }
}
```

---

## 💰 Finance Dashboard

**GET** `/dashboard/finance`

Moliya analitikasi.

### Response:
```json
{
  "success": true,
  "data": {
    "totalPrices": 25,
    "totalSources": 5,
    "recentChanges24h": 8,
    "topChangedCount": 5,
    "timestamp": "2026-01-22T12:00:00.000Z"
  }
}
```

### Ko'rsatkichlar:
- **totalPrices** - Jami narxlar
- **totalSources** - Manbalar soni
- **recentChanges24h** - Oxirgi 24 soatda o'zgargan narxlar
- **topChangedCount** - Eng ko'p o'zgarganlar soni

---

## 🏭 Factories Dashboard

**GET** `/dashboard/factories`

Zavodlar analitikasi.

### Response:
```json
{
  "success": true,
  "data": {
    "total": 45,
    "byStatus": {
      "registration": 10,
      "construction": 15,
      "started": 20
    },
    "monthly": {
      "thisMonthNew": 2,
      "lastMonthNew": 1
    },
    "timestamp": "2026-01-22T12:00:00.000Z"
  }
}
```

---

## ☀️ Solar Dashboard

**GET** `/dashboard/solar`

Quyosh energiyasi analitikasi.

### Response:
```json
{
  "success": true,
  "data": {
    "stations": 3,
    "devices": 15,
    "production": {
      "thisMonth": 2500.75,
      "lastMonth": 2300.50,
      "change": 8.7,
      "trend": "up"
    },
    "timestamp": "2026-01-22T12:00:00.000Z"
  }
}
```

### Ko'rsatkichlar:
- **stations** - Stansiyalar soni
- **devices** - Qurilmalar soni
- **thisMonth** - Shu oylik ishlab chiqarish
- **lastMonth** - O'tgan oylik ishlab chiqarish
- **change** - O'zgarish foizi (%)
- **trend** - Yo'nalish

---

## 🔌 HET Dashboard

**GET** `/dashboard/het`

HET import analitikasi.

### Response:
```json
{
  "success": true,
  "data": {
    "totalReadings": 15000,
    "meterTypes": 3,
    "lastImport": "2026-01-22T10:30:00.000Z",
    "timestamp": "2026-01-22T12:00:00.000Z"
  }
}
```

---

## 👥 Employees Dashboard

**GET** `/dashboard/employees`

Xodimlar analitikasi.

### Response:
```json
{
  "success": true,
  "data": {
    "total": 150,
    "timestamp": "2026-01-22T12:00:00.000Z"
  }
}
```

---

## 📈 Trend Indicators

Barcha dashboard'larda **trend** maydoni:

- `"up"` - ↑ O'sish (yashil)
- `"down"` - ↓ Pasayish (qizil)
- `"stable"` - → Barqaror (ko'k)

---

## 🎨 Frontend Integration

### React/Vue/Angular Example

```javascript
// Dashboard Overview
const DashboardOverview = () => {
  const { data, loading } = useDashboard('/dashboard/overview');
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Transport Card */}
      <Card>
        <h3>Transport</h3>
        <div className="stat">
          <span className="value">{data.transport.online}</span>
          <span className="label">Online</span>
          <span className="percent">{data.transport.onlinePercentage}%</span>
        </div>
      </Card>

      {/* Energy Card */}
      <Card>
        <h3>Energiya</h3>
        <div className="stat">
          <span className="value">{data.energy.thisMonth} kWh</span>
          <Trend value={data.energy.change} trend={data.energy.trend} />
        </div>
      </Card>

      {/* Solar Card */}
      <Card>
        <h3>Quyosh</h3>
        <div className="stat">
          <span className="value">{data.solar.thisMonthProduction} kWh</span>
          <Trend value={data.solar.change} trend={data.solar.trend} />
        </div>
      </Card>

      {/* Factories Card */}
      <Card>
        <h3>Zavodlar</h3>
        <div className="stat">
          <span className="value">{data.factories.total}</span>
          <span className="new">+{data.factories.thisMonthNew} yangi</span>
        </div>
      </Card>
    </div>
  );
};

// Trend Component
const Trend = ({ value, trend }) => {
  const color = trend === 'up' ? 'green' : trend === 'down' ? 'red' : 'blue';
  const icon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  
  return (
    <span className={`trend ${color}`}>
      {icon} {Math.abs(value)}%
    </span>
  );
};
```

---

## 📊 Dashboard Layout Example

```
┌────────────────────────────────────────────────────────────┐
│  TMK DASHBOARD - DIREKTOR                                   │
├───────────────┬───────────────┬───────────────┬────────────┤
│  🚗 TRANSPORT │  ⚡ ENERGIYA  │  ☀️ QUYOSH    │  🏭 ZAVOD   │
│  150 ta       │  15,250 kWh   │  2,500 kWh    │  45 ta     │
│  ✓ 120 online │  ↑ +3.0%      │  ↑ +8.7%      │  +2 yangi  │
│  80% faol     │  o'tgan oyga  │  o'tgan oyga  │  shu oyda  │
└───────────────┴───────────────┴───────────────┴────────────┘
├────────────────────────────────────────────────────────────┤
│  👥 HAYDOVCHILAR                  💰 MOLIYA                │
│  200 ta                            25 ta narx              │
│  ✓ 180 faol (90%)                 8 ta o'zgarish (24h)    │
│  ⚠️ 8 ta guvohnoma tugaydi (30 kun)                       │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Auto-Refresh Strategy

```javascript
// Dashboard Overview - har 30 sekundda
useEffect(() => {
  const interval = setInterval(() => {
    refreshDashboard();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);

// Energy Dashboard - har 1 minutda
// Finance Dashboard - har 5 minutda
// Factories Dashboard - har 5 minutda
```

---

## ✅ Qanday Ma'lumotlar Qaytadi

### ✅ Ha - Backend beradi:
- Jami soni (counts)
- Foizlar (percentages)
- O'zgarishlar (changes)
- Trendlar (trends)
- Taqqoslashlar (comparisons)
- Umumiy yig'indilar (totals)

### ❌ Yo'q - Backend bermaydi:
- To'liq ro'yxatlar (full lists)
- Batafsil obyekt ma'lumotlari
- Nested arraylar
- Translation fields
- Raw data

---

## 🎯 Director Ko'rish Kerak Bo'lgan Ko'rsatkichlar

1. **Transport:** Online %, harakatdagi %, muammolar
2. **Energiya:** Shu oy sarfi, o'tgan oy bilan taqqoslash, trend
3. **Quyosh:** Ishlab chiqarish, o'sish foizi
4. **Zavodlar:** Jami, holati bo'yicha, yangilari
5. **Haydovchilar:** Faol %, guvohnomasi tugaydiganlar
6. **Moliya:** Narxlar soni, oxirgi o'zgarishlar
7. **HET:** Umumiy o'qishlar, oxirgi import

---

**Version:** 2.0.0 (Analytics Only)  
**Last Updated:** 22.01.2026  
**Author:** TMK Backend Team
