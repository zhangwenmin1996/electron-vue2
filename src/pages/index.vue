<template>
  <div class="cjhx-box2">
      <div class="cjhx-content">
        <!-- <el-row type="flex" justify="space-between" class="content-row"> -->
        <!-- 树 -->
        <!-- <el-col :span="4"> -->
        <div class="content-row" @mousemove="isResizer=true" @mouseleave="isResizer=false" >
          <div class="resizer" v-if="isResizer" @mousedown="startResizing"></div>
          <div class="tree-header">
            <div class="header-title"> <span class="bot"></span><span>图片列表</span></div> 
          </div>
          <div class="tree-content" :style="{ width: boxWidth + 'px' }" ref="resizableBox">
            <a-list item-layout="horizontal" :data-source="imgsrcNowList">
              <a-list-item
                slot="renderItem"
                slot-scope="item, index"
                :class="imgIndex === index ? 'activeList' : 'defaultList'"
                @click="changeImage(item, index)"
                style="width: 100%;"
              >
                <a-list-item-meta>
                  <a
                    slot="description"
                    :class="imgIndex === index ? 'activeColor' : 'defaultColor'"
                    >{{ item.label }}</a
                  >
                </a-list-item-meta>
                <!-- <div>content</div> -->
              </a-list-item>
            </a-list>
          </div>
        </div>
        <div class="cjhx-map-box">
          <div class="card-content">
            <div class="img-info">
              <div>
                <uploader
                ref="uploader"
                :options="options"
                :autoStart="false"
                @files-added="onFilesAdded"
                @file-added="onFileAdded"
                class="uploader-app"
              >
                <!-- <uploader-unsupport></uploader-unsupport> -->

                <!-- <uploader-btn id="global-uploader-btn" :attrs="attrs" ref="uploadBtn">选择文件</uploader-btn> -->
                <uploader-btn
                  :directory="true"
                  id="global-uploader-btn2"
                  ref="uploadBtn2"
                  >读取文件夹</uploader-btn
                >
              </uploader>
              </div>
              <el-button type="primary" size="small" @click="logOut">返回首页</el-button>
              <div>
                <!-- <el-button
                  @click="
                    setMode('DRAWMASK');
                    btnIndex = 3;
                  "
                  size="small"
                  :type="btnIndex == 3 ? 'primary' : ''"
                  >涂抹</el-button
                > -->
                <!-- <el-button
                  @click="
                    setMode('CLEARMASK');
                    btnIndex = 4;
                  "
                  size="small"
                  :type="btnIndex == 4 ? 'primary' : ''"
                  >擦除</el-button
                > -->
                <el-button
                  @click="
                    drawRect();
                    btnIndex = 1;
                  "
                  size="small"
                  :type="btnIndex == 1 ? 'primary' : ''"
                  >矩形框测量</el-button
                >
                <el-button
                  @click="clearMask()"
                  type="danger"
                  :disabled="!canChange"
                  size="small"
                  >删除标记</el-button
                >
                <el-button
                  @click="
                    setMode('PAN');
                    btnIndex = 2;
                  "
                  size="small"
                  :type="btnIndex == 2 ? 'primary' : ''"
                  >拖拽图片</el-button
                >
                <!-- <el-button size="small" @click="pointData()"
                  >打印数据</el-button
                > -->
              </div>
            </div>
            <div class="ailabelEdit-box">
              <div id="hello-map2"></div>
              <img
                id="mapImg2"
                :src="imgsrcNow"
                alt=""
                v-show="false"
                class="loadingImgbigsiagn2"
              />
            </div>
          </div>
        </div>
       
      </div>
  </div>
</template>
 
<script>
import Vue from "vue";
import { ipcRenderer } from 'electron';
import fs from 'fs';
import EXIF from "exif-js";
const { exec } = require('child_process');
const path = require('path');
const iconv = require('iconv-lite');
import { List, Card, Progress } from "ant-design-vue";
Vue.use(List);
import deleteIcon from "@/assets/delete.png";
let AILabel = require("./js/index");
// import "./js/index";
import { debouce1 } from "./js/debounce";

let gTextLayer2 = null;

