<template>
<div class="box">
  <div class="login">
    <!-- <div class="el-login-header">
      <img class="login-logo" src="@/assets/logo/logo3.png" alt="" />
    </div> -->
    <div class="el-login-header">
      <!-- <img class="login-logo" :src="logo" alt="" />
      <div class="line"></div> -->
      <h3 class="title">智能运维系统</h3>
      <div class="dot"></div>
    </div>
    <!-- <div class="left"></div> -->
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
    >
      <!-- <img class="vector1" src="@/assets/images/V1.png" alt="" />
      <img class="vector2" src="@/assets/images/V2.png" alt="" />
      <img class="vector3" src="@/assets/images/V3.png" alt="" />
      <img class="vector4" src="@/assets/images/V4.png" alt="" /> -->
      <div class="top-title">登录</div>
      
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          type="text"
          auto-complete="off"
          placeholder="账号"
        >
          <i slot="prefix" class="el-icon-user-solid el-input__icon input-icon" />
          <!-- <svg-icon slot="prefix" icon-class="user" class="iconfont-user el-input__icon input-icon" /> -->
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="text"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter.native="handleLogin"
        >
          <i
            slot="prefix"
            class="el-icon-lock el-input__icon input-icon"
          />
          <!-- <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" /> -->
        </el-input>
      </el-form-item>
      
      <!-- <el-checkbox
        v-model="loginForm.rememberMe"
        style="margin: 0px 0px 25px 0px"
        >记住密码</el-checkbox
      > -->
      <el-form-item style="width: 100%">
        <el-button
          :loading="loading"
          size="medium"
          type="primary"
          class="form-btn"
          @click.native.prevent="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </el-form-item>
      <div class="form-footer">
        <div class="setLine" @click="setLine">
          设置网络
        </div>
        <div class="noLogin" @click="offLine">
          离线使用
        </div>
        
      </div>
      
    </el-form>
    
    </div>
    <config ref="configInfo" ></config>
  </div>
</template>

<script>
import config from "./config";
const os = require('os');
const { execSync } = require('child_process');
export default {
  name: "login",
  components: {
    config,
  },
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
  width: 100vw;
  height: 100vh;
  background: url("../assets/login/bg4.png") center ;
  background-size: 100%;
  overflow: hidden;
  #particles-js {
    position: absolute;
    width: 100%;
    height: 99%;
    padding: 0;
    margin: 0;
    top: 0;
    // bottom: 0;
    left: 0;
    // right: 0;
  }
}
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: rgba(#000,0.4);
  background-size: cover;
  user-select: none;
}
.el-login-header {
  position: absolute;
  top: Hx(90);
  // width: 100%;
  display: flex;
  margin: 0px auto 30px auto;
  // overflow: hidden;
  align-items: center;
  .login-logo{
    // width: 150px;
    height: Hx(60);
  }
  .line{
    height: Hx(40);
    width: Px(2);
    margin: Hx(10) 0 0  Hx(10);
    background: #fff;
  }
  .title{
    font-size: Hx(40);
    font-family: 'SimHei';
    color: #fff;
    // font-weight: 600;
    margin: Hx(10) 0 0 10px;
  }
  .dot{
    position: absolute;
    width: Px(1020);
    height: Px(18);
    bottom: Hx(-20);
    left: 50%;
    transform: translateX(-50%);
    background:  url("../assets/login/line.png") center no-repeat;
    background-size: 100%;
  }
}
.left{
  width: Px(463);
  height: Px(512);
  background: url("../assets/login/left.png") center no-repeat;
  background-size: 100% 100%;
}
.login-form {
  position: relative;
  width: Px(545);
  opacity: 1;
  padding: Hx(118) 40px Hx(40);
  background: url("../assets/login/box.png") center no-repeat;
  background-size: 100% 100%;
  border-radius: Px(16);
  .form-footer{
    display: flex;
    justify-content: space-between;
     .setLine{
      color: #90dd96;
      &:hover{
        color: #01C19A;
        cursor: pointer;
      }
    }
    .noLogin{
      color: #1890ff;
      &:hover{
        color: #01C19A;
        cursor: pointer;
      }
    }
  }
  
  .header-title{
    position: absolute;
    top: -80px;
    left: 50%;
    width: 500px;
    text-align: center;
    transform: translateX(-50%);
    color: #f00;
    font-size: 36px;
    font-weight: 600;
    letter-spacing: 4.5px;
  }
//  &:after {
//       content: "";
//       width: 100%;
//       height: 100%;
//       position: absolute;
//       left: 0;
//       top: 0;
//       /* 从父元素继承 background 属性的设置 */
//       background: inherit;
//       filter: blur(2px);
//       z-index: 2;
//   }
  >>>.el-form-item{
    margin-bottom: Px(22);
  }
  .el-input {
    height: Hx(48) !important;
    >>>.el-input__inner {
      height: Hx(48) !important;
      font-size: Hx(16);
      color: #fff;
      border-color: #87C1FF;
      background: rgba(#fff,0.1)
    }
  }
  >>>.el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #87C1FF;
    border-color: #87C1FF;
  }
  >>>.el-checkbox__label{
    color: #87C1FF;
  }
  .input-icon {
    width: 30px;
    height: Hx(45);
    line-height: Hx(45);
    color: #87C1FF;
    margin: 0 2px;
  }
  .vector1,.vector2,.vector3,.vector4{
    position: absolute;
    width: 67px;
  }
  .vector1{
    top: 0;
    left: 0;
  }
  .vector2{
    top: 0;
    right: 0;
  }
  .vector3{
    bottom: 0;
    right: 0;
  }
  .vector4{
    bottom: 0;
    left: 0;
  }
}
.top-title {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: Px(24);
  font-family: 'SimHei';
  color: #fff;
  font-weight: 600;
  margin: Hx(10) 0 0 0;
}

.form-btn {
  width: 100%;
  height: Px(50);
  opacity: 1;
  border: 0;
  margin-top: Px(25);
  background: linear-gradient(180deg, rgba(47, 103, 161, 0.4) 0%, #2F67A1 100%);
  box-shadow: 0px 2px 6px rgba(208, 243, 254, 0.6);
  border-radius: 8px;

}
.footer{
  position: absolute;
  bottom: 20px;
  width: 100%;
  color: #ccc;
  text-align: center;
  .beian{
    display: inline-block;
    margin-left: 15px;
      &:hover{
      color: #1890ff;
      cursor: pointer;
    }
  }

}

</style>

