<template>
  <section class="admin-dashboard">
    <header class="heading panel">
      <div>
        <h1>
          <font-awesome-icon :icon="['fas', 'chart-line']" />
          Dashboard operativo
        </h1>
        <p>Metricas reales de ventas e inventario.</p>
      </div>

      <div class="controls">
        <div class="range-pills">
          <button
            v-for="preset in rangePresets"
            :key="preset.value"
            :class="['pill', activeRange === preset.value ? 'active' : '']"
            @click="setRange(preset.value)"
          >
            {{ preset.label }}
          </button>
        </div>
        <button class="ghost" :disabled="loading" @click="fetchDashboardSummary">
          <font-awesome-icon :icon="['fas', 'arrows-rotate']" />
          {{ loading ? "Actualizando..." : "Refrescar" }}
        </button>
      </div>
    </header>

    <p v-if="errorMessage" class="error">
      <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
      {{ errorMessage }}
    </p>

    <div class="kpi-grid" v-if="summary">
      <article class="kpi-card">
        <h2><font-awesome-icon :icon="['fas', 'wallet']" /> Ventas</h2>
        <strong>{{ money(summary.kpis.salesTotal) }}</strong>
        <span class="chip">{{ summary.rangeMeta.label }}</span>
      </article>
      <article class="kpi-card">
        <h2><font-awesome-icon :icon="['fas', 'file-invoice-dollar']" /> Facturas</h2>
        <strong>{{ summary.kpis.invoiceCount }}</strong>
        <span class="chip">Emitidas</span>
      </article>
      <article class="kpi-card">
        <h2><font-awesome-icon :icon="['fas', 'calculator']" /> Ticket promedio</h2>
        <strong>{{ money(summary.kpis.averageTicket) }}</strong>
        <span class="chip">Por factura</span>
      </article>
      <article class="kpi-card">
        <h2><font-awesome-icon :icon="['fas', 'triangle-exclamation']" /> Stock critico</h2>
        <strong>{{ summary.kpis.criticalStockCount }}</strong>
        <span class="chip warn">Atender</span>
      </article>
    </div>

    <section v-if="summary" class="charts-grid">
      <article class="panel chart-card">
        <h3><font-awesome-icon :icon="['fas', 'chart-line']" /> Ventas por dia</h3>
        <Line :data="salesChartData" :options="lineOptions" />
      </article>

      <article class="panel chart-card">
        <h3><font-awesome-icon :icon="['fas', 'chart-pie']" /> Estados de factura</h3>
        <Doughnut :data="statusChartData" :options="doughnutOptions" />
      </article>

      <article class="panel chart-card">
        <h3><font-awesome-icon :icon="['fas', 'boxes-stacked']" /> Movimientos de inventario</h3>
        <Bar :data="movementChartData" :options="barOptions" />
      </article>

      <article class="panel chart-card">
        <h3><font-awesome-icon :icon="['fas', 'ranking-star']" /> Top productos vendidos</h3>
        <Bar :data="topProductsChartData" :options="horizontalBarOptions" />
      </article>
    </section>

    <section v-if="summary" class="panel-grid">
      <article class="panel">
        <h3><font-awesome-icon :icon="['fas', 'triangle-exclamation']" /> Productos con stock critico</h3>
        <ul>
          <li v-for="item in summary.criticalStock" :key="item.id">
            <span>{{ item.name }}</span>
            <small>SKU: {{ item.sku }} | Stock: {{ item.stock }}</small>
          </li>
          <li v-if="summary.criticalStock.length === 0">No hay productos criticos.</li>
        </ul>
      </article>

      <article class="panel">
        <h3><font-awesome-icon :icon="['fas', 'receipt']" /> Facturas recientes</h3>
        <ul>
          <li v-for="item in summary.recentInvoices" :key="item.id">
            <span>{{ item.invoiceNumber }} - {{ money(item.total) }}</span>
            <small>{{ item.customer }} | {{ formatDate(item.issueDate) }}</small>
          </li>
          <li v-if="summary.recentInvoices.length === 0">No hay facturas en el rango.</li>
        </ul>
      </article>
    </section>

    <section v-if="summary" class="panel">
      <h3><font-awesome-icon :icon="['fas', 'clock-rotate-left']" /> Actividad de inventario reciente</h3>
      <ul>
        <li v-for="item in summary.recentMovements" :key="item.id">
          <span>{{ movementTypeLabel(item.type) }} {{ item.quantity }}u - {{ item.productName }}</span>
          <small>{{ item.user }} | {{ formatDate(item.createdAt) }}</small>
        </li>
        <li v-if="summary.recentMovements.length === 0">No hay movimientos recientes en el rango.</li>
      </ul>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { isAxiosError } from "axios";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Bar, Doughnut, Line } from "vue-chartjs";
import { httpClient } from "@/shared/http/client";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement
);

type RangeValue = "today" | "7d" | "30d" | "month";

