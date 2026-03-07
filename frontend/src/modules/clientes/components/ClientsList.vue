<template>
  <section class="customers-page">
    <header class="panel header-panel">
      <div>
        <h2>
          <font-awesome-icon :icon="['fas', 'users']" />
          Clientes
        </h2>
      </div>
      <button v-if="canMutateCustomer" class="primary" @click="openCreateModal">
        <font-awesome-icon :icon="['fas', 'user-plus']" />
        Crear cliente
      </button>
    </header>

    <section class="panel">
      <div class="field">
        <label for="search">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          Buscar por nombre o identificacion
        </label>
        <input id="search" v-model="search" type="search" placeholder="Ej: 0912345678 o Maria" />
      </div>
      <p class="meta">
        <font-awesome-icon :icon="['fas', 'database']" />
        {{ filteredCustomers.length }} resultado(s)
      </p>
    </section>

    <section class="panel table-panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'hashtag']" /> ID</span></th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'user']" /> Nombre</span></th>
              <th>
                <span class="th-content"><font-awesome-icon :icon="['fas', 'id-card']" /> Identificacion</span>
              </th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'envelope']" /> Email</span></th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'phone']" /> Telefono</span></th>
              <th v-if="canMutateCustomer">
                <span class="th-content"><font-awesome-icon :icon="['fas', 'wrench']" /> Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in filteredCustomers" :key="customer.id">
              <td>{{ customer.id }}</td>
              <td>{{ displayName(customer) }}</td>
              <td>{{ customer.identification }}</td>
              <td>{{ customer.email || "-" }}</td>
              <td>{{ customer.phone || "-" }}</td>
              <td v-if="canMutateCustomer">
                <button class="ghost" @click="openEditModal(customer)">
                  <font-awesome-icon :icon="['fas', 'pen']" />
                  Editar
                </button>
              </td>
            </tr>
            <tr v-if="filteredCustomers.length === 0">
              <td :colspan="canMutateCustomer ? 6 : 5" class="empty">No hay clientes para mostrar</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p v-if="errorMessage" class="error">
      <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
      {{ errorMessage }}
    </p>
    <p v-if="successMessage" class="ok">
      <font-awesome-icon :icon="['fas', 'circle-check']" />
      {{ successMessage }}
    </p>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <section class="modal-card">
        <header>
          <h3>
            <font-awesome-icon :icon="['fas', editMode ? 'pen' : 'address-card']" />
            {{ editMode ? "Editar cliente" : "Crear cliente" }}
          </h3>
          <button class="ghost icon-only" @click="closeModal" aria-label="Cerrar">
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </button>
        </header>

        <div class="modal-grid">
          <div class="field">
            <label for="new-identification">
              <font-awesome-icon :icon="['fas', 'id-card']" />
              Identificacion
            </label>
            <input id="new-identification" v-model="form.identification" type="text" maxlength="10" />
            <small :class="['validation', identificationStatus]">
              <font-awesome-icon :icon="['fas', statusIcon(identificationStatus)]" />
              {{ identificationMessage }}
            </small>
          </div>

          <div class="field">
            <label for="new-fullname">
              <font-awesome-icon :icon="['fas', 'user']" />
              Nombre completo
            </label>
            <input id="new-fullname" v-model="form.fullName" type="text" />
            <small :class="['validation', fullNameStatus]">
              <font-awesome-icon :icon="['fas', statusIcon(fullNameStatus)]" />
              {{ fullNameMessage }}
            </small>
          </div>

          <div class="field">
            <label for="new-email">
              <font-awesome-icon :icon="['fas', 'envelope']" />
              Email (opcional)
            </label>
            <input id="new-email" v-model="form.email" type="email" />
            <small :class="['validation', emailStatus]">
              <font-awesome-icon :icon="['fas', statusIcon(emailStatus)]" />
              {{ emailMessage }}
            </small>
          </div>

          <div class="field">
            <label for="new-phone">
              <font-awesome-icon :icon="['fas', 'phone']" />
              Telefono (opcional)
            </label>
            <input id="new-phone" v-model="form.phone" type="text" />
            <small :class="['validation', phoneStatus]">
              <font-awesome-icon :icon="['fas', statusIcon(phoneStatus)]" />
              {{ phoneMessage }}
            </small>
          </div>
        </div>

        <p v-if="modalErrorMessage" class="error">
          <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
          {{ modalErrorMessage }}
        </p>

        <footer>
          <button class="ghost" @click="closeModal">
            <font-awesome-icon :icon="['fas', 'xmark']" />
            Cancelar
          </button>
          <button class="primary" :disabled="saving || !isFormValid" @click="saveCustomer">
            <font-awesome-icon :icon="['fas', 'floppy-disk']" />
            {{ saving ? "Guardando..." : editMode ? "Guardar cambios" : "Guardar cliente" }}
          </button>
        </footer>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { isAxiosError } from "axios";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { httpClient } from "@/shared/http/client";

