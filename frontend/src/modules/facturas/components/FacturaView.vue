<template>
  <div class="pop-up">
    <div class="pop-up-inner">
      <button class="pop-up-close" @click="$emit('close')">&times;</button>

      <template v-if="invoice">
        <h1>Factura {{ invoice.invoiceNumber }}</h1>
        <div class="meta">
          <div><strong>Cliente:</strong> {{ customerName }}</div>
          <div><strong>Fecha:</strong> {{ formatDate(invoice.issueDate) }}</div>
          <div><strong>Estado:</strong> {{ invoice.status }}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in invoice.items" :key="item.id">
              <td>{{ item.product.name }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ money(item.unitPrice) }}</td>
              <td>{{ money(item.total) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <p><strong>Subtotal:</strong> {{ money(invoice.subtotal) }}</p>
          <p><strong>Impuesto:</strong> {{ money(invoice.tax) }}</p>
          <h3>Total: {{ money(invoice.total) }}</h3>
        </div>
      </template>

      <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-else>Cargando factura...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { httpClient } from "@/shared/http/client";

const props = defineProps<{
  invoiceId: number;
}>();

defineEmits<{
  (event: "close"): void;
}>();

type InvoiceDetail = {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  status: string;
  subtotal: number | string;
  tax: number | string;
  total: number | string;
  customer: {
    fullName: string | null;
    businessName: string | null;
  };
  items: Array<{
    id: number;
    quantity: number;
    unitPrice: number | string;
    total: number | string;
    product: {
      id: number;
      name: string;
    };
  }>;
};

const invoice = ref<InvoiceDetail | null>(null);
const errorMessage = ref("");

const customerName = computed(() => {
  if (!invoice.value) return "";
  return invoice.value.customer.fullName || invoice.value.customer.businessName || "Sin nombre";
});

const money = (value: number | string) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));

const formatDate = (dateString: string) => new Date(dateString).toLocaleString("es-EC");

onMounted(async () => {
  try {
    const { data } = await httpClient.get<InvoiceDetail>(`/invoices/${props.invoiceId}`);
    invoice.value = data;
  } catch {
    errorMessage.value = "No se pudo cargar el detalle de la factura.";
  }
});
</script>

<style scoped>
.pop-up {
  position: fixed;
  inset: 0;
  z-index: 20;
  padding: 24px;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
}

.pop-up-inner {
  width: min(920px, 100%);
  max-height: 90vh;
  overflow: auto;
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  position: relative;
  text-align: left;
}

.pop-up-close {
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: transparent;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
}

.meta {
  margin: 10px 0 14px;
  display: grid;
  gap: 4px;
  color: #334155;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid #e2e8f0;
  padding: 8px;
}

th {
  background: #f8fafc;
}

.totals {
  margin-top: 12px;
  display: grid;
  justify-content: end;
  gap: 4px;
}

.totals p,
.totals h3 {
  margin: 0;
}

.error {
  color: #b91c1c;
  margin: 0;
}
</style>
