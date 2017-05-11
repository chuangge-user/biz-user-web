/**
 * 加盟申请
 */
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

    //*******操作成功提示信息*******//
    function success_message(message) {
        systemMessage({
            type: 'info',
            title: '提示：',
            detail: message
        });
    }

    function domReady() {

        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate';
        //违约金：查看
        $searchResultList.on('click','.listPenalty',function(){
            var contractid = $(this).attr('contractid');
            //console.log($(this).attr('contractid'));
            var data = {id:contractid};
            loadData('/hoss/league/contract/listPenalty.do',data,'compensationTemplate',$('#compensationTable'));
        });
        //违约金：打开添加子画面
        $searchResultList.on('click','.showPenalty',function(){
            var contractid = $(this).attr('contractid');
            jQuery("#doAddPenalty").attr("contractid",contractid);
            jQuery("input[name='damages']").val("");
            jQuery("input[name='reason']").val("");
        });
        //违约金：添加
        $('#doAddPenalty').click(function(){
            var contractid = $(this).attr('contractid');
            var damages = jQuery("input[name='damages']").val();
            var reason = jQuery("input[name='reason']").val();
            var data = {id:contractid,damages:damages,reason:reason};
            loadData('/hoss/league/contract/addPenalty.do',data,null,null,function(){
                success_message('添加成功！');
            });
        });
        //*******获取投放列表*******//
        $searchForm.on('submit', function (event) {
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
                url: apiHost + '/hoss/league/contract/listDeposit.do',
                //url: apiHost + '/hoss/sys/agent/getAllAgentUserList.do',
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
                                $context.trigger('submit');
                            }
                        });

                        //*******确认保证金提示框*******//
                        $searchResultList.find('.btn_confirm_deposit[data-toggle=confirmation]').confirmation({
                            btnOkLabel: '确认',
                            btnCancelLabel: '取消',
                            onShow: function (event, element) {
                                confirm_deposit.isConfirm = false;
                                $(element).on('click.remove', confirm_deposit);
                            },
                            onHide: function (event, element) {
                                confirm_deposit.isConfirm = false;
                                $(element).off('.remove');
                            },
                            onConfirm: function (event, element) {
                                confirm_deposit.isConfirm = true;
                                $(element).trigger('click.remove');
                            }
                        });
                        function confirm_deposit() {
                            var _obj = $(this);
                            var id = $(this).attr('data-id');
                            if (!id) {
                                systemMessage('当前合同没有id，请检查！');
                                return false;
                            }
                            //发送请求
                            $.ajax($.extend({
                                url: apiHost + '/hoss/league/contract/confirmDeposit.do',
                                data: {id: id},
                                beforeSend: function () {
                                    _obj.attr('disabled', 'disabled').text('确认中...');
                                },
                                success: function (data) {
                                    success_message(data.detail || '确认成功！');

                                    setTimeout(function () {
                                        $searchForm.submit();
                                    }, 600);
                                },
                                error: function () {
                                    systemMessage('确认失败！');
                                },
                                complete: function () {
                                    _obj.removeAttr('disabled').text('已确认');
                                }

                            }, jsonp));
                        };

                        //*******确认归还金提示框*******//
                        $searchResultList.find('.btn_confirm_return[data-toggle=confirmation]').confirmation({
                            btnOkLabel: '确认',
                            btnCancelLabel: '取消',
                            onShow: function (event, element) {
                                confirm_return.isConfirm = false;
                                $(element).on('click.remove', confirm_return);
                            },
                            onHide: function (event, element) {
                                confirm_return.isConfirm = false;
                                $(element).off('.remove');
                            },
                            onConfirm: function (event, element) {
                                confirm_return.isConfirm = true;
                                $(element).trigger('click.remove');
                            }
                        });
                        function confirm_return() {
                            var _obj = $(this);
                            var id = $(this).attr('data-id');
                            if (!id) {
                                systemMessage('当前合同没有id，请检查！');
                                return false;
                            }
                            //发送请求
                            $.ajax($.extend({
                                url: apiHost + '/hoss/league/contract/confirmReturn.do',
                                data: {id: id},
                                beforeSend: function () {
                                    _obj.attr('disabled', 'disabled').text('确认中...');
                                },
                                success: function (data) {
                                    success_message(data.detail || '确认成功！');

                                    setTimeout(function () {
                                        $searchForm.submit();
                                    }, 600);
                                },
                                error: function () {
                                    systemMessage('确认失败！');
                                },
                                complete: function () {
                                    _obj.removeAttr('disabled').text('已确认');
                                }
                            }, jsonp));
                        };
                    }
                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获得失败！'
                        });
                    }
                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获得失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        }).trigger('submit');

        // 加载数据方法
        function loadData(code, params, successTemplate, $searchResultList, callback){
            $.ajax($.extend({
                url: apiHost + code,
                data: params
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = successTemplate;
                        if(successTemplate && $searchResultList){
                            $searchResultList.html(
                                template(templateId, data)
                            );
                        } else {
                            jQuery(".listPenalty[contractid='"+dataObj.id+"']").html(dataObj.liquidated_damages_total+"元");
                            jQuery("#returnMoney"+dataObj.id).html(dataObj.return_money+"元");
                        }
                        (!!callback)&&callback();
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
                })
        }
    }

    $(document).ready(domReady);
});
