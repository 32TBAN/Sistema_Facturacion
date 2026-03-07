<template>
  <div class="factura-page">
    <transition name="fade">
      <ViewFactura
        v-show="verFactura"
        @close="ocultar"
        :numOrder="numOrder"
        ref="myComponent"
      />
    </transition>

    <h2>Facturas</h2>
    <DataTable :data="facturas" :columns="columns" filter-placeholder="Buscar por orden o cliente" />
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, ref } from "vue";
import { Button } from "@/shared/ui/button";
import type { ColumnDef } from "@tanstack/vue-table";
import ViewFactura from "@/modules/facturas/components/FacturaView.vue";
import DataTable from "@/shared/table/DataTable.vue";
import { httpClient } from "@/shared/http/client";

type Factura = {
  orderID: number;
  customerID: string;
  updatedAt: string;
  cerrada: boolean;
};

const facturas = ref<Factura[]>([]);
const verFactura = ref(false);
const numOrder = ref(0);
const myComponent = ref<InstanceType<typeof ViewFactura> | null>(null);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(2);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const abrirFactura = (orderID: number) => {
  numOrder.value = orderID;
  verFactura.value = true;
  myComponent.value?.getDetailsOrder();
};

const columns: ColumnDef<Factura>[] = [
  {
    accessorKey: "orderID",
    header: "Order ID",
  },
  {
    accessorKey: "customerID",
    header: "Cliente",
  },
  {
    accessorKey: "updatedAt",
    header: "Fecha",
    cell: ({ row }) => formatDate(row.original.updatedAt),
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
          onClick: () => abrirFactura(row.original.orderID),
        },
        () => "Ver"
      ),
  },
];

const getFacturas = async () => {
  const { data } = await httpClient.get<Factura[]>("/orders");
  facturas.value = data.filter((item) => item.cerrada);
};

const ocultar = () => {
  verFactura.value = false;
};

onMounted(() => {
  void getFacturas();
});
</script>

<style scoped>
.factura-page {
  display: grid;
  gap: 16px;
  padding: 20px;
}
</style>
