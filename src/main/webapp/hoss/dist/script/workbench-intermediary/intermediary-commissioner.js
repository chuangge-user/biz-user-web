/**
 * 工作台：中介部专员
 */
define(function (require) {
    var hoss = require('hoss'),
        webHost = hoss.webHost,
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    require('datepicker');

    var navigation = require('navigation');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');
    template.helper('_fixHref_', function (str) {
        return String(str).replace(
            /(href=["'])(.+?)(["'])/ig,
                '$1'+ webHost +'$2$3'
        );
    });

    var pagination = require('pagination');


    var confirmation = require('bootstrap/confirmation');
    var tab = require('bootstrap/tab');

    var systemMessage = require('system-message');
    var dateStr = require('date-extend');





    function domReady() {


        var messageTemplate = 'messageTemplate';

        // 项目列表
        var getProjectListCode = '/hoss/org/org_attache/getProjectList.do',
            getProjectListTemplate = 'getProjectListTemplate',
            $projectTitle = $('#projectTitle'),
            $getProjectListResult = $('#getProjectListResult');

        // 中介转筹
        var getOrganizationInfoListCode = '/hoss/org/org_attache/getOrganizationInfoList.do',
            getOrganizationInfoListTemplate = 'getOrganizationInfoListTemplate',
            $getOrganizationInfoListResult = $('#getOrganizationInfoListResult');

        // 中介经纪人转筹
        var getBrokerInfoListByProjectCode = '/hoss/org/org_attache/getBrokerInfoListByProject.do',
            getBrokerInfoListByProjectTemplate = 'getBrokerInfoListByProjectTemplate',
            $getBrokerInfoListByProjectResult = $('#getBrokerInfoListByProjectResult');

        // 加载主工作台数据
        var getInfoOfProjectCode = '/hoss/org/org_attache/getInfoOfProject.do',
            getInfoOfProjectTemplate = 'getInfoOfProjectTemplate',
            $getInfoOfProjectResult = $('#getInfoOfProjectResult');


        loadData(getProjectListCode, null, getProjectListTemplate, $getProjectListResult, function(){
            $getProjectListResult.find('li').click(function(e){
                var params = {
                    projectId:$(e.currentTarget).attr('projectId')
                };

                // 中介转筹数据
                loadData(getOrganizationInfoListCode, params, getOrganizationInfoListTemplate, $getOrganizationInfoListResult);

                // 中介经纪人转筹数据
                loadData(getBrokerInfoListByProjectCode, params, getBrokerInfoListByProjectTemplate, $getBrokerInfoListByProjectResult)

                // 加载主工作台数据
                loadData(getInfoOfProjectCode, params, getInfoOfProjectTemplate, $getInfoOfProjectResult, function(){
                    // 设置中介信息
                    setProjectData(params);

                    $getInfoOfProjectResult.find('a').each(function(index, item){
                        var $item = $(item);
                        $item.attr('href',$item.attr('href') + '&projectId=' + params.projectId);
                    });
                });


                // 获取项目 合作期剩余天数
                var getProjectInfoCode = '/hoss/org/org_attache/getProjectInfo.do';
                $.ajax($.extend({
                    url: apiHost + getProjectInfoCode,
                    data: {
                        projectId:params.projectId
                    },
                    beforeSend: function () {

                    }
                }, jsonp)).
                    done(function (data) {
                        function useful(data) {
                            var dataObj = data.data || {};


                            $projectTitle.html('距合作结束期&nbsp;&nbsp;' + dataObj.leftDayNum + '&nbsp;&nbsp;天 &nbsp;&nbsp;&nbsp;' +
                                '<a href="../project/overview.html?projectId='+params.projectId + '">详情</a>');

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



            });

            $getProjectListResult.find('li').eq(0).click();
        });

        // 项目中介列表
        var getOrganizationListCode = '/hoss/org/org_attache/getOrganizationListByProject.do',
            getOrganizationListTemplate = 'getOrganizationListTemplate',
            $getOrganizationListResult = $('#getOrganizationListResult'),
            $searchOrganizationPagination = $('#searchOrganizationResultPagination'),
            $organizationListForm = $('#organizationListForm'),
            $pageSize = $organizationListForm.find('[name=size]'),
            $projectId = $organizationListForm.find('[name=projectId]'),
            $pageNum = $organizationListForm.find('[name=page]');

        $organizationListForm.on('submit', function(event){
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + getOrganizationListCode,
                data: clearEmptyValue($context),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                                getOrganizationListTemplate :
                                messageTemplate;

                        // 显示数据
                        $getOrganizationListResult.html(
                            template(templateId, data)
                        );

                        // 显示分页
                        $searchOrganizationPagination.pagination({
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
                            detail: data.detail || '获取渠道列表数据失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取渠道列表数据失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });
        });


        function setProjectData(params){

            $getInfoOfProjectResult.find('[data-toggle=modal]').click(function(){
                $projectId.val(params.projectId);
                $organizationListForm.submit();
            });
        }


        // 工作提醒
        var getWorkRemindListCode = '/hoss/org/org_manager/getWorkRemindList.do',
            getWorkRemindListTemplate = 'getWorkRemindListTemplate',
            $getWorkRemindListResult = $('#getWorkRemindListResult');

        loadData(getWorkRemindListCode, null, getWorkRemindListTemplate, $getWorkRemindListResult);


        // 加载数据方法
        function loadData(code, params, successTemplate, $searchResultList, callback){

            $.ajax($.extend({
                url: apiHost + code,
                data: params,
                beforeSend: function () {

                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = successTemplate;
//                            templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
//                                successTemplate :
//                                messageTemplate;
                        // 有 content 但是没长度
//                        if (dataObj.content && dataObj.content.length === 0){
//                            templateId = messageTemplate;
//                        }

                        // 显示数据
                        $searchResultList.html(
                            template(templateId, data)
                        );

                        if(callback){
                            callback();
                        }

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


    }

    $(document).ready(domReady);



});
