/**
 * 中介客户管理
 */
define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

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
    var queryString = require('script/get-query-string');

    // 参数工厂
    var parameterFactory = require('script/parameter-factory');

    template.helper('customer_status', {
       '0':'未接单',
       '1':'服务中',
       '2':'已成交'
    });

    function domReady() {

        parameterFactory.bindFactory($('#parameterContainer'), {
            'cityId':{
                text:'城市',
                type:'city-list-modal'
            },
            'cusInfo':{
                text:'客户',
                placeholder:'请输入姓名或手机号',
                type:'default-modal'
            },
            'rentalName':{
                text:'租售中心名称',
                placeholder:'',
                type:'default-modal'
            },
//            'whr':{
//                text:'维护人',
//                type:'maintainer-modal'
//            },
            'orderStatus':{
                text:'委托状态',
                type:'entrust-status-modal'
            },
            'brokerInfo':{
                text:'经纪人',
                placeholder:'请输入姓名或手机号',
                type:'default-modal'
            },

            'dateTime':{
                text:'时间段',
                type:'interval-modal'
            }
        })



        initFixParams();

        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate',
            queryListCode = '/sale/client/findOrderByBuy.do',
            $tabType = $('#tabType'),
            resultListMap = {
                1:'#wantedResultList',
                2:'#hireResultList',
                3:'#buyResultList',
                4:'#saleResultList'
            },
            templateMap = {
                1:'wantedResultTemplate',
                2:'hireResultTemplate',
                3:'buyResultTemplate',
                4:'saleResultTemplate'
            };

        checkTab(); // 检查默认 TAB
        $searchForm.find('[result-target]').click(function(e){ // 切换 Tab 事件
            var $target = $(e.currentTarget);
            var resultTarget = $target.attr('result-target');
            $tabType.val(resultTarget);
            queryListCode = $target.attr('queryListCode');
            $searchForm.find('[name=page]').val(0);
            $searchForm.submit();
        });



        // 获取列表
        $searchForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]'),
                tabType = $tabType.val(),
                $searchResultList = $(resultListMap[tabType]),
                searchResultTemplate = templateMap[tabType];

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

                        initCustomerCount();

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

        }) .trigger('submit');

        /**
         * 初始化客户统计
         */
        function initCustomerCount(){

            // 买房客户统计
            var params = clearEmptyValue($('#searchForm'));
            $.ajax($.extend({
                url: apiHost + '/sale/client/findOrderByBuy.do',
                data:params,
                success:function(data){
                    $('#buyNumber').text(data.data.totalElements);
                }
            }, jsonp))

            // 卖房客户统计
            $.ajax($.extend({
                url: apiHost + '/sale/client/findOrderBySell.do',
                data:params,
                success:function(data){
                    $('#saleNumber').text(data.data.totalElements);
                }
            }, jsonp))
        }

        function initFixParams(){
            $('#rentalId').val(queryString('rentalId'));
            $('#brokerId').val(queryString('brokerId'));
        }

        function checkTab(){
            // 检查是否跳到 出售
            var tab = queryString('tab');
            if (tab) {
                var $target = $('a[result-target="' + tab + '"]');
                if (!$target.length) {
                    return;
                }
                var resultTarget = $target.attr('result-target');
                $tabType.val(resultTarget);
                queryListCode = $target.attr('queryListCode');
                $target.click();
            }
        }

    }

    $(document).ready(domReady);




});