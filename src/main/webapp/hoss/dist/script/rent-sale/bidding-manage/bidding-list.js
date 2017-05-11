define(function (require) {
    var hoss = require('hoss'),
    webHost = hoss.webHost,
        apiHost = hoss.apiHost;


    var $ = require('jquery');
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var navigation = require('navigation');

    var template = require('template');
    var datepicker = require('datepicker');
    var pagination = require('pagination');
    var confirmation = require('bootstrap/confirmation');
    var systemMessage = require('system-message');
    // 参数工厂
    var parameterFactory = require('script/parameter-factory');

    template.helper('apiHost',apiHost);


    //*******操作成功提示信息*******//
    function success_message(message) {
        systemMessage({
            type: 'info',
            title: '提示：',
            detail: message
        });
    }

    function domReady() {

        // 初始化参数
        parameterFactory.bindFactory($('#parameterContainer'), {
            'cityIdArray': {
                text: '城市',
                type: 'city-list-modal'
            },
            'rentalName':{
                text:'租售中心名称',
                placeholder:'',
                type:'default-modal'
            }
        })

        //*******获得跑批失败的消费数据数量*******//
        $.ajax($.extend({
            url: apiHost + '/kbd/consumedata/getAdsConsumeSumError.do'
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    if (data.status == 1 && data.data > 0) {
                        var click_href = '<a href="'+ apiHost +
                            '/hoss-v2/app/kbd/consumption-data-manage/consumption-list.html?status=2" class="btn btn-sm btn-default">查看</a></center>';
//                        systemMessage('<center>截止当前日期，您有<font color="red">' + data.data + '</font>条消费记录<br>跑批失败！<br>' + click_href);
                    }
                }
                function useless(data) {}
                doneCallback.call(this, data, useful, useless);
            });

        //*******时间筛选*******//
        var $datepickerGroup = $('#datepicker > input.datepicker'), timeStart, timeEnd;
        $datepickerGroup.datepicker({
            autoclose: true,
            language: 'zh-CN',
            dateFormat: 'yyyy-mm-dd'
        });
        $datepickerGroup.first().on('changeDate', function (event) {
            startDate = event.date.valueOf();
            $datepickerGroup.last().focus();
        });
        $datepickerGroup.last().on('changeDate', function (event) {
            endDate = event.date.valueOf();
            if (endDate && startDate && endDate < startDate) {
                systemMessage('结束时间不能小于开始时间！');
            }
        });

        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate';


        //*******获取招标管理列表*******//
        $searchForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]'),
                $searchResultList = $('#searchResultList');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + '/sale/bidinfo/getSaleBidinfoByPage.do',
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

                        // 显示数据
                        $searchResultList.find('tbody').html(
                            template(templateId, data)
                        );

                        // 显示分页
                        $searchResultPagination.pagination({
                            $form: $searchForm,
                            totalSize: dataObj.totalElements,
                            pageSize: parseInt($pageSize.val()),
                            visiblePages: 5,
                            info: true,
                            paginationInfoClass: 'pagination-count pull-left',
                            paginationClass: 'pagination pull-right',
                            onPageClick: function (event, index) {
                                $pageNum.val(index - 1);
                                $context.submit();
                            }
                        });


                        // 撤回
                        $searchResultList.on('click', '.bidWithdrawbtn', function(e) {
                            var bidWithdrawPort='/sale/bidinfo/bidWithdraw.do';//撤回端口

                            var $target = $(e.currentTarget);
                            var saleBidinfoId = $target.attr('data-saleBidinfoId'),
                                saleRentalcenterId = $target.attr('data-saleRentalcenterId');

                            $.ajax($.extend({
                                url: apiHost + bidWithdrawPort,
                                data: {
                                    saleBidinfoId:saleBidinfoId,
                                    saleRentalcenterId:saleRentalcenterId
                                },
                                beforeSend: function () {
                                }
                            }, jsonp)).
                                done(function (data) {
                                    function useful(data) {

                                        systemMessage({
                                            type: 'info',
                                            title: '提示：',
                                            detail: data.detail || '撤回成功！'
                                        });
                                        // 可能还需要其他操作
                                        $searchForm.submit();
                                    }

                                    function useless(data) {
                                        systemMessage({
                                            type: 'info',
                                            title: '提示：',
                                            detail: data.detail || '获取数据失败！'
                                        });
                                    }

                                    doneCallback.call(this, data, useful, useless);
                                })
                        });

                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        }).trigger('submit');
    }

    $(document).ready(domReady);
});