type Customer = {
  id: number;
  fullName: string | null;
  businessName: string | null;
  identification: string;
  email: string | null;
  phone: string | null;
};

type ValidationStatus = "pending" | "valid" | "invalid";

const authStore = useAuthStore();
const canMutateCustomer = computed(
  () => authStore.roles.includes("admin") || authStore.roles.includes("empleado")
);

const customers = ref<Customer[]>([]);
const search = ref("");
const errorMessage = ref("");
const successMessage = ref("");

const showModal = ref(false);
const saving = ref(false);
const editMode = ref(false);
const editingCustomerId = ref<number | null>(null);
const modalErrorMessage = ref("");

const form = reactive({
  identification: "",
  fullName: "",
  email: "",
  phone: "",
});

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

const digitsOnly = (value: string) => value.replace(/\D/g, "");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEcuadorCedula = (value: string) => {
  const cedula = digitsOnly(value);
  if (!/^\d{10}$/.test(cedula)) return false;

  const province = Number(cedula.slice(0, 2));
  if (province < 1 || province > 24) return false;

  const thirdDigit = Number(cedula[2]);
  if (thirdDigit >= 6) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    let digit = Number(cedula[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === Number(cedula[9]);
};

const trimmedIdentification = computed(() => digitsOnly(form.identification));
const trimmedFullName = computed(() => form.fullName.trim());
const trimmedEmail = computed(() => form.email.trim());
const trimmedPhone = computed(() => digitsOnly(form.phone));

const identificationStatus = computed<ValidationStatus>(() => {
  if (!trimmedIdentification.value) return "pending";
  return isValidEcuadorCedula(trimmedIdentification.value) ? "valid" : "invalid";
});
const fullNameStatus = computed<ValidationStatus>(() => {
  if (!trimmedFullName.value) return "pending";
  return trimmedFullName.value.length >= 3 ? "valid" : "invalid";
});
const emailStatus = computed<ValidationStatus>(() => {
  if (!trimmedEmail.value) return "pending";
  return emailRegex.test(trimmedEmail.value) ? "valid" : "invalid";
});
const phoneStatus = computed<ValidationStatus>(() => {
  if (!trimmedPhone.value) return "pending";
  return trimmedPhone.value.length >= 10 ? "valid" : "invalid";
});

const identificationMessage = computed(() => {
  if (identificationStatus.value === "pending") return "Ingrese cedula ecuatoriana de 10 digitos.";
  if (identificationStatus.value === "invalid") return "Cedula invalida para Ecuador.";
  return "Cedula valida.";
});
const fullNameMessage = computed(() => {
  if (fullNameStatus.value === "pending") return "Ingrese nombre completo.";
  if (fullNameStatus.value === "invalid") return "El nombre debe tener al menos 3 caracteres.";
  return "Nombre valido.";
});
const emailMessage = computed(() => {
  if (emailStatus.value === "pending") return "Puede dejarlo vacio o ingresar un email valido.";
  if (emailStatus.value === "invalid") return "Formato de email invalido.";
  return "Email valido.";
});
const phoneMessage = computed(() => {
  if (phoneStatus.value === "pending") return "Puede dejarlo vacio o ingresar telefono.";
  if (phoneStatus.value === "invalid") return "El telefono debe tener al menos 10 digitos.";
  return "Telefono valido.";
});

const isFormValid = computed(
  () =>
    identificationStatus.value === "valid" &&
    fullNameStatus.value === "valid" &&
    (emailStatus.value === "valid" || emailStatus.value === "pending") &&
    (phoneStatus.value === "valid" || phoneStatus.value === "pending")
);

const statusIcon = (status: ValidationStatus) => {
  if (status === "valid") return "circle-check";
  if (status === "invalid") return "circle-xmark";
  return "clock";
};

const resetForm = () => {
  form.identification = "";
  form.fullName = "";
  form.email = "";
  form.phone = "";
  modalErrorMessage.value = "";
};

const openCreateModal = () => {
  if (!canMutateCustomer.value) return;
  editMode.value = false;
  editingCustomerId.value = null;
  resetForm();
  showModal.value = true;
};

const openEditModal = (customer: Customer) => {
  if (!canMutateCustomer.value) return;
  editMode.value = true;
  editingCustomerId.value = customer.id;
  form.identification = customer.identification;
  form.fullName = customer.fullName ?? "";
  form.email = customer.email ?? "";
  form.phone = customer.phone ?? "";
  modalErrorMessage.value = "";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editMode.value = false;
  editingCustomerId.value = null;
  resetForm();
};

const fetchCustomers = async () => {
  const { data } = await httpClient.get<Customer[]>("/customers");
  customers.value = data;
};

const saveCustomer = async () => {
  if (!canMutateCustomer.value || !isFormValid.value) return;

  saving.value = true;
  modalErrorMessage.value = "";
  successMessage.value = "";
  errorMessage.value = "";

  try {
    const payload = {
      identification: trimmedIdentification.value,
      fullName: trimmedFullName.value,
      email: trimmedEmail.value || undefined,
      phone: trimmedPhone.value || undefined,
    };

    if (editMode.value && editingCustomerId.value) {
      const { data } = await httpClient.put<Customer>(`/customers/${editingCustomerId.value}`, payload);
      customers.value = customers.value.map((customer) =>
        customer.id === data.id ? data : customer
      );
      successMessage.value = "Cliente actualizado correctamente.";
    } else {
      const { data } = await httpClient.post<Customer>("/customers", payload);
      customers.value = [data, ...customers.value];
      successMessage.value = "Cliente creado correctamente.";
    }

    closeModal();
  } catch (error) {
    if (isAxiosError(error)) {
      modalErrorMessage.value =
        (error.response?.data as { message?: string } | undefined)?.message ||
        "No se pudo guardar el cliente.";
    } else {
      modalErrorMessage.value = "No se pudo guardar el cliente.";
    }
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  try {
    await fetchCustomers();
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

.panel {
  border: 1px solid #dbe2ea;
  border-radius: 12px;
  background: #fff;
  padding: 14px;
}

.header-panel {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 10px;
  flex-wrap: wrap;
}

h2,
h3,
p,
label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

h2,
p {
  margin: 0;
}

.field {
  display: grid;
  gap: 6px;
}

input,
button {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px;
}

button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.primary {
  background: #1e3a5f;
  color: #fff;
  border-color: #1e3a5f;
}

.ghost {
  background: transparent;
}

.meta {
  margin: 8px 0 0;
  color: #475569;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
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

.empty {
  text-align: center;
  color: #64748b;
}

.ok,
.error {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.ok {
  color: #166534;
}

.error {
  color: #b91c1c;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  padding: 16px;
}

.modal-card {
  width: min(640px, 100%);
  background: white;
  border-radius: 12px;
  padding: 14px;
  display: grid;
  gap: 12px;
}

.modal-card header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-only {
  padding: 8px 10px;
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.validation {
  font-size: 0.8rem;
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.validation.pending {
  color: #64748b;
}

.validation.valid {
  color: #166534;
}

.validation.invalid {
  color: #b91c1c;
}

.modal-card footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 920px) {
  .modal-grid {
    grid-template-columns: 1fr;
  }
}
</style>
