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
    var areaPicker = require('area-picker');

    function domReady() {

        areaPicker.getCityListByUser(function(data){
            var cityListStr = '<option value="">请选择城市</option>';
            $.each(data.data.content, function(index, obj){
                cityListStr += '<option value="' + obj.id + '">' + obj.name + '</option>';
            });
            $('#cityList').html(cityListStr);
        })

        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate';

        // 集结号列表
        $searchForm.on('submit', function(event){
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
                url: apiHost + '/hoss/warrantChance/getWarrantChanceList.do',
                data: clearEmptyValue($context),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {

                    function useful(data) {
                        var dataObj = data.data || {};
                        var templateId = ($.isArray(dataObj.content) &&
                                    dataObj.content.length) ?
                            searchResultTemplate : 'messageTemplate';

                            // 显示数据
                            $searchResultList.html(
                                template(templateId, dataObj)
                            ).find('a[status]').confirmation({
                                    btnOkLabel: '确认',
                                    btnCancelLabel: '取消',
                                    onShow: function (event, element) {
                                        updateStatus.isConfirm = false;
                                        $(element).on('click.updateStatus', updateStatus);
                                    },
                                    onHide: function (event, element) {
                                        updateStatus.isConfirm = false;
                                        $(element).off('.updateStatus');
                                    },
                                    onConfirm: function (event, element) {
                                        updateStatus.isConfirm = true;
                                        $(element).trigger('click.updateStatus');
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
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取列表数据失败！');
                })
                .always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        }).trigger('submit');


        // 更新权证机会
        function updateStatus(e){

            if (!updateStatus.isConfirm) {
                return false;
            }
            updateStatus.isConfirm = false;

            var $that = $(this),
                $tr = $that.parents('tr'),
                id = $tr.find('[name=id]').val(),
                status = $that.attr('status')

            $.ajax($.extend({
                url: apiHost + '/hoss/warrantChance/updateWarrantChanceStatus.do',
                data: {
                    id:id,
                    status:status
                },
                beforeSend: function () {

                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        $searchForm.submit();
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '更新失败！');
                }).
                always(function () {

                });
        }


//        $searchResultList.delegate('a[status]', 'click', function(e){
//
//        })

    }


    $(domReady);
});


