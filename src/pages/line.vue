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
        <!-- <el-checkbox v-model="checked2" @change="setChecked2"
          >放弃自动分析</el-checkbox
        > -->
        <el-tabs  v-model="isName" @tab-click="refresh">
          <el-tab-pane name="1" label="待上传列表"> </el-tab-pane>
          <el-tab-pane name="2" label="已上传列表"> </el-tab-pane>
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
              <h2>待上传列表</h2>
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
              <li v-for="file in props.files" :key="file.id">
                <uploader-file
                  :class="'file_' + file.id"
                  ref="files"
                  :file="file"
                  :formated-average-speed="file.currentSpeed"
                ></uploader-file>
              </li>
              <div class="no-file" v-if="!props.files.length">
                <i class="nucfont inuc-empty-file"></i> 暂无待上传文件
              </div>
            </ul>
          </div>
        </uploader-files>
         <div class="y-file-list"  v-if="!panelShow">
           <div class="title">
              <h2>已上传列表</h2>
              <el-button @click="selectDel" type="text">
                批量删除
              </el-button>
              <el-button @click="allDel"  type="text">
                全部删除
              </el-button>
              <div class="operate">
                已上传：{{ imgList.length }}
               
              </div>
            </div>
           <div class="item-list">
             <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
               <el-checkbox v-for="(item,index) in imgList" :key="index" :label="item" class="item-file">
                <div class="file-name"><span class="file-icon">📊</span>{{item.name}}</div>
                <el-tooltip class="item" effect="dark" content="查看照片" placement="top">
                  <div class="file-remove el-icon-picture-outline" @click="seePicture(item)"></div>
                </el-tooltip>
                  <div class="file-remove el-icon-close" @click="remove(item)"></div>
               </el-checkbox>
            </el-checkbox-group>
             <!-- <div class="item-file" v-for="(item,index) in imgList" :key="index">
               <div class="file-name"><span class="file-icon">📊</span>{{item.name}}</div>
               <el-tooltip class="item" effect="dark" content="查看照片" placement="top">
                <div class="file-remove el-icon-picture-outline" @click="seePicture(item)"></div>
              </el-tooltip>
             </div> -->
             <div class="no-file" v-if="imgList.length<1">
                <i class="nucfont inuc-empty-file"></i> 暂无已上传文件
              </div>
           </div>
         </div>
      </uploader>
    </el-dialog>
     <el-dialog
      :close-on-click-modal="false"
        title="查看图片"
      :visible.sync="dialogVisible"
      :modal-append-to-body="false"
      width="540px"
    >
      <div style="width: 500px; margin: 5px">
        <el-image
          style="width: 500px"
          :src="url"
          :preview-src-list="[url]"
          :z-index="3000"
          lazy
        >
        <div slot="placeholder" class="image-slot">
          <i class="el-icon-loading"></i>
          <div>拼命加载中</div>
        </div>
        <div slot="error" class="image-slot">
          <i class="el-icon-picture-outline pic"></i>
        </div>
        </el-image>
      </div>
    </el-dialog>
  </div>
</template>
 
