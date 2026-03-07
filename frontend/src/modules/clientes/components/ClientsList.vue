<template>
  <section class="customers-page">
    <header>
      <h2>Clientes</h2>
      <p>Base de clientes registrada en el backend.</p>
    </header>

    <div class="toolbar">
      <input v-model="search" type="search" placeholder="Buscar por nombre o identificacion" />
    </div>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Identificacion</th>
          <th>Email</th>
          <th>Telefono</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="customer in filteredCustomers" :key="customer.id">
          <td>{{ customer.id }}</td>
          <td>{{ displayName(customer) }}</td>
          <td>{{ customer.identification }}</td>
          <td>{{ customer.email || "-" }}</td>
          <td>{{ customer.phone || "-" }}</td>
        </tr>
        <tr v-if="filteredCustomers.length === 0">
          <td colspan="5" class="empty">No hay clientes para mostrar</td>
        </tr>
      </tbody>
    </table>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { httpClient } from "@/shared/http/client";

type Customer = {
  id: number;
  fullName: string | null;
  businessName: string | null;
  identification: string;
  email: string | null;
  phone: string | null;
};

const customers = ref<Customer[]>([]);
const search = ref("");
const errorMessage = ref("");

const displayName = (customer: Customer) =>
  customer.fullName || customer.businessName || "Sin nombre";

const filteredCustomers = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return customers.value;

  return customers.value.filter((customer) => {
    const name = displayName(customer).toLowerCase();
    return name.includes(term) || customer.identification.toLowerCase().includes(term);
  });
});

onMounted(async () => {
  try {
    const { data } = await httpClient.get<Customer[]>("/customers");
    customers.value = data;
  } catch {
    errorMessage.value = "No se pudo cargar la lista de clientes.";
  }
});
</script>

<style scoped>
.customers-page {
  display: grid;
  gap: 12px;
  text-align: left;
}

header h2,
header p {
  margin: 0;
}

.toolbar input {
  width: 100%;
  max-width: 340px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

th,
td {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
}

th {
  background: #f8fafc;
}

.empty {
  text-align: center;
  color: #64748b;
}

.error {
  margin: 0;
  color: #b91c1c;
}
</style>