let that;
let drawingStyle; // 绘制样式
let gMap; // 标注容器
let Mode = ""; // 默认绘制类型
let gImageLayer; // 图片绘制
let gFirstFeatureLayer; // 实例化
let gFirstMaskLayer; // 涂抹层
let gFirstTextLayer; // 文本层
let targetMarker; // 更新视图
let targetText; // 更新标签
let gFirstMarker; // 标注
export default {
  name: "add",
  // mixins: [myMixin],
  data() {
    return {
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
      imgData: {},
      isResizer: false,
      confirmLoading: false,
      expandedKeys: [],
      formLabelWidth: "80px",
      title: "",
      searchValue: "",
      filterText: "",
      spinning: false,
      RectList: [],
      TextList: [],
      GloablPoint: [],
      version: 1,
      openType: "", // examine---审核   ailabel---标注
      canChange: false, //  true 可以删除保存修改；false 不允许删除保存修改
      list: [],
      imageName: "",
      imageFolder: "",
      panorama: "", //全景图数据
      panorama_get: "",
      fault_typeList: [
        {
          label: "叶片损坏",
          value: "1",
        },
        {
          label: "物理损伤",
          value: "2",
        },
      ],
      fjpositionList: [],
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      pageType: 0,
      imgIndex: 0,
      imageId: "",
      isnext: "",
      debouce1function: null,
      treeData: [
        {
          panel_name: "全部",
          panel_index: "1",
          disabled: true,
          children: [],
        },
      ],
      defaultProps: {
        children: "children",
        label: "label",
      },
      imgViewWidth: 0,
      imgViewHeight: 0,
      rectZIndex: 2,
      // progress: 0,
      form: {
        id: "",
        label: "",
      },
      formArr: [],
      subtask_id: "",
      subForm: [],
      originForm: {},
      gImageLayerArr: [],
      imgsrcNow: "",
      imgsrcNowList: [],
      folderList: [],
      activeList: {
        background: "#01c19a",
        color: "#ffffff",
      },
      defaultList: {
        background: "#ffffff",
        color: "#000000",
      },
      size: "default",
      gloHeight: "250",
      gloSrc: null,
      wtgName: "",
      arrIndex: 0,
      faultArray: [],
      faultTypeArray: [],
      btnIndex: 1,
      taskStatus: 0,
      saveLoading: true,
      task_id: undefined,
      wtg_plant_id: undefined,
      wtg_id: undefined,

      flagswitch: true, // 标注开关
      rleData: [], // 最终图像标记
      curMode: 1, // 当前图形类型
      curtext: "",
      tempInput: '',
      formObj: {},
      isResizing: false,
      boxWidth: 360, 
      imgPoints: '',
    };
  },
  components: {
    // GlobalBox,
    ACard: Card,
    AProgress: Progress,
  },
  //监听属性 类似于data概念
  computed: {
    // 标注进度
    
  },
  //监控data中的数据变化
  watch: {
    // filterText(val) {
    //   this.$refs.tree.filter(val);
    // },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    document.addEventListener("keydown", this.keyDown);
  },
  beforeDestroy(){
    document.removeEventListener("keydown", this.keyDown);
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    let that = this;
    this.init()
    Array.prototype.max = function () {
      return Math.max.apply({}, this);
    };
    Array.prototype.min = function () {
      return Math.min.apply({}, this);
    };
    window.onresize = () => {
      return (() => {
        if (gMap) {
          gMap.resize();
        }
      })();
    };
  },
  activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
  //方法集合
  methods: {
    onFilesAdded(file, fileList) {
      console.log(file,fileList,2222)
      let arr = []
      file.forEach(item => {
        arr.push({
          label: item.name,
          file_link: item.file.path,
          file: item.file
        })
      });
      this.imgsrcNowList = arr
      this.changeImage(this.imgsrcNowList[0], this.imgIndex);
      console.log(arr,6666)
    },
    onFileAdded(file, fileList) {
     
      // console.log(file,fileList,111111)
      
     
    },
    logOut(){
      sessionStorage.clear()
      this.$router.push("/")
    },
    startResizing(e) {
      this.isResizing = true;
      document.addEventListener('mousemove', this.resizeBox);
      document.addEventListener('mouseup', this.stopResizing);
    },
    resizeBox(e) {
      if (!this.isResizing) return;

      const containerRect = this.$refs.resizableBox.parentNode.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;

      if (newWidth > 260) {
        this.boxWidth = newWidth;
      }
    },
    stopResizing() {
      this.isResizing = false;
      document.removeEventListener('mousemove', this.resizeBox);
      document.removeEventListener('mouseup', this.stopResizing);
    },
    
    checkLabelExists(arr, targetLabel) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].label === targetLabel) {
          return true;
        }
        if (arr[i].children && arr[i].children.length > 0) {
          if (this.checkLabelExists(arr[i].children, targetLabel)) {
            return true;
          }
        }
      }
      return false;
    },
    handleBlur(val){
      console.log(val,5555)
      this.form.img_position = val
      let that = this
      let inputValue = val
      if (inputValue) {
        // 检查是否已存在
        const found = that.checkLabelExists(that.options, inputValue)
        if (!found) {
          // 添加新的选项
          const newOption = {
            value: inputValue,
            label: inputValue,
          };
          that.options.push(newOption);
          that.form.img_position = newOption.value;
        }
      }
      
    },
    changePoptions(val) {
      if (val) {
        this.form.img_position = val[val.length - 1]
          ? val[val.length - 1]
          : '';
      }
      console.log(val,this.form.img_position,666666)
    },
    //   初始化标注组件
    init() {
      gMap = null;
      gImageLayer = null;
      gFirstMaskLayer = null;
      gFirstFeatureLayer = null;
      gTextLayer2 = null;
      
    },
   
    setSize() {
      //  document.body.clientWidth
      let width = document.body.clientWidth;
      // console.log("width", width);
      if (width > 1600) {
        if (width > 1680) {
          this.size = "large";
          this.gloHeight = 300;
        } else {
          this.size = "defalut";
        }
      } else {
        this.size = "small";
        this.gloHeight = "250vh";
      }
    },
  
   
   
    // 查看时，不许标注
    resetMode() {
      if (this.canChange) {
        // 审核
        // this.setMode("rect")
      } else {
        // 查看
        this.setMode("PAN");
      }
    },
    
    
   
 
   
    // 切换图片
    getNextImage() {
      let that = this;

      this.imgsrcNow = "";
      // that.read(that.imgsrcNowList[that.imgIndex].md5, (res) => {
      if (gMap) {
        gMap.destroy();
      }
       that.imgsrcNow = 'file://' + that.imgsrcNowList[that.imgIndex].file_link
       setTimeout(() => {
        that.successLoading()
       }, 150);
      
     
    },

    
   

    getIndex(id) {
      let ind = null;
      ind = this.imgsrcNowList.findIndex((item, index) => {
        return item.id === id;
      });
    },
    handleNodeClick(data) {
      console.log("click", data);
      if (data.id) {
        let index = this.imgsrcNowList.findIndex((item) => {
          return item.id === data.id;
        });
        console.log(this.imgsrcNowList[index].label);
        this.changeImage(this.imgsrcNowList[index], index);
      }
    },

    // 修改日期
    onChangeDate() {},
    handleOk(e) {
      // this.ModalText = "The modal will be closed after two seconds";
      this.confirmLoading = true;
      setTimeout(() => {
        this.visible = false;
        this.confirmLoading = false;
      }, 500);
    },
    // 点击x，关闭标注页
    handleCancel(e) {
      // 询问是否清空缓存
      // this.$confirm('此页面有缓存文件，是否删除?', '提示', {
      //     confirmButtonText: '删除',
      //     cancelButtonText: '取消',
      //     type: 'warning'
      //   }).then(() => {
      //     // 清除缓存
      //     this.clearImage();
          
      //   }).catch((error) => {
          
      //     console.log(error)
          this.closePage();
      //   });
      
    },
    clearImage() {
      // that.imgsrcNowList[that.imgIndex].md5
      this.imgsrcNowList.forEach((item) => {
        this.remove(item.md5);
      });
      this.closePage();
    },
    remove(id) {
      var request = imgdb.transaction(["imgTable"], "readwrite").objectStore("imgTable").delete(id);
      request.onsuccess = function (event) {
        console.log("数据删除成功");
      };
    },
    closePage() {
      this.visible = false;
      if (db) {
        db.close();
      }
      if (gMap) {
        gMap.destroy();
      }

      requestDB = null;
      db;
      gMap = null;
      gImageLayer = null;
      gFirstMaskLayer = null;
      gFirstFeatureLayer = null;
      gTextLayer2 = null;
      this.imgsrcNowList = [];
      this.imgsrcNow = "";
      this.imgIndex = 0;
      this.$emit("refresh",this.formObj);
    },
    ///////////////////////////////////////////////////////////////////////////////////////
    // 初始化标注组件
    initgMap() {
      let box = document.getElementById("hello-map2");
      let boxWidth = box.offsetWidth;
      let boxHeight = box.offsetHeight;
      let zommNum = boxWidth / boxHeight;
      let zommNum2 = this.imgWidth / this.imgHeight;
      console.log(zommNum, zommNum2);
      gMap = null;
      gMap = new AILabel.Map("hello-map2", {
        zoom: this.imgWidth * (zommNum > zommNum2 ? zommNum2 : 1.2),
        cx: 0,
        cy: 0,
        zoomMax: this.imgWidth * 10,
        zoomMin: this.imgWidth / 10,
        autoPan: true,
        drawZoom: true,
      });

      // let zoom = gMap.getZoom();

      let num = boxWidth / this.imgWidth;
      let cx = boxWidth;
      let cy = this.imgHeight * num;
      this.imgViewWidth = cx;
      this.imgViewHeight = cy;
      const timestamp = new Date().getTime();
      //  gImageLayer = new AILabel.Layer.Image('img' + timestamp, this.IRbinSrc, {w: this.imgWidth, h: this.imgHeight}, {zIndex: 1});
      gImageLayer = new AILabel.Layer.Image(
        "img" + timestamp,
        {
          src: this.imgsrcNow,
          width: this.imgWidth,
          height: this.imgHeight,
          position: {
            // 图片左上角坐标
            x: 0,
            y: 0,
          },
        }, // imageInfo
        { name: "第一个图片图层" }, // props
        { zIndex: 5 } // style
      );
      gMap.addLayer(gImageLayer);

      this.gImageLayerArr.push(gImageLayer);
      // 文本层实例\添加
      gTextLayer2 = new AILabel.Layer.Text("textLayer2" + timestamp, {
        zIndex: this.rectZIndex,
      });
      gMap.addLayer(gTextLayer2);

      this.huixian();
      /*
        strokeColor	画笔颜色	否	'#00DD00'	string
        opacity	透明度0-1	否	1	number
        lineWeight	线宽	否	1	number
        fillColor	填充色	否	'#00DD00'	string
        lineDash	线段是否虚线	否	false	bool
        bgColor	背景色	否	'#ffffff'	string
        fontSize	字体大小	否	13	number
        fontColor	字体颜色	否	'#333333'	string
        pointRadius	点半径	否	3	number
       */
    },
    // 设置标注模式
    setMode(mode, color, size) {
      gMap && gMap.setMode(mode);
      // console.log(mode);
      // 后续对应模式处理
      switch (gMap.mode) {
        case "PAN": {
          break;
        }
        case "MARKER": {
          // 忽略
          break;
        }
        case "POINT": {
          drawingStyle = { fillStyle: "#9370DB" };
          gMap.setDrawingStyle(drawingStyle);
          break;
        }
        case "CIRCLE": {
          drawingStyle = {
            fillStyle: "#9370DB",
            strokeStyle: "#0000FF",
            lineWidth: 2,
          };
          gMap.setDrawingStyle(drawingStyle);
          break;
        }
        case "LINE": {
          drawingStyle = {
            strokeStyle: "#FF00FF",
            lineJoin: "round",
            lineCap: "round",
            lineWidth: 10,
          };
          gMap.setDrawingStyle(drawingStyle);
          break;
        }
        case "POLYLINE": {
          drawingStyle = {
            strokeStyle: "#FF1493",
            lineJoin: "round",
            lineCap: "round",
            lineWidth: 10,
          };
          gMap.setDrawingStyle(drawingStyle);
          break;
        }
        case "RECT": {
          drawingStyle = { strokeStyle: "#0f0", lineWidth: 1 };
          gMap.setDrawingStyle(drawingStyle);
          this.curMode = 1;
          break;
        }
        case "POLYGON": {
          drawingStyle = {
            strokeStyle: "#00f",
            fillStyle: "#0f0",
            globalAlpha: 0.3,
            lineWidth: 1,
            fill: true,
            stroke: true,
          };
          gMap.setDrawingStyle(drawingStyle);
          this.curMode = 2;
          break;
        }
        case "DRAWMASK": {
          drawingStyle = {
            strokeStyle: "rgba(255, 0, 0, .5)",
            fillStyle: "#00f",
            lineWidth: 20,
          };
          gMap.setDrawingStyle(drawingStyle);
          break;
        }
        case "CLEARMASK": {
          drawingStyle = { fillStyle: "#00f", lineWidth: 20 };
          gMap.setDrawingStyle(drawingStyle);
          break;
        }
        default:
          break;
      }
    },

    clearbtn(flag) {
      // 删除全部marker
      gMap.markerLayer.removeAllMarkers();
      // 删除全部text
      gFirstTextLayer.removeAllTexts();
      // 删除全部feature
      gFirstFeatureLayer.removeAllFeatures();
      // 删除全部涂抹
      gFirstMaskLayer.removeAllActions();
    },
    // 刷新图层
    refresh() {
      gMap.refresh();
    },
    // 保存标记位置
    savebtn() {
      const rleData = gFirstFeatureLayer.getAllFeatures();
      console.log("--rleData--", rleData);
      this.rleData[this.currindex] = rleData;
      this.$message({
        message: "保存成功",
        type: "success",
      });
    },

    // 删除图层
    btnclearimg() {
      // gMap.removeAllLayers();
      gMap.removeLayerById("first-layer-image");
    },
    // 添加图层
    btnadd() {
      gImageLayer = new AILabel.Layer.Image(
        "first-layer-image", // id
        {
          src: this.curimg,
          width: 790,
          height: 520,
          position: {
            // 图片左上角坐标
            x: 0,
            y: 0,
          },
        }, // imageInfo
        { name: "第一个图片图层" }, // props
        { zIndex: 5 } // style
      );
      gMap.addLayer(gImageLayer);
    },
    // 缩小
    zoomIn() {
      gMap.zoomIn();
    },
    // 放大
    zoomOut() {
      gMap.zoomOut();
    },
    // 初始化容器
    showmarkimg() {
      let box = document.getElementById("hello-map2");
      let boxWidth = box.offsetWidth;
      let boxHeight = box.offsetHeight;
      let zommNum = boxWidth / boxHeight;
      let zommNum2 = this.imgWidth / this.imgHeight;
      // 创建容器
      gMap = new AILabel.Map("hello-map2", {
        center: { x: this.imgWidth / 2, y: this.imgHeight / 2 },
        zoom: this.imgWidth * (zommNum > zommNum2 ? zommNum2 : 1.2),
        mode: "RECT", // 绘制线段
        refreshDelayWhenZooming: true, // 缩放时是否允许刷新延时，性能更优
        zoomWhenDrawing: true, // 绘制时可滑轮缩放
        panWhenDrawing: false, // 绘制时可到边界外自动平移
      });

      // 添加图片层
      gImageLayer = new AILabel.Layer.Image(
        "first-layer-image", // id
        {
          src: this.imgsrcNow,
          width: this.imgWidth,
          height: this.imgHeight,
          position: {
            // 图片左上角坐标
            x: 0,
            y: 0,
          },
        }, // imageInfo
        { name: "第一个图片图层" }, // props
        { zIndex: 5 } // style
      );
      gMap.addLayer(gImageLayer);

      // 实例化
      gFirstFeatureLayer = new AILabel.Layer.Feature(
        "first-layer-feature", // id
        { name: "第一个矢量图层" }, // props
        { zIndex: 10 } // style
      );
      gMap.addLayer(gFirstFeatureLayer);

      // 涂抹层
      gFirstMaskLayer = new AILabel.Layer.Mask(
        "first-layer-mask", // id
        { name: "第一个涂抹图层" }, // props
        { zIndex: 11, opacity: 0.5 } // style
      );
      gMap.addLayer(gFirstMaskLayer);

      // 添加文本层
      gTextLayer2 = new AILabel.Layer.Text(
        "first-layer-text", // id
        { name: "第一个文本图层" }, // props
        { zIndex: 12, opacity: 1 } // style
      );
      gMap.addLayer(gTextLayer2);

      // 添加图形
      // this.addmoredata();
    },
    // 添加图形
    addmoredata() {
      console.log(this.rleData);
      that = this;
      let rectFeature; // 添加矩形
      let gFirstFeaturePolygon; // 添加多边形
      let gFirstText; // 添加文字
      this.rleData &&
        this.rleData[this.currindex] &&
        this.rleData[this.currindex].forEach((ele) => {
          console.log(ele);
          if (ele.type == "RECT") {
            rectFeature = new AILabel.Feature.Rect(
              ele.id, // id
              ele.shape, // shape
              ele.props, // props
              ele.style // style
            );
            gFirstFeatureLayer.addFeature(rectFeature);
            that.RectList.push(rectFeature);
            that.form.id = ele.id;
            that.form.type = "rect";
            that.form.points = ele.shape;
            that.initText();

            // 判断是否有 text
            if (ele.props && ele.props.text) {
              gFirstText = new AILabel.Text(
                ele.props.textId, // id
                {
                  text: ele.props.text,
                  position: { x: ele.shape.x, y: ele.shape.y },
                  offset: { x: 0, y: 0 },
                }, // shape, 左上角
                {
                  name: "第一个文本对象",
                  textId: ele.props.textId,
                  deleteMarkerId: ele.props.deleteMarkerId,
                }, // props
                {
                  fillStyle: "#F4A460",
                  strokeStyle: "#D2691E",
                  background: true,
                  globalAlpha: 1,
                  fontColor: "#0f0",
                } // style
              );
              gFirstTextLayer.addText(gFirstText);
            }
          } else if (ele.type == "POLYGON") {
            gFirstFeaturePolygon = new AILabel.Feature.Polygon(
              ele.id, // id
              ele.shape, // shape
              ele.props, // props
              ele.style // style
            );
            gFirstFeatureLayer.addFeature(gFirstFeaturePolygon);
            if (ele.props && ele.props.text) {
              gFirstText = new AILabel.Text(
                ele.props.textId, // id, // id
                {
                  text: ele.props.text,
                  position: ele.shape.points[0],
                  offset: { x: 0, y: 0 },
                }, // shape, 左上角
                {
                  name: "第一个文本对象",
                  textId: ele.props.textId,
                  deleteMarkerId: ele.props.deleteMarkerId,
                }, // props
                {
                  fillStyle: "#F4A460",
                  strokeStyle: "#D2691E",
                  background: true,
                  globalAlpha: 1,
                  fontColor: "#0f0",
                } // style
              );
              gFirstTextLayer.addText(gFirstText);
            }
          }
        });
    },
    // 更新故障框位置大小
    updatePosition(row) {
      //  this.formArr
      for (let index = 0; index < this.formArr.length; index++) {
        const element = this.formArr[index];
        if (element.id === row.id) {
          //
          // this.RectList
          let fea = gFirstFeatureLayer.getFeatureById(element.id);
          let exitArray = [],
            noExitArray = [];
            console.log(element,33333)
          // element.maskPoints.forEach((item) => {
          //   if (fea.captureWithPoint(item)) {
          //     exitArray.push(item);
          //   } else {
          //     noExitArray.push(item);
          //   }
          // });
          element.points = row.shape;
          // element.maskPoints = exitArray;
          // 擦除矩形外的涂抹
          this.clearMaskgetPont(noExitArray);
        }
      }
    },
    // 擦除--更新故障涂抹数据，故障框
    clearMaskgetPont(points) {
      let mode = gMap.mode;
      if (points.length > 0) {
        const relatedDeleteMarkerId = `label-marker-id-${+new Date()}`;
        this.setMode("CLEARMASK");
        const scale = gMap.getScale();
        const width = drawingStyle.lineWidth / scale;
        const clearMaskAction = new AILabel.Mask.Clear(
          relatedDeleteMarkerId, // id
          { points: points, width } // shape
        );
        gFirstMaskLayer.addAction(clearMaskAction);
      }
      this.setMode(mode);
    },
    successed() {
      that = this;
      this.showmarkimg();
      this.huixian();
      this.setMode("RECT");
      // 绘制结束
      gMap.events.on("drawDone", (type, data, data1) => {
        // console.log('type, data', type, data);
        // 唯一ID
        const relatedTextId = `label-text-id-${+new Date()}`;
        const relatedDeleteMarkerId = `label-marker-id-${+new Date()}`;
        console.log(type);
        // 添加标注
        if (type === "MARKER") {
          console.log("sssssss");
          const marker = new AILabel.Marker(
            relatedDeleteMarkerId, // id
            {
              src: deleteIcon,
              position: data,
              offset: {
                x: -16,
                y: 32,
              },
            }, // markerInfo
            { name: "第一个marker注记" } // props
          );
          marker.events.on("click", (marker) => {
            console.log("marker click");

            gMap.markerLayer.removeMarkerById(marker.id);
          });
          gMap.markerLayer.addMarker(marker);
        }
        // 添加点
        else if (type === "POINT") {
          const pointFeature = new AILabel.Feature.Point(
            relatedDeleteMarkerId, // id
            { ...data, sr: 3 }, // shape
            {
              name: "第一个矢量图层",
              textId: relatedTextId,
              deleteMarkerId: relatedDeleteMarkerId,
            }, // props
            drawingStyle // style
          );
          gFirstFeatureLayer.addFeature(pointFeature);
        }
        // 添加圆
        else if (type === "CIRCLE") {
          // data 代表r半径shape；data1代表sr半径shape
          const circleFeature = new AILabel.Feature.Circle(
            relatedDeleteMarkerId, // id
            data, // data1代表屏幕坐标 shape
            {
              name: "第一个矢量图层",
              textId: relatedTextId,
              deleteMarkerId: relatedDeleteMarkerId,
            }, // props
            { fillStyle: "#F4A460", strokeStyle: "#D2691E", lineWidth: 2 } // style
          );
          gFirstFeatureLayer.addFeature(circleFeature);
        }
        // 添加线段
        else if (type === "LINE") {
          const scale = gMap.getScale();
          const width = drawingStyle.lineWidth / scale;
          const lineFeature = new AILabel.Feature.Line(
            relatedDeleteMarkerId, // id
            { ...data, width }, // shape
            {
              name: "第一个矢量图层",
              textId: relatedTextId,
              deleteMarkerId: relatedDeleteMarkerId,
            }, // props
            drawingStyle // style
          );
          gFirstFeatureLayer.addFeature(lineFeature);
        }
        // 添加多线段
        else if (type === "POLYLINE") {
          const scale = gMap.getScale();
          const width = drawingStyle.lineWidth / scale;
          const polylineFeature = new AILabel.Feature.Polyline(
            relatedDeleteMarkerId, // id
            { points: data, width }, // shape
            {
              name: "第一个矢量图层",
              textId: relatedTextId,
              deleteMarkerId: relatedDeleteMarkerId,
            }, // props
            drawingStyle // style
          );
          gFirstFeatureLayer.addFeature(polylineFeature);
        }
        // 添加矩形
        else if (type === "RECT") {
          that.setSelected();
          const rectFeature = new AILabel.Feature.Rect(
            relatedDeleteMarkerId, // id
            data, // shape
            {
              name: "矢量图形",
              textId: relatedTextId,
              deleteMarkerId: relatedDeleteMarkerId,
              text: this.value,
            }, // props
            drawingStyle // style
          );
          gFirstFeatureLayer.addFeature(rectFeature);
          that.RectList.push(rectFeature);
          that.form.id = relatedDeleteMarkerId;
          that.form.type = "rect";
          that.form.points = data;
          that.form.maskPoints = data;
          that.initText();
          // this.form.fault_type = fault_type;
          // this.form.id = relatedDeleteMarkerId;
          // this.form.type = "rect";
          // this.form.points = fea.points;
          // this.form.handling_suggestions = element.handling_suggestions;
          // this.form.fault_level = element.fault_level;

          // 添加feature标签名
          // const { x: ltx, y: lty } = data;
          // const gFirstText = new AILabel.Text(
          //   relatedTextId, // id
          //   {
          //     text: this.value,
          //     position: { x: ltx, y: lty },
          //     offset: { x: 0, y: 0 },
          //   }, // shape, 左上角
          //   {
          //     name: "第一个文本对象",
          //     textId: relatedTextId,
          //     deleteMarkerId: relatedDeleteMarkerId,
          //   }, // props
          //   {
          //     fillStyle: "#F4A460",
          //     strokeStyle: "#D2691E",
          //     background: true,
          //     globalAlpha: 1,
          //     fontColor: "#0f0",
          //   } // style
          // );
        
          // gFirstTextLayer.addText(gFirstText);
        }
        // 添加多边形
        else if (type === "POLYGON") {
          const polygonFeature = new AILabel.Feature.Polygon(
            relatedDeleteMarkerId, // id
            { points: data }, // shape
            {
              name: "矢量图形2",
              textId: relatedTextId,
              deleteMarkerId: relatedDeleteMarkerId,
              text: this.value,
            }, // props
            drawingStyle // style
          );
          gFirstFeatureLayer.addFeature(polygonFeature);

          // 添加feature标签名
          const { x: ltx, y: lty } = data[0];
          const gFirstText = new AILabel.Text(
            relatedTextId, // id
            {
              text: this.value,
              position: { x: ltx, y: lty },
              offset: { x: 0, y: 0 },
            }, // shape, 左上角
            {
              name: "第一个文本对象",
              textId: relatedTextId,
              deleteMarkerId: relatedDeleteMarkerId,
            }, // props
            {
              fillStyle: "#F4A460",
              strokeStyle: "#D2691E",
              background: true,
              globalAlpha: 1,
              fontColor: "#0f0",
            } // style
          );
          gFirstTextLayer.addText(gFirstText);
        }
        // 添加涂抹
        else if (type === "DRAWMASK") {
          // debugger
          const scale = gMap.getScale();
          const width = drawingStyle.lineWidth / scale;
          const drawMaskAction = new AILabel.Mask.Draw(
            relatedDeleteMarkerId, // id
            "铅笔",
            { points: data, width }, // shape
            {
              name: "港币",
              price: "1元",
              textId: relatedTextId,
              deleteMarkerId: relatedDeleteMarkerId,
            }, // props
            drawingStyle // style
          );
          gFirstMaskLayer.addAction(drawMaskAction);
          localStorage.setItem("maskPoints", JSON.stringify(data));
          console.log("涂抹data", data);
          let rectPoint = that.getRectPoint(data);
          console.log(rectPoint);
          that.setdrawRect({
            data: rectPoint,
            extData: {
              name: "港币",
              price: "1元",
              points: data,
              textId: relatedTextId,
              deleteMarkerId: relatedDeleteMarkerId,
            },
          });
        }
        // 添加擦除
        else if (type === "CLEARMASK") {
          const scale = gMap.getScale();
          const width = drawingStyle.lineWidth / scale;
          const clearMaskAction = new AILabel.Mask.Clear(
            relatedDeleteMarkerId, // id
            { points: data, width } // shape
          );
          gFirstMaskLayer.addAction(clearMaskAction);
          // that.clearMaskgetPont(data);
        }
      });
      // click单击事件
      gMap.events.on("click", (point) => {
        console.log("--click--", point);
        that.clickCallback(point.global, that.RectList);
      });
      gMap.events.on("boundsChanged", (data) => {
        console.log("--map boundsChanged--", data);
      });
      gMap.events.on("featureSelected", (feature) => {
        // 高亮选中feature
        gMap.setActiveFeature(feature);
        const markerId = feature.props.deleteMarkerId;
        const textId = feature.props.textId;
        // 禁止重复编辑
        const mappedMarker = gMap.markerLayer.getMarkerById(markerId);
        if (mappedMarker) {
          return;
        }
        console.log("双击编辑");
        let features;
        if (feature.type == "POLYGON") {
          // console.log(feature.shape.points);
          features = feature.shape.points[1];
        } else if (feature.type == "RECT") {
          features = feature.getPoints()[1];
        }
        // 添加delete-icon
        gFirstMarker = new AILabel.Marker(
          markerId, // id
          {
            src: deleteIcon,
            position: features, // 矩形右上角
            offset: {
              x: -20,
              y: -4,
            },
          }, // markerInfo
          { name: "第一个marker注记" } // props
        );
        gFirstMarker.events.on("click", (marker) => {
          console.log(marker);
          // 首先删除当前marker
          gMap.markerLayer.removeMarkerById(marker.id);
          // 删除对应text
          gFirstTextLayer.removeTextById(textId);
          // 删除对应feature
          // gFirstFeatureLayer.removeFeatureById(feature.id);
          that.deleteRect(marker.id);
        });

        gMap.markerLayer.addMarker(gFirstMarker);
      });
      gMap.events.on("featureUnselected", (feature) => {
        console.log("取消featureSelected");
        gMap.setActiveFeature(null);
        gMap.markerLayer.removeMarkerById(feature.props.deleteMarkerId);
      });
      gMap.events.on("featureUpdated", (feature, shape) => {
        console.log("移动更新");
        console.log("featureUpdated", feature, shape);
        feature.updateShape(shape);
        // 更新标记
        // 更新text位置
        // 唯一ID
        const markerId = feature.props.deleteMarkerId;
        const textId = feature.props.textId;
        console.log(markerId, textId);
        // 更新marker位置
        targetMarker = gMap.markerLayer.getMarkerById(markerId);
        // console.log(targetMarker);
        targetMarker.updatePosition(
          feature.type == "POLYGON"
            ? feature.shape.points[1]
            : feature.getPoints()[1]
        );
        that.updatePosition(feature);
        // 更新text位置
        // targetText = gFirstTextLayer.getTextById(textId);
        // console.log("--targetText--", targetText);
        // targetText.updatePosition(
        //   feature.type == "POLYGON"
        //     ? feature.shape.points[0]
        //     : feature.getPoints()[0]
        // );
      });
      gMap.events.on("featureDeleted", ({ id: featureId }) => {
        gFirstFeatureLayer.removeFeatureById(featureId);
      });
    },

    // 通过审核
    // passExamine() {
    //   console.log(this.originForm);
    //   this.$zklfhttp({
    //     // formdata 传值方式
    //     url: "/wtg_web/api/v1/MarkSubTask/",
    //     method: "put",
    //     data: {
    //       subtask_id: this.originForm.subtask_id,
    //       image_md5: this.originForm.id,
    //       mark_status: "2",
    //     },
    //   }).then((data) => {
    //     if (data && data.code === 1000) {
    //       this.$message.success("该图片标注审核通过");
    //     } else {
    //       this.$message.error("发生错误");
    //     }
    //   });
    // },
    getRectPoint(data) {
      let num = gMap.getScale();
      let arr_x = data.map((element) => {
        return element.x;
      });
      let arr_y = data.map((element) => {
        return element.y;
      });
      let x_min = arr_x.min();
      let x_max = arr_x.max();
      let y_min = arr_y.min();
      let y_max = arr_y.max();
      let point = [
        { x: x_min, y: y_min },
        { x: x_max, y: y_min },
        { x: x_max, y: y_max },
        { x: x_min, y: y_max },
      ];
      return {
        x: x_min - drawingStyle.lineWidth / 2 / num,
        y: y_min - drawingStyle.lineWidth / 2 / num,
        width: x_max - x_min + drawingStyle.lineWidth / num,
        height: y_max - y_min + drawingStyle.lineWidth / num,
      };
    },
    setdrawRect(row, form = undefined) {
      // this.form = JSON.parse(JSON.stringify(this.form));
      console.log(row,form,11111)
      this.setSelected();
      this.setMode("RECT");
      let data = row.data;
      let relatedDeleteMarkerId = row.extData.deleteMarkerId;
      let points = row.extData.points || undefined;
      const rectFeature = new AILabel.Feature.Rect(
        relatedDeleteMarkerId, // id
        data, // shape
        {
          name: "矢量图形",
          deleteMarkerId: relatedDeleteMarkerId,
          points: points,
        }, // props
        drawingStyle // style
      );
      gFirstFeatureLayer.addFeature(rectFeature);
      this.RectList.push(rectFeature);
      this.form.id = relatedDeleteMarkerId;
      this.form.type = "rect";
      this.form.points = data;
      this.form.maskPoints = points;
    
      this.initText();
      // this.setMode("PAN");
      this.setMode("DRAWMASK");
    },
    // 标注完成
    backailabel() {
      let that = this;
      // that
      //   .$http({
      //     // formdata 传值方式
      //     url: "api/inspection/inspection/taskPlan/update",
      //     method: "post",
      //     data: {
      //       id: that.taskNum,
      //       taskPlanCode: that.taskId,
      //       status: 13,
      //     },
      //   })
      //   .then((data) => {
      //     if (data && data.status == 200) {
            that.$message.success("标注完成！");
            let id = that.taskNum
            that.$db.dataList.update(id,{status:10,isSync: 0,statusName: '已完成标注',localStatus: '已完成标注'})
            that.$emit("refresh",this.formObj);
      //       that.handleCancel();
      //     }
      //   });
    },
    getLabelByValue(value, array) {
      if (!isNaN(value - 0)) {
        return array.filter((item) => {
          return item.value == value;
        })[0];
      } else {
        return array.filter((item) => {
          return item.label == value;
        })[0];
      }
    },
    setSizeMask(point, val) {
      let imgWidth = val.width;
      let imgHeight = val.height;
      let array = [];
      if (point) {
        point.forEach((element) => {
          let x = (element.x / imgWidth).toFixed(2);
          let y = (element.y / imgHeight).toFixed(2);
          array.push({ x: x, y: y });
        });
      }

      return array;
    },
    // 提交操作
   
 
    // 根据存储的左上角为原点的(x, y,width, height)，转换为图片中心为原点的（x, y, w, h）
    getposition(array) {
      let obj1 = {
        x: array[0],
        y: array[1],
      };
      let obj2 = {
        x: array[0] + array[2],
        y: array[1],
      };
      let obj3 = {
        x: array[0] + array[2],
        y: array[1] + array[3],
      };
      let obj4 = {
        x: array[0],
        y: array[1] + array[3],
      };
      return [obj1, obj2, obj3, obj4];
    },
    guid() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    },
    myIsNaN(value) {
      return typeof value === "number" && !isNaN(value);
    },
    // 根据数据，循环回显矩形
    huixian() {
      // debugger;
      let imgSrc = document.getElementById("mapImg2");
      // let imgWidth =
      //   imgSrc.naturalWidth /
      //   this.originForm.compressed_image_size.split(",")[1];
      // let imgHeight =
      //   imgSrc.naturalHeight /
      //   this.originForm.compressed_image_size.split(",")[0];
      console.log(this.subForm,666)
      for (let index = 0; index < this.subForm.length; index++) {
        const element = this.subForm[index];
        if (element.xy) {
          // 操作页面保存的故障类型为数字

          
        } else {
         
       
          element.id = this.guid();
          let x =
            Number(this.subForm[index].fault_location.split(",")[0]) ;
          let y =
            Number(this.subForm[index].fault_location.split(",")[1]) ;
          let w =
            Number(
              this.subForm[index].fault_location.split(",")[2] -
                this.subForm[index].fault_location.split(",")[0]
            ) ;
          let h =
            Number(
              this.subForm[index].fault_location.split(",")[3] -
                this.subForm[index].fault_location.split(",")[1]
            ) ;
          // let xy = this.subForm[index].fault_location.split(',').split(" ")[0].split(",");
          // let wh = this.subForm[index].fault_location.split(" ")[1].split(",");
          element.xy = [x, y, w, h];
        }

        // console.log('xy',element.xy)

        // let posi = this.getposition(element.xy);
        // // console.log('posi',posi)
        // element.points = [
        //   this.setscreenToWorld(posi[0]),
        //   this.setscreenToWorld(posi[1]),
        //   this.setscreenToWorld(posi[2]),
        //   this.setscreenToWorld(posi[3]),
        // ];

        // this.huixianByPoint(
        //   element.points,
        //   element.fault_type,
        //   index,
        //   element.id,
        //   element
        // );
        // 涂抹回显
        this.huixianMask({
          type: "RECT",
          points: {
            x: element.xy[0],
            y: element.xy[1],
            width: element.xy[2],
            height: element.xy[3],
          },
          index: index,
          id: element.id,
          props: element,
        });
      }

      // this.drawMask();
    },
    huixianMask(row) {
      if (!gFirstMaskLayer) {
        gFirstMaskLayer = new AILabel.Layer.Mask(
          "rectLayer-" + new Date().getTime(),
          { zIndex: this.rectZIndex, opacity: 0.5 }
        );
        gMap.addLayer(gFirstMaskLayer);
      }
      // 图片形式回显
      // let img = new Image();
      // img.src = minSrc;
      // img.onload =  () => {
      //   gMap.setMode("imgMask");
      // let action =  {
      //   key: 'huixianMask',
      //   name: 'huixianMask',
      //   type: 'imgMask',
      //   image: img,
      // };
      // gFirstMaskLayer.addMaskAction(action)
      // };

      // 数据形式回显

      let type = row.type;
      let points = row.points;
      if (type === "DRAWMASK") {
        this.setMode("DRAWMASK");
        const relatedDeleteMarkerId = `label-marker-id-${+new Date()}`;
        const scale = gMap.getScale();
        const width = drawingStyle.lineWidth / scale;
        const drawMaskAction = new AILabel.Mask.Draw(
          relatedDeleteMarkerId, // id
          "铅笔",
          { points: points, width }, // shape
          { name: "港币", price: "1元" }, // props
          drawingStyle // style
        );
        gFirstMaskLayer.addAction(drawMaskAction);
        let rectPoint = this.getRectPoint(points);
        console.log(rectPoint);
        this.setdrawRect({
          data: rectPoint,
          extData: {
            name: "港币",
            price: "1元",
            deleteMarkerId: relatedDeleteMarkerId,
          },
        });
      } else if (type === "RECT") {
        this.setdrawRect(
          {
            data: points,
            extData: {
              name: "港币",
              price: "1元",
              deleteMarkerId: row.id,
            },
          },
          row.props
        );
      }
    },
    huixianByPoint(points,  ZIndex, id, element) {
      // console.log(points, fault_type, ZIndex, id, element,111)
      this.setRect(points, ZIndex, id, element);
    },
    // 回显矩形
    setRect(points, ZIndex, id, element) {
      // const gFetureStyle = ({
      //   strokeColor: "#58f707",
      //   fillColor: "#58f707",
      //   opacity: 0.2,
      // });
      gMap.setMode("drawMask", {
        strokeColor: "#58f707",
        fillColor: "#58f707",
        opacity: 0.2,
      });
      if (!gFirstFeatureLayer) {
        gFirstFeatureLayer = new AILabel.Layer.Feature(
          "layer-rect" + new Date().getTime(),
          { zIndex: ZIndex + 2, transparent: false }
        );
        gMap.addLayer(gFirstFeatureLayer);
      }

      // const timestamp = new Date().getTime();
      // // 元素添加展示
      // let fea = new AILabel.Feature.Mask(
      //   id,
      //   points,
      //   {
      //     name: fault_type,
      //   },
      //   gFetureStyle
      // );
      // this.RectList.push(fea);
      // this.form.fault_type = fault_type;
      // this.form.id = fea.id;
      // this.form.type = "rect";
      // this.form.points = fea.points;
      // this.form.handling_suggestions = element.handling_suggestions;
      // this.form.fault_level = element.fault_level;
      // // this.form.errorNum = element.errorNum;
      // this.initText(id);

      // gFirstFeatureLayer.addFeature(fea);
      // // if(canChange) {

      // // } else {
      // //   this.resetMode()
      // // }
      // this.setSelected(true);
      // this.addEditRect();
    },
    // 矩形编辑状态，（0.5秒没有改变宽高，位置）时获取矩形数据
    changePoints(id, points) {
      // for (let index = 0; index < this.formArr.length; index++) {
      //   const element = this.formArr[index];
      //   if(id === element.id) {
      //     element["points"] = points;

      //   }
      // }
      let that = this;
      if (!this.debouce1function) {
        this.debouce1function = debouce1(function (id, points) {
          for (let index = 0; index < that.formArr.length; index++) {
            const element = that.formArr[index];
            if (id === element.id) {
              element["points"] = points;
              delete element.xy;
            }
          }
        }, 500);
      }
      this.debouce1function(id, points);
    },
    // 给矩形添加编辑方法
    addEditRect() {
      let that = this;
      // 因为自带编辑功能，故需要以下代码
      gMap.events.on("geometryEditDone", (type, activeFeature, points) => {
        activeFeature.update({ points });
        // activeFeature.show();
      });
      gMap.events.on("geometryEditing", function (type, feature, points) {
        if (!gMap.mLayer) return;

        const marker = gMap.mLayer.getMarkerById(`marker-${feature.id}`);
        const text = gTextLayer2.getTextById(`text` + feature.id);
        // const rect = gFeatureLayer.addFeature(feature);
        // 更新
        // feature.update({points: points});

        if (!marker) return;

        const bounds = AILabel.Util.getBounds(points);
        that.changePoints(feature.id, points);

        const leftTopPoint = bounds[0]; // 边界左上角坐标
        const rightTopPoint = bounds[1]; // 边界右上角坐标
        marker.update({ x: rightTopPoint.x, y: rightTopPoint.y });
        text.update({ pos: { x: leftTopPoint.x, y: leftTopPoint.y } });
      });
      gMap.events.on("mouseDown", (xy) => {
        that.clickCallback(xy, that.RectList);
      });
      // feature-reset监听
      gMap.events.on("featureStatusReset", function () {
        gMap.mLayer.removeAllMarkers();
      });
      gMap.events.on("featureSelected", function (feature) {
        let cFeature = feature;
        // 删除按钮添加
        const featureBounds = cFeature.getBounds();
        const leftTopPoint = featureBounds[0]; // 边界左上角坐标
        const rightTopPoint = featureBounds[1]; // 边界右上角坐标
        let deleteMarker = new AILabel.Marker(`marker-${cFeature.id}`, {
          src: deleteIcon,
          x: rightTopPoint.x,
          y: rightTopPoint.y,
          offset: {
            x: -17,
            y: 0,
          },
          featureId: cFeature.id,
        });
        gMap.mLayer.addMarker(deleteMarker);

        deleteMarker.regEvent("click", function () {
          // 执行选中元素删除
          // gFeatureLayer.removeFeatureById(this.info.featureId);
          that.deleteRect(this.info.featureId);
          // 对应删除标注层中删除（x）icon
          gMap.mLayer.removeAllMarkers();
        });
      });
    },
    // 获取矩形坐标信息（x, y, width, height）
    getxy(arr) {
      let points = [];
      let pointObj = {};
      for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        let obj = this.getscreenToWorld(element);
        points.push(obj);
      }
      pointObj = {
        x: points[0].x,
        y: points[0].y,
        w: points[1].x - points[0].x,
        h: points[3].y - points[0].y,
      };
      return pointObj;
    },
    // 下一张
    nextImg() {
      if (this.imgIndex == this.imgsrcNowList.length - 1) {
        this.$message.success("已经是最后一张了");
        this.spinning = false;
        this.imgIndex = 0;
        this.changeImage(this.imgsrcNowList[this.imgIndex], this.imgIndex);
      } else {
        this.imgIndex++;
        this.changeImage(this.imgsrcNowList[this.imgIndex], this.imgIndex);
      }
    },
    prevImg(){
       if (this.imgIndex == 0) {
        this.$message.success("已经是第一张了");
        this.spinning = false;
        this.imgIndex = 0;
        this.changeImage(this.imgsrcNowList[this.imgIndex], this.imgIndex);
      } else {
        this.imgIndex--;
        this.changeImage(this.imgsrcNowList[this.imgIndex], this.imgIndex);
      }
    },
    // 获取基础信息
    // getBaseData(item) {
    //   return this.$zklfhttp({
    //     url: "/wtg_web/api/v1/MarkSubTask/",
    //     method: "get",
    //     params: {
    //       subtask_id: item.subtask_id,
    //     },
    //   }).then((data) => {
    //     // debugger
    //     if (data && data.code === 1000) {
    //       // return data.subtask_list;

    //       return data.subtask_list.filter((element) => {
    //         return item.md5 === element.image_md5;
    //       })[0];
    //     } else if (data && data.code === 10031) {
    //       // 未知
    //       data.mark_status = "0";
    //       return data;
    //     }
    //   });
    // },
    // 切换第index张图片标注
    changeImage(item, index) {
      let that = this;
      console.log(item,index,8888)
      // this.imgsrcNow = "";
      this.imgIndex = index
      if (gMap) {
        gMap.destroy();
      }
      that.imgsrcNow = 'file://' + item.file_link.replace(/\\/g, "/")
     
      
        
      setTimeout(() => {
        that.successLoading()
        that.getArrayBuffer(item.file)
       }, 150);

    },
    async getArrayBuffer(file){
      let that = this
      EXIF.getData(file, () => {
        const allMetaData = EXIF.getAllTags(file);
        that.imgData.focalLengthIn35mmFilm = allMetaData.FocalLengthIn35mmFilm
        that.imgData.model = allMetaData.Model.replace("Z", "")
      });
      function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsArrayBuffer(file); // 读取为 ArrayBuffer
        });
      }
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const uint8Array = new Uint8Array(arrayBuffer);
      const data = new TextDecoder().decode(uint8Array);

        // 查找 XMP 数据块的起止位置
        const xmpStart = data.indexOf('<x:xmpmeta');
        const xmpEnd = data.indexOf('</x:xmpmeta>') + 12;

        if (xmpStart !== -1 && xmpEnd !== -1) {
            const xmpData = data.substring(xmpStart, xmpEnd);
            console.log('XMP 数据:', xmpData);

            // 使用 DOMParser 解析 XMP 的 XML 数据
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmpData, 'text/xml');
            console.log('xmlDoc 数据:', xmlDoc);
            // 定义命名空间解析器
            const namespaceResolver = (prefix) => {
              const ns = {
                rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                "drone-dji": "http://www.dji.com/drone-dji/1.0/"
              };
              return ns[prefix] || null;
            };

            // 提取值的函数
            function getAttributeValue(xpath) {
              const result = xmlDoc.evaluate(
                xpath,
                xmlDoc,
                namespaceResolver,
                XPathResult.STRING_TYPE,
                null
              );
              const value = result.stringValue;
              return parseFloat(value); // 转换为浮点型
            }
            // 提取 DJI 扩展字段
            that.imgData.gpsLongitude = getAttributeValue("//rdf:Description/@drone-dji:GpsLongitude");
            that.imgData.gpsLatitude = getAttributeValue("//rdf:Description/@drone-dji:GpsLatitude");
            that.imgData.absoluteAltitude = getAttributeValue("//rdf:Description/@drone-dji:AbsoluteAltitude");
            that.imgData.relativeAltitude = getAttributeValue("//rdf:Description/@drone-dji:RelativeAltitude");

            that.imgData.gimbalPitchDegree = getAttributeValue("//rdf:Description/@drone-dji:GimbalPitchDegree");
            that.imgData.gimbalYawDegree = getAttributeValue("//rdf:Description/@drone-dji:GimbalYawDegree");
            that.imgData.gimbalRollDegree = getAttributeValue("//rdf:Description/@drone-dji:GimbalRollDegree");

            that.imgData.lrfTargetDistance = getAttributeValue("//rdf:Description/@drone-dji:LRFTargetDistance");

            // 打印结果
            console.log("GpsLongitude:", JSON.stringify(that.imgData));

        } else {
            console.error('未找到 XMP 数据');
        }
    },
    // 图片加载成功
    successLoading() {
      let img = document.getElementsByClassName("loadingImgbigsiagn2")[0];
      this.imgHeight = img.naturalHeight;
      this.imgWidth = img.naturalWidth;
      this.imgData.picWidth = this.imgWidth
      console.log(this.imgWidth,11111)
      this.gImageLayerArr = [];
      (this.PolygonList = []),
        (this.RectList = []),
        (this.PolylineList = []),
        (this.TextList = []),
        (this.formArr = []);
      this.rectZIndex = 2;
      gMap = null;
      gImageLayer = null;
      gFirstFeatureLayer = null;
      gFirstMaskLayer = null;
      gTextLayer2 = null;

      // this.initgMap();
      this.successed();
      console.log(this.subForm,this.form,4444)
     
      this.saveLoading = false;
    },
    // 初始化文字标注
    initText() {
      console.log("initText", this.form);
      // gTextLayer2 = new AILabel.Layer.Text(this.form.id, {zIndex: 20});
      // gMap.addLayer(gTextLayer2);

      let posi = this.getPath(this.form.points);
      this.imgPoints = posi
      const exePath = '../static/draw.exe';  //  C:/Users/Administrator/Desktop/web/electron-vue2/src/static/draw.exe
      const publicExePath = process.env.NODE_ENV== 'development'? "C:/Users/Administrator/Desktop/web/electron-vue2/src/static/draw.exe": path.join(__dirname, exePath);
      const exeUrl = publicExePath;
      const transformedData = Object.fromEntries(
        Object.entries(this.imgData).map(([key, value]) => [key, String(value)])
      );
      const jsonString = JSON.stringify(transformedData).replace(/"/g, '\\"');
      const cmd = `${exeUrl} ${jsonString} ${posi}`;
      console.log(cmd,6666)
      // const command = spawn(`${exeUrl}`, [`'${jsonString}'`, `'${posi}'`]);
      // command.stdout.on('data', (data) => {
      //   const decodedData = iconv.decode(data, 'gbk');
      //   console.log(`stdout: ${decodedData}`);
      // });

      // command.stderr.on('data', (data) => {
      //   console.error(`stderr: ${data}`);
      // });

      // command.on('error', (error) => {
      //   console.error(`执行出错: ${error.message}`);
      // });

      // command.on('close', (code) => {
      //   console.log(`子进程退出，退出码 ${code}`);
      // });
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error('执行命令出错:', error);
          
          that.$alert(`生成出错:${error}`)
          return;
        }else{
          const decodedData = iconv.decode(stdout, 'gbk');
          const [length, width] = decodedData.split(' ');
          let label = `W：${length}m，H：${width}m`;
          that.setText(that.form.points,that.form,label)
          console.log(decodedData,6666)
          console.log(stderr,7777)
        }
      })
      this.formArr.push(JSON.parse(JSON.stringify(this.form)));
    },
    // 获取矩形左上角坐标
    getMinXMaxY(points) {
      let x = points[0].x,
        y = points[0].y;
      for (let index = 1; index < points.length; index++) {
        let element = points[index];
        if (x > element.x) {
          x = element.x;
        }
        if (y < element.y) {
          y = element.y;
        }
      }
      return { x: x, y: y };
    },
    // 更新文字标注
    updateText(next) {
      // this.form
      this.isnext = next || "";
      if (next) {
        this.spinning = true;
      }
      

      
    },
    // 更新当前标注文件
   
    // 设置（回显）文字标注
    setText(xy, form,label) {
      let that = this;
      console.log(xy.x,xy.y)
      const timestamp = new Date().getTime();
      const text = gTextLayer2.getTextById(form.id);
      const gTextStyle = {
        fontColor: "#FF0000",
        fontSize: 14,
        lineWeight: 2,
        strokeColor: "#1890FF",
        opacity: 1,
      };
     
      // // 文本层实例\添加
      
      // // 文本实例\添加
      // const text = new AILabel.Text('id', {
      //     pos: {x: 0, y: 0},
      //     offset: {x: 0, y: 0},
      //     width: 130,
      //     maxWidth: 300,
      //     text: '我和我的祖国'
      // }, gTextStyle);
      // gTextLayer.addText(text);
      // 文本实例\添加
      if (text) {
        text.show();
        text.update({ text: label });
        console.log(label,123)
      } else {
        let text2 = new AILabel.Text(
          "text" + timestamp,
          {
            position: { x: xy.x, y: xy.y },
            offset: { x: 0, y: -2 },
            maxWidth: 100,
            text: label,
            data: {
              pid: timestamp,
            },
            
          },
          gTextStyle
        );
        // text2.
        that.TextList.push(text2);
        gTextLayer2.addText(text2);
        console.log(label,that.TextList,321)
      }
    },
    // 获取各个点实际px值
    // 把以图片中心为原点的坐标转换为以图片左上角为原点的坐标
    getscreenToWorld(points) {
      // 实际坐标转屏幕坐标。worldToScreen
      // let cx = gMap.getCenter();
      let x = this.imgWidth / 2 + points.x;
      let y = this.imgHeight / 2 - points.y;
      return { x: x, y: y };
      //  屏幕坐标转实际坐标。screenToWorld
    },
    // 把以图片左上角为原点的坐标系转换为以图片中心为原点的坐标系
    setscreenToWorld(points) {
      let x = points.x - this.imgWidth / 2;
      let y = this.imgHeight / 2 - points.y;
      return { x: x, y: y };
    },
    //  矩形x,y,w,h转成对角点
    getPath(array) {  
      let string = `${parseInt(array.x)},${parseInt(array.y)},${parseInt(array.x+array.width)},${parseInt(array.y+array.height)}`
      return string
    },
    // 绘制矩形
    drawRect() {
      let that = this;

      /*
        'pan': 浏览模式
        'drawRect': 矩形绘制
        'drawMask': 多边形绘制
        'drawPoint': 绘制点
        'drawPolyline': 多段线绘制
        'drawMask': 涂抹绘制
        'clearMask': 涂抹清除
        'banMap': 禁止平移缩放
      */
      // const gFetureStyle = ({
      //   strokeColor: "#58f707",
      //   fillColor: "#58f707",
      //   opacity: 0.2,
      // });

      this.setMode("RECT");
     
    },
    clearMask() {
      this.deleteRect();
    },
    pointData() {
      if (!gFirstMaskLayer) {
        gFirstMaskLayer = new AILabel.Layer.Mask(
          "rectLayer-" + new Date().getTime(),
          { zIndex: this.rectZIndex, opacity: 0.5 }
        );
        gMap.addLayer(gFirstMaskLayer);
      }
      // let action = gFirstMaskLayer.getMaskActionsWithPixels(
      //   this.imgWidth,
      //   this.imgHeight
      // );
      const rleData = gFirstMaskLayer.getRleData({
        x: 0,
        y: 0,
        width: 2000,
        height: 2000,
      });

      console.log("rleData", rleData);
      // console.log("gFirstMaskLayer", gFirstMaskLayer);
    },
    // 设置选中及选中样式
    setSelected(index) {
      const gFetureStyle = {
        strokeStyle: "#0000FF",
        fillStyle: "#0000FF",
        opacity: 0.2,
      };
      let arrLength = 0;
      if (!index) {
        arrLength = this.RectList.length;
      } else {
        arrLength = this.RectList.length - 1;
      }
      for (let index = 0; index < arrLength; index++) {
        let element = this.RectList[index];
        let fea = gFirstFeatureLayer.getFeatureById(element.id);
        fea.setStyle(gFetureStyle, {});
      }
    },
    setactiveElement(fea) {
      const gFetureStyle = {
        strokeStyle: "#58f707",
        fillStyle: "#58f707",
        opacity: 0.2,
      };
      this.setSelected();
      fea.setStyle(gFetureStyle, {});
    },
    // 选中回显故障信息
    clickCallback(xy, elementList) {
      console.log("点击：", this.formArr, this.arrIndex);
      let element = this.findClickEvent(xy, elementList);
      if (element) {
        // this.setSelected();
        // element.style = (gFetureStyle);
        let fea = gFirstFeatureLayer.getFeatureById(element.id);
        // fea.setStyle(gFetureStyle, {});
        this.setactiveElement(fea);
        // console.log("form", this.formArr);
        for (let index = 0; index < this.formArr.length; index++) {
          let obj = this.formArr[index];
          if (obj.id === element.id) {
            this.arrIndex = index;
            console.log("点击：", this.formArr, this.arrIndex);
            //  gFirstFeatureLayer.update({obj.id,})
            this.form = JSON.parse(JSON.stringify(obj));
            // if (!this.form.fault_type || this.form.fault_type == "fault") {
            //     this.$message.warning("请选择故障类型!");
            //     return false;
            //   }
            // this.form.fjposition = this.faultArray.filter((item) => {
            //   return item.value === this.form.fault_type;
            // })[0].category_fault;
            this.getscreenToWorld(this.form.points);
            break;
          }
        }
      } else {
        this.arrIndex = this.formArr.length - 1;
      }
    },
    // 获取矩形面积
    getAreaByPoints(element) {
      let area = element["shape"].width * element["shape"].height;
      return area;
    },
    // 找到当前点击元素
    findClickEvent(xy, elementList) {
      let isCaughtList = [];
      let selectElement = null;
      let areaList = [];
      const gFetureStyle = {
        strokeColor: "#0000FF",
        fillColor: "#0000FF",
        opacity: 0.2,
      };
      for (let index = 0; index < elementList.length; index++) {
        let element = elementList[index];
        if (element.captureWithPoint(xy)) {
          let area = this.getAreaByPoints(element);
          element.props["area"] = area;
          areaList.push(area);
          isCaughtList.push(element);
        }
      }
      let minarea = areaList.min();
      for (let i = 0; i < isCaughtList.length; i++) {
        const iselement = isCaughtList[i];
        if (minarea === isCaughtList[i].props.area) {
          return iselement;
        }
      }
    },
    getRect() {
      console.log(this.RectList);
    },
    hideRect(id) {
      if (id) {
        this.RectList.forEach((item) => {
          if (item.id === id) {
            item.hide();
          }
        });
      } else {
        this.RectList.forEach((item) => {
          item.hide();
        });
      }

      // this.RectList[0].hide();
    },
    reviewRect() {
      this.RectList.forEach((item) => {
        item.show();
      });
      // this.RectList[0].show();
    },
    // 获取id在array数组的下标
    getIndexArr(id, array, key = "id") {
      let ddd = -1;
      console.log("id", id);
      for (let index = 0; index < array.length; index++) {
        let element = array[index][key];

        if (id === element) {
          ddd = index;
          break;
        }
      }
      return ddd;
    },
    // 删除标注（有id删除该id对应的标注，没有id删除最后一个）
    deleteRect(id) {
      // debugger
      // 默认最后一个
      let deleteindex = this.formArr.length - 1;

      console.log("this.formArr", JSON.parse(JSON.stringify(this.formArr)));
      // console.log("this.RectList", JSON.parse(JSON.stringify(this.RectList)));
      if (id) {
        let textId = "text" + id;
        // gTextLayer2.removeTextById(textId);
        deleteindex = this.getIndexArr(id, this.RectList);
        this.RectList.splice(deleteindex, 1);
        // this.hideRect(id);
        this.TextList.splice(deleteindex, 1);
        gFirstFeatureLayer.removeFeatureById(id);
        gFirstMaskLayer.removeActionById(id);
        this.$forceUpdate();
      } else if (this.form.id) {
        id = this.form.id;
        deleteindex = this.getIndexArr(id, this.RectList);
        this.RectList.splice(deleteindex, 1);
        // this.hideRect(id);
        this.TextList.splice(deleteindex, 1);
        gFirstFeatureLayer.removeFeatureById(id);
        gFirstMaskLayer.removeActionById(id);
        this.$forceUpdate();
      } else {
        // 点击删除按钮将要删除的元素的是当前选中的
        if (this.formArr[this.formArr.length - 1].id === this.form.id) {
          // gMap.mLayer.removeAllMarkers();
        }
        gFirstFeatureLayer.removeFeatureById(
          this.RectList[this.RectList.length - 1].id
        );
        gFirstMaskLayer.removeActionById(
          this.RectList[this.RectList.length - 1].id
        );
        // let textId = this.getText(this.RectList[this.RectList.length - 1].id);
        // gTextLayer2.removeTextById(textId);
        this.RectList.pop();
        this.TextList.pop();
      }
      // for (let index = 0; index < this.formArr.length; index++) {
      //   const element = this.formArr[index];
      //   if (element.id === id) {
      //     deleteindex = index;
      //   }
      // }
      // deleteindex = this.getIndexArr(id, this.formArr);
      console.log("deleteindex", deleteindex);
      this.formArr.splice(deleteindex, 1);
      this.arrIndex = this.formArr.length - 1;
      this.next = "";
      if (this.formArr.length > 0) {
        this.form = JSON.parse(
          JSON.stringify(this.formArr[this.formArr.length - 1])
        );
        let fea = gFirstFeatureLayer.getFeatureById(this.form.id);
        if (!fea) {
          debugger;
        }
        this.setactiveElement(fea);
      } else {
        this.form.id = undefined;
        
      }
      // console.log("this.formArr", this.formArr);
      // console.log("this.RectList", this.RectList);
      this.updateText('del');
    },
    // 根据文字标注id，获取文字标注所属矩形id
    getText(id) {
      for (let index = 0; index < this.TextList.length; index++) {
        let element = this.TextList[index];
        if (element.data.pid === id) {
          return element.id;
        }
      }
    },
  },
};
</script>
 
