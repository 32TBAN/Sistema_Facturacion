import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import axios from 'axios' 
import VueAxios from 'vue-axios'

library.add(faChevronDown, faChevronUp)

const app = createApp(App).component('font-awesome-icon', FontAwesomeIcon)

app.use(router) 
app.use(VueAxios, axios)
app.mount('#app')
