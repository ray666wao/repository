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
var sqgs = WfForm.convertFieldNameToId("sqgs");
//申请部门
var sqbm = WfForm.convertFieldNameToId("sqbm");
//流程编号
var lcbh = WfForm.convertFieldNameToId("lcbh");
//	技术协议判断
var jsxypd = WfForm.convertFieldNameToId("jsxypd");
//	项目公司技术负责人
var xmgsjsfzr = WfForm.convertFieldNameToId("xmgsjsfzr");
//	技术总负责人
var jszfzr = WfForm.convertFieldNameToId("jszfzr");

console.log("SCLM流程实例ID==",WfForm.getFieldValue(sclmInstanceId_field));
console.log("申请公司==",WfForm.getFieldValue(sqgs));
console.log("申请部门==",WfForm.getFieldValue(sqbm));

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
                //设置值-技术协议判断
                WfForm.changeFieldValue(jsxypd, {value:formData.techAgreementCheck});
                //设置值-申请部门
                WfForm.changeFieldValue(sqbm, {value:getDepId(formData.applyDeptId)});
                //设置值- 申请公司
                WfForm.changeFieldValue(sqgs, {value:getDepId(formData.contractCompanyId)});
                //设置值- 项目公司技术负责人
                WfForm.changeFieldValue(xmgsjsfzr, {value:formData.techPrincipalId});
                //设置值- 技术负责人
                WfForm.changeFieldValue(jszfzr, {value:formData.chiefTechPrincipalId});

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



