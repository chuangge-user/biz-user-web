define(function(require, exports, module) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');

    var accounting = require('accounting');
    template.helper('$Math', accounting);

    var sysMessage = require("system-message");

    var $ = require('jquery');
    require('datepicker');
    var dateExtend = require('date-extend');

    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');
    var $modal = require('bootstrap/modal');
    var projectUtil = require("script/project/project-util");
    var systemMessage = require('system-message');
    var queryString = require("script/get-query-string");

    var applyUtil = require('script/approval/brokerage-apply-util');
    var modalUtil = require('script/approval/brokerage-modal-util');

    var progressUpload = require('script/progress-upload');


    var workflowProp = require('script/approval/workflow-properties');
    function initWorkFlow(){
        var workflowObj = workflowProp.workflowObj;
        workflowObj.wfInstanceId = queryString('wfInstanceId');
        workflowObj.businessKey = queryString('businessKey');
        workflowObj.taskId = queryString('taskId');
        workflowObj.processKey = workflowProp.definitionConstants.JSBZ;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowObj.projectId = "projectId";
        workflowObj.cityId = "cityId";
        workflowProp.showWorkFlowAll(workflowObj);
    }

    $(function () {

        initWorkFlow();

        applyUtil.initDatePicker();
        modalUtil.initDateEvent();
        modalUtil.autoChange(); // 套数后面自动增长

        modalUtil.loadInfo(1);

        // 选择 select 变更 % 元
        modalUtil.initSelectChangeEvent();

        var projectId,
            cityId,
            $cityId = $('#cityId'),
            $projectId = $('#projectId')



        projectUtil.bindingProjectAndCity('projectSelect', 'citySelect');

        var iconClass = {
            red : 'i-process-remind', //提醒 红色
            white : 'i-process-not-start', //未开始  白色
            orange  : 'i-process-done',  //完成 橙色
            darkGrey : 'i-process-not-pass' //未通过 深灰色
        }

//        var proInfoList = projectUtil.appendProjectSelectUtil('project_bench_detail', function (proInfo) {
//            projectId = proInfo.id;
//            cityId = proInfo.cityId;
//            $projectId.val(proInfo.id);
//
//            $cityId.val(cityId).change();
//            modalUtil.searchLiqStandard(proInfo.id)
//        });


        // 绑定上传图片
        progressUpload.bindAddFileLink($('#addFileLink'), $('#fileProgressBox'), 5);

        modalUtil.bindAddForm();


        // 历史记录
        $('#historyLink').click(function(e){
            e.preventDefault();
            $('#historyModal').modal();
            modalUtil.loadHistory(queryString('projectId'));
        });

    });


});