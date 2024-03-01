import Dexie from 'dexie';

export const db = new Dexie('myDatabase'); //数据库名称：myDatabase
db.version(1).stores({
    dataList: '++id,accuracy,isSync,localStatus,analyType,area,auditCode,auditName,baseCode,baseCodeName,baseType,companyCode,companyName,createTime,inspectionDeviceName,inspectionScene,loopName,mapStatusName,picRenameModelId,planArea,planAreaName,planCode,planSourceType,planType,renameModelType,responsibleCode,responsibleName,simpleName,solar,status,statusName,subarray,taskPlanCode,taskPlanName,tower,updateTime,useTime,wind', // Primary key and indexed props 对象仓库（objectStore）：friends，唯一的id作为键路径（key path）
    imgList: 'fileName, taskPlanCode, planArea, name, imgUrl, showName,isSync,picIndex',
    ruleList: '++id, isDelete, modelName, picNum, picRenameBasicList, type',
    lineList: '++id, dicCode, dicName, name, code',
    typeList: '++id, bucket_name, c_time, category_code, category_fault, category_name, fault_info, fault_level, fault_type, fault_type_code, handling_cycle, handling_suggestions, level, original_type, u_time',
    markList: 'file_link, fault_list, file_name, minio_bucket_line, show_name, station_id, task_id, zone_id',
    faultList: 'fileName, zoneId,taskId,stationId,faultList,showName,isSync',
    // dataList: '',
    // ruleList: '',
    // typeList: '',
    // markList: '',
    // imgList: '',
});
export default db;