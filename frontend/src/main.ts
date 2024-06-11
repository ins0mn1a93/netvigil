import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './app.vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import Index from './pages/index.vue'
import Records from './pages/records.vue'
import Config from './pages/config.vue'
import Login from './pages/login.vue'
import EditConfig from './pages/edit.vue'

import 'element-plus/dist/index.css'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [{
    path: '/login',
    component: Login,
    name: 'login'
  }, {
    path: '/',
    component: Index,
    name: 'home'
  }, {
    path: '/records',
    component: Records,
    name: 'records'
  }, {
    path: '/config',
    component: Config,
    name: 'config'
  }, {
    path: '/edit',
    component: EditConfig,
    name: 'editconfig'
  }]
})

const app = createApp(App)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})
app.mount('#app')
