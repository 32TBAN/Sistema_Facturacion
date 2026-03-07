<template>
  <section class="login-saas">
    <aside class="login-brand-panel">
      <div class="badge-online">Servicio activo</div>
      <h1>Facturacion operativa sin friccion</h1>
      <p>
        Controla caja, clientes y facturas desde una sola plataforma con vista por rol.
      </p>

      <ul>
        <li>Emision de facturas en flujo continuo</li>
        <li>Control de inventario y alertas</li>
        <li>Auditoria por usuario y turno</li>
      </ul>
    </aside>

    <div class="login-card">
      <header>
        <h2>Iniciar sesion</h2>
        <p>Accede con tu cuenta para abrir el panel de operacion.</p>
      </header>

      <form class="login-form" @submit="onSubmit">
        <div class="form-group">
          <label for="email">Correo</label>
          <div class="input-wrap">
            <font-awesome-icon class="input-icon" :icon="['fas', 'envelope']" aria-hidden="true" />
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="username"
              placeholder="admin@demo.com"
            />
          </div>
          <small v-if="errors.email">{{ errors.email }}</small>
        </div>

        <div class="form-group">
          <label for="password">Contrasena</label>
          <div class="input-wrap">
            <font-awesome-icon class="input-icon" :icon="['fas', 'lock']" aria-hidden="true" />
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Ingresa tu contrasena"
            />
            <button
              type="button"
              class="toggle-password"
              :aria-label="showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'"
              @click="showPassword = !showPassword"
            >
              <font-awesome-icon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" />
            </button>
          </div>
          <small v-if="errors.password">{{ errors.password }}</small>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <Button type="submit" :disabled="isSubmitting" class="submit-btn">
          {{ isSubmitting ? "Validando..." : "Ingresar al sistema" }}
        </Button>
      </form>

      <footer class="login-footer">
        <p>Demo admin: <code>admin@demo.com / Admin1234</code></p>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { Button } from "@/shared/ui/button";

const authStore = useAuthStore();
const router = useRouter();
const errorMessage = ref("");
const showPassword = ref(false);

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo valido"),
  password: z.string().min(1, "La contrasena es obligatoria"),
});

const { handleSubmit, defineField, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    email: "",
    password: "",
  },
});

const [email] = defineField("email");
const [password] = defineField("password");

const onSubmit = handleSubmit(async (values) => {
  try {
    // console.log("Intentando iniciar sesion con:", values);
    errorMessage.value = "";
    await authStore.login(values);

    const isAdmin = authStore.roles.includes("admin");
    await router.push({ name: isAdmin ? "dashboard" : "inicio" });
  } catch {
    errorMessage.value = "Credenciales invalidas";
  }
});
</script>

<style scoped>
.login-saas {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(260px, 1fr) minmax(360px, 460px);
  background: #eff4fa;
}

.login-brand-panel {
  background: linear-gradient(155deg, #102033 0%, #1e3a5f 52%, #2e5d85 100%);
  color: #eaf2fb;
  padding: 42px;
  display: grid;
  align-content: center;
  gap: 18px;
  text-align: left;
}

.badge-online {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border: 1px solid rgba(226, 232, 240, 0.3);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.8rem;
  background: rgba(2, 132, 199, 0.2);
}

.login-brand-panel h1 {
  margin: 0;
  font-size: clamp(1.8rem, 2.4vw, 2.4rem);
  line-height: 1.2;
}

.login-brand-panel p,
.login-brand-panel li {
  color: #d4e4f5;
}

.login-brand-panel ul {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
}

.login-card {
  background: #f8fafc;
  border-left: 1px solid #d7e2ef;
  padding: 38px 32px;
  display: grid;
  align-content: center;
  gap: 18px;
  text-align: left;
}

.login-card h2 {
  margin: 0;
  font-size: 1.5rem;
}

.login-card header p {
  margin: 8px 0 0;
  color: #64748b;
}

.login-form {
  display: grid;
  gap: 12px;
}

.form-group {
  display: grid;
  gap: 6px;
}

.form-group label {
  color: #334155;
  font-weight: 600;
  font-size: 0.92rem;
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 0.9rem;
}

.form-group input {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 11px 12px 11px 34px;
  background: #ffffff;
  width: 100%;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
}

#password {
  padding-right: 40px;
}

.form-group small,
.error-message {
  color: #b91c1c;
}

.error-message {
  margin: 0;
}

.submit-btn {
  margin-top: 6px;
  width: 100%;
}

.login-footer {
  border-top: 1px solid #dbe2ea;
  padding-top: 12px;
  color: #475569;
  font-size: 0.9rem;
}

.login-footer p {
  margin: 0;
}

@media (max-width: 980px) {
  .login-saas {
    grid-template-columns: 1fr;
  }

  .login-brand-panel {
    padding: 26px;
  }

  .login-card {
    border-left: none;
    border-top: 1px solid #d7e2ef;
    padding: 26px;
  }
}
</style>
