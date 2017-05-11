define(function (require) {

    var $ = require('jquery');
    var navigation = require('navigation');

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;


    var template = require('template');

    var systemMessage = require('system-message');


    function domReady() {

        var
            $limitForm = $('#limitForm');


            $.ajax($.extend({
                url: apiHost + '/hoss/finance/approved/getLimitValue.do'
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};
                        $("#limitValue").val(dataObj);
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取数据失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取数据失败！');
                }).
                always(function () {

                });




        $limitForm.on('submit', function (event) {

            var  $context = $(this),
                 $disabled = $context.find('[disabled]'),
                 limitvalue =$limitForm.find("[name=limitValue]").val(),
                 $submit = $context.find('input[type=submit]');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + '/hoss/finance/approved/setLimitvalue.do',
                data: {
                    limitvalue:limitvalue
                },
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {}
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: "设置提现免审金额阀值成功!" || "设置提现免审金额阀值成功!"
                        });

                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '更新数据失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '更新数据失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        });


    }

    $(document).ready(domReady);





});