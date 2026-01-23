# Dashboard API Endpoints

Loyihadagi barcha dashboard va statistika endpointlari modul bo'yicha to'plangan holda.

---

## 📊 Global Dashboard

### Main Dashboard
- **GET** `/dashboard`
  - VPN dan ma'lumotlarni oladi (datehb endpoint)
  - Response: VPN Dashboard ma'lumotlari

- **GET** `/`
  - Barcha zavodlar ro'yxati
  - Response: `{ factory: [...] }`

- **GET** `/metabase-dashboard`
  - Metabase dashboard linki
  - Auth: Required
  - Response: `{ dashboardUrl: string }`

---

## 🏭 Factory (Zavodlar)

### Zavodlar ro'yxati
- **GET** `/factory/marker`
  - Query params: `factory_param_id`, `project_category`, `lang`
  - Response: Zavodlar markers bilan
  - Til qo'llab-quvvatlaydi: uz, ru, en

### Statistika
- **GET** `/factory`
  - Query params: `status`, `search`, `page`, `limit`
  - Response:
    ```json
    {
      "total": number,
      "data": [...],
      "counts": {
        "registrationCount": number,
        "constructionCount": number,
        "startedCount": number
      }
    }
    ```

### Object Types
- **GET** `/factory/object-types`
  - Til qo'llab-quvvatlaydi
  - Response: Object types ro'yxati

---

## ⚡ Energy (Energiya)

### Bugungi sarflar
- **GET** `/energy/analysis/today-consumption`
  - Barcha zavodlarning bugungi sarfi
  - Response: Zavodlar bo'yicha bugungi sarflar

### Zavod taqqoslash
- **GET** `/energy/analysis/factory/:factoryId/comparison`
  - Zavod sarfini bugun vs kecha
  - Response: Taqqoslash ma'lumotlari

### Zavodlar overview
- **GET** `/energy/analysis/factories-overview`
  - Query params: `period` (default: 7 days)
  - Response: Zavodlar umumiy sarflari
  - Ma'lumotlar:
    - factory_id
    - meter_type
    - avg_consumption
    - max_consumption
    - min_consumption
    - total_readings

### Top consumers
- **GET** `/energy/analysis/top-consumers`
  - Query params: `type` (default: 'all'), `period` (default: 30 days)
  - Eng ko'p sarflovchi zavodlar
  - Response: Top consumers ro'yxati

### Operator zavodi
- **GET** `/energy/my-factory`
  - Auth: Required
  - Operatorning zavodi ma'lumotlari

### Meters
- **GET** `/energy/meters`
  - Query params: `factory_id`, `meter_type`, `status`, `page`, `limit`
  - Response: Meterlar ro'yxati paginatsiya bilan

### Meter Readings
- **GET** `/energy/meters/:meterId/readings`
  - Query params: `page`, `limit`
  - Meter o'qishlari tarixi
  - Response: Paginated readings

---

## ☀️ FusionSolar (Quyosh Energiyasi)

### Stations Overview
- **GET** `/fusion-solar/stations`
  - Barcha stansiyalar ro'yxati
  - Response: Stansiyalar ma'lumotlari

### Real-time Station KPI
- **GET** `/fusion-solar/station-kpi`
  - Query params: `stationCodes` (comma-separated)
  - Real-time KPI ma'lumotlari
  - Response:
    ```json
    {
      "stationCode": string,
      "dataItemMap": {
        "installed_capacity": number,
        "day_power": number,
        "month_power": number,
        "total_power": number,
        ...
      }
    }
    ```

### Database Stations
- **GET** `/fusion-solar/db-stations`
  - Bazadagi stansiyalar
  - Response: DB stations list

### Database Station KPI
- **GET** `/fusion-solar/db-station-kpi`
  - Query params: `stationCode`, `startDate`, `endDate`
  - Bazadagi KPI ma'lumotlari

### Devices Overview
- **GET** `/fusion-solar/devices`
  - Query params: `stationCodes` (comma-separated)
  - Barcha qurilmalar ro'yxati
  - Response: Devices ma'lumotlari

### Database Devices
- **GET** `/fusion-solar/db-devices`
  - Bazadagi qurilmalar
  - Response: DB devices list

### Device Real-time Data
- **GET** `/fusion-solar/device-kpi`
  - Query params: `deviceSns` (comma-separated)
  - Real-time qurilma ma'lumotlari

### Database Device Data
- **GET** `/fusion-solar/db-device-data`
  - Query params: `devId`, `startDate`, `endDate`
  - Qurilma tarixiy ma'lumotlari

### Alarms
- **GET** `/fusion-solar/alarms`
  - Query params: `stationCodes`, `deviceSns`
  - Aktiv alarmlar
  - Response: Alarms list

---

## 🚗 Tracking (Transport Monitoring)

