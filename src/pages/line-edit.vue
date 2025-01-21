<template>
    <div class="cont-table">
        <el-form :model="editForm" label-width="80px" ref="editForm">
            <el-form-item label="计划名称" prop="planName" :rules="[{ required: true, message:'请填写计划名称', trigger: 'blur' }]">
                <el-input v-model="editForm.planName" clearable size="small"></el-input>
            </el-form-item>
            <!-- <el-form-item label="巡检场景" prop="inspectionScene" :rules="[{ required: true, message:  '请选择巡检场景', trigger: 'change' }]">
                <el-select v-model="editForm.inspectionScene" placeholder="请选择巡检场景" clearable size="small" @change="setPlanScene" style="width:100%">
                <el-option
                    v-for="(item,index) in sceneList"
                    :key="index"
                    :label="item.name"
                    :value="item.code"
                />
                </el-select>
            </el-form-item>
            <el-form-item label="巡检设备" prop="inspectionDevice" :rules="[{ required: true, message:  '请选择巡检设备', trigger: 'change' }]">
                <el-select v-model="editForm.inspectionDevice" placeholder="请选择巡检设备" clearable size="small" style="width:100%">
                <el-option
                    v-for="(item,index) in equipmentList"
                    :key="index"
                    :label="item.name"
                    :value="item.code"
                />
                </el-select>
            </el-form-item> -->
            <el-form-item label="公司名称" prop="companyName" :rules="[{ required: true, message:'请填写公司名称', trigger: 'blur' }]">
                <el-input v-model="editForm.companyName" clearable size="small"></el-input>
            </el-form-item>
            <el-form-item v-if="!isEdit" label="电站名称" prop="baseCode" :rules="[{ required: true, message: '请填写电站名称', trigger: 'blur' }]">
                <el-input v-model="editForm.baseCode" clearable size="small"></el-input>
                <!-- <el-select v-model="editForm.baseCode" filterable placeholder="请选择电站" @change="changeBase" clearable size="small" style="width:100%">
                    <el-option
                        v-for="(item,index) in station"
                        :key="index"
                        :label="item.solarName || item.windName || item.name"
                        :value="item.solarCode || item.windCode || item.code"
                    />
                </el-select> -->
            </el-form-item>
            <el-form-item label="巡检回路" prop="loopName" :rules="[{ required: true, message: '请选择巡检回路', trigger: 'blur' }]">
                <el-input v-model="editForm.loopName" placeholder="巡检回路（必填）"  clearable size="small"></el-input>
                <br/>
                <span style="color: #999;font-size: 12px;">如：35kV-集电一线</span>
                <!-- <el-select v-model="editForm.loopName" placeholder="请选择巡检回路" @change="changeLoop" filterable clearable size="small" style="width:100%">
                    <el-option
                        v-for="(item,index) in loopList"
                        :key="index"
                        :label="item.loopName"
                        :value="item.loopName"
                    />
                </el-select> -->
            </el-form-item>
            <el-form-item label="巡检杆塔"  prop="start" :rules="[{ required: true, message: '请填写巡检杆塔号', trigger: 'blur' }]" >
                <el-input v-model="editForm.prefix" placeholder="杆塔前缀（可不填）" clearable size="small" style="width:46%"></el-input>
                <el-input v-model="editForm.suffix" placeholder="杆塔后缀（可不填）" clearable size="small" style="width:46%;margin-left: 2%;"></el-input>
                <br/>
                <el-input v-model="editForm.start" placeholder="杆塔起始号（必填）" clearable size="small" style="width:46%"></el-input>
                <el-input v-model="editForm.num" placeholder="杆塔数量（必填）" clearable size="small" style="width:46%;margin-left: 2%;"></el-input>
                <br/>
                <span style="color: #999;font-size: 12px;">如：创建配网2-11号的杆塔，前缀填：配网，后缀填：号，起始号为2，数量为10</span>
                <!-- <el-select v-model="editForm.planArea" placeholder="巡检杆塔" clearable filterable multiple @change="$forceUpdate()" size="small" style="width:375px">
                    <el-option
                        v-for="(item,index) in zoneList"
                        :key="index"
                        :label="item.loopName+item.zoneName"
                        :value="item.zoneId"
                    />
                </el-select> -->
                <!-- <el-button style="width: 15%" size="small" @click="selectAll">全选</el-button> -->
            </el-form-item>
            
            <el-form-item label="巡检时间" prop="planTime" :rules="[{ required: true, message: '请选择计划巡检时间', trigger: 'blur' }]">
                <el-date-picker
                    v-model="editForm.planTime"
                    type="daterange"
                    :picker-options="pickerOptions"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="yyyy-MM-dd"
                    @blur="dateChange"
                    align="right">
                </el-date-picker>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button class="btn2" @click.native="$emit('save-ok')">取消</el-button>
            <el-button class="btn2" type="primary" @click.native="editSubmit">确定</el-button>
        </div>
    </div>
