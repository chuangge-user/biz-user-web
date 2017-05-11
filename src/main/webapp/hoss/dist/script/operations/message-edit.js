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

    var selectArea = require('script/operations/select-area');

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

                    $('#info').val(dataObj.sysInfo.content);

                    var publishObject = dataObj.sysInfo.publishObject; // 选中投放对象
                    $('.put-target').each(function(index, node){
                        var $node = $(node);
                        if (publishObject.indexOf($node.text()) != -1) {
                            $node.click();
                        }
                    });

                    var list = [];
                    $.each(dataObj.partnerCityVoList || [], function(i, obj){
                        list.push({
                            id:obj.cityId,
                            name:obj.cityName
                        });
                    });
                    selectArea.showCityList(list);

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


        // 编辑
        var $addForm = $('#addForm'),
            addCode = '/hoss/partnerOperate/changeSysInfo.do'

        $('#id').val(id);

        $addForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if (event) {
                event.preventDefault();
            }


            // 提交前的数据
            var publishObject = [];
            $('input[type=checkbox]:checked').map(function(index, node){
                publishObject.push($(node).val());
            });
            $('#publishObject').val(
                publishObject.join(',')
            );
            var cityIds = [];
            $('.selected-area input').each(function(index, node){
                cityIds.push($(node).attr('areaid'));
            });
            $('#cityIds').val(cityIds.join(','));

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + addCode,
                data: clearEmptyValue($context),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        location = document.referrer;
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
                    failCallback.call(this, jqXHR, '新增集结号失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        });
    }


    $(domReady);
});


