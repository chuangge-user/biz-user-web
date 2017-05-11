define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        sessionStorage = sessionStorage;

    var $ = require('jquery');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        isNotLogin = xhr.isNotLogin,
        doneCallback = xhr.done,
        failCallback = xhr.fail;



    function domReady() {
        // 退出
        var $logout = $('#logout');
        $logout.on('click', function (event) {
            if (event) {
                event.preventDefault();
            }

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/v2/Logout.do'
            }, jsonp)).
            done(function (data) {
                data.status = isNotLogin;
                doneCallback.call(this, data);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '退出失败');
            }).
            always(function () {
                sessionStorage.clear();
            });
        });



        // 占位符
        if (!('placeholder' in document.createElement('input'))) {
            require('placeholder');
        }
    }



    $(document).ready(domReady);
});