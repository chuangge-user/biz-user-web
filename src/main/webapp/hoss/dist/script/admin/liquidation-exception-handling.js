
define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;
    var $ = require('jquery');
    var navigation = require('navigation');
    var pagination = require('pagination');
    var template = require('template');
    var ztree = require('ztree');
    var $position = $('#position');
    var modal = require('bootstrap/modal');
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;
    var systemMessage = require('system-message');


    require(['jquery', 'datetimepicker', 'date-extend'], function ($, datetimepicker, dateExtend) {
        var dateTarget = $('#datetimepicker');

        dateTarget.datetimepicker({
            autoclose: true,
            minuteStep: 5,
            minView: 2,
            language: 'zh-CN',
            format: 'yyyy-mm-dd'
        }).on('changeDate', function (event) {
            //
        }).prop('placeholder', dateExtend.toString(new Date()) );
    });




    // 生成事件
    $('#generateForm').on('submit', function (event) {
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
            url: apiHost + '/liquidationRequest/calculate.do',
            data: clearEmptyValue($context),
            beforeSend: function () {
                $submit.attr('disabled', 'disabled');
            }
        }, jsonp)).done(
            function (data) {
                function useful(data) {
                    var dataObj = data || {};
                    systemMessage({
                        type: 'info',
                        title: '操作提示：',
                        detail: dataObj.detail
                    });
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
                failCallback.call(this, jqXHR, '');
            }).
            always(function () {
                $disabled.attr('disabled', 'disabled');
                $submit.removeAttr('disabled').blur();
            }
        );
    });



});

