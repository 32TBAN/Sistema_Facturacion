<template>
  <section class="users-page">
    <header class="panel heading">
      <div>
        <h2>
          <font-awesome-icon :icon="['fas', 'users-gear']" />
          Gestion de usuarios
        </h2>
        <p>Administra cuentas, roles y estado de acceso.</p>
      </div>
      <button class="primary" @click="openCreateModal">
        <font-awesome-icon :icon="['fas', 'user-plus']" />
        Nuevo usuario
      </button>
    </header>

    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'user']" /> Nombre</span></th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'envelope']" /> Email</span></th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'id-badge']" /> Rol</span></th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'toggle-on']" /> Estado</span></th>
              <th><span class="th-content"><font-awesome-icon :icon="['fas', 'pen']" /> Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="state">Cargando usuarios...</td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="5" class="state">No hay usuarios registrados.</td>
            </tr>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ roleLabel(user.role) }}</td>
              <td>
                <span :class="['badge', user.isActive ? 'ok' : 'warn']">
                  {{ user.isActive ? "Activo" : "Inactivo" }}
                </span>
              </td>
              <td>
                <button class="ghost" @click="openEditModal(user)">
                  <font-awesome-icon :icon="['fas', 'pen']" />
                  Editar
                </button>
              </td>
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
            <font-awesome-icon :icon="['fas', editMode ? 'pen' : 'user-plus']" />
            {{ editMode ? "Editar usuario" : "Crear usuario" }}
          </h3>
          <button class="ghost icon-only" @click="closeModal" aria-label="Cerrar">
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </button>
        </header>

        <div class="modal-grid">
          <div class="field">
            <label for="name">
              <font-awesome-icon :icon="['fas', 'user']" />
              Nombre
            </label>
            <input id="name" v-model="form.name" type="text" />
          </div>

          <div class="field">
            <label for="email">
              <font-awesome-icon :icon="['fas', 'envelope']" />
              Email
            </label>
            <input id="email" v-model="form.email" type="email" :disabled="editMode" />
          </div>

          <div class="field">
            <label for="role">
              <font-awesome-icon :icon="['fas', 'id-badge']" />
              Rol
            </label>
            <select id="role" v-model.number="form.roleId" :disabled="isSelfEdit">
              <option :value="0" disabled>Selecciona rol</option>
              <option v-for="role in roles" :key="role.id" :value="role.id">
                {{ roleLabel(role.name) }}
              </option>
            </select>
            <small v-if="isSelfEdit" class="warn-text">No puedes cambiar tu propio rol.</small>
          </div>

          <div class="field">
            <label for="active">
              <font-awesome-icon :icon="['fas', 'toggle-on']" />
              Estado
            </label>
            <select id="active" v-model="form.isActive" :disabled="isSelfEdit">
              <option :value="true">Activo</option>
              <option :value="false">Inactivo</option>
            </select>
            <small v-if="isSelfEdit" class="warn-text">No puedes desactivar tu propia cuenta.</small>
          </div>

          <div class="field field-full">
            <label for="password">
              <font-awesome-icon :icon="['fas', 'lock']" />
              {{ editMode ? "Nueva contraseña (opcional)" : "Contraseña" }}
            </label>
            <input id="password" v-model="form.password" type="password" autocomplete="new-password" />
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
          <button class="primary" :disabled="saving || !isFormValid" @click="saveUser">
            <font-awesome-icon :icon="['fas', 'floppy-disk']" />
            {{ saving ? "Guardando..." : editMode ? "Guardar cambios" : "Crear usuario" }}
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

