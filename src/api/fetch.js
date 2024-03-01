import axios from 'axios'
import Vue from 'vue'
import router from '@/router'
import { Message, Notification, MessageBox } from 'element-ui'
// 添加请求拦截器
let isLogin = false
const instance = axios.create({
    baseURL: 'http://api1.zklf-tech.com',
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
        let token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55Q29kZSI6IjAiLCJ1c2VyX25hbWUiOiJ6a2xmLWdsLWFkbWluIiwiY3JlZGVudGlhbHNOb25FeHBpcmVkIjp0cnVlLCJpc1RyaWFsIjpudWxsLCJhdXRob3JpdGllcyI6W3siYXV0aG9yaXR5IjoiQURNSU4ifV0sInVzZXJDb2RlIjoiOTk5IiwiZW5hYmxlZCI6dHJ1ZSwiY2xpZW50X2lkIjoiY2xpZW50LWFwcCIsInBhc3N3b3JkIjoiJDJhJDEwJEx4eG1hYWRWam9KNlZQSk8vVE1EdHVvWnpLc3Jsb2pETW4yNEJvTi91TkR2LkpVYUU3SnVtIiwicGhvbmUiOiIxMTA4OCIsImV4cGlyYXRpb25UaW1lIjpudWxsLCJzY29wZSI6WyJhbGwiXSwiZG9tYWluIjpudWxsLCJhY2NvdW50Tm9uRXhwaXJlZCI6dHJ1ZSwiaWQiOjIwLCJ1c2VyVHlwZSI6OTk5OTksImV4cCI6MTcwOTA5ODU2NywianRpIjoiNTExMDUzZDQtYzk0Yy00OWY3LTlmMGMtMzM2MjUyNzI4YmJhIiwidXNlcm5hbWUiOiJ6a2xmLWdsLWFkbWluIiwiYWNjb3VudE5vbkxvY2tlZCI6dHJ1ZX0.XroyPPsvt4IzoGse5n_4hCivsymULCW2_0nvFLy8Yo77lNB-3mwUeJDAYAGvbBcMk6H-_UgsuTfzwXh_8GcqHuXsAthCLigHYYDqkK4oaj9vXz41czjNCFQmXt37F60TAEtEQHUqcEpKAYly5OePn91zc8rvHk0CzUp4TsTkLvQ';

        if (token) {
            config.headers['Authorization'] = 'Bearer ' + sessionStorage.getItem('token') || token;
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
                router.push('/login')
                isLogin = false
                    // location.href = '/login';
            }).catch(() => {
                isLogin = false
                message({
                    type: 'info',
                    message: '已取消'
                });
            });
            // return Promise.reject(JSON.stringify(data));
        } else {
            // Message({
            //     message: message,
            //     type: 'error',
            //     duration: 3 * 1000
            // })
            // return Promise.reject(error);
        }


    }
);

// 请求处理
export default instance