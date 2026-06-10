import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { RefreshCw, CheckCircle, AlertCircle, AlertTriangle, Clock } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LastRun {
  status: "success" | "partial" | "error";
  at: string;
  records_success?: number;
  records_failed?: number;
  duration_ms?: number;
}

interface TodayStats {
  records_success: number;
  records_failed: number;
  records_total: number;
  last_error?: string;
}

interface IntegrationOverview {
  name: string;
  last_run: LastRun | null;
  today: TodayStats | null;
}

interface DailyEntry {
  date: string;
  records_success: number;
  records_failed: number;
  records_total: number;
}

interface DailyData {
  [key: string]: DailyEntry[];
}

interface LogEntry {
  id?: number;
  integration: string;
  status: "success" | "partial" | "error";
  at: string;
  records_total?: number;
  records_success?: number;
  records_failed?: number;
  duration_ms?: number;
  error_message?: string;
}

interface LogsResponse {
  data: {
    items: LogEntry[];
    total: number;
    page: number;
    limit: number;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INTEGRATION_NAMES: Record<string, string> = {
  camera: "Kamera",
  wialon: "Wialon",
  fusion_solar: "Fusion Solar",
  het: "HET",
  zup: "ZUP",
};

const ALL_INTEGRATIONS = Object.keys(INTEGRATION_NAMES);

const STATUS_CONFIG = {
  success: {
    label: "Muvaffaqiyatli",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    iconColor: "text-green-500",
    chartColor: "#22c55e",
  },
  partial: {
    label: "Qisman",
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
    chartColor: "#f59e0b",
  },
  error: {
    label: "Xato",
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
    iconColor: "text-red-500",
    chartColor: "#ef4444",
  },
};

const REFRESH_INTERVAL = 30_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("uz-UZ", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDuration(ms?: number) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "hozirgina";
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} soat oldin`;
  return `${Math.floor(hrs / 24)} kun oldin`;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "success" | "partial" | "error" }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ─── Overview Card ────────────────────────────────────────────────────────────

function OverviewCard({ item }: { item: IntegrationOverview }) {
  const name = INTEGRATION_NAMES[item.name] ?? item.name;
  const { today, last_run } = item;
  const total = today?.records_total ?? 0;
  const errorRate = total > 0 ? Math.round(((today?.records_failed ?? 0) / total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-800 text-sm">{name}</span>
        {last_run ? <StatusBadge status={last_run.status} /> : (
          <span className="text-xs text-gray-400">Hali ishlamagan</span>
        )}
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Clock className="w-3 h-3 flex-shrink-0" />
        {last_run ? (
          <>
            <span>{timeAgo(last_run.at)}</span>
            <span className="text-gray-300 mx-1">·</span>
            <span>{formatTime(last_run.at)}</span>
            {last_run.duration_ms && (
              <span className="text-gray-300 ml-1">({formatDuration(last_run.duration_ms)})</span>
            )}
          </>
        ) : (
          <span>Ma'lumot yo'q</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-50">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800">{total.toLocaleString()}</div>
          <div className="text-[10px] text-gray-400">Jami bugun</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{(today?.records_success ?? 0).toLocaleString()}</div>
          <div className="text-[10px] text-gray-400">Muvaffaqiyat</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${(today?.records_failed ?? 0) > 0 ? "text-red-500" : "text-gray-400"}`}>
            {today?.records_failed ?? 0}
          </div>
          <div className="text-[10px] text-gray-400">Xato ({errorRate}%)</div>
        </div>
      </div>

      {today?.last_error && (
        <div className="text-[10px] text-red-500 bg-red-50 rounded px-2 py-1 truncate" title={today.last_error}>
          ⚠ {today.last_error}
        </div>
      )}
    </div>
  );
}

// ─── Daily Chart ──────────────────────────────────────────────────────────────

