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
    var fileupload = require('fileupload');

    var systemMessage = require('system-message');
    var dateStr = require('date-extend');
    var queryString = require('script/get-query-string');
    var id = queryString('id');

    function domReady() {
        $.ajax($.extend({
            url: apiHost + '/hoss/partnerOperate/getSysInfo.do',
            data: {
                id:id,
                type:'assembly'
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

                    $('#publishObject').text(
                        getPublishObjectName(dataObj.sysInfo.publishObject)
                    );
                    $('#date').text(
                        dataObj.sysInfo.activityStartDate + '~' + dataObj.sysInfo.activityEndDate
                    );
                    if ((new Date(dataObj.sysInfo.activityEndDate) < (new Date()))) {
                        $('#end').show();
                    }


                    $('#uploadImg').attr('src', fileupload.getSrc(dataObj.sysInfo.imageId))

                    $('#title').text(dataObj.sysInfo.title);
                    $('#editor').html(
                        decodeURIComponent(dataObj.sysInfo.content)
                    );

                    console.dir(dataObj);
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

        function getPublishObjectName(keyStr){
            return keyStr.replace('agency', '中介').replace('directClient','直客')
        }
    }

    $(domReady);
});