type Role = {
  id: number;
  name: "admin" | "empleado" | "lector" | string;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

const authStore = useAuthStore();
const users = ref<User[]>([]);
const roles = ref<Role[]>([]);
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const showModal = ref(false);
const editMode = ref(false);
const editingUserId = ref<number | null>(null);
const modalErrorMessage = ref("");

const form = reactive({
  name: "",
  email: "",
  roleId: 0,
  isActive: true,
  password: "",
});

const currentUserId = computed(() => authStore.user?.id ?? 0);
const isSelfEdit = computed(() => editMode.value && editingUserId.value === currentUserId.value);

const roleLabel = (roleName: string) => {
  if (roleName === "admin") return "Administrador";
  if (roleName === "empleado") return "Empleado";
  if (roleName === "lector") return "Lector";
  return roleName;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isFormValid = computed(() => {
  const nameValid = form.name.trim().length >= 3;
  const emailValid = emailRegex.test(form.email.trim());
  const roleValid = form.roleId > 0;
  const passwordValid = editMode.value ? form.password.length === 0 || form.password.length >= 8 : form.password.length >= 8;
  return nameValid && emailValid && roleValid && passwordValid;
});

const resetForm = () => {
  form.name = "";
  form.email = "";
  form.roleId = 0;
  form.isActive = true;
  form.password = "";
  modalErrorMessage.value = "";
};

const resolveRoleIdByName = (roleName: string) =>
  roles.value.find((role) => role.name.toLowerCase() === roleName.toLowerCase())?.id ?? 0;

const fetchBaseData = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const [usersResponse, rolesResponse] = await Promise.all([httpClient.get<User[]>("/users"), httpClient.get<Role[]>("/users/roles")]);
    users.value = usersResponse.data;
    roles.value = rolesResponse.data;
  } catch (error) {
    if (isAxiosError(error)) {
      errorMessage.value = (error.response?.data as { message?: string } | undefined)?.message || "No se pudo cargar usuarios.";
    } else {
      errorMessage.value = "No se pudo cargar usuarios.";
    }
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  editMode.value = false;
  editingUserId.value = null;
  resetForm();
  showModal.value = true;
};

const openEditModal = (user: User) => {
  editMode.value = true;
  editingUserId.value = user.id;
  form.name = user.name;
  form.email = user.email;
  form.roleId = resolveRoleIdByName(user.role);
  form.isActive = user.isActive;
  form.password = "";
  modalErrorMessage.value = "";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const saveUser = async () => {
  if (!isFormValid.value) return;

  saving.value = true;
  modalErrorMessage.value = "";
  successMessage.value = "";

  try {
    if (editMode.value && editingUserId.value) {
      const payload: { name: string; roleId?: number; isActive?: boolean; password?: string } = { name: form.name.trim() };

      if (!isSelfEdit.value) {
        payload.roleId = form.roleId;
        payload.isActive = form.isActive;
      }
      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      await httpClient.put(`/users/${editingUserId.value}`, payload);
      successMessage.value = "Usuario actualizado correctamente.";
    } else {
      await httpClient.post("/users", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        roleId: form.roleId,
        isActive: form.isActive,
        password: form.password.trim(),
      });
      successMessage.value = "Usuario creado correctamente.";
    }

    closeModal();
    await fetchBaseData();
  } catch (error) {
    if (isAxiosError(error)) {
      modalErrorMessage.value =
        (error.response?.data as { message?: string } | undefined)?.message || "No se pudo guardar el usuario.";
    } else {
      modalErrorMessage.value = "No se pudo guardar el usuario.";
    }
  } finally {
    saving.value = false;
  }
};

onMounted(fetchBaseData);
</script>

<style scoped>
.users-page {
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

.heading {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 12px;
  flex-wrap: wrap;
}

.heading h2 {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.heading p {
  margin: 6px 0 0;
  color: #64748b;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 820px;
  border-collapse: collapse;
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

.state {
  text-align: center;
  color: #64748b;
}

.badge {
  font-size: 0.82rem;
  border-radius: 999px;
  padding: 4px 10px;
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

button,
input,
select {
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
  border-color: #1e3a5f;
  color: #fff;
}

.ghost {
  background: transparent;
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
  z-index: 35;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  padding: 16px;
}

.modal-card {
  width: min(760px, 100%);
  border-radius: 12px;
  background: #fff;
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

.field {
  display: grid;
  gap: 6px;
}

.field label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.field-full {
  grid-column: 1 / -1;
}

.warn-text {
  color: #92400e;
  font-size: 0.82rem;
}

footer {
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
