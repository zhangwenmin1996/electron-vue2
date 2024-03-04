<template>
  <div class="solar-box">
    <el-dialog :close-on-click-modal="false" title="配置列表" :visible.sync="visible" v-if="visible" center width="700px">
    <el-form :model="queryForm" ref="queryForm" :inline="true">
      <el-form-item prop="name">
        <!-- <el-input v-model="queryForm.name" type="text" placeholder="请选择配置名称" size="small" clearable></el-input> -->
        <el-select
          v-model="queryForm.name"
          filterable
          placeholder="请选择配置名称"
          size="small"
          clearable
          @change="filterList"
        >
          <el-option
            v-for="(item, index) in comList"
            :key="index"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <div style="float: right">
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            size="mini"
            @click="filterList"
            >搜索</el-button
          >
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
            >重置</el-button
          >
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="addEdit">新增</el-button>
        </el-form-item>
      </div>
    </el-form>
    
    <!--列表-->
    <el-table
      :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
      border
      highlight-current-row
      stripe
      v-loading="loading"
    >
      <el-table-column
        align="center"
        type="index"
        label="序号"
        width="60"
      ></el-table-column>
      <el-table-column
        align="center"
        prop="name"
        label="配置名称"
        sortable
      >
      <template slot-scope="scope">
        <div><span class="in" v-if="configId==scope.row.id">★★ </span> {{scope.row.name}} <span class="in" v-if="configId==scope.row.id"> ★★</span> </div>
      </template>
        
      </el-table-column>
      <!-- <el-table-column
        align="center"
        prop="create_user"
        label="创建人"
        sortable
      ></el-table-column> -->
    
      <el-table-column align="center" label="操作" width="240">
        <template slot-scope="scope">
          <span
            ><el-button
              type="text"
              size="medium"
              
              @click="setConfig(scope.row)"
              >使用此配置</el-button
            ></span
          >
          <!-- <span
            ><el-button
              type="text"
              size="medium"
              @click="updataEdit(scope.row)"
              >修改</el-button
            ></span
          >
          <span
            ><el-button
              type="text"
              size="medium"
              @click="deleteEdit(scope.row.id)"
              >删除</el-button
            ></span
          > -->
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[1, 5, 10, 20]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>
    <el-dialog :close-on-click-modal="false" :title="(isEdit?'修改':'新增')+'配置文件'" append-to-body :visible.sync="isShow" center width="700px">
      <el-button class="btnConfig" size="mini" type="primary" @click="defaultConfig">默认配置</el-button>
      <el-form :model="editForm" label-width="180px" ref="editForm" class="form">
        <el-form-item label="配置名称" prop="name" :rules="[{ required: true, message: '请输入配置名称', trigger: 'blur' }]">
          <el-input v-model="editForm.name" placeholder="请输入配置名称" size="small" clearable></el-input>
        </el-form-item>
        <el-form-item label="java接口(baseURL)">
          <el-input v-model="editForm.baseURL" placeholder="请输入地址" size="small" clearable></el-input>
        </el-form-item>
        <el-form-item label="python接口(baseURL2)">
          <el-input v-model="editForm.baseURL2" placeholder="请输入地址" size="small" clearable></el-input>
        </el-form-item>
        <el-form-item label="vnc地址(vncURL)">
          <el-input v-model="editForm.vncURL" placeholder="请输入地址" size="small" clearable></el-input>
        </el-form-item>
        <el-form-item label="minio地址(baseURLDB)">
          <el-input v-model="editForm.baseURLDB" placeholder="请输入地址" size="small" clearable></el-input>
        </el-form-item>
        <el-form-item label="minio是否Https(useSSL)">
           <el-radio-group v-model="editForm.useSSL">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="minio端口(portDB)" v-if="!editForm.useSSL">
          <el-input type="number" v-model="editForm.portDB" placeholder="请输入地址" size="small" clearable></el-input>
        </el-form-item>
        <el-form-item label="minio账户(accessKey)">
          <el-input v-model="editForm.accessKey" placeholder="请输入地址" size="small" clearable></el-input>
        </el-form-item>
        <el-form-item label="minio密码(secretKey)">
          <el-input v-model="editForm.secretKey" placeholder="请输入地址" size="small" clearable></el-input>
        </el-form-item>
        <el-form-item label="地图地址(mapURL)">
          <el-input v-model="editForm.mapURL" placeholder="请输入地址" size="small" clearable></el-input>
        </el-form-item>
        <el-form-item label="websocket地址(wsURL)">
          <el-input v-model="editForm.wsURL" placeholder="请输入地址" size="small" clearable></el-input>
        </el-form-item>
        <el-form-item label="推流地址(rtmpURL)">
          <el-input v-model="editForm.rtmpURL" placeholder="请输入地址" size="small" clearable></el-input>
        </el-form-item>
        <el-form-item label="是否需要验证(isRule)">
           <el-radio-group v-model="editForm.isRule">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否显示LOGO(isLogo)">
           <el-radio-group v-model="editForm.isLogo">
            <el-radio :label="true">不显示</el-radio>
            <el-radio :label="false">显示</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button class="btn2" @click.native="isShow=false">取消</el-button>
      <el-button class="btn2" type="primary" @click.native="editSubmit">确定</el-button>
    </div>
    </el-dialog>
    </el-dialog>
  </div>
