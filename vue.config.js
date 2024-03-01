const { defineConfig } = require('@vue/cli-service')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
module.exports = defineConfig({

    devServer: {
        proxy: {
            '/api-li': {
                target: "http://192.168.13.214:10001/",
                pathRewrite: { "^/api-li": "" }, //重写路径  匹配以/yu为开头的路径都变为空字符串 
                // ws: true, //用于支持websocket
                secure: true,
                changeOrigin: true //用于控制请求头中的host值,是否跨域
            },

        }
    },


    // election渲染进程与主进程的node模块处理
    configureWebpack: {
        plugins: [new NodePolyfillPlugin()],
    },
    runtimeCompiler: true,
    transpileDependencies: true,
    lintOnSave: false,
    publicPath: './', // 这里设置成./，否则打包后vue的静态资源引用会报错找不到路径导致白屏
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                "appId": "com.xunjianApp", // 程序的包ID
                "productName": "xunjian",
                "copyright": "Copyright © 2024",
                "directories": {
                    "output": "./dist" //输出文件路径
                },
                // "publish": [ //配置更新程序的服务器地址
                //     {
                //         "provider": "generic",
                //         "url": "https://home.k900.top/AppPackage/electron/"
                //     }
                // ],
                "win": { //win相关配置
                    "icon": "./public/favicon.png", //图标，这里图标需要至少256*256，否则打包会报错
                    "target": [{
                        "target": "nsis", //利用nsis制作安装程序
                        "arch": [
                            "x64", //64位
                            "ia32" //32位
                        ]
                    }]
                },
                "nsis": {
                    "oneClick": false, // 是否一键安装
                    "allowElevation": true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
                    "allowToChangeInstallationDirectory": true, // 允许修改安装目录
                    "installerIcon": "./public/favicon.png", // 安装图标
                    "uninstallerIcon": "./public/favicon.png", //卸载图标
                    "installerHeaderIcon": "./public/favicon.png", // 安装时头部图标
                    "createDesktopShortcut": true, // 创建桌面图标
                    "createStartMenuShortcut": true, // 创建开始菜单图标
                    "shortcutName": "巡检系统桌面版", // 桌面图标名称
                },
            }
        }
    }

})