type DashboardSummary = {
  range: RangeValue;
  rangeMeta: {
    label: string;
    from: string;
    to: string;
    days: number;
  };
  kpis: {
    salesTotal: number;
    invoiceCount: number;
    averageTicket: number;
    criticalStockCount: number;
  };
  salesByDay: Array<{ day: string; total: number }>;
  invoiceStatus: Array<{ status: string; count: number }>;
  inventoryByType: Array<{ type: string; quantity: number }>;
  topProducts: Array<{ productId: number; sku: string; name: string; quantity: number; total: number }>;
  criticalStock: Array<{ id: number; sku: string; name: string; stock: number }>;
  recentInvoices: Array<{ id: number; invoiceNumber: string; issueDate: string; total: number; customer: string }>;
  recentMovements: Array<{
    id: number;
    createdAt: string;
    type: string;
    quantity: number;
    productName: string;
    user: string;
  }>;
};

const rangePresets: Array<{ label: string; value: RangeValue }> = [
  { label: "Hoy", value: "today" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "Este mes", value: "month" },
];

const activeRange = ref<RangeValue>("7d");
const summary = ref<DashboardSummary | null>(null);
const loading = ref(false);
const errorMessage = ref("");
let refreshInterval: ReturnType<typeof setInterval> | null = null;

const money = (value: number) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);

const formatDate = (rawDate: string) =>
  new Intl.DateTimeFormat("es-EC", { dateStyle: "short", timeStyle: "short" }).format(new Date(rawDate));

const movementTypeLabel = (type: string) => {
  if (type === "IN") return "Entrada";
  if (type === "OUT") return "Salida";
  return "Ajuste";
};

const statusLabel = (status: string) => {
  if (status === "DRAFT") return "Borrador";
  if (status === "PAID") return "Pagada";
  if (status === "CANCELLED") return "Anulada";
  return status;
};

const lineOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

const barOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

const horizontalBarOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "y",
  plugins: { legend: { display: false } },
};

const doughnutOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" },
  },
};

const salesChartData = computed(() => ({
  labels: summary.value?.salesByDay.map((item) => item.day) ?? [],
  datasets: [
    {
      label: "Ventas",
      data: summary.value?.salesByDay.map((item) => item.total) ?? [],
      borderColor: "#1d4ed8",
      backgroundColor: "rgba(29, 78, 216, 0.2)",
      tension: 0.25,
      fill: true,
    },
  ],
}));

const statusChartData = computed(() => ({
  labels: summary.value?.invoiceStatus.map((item) => statusLabel(item.status)) ?? [],
  datasets: [
    {
      data: summary.value?.invoiceStatus.map((item) => item.count) ?? [],
      backgroundColor: ["#0284c7", "#16a34a", "#dc2626"],
    },
  ],
}));

const movementChartData = computed(() => ({
  labels: summary.value?.inventoryByType.map((item) => movementTypeLabel(item.type)) ?? [],
  datasets: [
    {
      label: "Unidades",
      data: summary.value?.inventoryByType.map((item) => item.quantity) ?? [],
      backgroundColor: ["#16a34a", "#ea580c", "#334155"],
    },
  ],
}));

const topProductsChartData = computed(() => ({
  labels: summary.value?.topProducts.map((item) => item.name) ?? [],
  datasets: [
    {
      label: "Cantidad vendida",
      data: summary.value?.topProducts.map((item) => item.quantity) ?? [],
      backgroundColor: "#1e3a5f",
    },
  ],
}));

const fetchDashboardSummary = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const { data } = await httpClient.get<DashboardSummary>("/dashboard/summary", {
      params: { range: activeRange.value },
    });
    summary.value = data;
  } catch (error) {
    if (isAxiosError(error)) {
      errorMessage.value =
        (error.response?.data as { message?: string } | undefined)?.message || "No se pudo cargar el dashboard.";
    } else {
      errorMessage.value = "No se pudo cargar el dashboard.";
    }
  } finally {
    loading.value = false;
  }
};

const setRange = async (range: RangeValue) => {
  if (activeRange.value === range && summary.value) return;
  activeRange.value = range;
  await fetchDashboardSummary();
};

onMounted(async () => {
  await fetchDashboardSummary();
  refreshInterval = setInterval(() => {
    void fetchDashboardSummary();
  }, 30000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>

<style scoped>
.admin-dashboard {
  display: grid;
  gap: 14px;
  text-align: left;
}

.panel {
  border: 1px solid #dbe2ea;
  border-radius: 12px;
  background: #fff;
  padding: 14px;
}

.heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.heading h1 {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.heading p {
  margin: 6px 0 0;
  color: #64748b;
}

.controls {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.range-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.pill,
.ghost {
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  background: #fff;
  padding: 7px 12px;
  cursor: pointer;
}

.pill.active {
  border-color: #1e3a5f;
  background: #1e3a5f;
  color: #fff;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.kpi-card {
  border: 1px solid #dbe2ea;
  border-radius: 12px;
  background: #f8fafc;
  padding: 14px;
}

.kpi-card h2 {
  margin: 0;
  color: #334155;
  font-size: 0.95rem;
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.kpi-card strong {
  display: block;
  margin-top: 10px;
  font-size: 1.45rem;
}

.chip {
  display: inline-block;
  margin-top: 8px;
  font-size: 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  padding: 2px 10px;
}

.chip.warn {
  color: #92400e;
  border-color: #fcd34d;
  background: #fef3c7;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.chart-card {
  min-height: 320px;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 10px;
}

.chart-card h3,
.panel h3 {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.panel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

ul {
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

li {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 10px;
  display: grid;
  gap: 4px;
}

small {
  color: #64748b;
}

.error {
  margin: 0;
  color: #b91c1c;
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .charts-grid,
  .panel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