</template>
<script>
import { getUUID } from "@/api/utils";
export default {
  data() {
    return {
        addName: 'api/inspection/inspection/planBase/insert',
        updateName: 'api/inspection/inspection/planBase/update',
        isShowEdit: false,
        editForm: {
        },
        typeList: [],
        sceneList: [],
        equipmentList: [],
        userList: [],
        zoneList: [],
        solarList: [],
        lineList: [],
        station:[],
        wtgList: [],
        loopList: [],
        stationId:'',
        planTime: [],
        pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }],
          // disabledDate: (time)=>{
          //   return time.getTime() +  3600 * 1000 * 24 < Date.now() - 8.64e6
          // }
        },
        loading:false,
    };
  },
props:{
    data: {
      type: Object
    },
    isEdit:
     {
      type: Number
    },
  },
  created() {
    //   this.getDict('巡检类型').then(data=>{
    //       this.typeList = data.data
    //   })
    //   this.getDict('巡检场景').then(data=>{
    //      this.sceneList = data.data
    //   })
    //   this.getDict('巡检设备').then(data=>{
    //      this.equipmentList = data.data
    //   })
    //   this.getUserList().then(data=>{
    //      this.userList = data.data
    //   })
    //   this.getSolar()
    //   this.getPlant()
    //   this.getLine()
      this.data && (this.editForm = JSON.parse(JSON.stringify(this.data)))
      // if(this.isEdit==1){
          // this.changeBase(this.data.baseCode)
          // this.editForm.planArea = this.data.planArea ? (this.data.planArea.indexOf(',')===-1 ? [this.data.planArea] : this.data.planArea.split(",")) : '' 
        // }
      if(this.data.startTime&&this.data.endTime){
        this.editForm.planTime = [this.data.startTime, this.data.endTime];
      }
	},
  computed:{
    dateOptions (time) {
      
    }, 
  },
  methods: {
    

    
    editSubmit(){
        let that = this
    that.$refs.editForm.validate((valid) => {
      if(valid){
        let areaCodes = []
        const startNumber = parseInt(that.editForm.start);
        const quantity = parseInt(that.editForm.num);
        for (let i = 0; i < quantity; i++) {
            const towerNumber = startNumber + i;
            const towerName = `${that.editForm.prefix||''}${towerNumber}${that.editForm.suffix||''}`;
            areaCodes.push({
                name: towerName,
                code: getUUID()
            })
        }

            
       
        let obj = {
            baseCode: getUUID(),
            baseCodeName: that.editForm.baseCode,
            baseType: 3,
            companyCode: getUUID(),
            companyName: that.editForm.companyName,
            createCode: getUUID(),
            endTime: that.editForm.planTime[1],
            inspectionDeviceName: "",
            inspectionScene: 2,
            inspectionSceneName: "输电线路巡检",
            isDock: false,
            loopName: that.editForm.loopName,
            planArea: "",
            planAreaName: that.editForm.planArea,
            planCode: getUUID(),
            planName: that.editForm.planName,
            planStatus: 2,
            planStatusName: "执行中",
            planType: 1,
            planTypeName: "无人机巡检",
            planWay: 1,
            planWayName: "无人机巡检",
            responsibleCode: "",
            responsibleName: "",
            simpleName: that.editForm.baseCode,
            startTime: that.editForm.planTime[0],
            updateCode: getUUID(),
            updateTime: new Date().getTime(),
        }
        that.$db.planList.put(obj);
        areaCodes.forEach(element => { 
            let obj2 = {
                accuracy: 1,
                analyType: 1,
                analyzeName: "",
                area: "湖北",
                baseCode: obj.baseCode,
                baseCodeName: that.editForm.baseCode,
                baseType: 3,
                companyCode: obj.companyCode,
                companyName: that.editForm.companyName,
                createTime: new Date().getTime(),
                inspectionDeviceName: "",
                inspectionScene: 2,
                loopName: that.editForm.loopName,
                mapStatusName: "消缺中",
                picRenameModelId: 1,
                planArea: element.code,
                planAreaName: element.name,
                planCode: obj.planCode,
                planSourceType: 1,
                planType: 1,
                renameModelType: 2,
                responsibleCode: "f06e8df685fd46ad86287fedbde6384f",
                responsibleName: "何天",
                simpleName: that.editForm.baseCode,
                solar: false,
                status: 0,
                statusName: "待上传",
                subarray: "",
                taskEndTime: '',
                taskPlanCode: getUUID(),
                taskPlanName: that.editForm.planName,
                taskStartTime: '',
                tower: true,
                updateTime: new Date().getTime(),
                useTime: 0,
                wind: false,
            }
            that.$db.dataList.put(obj2);
        });
        that.editOk()
        console.log(planArea,areaCodes,obj,111111)       
        }
      })
    },
    editOk(){
      this.$emit('save-ok')
    },
    getUserCode(val){
        this.userList.forEach(item => {
            if(item.userNickname==val){
                this.editForm.responsibleCode = item.userCode
            }
        });
    },
    dateChange(val){
        this.$forceUpdate();
    }
},
	
};
</script>
<style lang="scss" scoped>
.dialog-footer{
    text-align: center;
    margin-top: 20px;
}

</style>