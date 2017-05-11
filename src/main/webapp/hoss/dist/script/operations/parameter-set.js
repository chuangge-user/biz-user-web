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

    function domReady() {
        loadParameter();

        $('#addForm').submit(updateParameter);
    }

    // 设置参数
    function updateParameter(event) {
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
            url: apiHost + '/hoss/partnerSysConfig/updateSysConfig.do',
            data: clearEmptyValue($context),
            beforeSend: function () {
                $submit.attr('disabled', 'disabled');
            }
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

//                    location = document.referrer;
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail
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
                failCallback.call(this, jqXHR, '更新运营参数失败！');
            }).
            always(function () {
                $disabled.attr('disabled', 'disabled');
                $submit.removeAttr('disabled').blur();
            });

    }

    // 加载参数
    function loadParameter() {
        $.ajax($.extend({
            url: apiHost + '/hoss/partnerSysConfig/getSysConfig.do',
            data: {},
            beforeSend: function () {
            }
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    $.each(dataObj, function(key, value){
                        $('input[name=' + key + ']').val(value);
                    })
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
                failCallback.call(this, jqXHR, '加载集结号失败！');
            })
    }


    $(domReady);
});


