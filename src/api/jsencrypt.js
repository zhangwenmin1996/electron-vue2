// import JSEncrypt from 'jsencrypt/bin/jsencrypt.min'
import JSEncrypt from './encrypt.js'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

// const publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoR8mX0rGKLqzcWmOzbfj64K8ZIgOdH\n' +
//   'nzkXSOVOZbFu/TJhZ7rFAN+eaGkl3C4buccQd/EjEsj9ir7ijT7h96MCAwEAAQ=='
const publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr+4ms9voV0IE5bIqrn1j8b61YTF9n2EC8q0VIO7qF+bQImjlZ6W43DgAOUO9Hngu4d1WSb3y6ycJEtVSfqfnlU9+0rQVqt9dWRAyGaQq0/ICtPtVsvtG8nm+BFLPK6//kkKwdh9J9N+kcTIXCUR2Z11q9izKcquxlMPnMfVlKO8KwYcurM/LWdgqPSaagP5icQCBi2pNmlby3t3//01AVxm1bgn5SgrqX9UXEmSgSRAgKkr55zxAFT3876pfIX9MP4+ncnprMFct94T1AcK7A38HyLj2hgrZy3VmnjE1fLnc3cG/UPUMJoGXgjv7b7l9N0u4GZhH5hG+sk10dq2J/wIDAQAB'
    // 加密
export function encrypt(txt) {
    const encryptor = new JSEncrypt()
    encryptor.setPublicKey(publicKey) // 设置公钥
    return encryptor.encrypt(txt) // 对数据进行加密
}

// 解密
export function decrypt(txt) {
    const encryptor = new JSEncrypt()
    encryptor.setPublicKey(publicKey) // 设置私钥
    return encryptor.decrypt(txt) // 对数据进行解密
}