<style lang="scss" scoped>
.el-dialog__wrapper {
  >>> .el-dialog {
    .el-dialog__header {
      padding: 20px 20px 10px;
      .el-dialog__title {
        font-size: 24px;
      }
    }
    
  }
  >>> .el-icon-close {
    color: #000;
    font-size: 24px;
  }
}
.el-form-item {
  margin-bottom: 12px;
}
.activeList {
  background: #01c19a;
  cursor: pointer;
  color: #fff;
  border: 0;
  // border-color: #999;
  font-size: 12px;
  font-weight: 600;
  .ant-list-item-metel-description {
    color: #fff;
  }
}
.defaultList {
  opacity: 1;
  background: #1f2d3d;
  cursor: pointer;
  font-size: 12px;
  font-family: Source Han Sans CN, Source Han Sans CN-Normal;
  color: #ffffff;
  // border-color: #999;
  border: 0;
}
.activeColor {
  color: #fff;
  padding-left: 10px;
  font-size: 16px;
  font-weight: 600;
  .ant-list-item-metel-description {
    color: #fff;
  }
}
.defaultColor {
  padding-left: 10px;
  font-size: 16px;
  color: #ffffff;
}
.img-box {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
}

.default .prevSrcBox {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1000000000000;
  background: rgba(255, 255, 255, 0.45);
  overflow: auto;
  .errorsignImage {
    width: 100%;
    height: 100%;
    .errorsignImageimg {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }
  .closePrevBtn {
    position: absolute;
    left: 20px;
    top: 20px;
    width: 40px;
    height: 40px;
    background: #fff;
    border-radius: 20px;
    text-align: center;
    line-height: 40px;
    font-size: 24px;
  }
  .ErrorSign {
    position: absolute;
    border: 1px solid red;
  }
}
.cjhx-box {
  width: 100%;
}
.cjhx-content {
  position: relative;
  height: calc(100vh - 28px);
  padding: 10px;
  display: flex;
  overflow: hidden;
  .content-row {
    position: relative;
    min-width: 260px;
    display: flex;
    flex-direction: column;
    border: 1px #ccc solid;
    // padding: 5px;
    overflow: hidden;
    background: #1f2d3d;
    .resizer {
      position: absolute;
      right: 0;
      width: 5px;
      height: 100%;
      background-color: #ccc;
      cursor: ew-resize;
    }
    .tree-header {
      font-size: 14px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: Microsoft YaHei, Microsoft YaHei-Regular;
      font-weight: 400;
      color: #fff;
      border-bottom: 1px solid #999999;
      .header-title{
        padding: 5px 10px;
        display: flex;
        align-items: center;
        .bot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px #f00 solid;
          margin: 0 5px 0 10px;
        }
      }
      
    }
  }

  .cjhx-map-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    margin: 0 10px;
  }

  .tree-content {
    flex: 1;
    margin-top: 10px;
    padding: 5px;
    overflow: auto;
    >>>.ant-list {
      width: 100% !important;
      >>>.ant-spin-nested-loading{
        width: 100% !important;
        >>>.ant-spin-container{
          width: 100% !important;
        }
      }
      
    }
  }
}
.card-content {
  height: calc(100% - 30px);
  .ant-row {
    height: 100%;
    .ant-col {
      height: 100%;
    }
  }
}

