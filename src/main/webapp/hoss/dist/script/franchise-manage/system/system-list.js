/**
 * 中介客户管理
 */
define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    require(['jquery', 'datepicker', 'dist/script/bootstrap.min', 'dist/script/bootstrap-select']);

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
    var $province = $('#province'),
        $city = $('#city');
    areaPicker.provinceToCityNoMatch($province, $city);

    function domReady() {



        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate',
            queryListCode = '/hoss/league/contract/waitOpen.do',
            $tabType = $('#tabType')

        $searchForm.find('[result-target]').click(function(e){ // 切换 Tab 事件
            var resultTarget = $(e.currentTarget).attr('result-target');
            $tabType.val(resultTarget);
            jQuery("input[name='companyName']").val("");
            jQuery("select[name='city_s1']").val("");
            jQuery("select[name='city_s2']").val("");
            jQuery("input[name='page']").val("0");
            if( $tabType.val()=='openedResultList'){
                queryListCode = '/hoss/league/contract/moreOpen.do';
            }else{
                queryListCode = '/hoss/league/contract/waitOpen.do';
            }
            $searchForm.submit();
        });

        // 获取直客专员管理列表
        $searchForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]'),
                tabType = $tabType.val(),
                $searchResultList = $('#' + tabType)

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
                        if (queryListCode==='/hoss/league/contract/moreOpen.do') {
                            data.data.opening = true;
                        } else {
                            data.data.opening = false;
                        }


                        // 显示数据
                        $searchResultList.html(
                            template(templateId, data)
                        );

                        //console.log(tabType);

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


    }

    $(document).ready(domReady);




});