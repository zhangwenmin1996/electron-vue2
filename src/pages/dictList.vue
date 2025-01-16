<template>
  <div class="app-container">
    <!--查询条件-->
    <el-tabs type="card" v-model="isName" @tab-click="refresh">
      
      <el-tab-pane name="fault" label="故障类型">
        <el-form :model="queryParams" ref="queryForm" :inline="true" >
          <el-form-item label="故障名称" prop="value" >
              <el-input v-model="queryParams.value" placeholder="请输入故障名称" size="small" clearable></el-input>
          </el-form-item>
          <el-form-item label="所属大类" prop="dicName" >
            <el-select popper-class="select-box" v-model="queryParams.category_fault" clearable @change="changeType" placeholder="所属大类" size="small">
              <el-option
                  v-for="(item,index) in tlTypeList"
                  :key="index"
                  :label="item.name"
                  :value="item.name"
              />
            </el-select>
          </el-form-item>
          <div style="float: right">
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" size="mini" @click="search(1)">搜索</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
              <el-button type="primary" size="mini" @click="showEdit(0)">新增故障类型</el-button>
            </el-form-item>
          </div>
        </el-form>
        
      </el-tab-pane>
       <el-tab-pane name="line" label="杆塔位置">
        <el-form :model="queryParams" ref="queryForm" :inline="true" >
          <el-form-item label="位置名称" prop="value" >
              <el-input v-model="queryParams.value" placeholder="请输入故障名称" size="small" clearable></el-input>
          </el-form-item>
          <el-form-item label="杆塔类型" prop="dicName" >
            <el-select popper-class="select-box" v-model="queryParams.category_fault" clearable @change="changeLine" placeholder="杆塔类型" size="small">
              <el-option
                  v-for="(item,index) in lineType"
                  :key="index"
                  :label="item.name"
                  :value="item.name"
              />
            </el-select>
          </el-form-item>
          <div style="float: right">
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" size="mini" @click="search(2)">搜索</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
              <el-button type="primary" size="mini" @click="showEdit(0)">新增杆塔位置</el-button>
            </el-form-item>
          </div>
        </el-form>
      </el-tab-pane>
      
      
    </el-tabs>
   
    <div style="margin:0 0 20px 0;border-top: 1px #ccc solid;"></div>
    <!-- <div style="margin: 10px 0;height: 40px;">
      
    </div> -->
		<!--列表-->
    <el-table :data="list.slice((currentPage - 1) * pageSize, currentPage * pageSize)" max-height="350" border highlight-current-row stripe v-loading="loading">
				<el-table-column align="center" type="index" label="序号" width="60"></el-table-column>
        <el-table-column align="center" prop="category_fault" label="所属大类" v-if="isName=='fault'"></el-table-column>
        <el-table-column align="center" prop="category_fault" label="杆塔类型" v-if="isName=='line'"></el-table-column>
        <el-table-column align="center" prop="value" label="故障名称" v-if="isName=='fault'"></el-table-column>
        <el-table-column align="center" prop="value" label="位置名称" v-if="isName=='line'"></el-table-column>
				<el-table-column align="center" label="操作" width="180">
					<template slot-scope="scope">
            <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleEdit(scope.row,1)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDel(scope.row)"
          >删除</el-button>
					</template>
				</el-table-column>
			</el-table>
      <div class="pagination">
        <el-pagination
           background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :page-sizes="[5, 10, 20, 30, 40]"
          :current-page="currentPage"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
      <el-dialog
      :close-on-click-modal="false"
      :title=" isEdit ? '编辑' : '新增'"
      :visible.sync="isShowEdit"
      v-if="isShowEdit"
      center
      append-to-body
      width="600px"
    >
    <el-form :model="editForm" label-width="80px" ref="editForm">
      <template v-if="isName=='fault'">
        <el-form-item label="所属大类" prop="category_fault" :rules="[{ required: true, message: '请选择所属大类', trigger: 'change' }]">
          <el-select v-model="editForm.category_fault" placeholder="请选择所属大类" size="small">
            <el-option
                  v-for="(item,index) in tlTypeList"
                  :key="index"
                  :label="item.name"
                  :value="item.name"
              />
          </el-select>
      </el-form-item>
      <el-form-item label="故障名称" prop="value" :rules="[{ required: true, message: '请填写故障名称', trigger: 'blur' }]">
          <el-input v-model="editForm.value" placeholder="请输入故障名称" size="small" clearable></el-input>
      </el-form-item>
      </template>
      <template v-if="isName=='line'">
        <el-form-item label="杆塔类型" prop="category_fault" :rules="[{ required: true, message: '请选择杆塔类型', trigger: 'change' }]">
          <el-select v-model="editForm.category_fault" placeholder="请选择杆塔类型" size="small">
            <el-option
                  v-for="(item,index) in lineType"
                  :key="index"
                  :label="item.name"
                  :value="item.name"
              />
          </el-select>
        </el-form-item>
        <el-form-item label="位置名称" prop="value" :rules="[{ required: true, message: '请填写位置名称', trigger: 'blur' }]">
            <el-input v-model="editForm.value" placeholder="请输入位置名称" size="small" clearable></el-input>
        </el-form-item>
      </template>
      
      
    </el-form>
      <div slot="footer" class="dialog-footer">
            <el-button class="btn2" @click.native="isShowEdit=false">取消</el-button>
            <el-button class="btn2" type="primary" @click.native="editSubmit">确定</el-button>
        </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "dictList",
 
  data() {
    return {
      // methodUrl: 'http://192.168.10.45:9020/',
     	queryParams: {
        
      },
      currentPage: 1, // 当前页码
      pageSize: 5, // 每页的数据条数
      isName: 'fault',
			loading: false,
			list: [],
			total: 0,
      isShowEdit: false,
	    isEdit: 0,
      editForm: {},
      lineType: [
      {
          name: "同塔双回",
          code: 1,
        },
        {
          name: "单回杆塔",
          code: 2,
        },
      ],
      tlTypeList: [
        {
          name: "绝缘子",
          code: 1,
        },
        {
          name: "金具",
          code: 2,
        },
        {
          name: "导地线",
          code: 3,
        },
        {
          name: "附属设施",
          code: 4,
        },
        {
          name: "杆塔",
          code: 5,
        },
        {
          name: "基础",
          code: 6,
        },
        {
          name: "通道环境",
          code: 7,
        },
      ],
      list1:[
            {
              category_fault: '绝缘子',
              value: '绝缘子串球头侧R型插销退出',
              fault_type: '绝缘子串球头侧R型插销退出',
            },
            {
              category_fault: '绝缘子',
              value: '绝缘子串球头侧R型插销缺失',
              fault_type: '绝缘子串球头侧R型插销缺失',
            },
            {
              category_fault: '绝缘子',
              value: '绝缘子串碗头侧R型插销退出',
              fault_type: '绝缘子串碗头侧R型插销退出',
            },
            {
              category_fault: '绝缘子',
              value: '绝缘子串碗头侧R型插销缺失',
              fault_type: '绝缘子串碗头侧R型插销缺失',
            },
            {
              category_fault: '绝缘子',
              value: '绝缘子脏污',
              fault_type: '绝缘子脏污',
            },
            {
              category_fault: '绝缘子',
              value: '绝缘子裂纹',
              fault_type: '绝缘子裂纹',
            },
            {
              category_fault: '绝缘子',
              value: '绝缘子自爆',
              fault_type: '绝缘子自爆',
            },
            {
              category_fault: '绝缘子',
              value: '绝缘子破损',
              fault_type: '绝缘子破损',
            },
            {
              category_fault: '绝缘子',
              value: '绝缘子串有雷击痕迹',
              fault_type: '绝缘子串有雷击痕迹',
            },
            {
              category_fault: '绝缘子',
              value: '绝缘子串有拉弧放电痕迹',
              fault_type: '绝缘子串有拉弧放电痕迹',
            },
            {
              category_fault: '绝缘子',
              value: '支撑绝缘子绑扎不规范',
              fault_type: '支撑绝缘子绑扎不规范',
            },
            {
              category_fault: '绝缘子',
              value: '支撑绝缘子松动',
              fault_type: '支撑绝缘子松动',
            },
            {
              category_fault: '绝缘子',
              value: '支撑绝缘子倾斜',
              fault_type: '支撑绝缘子倾斜',
            },
            {
              category_fault: '绝缘子',
              value: '绝缘子球头锈蚀',
              fault_type: '绝缘子球头锈蚀',
            },
            {
              category_fault: '绝缘子',
              value: '绝缘子碗头锈蚀',
              fault_type: '绝缘子碗头锈蚀',
            },
            {
              category_fault: '绝缘子',
              value: '绝缘子串上有异物',
              fault_type: '绝缘子串上有异物',
            },
            {
              category_fault: '绝缘子',
              value: '绝缘子防污帽松动',
              fault_type: '绝缘子防污帽松动',
            },
            {
              category_fault: '绝缘子',
              value: '均压环移位',
              fault_type: '均压环移位',
            },
            {
              category_fault: '金具',
              value: '联板R型插销缺失',
              fault_type: '联板R型插销缺失',
            },
            {
              category_fault: '金具',
              value: '联板R型插销退出',
              fault_type: '联板R型插销退出',
            },
            {
              category_fault: '金具',
              value: '联板螺母缺失',
              fault_type: '联板螺母缺失',
            },
            {
              category_fault: '金具',
              value: '联板螺母退出',
              fault_type: '联板螺母退出',
            },
            {
              category_fault: '金具',
              value: '挂环R型插销缺失',
              fault_type: '挂环R型插销缺失',
            },
            {
              category_fault: '金具',
              value: '挂环R型插销退出',
              fault_type: '挂环R型插销退出',
            },{
              category_fault: '金具',
              value: '线夹螺栓垫片缺失',
              fault_type: '线夹螺栓垫片缺失',
            },
            {
              category_fault: '金具',
              value: '挂环螺母缺失',
              fault_type: '挂环螺母缺失',
            },
            {
              category_fault: '金具',
              value: '挂环螺母退出',
              fault_type: '挂环螺母退出',
            },
            {
              category_fault: '金具',
              value: '线夹螺栓弹簧片缺失',
              fault_type: '线夹螺栓弹簧片缺失',
            },
            {
              category_fault: '金具',
              value: '金具缺插销',
              fault_type: '金具缺插销',
            },
            {
              category_fault: '金具',
              value: '线夹有放电痕迹',
              fault_type: '线夹有放电痕迹',
            },
            {
              category_fault: '金具',
              value: '线夹锈蚀',
              fault_type: '线夹锈蚀',
            },
            {
              category_fault: '金具',
              value: '导线与支柱绝缘子固定不牢',
              fault_type: '导线与支柱绝缘子固定不牢',
            },
            {
              category_fault: '金具',
              value: '金具有放电灼烧痕迹',
              fault_type: '金具有放电灼烧痕迹',
            },
            {
              category_fault: '金具',
              value: '导、地线防振锤脱落',
              fault_type: '导、地线防振锤脱落',
            },
            {
              category_fault: '金具',
              value: '金具有裂纹',
              fault_type: '金具有裂纹',
            },
            {
              category_fault: '金具',
              value: '金具锈蚀',
              fault_type: '金具锈蚀',
            },
            {
              category_fault: '金具',
              value: '防震锤脱落',
              fault_type: '防震锤脱落',
            },
            {
              category_fault: '金具',
              value: '防震锤滑移',
              fault_type: '防震锤滑移',
            },
            {
              category_fault: '金具',
              value: '金具受力部位变形',
              fault_type: '金具受力部位变形',
            },
            {
              category_fault: '导地线',
              value: '导线散股',
              fault_type: '导线散股',
            },
            {
              category_fault: '导地线',
              value: '地线散股',
              fault_type: '地线散股',
            },
            {
              category_fault: '导地线',
              value: '导线断股',
              fault_type: '导线断股',
            },
            {
              category_fault: '导地线',
              value: '地线断股',
              fault_type: '地线断股',
            },
            {
              category_fault: '导地线',
              value: '电缆头螺栓锈蚀',
              fault_type: '电缆头螺栓锈蚀',
            },
            {
              category_fault: '导地线',
              value: '电缆头发热',
              fault_type: '电缆头发热',
            },
            {
              category_fault: '导地线',
              value: '导线锈蚀',
              fault_type: '导线锈蚀',
            },
            {
              category_fault: '导地线',
              value: '地线锈蚀',
              fault_type: '地线锈蚀',
            },
            {
              category_fault: '导地线',
              value: '电缆头外护套破损',
              fault_type: '电缆头外护套破损',
            },
            {
              category_fault: '导地线',
              value: '导线有异物',
              fault_type: '导线有异物',
            },
            {
              category_fault: '导地线',
              value: '地线有异物',
              fault_type: '地线有异物',
            },
            {
              category_fault: '导地线',
              value: '地线接地端安装不规范',
              fault_type: '地线接地端安装不规范',
            },
            {
              category_fault: '导地线',
              value: '塔基接地扁铁未可靠接地',
              fault_type: '塔基接地扁铁未可靠接地',
            },
            {
              category_fault: '附属设施',
              value: '避雷器破损',
              fault_type: '避雷器破损',
            },
            {
              category_fault: '附属设施',
              value: '避雷器未接地',
              fault_type: '避雷器未接地',
            },
            {
              category_fault: '附属设施',
              value: '避雷器与导线脱离',
              fault_type: '避雷器与导线脱离',
            },
            {
              category_fault: '附属设施',
              value: '避雷器计数器失灵',
              fault_type: '避雷器计数器失灵',
            },
            {
              category_fault: '附属设施',
              value: '避雷器接地线位置安装错误',
              fault_type: '避雷器接地线位置安装错误',
            },
            {
              category_fault: '附属设施',
              value: '塔号牌缺失',
              fault_type: '塔号牌缺失',
            },
            {
              category_fault: '附属设施',
              value: '电缆穿管处未封堵',
              fault_type: '电缆穿管处未封堵',
            },
            {
              category_fault: '附属设施',
              value: '防鸟罩破损',
              fault_type: '防鸟罩破损',
            },
            {
              category_fault: '附属设施',
              value: '防鸟罩脱落',
              fault_type: '防鸟罩脱落',
            },
            {
              category_fault: '杆塔',
              value: '杆塔上有异物',
              fault_type: '杆塔上有异物',
            },
            {
              category_fault: '杆塔',
              value: '杆塔上有鸟窝',
              fault_type: '杆塔上有鸟窝',
            },
            {
              category_fault: '杆塔',
              value: '塔材缺失',
              fault_type: '塔材缺失',
            },
            {
              category_fault: '杆塔',
              value: '杆塔锈蚀',
              fault_type: '杆塔锈蚀',
            },
            {
              category_fault: '杆塔',
              value: '杆塔螺栓缺失',
              fault_type: '杆塔螺栓缺失',
            },
            {
              category_fault: '杆塔',
              value: '杆塔螺帽退出',
              fault_type: '杆塔螺帽退出',
            },
            {
              category_fault: '杆塔',
              value: '杆塔受力构件松动',
              fault_type: '杆塔受力构件松动',
            },
            {
              category_fault: '杆塔',
              value: '杆塔受力构件变形',
              fault_type: '杆塔受力构件变形',
            },
            {
              category_fault: '杆塔',
              value: '杆塔倾斜',
              fault_type: '杆塔倾斜',
            },
            {
              category_fault: '基础',
              value: '基础倾斜',
              fault_type: '基础倾斜',
            },
            {
              category_fault: '基础',
              value: '基础附件水土流失',
              fault_type: '基础附件水土流失',
            },
            {
              category_fault: '基础',
              value: '基础长期泡水',
              fault_type: '基础长期泡水',
            },
            {
              category_fault: '基础',
              value: '基础立柱裂纹',
              fault_type: '基础立柱裂纹',
            },
            {
              category_fault: '基础',
              value: '基础钢筋外露',
              fault_type: '基础钢筋外露',
            },
            {
              category_fault: '基础',
              value: '基础边坡塌陷',
              fault_type: '基础边坡塌陷',
            },
            {
              category_fault: '通道环境',
              value: '通道存在树障',
              fault_type: '通道存在树障',
            },
            {
              category_fault: '通道环境',
              value: '通道存在异物',
              fault_type: '通道存在异物',
            },
          ],
      list2:[
        {
          value: '同塔双回',
          label: '同塔双回',
          children: [
              {
              value: '塔全貌',
              label: '塔全貌',
            }, 
            {
              value: '左上相',
              label: '左上相',
            }, 
            {
              value: '左中相',
              label: '左中相',
            }, 
            {
              value: '左下相',
              label: '左下相',
            },
            {
              value: '右上相',
              label: '右上相',
            }, 
            {
              value: '右中相',
              label: '右中相',
            },
            {
              value: '右下相',
              label: '右下相',
            },
            {
              value: '地线',
              label: '地线',
            }, 
            {
              value: '通道环境',
              label: '通道环境',
            }, 
            {
              value: '下塔电缆',
              label: '下塔电缆',
            }
          ]
        },
        {
          value: '单回杆塔',
          label: '单回杆塔',
          children: [
            {
              value: '塔全貌',
              label: '塔全貌',
            }, 
            {
              value: '左相',
              label: '左相',
            }, 
            {
              value: '中相',
              label: '中相',
            }, 
            {
              value: '右相',
              label: '右相',
            }, 
            {
              value: '地线',
              label: '地线',
            }, 
            {
              value: '通道环境',
              label: '通道环境',
            }, 
            {
              value: '下塔电缆',
              label: '下塔电缆',
            }
          ]
        },
      ]
    };
  },
  created() {
  },
  mounted() {
    this.getList()
	},
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
     this.queryParams = {};
     this.currentPage = 1;
     this.getList();
    },
    refresh(val){
      this.isName = val.name
      this.currentPage = 1
      this.getList();
    },
    search(index){
      this.currentPage = 1;
      this.loading = true
     if(index==1){
      this.list = this.filterObjectsByKeyword(this.allList1,this.queryParams.value,this.queryParams.category_fault)
     }else{
      this.list = this.filterObjectsByKeyword(this.allList2,this.queryParams.value,this.queryParams.category_fault)
     }
      this.total = this.list.length
      setTimeout(() => {
        this.loading = false
      }, 200);
    },
    changeType(val){
      this.list = this.filterObjectsByKeyword(this.allList1,this.queryParams.value,val)
      this.total = this.list.length
    },
    changeLine(val){
      this.list = this.filterObjectsByKeyword(this.allList2,this.queryParams.value,val)
      this.total = this.list.length
    },
    filterObjectsByKeyword(array, keyword, planStatus) {
        // 使用 filter 方法筛选数组
        return array.filter(obj => {
            let keywordCondition = true; // 默认关键字条件为 true
            let planStatusList = true
            // 如果关键字不为空，则检查关键字条件
            if (keyword) {
                keywordCondition = obj.value.toLowerCase().includes(keyword.toLowerCase()) 
            }
            if (planStatus&&planStatus!='全部') {
              planStatusList = obj.category_fault.toLowerCase().includes(planStatus.toLowerCase())
            }


            // 返回同时满足关键字条件和时间条件的对象
            return keywordCondition && planStatusList;
        });
    },
    async getList() {
      let that = this
      that.loading = true
      let data = await that.$db.faultTypeArray.toArray()
      let data2 = await that.$db.lineTypeArray.toArray()
      data.sort((a, b) => {
        return b.id - a.id ;
      });
      data2.sort((a, b) => {
        return b.id - a.id ;
      });
      console.log(data,data2)
      if(that.isName=='fault'){
       that.allList1 = data.length<1? that.list1 : data
       that.list = that.allList1
       that.total = that.list.length
       if(data.length<1){
        that.allList1.map(item => that.$db.faultTypeArray.put(item))
      }
        that.loading = false
      }else if(that.isName=='line'){
        let arr = []
        that.list2.forEach(item => {
          item.children.forEach(element => {
            let obj = {
              value: element.value,
              label: element.value,
              category_fault: item.value
            }
            arr.push(obj)
            if(data2.length<1){
              that.$db.lineTypeArray.put(obj);
            }
          });
        });
        that.allList2 = data2.length<1? arr : data2
        that.list = that.allList2
        that.total = that.list.length
        that.loading = false
      }
    },
     showEdit(isEdit) {
      this.isEdit = isEdit;
      this.isShowEdit = true;
      this.editForm = {};
    },
    handleEdit(row, isEdit) {
      this.isEdit = isEdit;
      this.isShowEdit = true;
      this.editForm = row;
    },
    editSubmit(){
      let that = this
      that.$refs.editForm.validate((valid) => {
        if(valid){
          if(that.isEdit==1){
            if(that.isName=='fault'){
              let obj1 = {
                id:that.editForm.id,
                value: that.editForm.value,
                fault_type: that.editForm.value,
                category_fault: that.editForm.category_fault,
              }
             that.$db.faultTypeArray.put(obj1)
            
            }else if(that.isName=='line'){
              let obj2 = {
                id: that.editForm.id,
                value: that.editForm.value,
                label: that.editForm.value,
                category_fault: that.editForm.category_fault,
              }
              that.$db.lineTypeArray.put(obj2)
            }
            console.log(this.editForm,1111111)
          }else{
            if(that.isName=='fault'){
            let obj1 = {
              value: that.editForm.value,
              fault_type: that.editForm.value,
              category_fault: that.editForm.category_fault,
            }
             that.$db.faultTypeArray.put(obj1)
            
            }else if(that.isName=='line'){
              let obj2 = {
                value: that.editForm.value,
                label: that.editForm.value,
                category_fault: that.editForm.category_fault,
              }
              that.$db.lineTypeArray.put(obj2)
            }
          }
          setTimeout(() => {
            that.$message.success('操作成功')
            that.editOk()
          }, 200);
        }
      })
    },
    async handleDel(row) {
      let that = this
     
      that.$confirm("此操作将永久删该数据，不可恢复, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        if(that.isName=='line'){
          try {
            console.log(row,222222)
            that.$db.lineTypeArray.delete(row.id);
            that.getList()
            that.$message.success('删除成功')
          } catch (error) {
              console.error('Failed to delete items:', error);
          }
        }else{
          console.log(row,1111)
          try {
            that.$db.faultTypeArray.delete(row.id);
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
    editOk() {
      this.isShowEdit = false;
      this.getList();
    }
	},
	
};
</script>
<style lang="scss" scoped>
.pagination{
  margin: 10px;
  float: right;
}
</style>