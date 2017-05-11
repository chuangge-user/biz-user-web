define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery'),
        template = require("template"),
        navigation = require('navigation'),
        sysMessage=require("system-message");
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;
    var queryString = require("script/get-query-string");

    var systemMessage = require('system-message');
    var areaPicker = require('area-picker');
    var dateExtend = require('date-extend');
    var datepicker = require('datepicker');
    var pagination = require('pagination');

    var util = require('script/approval/brokerage-apply-util');

    var progressUpload = require('script/progress-upload');
    var delegateApproval; // 是否委托人


    var accounting = require('accounting'),
        formatNumber = accounting.formatNumber
    template.helper("formatNumber",accounting.formatNumber); // 对 template 增加全局变量或方法

    var $cityList = $('#cityList');



    function bindEvent(){

        util.initDatePicker(); // 日期

        var $selectedClient = $('#selectedClient'),
            $flowList = $('#flowList')

//        $cityList.change(util.clearClient); // 选择城市 清空已经选中的成交客户
        $cityList.attr('disabled', 'disabled')
        util.loadInfo('cross', delegateApproval, 'approval');

        $('#selectClient').click(util.checkClient); // 打开查询

        $selectedClient.delegate('[adjust]', 'keyup', util.adjustKeyUp); // 修改应付事件
        $selectedClient.delegate('a[delete]', 'click', util.deleteClick); // 删除事件

        $('#mainCbx').click(util.selectAll); // 全选事件
        $flowList.delegate('[flowId]', 'click', util.checkFlow); // 单选事件

        $('#selectBtn').click(util.selectBtnClick); // 选完 确认按钮 事件

        // 查看详情
        $selectedClient.delegate('a[info]', 'click', util.infoClick);
        $flowList.delegate('a[info]', 'click', util.infoClick);

        // 佣金结算标准
        $selectedClient.delegate('a[projectId]', 'click', modalClick);
        $flowList.delegate('a[projectId]', 'click', modalClick);
        function modalClick(e){
            util.brokerageModalClick(e, 'org');
        }

        // 绑定上传图片
        progressUpload.bindAddFileLink($('#addFileLink'), $('#fileProgressBox'), 5);

        // 绑定查询成交客户
        util.bindSearchForm();

        // 绑定提交
        util.bindAddForm('org');
    }




    var workflowProp = require('script/approval/workflow-properties');
    function initWorkFlow(){
        var workflowObj = workflowProp.workflowObj;
        workflowObj.wfInstanceId = queryString('wfInstanceId');
        workflowObj.businessKey = queryString('businessKey');
        workflowObj.taskId = queryString('taskId');
        workflowObj.processKey = workflowProp.definitionConstants.YJTD;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowObj.projectId = "projectId";
        workflowObj.cityId = "cityList";
        workflowProp.showWorkFlowAll(workflowObj);
        workflowProp.isDelegateApproval(workflowObj, function(data){
            delegateApproval = data.data;
            bindEvent();
        })
    }


    $(document).ready(function(){

//        bindEvent();
        initWorkFlow();

    });

});
