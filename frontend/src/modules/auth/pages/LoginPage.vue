<template>
  <div class="container mt-5">
    <div class="col-md-6 offset-md-3">
      <div class="card" v-if="!loggedIn">
        <div class="card-body">
          <h2 class="card-title text-center mb-4">Inicio de Sesión</h2>
          <form @submit.prevent="login">
            <div class="mb-3">
              <label for="username" class="form-label">Usuario:</label>
              <input
                type="text"
                class="form-control"
                v-model="username"
                required
              />
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Contraseña:</label>
              <input
                type="password"
                class="form-control"
                v-model="password"
                required
              />
            </div>
            <button type="submit" class="btn btn-primary btn-block">
              Iniciar Sesión
            </button>
            <p class="text-danger mt-3">{{ error }}</p>
          </form>
        </div>
      </div>
      <div v-else>
        <div class="alert alert-success mt-3" role="alert">
          <h4 class="alert-heading">¡Bienvenido, {{ username }}!</h4>
          <p>Clic en el botón para continuar.</p>
          <router-link to="/inicio" class="navbar-brand" href="#">
            <button @click="logout" class="btn btn-danger">continuar</button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      password: "",
      loggedIn: false,
      error: "",
    };
  },
  methods: {
    login() {
      // Simulamos una solicitud de inicio de sesión
      // Aquí deberías hacer una solicitud a tu servidor para autenticar al usuario
      if (this.username === "admin" && this.password === "admin") {
        this.loggedIn = true;
        this.error = "";
      } else {
        this.error = "Credenciales incorrectas. Por favor, inténtalo de nuevo.";
      }
    },
    logout() {
      this.loggedIn = false;
      this.username = "";
      this.password = "";
      this.error = "";
    },
  },
};
</script>

<style></style>