### Vehicle Stats
- **GET** `/api/vehicles/stats`
  - Transport statistikasi
  - Response:
    ```json
    {
      "total": number,
      "online": number,
      "moving": number,
      "idle": number,
      "stopped": number,
      "lastUpdate": string
    }
    ```

### Cached Vehicles
- **GET** `/api/vehicles/cached`
  - Keshda saqlanayotgan transportlar
  - Response: Cached vehicles list

### WebSocket
- **Namespace**: `/tracking`
- **Events**:
  - `checkStatus` - Server holati
  - `statusResponse` - Server javob:
    ```json
    {
      "cache": {
        "vehicleCount": number,
        "isFresh": boolean
      },
      "connectedClients": number,
      "server": {
        "uptime": number,
        "memory": object,
        "timestamp": string
      }
    }
    ```

---

## 🚛 Techniques (Texnikalar)

### Realtime Techniques
- **GET** `/techniques/realtime`
  - Query params: `lang`
  - Barcha texnikalar real-time bilan
  - Til qo'llab-quvvatlaydi
  - Response: Techniques with real-time data

### Marker List
- **GET** `/techniques/marker`
  - Query params: `lang`
  - Texnikalar markers uchun
  - Response: Techniques list

### Vehicle History
- **GET** `/techniques/history/:vehicleId`
  - Query params: `from`, `to` (timestamps)
  - Texnika tarixi
  - Response: Historical data

---

## 🚗 Drivers (Haydovchilar)

### Driver Stats
- **GET** `/drivers/stats`
  - Haydovchilar statistikasi
  - Response:
    ```json
    {
      "total": number,
      "active": number,
      "inactive": number,
      "suspended": number,
      "expiredLicenses": number
    }
    ```

### Available Drivers
- **GET** `/drivers/available`
  - Mavjud haydovchilar
  - Response: Available drivers list

### Expiring Licenses
- **GET** `/drivers/expiring-licenses`
  - Query params: `days` (default: 30)
  - Guvohnomasi tugaydigan haydovchilar
  - Response: Drivers with expiring licenses

### All Drivers
- **GET** `/drivers`
  - Query params: `page`, `limit`, `search`, `status`
  - Response: Paginated drivers list

---

## 💰 Finance (Moliya)

### Dashboard
- **GET** `/finance/dashboard`
  - Moliya dashboard
  - Response:
    ```json
    {
      "metalPrices": [...],
      "statistics": {
        "totalPrices": number,
        "totalSources": number,
        "recentChanges": number,
        "topChangedMetals": [...]
      }
    }
    ```

### Statistics
- **GET** `/finance/statistics`
  - Metal narxlari statistikasi
  - Response:
    - totalPrices
    - totalSources
    - recentChanges (oxirgi 24 soat)
    - topChangedMetals (top 5)

### Metal Prices
- **GET** `/finance/metal-prices`
  - Barcha metal narxlari
  - Response: Metal prices list

### Price Logs
- **GET** `/finance/price-logs`
  - Query params: `metalPriceId`, `sourceId`
  - Narx o'zgarishlar tarixi
  - Response: Price change logs

### Elements
- **GET** `/finance/elements`
  - Query params: `lang`
  - Elementlar ro'yxati
  - Til qo'llab-quvvatlaydi

---

## 👥 Employees (Xodimlar)

### Employee Dashboard
- **GET** `/employers/dashboard`
  - VPN employee dashboard
  - Response: VPN dashboard ma'lumotlari

### EARS Dashboard
- **GET** `/employers/EARSDashboard`
  - EARS tizimi dashboard
  - Response: EARS ma'lumotlari

### Organization Statistics
- **GET** `/employers/tashkilot-statistika`
  - Tashkilot statistikasi
  - Response: Organization stats

### Date HB
- **GET** `/employers/datehb`
  - VPN datehb ma'lumotlari

### Citynet Today TMK
- **GET** `/employers/citynet/today-tmk`
  - Query params: `status`, `object_id`
  - Citynet bugungi ma'lumotlar

---

## 📝 Applications (Arizalar)

### All Applications
- **GET** `/applications`
  - Query params: `lang`
  - Barcha arizalar
  - Til qo'llab-quvvatlaydi
  - Response: Applications list

### My Applications
- **GET** `/applications/my`
  - Auth: Required
  - Role: partner
  - Partnerning arizalari

### Admin Applications
- **GET** `/applications/admin/all`
  - Auth: Required
  - Role: admin, editor
  - Admin uchun barcha arizalar

### Application Statistics (by status)
- Status counts API orqali olinadi:
  - DRAFT
  - PENDING_REVIEW
  - UNDER_REVIEW
  - APPROVED
  - REJECTED
  - REVISION_REQUESTED

---

## 🤝 Partners (Hamkorlar)

### All Partners
- **GET** `/partners`
  - Query params: `lang`
  - Barcha hamkorlar
  - Til qo'llab-quvvatlaydi

### Active Partners
- **GET** `/partners/active`
  - Query params: `lang`
  - Faol hamkorlar

