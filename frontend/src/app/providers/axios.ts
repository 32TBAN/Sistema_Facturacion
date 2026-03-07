import type { App } from "vue";
import axios from "axios";
import VueAxios from "vue-axios";

export function installAxios(app: App) {
  app.use(VueAxios, axios);
}
