<template>
  <section class="movements-page">
    <header class="panel heading">
      <div>
        <h2>
          <font-awesome-icon :icon="['fas', 'arrows-rotate']" />
          Movimientos de inventario
        </h2>
        <p>
          <font-awesome-icon :icon="['fas', 'circle-info']" />
          Historial de entradas, salidas y ajustes de stock.
        </p>
      </div>
    </header>

    <section class="panel">
      <div class="field">
        <label for="movements-search">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          Buscar por SKU, producto, tipo, motivo o usuario
        </label>
        <input
          id="movements-search"
          v-model="search"
          type="search"
          placeholder="Ej: SKU-001, arroz, salida, ajuste..."
        />
      </div>
      <p class="meta">
        <font-awesome-icon :icon="['fas', 'database']" />
        {{ filteredMovements.length }} registro(s)
      </p>
    </section>

    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'calendar-days']" /> Fecha</span></th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'barcode']" /> SKU</span></th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'box']" /> Producto</span></th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'shuffle']" /> Tipo</span></th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'hashtag']" /> Cantidad</span></th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'comment-dots']" /> Motivo</span></th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'user']" /> Usuario</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="state-cell">Cargando movimientos...</td>
            </tr>
            <tr v-else-if="filteredMovements.length === 0">
              <td colspan="7" class="state-cell">No hay movimientos para mostrar.</td>
            </tr>
            <tr v-for="movement in filteredMovements" :key="movement.id">
              <td>{{ formatDate(movement.createdAt) }}</td>
              <td>
                <span class="sku-cell" :title="movement.product?.sku ?? '-'">
                  {{ movement.product?.sku ?? "-" }}
                </span>
              </td>
              <td>{{ movement.product?.name ?? "-" }}</td>
              <td>
                <span :class="['badge', movementTypeClass(movement.type)]">
                  {{ movementTypeLabel(movement.type) }}
                </span>
              </td>
              <td>{{ movement.quantity }}</td>
              <td>{{ movement.reason || movement.reference || "-" }}</td>
              <td>{{ movement.user?.fullName || movement.user?.email || "-" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p v-if="errorMessage" class="error">
      <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
      {{ errorMessage }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { isAxiosError } from "axios";
import { httpClient } from "@/shared/http/client";

type InventoryMovement = {
  id: number;
  type: "IN" | "OUT" | "ADJUST" | string;
  quantity: number;
  reason?: string | null;
  reference?: string | null;
  createdAt: string;
  product?: {
    sku?: string | null;
    name?: string | null;
  } | null;
  user?: {
    fullName?: string | null;
    email?: string | null;
  } | null;
};

const movements = ref<InventoryMovement[]>([]);
const search = ref("");
const loading = ref(false);
const errorMessage = ref("");

const filteredMovements = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return movements.value;
  return movements.value.filter((movement) => {
    const sku = movement.product?.sku?.toLowerCase() ?? "";
    const product = movement.product?.name?.toLowerCase() ?? "";
    const type = movementTypeLabel(movement.type).toLowerCase();
    const reason = movement.reason?.toLowerCase() ?? "";
    const reference = movement.reference?.toLowerCase() ?? "";
    const user = movement.user?.fullName?.toLowerCase() ?? movement.user?.email?.toLowerCase() ?? "";
    return (
      sku.includes(term) ||
      product.includes(term) ||
      type.includes(term) ||
      reason.includes(term) ||
      reference.includes(term) ||
      user.includes(term)
    );
  });
});

const formatDate = (rawDate: string) =>
  new Intl.DateTimeFormat("es-EC", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(rawDate));

const movementTypeLabel = (type: string) => {
  if (type === "IN") return "Entrada";
  if (type === "OUT") return "Salida";
  if (type === "ADJUST") return "Ajuste";
  return type;
};

const movementTypeClass = (type: string) => {
  if (type === "IN") return "ok";
  if (type === "OUT") return "warn";
  return "info";
};

const fetchMovements = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const { data } = await httpClient.get<InventoryMovement[]>("/inventory-movements");
    movements.value = data;
  } catch (error) {
    if (isAxiosError(error)) {
      errorMessage.value =
        (error.response?.data as { message?: string } | undefined)?.message ||
        "No se pudo cargar el historial de movimientos.";
    } else {
      errorMessage.value = "No se pudo cargar el historial de movimientos.";
    }
  } finally {
    loading.value = false;
  }
};

onMounted(fetchMovements);
</script>

<style scoped>
.movements-page {
  display: grid;
  gap: 12px;
  text-align: left;
}

.panel {
  border: 1px solid #dbe2ea;
  border-radius: 12px;
  background: #fff;
  padding: 14px;
}

.heading h2,
.heading p,
label {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.field {
  display: grid;
  gap: 6px;
}

input {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px;
}

.meta {
  margin: 8px 0 0;
  color: #475569;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
}

th,
td {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

th {
  background: #f8fafc;
}

.th-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.sku-cell {
  display: inline-block;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.badge {
  font-size: 0.82rem;
  border-radius: 999px;
  padding: 3px 10px;
  border: 1px solid;
}

.badge.ok {
  color: #166534;
  border-color: #86efac;
  background: #dcfce7;
}

.badge.warn {
  color: #92400e;
  border-color: #fcd34d;
  background: #fef3c7;
}

.badge.info {
  color: #1d4ed8;
  border-color: #93c5fd;
  background: #eff6ff;
}

.state-cell {
  text-align: center;
  color: #64748b;
}

.error {
  margin: 0;
  color: #b91c1c;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
