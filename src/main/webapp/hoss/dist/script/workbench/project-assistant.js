define(function (require) {

    var $ = require('jquery');
    var navigation = require('navigation');
    var $modal = require('bootstrap/modal');
    var $tab = require('bootstrap/tab');
    var load = require('dist/script/loaddata');

    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;

    var template = require('template');
    template.helper('_fixHref_', function (str) {
        return String(str).replace(
            /(href=["'])(.+?)(["'])/ig,
                '$1'+ webHost +'$2$3'
        );
    });
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;
    var modal = require('bootstrap/modal');
    var systemMessage = require('system-message');

    var numberUtil = require('script/approval/number-util');

    //图标依赖
    var echarts = require('echarts/echarts'),
        ecConfig = require('echarts/config'),
        macarons = require('echarts/theme/macarons'),
        bar = require('echarts/chart/bar'),
        line = require('echarts/chart/line'),
        pie = require('echarts/chart/pie');

    var projectUtil = require("script/project/project-util");
    var $projectId = null;
    var proInfoList = projectUtil.appendProjectSelectUtil('projectInfoDiv', function (proInfo) {
        $projectId = proInfo.id;
        fillBenchChartData();
    });

    var myChart = echarts.init(document.getElementById('projectAssistantCustomerChartDiv'));

    $(function () {
        var $approvalListTab = $('#approvalListTab');
        $approvalListTab.find('a:first').tab('show');
        $("a.toTab").click(function () {
            $("html, body").animate({
                scrollTop: $approvalListTab.offset().top + "px"
            }, {
                duration: 500,
                easing: "swing"
            });
            return false;
        });
        $(".goback").click(function () {
            history.back();
        });
//        $projectId = proInfoList[0].id;
//        fillBenchChartData();
    });


    var msgType = '';
    $('#msgTypeSelect').on('change', function (event) {
        if (event) {
            event.preventDefault();
        }
        msgType = $(this).val();
        $.ajax($.extend({
            url: apiHost + '/hoss/project/assistant/searchMessage.do?msgType=' + msgType
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data;
                    fillBenchChartData();
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '消息提醒数据获取失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);

            }
        );
    });



    function fillBenchChartData() {
//        var projectId = 1;
        $('#invoice_link').attr('href', '../project/invoice-detail.html?projectId=' + $projectId);
        $('#group_reduce_link').attr('href', '../case-field/group-buying-reduce.html?projectId=' + $projectId);
        $('#refund_link').attr('href', '../case-field/refund-manage.html?projectId=' + $projectId);

        $.ajax($.extend({
            url: apiHost + '/hoss/project/assistant/getWorkbenchDto.do?projectId=' + $projectId
        }, jsonp))
            .done(function (data) {
                function useful(data) {
                    var dataObj = data.data,
                        dataFilter = [],
                        dataContent = dataObj.messageDto.messageDtoList;
                    if (dataObj) {
                        console.log(dataObj);
                        console.log(msgType);

                        var myChartOption = getCustomerChartOption(dataObj);

                        var ecEvent = function(param){
//                           var statusType = myChartOption.series[param.seriesIndex].name;
                            var url = apiHost + "/hoss-v2/app/project/customer-type.html?projectId=" + $projectId + "&statusType="+ encodeURI(param.name);
                            window.location.href = url;
                        }

                        myChart.setOption(myChartOption).on(ecConfig.EVENT.CLICK, ecEvent);
                        $("#buyTransferRateSpan").html(numberUtil.parseToPercentStr(dataObj.buyTransferRate));
                        $('#haowuChannelRateSpan').html(numberUtil.parseToPercentStr(dataObj.haowuChannelRate)); $('#refundRateSpan').html(numberUtil.parseToPercentStr(dataObj.refundRate));

                        if (dataObj) {
                            if ( msgType !== '' ) {
                                dataContent.forEach(function(v){
                                    if ( v.msgType == msgType ) {
                                        dataFilter.push(v);
                                    }
                                });
                                dataObj.messageDto.messageDtoList = dataFilter;
                            }
                        }

                        if (msgType === '') {
                            $("#workRemindUl").html(template('workRemindTemplate', dataObj));
                            $("#workMessageUl").html(template('workMessageTemplate', dataObj));
                        } else if (+msgType === 1) {
                            $("#workRemindUl").html(template('workRemindTemplate', dataObj));
                            $("#workMessageUl").html(template('workMessageTemplate', dataObj));
                        } else {
                            $("#workRemindUl").html('');
                            $("#workMessageUl").html(template('workMessageTemplate', dataObj));
                        }

                        /*$("#workRemindUl").html(template('workRemindTemplate', dataObj));
                        $("#workMessageUl").html(template('workMessageTemplate', dataObj));*/


                        $('#refund_wait_link').attr('href', '../case-field/refund-manage.html?projectId=' + $projectId + '&refundStatus=refund_apply');
                        $('#refund_failed_link').attr('href', '../case-field/refund-manage.html?projectId=' + $projectId + '&refundStatus=refund_bill_failure');
                        $('#filing_confirmed_link').attr('href', '../case-field/filing-confirmed.html?projectId=' + $projectId + '&filingStatus=linking');
                    }
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取客户数据失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }
        ).fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取客户数据失败！');
            }
        );
    }


    function getCustomerChartOption(dataObj) {
        var customerData = dataObj.customerStatusCount;
        var dataArr = [0, 0, 0, 0, 0];
        if (customerData) {
            var dataArr = [customerData.refundCount, customerData.turnDealCount, customerData.buyCount, customerData.visitedCount, customerData.appointCount];
        }
        var option = {
            title: {
                //text: '导客统计,汇总到目前为止客户预约累计量、客户来访累计量、客户认筹累计量、客户转筹累计量、客户退款累计量',
                subtext: '导客统计,汇总到目前为止客户预约累计量、客户来访累计量、客户认筹累计量、客户转筹累计量、客户退款累计量',
                padding: [5, 12, 12, 66]
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['客户·组'],
                x: 'right'
            },
            //  calculable : true,
            xAxis: [
                {
                    type: 'value',
                    boundaryGap: [0, 0.11]
                }
            ],
            yAxis: [
                {
                    type: 'category',
                    data: ['退款', '转筹', '认筹', '来访', '预约']
                }
            ],
            series: [
                {
                    name: '客户·组',
                    type: 'bar',
                    data: dataArr,
                    barWidth: 16,
                    itemStyle: { normal: {color: '#3872B9', label: {show: true, position: 'right'}}}
                }
            ]
        }

        return option;
    }

});