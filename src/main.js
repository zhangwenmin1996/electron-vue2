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
window.HadonSettings = {
    baseURL: '//api1.zklf-tech.com',
    baseURL2: '//api2.zklf-tech.com',
    baseURLDB: 'file.zkys-tech.com',
    vncURL: '//192.168.10.51:8788/',
    // portDB: 80,
    useSSL: true,
    isRule: true,
    accessKey: 'N49LYKXEH298VEPXGQRF', //账户id
    secretKey: '55jHyXsZ++5enSYbI6sf1mvVlXpGp4TPcK0HowoH', //密码
    mapURL: 'http://map.zklf-tech.com/geoserver/ows?',
    wsURL: 'ws://112.4.150.142:10001/ws/websocket/',
};
// Vue.prototype.$getBase64 = getBase64
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
})