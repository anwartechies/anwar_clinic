"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { PageHeader } from "../Layout/PageHeader";
import {
  TbCurrencyRupee,
  TbStethoscope,
  TbClock,
  TbCalendarEvent,
  TbChartPie,
  TbChartBar,
  TbTrendingUp,
  TbUserCheck,
  TbActivity,
  TbFlame,
  TbCircleCheck,
  TbAlertCircle,
  TbReceipt2,
  TbDiscount,
  TbBuildingBank,
  TbSparkles,
} from "react-icons/tb";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DailyCashData {
  startDate: string;
  endDate: string;
  invoiceCount: number;
  totalCollected: number;
  totalDiscount: number;
  totalTax: number;
  totalNet: number;
  totalBalanceDue: number;
  methodBreakdown: Record<string, { count: number; total: number }>;
  cashierBreakdown: { name: string; count: number; collected: number }[];
  invoices?: any[];
}

interface DoctorProductivityData {
  startDate: string;
  endDate: string;
  doctors: {
    doctorId: string;
    doctorName: string;
    department: string;
    consultationsCount: number;
    finalizedCount: number;
    totalFees: number;
    proceduresCount: number;
  }[];
}

interface WaitTimesData {
  startDate: string;
  endDate: string;
  totalPatients: number;
  avgWaitMinutes: number;
  avgConsultMinutes: number;
}

const METHOD_COLORS: Record<string, string> = {
  cash: "#0d9488", // teal-600
  upi: "#0284c7", // sky-600
  card: "#8b5cf6", // violet-500
  net_banking: "#f59e0b", // amber-500
  split: "#ec4899", // pink-500
  other: "#64748b", // slate-500
};

const DOCTOR_BAR_COLORS = ["#0d9488", "#0284c7", "#8b5cf6", "#f59e0b", "#10b981", "#6366f1"];

