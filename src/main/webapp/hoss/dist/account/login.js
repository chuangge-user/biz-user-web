define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost,
        location = hoss.location,
        sessionStorage = hoss.sessionStorage,
        router = hoss.router;

    var $ = require('jquery');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        doneCallback = xhr.done;

    var systemMessage = require('system-message');

//    sessionStorage.clear();

    function domReady() {
        var regAccount = /^.{1,}$/,
            regPassword = /^.{6,}$/,
            regCaptcha = /^.{5}$/,

            $loginForm = $('#loginForm'),
            $username = $('#username'),
            $password = $('#password'),
            $captcha = $('#captcha'),
            $updateCaptcha = $('#updateCaptcha'),
            $captchaImg = $updateCaptcha.find('img'),
            $submit = $loginForm.find('[type=submit]'),
            $errorMsg = $('.error-message'),

            invisible = {visibility: 'hidden'},
            visible = {visibility: 'visible'},

            showMsg = function (msg) {
                $errorMsg.html(msg).css(visible);
            },
            delEmptyValue = function (obj) {
                $.each(obj || {}, function (key, val) {
                    if (val === null ||
                        ($.isArray(val) && !val.length)) {
                        delete obj[key];
                    } else if ($.isArray(val) ||
                        $.isPlainObject(val)) {
                        delEmptyValue(val);
                    }
                });
            };



        // 验证码
        $captchaImg.attr('src', apiHost + '/sys/v2/getVerCode.do').css(visible);

        $updateCaptcha.on('click', function () {
            $captchaImg.attr('src',
                    $captchaImg.
                        attr('src').
                        split('?').
                        shift() + '?' + $.now()
            );
            $captcha.val('').addClass('error').focus();
            return false;
        });



        // 修改后正确后删除提醒
        $username.on('input', function(){
            if (regAccount.test($.trim($username.val()))) {
                $username.removeClass('error').focus();
                $errorMsg.css(invisible);
            }
        });

        $password.on('input', function(){
            if (regPassword.test($.trim($password.val()))) {
                $password.removeClass('error').focus();
                $errorMsg.css(invisible);
            }
        });

        $captcha.on('input', function(){
            if (regCaptcha.test($.trim($captcha.val()))) {
                $captcha.removeClass('error').focus();
                $errorMsg.css(invisible);
            }
        });

        function getCookie(name){
            var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
            if(arr=document.cookie.match(reg)){
                return arr[2];
            }else{
                return null;
            }
        }

        function captchaShow(){
            var captchaTime = getCookie('captchaTime');
            if(captchaTime >= 3){
                $captcha.parent().show();
            }
        }

        //判断验证码是否显示
        captchaShow();



        // 提交前验证
        $loginForm.submit(function (e) {
            if (e) e.preventDefault();

            if ($submit.hasClass('disabled')) return false;

            if (!regAccount.test($.trim($username.val()))) {
                showMsg('请输入您的账号');
                $username.addClass('error').focus();
                return false;
            }

            if (!regPassword.test($.trim($password.val()))) {
                showMsg('密码不能小于六位');
                $password.addClass('error').focus();
                return false;
            }

            /*if (!regCaptcha.test($.trim($captcha.val()))) {
                showMsg('验证码不能小于五位');
                $captcha.addClass('error').focus();
                return false;
            }*/

            $.ajax($.extend({
                url: apiHost + '/LoginSubmit.do',
                data: $(this).serialize(),
                beforeSend: function () {
                    $submit.val('登录中...').addClass('disabled');
                }
            }, jsonp))
            .done(function (data) {
                function useful(data) {
                    var results = data.data || {};

                    if (!results.userName) {
                        systemMessage('登录后数据，缺少账号！');
                        return;
                    }

                    if (!results.name) {
                        systemMessage('登录后数据，缺少用户名！');
                        return;
                    }

                    if (!results.permissionsList || !results.permissionsList.length) {
                        systemMessage('登录后数据，缺少可操作的菜单！');
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

                        $.each(group || {}, function (key, val) {
                            if (val === null) {
                                delete group[key];
                            }
                        });
                    });

                    delEmptyValue(results);

                    sessionStorage.setItem('sessionData', JSON.stringify(results));

                    location.href = router();
                }

                function useless(data) {

                    //判断验证码是否显示
                    captchaShow();

                    showMsg(data.detail);
                }

                doneCallback.call(this, data, useful, useless);
            })
            .fail(function () {
                showMsg('网络繁忙，请稍后重试！');
            })
            .always(function () {
                $updateCaptcha.click();
                $submit.val('登  录').removeClass('disabled');
            });

            return false;
        });
    }



    $(document).ready(domReady);
});