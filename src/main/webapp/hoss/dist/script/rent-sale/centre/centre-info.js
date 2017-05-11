define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;

    require(['jquery', 'datepicker', 'dist/script/bootstrap.min']);

    var navigation = require('navigation');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');

    var pagination = require('pagination');

    var confirmation = require('bootstrap/confirmation');

    var systemMessage = require('system-message');
    var dateStr = require('date-extend');

    var queryString = require("script/get-query-string")
    var saleRentalcenterId = queryString('saleRentalId');
    template.helper('rentalId', saleRentalcenterId);


    function domReady() {

        var queryInfoCode = '/sale/saleCenter/qrySaleCenterBaseInfo.do';
        $.ajax($.extend({
            url: apiHost + queryInfoCode,
            data:{
                saleRentalcenterId:saleRentalcenterId
            }
        }, jsonp)).
            done(function (data) {

                function useful(data) {
                    var dataObj = data.data || {};

                    $.each(dataObj, function(key, value){
                        $('#' + key).text(value);
                    })

                }

                doneCallback.call(this, data, useful, useless);

            })

        var queryOrgInfoCode = '/sale/saleCenter/qryEnterOrgInfo.do';
        $.ajax($.extend({
            url: apiHost + queryOrgInfoCode,
            data:{
                saleRentalcenterId:saleRentalcenterId
            }
        }, jsonp)).
            done(function (data) {

                function useful(data) {
                    var dataObj = data.data || {};

                    $.each(dataObj, function(key, value){
                        $('#' + key).text(value);
                    })

                    // 附件
                    $('#annexDTOList').html($.map(dataObj.annexDTOList || [], function(obj){
                        return '<a href="' +apiHost + "/hoss/sys/fileDownload/download.do?id=" + obj.annexKey + '">' + obj.annexName + '</a>';
                    }).join('|'));

                    queryListCode = '/sale/saleCenter/qrySaleBrokerList.do?saleRentalcenterId=' + saleRentalcenterId + '&enterOrgId=' + dataObj.orgId;
                    if (dataObj.orgId) {
                        $('#orgName').attr('href', webHost + '/app/intermediary-manage/basic-information.html?intermediaryId=' + dataObj.orgId);
                        $searchForm.submit();
                    }
                }

                doneCallback.call(this, data, useful, useless);
            })




        // 中介列表
        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate',
            queryListCode

        // 获取列表
        $searchForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]'),
                $searchResultList = $('#searchResultList')

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');


            $.ajax($.extend({
                url: apiHost + queryListCode,
                data:clearEmptyValue($context),
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
                        $searchResultList.html(
                            template(templateId, data)
                        );

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

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取列表数据失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        })

        $('#historyLink').click(function(){
            $('#historyModal').modal();
            $historyForm.submit();
        });


        // 历史列表
        var $historyForm = $('#historyForm'),
            $historyPageNum = $historyForm.find('input[name=page]'),
            $historyPageSize = $historyForm.find('input[name=size]'),
            $historyResultList = $('#historyResultList'),
            $historyResultPagination = $('#historyResultPagination'),
            historyResultTemplate = 'historyResultTemplate'

        // 获取列表
        $historyForm.on('submit', function (event) {
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
                url: apiHost + '/sale/saleCenter/qryeEnterOrgInfoList.do',
                data:{
                    saleRentalcenterId:saleRentalcenterId
                },
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                                historyResultTemplate :
                                messageTemplate;

                        // 显示数据
                        $historyResultList.html(
                            template(templateId, data)
                        );

                        // 显示分页
                        $historyResultPagination.pagination({
                            $form: $context,
                            totalSize: dataObj.totalElements,
                            pageSize: parseInt($historyPageSize.val()),
                            visiblePages: 5,
                            info: true,
                            paginationInfoClass: 'pagination-count pull-left',
                            paginationClass: 'pagination pull-right',
                            onPageClick: function (event, index) {
                                $historyPageNum.val(index - 1);
                                $context.trigger('submit');
                            }
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

        })

//        sale/saleCenter/qryeEnterOrgInfoList.do?saleRentalcenterId=1019224206&page=0&size=10

        function useless(data) {
            systemMessage({
                type: 'info',
                title: '提示：',
                detail: data.detail
            });
        }


    }

    $(document).ready(domReady);



    function useless(data) {
        systemMessage({
            type: 'info',
            title: '提示：',
            detail: data.detail
        });
    }



});