// Custom sleek tooltip for charts
const ChartTooltip = ({ active, payload, label, prefix = "", suffix = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 text-xs">
        <p className="font-bold text-slate-800 dark:text-slate-200">{label}</p>
        <div className="mt-1.5 space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 font-medium">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                {entry.name}:
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {prefix}
                {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
                {suffix}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"cash" | "doctors" | "waitTimes">("cash");

  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [cashData, setCashData] = useState<DailyCashData | null>(null);
  const [doctorData, setDoctorData] = useState<DoctorProductivityData | null>(null);
  const [waitTimesData, setWaitTimesData] = useState<WaitTimesData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const range = `startDate=${startDate}&endDate=${endDate}`;
    try {
      if (activeTab === "cash") {
        const data = await apiFetch<DailyCashData>(`/reports/daily-cash?${range}`);
        setCashData(data);
      } else if (activeTab === "doctors") {
        const data = await apiFetch<DoctorProductivityData>(`/reports/doctor-productivity?${range}`);
        setDoctorData(data);
      } else {
        const data = await apiFetch<WaitTimesData>(`/reports/opd-wait-times?${range}`);
        setWaitTimesData(data);
      }
    } catch (err: any) {
      console.error("Report fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, startDate, endDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Prepared data for Payment Methods Donut Chart
  const paymentMethodChartData = useMemo(() => {
    if (!cashData?.methodBreakdown) return [];
    return Object.entries(cashData.methodBreakdown)
      .map(([method, val]) => ({
        name: method.toUpperCase(),
        methodKey: method,
        value: val.total,
        count: val.count,
        color: METHOD_COLORS[method] || METHOD_COLORS.other,
      }))
      .filter((item) => item.value > 0 || item.count > 0);
  }, [cashData]);

  // Prepared data for Cashier Collections Bar Chart
  const cashierChartData = useMemo(() => {
    if (!cashData?.cashierBreakdown) return [];
    return cashData.cashierBreakdown.map((c) => ({
      name: c.name,
      collected: c.collected,
      count: c.count,
    }));
  }, [cashData]);

  // Prepared data for Doctor Productivity Charts
  const doctorRevenueChartData = useMemo(() => {
    if (!doctorData?.doctors) return [];
    return doctorData.doctors.map((d) => ({
      name: d.doctorName.replace("Dr. ", "").replace("Dr ", ""),
      fees: d.totalFees,
      consultations: d.consultationsCount,
      finalized: d.finalizedCount,
      procedures: d.proceduresCount,
      department: d.department,
    }));
  }, [doctorData]);

  return (
    <>
      <PageHeader
        title="Clinical & Operational Analytics"
        description="Interactive visual reports for cash collections, medical productivity, and patient queue flow."
      />

      {/* Date Filter Presets */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <TbCalendarEvent className="h-4 w-4 text-teal-600" />
            <span>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <button
            onClick={() => {
              setStartDate(today);
              setEndDate(today);
            }}
            className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
              startDate === today && endDate === today
                ? "bg-teal-600 text-white"
                : "bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 7);
              setStartDate(d.toISOString().split("T")[0]);
              setEndDate(today);
            }}
            className="rounded-xl px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(1);
              setStartDate(d.toISOString().split("T")[0]);
              setEndDate(today);
            }}
            className="rounded-xl px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            This Month
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <TbActivity className="h-4 w-4 text-emerald-500 animate-pulse" />
          <span>Live Clinic Telemetry</span>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="mb-6 flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("cash")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "cash"
              ? "border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <TbCurrencyRupee className="h-4 w-4" />
          Daily Cash & Collections
        </button>
        <button
          onClick={() => setActiveTab("doctors")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "doctors"
              ? "border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <TbStethoscope className="h-4 w-4" />
          Doctor Productivity
        </button>
        <button
          onClick={() => setActiveTab("waitTimes")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "waitTimes"
              ? "border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <TbClock className="h-4 w-4" />
          OPD Flow & Wait Times
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: DAILY CASH REPORT WITH VISUAL CHARTS                    */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "cash" && cashData && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-teal-200 bg-linear-to-br from-teal-50/50 to-white p-5 shadow-xs dark:border-teal-900/40 dark:from-teal-950/20 dark:to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  Total Collected
                </span>
                <span className="rounded-xl bg-teal-100 p-2 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300">
                  <TbCurrencyRupee className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-2 text-3xl font-black text-teal-800 dark:text-teal-200">
                ₹{cashData.totalCollected.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {cashData.invoiceCount} invoices settled across counters
              </p>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-linear-to-br from-rose-50/50 to-white p-5 shadow-xs dark:border-rose-900/40 dark:from-rose-950/20 dark:to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                  Discounts Given
                </span>
                <span className="rounded-xl bg-rose-100 p-2 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                  <TbDiscount className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-2 text-3xl font-black text-rose-600">
                ₹{cashData.totalDiscount.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Discount savings granted to patients
              </p>
            </div>

            <div className="rounded-2xl border border-sky-200 bg-linear-to-br from-sky-50/50 to-white p-5 shadow-xs dark:border-sky-900/40 dark:from-sky-950/20 dark:to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                  GST / Taxes
                </span>
                <span className="rounded-xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">
                  <TbBuildingBank className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-2 text-3xl font-black text-sky-800 dark:text-sky-200">
                ₹{cashData.totalTax.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Collected statutory taxes & levies
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50/50 to-white p-5 shadow-xs dark:border-amber-900/40 dark:from-amber-950/20 dark:to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Outstanding Due
                </span>
                <span className="rounded-xl bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                  <TbAlertCircle className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-2 text-3xl font-black text-amber-600">
                ₹{cashData.totalBalanceDue.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Remaining balances pending collection
              </p>
            </div>
          </div>

          {/* VISUAL CHARTS SECTION */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Chart 1: Payment Method Breakdown (Donut Chart) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-teal-50 p-2 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                    <TbChartPie className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Payment Channels Distribution
                    </h3>
                    <p className="text-xs text-slate-500">
                      Collections split by UPI, Cash, Cards, and Net Banking
                    </p>
                  </div>
                </div>
              </div>

              {paymentMethodChartData.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  No payment transactions recorded for this period.
                </div>
              ) : (
                <div className="mt-4 flex flex-col md:flex-row items-center gap-6">
                  {/* Donut Chart */}
                  <div className="h-64 w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentMethodChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                        >
                          {paymentMethodChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip prefix="₹" />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Payment Breakdown Legend & Proportions */}
                  <div className="w-full md:w-1/2 space-y-2.5">
                    {paymentMethodChartData.map((m) => {
                      const pct = cashData.totalCollected > 0
                        ? Math.round((m.value / cashData.totalCollected) * 100)
                        : 0;
                      return (
                        <div
                          key={m.name}
                          className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40"
                        >
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: m.color }}
                              />
                              {m.name} ({m.count} bills)
                            </span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              ₹{m.value.toLocaleString()} ({pct}%)
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: m.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Chart 2: Cashier Shift Collections (Bar Chart) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-sky-50 p-2 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                    <TbChartBar className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Cashier Desk Collections
                    </h3>
                    <p className="text-xs text-slate-500">
                      Revenue settled by front-desk and pharmacy staff
                    </p>
                  </div>
                </div>
              </div>

              {cashierChartData.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  No cashier transactions recorded for this period.
                </div>
              ) : (
                <div className="mt-4 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashierChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<ChartTooltip prefix="₹" />} />
                      <Bar
                        dataKey="collected"
                        name="Amount Collected"
                        fill="#0d9488"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Data Tables */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Payment Method Breakdown Table */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Payment Channel Summary
              </h3>
              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="pb-2">Method</th>
                    <th className="pb-2 text-center">Transactions</th>
                    <th className="pb-2 text-right">Settled Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.entries(cashData.methodBreakdown).map(([m, data]) => (
                    <tr key={m} className="py-2">
                      <td className="py-2.5 font-bold uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: METHOD_COLORS[m] || METHOD_COLORS.other }}
                        />
                        {m}
                      </td>
                      <td className="py-2.5 text-center text-slate-500 font-medium">{data.count}</td>
                      <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-slate-100 font-mono">
                        ₹{data.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cashier Reconciliation Table */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Cashier Shift Logs
              </h3>
              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="pb-2">Cashier Staff</th>
                    <th className="pb-2 text-center">Invoices Handled</th>
                    <th className="pb-2 text-right">Total Shift Collection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cashData.cashierBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400">
                        No cashier records found
                      </td>
                    </tr>
                  ) : (
                    cashData.cashierBreakdown.map((c, i) => (
                      <tr key={i} className="py-2">
                        <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">{c.name}</td>
                        <td className="py-2.5 text-center text-slate-500 font-medium">{c.count}</td>
                        <td className="py-2.5 text-right font-semibold text-teal-700 dark:text-teal-400 font-mono">
                          ₹{c.collected.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: DOCTOR PRODUCTIVITY WITH COMPARATIVE CHARTS            */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "doctors" && doctorData && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-teal-200 bg-linear-to-br from-teal-50/50 to-white p-5 shadow-xs dark:border-teal-900/40 dark:from-teal-950/20 dark:to-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                Total Consultations
              </span>
              <p className="mt-2 text-3xl font-black text-teal-900 dark:text-teal-100">
                {doctorData.doctors.reduce((sum, d) => sum + d.consultationsCount, 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Total doctor patient chamber visits</p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-linear-to-br from-emerald-50/50 to-white p-5 shadow-xs dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Finalized Encounters
              </span>
              <p className="mt-2 text-3xl font-black text-emerald-700 dark:text-emerald-300">
                {doctorData.doctors.reduce((sum, d) => sum + d.finalizedCount, 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Prescriptions signed & clinical notes saved</p>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-linear-to-br from-purple-50/50 to-white p-5 shadow-xs dark:border-purple-900/40 dark:from-purple-950/20 dark:to-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Procedures Advised
              </span>
              <p className="mt-2 text-3xl font-black text-purple-700 dark:text-purple-300">
                {doctorData.doctors.reduce((sum, d) => sum + d.proceduresCount, 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">PRP, hair transplants, aesthetic treatments</p>
            </div>

            <div className="rounded-2xl border border-sky-200 bg-linear-to-br from-sky-50/50 to-white p-5 shadow-xs dark:border-sky-900/40 dark:from-sky-950/20 dark:to-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                Total Fees Generated
              </span>
              <p className="mt-2 text-3xl font-black text-sky-900 dark:text-sky-100">
                ₹{doctorData.doctors.reduce((sum, d) => sum + d.totalFees, 0).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">Direct doctor consultation billing</p>
            </div>
          </div>

          {/* VISUAL CHARTS SECTION */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Chart 1: Revenue Generated Per Doctor */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-teal-50 p-2 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                    <TbTrendingUp className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Consultation Revenue by Doctor
                    </h3>
                    <p className="text-xs text-slate-500">
                      Total fee revenue generated across consulting doctors
                    </p>
                  </div>
                </div>
              </div>

              {doctorRevenueChartData.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  No doctor consultations recorded for this date range.
                </div>
              ) : (
                <div className="mt-4 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={doctorRevenueChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickFormatter={(v) => `₹${v}`}
                      />
                      <Tooltip content={<ChartTooltip prefix="₹" />} />
                      <Bar
                        dataKey="fees"
                        name="Consultation Fees"
                        fill="#0d9488"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart 2: Consultations vs Procedures Advised */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                    <TbStethoscope className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Workload & Procedure Conversion
                    </h3>
                    <p className="text-xs text-slate-500">
                      Consultations started vs. Procedures recommended
                    </p>
                  </div>
                </div>
              </div>

              {doctorRevenueChartData.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  No doctor consultations recorded for this date range.
                </div>
              ) : (
                <div className="mt-4 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={doctorRevenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                      <Bar
                        dataKey="consultations"
                        name="Consultations"
                        fill="#0284c7"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="finalized"
                        name="Finalized Encounters"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="procedures"
                        name="Procedures Advised"
                        fill="#8b5cf6"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Productivity Table */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Doctor Encounters Performance Roster
              </h3>
            </div>
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Doctor Name</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5 text-center">Consultations</th>
                  <th className="px-5 py-3.5 text-center">Finalized Encounters</th>
                  <th className="px-5 py-3.5 text-center">Procedures Advised</th>
                  <th className="px-5 py-3.5 text-right">Total Fees Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {doctorData.doctors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No doctor consultations recorded for this date range.
                    </td>
                  </tr>
                ) : (
                  doctorData.doctors.map((d) => (
                    <tr key={d.doctorId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-[11px]">
                          {d.doctorName.charAt(0)}
                        </span>
                        {d.doctorName}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{d.department}</td>
                      <td className="px-5 py-3.5 text-center font-semibold text-slate-800 dark:text-slate-200">
                        {d.consultationsCount}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {d.finalizedCount}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="rounded-full bg-purple-50 px-2 py-0.5 font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          {d.proceduresCount}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        ₹{d.totalFees.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: OPD FLOW & WAIT TIMES WITH PERFORMANCE GAUGES          */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "waitTimes" && waitTimesData && (
        <div className="space-y-6">
          {/* Key Throughput Metrics */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Enqueued Patients
              </span>
              <p className="mt-2 text-4xl font-black text-slate-900 dark:text-slate-100">
                {waitTimesData.totalPatients}
              </p>
              <p className="text-xs text-slate-500 mt-1">Tokens issued in this period</p>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-linear-to-br from-amber-50/50 to-white p-6 shadow-sm dark:border-amber-900/40 dark:from-amber-950/20 dark:to-slate-900 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Avg Waiting Time in Lobby
              </span>
              <p className="mt-2 text-4xl font-black text-amber-900 dark:text-amber-100">
                {waitTimesData.avgWaitMinutes} <span className="text-xl font-bold">mins</span>
              </p>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                <TbClock className="h-3.5 w-3.5" />
                Target: &lt; 15 mins
              </div>
            </div>

            <div className="rounded-3xl border border-sky-200 bg-linear-to-br from-sky-50/50 to-white p-6 shadow-sm dark:border-sky-900/40 dark:from-sky-950/20 dark:to-slate-900 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                Avg Consultation Duration
              </span>
              <p className="mt-2 text-4xl font-black text-sky-900 dark:text-sky-100">
                {waitTimesData.avgConsultMinutes} <span className="text-xl font-bold">mins</span>
              </p>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800 dark:bg-sky-900/60 dark:text-sky-200">
                <TbStethoscope className="h-3.5 w-3.5" />
                Standard: 10 - 25 mins
              </div>
            </div>
          </div>

          {/* Visual OPD Flow Pipeline / Patient Journey Stages */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
              Patient Clinic Journey & Flow Benchmarks
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Stages from front-desk check-in through consultation to pharmacy dispensing
            </p>

            <div className="grid gap-4 md:grid-cols-4">
              {/* Stage 1 */}
              <div className="rounded-2xl border border-teal-100 bg-teal-50/40 p-4 dark:border-teal-900/40 dark:bg-teal-950/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  Step 1: Check-in & Vitals
                </span>
                <p className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                  Front-Desk Triage
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  MRN check, vitals recording (BP, BMI), token issuance.
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                  <TbCircleCheck className="h-3.5 w-3.5" /> ~2-3 mins avg
                </div>
              </div>

              {/* Stage 2 */}
              <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Step 2: Lobby Wait
                </span>
                <p className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                  Waiting Chamber
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Patient seated until called by assigned consulting doctor.
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  <TbClock className="h-3.5 w-3.5" /> {waitTimesData.avgWaitMinutes} mins current avg
                </div>
              </div>

              {/* Stage 3 */}
              <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                  Step 3: Consultation
                </span>
                <p className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                  Doctor Chamber
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Examination, diagnosis, prescription & procedure advice.
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-sky-700 dark:text-sky-400">
                  <TbStethoscope className="h-3.5 w-3.5" /> {waitTimesData.avgConsultMinutes} mins current avg
                </div>
              </div>

              {/* Stage 4 */}
              <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4 dark:border-purple-900/40 dark:bg-purple-950/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                  Step 4: Dispensing
                </span>
                <p className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                  Pharmacy Checkout
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Medicine dispensing, batch check, billing & discharge.
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-400">
                  <TbReceipt2 className="h-3.5 w-3.5" /> ~3-5 mins avg
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
