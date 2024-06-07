//测试合同模板

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
var sclmInstanceIdField = WfForm.convertFieldNameToId("sclm_instance_id");
//申请公司
var sqgs = WfForm.convertFieldNameToId("sqgs");
//申请部门
var applyDept = WfForm.convertFieldNameToId("apply_dept");
//	技术负责人
var techPrincipal = WfForm.convertFieldNameToId("tech_principal");
//	技术总负责人
var chiefTechPrincipal = WfForm.convertFieldNameToId("chief_tech_principal");

console.log("SCLM流程实例ID==",WfForm.getFieldValue(sclmInstanceIdField));
console.log("申请公司==",WfForm.getFieldValue(sqgs));
console.log("申请部门==",WfForm.getFieldValue(applyDept));

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
                    WfForm.changeFieldValue(sclmInstanceIdField, {value:instanceId});
                }
                //设置值-申请部门
                WfForm.changeFieldValue(applyDept, {value:getDepId(formData.applyDeptId)});
                //设置值- 申请公司
                WfForm.changeFieldValue(sqgs, {value:getDepId(formData.applyCompanyId)});
                //设置值- 技术负责人
                WfForm.changeFieldValue(techPrincipal, {value:formData.techPrincipalId});
                //设置值- 技术负责人
                WfForm.changeFieldValue(chiefTechPrincipal, {value:formData.chiefTechPrincipalId});

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



