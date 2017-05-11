// 佣金申请通用
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

    var systemMessage = require('system-message');
    var areaPicker = require('area-picker');
    var dateExtend = require('date-extend');
    var datepicker = require('datepicker');
    var pagination = require('pagination');

    var fileUtil = require('script/file-operation-util');
    var progressUpload = require('script/progress-upload');

    var accounting = require('accounting'),
        formatNumber = accounting.formatNumber
    template.helper("formatNumber",accounting.formatNumber); // 对 template 增加全局变量或方法
    template.helper('_apiHost_', apiHost);
    var feeTypeObj = {
            'groupbuy':'scale',
            'houseprice':'houseScale',
            'fixamount':'fixedAmount'
        },
        feeTypeName = {
            'groupbuy':'团购费',
            'houseprice':'房价',
            'fixamount':'固定金额'
        };
    template.helper('feeTypeObj', feeTypeObj);
    template.helper('feeTypeName', feeTypeName);

    // 成交详情 工具
    var doneExamineUtil = require('script/quality-control/done-examine-util')

    var selectedFlowObj = {}, // 最终选中的 单据集合
        selectedProvisional = {}, // 临时选中的单据集合
        currentPageData = {};

    var $cityList = $('#cityList');

    // 清除已经选择的客户
    function clearClient(){
        selectedFlowObj = {};
        selectedProvisional = {};
        showGroup(selectedFlowObj);
    }

    function initDatePicker(){
        var $datepickerGroup = $('#datepicker > input'),
            startDate,
            endDate;

        $datepickerGroup.datepicker({
            autoclose: true,
            language: 'zh-CN',
            dateFormat: 'yy-mm-dd'
        });

        $datepickerGroup.first().on('changeDate', function (event) {
            startDate = event.date.valueOf();
            $datepickerGroup.last().focus();
        });

        $datepickerGroup.last().on('changeDate', function (event) {
            endDate = event.date.valueOf();

            if (endDate && startDate && endDate < startDate ) {
                systemMessage('结束时间不能小于开始时间！');
            }
        });
    }

    // 选择客户
    function checkClient(){
        var cityId = $cityList.val(),
            $flowList = $('#flowList'),
            $searchForm = $('#searchForm');
        if (!cityId) {
            sysMessage('请选择城市或者加盟公司！');
            return;
        }

        selectedProvisional = $.extend({}, selectedFlowObj);

        // 获取客户列表
        $('#selectClientModal').modal();

        $flowList.empty(); // 清空
        $searchForm[0].reset(); // 重置查询条件
        $searchForm.submit();
        updateSelectedCount();
    }

    // 选中|取消 一条单据
    function checkFlow(e){
        var $target = $(e.currentTarget),
            flowId = $target.attr('flowId');
        if ($target.is(':checked')) {
            selectedProvisional[flowId] = currentPageData[flowId];
        } else {
            delete selectedProvisional[flowId]
        }

        updateSelectedCount();
    }
    // 更新已选中 N 条数据
    function updateSelectedCount(){
        var selectedCount = 0;
        $.each(selectedProvisional, function(){
            selectedCount++;
        });
        $('#selectedCount').text('已选择 ' + selectedCount + ' 条数据')
    }


    // 调整
    function adjustKeyUp(e){
        var $target = $(e.currentTarget),
            $td = $target.closest('td'),
            $next = $td.next(),
            name = $target.attr('name'),
            value = $target.val(),
            valueSpt = value.split(/^\d+\./),
            valueSptLength = (valueSpt[1] ? valueSpt[1].length : 0),
            flowId = $target.closest('tr').find('[flowId]').attr('flowId'),
            prev = $td.prev().find('input').val(),
            adjusted; // 调整后的佣金

        if (valueSptLength > 2) { // 调整佣金. 小数最多两位
            value = value.substr(0, value.length - valueSptLength + 2);
            $target.val(value);
        }
        if (!isNaN(value)) {
            adjusted = prev - -value;
            $next.find('[adjusted]').text(formatNumber(adjusted, 2))
                .next().val(adjusted); // 设置 input 内容.

            if (name.indexOf('payChange') !== -1) {
                selectedFlowObj[flowId].payChange = parseFloat(parseFloat(value).toFixed(2)); // 记忆调整佣金
            } else {
                selectedFlowObj[flowId].crossAmount = parseFloat(parseFloat(value).toFixed(2)); // 记忆调整佣金
            }

            if (value != 0) {
                $target.addClass('adjusted');
            } else {
                $target.removeClass('adjusted');
            }
        }

        updateAdjustSum($target);
    }

    /** 更新调整后总和, 今日只有我和上帝很看懂, 过了今日只有上帝能看懂 */
    function updateAdjustSum($target) {
        // group 总和
        var $tr = $target.closest('tr'),
            $tbody = $tr.parent(),
            $adjustedSum = $tbody.find('[adjustedSum]'), // 调整后总佣金
            $adjustSum = $tbody.find('[adjustSum]'), // 总调整应付
            $adjusted,
            $adjustedGroup, // 分组调整后总佣金
            $adjust,
            $adjustGroup, // 分组调整应付
            group = $tr.attr('group'),
            adjustedGroupSum = 0,
            adjustGroupSum = 0,
            adjustSum = 0,
            sum = 0;

        // 调整后的分组汇总
        $adjusted = $tbody.find('[group="' + group + '"] [adjusted]');
        $adjustedGroup = $tbody.find('[group="' + group + '"] [adjustedGroup]');
        $adjusted.each(function(index, node){
            adjustedGroupSum -= -$(node).next().val();
        });
        $adjustedGroup.text(formatNumber(adjustedGroupSum, 2));

        // 调整应付分组汇总
        $adjust = $tbody.find('[group="' + group + '"] [adjust]');
        $adjustGroup = $tbody.find('[group="' + group + '"] [adjustGroup]');
        $adjust.each(function(index, node){
            adjustGroupSum -= -$(node).val();
        });
        $adjustGroup.text(formatNumber(adjustGroupSum, 2));

        $tbody.find('[adjusted]').next().each(function(index, node){
            sum -= -$(node).val();
        });
        $adjustedSum.text(formatNumber(sum, 2));

        $tbody.find('[adjust]').each(function(index, node){
            var value = -$(node).val();
            if (isNaN(value)) {
                return;
            }
            adjustSum -= value;
        });
        $adjustSum.text(formatNumber(adjustSum, 2));

    }


    // 删除处理
    function deleteClick(e){
        e.preventDefault();

        var $target = $(e.currentTarget),
            flowId = $target.closest('tr').find('[flowId]').attr('flowId'),
            $tr = $target.closest('tr'),
            $tbody = $target.closest('tbody'),
            group = $tr.attr('group'),
            $group,
            $children;

        $tr.remove();
        delete selectedFlowObj[flowId];

        $group = $tbody.find('tr[group="' + group + '"]');

        if ($group.length == 1) { // 3 级子项 全删掉了.
            $group.remove();
        }

        $children = $tbody.children();
        if ($children.length == 1) { // 2 级子项 全删掉了
            $tbody.empty();
        }

//        $tbody.find('input[adjust]').eq(0).keyup(); // 主动触发事件 刷新金额

        showGroup(selectedFlowObj);

        var deleteCode = $('#deleteCode').val(),
            liqDetailsId = $tr.find('input[name*=liqDetailsId]').val(),
            approveOrderDetailId = $tr.find('input[name*=approveOrderDetailId]').val();

//        $('#selectedClient').find('input[adjust]').prop('disabled', true);      // 佣金不可编辑

        if (deleteCode) {
            $.ajax($.extend({
                url: apiHost + deleteCode,
                data: {
                    liqDetailsId: liqDetailsId,
                    approveOrderDetailId:approveOrderDetailId
                },
                beforeSend: function () {
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        var dataObj = data || {};

                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '删除明细失败！');
                })
        }

    }

    function selectAll(e){
        var $target = $(e.currentTarget),
            checked = $target.is(':checked'),
            $flowList = $('#flowList'),
            $flows;
        if (checked) { // 所有未选中的 框
            $flows = $flowList.find('[flowId]').not(':checked');
        } else { // 所有选中的框. 我真是个机智的少年(果然不要脸)
            $flows = $flowList.find('[flowId]:checked');
        }
        $flows.click();
    }

    function selectBtnClick(){
        $('#selectClientModal').modal('toggle');
        selectedFlowObj = $.extend({}, selectedProvisional); // 将临时数据变成请求数据
        showGroup(selectedFlowObj);
    }

    /** 显示分组信息 */
    function showGroup(data){
        var groupObj = {},
            adjustSum = 0,
            brokerageSum = 0,
            adjust,
            brokerage; // 应付

        $.each(data, function(flowId, flowObj){ // 按照 项目名称分组
            var projectName = flowObj.projectName;

            if (flowObj.hasOwnProperty('crossAmount')) {
                adjust = flowObj.crossAmount;
            } else {
                adjust = flowObj.payChange || 0;
            }
            brokerage = flowObj.payGive;
            if (groupObj[projectName]) {
                groupObj[projectName].push(flowObj);

                groupObj[projectName]._yfyj += brokerage; // 分组累计应付佣金
                groupObj[projectName]._adjust += adjust; // 分组累计调整应付
            } else {
                groupObj[projectName] = [flowObj];
                groupObj[projectName]._yfyj = brokerage;
                groupObj[projectName]._adjust = adjust;
            }

            adjustSum += adjust;
            brokerageSum += brokerage;
        });

        $('#selectedClient').html(
            template('selectedClientTemplate', {
                content:groupObj, // 分组对象
                brokerageSum:brokerageSum, // 佣金汇总
                adjustSum:adjustSum, // 调整汇总
                adjustedSum:adjustSum + brokerageSum}) // 应付汇总
        ).find('input[adjust]').keyup();

        // 调整是否可以编辑
        if (adjustDisabled) {
            $('#selectedClient input').attr('disabled', 'disabled');
        }
    }

    function infoClick(e) {
        var $that = $(e.currentTarget),
            $viewTable = $('#viewTable'),
            $viewModal = $('#viewModal'),
            $flowList = $that.closest('#flowList'),
            $selectClientModal = $('#selectClientModal'),
            id = $that.attr('data-id');

        $selectClientModal.modal('hide');
        $viewModal.modal('show');
        if ($that.hasClass('disabled')) {
            return false;
        }

        doneExamineUtil.initDetail(e, $viewTable, function(){

            $viewModal.on('hidden.bs.modal', function(){
                $viewModal.off('hidden.bs.modal');
                if ($flowList.length) {
                    $selectClientModal.modal('show');
                }
            });

        })

        return false;
    }


    function bindSearchForm(){
        // 查询成交客户
        var messageTemplate = 'messageTemplate',
            searchResultTemplate = 'searchResultTemplate',
            $searchResultList = $('#flowList'),
            $searchResultPagination = $('#searchResultPagination'),
            $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]')

        // 直客 | 老带新切换是 清除已经选过的
        $('input[name*=channelType]').change(function(){
            clearClient();
        });

        var $doneTypeSelect = $('#doneTypeSelect'),
            $joinBox = $('#join-box'),
            $reselectBtn = $('#reselectBtn'),
            $joinListModal = $('#joinListModal'),
            joinTemplate = 'joinTemplate',
            $joinList = $('#joinList'),
            $joinPagination = $('#joinPagination'),
            $searchJoinForm = $('#searchJoinForm'),
            $joinPageNum = $searchJoinForm.find('input[name=page]'),
            $joinPageSize = $searchJoinForm.find('input[name=size]')
        $doneTypeSelect.change(function(){
            clearClient();

            if ($doneTypeSelect.val() =='1') {
                $cityList.hide();
                $joinBox.show();
                $reselectBtn.click();
            } else {
                $cityList.show();
                $joinBox.hide();
                $cityList.val('')
                $('#joinName').text('');
            }
        }).change();

        // 重新选择
        $reselectBtn.click(function(){
            $joinListModal.modal();
            $searchJoinForm.submit();
        });


        $searchJoinForm.submit(    // 查询加盟列表
            function(event) {
                var $context = $(this),
                    $disabled = $context.find('[disabled]'),
                    $submit = $context.find('input[type=submit]')

                if (event) {
                    event.preventDefault();
                }

                if ($submit.hasClass('disabled')) {
                    return false;
                }
                $disabled.removeAttr('disabled');
                $.ajax($.extend({
                    url: apiHost + '/hoss/league/apply/getLeagueCompanyPagesByUserId.do',
                    data: clearEmptyValue($context),
                    beforeSend: function () {
                        $submit.attr('disabled', 'disabled');
                    }
                }, jsonp)).
                    done(function (data) {
                        function useful(data) {
                            var dataObj = data.data || {},
                                templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                                    joinTemplate :
                                    messageTemplate;

                            // 显示数据
                            $joinList.html(
                                template(templateId, data)
                            );
                            // 显示分页
                            $joinPagination.pagination({
                                $form: $context,
                                totalSize: dataObj.totalElements,
                                pageSize: parseInt($joinPageSize.val()),
                                visiblePages: 5,
                                info: true,
                                paginationInfoClass: 'pagination-count pull-left',
                                paginationClass: 'pagination pull-right',
                                onPageClick: function (event, index) {
                                    $joinPageNum.val(index - 1);
                                    $context.trigger('submit');
                                }
                            });

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
                        $disabled.attr('disabled', 'disabled');
                        $submit.removeAttr('disabled').blur();
                    });

            });

        // 选中加盟公司
        $('#selectJoinBtn').click(function(){
            var $selected = $joinList.find('input[type=radio]:checked');
            if(!$selected.length) {
                sysMessage('请选择加盟公司！');
                return ;
            }

            var companyName = $selected.attr('cname');
            $('#joinName').text(companyName);
            $('#leagueCompany').val($selected.val());
            $cityList.val($selected.attr('cityId'));
            $cityList.change();

            $joinListModal.modal('hide');
        });


        $searchForm.submit(    // 查询单据列表
            function(event) {
                var $context = $(this),
                    $cityId = $context.find('[name=cityId]'),
                    $channelType = $context.find('[name=channelType]'),
                    $leagueType = $context.find('[name=leagueType]'),
                    $leagueCompany = $context.find('[name=leagueCompany]'),
                    $disabled = $context.find('[disabled]'),
                    $submit = $context.find('input[type=submit]'),
                    action = $context.attr('action') // 接口地址

                if (event) {
                    event.preventDefault();
                }

                //初始化数据
                $cityId.val($cityList.val());
                $channelType.val($('select[name*=channelType]').val());
                $leagueType.val($('select[name*=leagueType]').val());
                $leagueCompany.val($('#leagueCompany').val())

                if ($submit.hasClass('disabled')) {
                    return false;
                }
                $disabled.removeAttr('disabled');
                $.ajax($.extend({
                    url: apiHost + (action || '/liq/commissionStatement/getClientPages.do'),
                    data: clearEmptyValue($context),
                    beforeSend: function () {
                        $submit.attr('disabled', 'disabled');
                    }
                }, jsonp)).
                    done(function (data) {
                        function useful(data) {
                            var dataObj = data.data || {},
                                templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                                    searchResultTemplate :
                                    messageTemplate;

                            setCurrentPageData(data.data);

                            // 显示数据
                            $searchResultList.html(
                                template(templateId, data)
                            ).find('[flowId]').each(function(index, node){ // 设置已经选过的 checkbox 为选中状态
                                    var $target = $(node);
                                    if (selectedProvisional.hasOwnProperty($target.attr('flowId'))) {
                                        $target.attr('checked', true); // 取消再选中会导致对象覆盖, 设置过的调整归 0
                                        $target.prop('disabled', true);
                                    }else{
                                        $target.prop('disabled', false);
                                    }
                                });

                            // 显示分页
                            $searchResultPagination.pagination({
                                $form: $context,
                                totalSize: dataObj.totalElements,
                                pageSize: parseInt($pageSize.val()),
                                visiblePages: 5,
                                info: true,
                                paginationInfoClass: 'pagination-count pull-left',
                                paginationClass: 'pagination pull-right',
                                onPageClick: function (event, index) {
                                    $pageNum.val(index - 1);
                                    $context.trigger('submit');
                                }
                            });

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
                        $disabled.attr('disabled', 'disabled');
                        $submit.removeAttr('disabled').blur();
                    });

            });
    }


    /**
     * 查看佣金标准
     */
    function brokerageModalClick(e, type){

        var $brokerageModal = $('#brokerageModal'),
            $selectClientModal = $('#selectClientModal')

        $selectClientModal.modal('hide');
        $brokerageModal.modal('show');
        var $target = $(e.currentTarget),
            $flowList = $target.closest('#flowList'),
            projectId = $target.attr('projectId');
//        var code = (type == 'broker' ? '/liquidation/commissionSettlementStandards/findPersonalLiqStandard.do'
//            :'/liquidation/commissionSettlementStandards/findTeamLiqStandard.do');
        var code = '/liquidation/commissionSettlementStandards/findProjectLiqStandardHistory.do';

        var $historyListResult = $('#historyListResult'),
            historyListTemplate = 'historyListTemplate';

        $.ajax($.extend({
            url: apiHost + code ,
            data: {
                projectId:projectId
            },
            beforeSend: function () {
            }
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    if (dataObj.content.length) {
                        $historyListResult.html(
                            template(historyListTemplate, data)
                        );
                    } else {
                        $historyListResult.html('<div class="text-center">没有记录！</div>');
                    }

                    if (type == 'broker') {
                        $historyListResult.find('[org]').hide();
                    } else {
                        $historyListResult.find('[broker]').hide();
                    }

                    $brokerageModal.on('hidden.bs.modal', function(){
                        $brokerageModal.off('hidden.bs.modal');
                        if ($flowList.length) {
                            $selectClientModal.modal('show');
                        }
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取佣金标准失败！');
            })



        // 项目详情

        var getProjectInfoCode = '/hoss/org/org_attache/getProjectInfo.do';


//        <h3 class="house-name"><%= data.projectName %></h3>
//            <% if (data.leftDayNum > 0) { %>
//                <span class="house-countdown">距合作结束期<strong><%= data.leftDayNum %></strong>天</span>
//                <% } else { %>
//                [已结案]
//                <% } %>
//
//                <% $each(data.projectTypeDtoList, function(item, i){ %>
//                    <span><%= item.name %> [<%= item.groupbuyAmount %>万享<%= item.discountInfo %>]</span>,
//                    <% }); %>
//                    </div>


        // 项目详情
        function loadInfo(){
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

                        $('#projectName').text(dataObj.projectName);

                        if (dataObj.leftDayNum > 0) {
                            $lastDay.html('距合作结束期<strong> ' + dataObj.leftDayNum + ' </strong>天');
                        } else {
                            $lastDay.html('[已结案]');
                        }

                        $('#projectTime').text(dataObj.startTime + '至' + dataObj.endTime);
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
        loadInfo();

    }

    /** 设置当前翻页数据 */
    function setCurrentPageData(data){
        currentPageData = {};

        $.each(data.content, function(key, obj){
            currentPageData[obj.flowId] = obj;
        })
    }

    function bindAddForm(brokerageType){
//        /liq/commissionStatement/personal/submit.do
        $('#submit,#draft,#agree').click(addFormClick).
            attr('brokerageType', brokerageType)
    }

    /**
     * 佣金申请单
     */
    function addFormClick(event) {

        var $target = $(event.currentTarget),
            codeObj;

        // 判断 机构还是 个人
//        if ($target.attr('brokerageType') == 'broker') {
//            codeObj = {
//                'submit' : '/liq/commissionStatement/personal/submit.do',
//                'draft' : '/liq/commissionStatement/personal/draft.do',
//                'agree' : '/liq/commissionStatement/personal/approve.do'
//            }
//        } else {
//            codeObj = {
//                'submit' : '/liq/commissionStatement/submit.do',
//                'draft' : '/liq/commissionStatement/draft.do',
//                'agree' : '/liq/commissionStatement/approve.do'
//            }
//        }

        var $context = $('#addForm'),
            $disabled = $context.find('[disabled]'),
            $submit = $('input[type=button]'),
            btnId = $target.attr('id'),
            code = $target.attr('action'),
            taskId = queryString('taskId'),
            params = '';


        // 审批 编辑才有此 Id
        if ($('#liqChannelCommissionSettlementPerson_id').length) {
            params= '&flowDealType=submit&' +
                'taskId=' + queryString('taskId') + '&' +
                'wfInstanceId=' + queryString('wfInstanceId') + '&' +
                'content=' + encodeURIComponent($('#content').val())
        }

        // 附件参数
        var fileListArray = [];
        $context.find('[name=documentId]').each(function(index, node){
            var $target = $(node);
            fileListArray.push($target.val());
        });
        $('#fileListJson').val(JSON.stringify(fileListArray));


        initChangePayCommission();

        if (event) {
            event.preventDefault();
        }

        if ($submit.hasClass('disabled')) {
            return false;
        }
        $disabled.removeAttr('disabled');
        $.ajax($.extend({
            url: apiHost + code ,
            data: clearEmptyValue($context) + params,
            beforeSend: function () {
                $submit.attr('disabled', 'disabled');
            }
        }, jsonpost)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

//                    history.back();
                    location.href = document.referrer;
                }


                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '提交失败！');
            }).
            always(function () {
                $disabled.attr('disabled', 'disabled');
                $submit.removeAttr('disabled').blur();
            });

    }

    // 设置调整应付列表 index
    function initChangePayCommission(){
        var $payChange = $('input[adjust]'),
            $payGive = $('input[name*=payGive]'),
            $liqDetailsId = $('input[name*=liqDetailsId]'),
            $approveOrderDetailId = $('input[name*=approveOrderDetailId]'),
            $crossAmount = $('input[name*=crossAmount]');

        $payChange.each(function(index, node){
            var $change = $($payChange[index]);

            // 数字处理
            //if( !$.isNumeric($change.val()) ) {
            //    $change.val(0);
            //} else if( parseInt($change.val()) < 0 ) {
            //    $change.val(0);
            //}

            $change.attr('name', 'dealCustomerDtoList[' + index + '].payChange')

            var $payGiveItem = $($payGive[index]);
            $payGiveItem.attr('name', 'dealCustomerDtoList[' + index + '].payGive')

            var $id = $($liqDetailsId[index]);
            $id.attr('name', 'dealCustomerDtoList[' + index + '].liqDetailsId')

            var $approveOrderDetailIdItem = $($approveOrderDetailId[index]);
            $approveOrderDetailIdItem.attr('name', 'dealCustomerDtoList[' + index + '].approveOrderDetailId')

            var $crossAmountItem = $($crossAmount[index]);
            $crossAmountItem.attr('name', 'dealCustomerDtoList[' + index + '].crossAmount');
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
     * 加载已经存在的数据
     * @param type 类型   机构 org  个人 broker   跳点  cross
     * @param disabled 是否可以编辑
     * @param approval 是否是审批页面..  审批页面不可编辑、但是可以删除成交客户
     */
    var adjustDisabled = false;
    function loadInfo(type, disabled, approval){

        adjustDisabled = disabled;
        var businessKey = queryString('businessKey');
        var codeObj = {
            broker:'/liq/commissionStatement/personal/getApproveOrder.do',
            org:'/liq/commissionStatement/getApproveOrder.do',
            cross:'/liq/cross/commissionStatement/getApproveOrder.do'
        }
        var code = codeObj[type];

        $.ajax($.extend({
            url: apiHost + code ,
            data: {businessKey:businessKey},
            beforeSend: function () {
            }
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    // 初始化列表信息

//                    selectedFlowObj =
                    $.each(dataObj.dealCustomerDtoList, function(index, obj){
                        selectedFlowObj[obj.flowId] = obj;
                    });
                    showGroup(selectedFlowObj);

                    var $channelType = $('select[name*=channelType]'); // 直客 || 老带新
                    $channelType.val(dataObj.workFlowModel.channelType);
                    $channelType.attr('disabled', 'disabled')

                    // 直营 || 加盟
                    var $leagueType = $('select[name*=leagueType]'),
                        $joinBox = $('#join-box')
                    $leagueType.val(dataObj.workFlowModel.leagueType).prop('disabled', true);
                    $('#joinName').text(dataObj.leagueCompanyName);
                    $('#leagueCompany').val(dataObj.workFlowModel.leagueCompany);
                    if (dataObj.workFlowModel.leagueType == '1') {
                        $cityList.hide();
                        $joinBox.show();
                    } else {
                        $joinBox.hide();
                    }

                    // 其他单向数据
                    $('#cityList').html('<option value="' + dataObj.workFlowModel.cityId + '">' + dataObj.cityName + '</option>');
                    $('#remark').val(dataObj.workFlowModel.remark);

                    // 审批 Id
                    $('#liqChannelCommissionSettlementPerson_id').val(dataObj.workFlowModel.id);
                    $('#version').html(dataObj.workFlowModel.version);

//                    console.dir(data);
                    if (disabled) {

//                        if (!approval) {
                            $('#selectedClient a[delete]').removeAttr('href').removeAttr('delete');
//                        }
                        $('#remark').attr('disabled', 'disabled');
                        $('#selectClient').attr('disabled', 'disabled')
                    }

                    // 单号
                    $('#flowNo').text(dataObj.workFlowModel.flowNo);
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '读取亲申请单信息失败！');
            })



        // 查看审批流程按钮
        $(".toTab").click(function () {
            $("html, body").animate({
                scrollTop: $("#flow").offset().top + "px"
            }, {
                duration: 500,
                easing: "swing"
            });
            return false;
        });

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

    // 城市列表
    function initCityList (){
        // 城市列表
        areaPicker.getCityListByUser(function(data){
            $cityList.html(
                template('cityListTemplate', data)
            )
            if($cityList.children().length == 2) {
                $cityList[0].selectedIndex = 1;
                $cityList.change();
            }
        });
    }


    return {
        initDatePicker:initDatePicker,
        clearClient:clearClient,
        checkClient:checkClient,
        adjustKeyUp:adjustKeyUp,
        deleteClick:deleteClick,
        selectAll:selectAll,
        checkFlow:checkFlow,
        selectBtnClick:selectBtnClick,
        infoClick:infoClick,
        bindSearchForm:bindSearchForm,
        brokerageModalClick:brokerageModalClick,
        bindAddForm:bindAddForm,
        loadInfo:loadInfo,
        initCityList:initCityList,
        updateAdjustSum: updateAdjustSum
    };
});