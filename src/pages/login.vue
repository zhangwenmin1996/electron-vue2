<template>
  <div class="box">
    <div class="noLogin" @click="offLine">
      开始使用
    </div>
  </div>
</template>

<script>
// import config from "./config";
const os = require('os');
const { execSync } = require('child_process');
export default {
  name: "login",
  // components: {
  //   config,
  // },
  data() {
    return {
      codeUrl: "",
      cookiePassword: "",
      loginForm: {
        username: "",
        password: "",
        grant_type: "password",
        client_id: "client-app",
        client_secret: 123456,
        systemType: "INSPECTION_SYSTEM",
        loginType: 2,
        domain: window.location.host,
        sn: '',
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "用户名不能为空" },
        ],
        password: [
          { required: true, trigger: "blur", message: "密码不能为空" },
        ],
        // code: [{ required: true, trigger: "change", message: "验证码不能为空" }]
      },
      loading: false,
      redirect: undefined,
      isSet: false,
      time: localStorage.getItem('time'),
      sn: localStorage.getItem('sn')
      // verify: store.getters.verify,
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  created() {
    // this.getCode();
    this.$db.open();
    this.getCookie();
    // this.getIp();
    this.getBySn()
  },
  methods: {
    setLine(){
      this.$refs.configInfo.init()
    },
    offLine(){
      let time = this.time
      const storedDate = new Date(time);
      const currentDate = new Date();
      const differenceInMilliseconds = currentDate - storedDate;
      const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
      if (differenceInDays > 15) {
        this.$message.warning("距离上次授权登录已超过15天，请重新登录");
      } else {
        this.$router.push('/home')
      }
      
    },
    getBySn(){
      const disks = os.platform() === 'win32' ? execSync('wmic diskdrive get serialnumber').toString().split('\n').slice(1,-1) : [];
      const diskSerials = disks.map(serial => serial.trim());

      // 获取CPU序列号
      const cpu = os.platform() === 'win32' ? execSync('wmic cpu get processorid').toString().split('\n').slice(1,-1) : [];
      const cpuSerial = cpu[0].trim();

      console.log('硬盘序列号：', diskSerials);
      console.log('CPU序列号：', cpuSerial)
      // let sn = cpuSerial+'@'+diskSerials[0]
      let sn = cpuSerial
      
    // console.log(os.platform()); // 获取操作系统平台，如win32、linux、darwin等
    // console.log(os.arch()); // 获取CPU架构，如x64、ia32等
    // console.log(os.cpus()); // 获取CPU信息，包括型号、速度等
    // console.log(os.totalmem()); // 获取系统总内存大小，以字节为单位
    // console.log(os.hostname()); // 获取系统主机名
    // console.log(os.networkInterfaces());
      let that = this
      that.sn = sn
      that.$fetch({
          url: "http://api1.zklf-tech.com/api/inspection/inspection/manageAuthorizationController/selectBySn",
          method: "post",
          params: {
            deviceSn: sn,
            softwareKey: 'inspection-pc'
          },
        }).then((data) => {
          if (data && data.status == 200) {
            let code = data.data.status
            if(code==2){
              localStorage.setItem('time',that.parseTime(new Date()))
              that.time = that.parseTime(new Date())
              localStorage.setItem('isSN',true)
              that.isSN = true
            }else{
              localStorage.setItem('isSN',false)
              that.isSN = false
              localStorage.setItem('time','2023-03-02 16:08:19')
              that.time = '2023-03-02 16:08:19'
              var msg = '应用未授权，请输入激活码重新授权'
              switch (code) {
                case 1:
                  msg = '应用未授权，请输入激活码重新授权'
                  break;
                case 3:
                  msg = '激活码已超期，请输入激活码重新授权'
                  break;
                case 4:
                  msg = '激活码已禁用，请输入激活码重新授权'
                  break;
                case 5:
                  msg = '应用未申请授权，请输入激活码授权'
                  break;
                default:
                  break;
              }
              that.$prompt(msg, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
              }).then(({ value }) => {
                that.activation(value,sn)
              }).catch(() => {
                     
              });
            }
           
             
          }
        });
    },
    activation(value,sn){
      let that = this
      that.$fetch({
        url: "http://api1.zklf-tech.com/api/inspection/inspection/manageAuthorizationController/activation",
        method: "post",
        data: {
          deviceSn: sn,
          softwareKey: 'inspection-pc',
          activationCode: value,
          deviceModel: 'PC端'
        },
       }).then((data) => {
        if (data && data.status == 200) {
          that.$message.success("激活成功！");
          localStorage.setItem('isSN',true)
          that.isSN = true
          localStorage.setItem('time',that.parseTime(new Date()))
          that.time = that.parseTime(new Date())
          that.$confirm ('是否进入离线使用', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
            }).then(() => {
             that.$router.push("/home")
            }).catch(() => {
                   
            });
          // that.$router.push("/home").catch(() => {
            
          // });
        }else{
          console.log(data,222)
          that.$message.warning(data.message); 
        }
      })
    },
    // getIp() {
    //   this.$fetch({
    //       url: 'https://www.ip.cn/api/index?ip&type=0',
    //       method: "get",
    //     }).then((data) => {
    //       console.log(data)
    //       this.loginForm.ip = data.ip
    //     })
    // },
   
    getCookie() {
    
      // const rememberMe = Cookies.get("rememberMe");
      this.loginForm = {
        username: this.loginForm.username,
        password:this.loginForm.password,
        grant_type: "password",
        client_id: "client-app",
        client_secret: 123456,
        systemType: "INSPECTION_SYSTEM",
        loginType: 2,
        domain: window.location.host,
        // rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
      };
    //   si.system().then(data => {
    //     console.log('1111 ', data);
    //     console.log('Manufacturer: ', data.manufacturer);
    //     console.log('Model: ', data.model);
    // }).catch(error => {
    //     console.error(error);
    // });
    },
  
    handleLogin() {
      let that = this;
      that.$refs.loginForm.validate((valid) => {
        if (valid) {
          that.loading = true;
          that
            .$fetch({
              url: "api/auth/oauth/token",
              method: "post",
              params: this.loginForm,
            })
            .catch((error) => {
              // that.$message.error("登录" + "接口出错！");
              that.loading = false;
            })
            .then((data) => {
              // console.log(data);
              if (data.status == 200) {
                let token = data.data.token;
                sessionStorage.setItem("token", token);
                that.loading = false;
                let isTime = that.isSN
                console.log(isTime,3333)
                if(that.isSN==true){
                  that.$message.success("登录成功！");
                  that.$router.push('/home')
                  console.log(isTime,2222)
                }else{
                   that.$prompt('激活码已超期，请输入激活码重新授权', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                  }).then(({ value }) => {
                    that.activation(value,that.sn)
                  }).catch(() => {
                    this.$message({
                      type: 'info',
                      message: '取消输入'
                    });       
                  });
                }
                
              } else {
                that.loading = false;
                that.$message.warning(data.msg);
              }
            });
          // Cookies.set("rememberMe", this.loginForm.rememberMe, { expires: 30 });
          // } else {
          //   Cookies.remove("username");
          //   Cookies.remove("password");
          //   Cookies.remove('rememberMe');
          // }
          // this.$store.dispatch("Login", this.loginForm).then(() => {
          // that.$router.push({ path: that.redirect || "/" }).catch(() => {});
          // }).catch(() => {
          // that.loading = false;
          //   this.getCode();
          // });
        }
      });
    },
  },
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@function Px($px) {
  @return $px / 1920 * 100vw;
}
@function Hx($px) {
  @return $px / 1080 * 100vh;
}
.box{
  position: relative;
  width: 100vw;
  height: 100vh;
  background: url("../assets/login/bg.png") center ;
  background-size: 100%;
  overflow: hidden;
  .noLogin{
    position: absolute;
    left: 50%;
    top: 60%;
    transform: translate(-50%,-50%);
    width: 150px;
    height: 40px;
    text-align: center;
    line-height: 40px;
    background: #5B9BD5;
    border: 1px #2F67A1 solid;
    box-shadow: 0px 2px 6px rgba(208, 243, 254, 0.6);
    border-radius: 8px;
    &:hover{
      background: linear-gradient(180deg, rgba(47, 103, 161, 0.4) 0%, #2F67A1 100%);
      color: #01C19A;
      cursor: pointer;
    }
  }
}




</style>

