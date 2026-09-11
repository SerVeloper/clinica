import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { iniciarTema } from './compartido/composables/useTema'

const detenerTema = iniciarTema()
const app = createApp(App)
app.onUnmount(detenerTema)
app.mount('#app')
