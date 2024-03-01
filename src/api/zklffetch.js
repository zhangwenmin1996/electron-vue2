import axios from 'axios'
import Vue from 'vue'
// import axiosRetry from 'axios-retry';
import { Message } from 'element-ui'

// import configSetting from '@/configSetting'
// var baseURLStr = configSetting.baseURL2;
// const BASEURL = process.env.NODE_ENV === "production" ? baseURLStr : '/spf-tast';
const instance = axios.create({
    baseURL: '//api2.zklf-tech.com',
    // baseURL: BASEURL,
    // baseURL: baseURLStr,

    timeout: 1000 * 60 * 5,
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
    },
    transformRequest: [function(data) { //在请求之前对data传参进行格式转换
        let param = new FormData()
        if (data) {
            Object.keys(data).forEach(key => {
                param.append(key, data[key]);
            });
        }
        return param
    }],
})
instance.interceptors.request.use(
        config => {
            // ADD 添加从Url获取token
            // let token = 'f383e878605e5041e8d8997afcb8a07a'
            // if (token) {
            //     config.headers.common['token'] = token
            // }

            return config
        },
        err => {
            Notification.error({
                title: '错误信息',
                message: err.message || '服务器错误',
                showClose: false
            })
            return Promise.reject(err)
        }
    )
    // axiosRetry(instance, {
    //     retries: 2,                       // 设置自动发送请求次数
    //     retryDelay: (retryCount) => {
    //       return retryCount * 1000;      // 重复请求延迟
    //     },
    //     shouldResetTimeout: true,       //  重置超时时间
    //     retryCondition: (error) => {
    //       //true为打开自动发送请求，false为关闭自动发送请求
    //         return true;
    //     }
    //   });
instance.interceptors.response.use(
    function(response) {
        const res = response.data
        if (res && res.code !== 1000) {
            Message({
                message: res.msg,
                type: 'error',
                duration: 5000
            })
            return Promise.reject(res)
        }
        return Promise.resolve(res)
    },
    function(error) {
        console.log('error:', error)
        Message({
            message: error.msg || '服务器错误',
            type: 'error',
            duration: 5000
        })
        return Promise.reject(error);
    }
);

// 请求处理
export default instance