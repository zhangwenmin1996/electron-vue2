// 日期格式化
export function parseTime(time, pattern) {
    if (arguments.length === 0 || !time) {
        return null
    }
    const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
    let date
    if (typeof time === 'object') {
        date = time
    } else {
        if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
            time = parseInt(time)
        } else if (typeof time === 'string') {
            time = time.replace(new RegExp(/-/gm), '/');
        }
        if ((typeof time === 'number') && (time.toString().length === 10)) {
            time = time * 1000
        }
        date = new Date(time)
    }
    const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
    }
    const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key]
            // Note: getDay() returns 0 on Sunday
        if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
        if (result.length > 0 && value < 10) {
            value = '0' + value
        }
        return value || 0
    })
    return time_str
}
/**
 * 获取uuid
 */
export function getUUID() {
    return 'xxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, c => {
        return (c === 'x' ? (Math.random() * 16 | 0) : ('r&0x3' | '0x8')).toString(16)
    })
}
// 获取Base64
export function getBase64(imgUrl) {
    return new Promise((resolve) => {
        window.URL = window.URL || window.webkitURL;
        var xhr = new XMLHttpRequest();
        xhr.open("get", imgUrl, true); // 至关重要
        xhr.responseType = "blob";
        xhr.onload = function() {
            if (this.status == 200) {
                //得到一个blob对象
                var blob = this.response;
                console.log("blob", blob); // 至关重要
                let oFileReader = new FileReader();
                oFileReader.onloadend = function(e) {
                    let base64 = e.target.result;
                    //             console.log("方式一》》》》》》》》》", base64)
                    resolve(base64);
                };
                oFileReader.readAsDataURL(blob);
            }
        };
        xhr.send();
    });
}
let Minio = require('minio');
let stream = require('stream');
var minioClient = new Minio.Client({
    endPoint: 'file.zkys-tech.com', //对象存储服务的URL
    // port: basePort, //端口号
    // port: 9000,//本地端口号
    useSSL: true, //true代表使用HTTPS
    accessKey: 'N49LYKXEH298VEPXGQRF', //账户id
    secretKey: '55jHyXsZ++5enSYbI6sf1mvVlXpGp4TPcK0HowoH', //密码
    partSize: '50000M'
});
export function uploadMinIo(bucket, patheName, dataurl) { // 直接上传文件
    console.log(bucket, patheName)
    const fileName = patheName

    return new Promise((resolve, reject) => {
        //base64转blob
        const blob = toBlob(dataurl)
        console.log(dataurl, '测试333');
        console.log(blob, '测试444');
        const mineType = blob.type
        const fileSize = blob.size
            //参数
        let metadata = {
                "content-type": mineType,
                "content-length": fileSize
            }
            //blob转arrayBuffer
        let reader2 = new FileReader()
        reader2.readAsArrayBuffer(blob)

        reader2.onload = function(ex) {
            //定义流
            let bufferStream = new stream.PassThrough();
            //将buffer写入
            bufferStream.end(new Buffer(ex.target.result));
            //上传
            console.log(bufferStream, '测试5555')
            minioClient.putObject(bucket, fileName, bufferStream, fileSize, metadata, function(err, etag) {
                console.log(err, 222);
                if (err == null) {
                    console.log("上传成功", etag);
                    // minioClient.presignedPutObject(bucket, fileName, 24*60*60, function(err, presignedUrl) {
                    //     console.log(presignedUrl)
                    //     var url = presignedUrl
                    resolve(etag);
                    // })
                }
            })
        }
    })

    function toBlob(base64Data) {
        let byteString = base64Data
        if (base64Data.split(',')[0].indexOf('base64') >= 0) {
            byteString = atob(base64Data.split(',')[1]) // base64 解码
        } else {
            byteString = unescape(base64Data.split(',')[1])
        }
        // 获取文件类型
        let mimeString = base64Data.split(';')[0].split(":")[1] // mime类型

        // ArrayBuffer 对象用来表示通用的、固定长度的原始二进制数据缓冲区
        // let arrayBuffer = new ArrayBuffer(byteString.length) // 创建缓冲数组
        // let uintArr = new Uint8Array(arrayBuffer) // 创建视图

        let uintArr = new Uint8Array(byteString.length) // 创建视图

        for (let i = 0; i < byteString.length; i++) {
            uintArr[i] = byteString.charCodeAt(i)
        }
        // 生成blob
        const blob = new Blob([uintArr], {
            type: mimeString
        })
        console.log(blob)
            // 使用 Blob 创建一个指向类型化数组的URL, URL.createObjectURL是new Blob文件的方法,可以生成一个普通的url,可以直接使用,比如用在img.src上
        return blob
    }
}

export function getToken() {
    return sessionStorage.getItem('token')
}