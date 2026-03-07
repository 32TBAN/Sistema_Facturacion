import axios from "axios";
import VueAxios from "vue-axios";

export function installAxios(app) {
  app.use(VueAxios, axios);
}
