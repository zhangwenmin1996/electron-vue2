<template>
  <div class="cacheImage-box">
    <el-dialog
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="visible"
      center
      :modal-append-to-body="false"
      width="700px"
    >
      <uploader
        ref="uploader"
        :options="options"
        :autoStart="false"
        @files-added="onFilesAdded"
        @file-added="onFileAdded"
        @file-success="onFileSuccess"
        @file-complete="onFileComplete"
        @file-progress="onFileProgress"
        @file-error="onFileError"
        class="uploader-app"
      >
        <!-- <uploader-unsupport></uploader-unsupport> -->

        <!-- <uploader-btn id="global-uploader-btn" :attrs="attrs" ref="uploadBtn">选择文件</uploader-btn> -->
        <uploader-btn
          :directory="true"
          id="global-uploader-btn2"
          ref="uploadBtn2"
          >上传文件夹</uploader-btn
        >
        <!-- <el-checkbox v-model="checked1" @change="setChecked1">发起自动分析</el-checkbox> -->
        <el-checkbox v-model="checked2" @change="setChecked2"
          >放弃自动分析</el-checkbox
        >
        <el-tabs  v-model="isName" @tab-click="refresh">
          <el-tab-pane name="2" label="上传任务列表"> </el-tab-pane>
          <el-tab-pane name="1" label="总上传列表"> </el-tab-pane>
        </el-tabs>
        
        <uploader-files v-show="panelShow">
          <div
            id="filePanel"
            draggable="false"
            class="file-panel"
            :class="{ mini: collapse }"
            slot-scope="props"
          >
            <div class="file-title" id="fileTitle">
              <h2>总上传列表</h2>
              <div class="operate">
                文件总数：{{ props.files.length }}，已上传：{{ fileIndex }}
              </div>
              <!-- <div class="operate">
                    <el-button @click="fileListShow(!collapse)" type="text">
                        <i :class="collapse ? 'el-icon-plus': 'el-icon-minus'"></i>
                    </el-button>
                    <el-button @click="close"  v-if="!props.fileList.length" type="text" title="关闭">
                        <i class="el-icon-close"></i>
                    </el-button>
                    </div> -->
            </div>
            <ul
              class="file-list"
              v-loading="loading"
              element-loading-text="创建上传任务中"
              element-loading-spinner="el-icon-loading"
              element-loading-background="rgba(0, 0, 0, 0.8)"
              id="PMTree"
            >
              <li v-for="file in fileArr" :key="file.id">
                <uploader-file
                  :class="'file_' + file.id"
                  ref="files"
                  :file="file"
                  :formated-average-speed="file.currentSpeed"
                ></uploader-file>
              </li>
              <div class="no-file" v-if="!fileArr.length">
                <i class="nucfont inuc-empty-file"></i> 暂无待上传文件
              </div>
            </ul>
          </div>
        </uploader-files>
         <div class="y-file-list"  v-if="!panelShow">
           <div class="title">
              <h2>任务列表</h2>
              
            </div>
            <div class="header-title header">
              <div class="t1">回路名称</div>
              <div class="t2">杆塔名称</div>
              <div class="t3">进度</div>
              <div class="t4">状态</div>
            </div>
           <div class="item-list">
            
            <div class="header-title" v-for="(item,index) in taskList" :key="index">
              <div class="t1">{{item.loopName}}</div>
              <div class="t2">{{item.planAreaName}}</div>
              <div class="t3">{{item.por||'—'}}</div>
              <div class="t4">{{item.statu||'待匹配'}}</div>
            </div>
            
             <div class="no-file" v-if="taskList.length<1">
                <i class="nucfont inuc-empty-file"></i> 暂未匹配到任务
              </div>
           </div>
         </div>
      </uploader>
    </el-dialog>
  </div>
</template>
 
