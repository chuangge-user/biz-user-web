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

    /**
     * 获取城市列表
     */
    function getCity(callback){

        $.ajax($.extend({
            url: apiHost + '/hoss/sys/getMyCityList.do'
        }, jsonp)).
            done(function (data) {
//                $cityId.html(
//                        '<option value="">请选择城市</option>' +
//                        $.map(data.data.content, function(cityObj){
//                            return '<option value="' + cityObj.id + '">' + cityObj.name + '</option>'
//                        }).join('')
//                );

//                if (cityId) {
//                    $cityId.val(cityId)
//                }
                callback(data.data);

            })
    }

    /**
     * 获取中介专员
     */
    function getMaintain(cityId, callback) {
        $.ajax($.extend({
            url: apiHost + '/hoss/sys/findAuthUserPageByPositionCodeAndRegionId.do?cityId=' + cityId + '&positionCode=CITY_INTERMEDIARY_SPECIALIST'
        }, jsonp)).
            done(function (data) {
//                $maintainId.html(
//                        '<option value="">请选择维护人</option>' +
//                        $.map(data.data.content, function(cityObj){
//                            return '<option value="' + cityObj.id + '">' + cityObj.name + '</option>'
//                        }).join('')
//                ).removeAttr('disabled')
//
//                if (maintainId) {
//                    $maintainId.val(maintainId)
//                }
                callback(data.data);
            })
    }

    /**
     *
     * @param $cityId
     * @param $maintainId
     * @param cityId
     * @param maintainId
     */
    function bindCityAndMaintain($cityId, $maintainId, cityId, maintainId){
        $maintainId.prop('disabled', true);

        getCity(function(data){
            var optionHTML = '<option value="">请选择城市</option>';
            optionHTML += $.map(data.content || [], function(cityObj){
                return '<option value="' + cityObj.id + '">' + cityObj.name + '</option>'
            }).join('');

            $cityId.html(optionHTML);
            if (cityId) {
                $cityId.val(cityId).change();
            }

        })

        $cityId.change(function(){
            var cityId = $cityId.val();
            if (!cityId) {
                $maintainId.prop('disabled', true).val('');
            } else {
                $maintainId.prop('disabled', false);

                getMaintain(cityId, function(data){
                    var optionHTML = '<option value="">请选择维护人</option>';
                    optionHTML += $.map(data.content || [], function(cityObj){
                        return '<option value="' + cityObj.id + '">' + cityObj.name + '</option>'
                    }).join('');

                    $maintainId.html(optionHTML);
                    if (maintainId) {
                        $maintainId.val(maintainId)
                        maintainId = '';
                    }
                })
            }

        })
    }

    return {
        bindCityAndMaintain:bindCityAndMaintain
    }
});