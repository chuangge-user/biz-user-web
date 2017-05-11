define(function (require) {

    var $ = require('jquery');
    var navigation = require('navigation');

    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;
    var systemMessage = require('system-message');


    function domReady() {
        var $newApplyBox = $('.new-apply-box'),
            $newApplyType = $newApplyBox.find('.new-apply-type'),
            $newApplyDetail = $newApplyBox.find('.new-apply-detail');

        $newApplyType.on('click', function () {
            var $context = $(this),
                index = $newApplyType.index(this);
            $newApplyDetail.eq(index).slideToggle();
        });

        $.ajax($.extend({
            url: apiHost + '/hoss/workflow/listDefinition.do'
//            data: clearEmptyValue($context),
        }, jsonp))
            .done(function (data) {

                function useful(data) {
                    var dataObj = data.data || {};
                    $("a[processKey]").each(function(i,item){
                        var processKey = $(this).attr('processKey');
//                        console.log(dataObj[processKey]);
                        var definition = dataObj[processKey];
                        if(null!=definition){
                            $(this).attr('href',webHost+definition.saveUrl);
                            $(this).attr('auth-type-value',definition.saveUrl);
                            $(this).html(definition.processName);
                        }
                    })

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

    }

    $(document).ready(domReady);
});