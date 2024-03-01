<template>
<div class="box">
  <div class="login">
    <!-- <div class="el-login-header">
      <img class="login-logo" src="@/assets/logo/logo3.png" alt="" />
    </div> -->
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
      <div class="top-title">
        <h3 class="title">新能源运营管理系统</h3>
      </div>
      
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          type="text"
          auto-complete="off"
          placeholder="账号"
        >
          <i slot="prefix" class="iconfont-user el-input__icon input-icon" />
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
            class="iconfont-password el-input__icon input-icon"
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
    </el-form>
    </div>
  </div>
</template>

<script>

export default {
  name: "login",
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
    this.getCookie();
    // this.getIp();
  },
  methods: {
    getIp() {
      this.$fetch({
          url: 'https://www.ip.cn/api/index?ip&type=0',
          method: "get",
        }).then((data) => {
          console.log(data)
          this.loginForm.ip = data.ip
        })
    },
   
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
                sessionStorage.setItem("refreshToken", data.data.refreshToken)
                that.loading = false;
                // store
                 that.$router.push("/").catch(() => {
                  that.$message.success("登录成功！");
                });
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
  background: url("../assets/bg.png") center;
  background-size: cover;
}
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: rgba(#000,0.4);
  background-size: cover;
}
.el-login-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: Hx(80);
  opacity: 1;
  background: linear-gradient(135deg, #3f3f3f, rgba(63, 63, 63, 0));
  .login-logo {
    height: 100%;
    margin-left: Px(160);
  }
}
.login-form {
  position: relative;
  width: 464px;
  min-height: 260px;
  opacity: 1;
  padding: Hx(28) 40px Hx(48);
  background: rgba(255, 255, 255, 0.23);
  border-radius: Px(2);
  box-shadow: 0px 0px 20px 0px rgba(255, 255, 255, 0.3) inset;
  .el-input {
    height: 48px !important;
    >>>.el-input__inner {
      height: 48px !important;
      font-size: 16px;
      color: #fff;
      background: rgba(#fff,0.1)
    }
  }
  >>>.el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #01C19A;
    border-color: #01C19A;
  }
  >>>.el-checkbox__label{
    color: #01C19A;
  }
  .input-icon {
    height: 48px;
    width: 30px;
    color: #01C19A;
    line-height: 48px;
    margin-left: 2px;
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
  display: flex;
  margin: 0px auto 30px auto;
  align-items: center;
  justify-content: center;
  .login-logo{
    width: 150px;
    // height: Hx(80);
  }
  .line{
    height: Hx(30);
    width: 2px;
    margin: 10px 0 0  Hx(10);
    background: #fff;
  }
  .title{
    font-size: 23px;
    font-family: 'SimHei';
    color: #01c19a;
    font-weight: 600;
    margin: Hx(10) 0 0 10px;
  }
}

.form-btn {
  width: 100%;
  height: 44px;
  opacity: 1;
  border: 0;
  background: linear-gradient(180deg,#01c19a, #008e71 100%);
  border-radius: 8px;
  box-shadow: 0px 0px 20px 0px rgba(255,255,255,0.30) inset, 0px 4px 8px 0px rgba(89,255,221,0.60) inset, 0px 4px 6px 0px rgba(0,34,27,0.60); 

}


</style>