define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;

    var $ = require('jquery');

    var navigation = require('navigation');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template'),
        _apiHost_ = template.helper('_apiHost_', apiHost);

    var pagination = require('pagination'),
        modal = require('bootstrap/modal'),
        confirmation = require('bootstrap/confirmation');

    var systemMessage = require('system-message');

    var accounting = require('accounting');



    var templateEnabled = false;
    var data = null;


    loadTemplate(webHost + '/dist/script/quality-control/done-examine-util.template', function(responseText){
        $('<div></div>').html(responseText).insertAfter($('script:last'));
        templateEnabled = true;
    });

    /**
     * 初始化成交详情
     * @parameter e Event
     * @parameter $table 目标 table 标签
     * @parameter callback 获取数据后的回调
     */
    function initDetail(e, $table, callback) {

        var $that = $(e.currentTarget),
            id = $that.attr('data-id');

        if ($that.hasClass('disabled')) {
            return false;
        }

        if (templateEnabled) {
            getData();
        } else { // 没加载好模板，什么都不做
            return false;
        }

        function getData(){
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/pk/getBrokerageProExamineInfo.do',
                data: {
                    id: id
                },
                beforeSend: function () {
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        var dataObj = data || {};

                        var templateId = !$.isEmptyObject(dataObj) ?
                            'auditDetailInfoTemplate' : 'messageTemplate';

                        // 显示数据
                        $table.find('tbody').html(
                            template(templateId, dataObj)
                        );

                        callback();

                        // 调整流程线高度。、妈蛋
                        $('.audit-table-flow-line').height($table.height() - 250);
                    }

                    function useless(data) {
                        systemMessage(data.detail || '获取查看数据失败！');
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取查看数据失败！');
                })
        }
    }

    function loadTemplate(url, callback){
        $.ajax({
            url: url, success: function(responeText){
                callback(responeText);
            }
        });
    }

    return {
        initDetail:initDetail
    }

});