.ailabelEdit-box {
  width:  calc(100% - 2px) ;
  height: calc(100% - 32px);
  border: 1px solid;
  overflow: hidden;
}
.img-info {
  width: 100%;
  border: #000 solid 1px;
  border-bottom: 0;
  box-sizing: border-box;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.img-info-item label {
  width: 90px;
}
#hello-map2 {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
}

.box-right {
  display: flex;
  flex-direction: column;
  .box-card {
    flex: 1;
    overflow: auto;
    >>> .el-card__body {
      padding: 0;
      .tree-header {
        font-size: 14px;
        box-sizing: border-box;
        padding: 15px 5px;
        font-family: Microsoft YaHei, Microsoft YaHei-Regular;
        font-weight: 400;
        color: #000;
        border-bottom: 1px solid #999999;
      }
    }
    .box-form {
      margin-top: 20px;
      padding: 0 20px;
    }
  }
}
</style>
<style>
.cjhx-box2 .el-dialog__body {
    box-sizing: border-box;
    padding: 10px 20px !important;
  }
.cjhx-box2 ul {
margin: 0 !important;
padding: 0 !important;
list-style-type: none !important;

}
.cjhx-box2 li{
  box-sizing: border-box;
  padding: 5px;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
}
.cjhx-box2 .ant-list-item-action{
  box-sizing: border-box;
  margin-left: 30px !important;
}
.cjhx-box2 .ant-spin-nested-loading{
  display: flex;
  justify-content: center;
}
.ant-empty-normal{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
@media screen and (max-width: 1366px) {
  /*当屏幕尺寸小于1366px时，应用下面的CSS样式*/
  .box-card .el-card__body {
    padding: 10px;
  }
  .ant-form-item {
    margin-bottom: 12px;
  }
}
.ant-form-item {
  margin-bottom: 10px;
}
</style>
<style lang="scss">
.ant-spin-container{
  width: 100% !important;
}
     
</style>