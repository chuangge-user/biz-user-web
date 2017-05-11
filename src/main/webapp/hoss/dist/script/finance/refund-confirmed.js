/**
 * 项目日报收款
 */
define(function (require) {
    var hoss = require('hoss'),
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

    var pagination = require('pagination');

    var confirmation = require('bootstrap/confirmation');

    var systemMessage = require('system-message');
    var dateStr = require('date-extend');

    var urlAffirmRefuse = apiHost + '/hoss/finance/refund/updateRefundAffirmRefuse.do?refundIds=';
    var urlRefundAffirm = apiHost + '/hoss/finance/refund/updateRefundAffirm.do?refundIds=';
    var urlAffirmOther =  apiHost + '/hoss/finance/refund/updateRefundDown.do?refundIds=';

    require(['jquery', 'select-checkbox'], function ($, selectCheckbox) {
        var $select = $('#select'),
            $inverseSelect = $('#inverseSelect');

        $select.selectCheckbox({
            type: 'toggle',
            selector: '#selectGroup > [type=checkbox]'
        });
        $inverseSelect.selectCheckbox({
            type: 'inverse',
            selector: '#selectGroup > [type=checkbox]'
        });
    });








    function domReady() {

        $('input[name=startDate]').attr("value", dateStr.getToday());
        var $datepickerGroup = $('#datepicker > input'),
            startDate;
        $datepickerGroup.datepicker({
            autoclose: true,
            language: 'zh-CN',
            dateFormat: 'yy-mm-dd'
        });
        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            $leadingOut=$("#leadingOut"),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate';

        // 获取项目状态管理列表
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
                url: apiHost + '/hoss/finance/refund/getRefundList.do',
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

        }).trigger('submit');


        var $pageContent = $('.page-content');

        // 返回搜索结果列表
        $pageContent.on('click', '.btn-back-list', function (event) {
            if (event) {
                event.preventDefault();
            }

            $pageContent.addClass('hide');
            $searchListContent.removeClass('hide');

//            console.log('back-list');
        });


        // 更新查询条件时，页码返回第一页
        $searchForm.find('input, select').on('change', function () {
            $pageNum.val('0');
        });


        //导出excel
        $leadingOut.on('click', function () {
            var leadingOuturl = apiHost + '/hoss/finance/refund/leadingOut.do?' + $searchForm.serialize();
            $leadingOut.attr('href', leadingOuturl);
        });

        $("#allrefundbox").on('click',function(){
            if(this.checked) {
                $("input[name='refundbox']").each(function(){this.checked=true;});
            } else {
//                $("[name=refundbox]:checked").attr("checked",false);
//                $("input[name='refundbox']").each(function(){this.checked=true;});
//                $("[name=refundbox]:checked").attr("checked",false);
                $("input[name='refundbox']").each(function(){this.checked=false;});
            }
        })

        //拒绝退款
        window.affirmRefuse=affirmRefuse;
        function affirmRefuse(objvalue,objstr){
            if(!confirm("是否进行："+objstr +"操作")){
                return false;
            }
            updateRefund(urlAffirmRefuse,objvalue);
        }
        //快钱退款
        window.refundAffirm=refundAffirm;
        function refundAffirm(objvalue,objstr){
            if(!confirm("是否进行："+objstr +"操作")){
                return false;
            }
            updateRefund(urlRefundAffirm,objvalue);
        }
        //其他退款
        window.affirmOther=affirmOther;
        function affirmOther(objvalue,objstr){
            if(!confirm("是否进行："+objstr +"操作")){
                return false;
            }
            updateRefund(urlAffirmOther,objvalue);
        }
        //获取选中的复选框值
        window.getCheckBoxValue = getCheckBoxValue;
        function getCheckBoxValue(){
            var obj = "";
            $("input[name='refundbox']:checked").each(function(){
                obj+=$(this).val()+",";
            });
            return obj;
        }
        //多条数据，拒绝退款
        window.affirmRefuseArray=affirmRefuseArray;
        function affirmRefuseArray(objstr){
            var objvalue = this.getCheckBoxValue();
            if(objvalue.length==0){
                return false;
            }
            if(!confirm("是否进行："+objstr +"操作")){
                return false;
            }
            updateRefund(urlAffirmRefuse,objvalue);
        }
        //多条数据，快钱退款
        window.refundAffirmArray=refundAffirmArray;
        function refundAffirmArray(objstr){
            var objvalue = this.getCheckBoxValue();
            if(objvalue.length==0){
                return false;
            }
            if(!confirm("是否进行："+objstr +"操作")){
                return false;
            }
            updateRefund(urlRefundAffirm,objvalue);
        }
        //多条数据，其他
        window.affirmOtherArray=affirmOtherArray;
        function affirmOtherArray(objstr){
            var objvalue = this.getCheckBoxValue();
            if(objvalue.length==0){
                return false;
            }
            if(!confirm("是否进行："+objstr +"操作")){
                return false;
            }
            updateRefund(urlAffirmOther,objvalue);
        }
        window.updateRefund=updateRefund;
        function updateRefund(url,objvalue){
            $.ajax($.extend({
                url: url+objvalue
            }, jsonp))
                .done(function (data) {
                    doneCallback.call(
                        this,
                        data,
                        function (data) {
                            if("1"==data.status||1==data.status){
                                systemMessage({
                                    type: 'info',
                                    title: '提示：',
                                    detail: data.detail || '保存数据成功！'
                                });
                                location.reload();
                            }else{
                                systemMessage({
                                    type: 'error',
                                    title: '提示：',
                                    detail: data.detail || '保存数据失败！'
                                });
                            }
                        }
                    );
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '保存信息失败');
                })
                .always(function (data) {});
        }
    }

    $(document).ready(domReady);



});
