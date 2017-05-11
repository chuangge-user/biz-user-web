define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        location = hoss.location,
        sessionStorage = hoss.sessionStorage,
        router = hoss.router;

    var $ = require('jquery');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        doneCallback = xhr.done;

    var systemMessage = require('system-message');

    var getQueryString = require('get-query-string'),
        empId = getQueryString('empId'),
        sign = getQueryString('_sign');


    systemMessage({
        autoHide: false,
        type: 'done',
        title: '提示：',
        detail: '系统身份确认中...'
    });


    function domReady() {
        if (!empId) {
            systemMessage({
                autoHide: false,
                type: 'alert',
                title: '提示：',
                detail: '缺少员工号信息！'
            });
            return;
        }

        if (!sign) {
            systemMessage({
                autoHide: false,
                type: 'alert',
                title: '提示：',
                detail: '缺少签名信息！'
            });
            return;
        }

        $.ajax($.extend({
//            url: apiHost + '/hoss/sys/v2/Login.do',
            url: 'http://hoss.haowu.com/hoss-web' + '/hoss/sys/v2/Login.do',
            data: {
                empId: empId,
                _sign: sign
            },
            beforeSend: function () {
                systemMessage({
                    autoHide: false,
                    type: 'done',
                    title: '提示：',
                    detail: '系统身份确认中...'
                });
            }
        }, jsonp))
        .done(function (data) {
            function useful(data) {
                var results = data.data || {};

                if (!results.userName) {
                    systemMessage({
                        autoHide: false,
                        type: 'alert',
                        detail: '登录后数据，缺少账号！'
                    });
                    return;
                }

                if (!results.name) {
                    systemMessage({
                        autoHide: false,
                        type: 'alert',
                        detail: '登录后数据，缺少用户名！'
                    });
                    return;
                }

                if (!results.permissionsList || !results.permissionsList.length) {
                    systemMessage({
                        autoHide: false,
                        type: 'alert',
                        detail: '对不起,你暂时没有权限操作,请联系相关管理员！'
                    });
                    return;
                }

                // 将用户名、账号、菜单数据存在 sessionStorage
                // 以便后面的页面使用
                $.each(results.permissionsList || [], function (i, group) {

                    if (group.chlidren &&
                        group.chlidren.length &&
                        group.chlidren[0].code) {
                        group.code = group.chlidren[0].code;
                    }

                });
                sessionStorage.setItem('sessionData', JSON.stringify(results));

                location.href = router();
            }

            function useless(data) {
                systemMessage({
                    autoHide: false,
                    type: 'info',
                    title: '提示：',
                    detail: data.detail || '网络不给力，请稍后重试！'
                });
            }

            doneCallback.call(this, data, useful, useless);
        })
        .fail(function () {
            systemMessage({
                autoHide: false,
                type: 'alert',
                detail: '网络不给力，请稍后重试！'
            });
        })
        .always(function () {});
    }

    $(document).ready(domReady);
});