### Pending Partners
- **GET** `/partners/pending`
  - Query params: `lang`
  - Kutilayotgan hamkorlar

---

## 🔌 HET Integration

### Import Stats
- **GET** `/het-integration/import-stats`
  - HET dan import statistikasi
  - Response:
    ```json
    {
      "totalReadings": number,
      "latestImport": Date,
      "oldestReading": Date,
      "newestReading": Date,
      "meterTypes": [
        { "type": string, "count": number }
      ]
    }
    ```

### Reading Histories
- **GET** `/het-integration/reading-histories`
  - Query params: `page`, `limit`
  - HET o'qishlar tarixi
  - Response: Paginated readings

---

## 📷 Cameras (Kameralar)

### All Cameras
- **GET** `/cameras/all`
  - Query params: `lang`
  - Barcha kameralar
  - Til qo'llab-quvvatlaydi
  - Response: Cameras list

---

## 🔐 Authentication

### Login Status
- **POST** `/login`
  - Login endpoint
  - Response: JWT token

---

## 📋 Umumiy Ma'lumotlar

### Multi-language Support
Quyidagi modullar tilni qo'llab-quvvatlaydi (`?lang=uz|ru|en`):
- ✅ Factory
- ✅ Energy
- ✅ Techniques
- ✅ Cameras
- ✅ Applications
- ✅ Partners
- ✅ Finance Elements

### Pagination
Ko'pchilik ro'yxat API lari pagination ni qo'llab-quvvatlaydi:
- `page` - Sahifa raqami (default: 1)
- `limit` - Sahifadagi elementlar soni (default: 10)

### Response Format
Ko'pchilik endpointlar quyidagi formatda javob qaytaradi:
```json
{
  "success": true,
  "data": { ... },
  "message": "..."
}
```

---

## 🎯 Dashboard Uchun Tavsiya Etiladigan Endpointlar

### Main Overview Dashboard:
1. **GET** `/api/vehicles/stats` - Transport holati
2. **GET** `/finance/statistics` - Moliya ko'rsatkichlari
3. **GET** `/drivers/stats` - Haydovchilar statistikasi
4. **GET** `/energy/analysis/today-consumption` - Bugungi energiya sarfi
5. **GET** `/fusion-solar/station-kpi` - Quyosh energiyasi
6. **GET** `/het-integration/import-stats` - HET import holati
7. **GET** `/factory` - Zavodlar holati (counts)

### Energy Dashboard:
1. **GET** `/energy/analysis/factories-overview` - Zavodlar overview
2. **GET** `/energy/analysis/top-consumers` - Top sarflovchilar
3. **GET** `/energy/analysis/today-consumption` - Bugungi sarflar
4. **GET** `/fusion-solar/station-kpi` - Quyosh stansiyalari

### Transport Dashboard:
1. **GET** `/api/vehicles/stats` - Transport statistika
2. **GET** `/techniques/realtime` - Real-time texnikalar
3. **GET** `/drivers/stats` - Haydovchilar holati
4. **GET** `/drivers/expiring-licenses` - Guvohnoma muddati

### Finance Dashboard:
1. **GET** `/finance/dashboard` - Umumiy moliya
2. **GET** `/finance/statistics` - Metal narxlari statistikasi
3. **GET** `/finance/metal-prices` - Barcha narxlar

### Factory Dashboard:
1. **GET** `/factory` - Zavodlar ro'yxati + counts
2. **GET** `/factory/marker` - Zavodlar map uchun
3. **GET** `/energy/analysis/factory/:id/comparison` - Zavod taqqoslash

---

## 🔄 Real-time Data Sources

### WebSocket:
- `/tracking` namespace - Transport real-time tracking

### Polling Endpoints (cache bilan):
- `/api/vehicles/cached` - Transport cache (har 30 sekund yangilanadi)
- `/techniques/realtime` - Texnikalar real-time
- `/fusion-solar/station-kpi` - FusionSolar real-time KPI
- `/fusion-solar/device-kpi` - Qurilmalar real-time

---

## 📊 Data Aggregation

Dashboard uchun bitta endpoint yaratish mumkin:

```typescript
// Yangi dashboard controller
@Get('api/dashboard/overview')
async getDashboardOverview() {
  const [
    vehicleStats,
    driverStats,
    financeStats,
    energyToday,
    fusionSolar,
    factoryStats
  ] = await Promise.all([
    this.trackingService.getVehicleStats(),
    this.driverService.getDriverStats(),
    this.financeService.getStatistics(),
    this.energyService.getTodayConsumption(),
    this.fusionSolarService.getStationKpi(),
    this.factoryService.getCounts()
  ]);

  return {
    transport: vehicleStats,
    drivers: driverStats,
    finance: financeStats,
    energy: energyToday,
    solar: fusionSolar,
    factories: factoryStats,
    timestamp: new Date()
  };
}
```

Bu barcha asosiy ko'rsatkichlarni bitta so'rovda olish imkonini beradi.
