import axios from 'axios'
import Vue from 'vue'
import router from '@/router'
import { getToken } from './utils'
import { Message, Notification, MessageBox } from 'element-ui'
// 添加请求拦截器
let isLogin = false
import configSetting from './configSetting'
var baseURLStr = configSetting.baseURL;
const instance = axios.create({
    // baseURL: 'http://api1.zklf-tech.com',
    baseURL: `http:${baseURLStr}`,
    // baseURL: '/api-li',
    // baseURL: 'http://192.168.13.14:8001',
    timeout: 1000 * 60 * 5,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
    },
})
instance.interceptors.request.use(
    config => {
        // ADD 添加从Url获取token
        let token = '';
        const isToken = (config.headers || {}).isToken === false
        if (getToken() && !isToken) {
            config.headers['Authorization'] = 'Bearer ' + getToken() || sessionStorage.getItem('token');
        }

        if (config.method === 'get' && config.params) {
            let url = config.url + '?';
            for (const propName of Object.keys(config.params)) {
                const value = config.params[propName];
                var part = encodeURIComponent(propName) + "=";
                if (value !== null && typeof(value) !== "undefined") {
                    if (typeof value === 'object') {
                        for (const key of Object.keys(value)) {
                            let params = propName + '[' + key + ']';
                            var subPart = encodeURIComponent(params) + "=";
                            url += subPart + encodeURIComponent(value[key]) + "&";
                        }
                    } else {
                        url += part + encodeURIComponent(value) + "&";
                    }
                }
            }
            url = url.slice(0, -1);
            config.params = {};
            config.url = url;
        }
        return config
    },

)

instance.interceptors.response.use(
    function(response) {
        const res = response.data
            // const code = res.data.status || 200;
            // if (code == 401) {
            // MessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
            //         confirmButtonText: '重新登录',
            //         cancelButtonText: '取消',
            //         type: 'warning'
            //     }).then(() => {
            //         Cookies.remove("username");
            //         Cookies.remove("token");
            //         router.push('/login')
            //             // location.href = '/login';
            //     })
            // return Promise.reject(new Error(msg))
            // } else if (code === 500) {
            //     Message({
            //         message: msg,
            //         type: 'error'
            //     })
            //     while (pending.length > 0) {
            //         pending.pop()('请求中断');
            //     }
            //     return Promise.reject(new Error(msg))
            // } else if (res && code != 200) {
            //     Message({
            //         message: res.msg,
            //         type: 'error',
            //         duration: 5000
            //     })
            //     return Promise.reject(res)
            // }
        return Promise.resolve(res)
    },
    function(error) {
        let { message } = error;
        let code = message.substr(message.length - 3)
            // if (message == "Network Error") {
            //     message = "后端接口连接异常";
            // } else if (message.includes("timeout")) {
            //     message = "系统接口请求超时";
            // } else if (message.includes("Request failed with status code")) {
            //     message = "系统接口" + code + "异常";
            // }
        if (code == 401 && !isLogin) {
            isLogin = true
            MessageBox.confirm('拉取或同步数据需要联网登录，是否登录？', '系统提示', {
                confirmButtonText: '重新登录',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // Cookies.remove("username");
                // Cookies.remove("token");
                router.push('/')
                isLogin = false
                    // location.href = '/login';
            }).catch(() => {
                isLogin = false
                    // Message({
                    //     type: 'info',
                    //     message: '已取消'
                    // });
            });
            // return Promise.reject(JSON.stringify(data));
        } else {
            Message({
                message: message,
                type: 'error',
                duration: 3 * 1000
            })
            return Promise.reject(error);
        }


    }
);

// 请求处理
export default instance