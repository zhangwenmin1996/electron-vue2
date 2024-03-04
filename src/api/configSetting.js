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
const settings = localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : window.HadonSettings

export default settings