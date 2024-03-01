<template>
  <div class="app-container">
    <!--查询条件-->
    <div class="cont-table">
      <el-form :model="queryParams" ref="queryForm" :inline="true" >
          <el-form-item label="关键字" prop="name" >
            <el-input v-model="queryParams.name" placeholder="请输入关键字" size="small" clearable  @keyup.enter.native="search"></el-input>
          </el-form-item>
          <!-- <el-form-item label="场景类型" prop="status">
              <el-select popper-class="select-box" v-model="queryParams.scene_code" placeholder="场景类型" @change="getList" clearable size="small">
              <el-option
                v-for="(item,index) in sceneList"
                :key="index"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item> -->
          <div style="float: right">
              <el-button type="primary" icon="el-icon-search" size="small" @click="search">搜索</el-button>
              <el-button type="primary" icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
              <el-button type="primary" icon="el-icon-refresh" size="small" @click="syncData">拉取数据</el-button>
              <el-button type="primary" icon="el-icon-refresh" size="small" @click="syncTaskData">同步列表</el-button>
              <el-button type="primary" icon="el-icon-refresh" size="small" @click="syncLineData">同步故障</el-button>
              <el-button type="primary" icon="el-icon-refresh" size="small" @click="syncImgData">同步图片</el-button>
          </div>
        </el-form>
        <div style="margin:0 0 20px 0;border-top: 1px #ccc solid;"></div>
        <!--列表-->
    
        <el-table :data=" list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" border highlight-current-row stripe v-loading="loading" 
          >
          <el-table-column align="center" type="index" label="序号" width="60"></el-table-column>
          <el-table-column align="center" prop="taskPlanName" label="任务名称" min-width="110">
            
          </el-table-column>
          <el-table-column align="center" prop="c_time" label="电站名称">
             <template slot-scope="scope">
              <span
                v-text="scope.row.baseCodeName"
                v-if="!scope.row.simpleName"
              ></span>
              <el-tooltip
                v-else
                effect="dark"
                :content="scope.row.baseCodeName"
                placement="top"
              >
                <span v-text="scope.row.simpleName"></span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="planAreaName" label="杆塔名称"></el-table-column>
          <el-table-column align="center" prop="createTime" label="创建时间" min-width="120">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="updateTime" label="更新时间" min-width="120">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.updateTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="statusName" label="线上状态">
            <!-- <template slot-scope="scope">
              <div>
                {{getSceneName(scope.row.scene_code)}}
              </div>
            </template> -->
          </el-table-column>
          <el-table-column align="center" prop="localStatus" label="本地状态">
            <template slot-scope="scope">
              <div>
                {{scope.row.localStatus||'等待上传数据'}}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="150" >
            <template slot-scope="scope">
              <!-- <el-tooltip class="item" effect="dark" content="上传" placement="top"> -->

                <el-button type="text" size='medium' @click="handleUpload(scope.row, scope.$index)" icon="el-icon-upload">上传</el-button>
              <!-- </el-tooltip> -->
              <!-- <el-tooltip class="item" effect="dark" content="标注" placement="top"> -->
                <el-button type="text" size='medium' @click="handleTagging(scope.row)" icon="el-icon-edit-outline">标注</el-button>
                <el-button type="text" size='medium' @click="refreshStatus(scope.row)" icon="el-icon-refresh">更新命名</el-button>
              <!-- </el-tooltip> -->
            </template>
          </el-table-column>
        </el-table>
      
      <div class="pagination">
        <el-pagination 
          popper-class="pagination-box"
           background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[5, 10, 20,40,60]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
      
    </div>
    <line-image ref="line"  v-for="item in list" :key="item.id"  @refresh="getData"></line-image>
    <!-- <line-arr ref="lineList" @refresh="getData" ></line-arr> -->
    <ailabel-add-or-update
    ref="ailabelAddOrUpdate"
    @refresh="getData"
  ></ailabel-add-or-update>
  </div>
</template>

<script>

