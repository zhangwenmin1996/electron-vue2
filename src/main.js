import Vue from 'vue'
import App from './App.vue'
import router from './router'
Vue.config.productionTip = false
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);
import uploader from '@/components/uploader/src'
Vue.use(uploader)
import { parseTime } from "@/api/utils";
import db from '@/api/indexDb'
import fetch from '@/api/fetch'
import zklffetch from '@/api/zklffetch'
Vue.prototype.$db = db
Vue.prototype.$fetch = fetch
Vue.prototype.$zklffetch = zklffetch
Vue.prototype.parseTime = parseTime
    // Vue.prototype.$getBase64 = getBase64
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
})