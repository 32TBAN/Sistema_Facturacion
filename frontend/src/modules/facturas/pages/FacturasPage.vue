<template>
  <div class="factura-page">
    <transition name="fade">
      <ViewFactura v-if="showDetail" :invoice-id="selectedInvoiceId" @close="closeDetail" />
    </transition>

    <h2>Facturas</h2>
    <DataTable :data="facturas" :columns="columns" filter-placeholder="Buscar por numero o cliente" />
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, ref } from "vue";
import { Button } from "@/shared/ui/button";
import type { ColumnDef } from "@tanstack/vue-table";
import ViewFactura from "@/modules/facturas/components/FacturaView.vue";
import DataTable from "@/shared/table/DataTable.vue";
import { httpClient } from "@/shared/http/client";

type InvoiceSummary = {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  status: "DRAFT" | "PAID" | "CANCELLED";
  total: number | string;
  customer: {
    fullName: string | null;
    businessName: string | null;
  };
};

const facturas = ref<InvoiceSummary[]>([]);
const showDetail = ref(false);
const selectedInvoiceId = ref(0);
const errorMessage = ref("");

const customerLabel = (invoice: InvoiceSummary) =>
  invoice.customer.fullName || invoice.customer.businessName || "Sin nombre";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("es-EC");
};

const formatMoney = (value: number | string) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value));

const openDetail = (invoiceId: number) => {
  selectedInvoiceId.value = invoiceId;
  showDetail.value = true;
};

const closeDetail = () => {
  showDetail.value = false;
  selectedInvoiceId.value = 0;
};

const columns: ColumnDef<InvoiceSummary>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Factura",
  },
  {
    id: "customer",
    header: "Cliente",
    cell: ({ row }) => customerLabel(row.original),
  },
  {
    accessorKey: "issueDate",
    header: "Fecha",
    cell: ({ row }) => formatDate(row.original.issueDate),
  },
  {
    accessorKey: "status",
    header: "Estado",
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => formatMoney(row.original.total),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) =>
      h(
        Button,
        {
          size: "sm",
          variant: "outline",
          onClick: () => openDetail(row.original.id),
        },
        () => "Ver"
      ),
  },
];

const getFacturas = async () => {
  try {
    const { data } = await httpClient.get<InvoiceSummary[]>("/invoices");
    facturas.value = data;
  } catch {
    errorMessage.value = "No se pudo cargar la lista de facturas.";
  }
};

onMounted(() => {
  void getFacturas();
});
</script>

<style scoped>
.factura-page {
  display: grid;
  gap: 16px;
}

.error {
  margin: 0;
  color: #b91c1c;
}
</style>
