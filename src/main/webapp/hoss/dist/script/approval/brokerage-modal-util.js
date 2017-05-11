// 佣金标准通用
define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery'),
        template = require("template"),
        navigation = require('navigation'),
        sysMessage=require("system-message");
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        jsonpost = xhr.jsonpost,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;
    var queryString = require("script/get-query-string");
    var fileUtil = require('script/file-operation-util');
    var progressUpload = require('script/progress-upload');

    var systemMessage = require('system-message');
    var areaPicker = require('area-picker');
    var dateExtend = require('date-extend');
    var datepicker = require('datepicker');
    var pagination = require('pagination');


    var accounting = require('accounting'),
        formatNumber = accounting.formatNumber
    template.helper("formatNumber",accounting.formatNumber); // 对 template 增加全局变量或方法
    template.helper('_apiHost_', apiHost);

    var queryString = require("script/get-query-string"),
        uriProjectId = queryString('project');


    var feeTypeObj = {
        'groupbuy':'scale',
        'houseprice':'houseScale',
        'fixamount':'fixedAmount'
        },
        feeTypeName = {
            'groupbuy':'团购费',
            'houseprice':'房价',
            'fixamount':'固定金额'
        }
    template.helper('feeTypeObj', feeTypeObj);
    template.helper('feeTypeName', feeTypeName);


    // 获取渠道默认佣金比例列表
    function searchLiqStandard(projectId){
        $.ajax($.extend({
            url: apiHost + '/liquidation/commissionSettlementStandards/findLiqStandard.do?projectId=' + (uriProjectId || projectId),
            beforeSend: function () {}
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    initLiqStandard(data)
                }
                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取渠道默认佣金比例列表失败！');
            });

        if (uriProjectId) {
            loadProjectInfo(uriProjectId);
        }
    }

    function initLiqStandard(data, disabled){
        var dataObj = data.data || {};

        var $liqStandardResult = $('#liqStandardResult'),
            $datepicker = $('#datepicker'),
            liqStandardTemplate = 'liqStandardTemplate'


        // 初始化附带参数
        $('#businessKey').val(queryString('businessKey'));
        $('#workFlowModelId').val(queryString('businessKey'));
        $('#wfInstanceId').val(queryString('wfInstanceId'));
        $('#taskId').val(queryString('taskId'));
        $('#projectId').val(dataObj.projectId);

        // 项目名称
        $('#projectName').text(dataObj.projectName);

        $datepicker.find('input').attr('placeholder', '')

        // 附带数据
        if (dataObj.startTime !== '1970-01-01') { // 设置了项目周期
            $datepicker.find('[name=startTime]').val(dataObj.startTime);
            $datepicker.find('[name=endTime]').val(dataObj.endTime);
            $('input[value=between]').click();
        }

        $('#remark').val(dataObj.remark);
        $('#flowNo').text(dataObj.flowNo);
        $('#version').text(dataObj.formVersion);
//        $('#cityId').val(queryString('cityId'));

        $liqStandardResult.html(
            template(liqStandardTemplate, data)
        );

//                    填充值
        $.each(dataObj.projectTypes, function(iIndex, iObj){

            $.each(iObj.channelItems, function(jIndex, jObj){

                $.each(jObj.scales, function(kIndex, kObj){

                    $('#projectTypes' + iIndex + 'channelItems' + jIndex + 'scales' + kIndex).
                        val(kObj[
                            feeTypeObj[
                                kObj.feeType]]).
                        // 选中的值 并且触发事件
                        closest('tr').find('select').val(kObj.feeType).change();

                })

            });

        })

        if (disabled) {
            $liqStandardResult.find('select').attr('disabled', 'disabled');
            $liqStandardResult.find('input').attr('disabled', 'disabled');
            $('input[name=time]').attr('disabled', 'disabled').parent()
                .attr('disabled', 'disabled');
            $('#datepicker input').attr('disabled', 'disabled');
            $('#remark').attr('disabled', 'disabled');
        }
    }

    function initDateEvent(){
        var $datepicker = $('#datepicker');
        $('.radio').click(function(e){
            var $target = $(e.currentTarget);
            if ($target.attr('disabled')) {
                return;
            }
            if ($target.attr('showDate')) {
                $datepicker.show();
            } else {
                $datepicker.hide();
            }
        });
        $datepicker.hide();
    }

    function initSelectChangeEvent(){

        var GDJE = 'fixamount'; // 固定金额
        // 选择 select 变更 % 元
        $('#liqStandardResult').delegate('select[target]', 'change', function(e){
            var $target = $(e.currentTarget),
                value = $target.val(),
                $tr = $target.closest('tr'),
                $units = $tr.find('[units]');


            setFeeType($tr);

            if ($target.attr('target') !== 'self') { // next2 三行 tr
                $tr = $tr.next();
                setFeeType($tr);
                Array.prototype.push.apply($units, $tr.find('[units]'));
                $tr = $tr.next();
                setFeeType($tr);
                Array.prototype.push.apply($units, $tr.find('[units]'));
//                $units = $target.closest('tr').next().find('[units]');
            }

            if ($target.val() == GDJE) {
                $units.text('元');
            } else {
                $units.text('%');
            }

            $units.prev().each(function(index, node){
                var $node = $(node);
                $node.attr('name', $node.attr('name').replace(/\w+$/, feeTypeObj[value])); // 设置 feeType 值类型
            });

            // 更新 feeType
            function setFeeType($tr){
                $tr.find('[feeType]').val(value);
            }
        });
    }

    function bindAddForm(){
        // 提交表单
        $('#submit,#draft,#agree').click(function(e){
            submitForm($(e.currentTarget))
        });

    }

    function submitForm($target){
        var $context = $('#addForm'),
            $disabled = $context.find('[disabled]'),
            $submit = $('input[type=button]'),
            $radio = $('input[type=radio]:checked'),
            $datepicker = $('#datepicker'),
            startTime = $datepicker.find('[name=startTime]').val(),
            endTime = $datepicker.find('[name=endTime]').val(),
            code = $target.attr('action'),

            timeBetweenPram = (($('input[name=time]:checked').val() == 'all') ?
                '' :
                '&startTime=' + startTime +
                '&endTime=' + endTime)

        if ($radio.val() === 'between' && !startTime && !endTime) {
            systemMessage('项目周期起始结束时间必填，或请选择整个项目周期！');
            return false;
        }

        if (checkBrokerageScale()) {
            return;
        }


        if ($submit.hasClass('disabled')) {
            return false;
        }

        $disabled.removeAttr('disabled');

        // 附件参数
        var fileListArray = [];
        $context.find('[name=documentId]').each(function(index, node){
            var $target = $(node);
            fileListArray.push($target.val());
        });
        $('#fileListJson').val(JSON.stringify(fileListArray));

        $.ajax($.extend({
            url: apiHost + code,
            data: clearEmptyValue($context) + '&remark=' + encodeURIComponent($('#remark').val()) + timeBetweenPram,
            beforeSend: function () {
                $submit.attr('disabled', 'disabled');
            }
        }, jsonpost))
            .done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

//                    history.back();
                    location.href = document.referrer;
                }

                doneCallback.call(this, data, useful, useless);
            })
            .fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '提交失败！');
            })
            .always(function () {
                $disabled.attr('disabled', 'disabled');
                $submit.removeAttr('disabled').blur();
            });

        return false;
    }

    // 检查佣金比例范围
    function checkBrokerageScale(){
        var $inputs = $('#liqStandardResult input[type=text]'),
            $input,
            name,
            value,
            last

        var scale = /scale$/,
            houseScale = /houseScale$/;

        for (var i = 0; i < $inputs.length; i++) {
                $input = $inputs.eq(i),
                name = $input.attr('name'),
                value = $input.val()

            if (isNaN(value)) {
                return fail($input);
            }

            if (scale.test(name) || houseScale.test(name)) { // 检查佣金范围
                last = value.split('.')[1]
                if (value < 0 || value > 200 || (last&&last.length > 2)) {
                    return fail($input);
                }
            }
        }

        function fail($node){
            sysMessage('佣金百分比的范围是0-200，最多有两位小数。请重新输入！');
            $node.focus();
            return true;
        }
    }

    // 佣金历史
    function loadHistory(projectId){

        var $historyListResult = $('#historyListResult'),
            historyListTemplate = 'historyListTemplate'

        $.ajax($.extend({
            url: apiHost + '/liquidation/commissionSettlementStandards/findProjectLiqStandardHistory.do?projectId=' + projectId,
            beforeSend: function () {}
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    if (dataObj.content.length) {
                        $historyListResult.html(
                            template(historyListTemplate, data)
                        );
                    } else {
                        $historyListResult.html('<div class="text-center">没有历史记录！</div>');
                    }

                }
                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取历史记录失败！');
            });

    }

    function useless(data) {
        systemMessage({
            type: 'info',
            title: '提示：',
            detail: data.detail
        });
    }

    /**
     *  加载渠道佣金标准申请单，详情
     */
    function loadInfo(disabled){
//
        var businessKey = queryString('businessKey')
        $.ajax($.extend({
            url: apiHost + '/form/commissionSettlementStandards/findCommissionSettlementStandardsDetail.do?businessKey=' + businessKey,
            beforeSend: function () {}
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    initLiqStandard(data, disabled);

//                    $('#flowNo').text('FYSQ-141020-002');

                }
                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '加载佣金标准申请单详情失败！');
            });


        // 读取附件
        var fileList = fileUtil.getFileList('cm_apply_contract', businessKey) || [];
        var $fileBox = $('#fileProgressBox');
        $.each(fileList, function(index, fileObj){
            $fileBox.append($(progressUpload.getFileBoxStr(fileObj)).show()). // 显示 file-box
                find('[progress]').parent().hide(); // 隐藏 进度条
        })
        if (disabled) {
            $fileBox.find('[delete]').remove();
        }

    }

    // 自动增长事件
    function autoChange(){
        $('#showInfo').delegate('[actionid]', 'keyup', function(e){
            var $target = $(e.currentTarget);
            var num = $target.val();
            if (num&&!isNaN(num)) {
                $('#' + $target.attr('actionid')).val(num - -1);
            }
        }).

        // 只允许输入数字
        delegate('[integer]', 'keyup', function(e){
                var $target = $(e.currentTarget);
                var num = $target.val();
                $target.val(num.replace(/\D/g,''))
            })
    }

    // 项目详情




    // 项目详情
    function loadProjectInfo(projectId){

        var getProjectInfoCode = '/hoss/org/org_attache/getProjectInfo.do';
        var $lastDay = $('#lastDay');

        $.ajax($.extend({
            url: apiHost + getProjectInfoCode,
            data: {
                projectId:projectId
            },
            beforeSend: function () {

            }
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    var $project_bench_detail = $('#project_bench_detail'),
                        $houseCountdown = $project_bench_detail.find('.house-countdown'),
                        $houseName = $project_bench_detail.find('.house-name a'),
                        viewURL = $houseName.attr('href');

                    $houseName.attr('href', viewURL.replace(/projectId=\d+/, 'projectId=' + projectId)).text(dataObj.projectName)
                    $('#project_change').attr('disabled', 'disabled');

                    $houseCountdown.eq(0).text(' 项目合作期：' + dataObj.startTime +
                        ' ~ ' + dataObj.endTime +
                        '');
                    if (dataObj.leftDayNum) {
                        $houseCountdown.eq(1).html('距离合作期结束 <strong>' + dataObj.leftDayNum +
                            '</strong>天');
                    } else {
                        $houseCountdown.eq(1).html('[已结案]');
                    }
                    $houseCountdown.eq(1).next().empty();



                    console.dir(dataObj);
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取列表数据失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取列表数据失败！');
            }).
            always(function () {
            });
    }

    return {
        searchLiqStandard:searchLiqStandard,
        initDateEvent:initDateEvent,
        initSelectChangeEvent:initSelectChangeEvent,
        loadHistory:loadHistory,
        bindAddForm:bindAddForm,
        loadInfo:loadInfo,
        autoChange:autoChange,
        loadProjectInfo:loadProjectInfo
    };
});