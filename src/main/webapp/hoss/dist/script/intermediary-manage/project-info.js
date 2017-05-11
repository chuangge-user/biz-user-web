
/**
 * 项目详情
 */
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
    var modal = require('bootstrap/modal');

    var systemMessage = require('system-message');
    var dateStr = require('date-extend');

    var getQueryString = require('script/get-query-string');
    var projectId = getQueryString('projectId');



    function domReady() {

//        var goback=$('.goback');//返回上一页
//        goback.click(function(){
//            window.history.back();
//        });

        var getProjectInfoCode = '/hoss/org/org_attache/getProjectInfo.do',
            getProjectInfoTemplate = 'getProjectInfoTemplate',
            messageTemplate = 'messageTemplate',
            $getProjectInfoResult = $('#getProjectInfoResult');


        // 专员列表和设置
        var $listSelect = $('#listSelect'),
            getAttacheListCode = '/hoss/org/org_manager/getAttacheList.do',
            setAttacheCode = '/hoss/org/org_manager/setAttache.do',
            $setAttacheBtn = $('#setAttache'),
            listTemplate = 'listTemplate';

        // 专员列表
        $.ajax($.extend({
            url: apiHost + getAttacheListCode,
            data: {
                projectId:projectId
            },
            beforeSend: function () {

            }
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    // 中介专员数据
                    $listSelect.html(
                        template(listTemplate, data)
                    );

                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取专员列表失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取专员列表失败！');
            }).
            always(function () {


            });




        // 项目详情
        function loadInfo(){
            $.ajax($.extend({
                url: apiHost + getProjectInfoCode,
                data: {
                    projectId:projectId
                },
                beforeSend: function () {

                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = dataObj ?
                                getProjectInfoTemplate :
                                messageTemplate;

                        repairData(data.data);

                        // 显示数据
                        $getProjectInfoResult.html(
                            template(templateId, data)
                        );

                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取列表数据失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取列表数据失败！');
                }).
                always(function () {
                });
        }
        loadInfo();


        // 补中介专员数据
        function repairData(data){

            if (!data) {
                return;
            }

            var allName = [];
            $.each(data.userOfProjectDtoList, function(index, item){
                allName.push(item.positionName);
            });

            // 没有中介专员补全
            if (allName.indexOf('中介专员') === -1) {
                data.userOfProjectDtoList.push({positionName:'中介专员', borker:true});
            }

        }

        // 指定专员
        $setAttacheBtn.click(function(){

            $.ajax($.extend({
                url: apiHost + setAttacheCode,
                data: {
                    projectId:projectId,
                    attacheId:$listSelect.val()
                },
                beforeSend: function () {

                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {

                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '指定专员成功！'
                        });

                        // 可能还需要其他操作
                        $('.close').click();
                        loadInfo();
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
        });

    }

    $(document).ready(domReady);

});