function DailyChart({ data }: { data: DailyData }) {
  const [selected, setSelected] = useState(ALL_INTEGRATIONS[0]);

  const chartData = (data[selected] ?? []).map((d) => ({
    date: d.date.slice(5),
    Muvaffaqiyatli: d.records_success,
    Xato: d.records_failed,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 text-sm">Kunlik statistika (so'nggi 30 kun)</h3>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-400 bg-white"
        >
          {ALL_INTEGRATIONS.map((k) => (
            <option key={k} value={k}>{INTEGRATION_NAMES[k]}</option>
          ))}
        </select>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Ma'lumot yo'q
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barSize={12} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Muvaffaqiyatli" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Xato" stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ─── Log Table ────────────────────────────────────────────────────────────────

interface LogTableProps {
  logs: LogEntry[];
  total: number;
  page: number;
  limit: number;
  filterIntegration: string;
  filterStatus: string;
  onFilterIntegration: (v: string) => void;
  onFilterStatus: (v: string) => void;
  onPage: (p: number) => void;
}

function LogTable({
  logs, total, page, limit,
  filterIntegration, filterStatus,
  onFilterIntegration, onFilterStatus, onPage,
}: LogTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm self-center mr-2">Log tarixi</h3>
        <select
          value={filterIntegration}
          onChange={(e) => onFilterIntegration(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-400 bg-white"
        >
          <option value="">Barcha integratsiyalar</option>
          {ALL_INTEGRATIONS.map((k) => (
            <option key={k} value={k}>{INTEGRATION_NAMES[k]}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => onFilterStatus(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-400 bg-white"
        >
          <option value="">Barcha holatlar</option>
          <option value="success">Muvaffaqiyatli</option>
          <option value="partial">Qisman</option>
          <option value="error">Xato</option>
        </select>
        <span className="text-xs text-gray-400 self-center ml-auto">
          Jami: {total}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 bg-gray-50/50">
              <th className="py-2 px-3 text-left font-medium">Vaqt</th>
              <th className="py-2 px-3 text-left font-medium">Integratsiya</th>
              <th className="py-2 px-3 text-left font-medium">Holat</th>
              <th className="py-2 px-3 text-right font-medium">Jami</th>
              <th className="py-2 px-3 text-right font-medium">Muvaffaqiyat</th>
              <th className="py-2 px-3 text-right font-medium">Xato</th>
              <th className="py-2 px-3 text-right font-medium">Davomiylik</th>
              <th className="py-2 px-3 text-left font-medium">Xato xabari</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  Ma'lumot topilmadi
                </td>
              </tr>
            )}
            {logs.map((log, i) => (
              <tr key={log.id ?? i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-2 px-3 whitespace-nowrap text-gray-600">
                  {formatTime(log.at)}
                </td>
                <td className="py-2 px-3 font-medium text-gray-800">
                  {INTEGRATION_NAMES[log.integration] ?? log.integration}
                </td>
                <td className="py-2 px-3">
                  <StatusBadge status={log.status} />
                </td>
                <td className="py-2 px-3 text-right text-gray-700">
                  {log.records_total ?? "—"}
                </td>
                <td className="py-2 px-3 text-right text-green-600">
                  {log.records_success ?? "—"}
                </td>
                <td className="py-2 px-3 text-right text-red-500">
                  {log.records_failed ?? "—"}
                </td>
                <td className="py-2 px-3 text-right text-gray-500">
                  {formatDuration(log.duration_ms)}
                </td>
                <td className="py-2 px-3 text-gray-500 max-w-xs truncate">
                  {log.error_message || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {total}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page <= 1}
              onClick={() => onPage(page - 1)}
              className="px-2.5 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button
                  key={p}
                  onClick={() => onPage(p)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    p === page
                      ? "bg-cyan-500 text-white border-cyan-500"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              disabled={page >= totalPages}
              onClick={() => onPage(page + 1)}
              className="px-2.5 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function IntegrationMonitor() {
  const [overview, setOverview] = useState<IntegrationOverview[]>([]);
  const [daily, setDaily] = useState<DailyData>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const [filterIntegration, setFilterIntegration] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const LIMIT = 50;

  const fetchOverview = useCallback(async () => {
    const res = await axios.get("/integration-monitor/overview");
    setOverview(res.data.data ?? []);
  }, []);

  const fetchDaily = useCallback(async () => {
    const res = await axios.get("/integration-monitor/daily?days=30");
    setDaily(res.data.data ?? {});
  }, []);

  const fetchLogs = useCallback(async () => {
    const params: Record<string, string | number> = { page: logPage, limit: LIMIT };
    if (filterIntegration) params.integration = filterIntegration;
    if (filterStatus) params.status = filterStatus;
    const res = await axios.get<LogsResponse>("/integration-monitor/logs", { params });
    const d = res.data.data;
    setLogs(d.items ?? []);
    setLogTotal(d.total ?? 0);
  }, [logPage, filterIntegration, filterStatus]);

  const fetchAll = useCallback(async () => {
    try {
      await Promise.all([fetchOverview(), fetchDaily(), fetchLogs()]);
      setApiError(null);
      setLastUpdated(new Date());
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 404) {
        setApiError("Backend API endpoint'lari hali tayyor emas (404). Backend dasturchi quyidagi route'larni yaratishi kerak: /integration-monitor/overview, /integration-monitor/daily, /integration-monitor/logs");
      } else {
        setApiError(`Server xatosi: ${e?.message ?? "noma'lum"}`);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchOverview, fetchDaily, fetchLogs]);

  // Initial load + auto-refresh
  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchAll]);

  // Re-fetch logs when filters/page change
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterIntegration = (v: string) => {
    setFilterIntegration(v);
    setLogPage(1);
  };

  const handleFilterStatus = (v: string) => {
    setFilterStatus(v);
    setLogPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Yuklanmoqda…</span>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="md:max-w-auto min-h-screen min-w-0 max-w-full flex-1 rounded-[30px] bg-slate-100 px-2 md:px-4 pb-6 max-sm:pt-5 max-md:pt-[50px]">
        <div className="mt-3 md:mt-6">
          <h2 className="text-base md:text-lg font-medium text-primary mb-4">Integratsiya monitoringi</h2>
          <div className="bg-white rounded-xl border border-red-100 p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-red-600 font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              API ulanishda xatolik
            </div>
            <p className="text-sm text-gray-600">{apiError}</p>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 font-mono space-y-1">
              <div>GET /api/integration-monitor/overview</div>
              <div>GET /api/integration-monitor/daily?days=30</div>
              <div>GET /api/integration-monitor/logs?page=1&limit=50</div>
            </div>
            <button
              onClick={fetchAll}
              className="self-start flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Qayta urinish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="md:max-w-auto min-h-screen min-w-0 max-w-full flex-1 rounded-[30px] bg-slate-100 px-2 md:px-4 pb-6 max-sm:pt-5 max-md:pt-[50px]">
      <div className="mt-3 md:mt-6 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-medium text-primary">
            Integratsiya monitoringi
          </h2>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-gray-400 hidden sm:block">
                Yangilandi: {lastUpdated.toLocaleTimeString("uz-UZ")}
              </span>
            )}
            <button
              onClick={fetchAll}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Yangilash
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {overview.map((item) => (
            <OverviewCard key={item.name} item={item} />
          ))}
          {overview.length === 0 && (
            <div className="col-span-full text-center text-gray-400 text-sm py-8">
              Ma'lumot yuklanmadi
            </div>
          )}
        </div>

        {/* Daily Chart */}
        <DailyChart data={daily} />

        {/* Log Table */}
        <LogTable
          logs={logs}
          total={logTotal}
          page={logPage}
          limit={LIMIT}
          filterIntegration={filterIntegration}
          filterStatus={filterStatus}
          onFilterIntegration={handleFilterIntegration}
          onFilterStatus={handleFilterStatus}
          onPage={setLogPage}
        />
      </div>
    </div>
  );
}
