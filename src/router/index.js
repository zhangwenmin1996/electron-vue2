import Vue from 'vue'
import Router from 'vue-router'
import index from '@/pages/index.vue'
import login from '@/pages/login.vue'
Vue.use(Router)

const routes = [{
        path: '/',
        name: 'index',
        component: index
    },
    {
        path: '/login',
        name: 'login',
        component: login
    },


]
const router = new Router({
    mode: 'hash',
    routes
})

export default router