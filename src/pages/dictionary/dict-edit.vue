<template>
    <div>
        <el-form :model="editForm" label-width="80px" ref="editForm">
            
            <el-form-item label="故障名称" prop="fault_type" :rules="[{ required: true, message: '请填写故障名称', trigger: 'blur' }]">
                <el-input v-model="editForm.fault_type" placeholder="请输入故障名称" size="small" clearable></el-input>
            </el-form-item>
            <el-form-item label="故障编号" prop="fault_code" :rules="[{ required: true, message: '请填写故障编号', trigger: 'blur' }]">
                <el-input v-model="editForm.fault_code" placeholder="请输入故障编号" size="small" clearable></el-input>
            </el-form-item>
            
             <el-form-item label="所属类型" prop="type_code" :rules="[{ required: true, message: '请选择所属类型', trigger: 'change' }]">
                <!-- <el-input v-model="editForm.type" placeholder="请输入类型名称" size="small" clearable></el-input> -->
                <el-select v-model="editForm.type_code">
                    <el-option v-for="(item, index) in typeList" :key="index"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="原始类型" prop="original_type" >
                <el-input v-model="editForm.original_type" placeholder="请输入字典编码" size="small" clearable></el-input>
            </el-form-item>
            <el-form-item label="故障详情" prop="fault_info" >
                <el-input v-model="editForm.fault_info" placeholder="请输入字典编码" size="small" clearable></el-input>
            </el-form-item>
            <el-form-item label="故障等级" prop="fault_level" >
                <el-input v-model="editForm.fault_level" placeholder="请输入字典编码" size="small" clearable></el-input>
            </el-form-item>
            <el-form-item label="故障建议" prop="handling_suggestions" >
                <el-input v-model="editForm.handling_suggestions" placeholder="请输入故障建议" size="small" clearable></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button class="btn2" @click.native="$emit('save-ok')">取消</el-button>
            <el-button class="btn2" type="primary" @click.native="editSubmit">确定</el-button>
        </div>
    </div>
</template>
<script>

import listMixin from '@/api/list'
export default {
	mixins: [listMixin],
  data() {
    return {
        // methodUrl: 'http://192.168.10.45:9020/',
        addName: 'api/sys/sys/sysDic/insert',
        updateName: 'api/sys/sys/sysDic/update',
        isShowEdit: false,
        typeList: [
            {
                name: "风机",
                code: 'wtg'
            },
            {
                name: "光伏",
                code: 'solar'
            }
        ],
        editForm: {},
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
  mounted() {
      this.data && (this.editForm = this.data) 
	},
  methods: {
    editSubmit(){
         this.$refs.editForm.validate((valid) => {
            if(valid){
                this.editForm.type_name = this.typeList.filter((item) => {
            return item.code === this.editForm.type_code;
          })[0].name;
          let method = "post";
          if (this.isEdit) {
            // this.update()
            method = "put";
          } else {
            // this.add()
            method = "post";
          }
          this.$fetch({
            url: "/public/api/v1/error_type_dict/",
            method: method,
          }).then((data) => {
            if (data && data.code === 1000) {
              // // debugger
              this.$message({
                  type: "success",
                  message: "保存成功"
              })
            }
          });
          console.log(this.editForm);
            }
        })
    },
    editOk(){
      this.$emit('save-ok')
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