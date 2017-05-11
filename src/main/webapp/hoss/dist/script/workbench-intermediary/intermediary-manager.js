/**
 * 工作台：中介部经理
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

        // 中介列表
        var organizationListCode = '/hoss/org/org_manager/getOrganizationList.do',
            organizationListTemplate = 'organizationListTemplate',
            $organizationResultList = $('#organizationResultList');

        // 当前中介数据
        var getStatisticsOfThisMonthCode = '/hoss/org/org_manager/getStatisticsOfThisMonth.do',
            getStatisticsOfThisMonthTemplate = 'getStatisticsOfThisMonthTemplate',
            $getStatisticsOfThisMonthResult = $('#getStatisticsOfThisMonthResult');

        loadData(organizationListCode, null, organizationListTemplate, $organizationResultList, function(){
            $organizationResultList.find('li').click(function(e){ // 点击列表加载 本月数据
                var orgId = $(e.currentTarget).attr('orgId');
                var params = {
                    orgId:orgId
                };

                // 当前中介数据
                loadData(getStatisticsOfThisMonthCode, params, getStatisticsOfThisMonthTemplate, $getStatisticsOfThisMonthResult ,function(){
                    $getStatisticsOfThisMonthResult.find('a').each(function(index, item){
                        var $item = $(item);
                        $item.attr('href',$item.attr('href') + '&ORG_ID=' + orgId);
                    });
                });

            }).
                // 加载第一个节点数据
                eq(0).click();
        });


        // 中介数据-右上 TAB1
        var getOrgDataCode = '/hoss/org/org_manager/getOrgData.do',
            getOrgDataTemplate = 'getOrgDataTemplate',
            $getOrgDataResult = $('#intermediary-data');

        loadData(getOrgDataCode, null, getOrgDataTemplate, $getOrgDataResult);

        // 本月专员数据统计
        var getAttacheListCode = '/hoss/org/org_manager/getAttacheList.do',
            getAttacheListTemplate = 'getAttacheListTemplate',
            $getAttacheListResult = $('#getAttacheListResult');

        loadData(getAttacheListCode, null, getAttacheListTemplate, $getAttacheListResult);



        // 工作提醒
        var getWorkRemindListCode = '/hoss/org/org_manager/getWorkRemindList.do',
            getWorkRemindListTemplate = 'getWorkRemindListTemplate',
            $getWorkRemindListResult = $('#getWorkRemindListResult');

        loadData(getWorkRemindListCode, null, getWorkRemindListTemplate, $getWorkRemindListResult);

        // 本月项目转筹列表
        var getProjectInfoListOfThisMonth = '/hoss/org/org_manager/getProjectInfoListOfThisMonth.do',
            getProjectInfoListOfThisMonthTemplate = 'getProjectInfoListOfThisMonthTemplate',
            $getProjectInfoListOfThisMonthResult = $('#getProjectInfoListOfThisMonthResult');

        loadData(getProjectInfoListOfThisMonth, null, getProjectInfoListOfThisMonthTemplate, $getProjectInfoListOfThisMonthResult);

        // 中介经纪人转筹列表
        var getBrokeInfoListCode = '/hoss/org/org_manager/getBrokeInfoList.do',
            getBrokeInfoListTemplate = 'getBrokeInfoListTemplate',
            $getBrokeInfoListResult = $('#getBrokeInfoListResult');

        loadData(getBrokeInfoListCode, null, getBrokeInfoListTemplate, $getBrokeInfoListResult);

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
