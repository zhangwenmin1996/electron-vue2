<template>
  <div class="cjhx-box2">
    <el-dialog
      :title="title"
      :visible.sync="visible"
      :fullscreen="true"
      @ok="handleOk"
      :before-close="handleCancel"
      center
    >
      <!-- <template slot="footer" v-if="openType === 'examine'">
        <el-button key="back" @click="backailabel()"> 重新标注 </el-button>
        <el-button key="submit" type="primary" @click="passExamine()">
          通过审核
        </el-button>
      </template>
      <template slot="footer" v-else>
        <p></p>
      </template> -->
      <div class="cjhx-content">
        <!-- <el-row type="flex" justify="space-between" class="content-row"> -->
        <!-- 树 -->
        <!-- <el-col :span="4"> -->
        <div class="content-row">
          <div class="tree-header">
            <span class="bot"></span><span>故障列表</span>
          </div>
          <div class="tree-content">
            <a-list item-layout="horizontal" :data-source="imgsrcNowList">
              <a-list-item
                slot="renderItem"
                slot-scope="item, index"
                :class="imgIndex === index ? 'activeList' : 'defaultList'"
                @click="changeImage(item, index)"
              >
                <a
                  slot="actions"
                  :class="imgIndex === index ? 'activeList' : 'defaultList'"
                >
                  <span type="danger" v-if="item.error_num !== 0">
                    <span :style="imgIndex === index ? 'color:red' : ''"></span
                    >{{ item.error_num }}个故障
                  </span>
                  <span type="success" v-if="item.error_num === 0"> 正常 </span>
                </a>
                <a-list-item-meta>
                  <!-- <a
                    slot="description"
                    :class="imgIndex === index ? 'activeColor' : 'defaultColor'"
                    >故障数量：{{ item.error_num }}</a
                  > -->
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
                <label>区域名称：</label>
                <label v-text="wtgName" readonly="readonly"></label>
              </div>
              <div>
                <el-button
                  @click="
                    setMode('DRAWMASK');
                    btnIndex = 3;
                  "
                  size="small"
                  :type="btnIndex == 3 ? 'primary' : ''"
                  >涂抹</el-button
                >
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
                  >标记故障</el-button
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
        <div class="box-right">
          <!-- <div
            class="globalImageBox"
            style="border: 1px solid; width: 100%"
            :height="gloHeight"
          >
            <global-box
              ref="globalBox2"
              @getGlobalDate="getGlobalDate"
            ></global-box>
          </div> -->
          <el-card class="box-card">
            <div class="tree-header">
              <span class="bot"></span><span>故障信息</span>
            </div>
            <el-form class="box-form" :model="form">
              <el-form-item label="图片名称" :label-width="formLabelWidth">
                  <el-input type="textarea" :rows="2" v-model="form.label" style="width: 100%"/>
                </el-form-item>
                <el-form-item label="故障位置" :label-width="formLabelWidth">
                <el-select
                  v-model="form.fjposition"
                  @change="changePosition"
                  placeholder="请选择故障位置"
                  size="small"
                  style="width: 100%"
                >
                  <el-option
                    v-for="(item, index) in fjpositionList"
                    :key="index"
                     :value="item.code"
                    :label="item.name"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
                <el-form-item label="故障类型" :label-width="formLabelWidth">
                <el-select
                  v-model="form.fault_type"
                  size="small"
                  :showSearch="true"
                  @change="changeSelect"
                  placeholder="请选择故障类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="(item, index) in faultTypeArray"
                    :key="index"
                    :value="item.value"
                    :label="item.fault_type"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              
              <!-- <el-form-item label="图片编号">
                              <el-input v-model="form.label" />
                            </el-form-item> -->
             
              <el-form-item label="故障等级" :label-width="formLabelWidth">
                <el-input v-model="form.fault_level" size="small" readonly />
              </el-form-item>
              <el-form-item label="处理建议" :label-width="formLabelWidth">
                <el-input
                  v-model="form.handling_suggestions"
                  type="textarea"
                  :rows="2"
                  size="small"
                  readonly
                />
              </el-form-item>
              <el-form-item label="故障数量" :label-width="formLabelWidth">
                <el-input size="small" :value="formArr.length" readonly />
              </el-form-item>
              <!-- <el-form-item label="进度" :label-width="formLabelWidth">
                                <a-progress
                                  :percent="progress"
                                />
                                <el-progress :percentage="progress"></el-progress>
                              </el-form-item> -->
              <el-form-item style="text-align: center">
                <el-button
                  style="margin-right: 10px"
                  type="primary"
                  @click="updateText('save')"
                  :loading="saveLoading"
                  size="small"
                >
                  保存
                </el-button>
                <!-- <el-button @click="huixian">标注回显</el-button> -->
                <el-button
                  style="margin-right: 10px"
                  type="primary"
                  @click="updateText('next')"
                  :loading="saveLoading"
                  size="small"
                >
                  保存并且下一张
                </el-button>
                <!-- <el-button style="margin-right: 10px" type="danger"
                                >清空</el-button
                              > -->
                <el-button
                  type="primary"
                  @click="backailabel()"
                  size="small"
                >
                  审核完成
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
 
