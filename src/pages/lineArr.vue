<template>
  <div class="cacheImage-box">
    <el-dialog
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="visible"
      center
      custom-class="box-dialog"
      append-to-body 
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
        <span class="tips" @click="isTips=true">批量上传提示</span>
        <!-- <el-checkbox v-model="checked1" @change="setChecked1">发起自动分析</el-checkbox> -->
        <!-- <el-checkbox v-model="checked2" @change="setChecked2"
          >放弃自动分析</el-checkbox
        > -->
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
    <el-dialog
      :close-on-click-modal="false"
        title="查看提示"
      :visible.sync="isTips"
      append-to-body 
      width="540px"
    >
    <div class="tipsInfo" >
      <div class="text">
        如下图所示，批量上传选择文件夹时，必须得选择对应的回路文件夹，即回路名称和文件夹名称要完全相同才能匹配。
        杆塔名称匹配规则做了优化，只需要杆塔号中的数字一致就可以匹配，如任务中杆塔名称为"xx1号塔"，文件夹中则匹配文件夹
        第二级的文件名称中带有数字"1"的文件夹。
      </div>
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
export default {
  name: "vueName",
  data() {
    return {
      isTips: false,
      url: require('@/assets/tips.jpg'),
      title: "批量上传图片",
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
      listIndex: 0,
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
    init(row,val) {
      this.propData = row
      //   line_task_id: val.taskPlanCode,
      //   line_plant_id: val.baseCode,
      //   line_id: val.planArea,
      //   renameModelType: val.renameModelType,
      //   taskId: val.id,
      // };
      let list = val
      let arr = []
      let file = []
      let imgDir = localStorage.getItem('imgPath')
      console.log('应用路径3:', imgDir);
      this.imgPath = imgDir
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
          taskName: item.loopName+'/'+  parseInt(item.planAreaName.match(/\d+/)[0], 10),
        })
      });
      var obj = {};
      file.forEach(item => {
        if(item.status<=1){
          if(obj[item.taskName]){
          Object.assign(obj[item.taskName],item)
          }else{
            obj[item.taskName] = item
          }
        }
      });
      arr = Object.values(obj)
      this.taskList = arr
      console.log(this.taskList,val,'taskList')
      // this.taskIndex = 0
      // this.fileIndex = 0;
      this.visible = true;
      // this.uploader.cancel()
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
        this.listIndex = 0
        console.log(this.taskList,this.fileArr,9996)
        this.$forceUpdate()
        this.loading = true;
        setTimeout(() => {
          this.taskList.forEach(item => {
            let length = item.fileList.length
          item.por =  '0/'+ length
          });
          
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
      
      var nameArr = file.name.split('.')
      let arr = nameArr[0].split("_");
      let arr2 = file["relativePath"].split("/");
      // let arr1 = arr2[arr2.length - 2];
      console.log(arr2,111111)
      var  folder_name = arr2[0]+'/'+parseInt(arr2[1].match(/\d+/)[0], 10)
       let name = file.name.replace(/#/g, "")
       const hasZorV = arr.some(item => item === "Z" ||  item === "V");
      this.taskList.forEach((item,index) => {
        let taskName = item.loopName +'/'+ parseInt(item.planAreaName.match(/\d+/)[0], 10)
       
        let name2 = item.planArea + "/" + item.taskPlanCode + "/" + file.name;
        if(folder_name==taskName&&item.status<=1 && hasZorV){
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
      
      if (hasZorV) {
              file.pause();
            let res = this.taskList.findIndex(item=>{
                return folder_name == item.taskName
              })
              if(res==-1){
                file.ignored = true
              }
              if(file.size<1000){
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
      console.log(this.fileArr,222222)
      //  let listIndex = this.fileArr[this.fileIndex].listIndex
      //   let length = this.taskList[listIndex].fileList.length
      //   if( this.taskList[listIndex].taskIndex==length){
      //     this.taskList[listIndex].statu = '上传完成'
      //        let data = {
      //         id: this.taskList[listIndex].id,
      //         status: 1,
      //       };
      //       this.$message.success(this.taskList[listIndex].taskName+"已上传完全部文件");
            
      //       this.updateData(data);
      //   }
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
    },
    fileSuccess(file){
      let that = this
      console.log(that.fileArr,that.taskList,1111111)
      // let listIndex = that.listIndex
      //       let length = that.taskList[listIndex].fileList.length
      //       if( that.taskList[listIndex].taskIndex==length){
      //         that.taskList[listIndex].statu = '上传完成'
      //           let data = {
      //             id: that.taskList[listIndex].id,
      //             status: 1,
      //           };
      //           that.$message.success(that.taskList[listIndex].taskName+"已上传完全部文件");
      //           that.listIndex = that.listIndex+1
      //           that.updateData(data);
      //       }
      that.fileIndex++;
     
      if (that.fileIndex > 3) {
        let PMTree = document.getElementById("PMTree");
        let height = 49;
        PMTree.scrollTop = (that.fileIndex - 3) * height;
      }
      if (that.fileIndex < that.fileArr.length) {
        that.setFolder(that.fileArr[that.fileIndex]);
      }
      
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
      this.visible = false;
      that.$message.success("已上传完全部文件");
      this.$emit("refresh",this.propData);
    },
    onFileError(rootFile, file, response, chunk) {
      let that = this
      that.fileIndex++;
     
      if (that.fileIndex > 3) {
        let PMTree = document.getElementById("PMTree");
        let height = 49;
        PMTree.scrollTop = (that.fileIndex - 3) * height;
      }
      if (that.fileIndex < that.fileArr.length) {
        that.setFolder(that.fileArr[that.fileIndex]);
      }else{
        that.visible = false;
        
        that.$emit("refresh",this.propData);
      }
    },
    setChecked1(val){
      this.checked1 = val
    },
    setChecked2(val) {
      this.checked2 = val;
      if (val) {
        this.checked1 = false;
      }
    },
    async updateData(row) {
      // this.$message.success("已上传完全部文件");
      // this.visible = false;
      let id = row.id
      this.$db.dataList.update(id,{status:1,isSync: 0,statusName: '已上传数据',localStatus: '已上传数据'})
    },
  
    setFolder(file) {
      let that = this;
      let listIndex = that.fileArr[this.fileIndex].listIndex
        this.taskList[listIndex].taskIndex++;
        let length = this.taskList[listIndex].fileList.length
        this.taskList[listIndex].statu = '上传中'
        this.taskList[listIndex].por =  that.taskList[listIndex].taskIndex+'/'+ length
        if( that.taskList[listIndex].taskIndex==length){
              that.taskList[listIndex].statu = '上传完成'
                let data = {
                  id: that.taskList[listIndex].id,
                  status: 1,
                };
                // that.$message.success(that.taskList[listIndex].taskName+"已上传完全部文件");
                that.listIndex = that.listIndex+1
                that.updateData(data);
            }
        // let pathArr = file.relativePath.split("/")
        let pathArr = file.relativePath.split("/")
      let nameArr = file.name.split('_')
      let picIndex = parseInt(nameArr[2]) 
      // console.log(picName,11111)
      let picPath = file.name.replace(/#/g, "")
      // let showName =`${form.loopName}-${form.planAreaName}-${picName.length!=0?picName[0].picName:picPath}`
      picPath = pathArr[pathArr.length-3]+'/'+pathArr[pathArr.length-2]+'_'+
        nameArr[2]
      let showName =`${that.taskList[listIndex].loopName}-${that.taskList[listIndex].planAreaName}-${picPath}`
        // let nameArr = file.name.split('_')
        // let picIndex = parseInt(nameArr[nameArr.length - 2])
        // let picPath = file.name.replace(/#/g, "")
        // let showName =`${form.loopName}-${form.planAreaName}-${picName.length!=0?picName[0].picName:picPath}`
        // picPath = pathArr[pathArr.length-3]+'/'+pathArr[pathArr.length-2]+'_'+
        // nameArr[nameArr.length-2]
        // let showName =`${form.loopName}-${form.planAreaName}-${picPath}`
        let obj = {
          fileName: that.taskList[listIndex].planArea + "/" + that.taskList[listIndex].taskPlanCode + "/" + file.name,
          taskPlanCode: that.taskList[listIndex].taskPlanCode,
          planArea: that.taskList[listIndex].planArea,
          name: file.name,
          showName: showName,
          isSync: 0,
          picIndex: picIndex,
        }
        let targetPath = `${that.imgPath}/${that.taskList[listIndex].taskPlanCode}`;
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
            // that.fileSuccess(file)
            
            that.loading = false;
          } else {
            console.log('复制图片时出错');
          }
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
.tips{
  color: #999;
  font-size: 12px;
  user-select: none;
  &:hover{
    color: #1890ff;
    cursor: pointer;
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
.tipsInfo{
  width: 500px;
  margin: 5px;
  img{
    width: 100%;
  }
}
</style>