</template>
 
<script>
export default {
  name: "config",
  data() {
    return {
      isShow: false,
      visible: false,
      editForm: {},
      queryParams: {
        page: 0,
        size: 10,
      },
      currentPage: 1, // 当前页码
      pageSize: 10, // 每页的数据条数
      loading: true,
      list: [],
      total: 0,
      queryForm: {
        type:2,
      },
      dataList: [],
      comList: [],
      fileList: [],
      isEdit: 0,
      editId: '',
      configId: localStorage.getItem('configId')
    };
  },
  computed: {
     
  },
  mounted() {
    // this.getList()
  },
  //方法集合
  methods: {
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
      this.currentPage = 1;
      this.pageSize = val;
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.currentPage = val;
    },
    resetQuery() {
      this.queryParams ={
        page: 0,
        size: 10,
      }
      this.currentPage = 1;
      this.getList();
    },
    filterList() {
      this.currentPage = 1;
      this.list = JSON.parse(JSON.stringify(this.dataList));
      if (this.queryForm.name) {
        this.list = this.list.filter((element) => {
          return element.name.indexOf(this.queryForm.name) !== -1;
        });
      }
      this.total = this.list.length;
    },
    getList() {
      //   setTimeout(() => {

      //   }, 1000);
      this.$fetch({
        url: "http://api1.zklf-tech.com/api/inspection/inspection/webConfigController/queryList",
        method: "post",
        data: {
          type: 2
        },
      })
        .then((res) => {
           if (res && res.status === 200) {
            this.list = res.data;
            this.dataList = JSON.parse(JSON.stringify(this.list));
            this.comList = this.list.map(element => {
              return element.name
            });
             this.comList = [...new Set(this.comList)];
            this.total = this.list.length;
           }
          this.loading = false;
        })
        .catch((error) => {
          console.log(error);
          this.loading = false;
        });
    },
    updataEdit(row) {
      this.isEdit = 1
      this.isShow = true
      this.editId = row.id
      this.editForm =JSON.parse(row.content) 
    },
    addEdit() {
      this.isEdit = 0
      this.isShow = true
      this.editId = null;
      this.editForm = {}
    },
    deleteEdit(id) {
      this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
          this.$fetch({
            url: "http://api1.zklf-tech.com/api/inspection/inspection/webConfigController/update",
            method: "post",
            data: {
              id: id,
              isDelete: 1
            },
          })
            .then((data) => {
               this.$message.success('删除成功！')
              this.getList();
              this.loading = false;
            })
            .catch((error) => {
              console.log(error);
              this.loading = false;
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    init(){
      this.getList()
      this.visible = true
      // if(localStorage.getItem('config')){
      //   let config = JSON.parse(localStorage.getItem('config'))
      //   this.editForm =  config
      // }else{
      //   this.editForm =  window.HadonSettings
      // }
    },
    add(obj){
      let that = this
      that.$fetch({
        url: "http://api1.zklf-tech.com/api/inspection/inspection/webConfigController/insert",
        method: "post",
        data: obj,
      }).then((data) => {
        if (data && data.status == 200) {
           this.$message.success('操作成功！')
           this.isShow =false;
           this.getList()
        }
      });
    },
    update(obj){
      let that = this
      that.$fetch({
        url: "api/inspection/inspection/webConfigController/update",
        method: "post",
        data: obj,
      }).then((data) => {
          this.$message.success('操作成功！')
          this.isShow =false;
           this.getList();
      });
    },
    editSubmit(){
      if(this.editForm.portDB){
        this.editForm.portDB = parseInt(this.editForm.portDB)
      }
      let obj = {
        name: this.editForm.name,
        content: JSON.stringify(this.editForm),
        type:2,
      }
      if(this.isEdit){
        obj.id = this.editId
        this.update(obj)
      }else{
        this.add(obj)
      }
    },
    defaultConfig(){
      this.editForm = window.HadonSettings
    },
    setConfig(row){
      localStorage.clear()
      localStorage.setItem('config',row.content)
      localStorage.setItem('configId',row.id)
      window.HadonSettings = JSON.parse(row.content) 
      this.visible = false
      setTimeout(() => {
        location.reload();
      }, 100);
    },
  },
};
</script>
 
<style lang="scss" scoped>
.btnConfig{
  position: absolute;
  right: 20px;
}
.form{
  margin-top: 50px;
}
.in{
  color: #1890ff;
  font-size: 20px;
}
</style>