<script>
import Vue from "vue";
// import GlobalBox from "./global";
// import { myMixin } from "./defect";
// import { getImage } from "@/utils/upload";
import { List, Card, Progress } from "ant-design-vue";
Vue.use(List);
import deleteIcon from "@/assets/delete.png";
let AILabel = require("./js/index");
// import "./js/index";
import { debouce1 } from "./js/debounce";
let requestDB = null;
var db;
let gTextLayer2 = null;
let imgDB = null;
let imgdb = null;
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
      visible: false,
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
        type: "",
        taskId: "",
        subtask_id: "",
        errorNum: 1,
        label: "",
        labelId: "",
        fault_type: "1",
        wtg_id: "",
        ypId: "",
        fjposition: "",
        handling_suggestions: "",
        fault_level: "",
        important: true,
        fea: {},
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
    progress: function () {
      let num = 0;
      for (let index = 0; index < this.imgsrcNowList.length; index++) {
        const element = this.imgsrcNowList[index];
        if (element.imagefault_type !== "未知") {
          num++;
        }
      }
      return Math.floor((num / this.imgsrcNowList.length) * 100);
    },
  },
  //监控data中的数据变化
  watch: {
    // filterText(val) {
    //   this.$refs.tree.filter(val);
    // },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    let that = this;
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
    async getDict() { // 修改  formdata传值方式
     let data = await this.$db.lineList.toArray()
      this.fjpositionList = data
      //   this.$http({
      //     url: 'api/sys/sys/sysDic/queryList',
      //     method: 'post',
      //     data: {
      //         dicName: '塔线故障父类'
      //     },
      // }).then(data=>{
      //   this.fjpositionList = data.data
      // })
    },
    //   初始化标注组件
    init(val) {
      this.version = 1;
      this.showType = val.type
      this.title = val.baseCodeName + "分析结果审核";
      this.taskId = val.taskPlanCode;
      this.taskNum = val.id;
      this.taskStatus = val.status;
      this.renameModelType = val.renameModelType;
      this.subtask_id = val.taskPlanCode;
      // task_id: undefined,
      this.task_id = val.taskPlanCode;
      // wtg_plant_id: undefined,
      this.wtg_plant_id = val.baseCode;
      // wtg_id: undefined,
      this.wtg_id = val.planArea;
      this.openType = "ailabel";
      this.canChange = true;
      this.visible = true;
      this.spinning = false;
      this.wtgName = val.planAreaName;
      requestDB = null;
      db;
      imgDB = null;
      imgdb = null;
      gMap = null;
      gImageLayer = null;
      gFirstMaskLayer = null;
      gFirstFeatureLayer = null;
      gTextLayer2 = null;
      this.imgsrcNowList = [];
      this.imgsrcNow = "";
      this.gloSrc = null;
      this.imgIndex = 0;
      this.treeData = [
        {
          label: val.planAreaName,
          child1: "1",
          disabled: true,
          children: [],
        },
      ];
      this.setSize();
      // this.initIndeedDB();
      let name = val.planArea+'/'+val.taskPlanCode
      this.getDict()
      this.getData(val.taskPlanCode,name)
      this.getErrorType()
      // this.initimgDB();
    },
    async getErrorType(type) {
   
          let data = await this.$db.typeList.toArray()
          let list = []
          let arr = data
          for (let index = 0; index < arr.length; index++) {
            const element = arr[index];
            element.value = element.fault_type_code;
          }
           this.faultArray = arr
          if(type){
            list = arr.filter((item) => {
              return item.category_fault === type;
            })
          }else{
            list = arr
          }
          console.log(list,432423)
          this.faultTypeArray = list;
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
    // 多选  切换故障类型的回调
    changefault_type() {},
    // 单选
    changeSelect() {
      console.log(this.faultArray,222)
      if (!this.form.fault_type || this.form.fault_type == "fault") {
          this.$message.warning("请选择故障类型!");
          return false;
        }
      this.form.fjposition = this.faultArray.filter((item) => {
        return item.value === this.form.fault_type;
      })[0].category_fault;
      this.form.handling_suggestions = this.faultArray.filter((item) => {
        return item.value === this.form.fault_type;
      })[0].handling_suggestions;
      this.form.fault_info = this.faultArray.filter((item) => {
        return item.value === this.form.fault_type;
      })[0].fault_type;
      this.form.fault_level = this.faultArray.filter((item) => {
        return item.value === this.form.fault_type;
      })[0].fault_level;
      let index = this.arrIndex;
      this.formArr[index].fault_type = this.form.fault_type;
      this.formArr[index].fjposition = this.form.fjposition;
      this.formArr[index].handling_suggestions =
        this.form.handling_suggestions != ""
          ? this.form.handling_suggestions
          : "暂无建议";
      this.formArr[index].fault_info = this.form.fault_info;
      this.formArr[index].fault_level = this.form.fault_level;
      this.formArr[index].important = this.form.important;
      // this.form.errorNum = this.form.fault_type === "-1" ? 0 : 1;
    },
    changeSwitch() {
      let index = this.arrIndex;
      this.formArr[index].important = this.form.important;
    },
    changeYp(val) {
      this.formArr.forEach((item) => {
        item.ypId = val;
      });
    },
    changePosition(val) {
      let index = this.arrIndex;
      this.getErrorType(val)
      this.form.fault_type = null
      this.formArr[index].fjposition = val;
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
    // 初始化图片数据库
    initimgDB() {
      let that = this;
      imgDB = window.indexedDB.open("lineImage");
      imgDB.onerror = function (event) {
        console.log("数据库打开报错");
      };

      imgDB.onsuccess = function (event) {
        imgdb = event.target.result;
      };

      imgDB.onupgradeneeded = function (event) {
        imgdb = event.target.result;
        var objectStore;
        if (!imgdb.objectStoreNames.contains("imgTable")) {
          objectStore = imgdb.createObjectStore("imgTable", {
            keyPath: "id",
            autoIncrement: false,
          });
          objectStore.createIndex("id", "id", { unique: false });
        } else {
        }
      };
    },
    readImage(id, callback) {
      var transaction = imgdb.transaction(["imgTable"]);
      var objectStore = transaction.objectStore("imgTable");
      var request = objectStore.get(id);

      request.onerror = function (event) {
        console.log("事务失败");
      };

      request.onsuccess = function (event) {
        if (request.result) {
          callback && callback(request.result);
        } else {
          callback && callback(request.result);
          console.log("未获得数据记录");
        }
      };
    },
    cacheImageAlone(data, link) {
      let that = this;
      that.getBase64(data).then((base64) => {
      let image = new Image();
      image.src = base64;
      image.onload = () => {
          let obj1 = {
              base64: base64,
              id: link, // 图片唯一id：md5值
            };
          that.putIndexedDB(obj1, () => {
            console.log('缓存成功',obj1.id)
          })
      };
    });
    },
    getBase64(imgUrl) {
      return new Promise((resolve) => {
        window.URL = window.URL || window.webkitURL;
        var xhr = new XMLHttpRequest();
        xhr.open("get", imgUrl, true); // 至关重要
        xhr.responseType = "blob";
        xhr.onload = function () {
          if (this.status == 200) {
            //得到一个blob对象
            var blob = this.response;
            console.log("blob", blob); // 至关重要
            let oFileReader = new FileReader();
            oFileReader.onloadend = function (e) {
              let base64 = e.target.result;
              //             console.log("方式一》》》》》》》》》", base64)
              resolve(base64);
            };
            oFileReader.readAsDataURL(blob);
          }
        };
        xhr.send();
      });
    },
    putIndexedDB(obj, callback) {
      let that = this;
      imgDB = window.indexedDB.open("lineImage");
      imgDB.onerror = function (event) {
        console.log("数据库打开报错");
      };

      imgDB.onsuccess = function (event) {
        imgdb = event.target.result;
        var objectStore = imgdb
          .transaction(["imgTable"], "readwrite")
          .objectStore("imgTable");
        // console.log("数据库打开成功");
        objectStore.put(obj);
        callback && callback(obj.id);
        console.log(obj.id, "更新成功");
      };

      imgDB.onupgradeneeded = function (event) {
        imgdb = event.target.result;

        var objectStore;
        if (!imgdb.objectStoreNames.contains("imgTable")) {
          objectStore = imgdb.createObjectStore("imgTable", {
            keyPath: "id",
            autoIncrement: false,
          });
          objectStore.createIndex("id", "id", { unique: false });
        } else {
        }
      };
    },
    async getImages(id,list) {
      let that = this;
      let imgList = await that.$db.imgList.toArray()
            let arr = []
             arr = imgList.map((item) => {
              //  let nameArr = item.split("/")
              //  let file_name = nameArr[nameArr.length-1];
              //  if(this.renameModelType==2){
              //   file_name = nameArr[nameArr.length-2]+'/'+nameArr[nameArr.length-1];
              //  }
              //  let src = file_name.split('.')[0]
              return {
                file_name: item.name,
                show_name: item.showName,
                minio_link: item.fileName,
                file_link: item.imgUrl,
                task_id: that.task_id,
                zone_id: that.wtg_id,
                station_id: that.wtg_plant_id,
                fault_location: '',
                fault_type_code: '',
                release_status: 0,
                important: 1,
                error_num: 0,
                md5: item.imgUrl,
                label: item.showName,
              };
              
            });
             arr.forEach((item, index) => {
              list.forEach((element) => {
                  if (item.file_name == element.file_name) {
                    item.fault_list = element.fault_list;
                    item.error_num = JSON.parse(element.fault_list).length;
                    item.poi_type = element.poi_type;
                    item.position = element.position;
                    item.show_name = element.show_name
                    item.label = element.show_name
                  }
                });
             })
             console.log(that.showType,4235235)
            that.imgsrcNowList = that.showType==1? list : arr
            if (that.imgsrcNowList.length == 0) {
              that.$message.warning("暂无故障信息！");
            }
            this.imgIndex = 0;
             this.changeImage(this.imgsrcNowList[0], this.imgIndex);
        
    },
   async getData(id,name) {
      let that = this;
       
            let arr = await that.$db.markList.toArray()
            
            arr.forEach((item) => {
               let src = item.show_name
              // let arr = item.file_link.split("/");
              let md5 = item.file_link;
              item.label = src;
              item.md5 = md5;
              item.error_num = JSON.parse(item.fault_list).length;
            });
            //  arr = data.report_data.map((item) => {
            //   return {
            //     fileName: item,
            //     taskId: that.task_id,
            //     areaId: that.wtg_id,
            //     plantId: that.wtg_plant_id,
            //     fault_type: "",
            //   };
            // });
            that.imgsrcNowList = arr
           that.getImages(name,arr);
            // console.log(that.imgsrcNowList,31232)
            // that.imgIndex = 0;
            // that.changeImage(that.imgsrcNowList[0], that.imgIndex);
       
    },
    
    // 更新进度和颜色
    updateProgress() {
      let num = 0;
      for (let index = 0; index < this.imgsrcNowList.length; index++) {
        const element = this.imgsrcNowList[index];
        if (element.imagefault_type !== "未知") {
          num++;
        }
      }
      this.progress = Math.floor((num / this.imgsrcNowList.length) * 100);
    },
    // 图片编号排序，设置默认打开的图片（第0个）
    setLabel() {
     
      // 文件夹数组
      let floder = this.imgsrcNowList.map((item) => {
        return item.labelPrev;
      });
      // 去重
      floder = [...new Set(floder)];
      let eleIndex = [];

      for (let i = 0; i < floder.length; i++) {
        const elementj = floder[i];
        let obj = {
          label: parseInt(elementj),
          value: 0,
          arr: [],
        };
        // 将相同文件夹的图片编号放到一个数组内
        for (
          let index = 0, len = this.imgsrcNowList.length;
          index < len;
          index++
        ) {
          const element = this.imgsrcNowList[index];
          if (element["labelPrev"] === elementj) {
            obj.arr.push(parseInt(element["labelNext"]));
          }
        }
        // 获取每个文件夹文件数量
        // obj.value = Math.max.apply(null, obj.arr);
        obj.value = obj.arr.length;
        eleIndex.push(obj);
      }
      this.folderList = eleIndex;
      this.imgIndex = 0;
      // this.getNextImage();
      // console.log(this.imgsrcNowList,1111111)
      this.changeImage(this.imgsrcNowList[0], this.imgIndex);
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
       }, 50);
      
     
    },
  
    // 根据id获取数据
    read(id, callback) {
      let that = this;
      imgDB = window.indexedDB.open("lineImage");
      imgDB.onerror = function (event) {
        console.log("数据库打开报错");
      };
      imgDB.onupgradeneeded = function (event) {
        imgdb = event.target.result;

        var objectStore;
        if (!imgdb.objectStoreNames.contains("imgTable")) {
          objectStore = imgdb.createObjectStore("imgTable", {
            keyPath: "id",
            autoIncrement: false,
          });
          objectStore.createIndex("id", "id", { unique: false });
        } else {
        }
      };
      imgDB.onsuccess = function (event) {
        imgdb = event.target.result;
        var objectStore;
        var request;
        if (!imgdb.objectStoreNames.contains("imgTable")) {
          objectStore = imgdb.createObjectStore("imgTable", {
            keyPath: "id",
            autoIncrement: false,
          });
          objectStore.createIndex("id", "id", { unique: false });
        } else {
          objectStore = imgdb
            .transaction(["imgTable"], "readwrite")
            .objectStore("imgTable");
          request = objectStore.get(id);
        }
        request.onerror = function (event) {
          console.log("事务失败");
        };

        request.onsuccess = function (event) {
          if (request.result) {
            // console.log('Name: ' + request.result.name);
            callback && callback(request.result);
          } else {
            callback && callback(request.result);
          }
        };
      };
    },
    // 遍历数据库获取所有数据
    readAll(subtask_id, callback) {
      let imgIDList = [];
      var objectStore = db.transaction("imgTable").objectStore("imgTable");

      objectStore.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;

        if (cursor) {
          //   console.log("Id: " + cursor.key);
          if (cursor.value.subtask_id === subtask_id) {
            imgIDList.push({
              id: cursor.value.id,
              md5: cursor.value.md5,
              name: cursor.value.name,
              directoryName: cursor.value.directoryName,
              type: cursor.value.type,
              taskId: cursor.value.taskId,
              subtask_id: cursor.value.subtask_id,
              label: cursor.value.label,
              labelId: cursor.value.labelId,
              labelPrev: cursor.value.labelPrev,
              labelNext: cursor.value.labelNext,
              fengji: cursor.value.fengji,
              imagefault_type: cursor.value.imagefault_type,
              wtg_image: cursor.value.wtg_image,
              wtg_id: cursor.value.wtg_id,
              fjposition: cursor.value.fjposition,
              handling_suggestions: cursor.value.handling_suggestions,
              fault_level: cursor.value.fault_level,
              important: cursor.value.important,
              ypId: cursor.value.ypId,
              panorama_location: cursor.value.panorama_location,
              panorama_location_wh: cursor.value.panorama_location_wh,
              error: cursor.value.error,
              errorNum: cursor.value.errorNum,
              fault_type: cursor.value.fault_type,
              description: cursor.value.description,
              errorForm: cursor.value.errorForm,
              GPS: cursor.value.GPS,
              GPSAltitude: cursor.value.GPSAltitude,
              uav_data_type: cursor.value.Model,
            });
          }

          cursor.continue();
        } else {
          callback && callback(imgIDList);
          //   console.log("没有更多数据了！");
        }
      };
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
      this.$emit("refresh");
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
      // gTextLayer2 = new AILabel.Layer.Text("textLayer2" + timestamp, {
      //   zIndex: this.rectZIndex,
      // });
      // gMap.addLayer(gTextLayer2);

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
      gFirstTextLayer = new AILabel.Layer.Text(
        "first-layer-text", // id
        { name: "第一个文本图层" }, // props
        { zIndex: 12, opacity: 1 } // style
      );
      gMap.addLayer(gFirstTextLayer);

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
      if (form) {
        this.form.fault_type = form.fault_type;
        this.form.handling_suggestions = form.handling_suggestions;
        this.form.fault_level = form.fault_level;
        this.form.important = form.important - 0 ? true : false;
      }
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
      //       that.$message.success("标注成功");
      //       that.handleCancel();
      //     }
      //   });
    },
    // 故障信息
    updateErrorInfo(val,subForm) {
      console.log(this.originForm, this.isnext);
      let data = val
      data.file_link = this.originForm.minio_link
      data.minio_bucket_line = 'line'
      data.show_name = this.originForm.show_name
      data.station_id = this.originForm.station_id
      data.zone_id = this.originForm.zone_id
      console.log(data,999)
      this.$db.markList.put(data);
      let obj = {
        fileName: this.originForm.file_name,
        zoneId: this.originForm.zone_id,
        taskId: this.originForm.task_id,
        stationId:this.originForm.station_id,
        faultList: val.fault_list,
        isSync: 0,
        showName: this.originForm.show_name
      }
      console.log(obj,1111)
      this.$db.faultList.put(obj);
      // this.$fetch({
      //   url: "/line/api/v1/line_report/",
      //   method: "post",
      //   data: val,
      // }).then((data) => {
      //   if (data && data.code === 1000) {
          this.$message.success("该图片标注信息保存成功");
      //     // this.getData(this.taskId)
          if (this.isnext === "next") {
            this.nextImg();
          }
      //   } else {
      //   }
      // });
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
    submit() {
      console.log("标注框", this.RectList);
      console.log("全景图", this.panorama);
      console.log("表单", this.formArr);
      console.log(this.originForm, 123);
      let that = this;
      let subForm = [];
      let imgSrc = document.getElementById("mapImg2");
      let imgWidth =
        imgSrc.naturalWidth 
      let imgHeight =
        imgSrc.naturalHeight 
      console.log(
        imgSrc.naturalWidth,
        imgWidth,
        imgSrc.naturalHeight,
        imgHeight
      );

      for (let index = 0; index < this.formArr.length; index++) {
        const element = this.formArr[index];
        // errorNum = errorNum - 0 + (element.errorNum - 0);
        let obj;
        if (!element.fault_type || element.fault_type == "fault") {
          that.$message.warning("请选择故障类型!");
          return false;
        }
        element.fault_info = that.faultArray.filter((item) => {
          return item.value === element.fault_type;
        })[0].fault_type;
        element.fault_level = that.faultArray.filter((item) => {
          return item.value === element.fault_type;
        })[0].fault_level;
        element.fault_info = element.fjposition;
        // element.trail = this.setSizeMask(element.maskPoints, {
        //   width: imgWidth,
        //   height: imgHeight,
        // });
        if (element["points"]) {
          // obj = {
          //   wtg_task_image_id:this.originForm.wtg_task_image_id,
          //   task_id:this.originForm.task_id,
          //   label: element.label,
          //   fault_type: element.fault_type,
          //   id: element.id,
          //   taskId: element.taskId,
          //   subtask_id: element.subtask_id,
          //   imageId: element.imageId,
          //   errorNum: element.errorNum,
          //   wtg_id: element.wtg_id,
          //   handling_suggestions: element.handling_suggestions,
          //   fjposition: element.fjposition,
          //   labelId: element.labelId,
          //   ypId: element.ypId,

          //   xy: [
          //     this.getxy(element["points"]).x/imgWidth,
          //     this.getxy(element["points"]).y/imgHeight,
          //     this.getxy(element["points"]).w/imgWidth,
          //     this.getxy(element["points"]).h/imgHeight,
          //   ],
          // };
          obj = {
            file_name: this.originForm.file_name,
            show_name: this.form.label,
            wtg_plant_id: this.originForm.wtg_plant_id,
            trail: JSON.stringify(element.trail) || "",
            important: 1,
            release_status: 1,
            zone_id: this.wtg_id,
            station_id: this.wtg_plant_id,
            // wtg_task_image_id: this.originForm.wtg_task_image_id,
            task_id: this.originForm.task_id,
            fault_type_code: element.fault_type,
            fault_info: element.fault_info,
            fault_level: element.fault_level,
            handling_suggestions: element.handling_suggestions,
            fault_location: [
              Math.round(element["points"].x) ,
              Math.round(element["points"].y) ,
              Math.round(element["points"].x + element["points"].width),
              Math.round(element["points"].y + element["points"].height),
            ].join(","),
          };
        } else {
          // obj = {
          //   wtg_task_image_id:this.originForm.wtg_task_image_id,
          //   task_id:this.originForm.task_id,
          //   label: element.label,
          //   labelId: element.labelId,
          //   fault_type: element.fault_type,
          //   id: element.id,
          //   taskId: element.taskId,
          //   subtask_id: element.subtask_id,
          //   imageId: element.imageId,
          //   errorNum: element.errorNum,
          //   wtg_id: element.wtg_id,
          //   handling_suggestions: element.handling_suggestions,
          //   fjposition: element.fjposition,
          //   ypId: element.ypId,
          //   xy: element.xy,
          // };
          obj = {
            file_name:  this.originForm.file_name,
            show_name: this.form.label,
            trail: JSON.stringify(element.trail) || "",
            folder_name: this.originForm.folder_name,
            wtg_plant_id: this.originForm.wtg_plant_id,
            release_status: 1,
            zone_id: this.wtg_id,
            station_id: this.wtg_plant_id,
            // wtg_task_image_id: this.originForm.wtg_task_image_id,
            task_id: this.originForm.task_id,
            fault_type_code: element.fault_type,
            fault_info: element.fault_info,
            fault_level: element.fault_level,
            handling_suggestions: element.handling_suggestions,
            important: 1,
            fault_location: [
              element.xy[0],
              element.xy[1],
              (element.xy[0] + element.xy[2]),
              (element.xy[1] + element.xy[3]),
            ].join(","),
          };
        }
        console.log(
          Math.round(element["points"].x),
          Math.round(element["points"].y),
          Math.round(element["points"].x + element["points"].width),
          Math.round(element["points"].y + element["points"].height)
        );
        subForm.push(obj);
      }
      this.updateFormArr();

      // // 本地数据库添加故障信息
      // // this.setOriginDB();
      // // 接口更新故障信息
      let data = {
        file_name: this.originForm.file_name,
        task_id: this.originForm.task_id,
        fault_list: JSON.stringify(subForm),
      };

      this.originForm.poi_type = this.form.fjposition;
      this.originForm.position = this.form.ypId;
      this.originForm.fault_list = data.fault_list;
      this.originForm.label = this.form.label;
      this.originForm.error_num = this.formArr.length;
      console.log(this.originForm, 321);
      this.uploadErrorForm(this.originForm);
      console.log("保存数据", data, subForm);
      if (this.isnext != "") {
        this.updateErrorInfo(data,subForm);
      }
      //
      // // this.setIneedDBErrorDB(objDB);  // spinning
      // // this.subForm = JSON.parse(JSON.stringify(subForm));
    },
    setOriginDB() {
      let that = this;
      var request = db
        .transaction(["imgTable"], "readwrite")
        .objectStore("imgTable")
        .put(this.originForm);

      request.onsuccess = function (event) {
        console.log("数据更新成功");
        that.$message.success("数据更新成功");
        that.uploadErrorForm();
      };

      request.onerror = function (event) {
        console.log("数据更新失败");
        that.$message.error("数据更新失败");
      };
    },
    // 更新标注数据
    uploadErrorForm(res) {
      let that = this;
      that.originForm = [];
      // that.read(that.imgsrcNowList[that.imgIndex].id, (res) => {
      that.imgsrcNowList.splice(that.imgIndex, 1, res);
      that.originForm = JSON.parse(JSON.stringify(res));
      that.$forceUpdate();
      // that.updateProgress();
      // });
    },
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
      for (let index = 0; index < this.subForm.length; index++) {
        const element = this.subForm[index];
        console.log(element.fault_type_code);
        if (element.xy) {
          // 操作页面保存的故障类型为数字

          if (this.myIsNaN(element.fault_type - 0)) {
            element.fault_type = this.getLabelByValue(
              element.fault_type_code,
              this.faultArray
            ).fault_type_code;
          }
        } else {
          element.fault_type = element.fault_type_code;
          if (!element.fault_type || element.fault_type == "fault") {
          this.$message.warning("请选择故障类型!");
          return false;
        }
          element.handling_suggestions = this.faultArray.filter((item) => {
            return item.value === element.fault_type;
          })[0].handling_suggestions;
          element.fjposition = this.faultArray.filter((item) => {
            return item.value === element.fault_type;
          })[0].category_fault;
          // important
          // element.important = this.faultArray.filter((item) => {
          //   return item.value === element.fault_type;
          // })[0].important;
          element.fault_level = this.faultArray.filter((item) => {
            return item.value === element.fault_type;
          })[0].fault_level;
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
          fault_type: element.fault_type,
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
    huixianByPoint(points, fault_type, ZIndex, id, element) {
      // console.log(points, fault_type, ZIndex, id, element,111)
      this.setRect(points, fault_type, ZIndex, id, element);
    },
    // 回显矩形
    setRect(points, fault_type, ZIndex, id, element) {
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
      this.saveLoading = true;
      this.panorama_get = "";
      console.log(item, index);
      let that = this;
      let oldForm = JSON.parse(JSON.stringify(this.form));
      this.imgIndex = index;
      this.arrIndex = 0;
      let mark_info = {};
      if (item) {
        // this.getBaseData(item).then((data) => {
        if (item.error_num != "0" && item.fault_list) {
          mark_info = JSON.parse(item.fault_list);
          item.errorForm = [];
          // item.errorForm = mark_info.fault_location.split(',');
          this.panorama_get = mark_info;
        } else if (item.error_num == "0") {
          item.fault_type = "";
        } else if (!item.fault_list) {
          // item.errorForm
        } else {
          item.errorForm = [];
        }
        this.form = {
          imageId: item.id,
          file_name: item.show_name,
          show_name: item.show_name,
          taskId: item.taskId,
          subtask_id: item.subtask_id,
          label: item.label,
          labelId: item.labelId,
          fault_type: mark_info.fault_type_code,
          errorNum: item.error_num,
          wtg_id: item.wtg_id,
          handling_suggestions: item.handling_suggestions,
          fault_level: item.fault_level,
          important: item.important,
          ypId: item.position,
          fjposition: item.fjposition
        };
        this.imageId = item.id;
        this.imageName = item.name;
        this.imageFolder = item.directoryName;
        this.originForm = JSON.parse(JSON.stringify(item));
        // this.subForm = JSON.parse(JSON.stringify(item.errorForm));
        this.getErrorType(this.form.fjposition)
        this.getNextImage();
        this.spinning = false;
        that.subForm = item.fault_list ? JSON.parse(item.fault_list) : {};
        console.log(that.subForm, this.form,item,213313);
        // });
      }

      // this.getsetIneedDBErrorDB(this.imageId, (res) => {

      // })
      // this.initErrorTable(); this.spinning = false;
    },
    // 重新加载（废弃）
    // reload() {
    //   this.IRbinSrc = "";

    //   gMap.destroy();
    //   this.getImage(this.imgSrcArr[this.imgIndex]).then((val) => {
    //     this.IRbinSrc = val;
    //   });
    // },
    // 图片加载成功
    successLoading() {
      let img = document.getElementsByClassName("loadingImgbigsiagn2")[0];
      this.imgHeight = img.naturalHeight;
      this.imgWidth = img.naturalWidth;

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
      if(this.form.fault_type){
        this.form.fjposition = this.faultArray.filter((item) => {
          return item.value === this.form.fault_type;
        })[0].category_fault;
      }
      this.saveLoading = false;
    },
    // 初始化文字标注
    initText() {
      console.log("initText", this.form);
      
      // this.setText(this.getMinXMaxY(this.form.points), this.form);
      // this.form
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
      // const text = gTextLayer2.getTextById(`text` + this.form.id);
      // if (text) {
      //   let fault_type = "";
      //   if (this.myIsNaN(this.form.fault_type - 0)) {
      //     fault_type = this.getLabelByValue(
      //       this.form.fault_type,
      //       this.faultArray
      //     ).fault_type_code;
      //   } else {
      //     fault_type = this.form.fault_type;
      //   }
      //   text.update({ text: "" });

      //   this.saveGlobal();
      // } else {

        this.submit();
      // };
      // this.saveGlobal();
    },
    // 更新当前标注文件
    updateFormArr() {
      this.form.errorNum = this.formArr.length;
      for (let index = 0; index < this.formArr.length; index++) {
        const element = this.formArr[index];
        if (element.id === this.form.id) {
          element.label = this.form.label;
          element.labelId = this.form.labelId;
          element.fault_type = this.form.fault_type;
          element.fault_info = this.form.fault_info;
          element.fault_level = this.form.fault_level;
          element.errorNum = this.formArr.length;
          element.imageId = this.imageId;
          element.wtg_id = this.form.wtg_id;
          element.ypId = this.form.ypId;
          element.handling_suggestions = this.form.handling_suggestions;
          element.important = this.form.important;
          element.fault_level = this.form.fault_level;
          element.fjposition = this.form.fjposition;
          element.maskPoints = this.form.maskPoints;
        }
      }
    },
    // 设置（回显）文字标注
    setText(xy, form) {
      let that = this;
      const timestamp = new Date().getTime();
      const gTextStyle = {
        fontColor: "#FF0000",
        fontSize: 14,
        strokeColor: "#0000FF",
        opacity: 1,
      };
      // // 文本层实例\添加
      // let gTextLayer = new AILabel.Layer.Text('textLayer', {zIndex: 2});
      // gMap.addLayer(gTextLayer);

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
      let text2 = new AILabel.Text(
        "text" + form.id,
        {
          pos: { x: xy.x, y: xy.y },
          offset: { x: 0, y: 0 },
          maxWidth: 100,
          // text: form.fault_type,
          text: "",
          data: {
            pid: this.form.id,
          },
        },
        gTextStyle
      );
      // text2.
      that.TextList.push(text2);
      gTextLayer2.addText(text2);
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
            if (!this.form.fault_type || this.form.fault_type == "fault") {
                this.$message.warning("请选择故障类型!");
                return false;
              }
            this.form.fjposition = this.faultArray.filter((item) => {
              return item.value === this.form.fault_type;
            })[0].category_fault;
            this.getErrorType(this.form.fjposition)
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
      this.$message.success("删除标注成功！");
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
        this.form.fault_level = undefined;
        this.form.fault_type = undefined;
        this.form.fault_type_code = undefined;
      }
      // console.log("this.formArr", this.formArr);
      // console.log("this.RectList", this.RectList);
      // this.updateText();
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
  width: 100%;
  height: calc(100vh - 118px);
  padding: 10px;
  display: flex;
  overflow: hidden;
  .content-row {
    min-width: 260px;
    max-width: 450px;
    display: flex;
    flex-direction: column;
    border: 1px #ccc solid;
    // padding: 5px;
    overflow: hidden;
    background: #1f2d3d;
    .tree-header {
      font-size: 14px;
      box-sizing: border-box;
      padding: 10px 5px;
      font-family: Microsoft YaHei, Microsoft YaHei-Regular;
      font-weight: 400;
      color: #fff;
      border-bottom: 1px solid #999999;
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
  height: 96%;
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
.bot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px #f00 solid;
  margin: 0 5px 0 10px;
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
    padding: 10px 20px !important;
  }
.cjhx-box2 ul {
margin: 0 !important;
padding: 0 !important;
list-style-type: none !important;

}
.cjhx-box2 li{
  padding: 5px;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
}
.cjhx-box2 .ant-list-item-action{
  margin-left: 30px !important;
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