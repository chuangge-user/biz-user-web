/**
 * 中介客户管理
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
    function bind($select, id){

        $.ajax($.extend({
            url: apiHost + '/hoss/league/apply/searchExpandMan.do',
            data:''
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    var optionHTML = '<option value="">请选择拓展专员</option>';
                    $.each(dataObj.content, function(index, obj){
                        optionHTML += '<option value="' + obj.id + '">' + obj.userName + '</option>';
                    });

                    $select.html(optionHTML);

                    if (id) {
                        $select.val(id);
                    }
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
                failCallback.call(this, jqXHR, '获取拓展专员列表失败！');
            })
    }

    return {
        bind:bind
    }
});