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

    var queryString = require('script/get-query-string');
    var id = queryString('id');

    function domReady() {
        $.ajax($.extend({
            url: apiHost + '/hoss/partnerOperate/getSysInfo.do',
            data: {
                id:id,
                type:'in'
            },
            beforeSend: function () {
            }
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    var citys = [];
                    $.each(dataObj.partnerCityVoList, function(index, obj){
                        citys.push(obj.cityName);
                    });
                    $('#citys').text(citys.join(','));
                    $('#publishObject').text(dataObj.sysInfo.publishObject);
                    $('#content').text(dataObj.sysInfo.content)
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


