import { createApp } from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faChevronDown, faChevronUp, fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import App from "./App.vue";
import router from "./app/router";
import { createPinia } from "pinia";
import { installAxios } from "./app/providers/axios";
import "./app/styles/main.css";

library.add(faChevronDown, faChevronUp, fas);

const app = createApp(App).component("font-awesome-icon", FontAwesomeIcon);

app.use(createPinia());
app.use(router);
installAxios(app);
app.mount("#app");
