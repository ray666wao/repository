//用印申请

var commonParam = WfForm.getGlobalStore().commonParam;
var baseInfo = WfForm.getBaseInfo(); 
var requestid = baseInfo.requestid;

jQuery(document).ready(()=>{

    let sit = setInterval(() => {
        if(window.WfSclm){
            clearTimeout(sit);
            init();
        }
    }, 500);

})


//SCLM流程实例ID
var sclmInstanceId_field = WfForm.convertFieldNameToId("sclm_instance_id");
//申请公司
var ywdy_field = WfForm.convertFieldNameToId("ywdy");
//申请部门
var sqbm_field = WfForm.convertFieldNameToId("sqbm");
//申请人
var jbr_field = WfForm.convertFieldNameToId("jbr");
//申请日期
var sqrq_field = WfForm.convertFieldNameToId("sqrq");
//用印方式
var zzyy_field = WfForm.convertFieldNameToId("zzyy");
//实体用印方式
var zzyyfs_field = WfForm.convertFieldNameToId("zzyyfs");
//电子用印
var dzyy_field = WfForm.convertFieldNameToId("dzyy");
//实体用印
var styy_field = WfForm.convertFieldNameToId("styy");
//用印类别
var yjfl_field = WfForm.convertFieldNameToId("yjfl");
//用印类别2
var ejfl_field = WfForm.convertFieldNameToId("ejfl");
//公司层级
var gscj_field = WfForm.convertFieldNameToId("gscj");
//上级部门
var sjbm_field = WfForm.convertFieldNameToId("sjbm");
//一级公司
var yjgs_field = WfForm.convertFieldNameToId("yjgs");
//一级对应总部分管部门
var yjdyzbfgbm_field = WfForm.convertFieldNameToId("yjdyzbfgbm");
//二级对应一级分管部门
var ejdyyjfgbm_field = WfForm.convertFieldNameToId("ejdyyjfgbm");
//二级对应总部分管部门
var ejdyzbfgbm_field = WfForm.convertFieldNameToId("ejdyzbfgbm");
//认证状态
var rzzt_field = WfForm.convertFieldNameToId("rzzt");
//借出日期
var jcsj_field = WfForm.convertFieldNameToId("jcsj");
//归还日期
var ghsj_field = WfForm.convertFieldNameToId("ghsj");
//押印人员
var yzry_field = WfForm.convertFieldNameToId("yzry");

console.log("SCLM流程实例ID==",WfForm.getFieldValue(sclmInstanceId_field));
console.log("申请公司==",WfForm.getFieldValue(ywdy_field));
console.log("申请部门==",WfForm.getFieldValue(sqbm_field));

let callback_bk = null;

function getDepId(value){
    let res = "";
    if(value){
        res = value.replace("d","");
    }
    return res;
}

//向SCLM页面发送消息
function postMessageToSclm(eventType,callback){
    if(sclmIframeIsLoadingEnd){
        // 向SCLM页面发送消息
        sclmIframe.contentWindow.postMessage(
            {
                eventType: eventType,//事件类型
                data:{
                    fanweiCommonParam:commonParam,
                }
            }, 
            WfSclm.sclmUrl
        );
        //继续提交需调用callback，不调用代表阻断
        //callback();
        callback_bk = callback;
    }
}


