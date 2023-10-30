<template>
  <Header/>
  <product-list-vue/>
</template>

<script>
import Header from "./components/Firt-Header.vue";
import ProductListVue from "./components/ProductList.vue";

export default {
  name: 'App',
  components: {
    Header,
    ProductListVue
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #F1F5F9;
}
</style>
