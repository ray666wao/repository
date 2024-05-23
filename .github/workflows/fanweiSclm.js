var WfSclm = {};

//生产环境
//WfSclm.sclmUrl = "http://10.0.0.173:8081";
//本地环境
WfSclm.sclmUrl = "http://127.0.0.1:8081";
//WfSclm.sclmUrl = "http://192.168.101.150:8081";
//WfSclm.sclmUrl = "http://rivert.v6.idcfengye.com";
//WfSclm.sclmUrl = "http://192.168.101.200:8081";
//WfSclm.sclmUrl = "http://svn.sfstech.cn:9080";
WfSclm.slcmContext = "/apis"
WfSclm.sclmApiAccessKey = "6819b6651e334b249d236974ac0083e8";
WfSclm.sclmApiAccessSecret = "3b9be8f6abb847e19f2944b485d6faa4";

var commonParam = WfForm.getGlobalStore().commonParam;
console.log(commonParam);
//当前请求基础信息
var baseInfo = WfForm.getBaseInfo(); 
console.log("当前请求基础信息==",baseInfo);


//=================接口方法=================
WfSclm.methods = {
    //http接口调用
    httpRequest:(apiPath,params={},call)=>{
        var commonParam = WfForm.getGlobalStore().commonParam;
        //获取当前操作人员
        var currentUserid = commonParam.currentUserid;
        //异常提示-DOM
        var sclmErrrorMsg = document.getElementById("sclm-error-msg");

        let timestamp = new Date().getTime();
        let sign = CryptoJS.MD5(WfSclm.sclmApiAccessKey+timestamp+WfSclm.sclmApiAccessSecret).toString();
        let requestOptions = {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type':'application/problem+json;charset=UTF-8',
                'x-sclm-open-version':'1.0',
                'x-sclm-open-access-key':WfSclm.sclmApiAccessKey,
                'x-sclm-open-timestamp':timestamp,
                'x-sclm-open-sign':sign,
                'x-sclm-open-curuser':currentUserid,
                'x-sclm-open-curuser-data-type':"id",
            },
            body: JSON.stringify(params)
        };

        let url = WfSclm.sclmUrl + apiPath;
        fetch(url, requestOptions)
        .then(response => {
            console.log("http响应结果=",response);
            if (response.ok) {
                return response.json(); 
            }else{
                //错误信息，10s后消失
                WfForm.showMessage("SLCM接口异常", 2, 10);
            }
        })
        .then(data => {
            // 处理获取到的数据
            console.log("http响应数据=",data);
            if(data && data.code=='200'){
                sclmErrrorMsg.innerHTML = "";
                sclmErrrorMsg.style.display = "none";
                if(call){
                    call(data.data,data);
                }
            }else{
                //错误信息，10s后消失
                let msg = data.msg || "SCLM接口请求失败";
                WfForm.showMessage(msg, 2, 10);
                sclmErrrorMsg.innerHTML = msg;
                sclmErrrorMsg.style.display = "block";
            }
        })
        .catch(error => {
            // 处理错误
            console.error('http Error:', error);
            //错误信息，10s后消失
            WfForm.showMessage("SLCM接口异常："+error, 2, 10);
        });
    },
    //加载SCLM页面
    loadPage:(call)=>{

        //SCLM流程实例ID
        var sclmInstanceId_field = WfForm.convertFieldNameToId("sclm_instance_id");
        var sclmInstanceId = WfForm.getFieldValue(sclmInstanceId_field);
        //流程编号
        var lcbh_field = WfForm.convertFieldNameToId("lcbh");
        var lcbh = WfForm.getFieldValue(lcbh_field);
        
        //SCLM流程key
        var slcmFlowKey = document.getElementById("slcm_flow_key").value;
        //泛微流程key
        var fanweiFlowKey = document.getElementById("fanwei_flow_key").value;

        var commonParam = WfForm.getGlobalStore().commonParam;
        //是否只读预览 1=只读
        var isviewonly = commonParam.isviewonly;
        //是否打印页面 1=是否
        var isprint = commonParam.isprint;
        //获取当前操作人员
        var currentUserid = commonParam.currentUserid;
        //获取当前操作人员名称
        var curUserName = commonParam.lastname;
        //获取当前节点名称
        var curNodeName = commonParam.nodename;
        //当前节点ID
        var curNodeId = commonParam.nodeid;
        //当前请求基础信息
        var baseInfo = WfForm.getBaseInfo(); 
        var workflowid = baseInfo.workflowid;
        var nodeid = baseInfo.nodeid;
        var requestid = baseInfo.requestid;

        //页面类型
        var fanweiPageType =  'pc';
        var fanwei_page_type = document.getElementById("fanwei_page_type");
        if(fanwei_page_type){
            fanweiPageType = fanwei_page_type.value || 'pc';
        }

        let pageUrl = WfSclm.slcmContext+"/sclm/api/contract/getBpmTaskIdByInstanceId";
        WfSclm.methods.httpRequest(
            pageUrl
            ,{
                instanceId:sclmInstanceId,
                caseNo:lcbh,
                isDetailPage:isviewonly,//是否只读流程实例详情页面 1=是
                fanweiFlowId:workflowid,
                fanweiFlowKey:fanweiFlowKey,
                slcmFlowKey:slcmFlowKey,
                fanweiNodeId:nodeid,
                fanweiRequestid:requestid,
                fanweiPageType:fanweiPageType
            }
            ,(data,result)=>{
                if(call){
                    call(data,result);
                }
            }
        );
    }
}
//=================接口方法=================

//iFrame 是否加载完了
var sclmIframeIsLoadingEnd = false;
var sclmIframe = null;

//加载SLCM页面
WfSclm.methods.loadPage((data,result)=>{
    if(data && data.pageUrl){
        sclmIframe = document.createElement('iframe');
        sclmIframe.id = "sclm_iframe";
        var iframe_div = document.getElementById("sclm_iframe_div");
        iframe_div.appendChild(sclmIframe);
        sclmIframe.style = 'width: 100%; height: 100%;border:none;';
        sclmIframe.src = data.pageUrl;
        //需要等到iframe中的子页面加载完成后才发送消息，否则子页面接收不到消息
        sclmIframe.onload = function(){
            sclmIframeIsLoadingEnd = true;
        }
    }
});

//打印事件
WfForm.registerCheckEvent(WfForm.OPER_PRINTPREVIEW, function(callback){
    //产品是默认延时1s自动弹出，可通过此方式控制延时时间
    //window.WfForm.printTimeout = 3000;
    //允许继续弹出调用callback，不调用代表不自动弹预览
    let printTimer = setInterval(() => {
        if(sclmIframeIsLoadingEnd){
            setTimeout(() => {
                callback();
            }, 2000);
            clearInterval(printTimer);
        }
    }, 500);
});



window.WfSclm= WfSclm;