//初始化
function init(){
    //是否只读预览 1=只读
    var isviewonly = commonParam.isviewonly;
    if(isviewonly!='1'){
        //保存事件
        WfForm.registerCheckEvent(WfForm.OPER_SAVE, function(callback){
            postMessageToSclm('onSave',callback);
        })
        //提交/批准/提交需反馈/不需反馈等
        WfForm.registerCheckEvent(WfForm.OPER_SUBMIT, function(callback){
            postMessageToSclm('onAgree',callback);
        })
        //退回
        WfForm.registerCheckEvent(WfForm.OPER_REJECT, function(callback){
            postMessageToSclm('onBack',callback);
        })
    }

    // 监听 - SCLM页面 - 消息
    window.addEventListener('message', event => {
        //alert("----接收到SCLM页面 - mesage------");
        console.log("----接收到SCLM页面 - mesage------",event);
        let eventData = event.data || {};
        //判断来源地址 防止恶意行为
        let origin = event.origin;
        let type = eventData.type || {};
        let busData = eventData.busData || {};
        let status = eventData.status;
        let instanceId = eventData.instanceId;
        
        let msg = eventData.msg || "数据处理失败";
        if(type=='sclmFormHeight'){
            //动态设置嵌入的表单高度
            let sclmFormHeight = eventData.sclmFormHeight;
            if(sclmFormHeight){
                var iframe_div = document.getElementById("sclm_iframe_div");
                iframe_div.style.height = sclmFormHeight +'px';
            }
        }else if(type=='submit'){
            if(status){
                //alert("instanceId===="+instanceId);
                //更新设置泛微表相关字段数据
                let formData = busData.sclmTUseSeals || {};
                if(instanceId &&  requestid=='-1'){
                    //设置值-SCLM流程实例ID
                    WfForm.changeFieldValue(sclmInstanceId_field, {value:instanceId});
                }
                //设置值-标题
                WfForm.changeFieldValue("field-1", {value:formData.caseName});
                //设置值-申请公司
                WfForm.changeFieldValue(ywdy_field, {value:getDepId(formData.applyCompanyId)});
                //设置值-申请部门
                WfForm.changeFieldValue(sqbm_field, {value:getDepId(formData.applyDeptId)});
                //设置值-申请人
                WfForm.changeFieldValue(jbr_field, {value:formData.applyUserId});
                //设置值-申请日期
                WfForm.changeFieldValue(sqrq_field, {value:formData.applyDate});
                //用印方式
                WfForm.changeFieldValue(zzyy_field, {value:formData.sealMethod});
                //实体用印方式
                WfForm.changeFieldValue(zzyyfs_field, {value:formData.sealMethodEntity});
                //电子用印
                WfForm.changeFieldValue(dzyy_field, {value:formData.elSeal});
                //实体用印
                WfForm.changeFieldValue(styy_field, {value:formData.entitySeal});
                //用印类别
                WfForm.changeFieldValue(yjfl_field, {value:formData.category});
                //用印类别2
                WfForm.changeFieldValue(ejfl_field, {value:formData.category2});
                //公司层级
                WfForm.changeFieldValue(gscj_field, {value:formData.applyCompanyLevel});
                //上级部门
                WfForm.changeFieldValue(sjbm_field, {value:getDepId(formData.parentDepId)});
                //一级公司
                WfForm.changeFieldValue(yjgs_field, {value:getDepId(formData.yjgs)});
                //一级对应总部分管部门
                WfForm.changeFieldValue(yjdyzbfgbm_field, {value:getDepId(formData.yjdyzbfgbm)});
                //二级对应一级分管部门
                WfForm.changeFieldValue(ejdyyjfgbm_field, {value:getDepId(formData.ejdyyjfgbm)});
                //二级对应总部分管部门
                WfForm.changeFieldValue(ejdyzbfgbm_field, {value:getDepId(formData.ejdyzbfgbm)});
                //认证状态
                WfForm.changeFieldValue(rzzt_field, {value:formData.rzzt});
                //借出日期
                WfForm.changeFieldValue(jcsj_field, {value:formData.jcsj});
                //归还日期
                WfForm.changeFieldValue(ghsj_field, {value:formData.ghsj});
                //押印人员
                WfForm.changeFieldValue(yzry_field, {value:formData.yzry});


                if(callback_bk){
                    //继续提交需调用callback，不调用代表阻断
                    callback_bk();
                }
            }else{
                //alert(msg);
            }
        }
    })

}



