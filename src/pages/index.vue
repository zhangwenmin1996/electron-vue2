<template>
  <div class="app-container">
    <!--查询条件-->
    <div class="cont-table">
      <el-form :model="queryParams" ref="queryForm" :inline="true" >
          <el-form-item label="关键字" prop="name" >
            <el-input v-model="queryParams.name" placeholder="请输入计划或电站名称" size="small" clearable  @keyup.enter.native="search"></el-input>
          </el-form-item>
          <el-form-item label="任务时间">
            <el-date-picker
              v-model="startTime"
              type="datetimerange"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              align="right"
              value-format="yyyy-MM-dd HH:mm:ss"
              size="small"
              @change="changeTime"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="计划状态">
            <el-select
              popper-class="select-box"
              v-model="queryParams.planStatusName"
              placeholder="请选择计划状态"
              clearable
              filterable
              size="small"
              @change="changePlanStatus"
            >
              <el-option
                v-for="(item, index) in ['全部','执行中','已完成']"
                :key="index"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item >
              <el-button type="primary" icon="el-icon-search" size="small" @click="search">搜索</el-button>
              <el-button type="primary" icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
              <el-button type="primary" size="small" @click="logOut">返回首页</el-button>
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
           <br/>
          <el-form-item >
              
              <el-button type="primary" icon="el-icon-plus" size="small" @click="showEdit(0)">新增计划</el-button>
              <!-- <el-button type="primary" icon="el-icon-refresh" size="small" @click="syncData">拉取数据</el-button> -->
              <el-button type="primary" icon="el-icon-delete" size="small" @click="delData">清空数据</el-button>
              <el-button type="primary" icon="el-icon-plus" size="small" @click="showEdit(0)">批量上传计划</el-button>
              <!-- <el-button type="primary" icon="el-icon-refresh" size="small" @click="syncTaskData">同步列表</el-button>
              <el-button type="primary" icon="el-icon-refresh" size="small" @click="syncLineData">同步故障</el-button>
              <el-button type="primary" icon="el-icon-refresh" size="small" @click="syncImgData">同步图片</el-button> -->
            </el-form-item>
        </el-form>
        <div style="margin:0 0 20px 0;border-top: 1px #ccc solid;"></div>
        <!--列表-->
        <el-table
        :data="planList.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
        border
        highlight-current-row
        stripe
        v-loading="planLoading"
        :row-key="getRowKeys" 
        :expand-row-keys="expands" 
        @expand-change="handleExpand"
        @row-click="eSelect"
      >
        <el-table-column type="expand">
          <template>
            <el-table :data="list.slice((currentPage2 - 1) * pageSize2, currentPage2 * pageSize2)" border highlight-current-row stripe v-loading="loading" 
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
              <el-table-column align="center" prop="loopName" label="回路名称"></el-table-column>
              <el-table-column align="center" prop="planAreaName" label="杆塔名称"></el-table-column>
              <el-table-column align="center" prop="createTime" label="创建时间" min-width="120">
                <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
              </el-table-column>
              <!-- <el-table-column align="center" prop="updateTime" label="更新时间" min-width="120">
                <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.updateTime) }}</span>
                </template>
              </el-table-column> -->
              <!-- <el-table-column align="center" prop="statusName" label="线上状态">
                
              </el-table-column> -->
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
                    <el-button type="text" size='medium' @click="deleteItems(scope.row,1)" icon="el-icon-delete">删除</el-button>
                    <!-- <el-button type="text" size='medium' @click="refreshStatus(scope.row)" icon="el-icon-refresh">更新命名</el-button> -->
                  <!-- </el-tooltip> -->
                </template>
              </el-table-column>
            </el-table>
          
          <div class="pagination">
            <el-pagination 
              popper-class="pagination-box"
              background
              @size-change="handleSizeChange2"
              @current-change="handleCurrentChange2"
              :current-page="currentPage2"
              :page-sizes="[1,5, 10, 20,40,60]"
              :page-size="pageSize2"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total2"
            ></el-pagination>
          </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          type="index"
          label="序号"
          width="60"
        ></el-table-column>
        <el-table-column
          align="left"
          prop=""
          label="计划时间"
          width="120"
        >
          <template slot-scope="scope">
            <span>|- {{ scope.row.startTime }}</span
            ><br />
            <span>|- {{ scope.row.endTime }}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="planName"
          label="计划名称"
          min-width="210"
        ></el-table-column>
        <el-table-column
          align="center"
          prop="baseCodeName"
          label="电站名称"
          min-width="160"
        >
        
        </el-table-column>
        
        <el-table-column align="center" label="操作" width="240">
        <template slot-scope="scope">
          <el-button
           type="text" size='medium'
           @click.stop="eSelect(scope.row)"
            >查看详情</el-button
          >
          <el-button
           type="text" size='medium'
           :loading="scope.row.btnLoading"
           @click.stop="report(scope.row)"
            >{{scope.row.docxUrl?'重新生成':'生成报告'}}</el-button>
          <el-button
           type="text" size='medium'
           v-if="scope.row.docxUrl"
           @click.stop="reportSee(scope.row)"
            >查看报告</el-button
          >
          <el-button
           type="text" size='medium'
     
           @click.stop="uploadTaskArray(scope.row,scope.$index)"
            >批量上传</el-button
          >
          <el-button
           type="text" size='medium'
     
           @click.stop="deleteItems(scope.row,2)"
            >删除</el-button
          >
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
    <el-dialog
      :close-on-click-modal="false"
      :title=" isEdit ? '修改' : '新增'"
      :visible.sync="isShowEdit"
      v-if="isShowEdit"
      center
      custom-class="box-dialog"
      :modal-append-to-body="false"
      width="600px"
    >
      <line-edit @save-ok="editOk" :data="editForm" :isEdit="isEdit"></line-edit>
    </el-dialog>
    <line-image ref="line"  v-for="item in list" :key="item.id"  @refresh="getDataList"></line-image>
    <line-arr ref="lineList"  v-for="(item,index) in planList" :key="index"  @refresh="getDataList" ></line-arr>
    <ailabel-add-or-update
    ref="ailabelAddOrUpdate"
    @refresh="getDataList"
  ></ailabel-add-or-update>
  </div>