// import listMixin from '@/api/list'
// import db from '@/api/indexDb'
import lineImage from "./line";
import AilabelAddOrUpdate from "./ailabelAddOrUpdate";
import { uploadMinIo, getBase64 } from "@/api/utils";
// import lineArr from "./lineArr";
// import { addListener, launch } from 'devtools-detector';
// import Datastore from 'nedb'
export default {
  name: "index",
	// mixins: [listMixin],
  components: {
    AilabelAddOrUpdate,
    lineImage,
    // lineArr,
  },
  data() {
    return {
      // methodUrl: 'http://192.168.10.45:9020/',
     	queryParams: {
        page: 1,
        page_size: 10
      },
      currentPage: 1, // 当前页码
      pageSize: 10, // 每页的数据条数
      // userId: sessionStorage.getItem('userId'),
      // userType: sessionStorage.getItem('userType'),
      // apiName: 'api/sys/sys/sysUser/queryPage',
			// delName: 'api/sys/sys/sysUser/deleteList',
      delConfirm: '确定删除该用户？',
			loading: true,
			list: [],
			total: 0,
      isShowEdit: false,
	    isEdit: 0,
      editForm: {},
      sceneList: [],
      tableDb: null,
      listDB: null,
      faultList: [],
      ruleList: [],
      imgList: [],
    };
  },
  created() {

  },

  mounted() {
    // this.listDB = new Datastore({
    //     autoload: true,
    //     filename: "/data/dataList.db"
    // })


    this.getList()
    // this.getDataList()
	},
  methods: {
    refreshStatus(row){
      let that = this
      const loading = this.$loading({
        lock: true,
        text: '更新中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      let ruleObj = that.ruleList.filter(obj => obj.id == row.picRenameModelId);
      let renameList = ruleObj[0].picRenameBasicList
      console.log(ruleObj,renameList,999)
      let index = 0
      renameList.forEach(item => {
        let showName = `${row.loopName}-${row.planAreaName}-${item.picName}`

        that.$db.imgList.where({ taskPlanCode: row.taskPlanCode, picIndex: item.picIndex })
        .modify({ showName: showName });
        index++
         console.log(item.picIndex,showName,9999)
      });
     if(index==renameList.length){
      loading.close();
      that.$message.success("更新成功");
     }
      // this.$db.dataList.update(row.id,{status:1,statusName: '已上传数据'})
    },
   async search(){
    this.currentPage = 1;
      if (this.queryParams.name==''||!this.queryParams.name) {
        this.getList()
      }else{
        try {
        // 使用 Dexie.js 的 where() 方法进行复合查询
          this.list = await this.$db.dataList
            .where('taskPlanName')
            .startsWithIgnoreCase(this.queryParams.name)
            .or('baseCodeName')
            .startsWithIgnoreCase(this.queryParams.name)
            .or('simpleName')
            .startsWithIgnoreCase(this.queryParams.name)
            .or('planAreaName')
            .startsWithIgnoreCase(this.queryParams.name)
            .toArray();
          this.total = this.list.length
        } catch (error) {
          console.error('Error searching for friends by keyword:', error);
        }
      }
      
    },
    syncData(){
       let that = this
        that.loading = true
        that.getType();
        that.getRule();
        that.getDict();
        that.$fetch({
          // formdata 传值方式
          url: "api/inspection/inspection/taskPlan/queryPage",
          method: "post",
          data: {
            page: {
              pageNum: 1,
              pageSize: 100000
            },
            params: {
              baseType: 3,
              // taskPlanName: "测试"
            }
          },
        }).then((data) => {
          if (data && data.status == 200) {
            console.log(data.data.list,111)
            data.data.list.forEach(element => {
                that.$db.dataList.put(element);
            });
            setTimeout(() => {
              that.getList()
              that.$message.success("已同步完全部文件");
              // that.syncTaskData()
              // that.synclineData()
            }, 1000);

          }
        });
    },
    async syncTaskData(){
      let that = this
     
      let filteredArray = that.list.filter(obj => obj.isSync != 1);
       console.log(that.list,filteredArray,111111)
      that.$fetch({
      url: 'api/inspection/inspection/taskPlan/synchronizeData',
      method: 'post',
      data: filteredArray,
      }).then((data) => {
        if (data && data.status == 200) {
          filteredArray.forEach(item => {
            that.$db.dataList.update(item.id,{isSync:1})
          });
           that.$message.success("已同步完列表111");
           that.$nextTick(()=>{
            that.getData()
          })
           
        }
      });
    },
    async syncLineData(){
      let that = this
      let filteredArray = that.faultList.filter(obj => obj.isSync != 1);
      console.log(that.faultList,filteredArray,11)
      that.$fetch({
      url: 'api/inspection/inspection/lineController/synchronizeData',
      method: 'post',
      data: filteredArray,
      }).then((data) => {
        if (data && data.status == 200) {
          filteredArray.forEach(item => {
            that.$db.faultList.update(item.fileName,{isSync:1})
          });
          that.$nextTick(()=>{
            that.getData()
          })
           that.$message.success("已同步完塔线故障222");
        }
      });
    },
   async syncImgData(){
      let that = this
      let filteredArray = that.imgList.filter(obj => obj.isSync != 1);
      filteredArray.forEach(item => {
        let url = item.imgUrl
        getBase64(url).then(data=>{
          uploadMinIo('line',item.fileName,data).then(res=>{
            that.$db.imgList.update(item.fileName,{isSync:1})
            console.log(item.name+'上传成功！')
          })
        })
      });
      that.$nextTick(()=>{
        that.$message.success("已同步完图片");
      })
      console.log(that.imgList,filteredArray,11)
    },
    getType(){
      let that = this
        that.$zklffetch({
          url: "/public/api/v1/error_type_dict/",
          method: "get",
          params: {type_code:'tl'},
        }).then((data) => {
          // if (data && data.code == 1000) {
            console.log(data,33)
            data.error_type_list.forEach(element => {
                that.$db.typeList.put(element);
            });
          // }
        });
    },
    getDict(){
      let that = this
      that.$fetch({
        url: 'api/sys/sys/sysDic/queryList',
        method: 'post',
          data: {
              dicName: '塔线故障父类'
          },
      }).then((data) => {
        if (data && data.status == 200) {
          data.data.forEach(element => {
              that.$db.lineList.put(element);
          });
        }
      });
    },
    getRule(){
      let that = this
      that.$fetch({
        url: "api/inspection/inspection/picRenameController/queryPageModel",
        method: "post",
        data: {
          page: {
            pageNum: 1,
            pageSize: 1000
          },
          params: {}
        },
      }).then((data) => {
        if (data && data.status == 200) {
          data.data.list.forEach(element => {
              that.$db.ruleList.put(element);
          });
        }
      });
    },
   async  getList(){
      let that = this
      this.currentPage = 1;
      that.loading = true
      that.faultList = await that.$db.faultList.toArray()
      that.ruleList = await that.$db.ruleList.toArray()
      that.imgList = await that.$db.imgList.toArray()
      let data = await that.$db.dataList.toArray()
      data.sort((a, b) => {
            return b.updateTime - a.updateTime ;
          });
      // that.$dataList.find({}, function (err, data) {
         that.loading = false
         console.log(data,2222)
         that.list = data
         that.total = data.length
      // });
        console.log(that.faultList,11)
      
    },
    getData(){
      this.currentPage = 1;
      this.getList();
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
      this.currentPage = 1;
      this.pageSize = val;
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.currentPage = val;
    },
    
    // handleSizeChange(val) {
    //   this.queryParams.page_size= val;
    //   this.getList();
    // },
    // handleCurrentChange(val) {
    //   this.queryParams.page = val;
    //   this.getList();
    // },
    resetQuery() {
      this.queryParams = {
        page: 1,
        page_size: 10
      },

      this.getList();
    },
    handleUpload(row, index) {
      this.$nextTick(() => {
        this.$refs['line'][index].init(row);
      });
    },
    handleTagging(row) {
      this.$nextTick(() => {
        this.$refs.ailabelAddOrUpdate.init(row);
      });
    },
   
	},
	
};
</script>
<style lang="scss" scoped>
.pagination{
  margin: 10px;
  float: right;
}

</style>
