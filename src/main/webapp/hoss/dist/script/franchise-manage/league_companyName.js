/**
 * 加盟公司下拉
 */
define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    require(['jquery']);

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var systemMessage = require('system-message');

    // 绑定拓展专员下拉列表
    function bind($select){

        $.ajax($.extend({
            url: apiHost + '/hoss/league/contract/addContract.do',
            data:''
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    var optionHTML = '<option value="">请选择加盟公司</option>';
                    $.each(dataObj.content, function(index, obj){
                        optionHTML += '<option value="' + obj.id + '">' + obj.name + '</option>';
                    });

                    $select.html(optionHTML);
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
                failCallback.call(this, jqXHR, '获取加盟公司列表失败！');
            })
    }

    return {
        bind:bind
    }
});