define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');

    var systemMessage = require('system-message');

    var EventProxy = require('event-proxy'),
        proxy = new EventProxy();



    // example:
    //      var areaPicker = require('area-picker');
    //      areaPicker.bigAreaToCity($bigArea, $city);
    // example:
    //      require(['area-picker'], function (areaPicker) {
    //          areaPicker.bigAreaToCity($bigArea, $city);
    //      });



    var tpl =
        '<% $each(data.content, function(item, i){ %>' +
        '<option value="<%= item.id %>"><%= item.name %></option>' +
        '<% }); %>',

        bigAreaTplTit = '<option selected="selected" value="">请选择大区</option>',
        bigAreaTpl = bigAreaTplTit + tpl,
        bigAreaRender = template.compile(bigAreaTpl),

        provinceTplTit = '<option selected="selected" value="">请选择省份</option>',
        provinceTpl = provinceTplTit + tpl,
        provinceRender = template.compile(provinceTpl),

        cityTplTit = '<option selected="selected" value="">请选择城市</option>',
        cityTpl = cityTplTit + tpl,
        cityRender = template.compile(cityTpl),

        areaTplTit = '<option selected="selected" value="">请选择区</option>',
        areaTpl = areaTplTit + tpl,
        areaRender = template.compile(areaTpl);



    /**
     * 获取所有大区列表
     * @param callback
     */
    function getBigAreaList(callback) {
        $.ajax($.extend({
            url: apiHost + '/hoss/sys/getAllBigAreaList.do',
            beforeSend: function () {}
        }, jsonp)).
        done(function (data) {
            if (!$.isFunction(callback)) {
                callback = function () {};
            }
            doneCallback.call(this, data, callback);
        }).
        fail(function (jqXHR) {
            failCallback.call(this, jqXHR, '获取所有大区失败！');
        });
    }

    /**
     * 获取所有省份列表
     * @param bigAreaId
     * @param callback
     */
    function getProvinceList(bigAreaId, callback) {
        // 默认获取所有省份
        var params = {};

        // 仅获取大区下面的省份
        if (bigAreaId) {
            params.bigAreaId = bigAreaId;
        }

        $.ajax($.extend({
            url: apiHost + '/hoss/sys/getAllProvinceList.do',
            data: params,
            beforeSend: function () {}
        }, jsonp)).
        done(function (data) {
            if (!$.isFunction(callback)) {
                callback = function () {};
            }
            doneCallback.call(this, data, callback);
        }).
        fail(function (jqXHR) {
            failCallback.call(this, jqXHR, '获取所有省份列表失败！');
        });
    }

    /**
     * 根据省份ID获取城市列表(合作城市，且添加一个全国的，值“-1”)
     * @param provinceId
     * @param callback
     */
    function getCityListByProvinceIdAddCountry(provinceId, callback) {
        var params = {};

        if (!provinceId) {
            systemMessage('缺少省份ID！');
            return;
        }

        params.provinceId = provinceId;

        $.ajax($.extend({
            url: apiHost + '/hoss/sys/getAllCityListByProvinceIdAddCountry.do',
            data: params,
            beforeSend: function () {}
        }, jsonp)).
        done(function (data) {
            if (!$.isFunction(callback)) {
                callback = function () {};
            }
            doneCallback.call(this, data, callback);
        }).
        fail(function (jqXHR) {
            failCallback.call(this, jqXHR, '根据省份ID获取城市列表失败！');
        });
    }

    /**
     * 根据省份ID获取城市列表
     * @param provinceId
     * @param callback
     */
    function getCityListByProvinceId(provinceId, callback) {
        var params = {};

        if (!provinceId) {
            systemMessage('缺少省份ID！');
            return;
        }

        params.provinceId = provinceId;

        $.ajax($.extend({
            url: apiHost + '/hoss/sys/getAllCityListByProvinceId.do',
            data: params,
            beforeSend: function () {}
        }, jsonp)).
            done(function (data) {
                if (!$.isFunction(callback)) {
                    callback = function () {};
                }
                doneCallback.call(this, data, callback);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '根据省份ID获取城市列表失败！');
            });
    }
    /**
     * 根据大区ID获取城市列表
     * @param bigAreaId
     * @param callback
     */
    function getCityListByBigAreaId(bigAreaId, callback) {
        var params = {};

        if (!bigAreaId) {
            systemMessage('缺少大区ID！');
            return;
        }

        params.bigAreaId = bigAreaId;

        $.ajax($.extend({
            url: apiHost + '/hoss/sys/getAllCityListByBigAreaId.do',
            data: params,
            beforeSend: function () {}
        }, jsonp)).
        done(function (data) {
            if (!$.isFunction(callback)) {
                callback = function () {};
            }
            doneCallback.call(this, data, callback);
        }).
        fail(function (jqXHR) {
            failCallback.call(this, jqXHR, '根据大区ID获取城市列表失败！');
        });
    }

    /**
     * 根据城市ID获取所有地区列表
     * @param cityId
     * @param callback
     */
    function getAreaList(cityId, callback) {
        var params = {};

        if (!cityId) {
            systemMessage('缺少城市ID！');
            return;
        }

        params.cityId = cityId;

        $.ajax($.extend({
            url: apiHost + '/hoss/sys/getAreaByCityId.do',
            data: params,
            beforeSend: function () {}
        }, jsonp)).
        done(function (data) {
            if (!$.isFunction(callback)) {
                callback = function () {};
            }
            doneCallback.call(this, data, callback);
        }).
        fail(function (jqXHR) {
            failCallback.call(this, jqXHR, '根据城市ID获取所有地区列表失败！');
        });
    }



    /**
     * 大区 --> 市
     * @param $bigArea
     * @param $city
     */
    function bigAreaToCity($bigArea, $city) {
        $city.
            html(cityTplTit).
            prop('disabled', true);

        function bacBigAreaList(data) {
            $bigArea.html(
                bigAreaRender(data)
            );

            $bigArea.on('change', function () {
                var $context = $(this),
                    bigAreaId = $.trim($context.val());

                if (bigAreaId === '') {
                    $city.
                        html(cityTplTit).
                        prop('disabled', true);
                    return false;
                }

                getCityListByBigAreaId(bigAreaId, function (data) {
                    proxy.trigger('bacCityListByBigAreaId', data);
                });
            });
        }
        proxy.on('bacBigAreaList', bacBigAreaList);

        function bacCityListByBigAreaId(data) {
            var dataObj = data.data || {};

            if (!$.isArray(dataObj.content) || !dataObj.content.length) {
                $city.
                    html(cityTplTit).
                    prop('disabled', true);
                return false;
            }

            $city.
                html(cityRender(data)).
                prop('disabled', false);
        }
        proxy.on('bacCityListByBigAreaId', bacCityListByBigAreaId);

        getBigAreaList(function (data) {
            proxy.trigger('bacBigAreaList', data);
        });
    }


    /**
     * 大区 --> 省 --> 市
     * @param $bigArea
     * @param $province
     * @param $city
     */
    function bigAreaToProvinceToCity($bigArea, $province, $city) {
        $province.
            html(provinceTplTit).
            prop('disabled', true);
        $city.html(cityTplTit).
            prop('disabled', true);

        function bapcBigAreaList(data) {
            $bigArea.html(
                bigAreaRender(data)
            );

            $bigArea.on('change', function () {
                var $context = $(this),
                    bigAreaId = $.trim($context.val());

                if (bigAreaId === '') {
                    $province.
                        html(provinceTplTit).
                        prop('disabled', true);
                    $city.html(cityTplTit).
                        prop('disabled', true);
                    return false;
                }

                getProvinceList(bigAreaId, function (data) {
                    proxy.trigger('bapcProvinceList', data);
                });
            });
        }
        proxy.on('bapcBigAreaList', bapcBigAreaList);

        function bapcProvinceList(data) {
            var dataObj = data.data || {};

            if (!$.isArray(dataObj.content) || !dataObj.content.length) {
                $province.
                    html(provinceTplTit).
                    prop('disabled', true);
                return false;
            }

            $city.html(cityTplTit).
                prop('disabled', true);

            $province.
                html(provinceRender(data)).
                prop('disabled', false);

            $province.on('change', function () {
                var $context = $(this),
                    provinceId = $.trim($context.val());

                if (provinceId === '') {
                    $city.html(cityTplTit).
                        prop('disabled', true);
                    return false;
                }

                getCityListByProvinceId(provinceId, function (data) {
                    proxy.trigger('bapcCityList', data);
                });
            });
        }
        proxy.on('bapcProvinceList', bapcProvinceList);

        function bapcCityList(data) {
            var dataObj = data.data || {};

            if (!$.isArray(dataObj.content) || !dataObj.content.length) {
                $city.
                    html(cityTplTit).
                    prop('disabled', true);
                return false;
            }

            $city.
                html(cityRender(data)).
                prop('disabled', false);
        }
        proxy.on('bapcCityList', bapcCityList);

        getBigAreaList(function (data) {
            proxy.trigger('bapcBigAreaList', data);
        });
    }



    /**
     * 根据省份id查询，合作城市，在每个城市下面增加一个全国的字段，value 值 “-1”，后台处理
     * 省 --> 市
     * @param $province
     * @param $city
     */
    function provinceToCityAddCountry($province, $city, pId, cId) {
        // 默认选中，初始化时
        var only = Math.random(),
            PC_CITY_LIST_EVENT = 'pcCityList' + only;
        $province.one('change.selected', function (e, id) {
            setSelectedById($province, id);
            $province.trigger('change');
        });
        $city.one('change.selected', function (e, id) {
            setSelectedById($city, id);
        });

        $city.
            html(cityTplTit).
            prop('disabled', true);

        function pcProvinceList(data) {
            $province.html(
                provinceRender(data)
            );

            $province.on('change', function () {
                var $context = $(this),
                    provinceId = $.trim($context.val());

                if (provinceId === '') {
                    $city.
                        html(cityTplTit).
                        prop('disabled', true);
                    return false;
                }

                getCityListByProvinceIdAddCountry(provinceId, function (data) {
                    proxy.trigger(PC_CITY_LIST_EVENT, data);
                });
            });

            $province.trigger('change.selected', pId);
        }
        proxy.on('pcProvinceList', pcProvinceList);

        function pcCityList(data) {
            var dataObj = data.data || {};

            if (!$.isArray(dataObj.content) || !dataObj.content.length) {
                $city.
                    html(cityTplTit).
                    prop('disabled', true);
                return false;
            }

            $city.
                html(cityRender(data)).
                prop('disabled', false);

            $city.trigger('change.selected', cId);
        }
        proxy.on(PC_CITY_LIST_EVENT, pcCityList);

        getProvinceList(null, function (data) {
            proxy.trigger('pcProvinceList', data);
        });
    }
    /**
     * 省 --> 市
     * @param $province
     * @param $city
     */
    function provinceToCity($province, $city, pId, cId) {
        // 默认选中，初始化时
        var only = Math.random(),
            PC_CITY_LIST_EVENT = 'pcCityList' + only;
        $province.one('change.selected', function (e, id) {
            setSelectedById($province, id);
            $province.trigger('change');
        });
        $city.one('change.selected', function (e, id) {
            setSelectedById($city, id);
        });

        $city.
            html(cityTplTit).
            prop('disabled', true);

        function pcProvinceList(data) {
            $province.html(
                provinceRender(data)
            );

            $province.on('change', function () {
                var $context = $(this),
                    provinceId = $.trim($context.val());

                if (provinceId === '') {
                    $city.
                        html(cityTplTit).
                        prop('disabled', true);
                    return false;
                }

                getCityListByProvinceId(provinceId, function (data) {
                    proxy.trigger(PC_CITY_LIST_EVENT, data);
                });
            });

            $province.trigger('change.selected', pId);
        }
        proxy.on('pcProvinceList', pcProvinceList);

        function pcCityList(data) {
            var dataObj = data.data || {};

            if (!$.isArray(dataObj.content) || !dataObj.content.length) {
                $city.
                    html(cityTplTit).
                    prop('disabled', true);
                return false;
            }

            $city.
                html(cityRender(data)).
                prop('disabled', false);

            $city.trigger('change.selected', cId);
        }
        proxy.on(PC_CITY_LIST_EVENT, pcCityList);

        getProvinceList(null, function (data) {
            proxy.trigger('pcProvinceList', data);
        });
    }


    /**
     * 省 --> 市  城市无过滤
     * @param $province
     * @param $city
     */
    function provinceToCityNoMatch($province, $city, pId, cId) {
        // 默认选中，初始化时
        var only = Math.random(),
            PC_CITY_LIST_EVENT = 'pcCityList' + only;
        $province.one('change.selected', function (e, id) {
            setSelectedById($province, id);
            $province.trigger('change');
        });
        $city.one('change.selected', function (e, id) {
            setSelectedById($city, id);
        });

        $city.
            html(cityTplTit).
            prop('disabled', true);

        function pcProvinceList(data) {
            $province.html(
                provinceRender(data)
            );

            $province.on('change', function () {
                var $context = $(this),
                    provinceId = $.trim($context.val());

                if (provinceId === '') {
                    $city.
                        html(cityTplTit).
                        prop('disabled', true);
                    return false;
                }

                getCityListByProvinceIdNoMatch(provinceId, function (data) {
                    proxy.trigger(PC_CITY_LIST_EVENT, data);
                });
            });

            $province.trigger('change.selected', pId);
        }
        proxy.on('pcProvinceList', pcProvinceList);

        function pcCityList(data) {
            var dataObj = data.data || {};

            if (!$.isArray(dataObj.content) || !dataObj.content.length) {
                $city.
                    html(cityTplTit).
                    prop('disabled', true);
                return false;
            }

            $city.
                html(cityRender(data)).
                prop('disabled', false);

            $city.trigger('change.selected', cId);
        }
        proxy.on(PC_CITY_LIST_EVENT, pcCityList);

        getProvinceListNoMatch(null, function (data) {
            proxy.trigger('pcProvinceList', data);
        });
    }

    /**
     * 获取所有省份列表 无过滤
     * @param bigAreaId
     * @param callback
     */
    function getProvinceListNoMatch(bigAreaId, callback) {
        // 默认获取所有省份
        var params = {};

        // 仅获取大区下面的省份
        if (bigAreaId) {
            params.bigAreaId = bigAreaId;
        }

        $.ajax($.extend({
            url: apiHost + '/hoss/sys/getAllProvinceList.do',
            data: params,
            beforeSend: function () {}
        }, jsonp)).
            done(function (data) {
                if (!$.isFunction(callback)) {
                    callback = function () {};
                }
                doneCallback.call(this, data, callback);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取所有省份列表失败！');
            });
    }

    /**
     * 根据省份ID获取城市列表 无过滤
     * @param provinceId
     * @param callback
     */
    function getCityListByProvinceIdNoMatch(provinceId, callback) {
        var params = {};

        if (!provinceId) {
            systemMessage('缺少省份ID！');
            return;
        }

        params.provinceId = provinceId;

        $.ajax($.extend({
            url: apiHost + '/hoss/sys/getAllCityByProvinceId.do',
            data: params,
            beforeSend: function () {}
        }, jsonp)).
            done(function (data) {
                if (!$.isFunction(callback)) {
                    callback = function () {};
                }
                doneCallback.call(this, data, callback);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '根据省份ID获取城市列表失败！');
            });
    }

    /**
     * 省 --> 市 --> 区
     * @param $province
     * @param $city
     * @param $area
     */
    function provinceToCityToArea($province, $city, $area) {
        $city.
            html(cityTplTit).
            prop('disabled', true);
        $area.html(areaTplTit).
            prop('disabled', true);

        function pcaProvinceList(data) {
            $province.html(
                provinceRender(data)
            );

            $province.on('change', function () {
                var $context = $(this),
                    provinceId = $.trim($context.val());

                if (provinceId === '') {
                    $city.
                        html(cityTplTit).
                        prop('disabled', true);
                    $area.html(areaTplTit).
                        prop('disabled', true);
                    return false;
                }

                getCityListByProvinceId(provinceId, function (data) {
                    proxy.trigger('pcaCityList', data);
                });
            });
        }
        proxy.on('pcaProvinceList', pcaProvinceList);

        function pcaCityList(data) {
            var dataObj = data.data || {};

            if (!$.isArray(dataObj.content) || !dataObj.content.length) {
                $city.
                    html(cityTplTit).
                    prop('disabled', true);
                return false;
            }

            $area.html(areaTplTit).
                prop('disabled', true);

            $city.
                html(cityRender(data)).
                prop('disabled', false);

            $city.on('change', function () {
                var $context = $(this),
                    cityId = $.trim($context.val());

                if (cityId === '') {
                    $area.html(areaTplTit).
                        prop('disabled', true);
                    return false;
                }

                getAreaList(cityId, function (data) {
                    proxy.trigger('pcaAreaList', data);
                });
            });
        }
        proxy.on('pcaCityList', pcaCityList);

        function pcaAreaList(data) {
            var dataObj = data.data || {};

            if (!$.isArray(dataObj.content) || !dataObj.content.length) {
                $area.
                    html(areaTplTit).
                    prop('disabled', true);
                return false;
            }

            $area.
                html(areaRender(data)).
                prop('disabled', false);
        }
        proxy.on('pcaAreaList', pcaAreaList);

        getProvinceList(null, function (data) {
            proxy.trigger('pcaProvinceList', data);
        });
    }

    /**
     * 根据 option 的值 id ，设置该 option 为选中
     * @param $select
     * @param id
     */
    function setSelectedById($select, id) {
        try {
            $select.find('[value='+ id +']').prop('selected', true);
        } catch (e) {}
    }

    /**
     * 根据用户所在地获取城市列表
     * @param callback
     */
    function getCityListByUser(callback){

        $.ajax($.extend({
            url: apiHost + '/hoss/sys/getMyCityList.do',
            data: {},
            beforeSend: function () {}
        }, jsonp)).
            done(function (data) {
                if (!$.isFunction(callback)) {
                    callback = function () {};
                }
                doneCallback.call(this, data, callback);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '根据用户所在地获取城市列表失败！');
            });
    }

    /**
     * 根据城市 ID，获取板块列表
     */
    function getPlateListByCityId(cityId, callback){
        $.ajax($.extend({
            url: apiHost + '/hoss/sys/getPlateListByCityId.do',
            data: {cityId:cityId},
            beforeSend: function () {}
        }, jsonp)).
            done(function (data) {
                if (!$.isFunction(callback)) {
                    callback = function () {};
                }
                doneCallback.call(this, data, callback);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '根据城市获取板块列表失败！');
            });
    }


    return {
        bigAreaToCity: bigAreaToCity,
        bigAreaToProvinceToCity: bigAreaToProvinceToCity,
        provinceToCityAddCountry: provinceToCityAddCountry,
        provinceToCity: provinceToCity,
        provinceToCityNoMatch: provinceToCityNoMatch,
        provinceToCityToArea: provinceToCityToArea,
        getCityListByUser:getCityListByUser,
        getAreaList:getAreaList,
        getPlateListByCityId:getPlateListByCityId
    };

});