<script>
// import { getUpload,delObject } from "@/utils/upload";
export default {
  name: "vueName",
  data() {
    return {
      title: "上传图片",
      visible: false,
      propData: {
        task_id: "",
        line_plant_id: "",
        line_id: "",
        image_folder_name: "",
      },
      checked1: false,
      checked2: false,
      options: {
        // target: '/api-formal/wtg/api/v1/wtg_image_save/',
        target: "",
        testMethod: "PUT",
        uploadMethod: "PUT",
        chunkSize: "20480000000",
        fileParameterName: "file",
        simultaneousUploads: 1,
        maxChunkRetries: 3,
        testChunks: false, //是否开启服务器分片校验
        // // 服务器分片校验函数，秒传及断点续传基础

        parseTimeRemaining: function (timeRemaining, parsedTimeRemaining) {
          // console.log(timeRemaining,parsedTimeRemaining,321321)
          return parsedTimeRemaining
            .replace(/\syears?/, "年")
            .replace(/\days?/, "天")
            .replace(/\shours?/, "小时")
            .replace(/\sminutes?/, "分钟")
            .replace(/\sseconds?/, "秒");
        },
        processParams(params) {
          //每一次分片传给后台的参数，params是该方法返回的形参，包含分片信息
          console.log(params, 11122);
          return {};
        },
        headers: {
          "Content-Type": " application/x-www-form-urlencoded",
        },
        query() {},
      },
      attrs: {
        accept: ["image/*", "video/*", ".SRT"],
      },
      panelShow: false, //选择文件后，展示上传panel
      collapse: true,
      image_folder_name_list: [],
      formList: [],
      imgList: [],
      imgNames: [],
      loading: false,
      fileIndex: 0,
      isName: "2",
      checkedCities: [],
      taskList: [],
      taskIndex: 0,
      fileArr: []
    };
  },
  components: {},
  computed: {
    //Uploader实例
    uploader() {
      return this.$refs.uploader.uploader;
    },
  },
  mounted() {},
  //方法集合
  methods: {
    init(val) {
      // this.propData = {
      //   line_task_id: val.taskPlanCode,
      //   line_plant_id: val.baseCode,
      //   line_id: val.planArea,
      //   renameModelType: val.renameModelType,
      //   taskId: val.id,
      // };
      let list = val
      let arr = []
      let file = []
      this.fileArr = []
      list.forEach(item => {
        file.push({
          id: item.id,
          fileList: [],
          por: '',
          statu: '',
          taskIndex: 0,
          picRenameModelId:item.picRenameModelId,
          planArea: item.planArea,
          planAreaName: item.planAreaName,
          planCode: item.planCode,
          renameModelType: item.renameModelType,
          loopName: item.loopName,
          taskPlanCode: item.taskPlanCode,
          status: item.status,
          taskName: item.loopName+'/'+item.planAreaName
        })
      });
      var obj = {};
      file.forEach(item => {
        if(item.status==0){
          if(obj[item.taskName]){
          Object.assign(obj[item.taskName],item)
          }else{
            obj[item.taskName] = item
          }
        }
      });
      arr = Object.values(obj)
      this.taskList = arr
      this.taskIndex = 0
      this.fileIndex = 0;
      this.visible = true;
      this.uploader.cancel()
      // this.getSeafile();
    },
     refresh(val){
      this.isName = val.name
     
      this.panelShow = this.isName==1? true : false;
      // if(val.name==2){
      //   this.getSeafile()
      // }
    },
    onFilesAdded(file, fileList) {
      // this.panelShow = true;
      // this.fileListShow(false)
      // var arr2 = [];
      // file.forEach((item) => {
      //     if (item) {
      //     let arr = item["relativePath"].split("/");
      //     let arr1 = arr[arr.length - 2];
      //     arr2.push(arr1);
      //     }
      // });
      // this.image_folder_name_list =Array.from(new Set(arr2));
      this.$message.success(`筛选过后本次上传${file.length}个文件`);
      
      
      if (file.length > 0) {
        let arr = []
        this.taskList.forEach(element => {
          arr = arr.concat(element.fileList)
        });
        this.fileArr = arr
        console.log(this.taskList,arr,this.fileArr[this.fileIndex],9996)
        this.loading = true;
        setTimeout(() => {
          this.setFolder(this.fileArr[0]);
        }, 1500);
      }
    },
    onFileAdded(file, fileList) {
      // this.panelShow = true;
      // console.log(file,fileList,111111)
      
      // this.fileListShow(false)
      // Object.assign(this.uploader.opts, {
      //     query: {
      //         ...this.propData,
      //     }
      // })
      
      let arr = file.name.split("_");
      let arr2 = file["relativePath"].split("/");
      // let arr1 = arr2[arr2.length - 2];
      var folder_name = arr2[1]+'/'+arr2[2]
       let name = file.name.replace(/#/g, "")
      
      this.taskList.forEach((item,index) => {
        let taskName = item.loopName+'/'+item.planAreaName
        if(item.renameModelType==2){
          name = arr2[arr2.length-3]+'/'+arr2[arr2.length-2]+'_'+
          arr[arr.length-2]+'_'+arr[arr.length-1]
        }
        let name2 = item.planArea + "/" + item.taskPlanCode + "/" + name;
        if(folder_name==taskName&&item.status==0){
          item.statu = '待上传'
          item.fileList.push(file)
          // item.fileList.push({
          //   fileName: file.name,
          //   imgName: name2,
          //   file: file,
          // })
          file.imgName = name2
          file.listIndex = index
        }
      });
      
      if (arr[arr.length - 1] == "Z.JPG") {
              file.pause();
            let res = this.taskList.findIndex(item=>{
                return folder_name == item.taskName
              })
              if(res==-1){
                file.ignored = true
              }
              
          }else{
            file.ignored = true
          }
      // // console.log(folder_name,12121)
      
      //   this.$nextTick(() => {
      //       console.log(this.$refs['uploader'].files.length)
      //     // this.file_total=this.$refs['uploader'].files.length
      // });
    },
    onFileProgress(rootFile, file, chunk) {
      // console.log(rootFile, file, chunk,111)
      // console.log(`上传中 ${file.name} ${chunk.endByte}，chunk：${chunk.startByte / 1024 / 1024} ~ ${chunk.endByte / 1024 / 1024}`)
    },
    onFileSuccess(rootFile, file, response, chunk) {
       let listIndex = this.fileArr[this.fileIndex].listIndex
        let length = this.taskList[listIndex].fileList.length
        if( this.taskList[listIndex].taskIndex==length){
          this.taskList[listIndex].statu = '上传完成'
             let data = {
              id: this.taskList[listIndex].id,
              status: 1,
            };
            this.updateData(data);
            this.$message.success(this.taskList[listIndex].taskName+"已上传完全部文件");
        }
      this.fileIndex++;
     
      if (this.fileIndex > 3) {
        let PMTree = document.getElementById("PMTree");
        let height = 49;
        PMTree.scrollTop = (this.fileIndex - 3) * height;
      }
      file.pause();
      if (this.fileIndex < this.fileArr.length) {
       
        this.setFolder(this.fileArr[this.fileIndex]);
      }

      console.log(response, file, 2121);
    },
    onFileComplete(rootFile) {
      // if(this.checked1){
      //   let data = {
      //     id: this.propData.taskId,
      //     status: 2,
      //   };
      //   this.updateData(data);
      //   this.fanAnalysis();
      // }
      // if (this.checked2) {
      //   let data = {
      //     id: this.propData.taskId,
      //     status: 10,
      //   };
      //   this.updateData(data);
      // }
      // if (!this.checked2 && !this.checked1) {
      //   let data = {
      //     id: this.propData.taskId,
      //     status: 1,
      //   };
      //   this.updateData(data);
      // }
       this.$message.success("已上传完全部文件");
       this.$emit("refresh");
          this.visible = false;
    },
    onFileError(rootFile, file, response, chunk) {
      //  let res = JSON.parse(response);
      //  console.log(res,2121)
      //  if(res.code!=200){
      //     this.$message({
      //       message: res.msg,
      //       type: 'warning'
      //   })
      //   }
    },
    setChecked2(val) {
      this.checked2 = val;
      if (val) {
        this.checked1 = false;
      }
    },
    async updateData(row) {
      this.$http({
        // formdata 传值方式
        url: "api/inspection/inspection/taskPlan/update",
        method: "post",
        data: row,
      }).then((data) => {
        // if (data && data.status == 200) {
        //   this.$emit("refresh");
        //   this.visible = false;
        // } else {
        //   this.visible = false;
        // }
      });
    },
    // fanAnalysis() {
    //    this.$message.success(this.$t('title.success'));
    //   this.$fetch({
    //     // formdata 传值方式
    //     url: "/wtg/api/v1/analy_wtg/",
    //     method: "post",
    //     data: {
    //       wtg_task_id: this.propData.wtg_task_id,
    //     },
    //   }).then((data) => {
    //     if (data && data.code === 1000) {
    //       this.$message.success("发起自动分析成功");
    //     }
    //   })
    // },
    setFolder(file) {
      let that = this;
      let listIndex = this.fileArr[this.fileIndex].listIndex
        this.taskList[listIndex].taskIndex++;
        let length = this.taskList[listIndex].fileList.length
        this.taskList[listIndex].statu = '上传中'
        this.taskList[listIndex].por =  this.taskList[listIndex].taskIndex+'/'+ length
        
      // console.log(form, file,file.imgName);
      // let pathArr = file.relativePath.split("/")
      // let nameArr = file.name.split('_')
      // // pathArr.splice(2,0,'compressed')
      // // pathArr.splice(0,1)
      // // let name1 = form.wtg_id+'/' + form.wtg_task_id+'/'+pathArr.join('/')
      // // let pathArr2 = file.relativePath.split("/")
      // // pathArr2.splice(2,0,'rgb')
      // // pathArr2.splice(0,1)
      // let name = file.name.replace(/#/g, "")
      // if(form.renameModelType==2){
      //   name = pathArr[pathArr.length-3]+'/'+pathArr[pathArr.length-2]+'_'+
      //   nameArr[nameArr.length-2]+'_'+nameArr[nameArr.length-1]
      // }
      // let name2 = form.line_id + "/" + form.line_task_id + "/" + name;
      // console.log(name2,2222222)
      //   console.log(name1,name2)
      // compressImg(file.file).then(data=>{
      //   uploadMinIo('wtg',name1,data).then(res=>{
      //     getImage('wtg',name1).then(url=>{
      //     })
      //   })
      // })
      getUpload("line", file.imgName).then((url) => {
        Object.assign(that.uploader.opts, {
          target: url,
          query: {
            filename: file.imgName,
          },
        });
        file.resume();
        that.loading = false;
      });
    },
  },
};
</script>
 
<style lang="scss" scoped>
.uploader {
  // float: left;
  .uploader-btn {
    background: #f5921f;
    color: #fff;
    height: 30px;
    font-weight: normal;
    line-height: 24px;
    border: 0px;
    font-size: 12px;
  }
  .uploader-btn:hover {
    background: #ebae67;
  }
}
.file-panel {
  // position: fixed;
  // bottom: 10px;
  // right: 10px;
  background: #fff;
  box-shadow: 1px 1px 5px #ccc;
  border-radius: 5px;
  z-index: 199992;
  width: 650px;
  height: 420px;
  overflow: hidden;
  .file-title {
    border: 1px solid #cccccc4a;
    font-size: 10px;
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: space-between;
    line-height: 40px;
    padding-left: 10px;
    user-select: none;
    h2 {
      margin: 0px;
      width: 100px;
      display: inline-block;
      color: #666363;
    }
    .operate {
      //   float: right;
      margin-right: 10px;
    }
  }
  .file-list {
    list-style-type: none;
    height: 380px;
    overflow-y: scroll;
    padding: 0px;
    margin: 0px;
    width: 100%;
    .no-file {
      margin: 10px;
      text-align: center;
    }
  }
}
.y-file-list{
  background: #fff;
  box-shadow: 1px 1px 5px #ccc;
  border-radius: 5px;
  z-index: 199992;
  width: 650px;
  height: 420px;
  overflow: hidden;
  .title {
    border: 1px solid #cccccc4a;
    font-size: 10px;
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: space-between;
    line-height: 40px;
    padding-left: 10px;
    user-select: none;
    color: #666363;
     h2 {
      margin: 0px;
      width: 100px;
      display: inline-block;
      color: #666363;
    }
    .operate {
      //   float: right;
      margin-right: 10px;
    }
  }
  .header{
    font-weight: 600;
  }
  .header-title{
    border: 1px solid #cccccc4a;
    font-size: 10px;
    width: 100%;
    height: 40px;
    display: flex;
    line-height: 40px;
    padding-left: 10px;
    user-select: none;
    color: #666363;
    .t1{
      width: 200px;
    }
    .t2{
      width: 200px;
    }
    .t3{
      width: 120px;
    }
    .t4{
      width: 120px;
    }
  }
  .item-list{
    list-style-type: none;
    height: 340px;
    overflow-y: scroll;
    padding: 0px;
    margin: 0px;
    width: 100%;
    .item-file {
      position: relative;
      height: 49px;
      line-height: 49px;
      display: flex;
      align-items: center;
      margin: 0;
      padding: 0 5px;
      overflow: hidden;
      border-bottom: 1px solid #cdcdcd;
    
      
    }
    .no-file {
      margin: 10px;
      text-align: center;
    }
  }
}
#global-uploader-btn2 {
  margin: 0 20px 10px 0;
  background: #1890ff;
}
</style>