</template>

<script>

// import listMixin from '@/api/list'
import { ipcRenderer } from 'electron';
import fs from 'fs';
const path = require('path');
const { exec } = require('child_process');
import lineImage from "./line";
import lineEdit from "./line-edit";
import AilabelAddOrUpdate from "./ailabelAddOrUpdate";
import { uploadMinIo, getBase64 } from "@/api/utils";
import { json } from 'stream/consumers';
import lineArr from "./lineArr";
// import { addListener, launch } from 'devtools-detector';
// import Datastore from 'nedb'
export default {
  name: "index",
	// mixins: [listMixin],
  components: {
    AilabelAddOrUpdate,
    lineImage,
    lineArr,
    lineEdit,
  },
  data() {
    return {
      // methodUrl: 'http://192.168.10.45:9020/',
     	queryParams: {
        page: 1,
        page_size: 10,
        name: '',
        planStatusName: '',
      },
      currentPage: 1, // 当前页码
      pageSize: 10, // 每页的数据条数
      currentPage2: 1, // 当前页码
      pageSize2: 5, // 每页的数据条数
      total2: 0,
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
      planList: [],
      planLoading: false,
      isExpands: false,
      expands: [],
      getRowKeys: (row) => {
        return row.planCode  
      },
      jsonDir: null,
      imgDir: null,
      docxList: null,
      allList: [],
      startTime: null,
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一年",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
    };
  },
  created() {
    this.$db.open();
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
    async deleteItems(row,index) {
      let that = this
      console.log(row.planCode,1111)
      that.$confirm("此操作将永久删该数据，不可恢复, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        if(index==1){
          try {
            that.$db.dataList
                  .where('taskPlanCode')
                  .startsWithIgnoreCase(row.taskPlanCode)
                  .delete();
                  that.getDataList(row)
                  that.$message.success('删除成功')
          } catch (error) {
              console.error('Failed to delete items:', error);
          }
        }else{
          try {
            
            that.$db.planList
                  .where('planCode')
                  .startsWithIgnoreCase(row.planCode)
                  .delete();
                  that.getList()
                  that.$message.success('删除成功')
          } catch (error) {
              console.error('Failed to delete items:', error);
          }
        }
        
      }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
       
    },

    eSelect(row){
      // this.type = row.baseType
      if (!this.isExpands) { 
        this.expands = []
        if (row) {
          this.expands.push(row.planCode)
          this.getDataList(row)
        }
      } else { 
        this.loading = true
        this.expands = []
      }
      this.isExpands = !this.isExpands
     },
    handleExpand(row,rowList){
      console.log(row,rowList,1111)
      if (rowList.length) { 
        this.expands = []
        if (row) {
          this.isExpands = true
          this.expands.push(row.planCode)
          this.getDataList(row)
        }
      } else { 
        this.loading = true
        this.isExpands = false
        this.expands = []
      }
    },
    async report(row){
      let that = this
      that.$set(row,'btnLoading',true)
      let list = await this.$db.dataList.where('planCode').startsWithIgnoreCase(row.planCode).toArray()
      let arr = []
      const data = {
        planName: row.planName,
        planCode: row.planCode,
        companyName: row.companyName,
        simpleName: row.simpleName,
        baseCodeName: row.baseCodeName,
        loopName: null,
        startTime: row.startTime,
        responsibleName: row.responsibleName,
        targetPath: `${that.imgDir}/`,
        taskList: [],
      };
      if(list.length>0){
        var obj = {};
        list.forEach(async (item) => {
          let faultList = await that.$db.faultList.where('taskId').startsWithIgnoreCase(item.taskPlanCode).toArray()
          data.loopName = item.loopName,
          faultList.forEach(element => {
            let arr2 = JSON.parse(element.faultList)
            let arr3 = [...arr2]
            arr3.forEach(row => {
              let { planAreaName } = row;
              if (!obj[planAreaName]) {
                obj[planAreaName] = {
                  planAreaName: row.planAreaName,
                  faultList: [],
                };
              }
               obj[planAreaName].faultList.push(row);
            });
            arr = Object.values(obj);
            arr.taskList.sort((a, b) => {
                return a.planAreaName.localeCompare(b.planAreaName);
            });
            console.log(arr3,arr,2222)
          });
       
        });
      }
      const exePath = '../static/main.exe';
      const docxPath = '../static/template_line_m30t.docx';
     const publicExePath = process.env.NODE_ENV== 'development'? "E:/web/electron-vue2/src/static/main.exe":  path.join(__dirname, exePath);
     const publicDocxPath =process.env.NODE_ENV== 'development'? "E:/web/electron-vue2/src/static/template_line_m30t.docx": path.join(__dirname, docxPath);

      console.log('文件夹:',process.env.NODE_ENV,publicExePath,publicDocxPath);
     setTimeout(() => {
        data.taskList = arr
        const jsonData = JSON.stringify(data, null, 2);
       const folderPath = `${that.jsonDir}/${row.planCode}`; // 你的文件夹路径
      // 确保文件夹存在，如果不存在则创建
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      // 指定保存的文件路径
      const filePath = path.join(folderPath, `${row.planCode}.json`);
      // 将 JSON 字符串写入文件
      fs.writeFileSync(filePath, jsonData);
      console.log('JSON 文件已保存到:', filePath);
      console.log(data,3333)
      const exeUrl = publicExePath
      const docxUrl = publicDocxPath
      const docxPathUrl = path.join(that.docxList, `${data.simpleName}${data.loopName}无人机输电线路巡检报告_${that.parseTime(new Date().getTime(),'{y}{m}{d}{h}{i}{s}')}.docx`);
      // const docxPathUrl = path.join(that.docxList, `${data.simpleName}${data.loopName}无人机输电线路巡检报告.docx`);
      // const cmd = `E:\\web\\electron-vue2\\dist\\main.exe ${filePath} E:\\docxList E:\\web\\electron-vue2\\dist\\template_line_m30t.docx`;
      const cmd = `${exeUrl} ${filePath} ${docxPathUrl} ${docxUrl}`;
      console.log(cmd,333)
      that.$message.success('报告正在生成，请稍等...')
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error('执行命令出错:', error);
          that.$set(row,'btnLoading',false)
          that.$alert(`报告生成出错:${error}`)
          return;
        }else{
          let id = row.planCode
          that.$db.planList.update(id,{docxUrl: docxPathUrl})
          that.$set(row,'btnLoading',false)
          that.$set(row,'docxUrl',docxPathUrl)
            that.$alert(`报告本地路径: ${docxPathUrl}`, '报告生成成功，是否直接打开？', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              let openCmd = `start ${docxPathUrl}`
             exec(openCmd, (error, stdout, stderr) => {

             })
            }).catch(() => {
              that.$message({
                  type: 'info',
                  message: '已取消'
                });          
              });
            // that.$message.success('报告生成成功！')
           
        }
        
        console.log('命令输出:', stdout);
      });
     }, 1000);
      // 指定保存的文件夹路径
     
      
    },
    reportSee(row){
      let that = this
      let openCmd = `start ${row.docxUrl}`
      that.$alert(`报告本地路径: ${row.docxUrl}`, '报告已生成，是否直接打开？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        exec(openCmd, (error, stdout, stderr) => {

        })
      }).catch(() => {
               
      });
     
    },
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
    filterObjectsByKeywordAndTime(array, keyword, planStatus, startTime, endTime) {
        // 使用 filter 方法筛选数组
        return array.filter(obj => {
            let keywordCondition = true; // 默认关键字条件为 true
            let timeCondition = true;    // 默认时间条件为 true
            let planStatusList = true
            // 如果关键字不为空，则检查关键字条件
            if (keyword) {
                keywordCondition = obj.planName.toLowerCase().includes(keyword.toLowerCase()) ||
                obj.baseCodeName.toLowerCase().includes(keyword.toLowerCase()) ||
                obj.planAreaName.toLowerCase().includes(keyword.toLowerCase());
            }
            if (planStatus&&planStatus!='全部') {
              planStatusList = obj.planStatusName.toLowerCase().includes(planStatus.toLowerCase())
            }

            // 如果开始时间和结束时间都不为空，则检查时间条件
            if (startTime && endTime) {
                timeCondition = obj.startTime >= startTime && obj.endTime <= endTime;
            }

            // 返回同时满足关键字条件和时间条件的对象
            return keywordCondition && timeCondition && planStatusList;
        });
    },

   async search(){
    this.currentPage = 1;
      // if (this.queryParams.name==''||!this.queryParams.name) {
      //   this.getList()
      // }else{
        this.planLoading = true
        this.planList = this.filterObjectsByKeywordAndTime(this.allList,this.queryParams.name,this.queryParams.planStatusName,this.queryParams.startTime,this.queryParams.endTime)
        console.log(this.queryParams,this.planList,6663)
        this.total = this.planList.length
        setTimeout(() => {
          this.planLoading = false
        }, 200);
        
        // try {
        // // 使用 Dexie.js 的 where() 方法进行复合查询
        //   // this.list = await this.$db.dataList
        //   //   .where('taskPlanName')
        //   //   .startsWithIgnoreCase(this.queryParams.name)
        //   //   .or('baseCodeName')
        //   //   .startsWithIgnoreCase(this.queryParams.name)
        //   //   .or('simpleName')
        //   //   .startsWithIgnoreCase(this.queryParams.name)
        //   //   .or('planAreaName')
        //   //   .startsWithIgnoreCase(this.queryParams.name)
        //   //   .toArray();
          
        //   // this.planList = await this.$db.planList
        //   //   .where('planName')
        //   //   .startsWithIgnoreCase(this.queryParams.name)
        //   //   .or('baseCodeName')
        //   //   .startsWithIgnoreCase(this.queryParams.name)
        //   //   .or('planAreaName')
        //   //   .startsWithIgnoreCase(this.queryParams.name).toArray()
            
        //     console.log(this.planList,336)
        //   this.total = this.planList.length
        // } catch (error) {
        //   console.error('Error searching for friends by keyword:', error);
        // }
      // }
      
    },
    changeTime(val) {
      if (val) {
        this.queryParams.startTime = val[0];
        this.queryParams.endTime = val[1];
      } else {
        this.queryParams.startTime = "";
        this.queryParams.endTime = "";
      }
      this.planList = this.filterObjectsByKeywordAndTime(this.allList,this.queryParams.name,this.queryParams.planStatusName,this.queryParams.startTime,this.queryParams.endTime)
      this.total = this.planList.length
    },
    async changePlanStatus(val){
      console.log(val,1111)
        this.planList = this.filterObjectsByKeywordAndTime(this.allList,this.queryParams.name,val,this.queryParams.startTime,this.queryParams.endTime)
        this.total = this.planList.length
    },
    async getDataList(row){
      this.loading = true
      let data = await this.$db.dataList.where('planCode').startsWithIgnoreCase(row.planCode).toArray()
      this.list = data
      setTimeout(() => {
        this.loading = false
      }, 200);
      this.total2 = data.length
      console.log(data);
    },
    async uploadTaskArray(row,index){
      let that = this;
      let data = await this.$db.dataList.where('planCode').startsWithIgnoreCase(row.planCode).toArray()
      that.$refs['lineList'][index].init(row,data);
    },
    getPlan(){
      let that = this
       that.$fetch({
          // formdata 传值方式
          url: "api/inspection/inspection/planBase/queryPage",
          method: "post",
          data: {
            page: {
              pageNum: 1,
              pageSize: 100000
            },
            params: {
              baseType: 3,
            }
          },
        }).then((data) => {
          if (data && data.status == 200) {
            console.log(data.data.list,111)
            data.data.list.forEach(element => {
                that.$db.planList.put(element);
            });
          }
        });
    },
    syncData(){
       let that = this
        that.loading = true
        that.getType();
        that.getRule();
        that.getPlan()
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
    delData(){
      this.$db.delete();
      this.$db.open();
      this.resetQuery()
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
    showEdit(isEdit) {
      this.isEdit = isEdit;
      this.isShowEdit = true;
      this.editForm = {
        companyName: '中广核新能源湖北分公司'
      };
    },
    editOk() {
      this.isShowEdit = false;
      this.getList();
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
      ipcRenderer.send('get-app-path');
      // 监听主进程的回复
      ipcRenderer.on('app-path', (event, appPath) => {
        const diskLocation = path.parse(appPath).root;

        console.log('应用所在磁盘位置:', diskLocation);
        const normalPath = diskLocation.replace(/\\/g, '/');
        localStorage.setItem('appPath',normalPath)
        console.log('应用路径:', appPath,normalPath);
        // 在这里你可以使用appPath变量，例如创建子文件夹
        const imgDir = path.join(diskLocation, 'imgPath');
        const jsonDir = path.join(diskLocation, 'json');
        const docxDir = path.join(diskLocation, 'docxList');

        // 检查并创建子文件夹
        if (!fs.existsSync(imgDir)) {
          fs.mkdirSync(imgDir);
        }
        if (!fs.existsSync(jsonDir)) {
          fs.mkdirSync(jsonDir);
        }
        if (!fs.existsSync(docxDir)) {
          fs.mkdirSync(docxDir);
        }
        const imgPath = imgDir.replace(/\\/g, '/');
        localStorage.setItem('imgPath',imgPath)
        that.imgDir = imgPath
        const jsonPath = jsonDir.replace(/\\/g, '/');
        that.jsonDir = jsonPath
      
        that.docxList = docxDir
        console.log('应用路径2:', jsonPath,imgPath,docxDir);
      });
      
      this.currentPage = 1;
      that.planLoading = true
      
      let data = await that.$db.planList.toArray()
      data.sort((a, b) => {
            return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime() ;
          });
      // that.$dataList.find({}, function (err, data) {
         that.planLoading = false
         console.log(data,2222)
         that.allList = data
         that.planList = data
         that.total = data.length
      // });
      that.faultList = await that.$db.faultList.toArray()
      that.ruleList = await that.$db.ruleList.toArray()
      that.imgList = await that.$db.imgList.toArray()
        console.log(that.faultList,11)
      
    },
    getData(){
      this.currentPage = 1;
      this.getList();
    },
    logOut(){
      sessionStorage.clear()
      this.$router.push("/")
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
    handleSizeChange2(val) {
      console.log(`每页 ${val} 条`);
      this.loading = true
      this.currentPage2 = 1;
      this.pageSize2 = val;
      this.loading = false
    },
    handleCurrentChange2(val) {
      this.loading = true
      console.log(`当前页: ${val}`);
      this.currentPage2 = val;
      this.loading = false
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
       window.location.reload();
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
<style >
.el-table__expanded-cell[class*=cell] {
    padding: 20px !important;
}
</style>