<script>
import { ipcRenderer } from 'electron';
import fs from 'fs';
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
        target: "#",
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
      panelShow: true, //选择文件后，展示上传panel
      collapse: true,
      image_folder_name_list: [],
      formList: [],
      imgList: [],
      imgNames: [],
      loading: false,
      fileIndex: 0,
      isName: "1",
      checkedCities: [],
      url: '',
      dialogVisible: false,
      ruleList: [],
      imgPath: null,
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
      this.propData = {
        line_task_id: val.taskPlanCode,
        planCode: val.planCode,
        line_plant_id: val.baseCode,
        line_id: val.planArea,
        renameModelType: val.renameModelType,
        taskId: val.id,
        picRenameModelId: val.picRenameModelId || 1,
        loopName: val.loopName,
        planAreaName: val.planAreaName,
      };
      console.log(this.propData,999)
      this.fileIndex = 0;
      this.checkedCities = []
      this.visible = true;
      this.getSeafile();
      let imgDir = localStorage.getItem('imgPath')
      console.log('应用路径3:', imgDir);
      this.imgPath = imgDir
      // if (!fs.existsSync('D:/imgPath')) {
      //   fs.mkdirSync('D:/imgPath');
      // }
    },
     refresh(val){
      this.isName = val.name
     
      this.panelShow = this.isName==1? true : false;
      if(val.name==2){
        this.getSeafile()
      }
    },
   async getSeafile() {
    
      let data = await this.$db.imgList.where('taskPlanCode').startsWithIgnoreCase(this.propData.line_task_id).toArray()
      this.imgList = data
      console.log(data);
      let list = []
      this.imgList.forEach(element => {
        list.push(element.name)
      });
      this.imgNames = list
      this.ruleList = await this.$db.ruleList.toArray()
      //  this.$imgList.find({ line_task_id: this.propData.line_task_id }, (err, docs) => {
      //   if (err) {
      //     console.log(err);
      //     return;
      //   }
      //   console.log(docs);
      //   this.imgList = docs
      //   // this.list = docs;
      // });
      // let name = this.propData.line_id + "/" + this.propData.line_task_id;
      // this.$http({
      //   url: "api/inspection/inspection/lineController/queryDefectPic",
      //   method: "post",
      //   params: {
      //     bucket: 'line',
      //     prefix: name,
      //   },
      // }).then((data) => {
      //   if (data && data.status === 200) {
      //     this.imgList = data.data;
      //     let list = []
      //     data.data.forEach(item => {
      //       list.push(item.split("/")[2])
      //     });
      //     this.imgNames = list
      //   }
      // });
    },
     handleCheckedCitiesChange(value) {
       
       console.log(value,this.checkedCities,43243)
    },
    selectDel(){
      if(this.checkedCities.length<1){
        this.$message.warning('请先选中要删除的图片！')
        return false
      }
      let that = this
      that.$confirm("此操作将永久删除选中图片，不可恢复, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          that.checkedCities.forEach(element => {
            that.$db.imgList.delete(element.fileName)
          });
          that.getSeafile()
        })
    },
    allDel(){
      if(this.imgList.length<1){
        this.$message.warning('暂无可删除的图片！')
        return false
      }
      let that = this
       this.$confirm("此操作将永久删除所有图片，不可恢复, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          that.imgList.forEach(element => {
            that.$db.imgList.delete(element.fileName)
          });
          that.getSeafile()
          // delObject('line',this.imgList).then(data=>{
          //   this.getSeafile()
          // })
        })
    },
    async remove(item){
      this.$confirm("此操作将永久删除该图片，不可恢复, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
           this.$db.imgList.delete(item.fileName)
            this.getSeafile()
        })
      
    },
    onFilesAdded(file, fileList) {
      this.panelShow = true;
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
        this.loading = true;
        // this.setNum(file.length+this.imgList.length)
        setTimeout(() => {
          this.setFolder(this.propData, file[0]);
        }, 1500);
      }
    },
    onFileAdded(file, fileList) {
      this.panelShow = true;
      // console.log(file,fileList,111111)
      
      // this.fileListShow(false)
      // Object.assign(this.uploader.opts, {
      //     query: {
      //         ...this.propData,
      //     }
      // })
      var nameArr = file.name.split('.')
      let arr = nameArr.split("_");
      let arr2 = file["relativePath"].split("/");
      let arr1 = arr2[arr2.length - 2];
      let folder_name = arr1.split("-")[1];
      const hasZorV = arr.some(item => item === "Z" ||  item === "V");
      console.log(hasZorV,12121)
      if (hasZorV) {
          file.pause();
        let list = this.imgNames.includes(file.name)
        if(list){
          file.ignored = true
        }
      }else{
          file.ignored = true
      }
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
      this.fileIndex++;
      if (this.fileIndex > 3) {
        let PMTree = document.getElementById("PMTree");
        let height = 49;
        PMTree.scrollTop = (this.fileIndex - 3) * height;
      }
      file.pause();
      if (this.fileIndex < this.uploader.files.length) {
        this.setFolder(this.propData, this.uploader.files[this.fileIndex]);
      }else{
        this.updateData();
        // this.$message.success("已上传完全部文件");
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
      if (this.checked2) {
        let data = {
          id: this.propData.taskId,
          status: 10,
        };
        this.updateData(data);
      }
      if (!this.checked2 && !this.checked1) {
        let data = {
          id: this.propData.taskId,
          status: 1,
        };
        this.visible = false;
        this.updateData(data);
      }
    },
    onFileError(rootFile, file, response, chunk) {
      this.fileIndex++;
      if (this.fileIndex > 3) {
        let PMTree = document.getElementById("PMTree");
        let height = 49;
        PMTree.scrollTop = (this.fileIndex - 3) * height;
      }
      file.pause();
      if (this.fileIndex < this.uploader.files.length) {
        this.setFolder(this.propData, this.uploader.files[this.fileIndex]);
      }else{
        this.updateData();
        // this.$message.success("已上传完全部文件");
      }
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
    async updateData() {
      this.$message.success("已上传完全部文件");
      this.visible = false;
      let id = this.propData.taskId
      this.$db.dataList.update(id,{status:1,isSync: 0,statusName: '已上传数据',localStatus: '已上传数据'})
      this.$emit("refresh",this.propData);
      // this.$http({
      //   // formdata 传值方式
      //   url: "api/inspection/inspection/taskPlan/update",
      //   method: "post",
      //   data: row,
      // }).then((data) => {
      //   if (data && data.status == 200) {
      //     this.$emit("refresh");
      //     this.visible = false;
      //   } else {
      //     this.visible = false;
      //   }
      // });
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
       
 
    seePicture(item){
     
        this.url = 'file://' + item.imgUrl
         console.log(item,this.url,111)
        this.dialogVisible = true
    },
    setFolder(form, file) {
      let that = this;
      console.log(form, file,3333);
      let pathArr = file.relativePath.split("/")
      let nameArr = file.name.split('_')
      let picIndex = parseInt(nameArr[2]) 
      // console.log(picName,11111)
      let picPath = file.name.replace(/#/g, "")
      // let showName =`${form.loopName}-${form.planAreaName}-${picName.length!=0?picName[0].picName:picPath}`
      picPath = pathArr[pathArr.length-3]+'/'+pathArr[pathArr.length-2]+'_'+
        nameArr[2]
      let showName =`${form.loopName}-${form.planAreaName}-${picPath}`
      console.log(showName,999999)
     // renameList.forEach(item => {
      //   if(picIndex==item.picIndex){
      //      showName = `${form.loopName}-${form.planAreaName}-${item.picName}`
      //   }
      // });
      let obj = {
        fileName: form.line_id + "/" + form.line_task_id + "/" + file.name,
        taskPlanCode: form.line_task_id,
        planArea: form.line_id,
        name: file.name,
        showName: showName,
        isSync: 0,
        picIndex: picIndex,
      }
      let targetPath = `${that.imgPath}/${form.line_task_id}`;
      // let reader = new FileReader();
      // reader.readAsDataURL(file.file);
      // reader.onload = (e) => {
        ipcRenderer.send('upload-image', file.file.path,targetPath);
        
        ipcRenderer.on('upload-image-reply', (event, { success, targetUrl}) => {
          if (success) {
            console.log(`图片已成功复制到指定文件夹：${targetUrl},${targetPath}`);
            obj.imgUrl = `${targetPath}/${file.name}`
            console.log(obj,1111)
            that.$db.imgList.put(obj);
            file.resume();
            that.loading = false;
          } else {
            console.log('复制图片时出错');
          }
        });
      // }
      //  that.writeFile(file.file, targetPath)
      //   .then(() => {
      //     console.log('图片已成功复制到指定文件夹');
      //     obj.imgUrl = `${targetPath}/${file.name}`
      //     that.$db.imgList.put(obj);
      //     file.resume();
      //     that.loading = false;
      //   })
      //   .catch(err => {
      //     // console.error('Error copying file:', err);
      //     console.log('复制图片时出错');
      //   });
      // let reader = new FileReader();
      // reader.readAsDataURL(file.file);
      // reader.onload = (e) => {
      //   file.resume();
      //   that.loading = false;
      //   console.log(e.target.result,222)
      //   obj.imgUrl = e.target.result 
      //    that.$db.imgList.put(obj);
      //   // that.$imgList.insert(obj,function(err,doc){
      //   //   if(err){
      //   //       console.log(err);
      //   //       return;
      //   //   }
      //   //   file.resume();
      //   //   that.loading = false;
      //   // })
      // }
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
    box-sizing: border-box;
    padding: 0 10px;
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
    box-sizing: border-box;
    padding: 0 10px;
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
  
}
#global-uploader-btn2 {
  margin: 0 20px 10px 0;
  background: #1890ff;
}
</style>
<style lang="scss">
.item-list{
    list-style-type: none;
    height: 380px;
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
.el-checkbox__label{
  display: flex !important;
  height: 49px;
  width: 630px  !important;
  line-height: 49px;
  align-items: center;
  z-index: 99;
  .file-name {
    width: 90%;
    display: flex;
    align-items: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-indent: 14px;
  }
  .file-icon {
    // width: 24px;
    // height: 24px;
    display: inline-block;
    vertical-align: top;
  }
  .file-remove{
    display: flex;
    margin-right: 20px;
    font-size: 22px;
    cursor: pointer;
    &:hover{
      color: #1890ff;
    }
  }
}
</style>