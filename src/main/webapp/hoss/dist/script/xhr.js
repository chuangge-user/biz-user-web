define(function (require) {
    var hoss = require('hoss'),
        global = hoss.global,
        sessionStorage = hoss.sessionStorage,
        currentPageUrl = hoss.currentPageUrl,
        loginPageUrl = hoss.loginPageUrl,

        // data.status
        // '0'      失败--表示请求完成，但没有可用的数据
        // '1'      成功--表示请求完成，有可用的数据
        // '-99'    未登录--表示请求完成，但没有登录
        // '-101'    没有权限
        isFail = '0',
        isDone = '1',
        isNotLogin = '-99',
        isNotPemiss = '-101',
        notAllowedKeyWord = '-199',

        jsonpost = {
            type: 'POST',
            dataType: 'jsonp'
        },

        jsonp = {
            type: 'GET',
            dataType: 'jsonp'
        };

    var $ = require('jquery');

    var systemMessage = require('system-message');


    /**
     * 统一处理请求成功时接口返回的消息
     *    '-99'，未登录，转到登录页
     *    '1'，接口返回可用结果时，调用doneFn回调函数
     *    '0'，其它，调用failFn回调函数，并在控制台显示错误信息
     * @param {Object} data
     * @param {Function} doneFn 可选
     * @param {Function} failFn 可选
     */
    function done(data, doneFn, failFn) {
        if ($.isEmptyObject(data = data || {})) {
            fail.call(this, data, '返回的信息为空对象');
            return;
        }

        switch (data.status) {
            case isNotLogin:
                sessionStorage.clear();
                global.location.href = loginPageUrl;
                break;
            case isDone:
                $.isFunction(doneFn) && doneFn(data);
                break;
            // 无可用数据时，优选调用 failFn
            // 如果没有传 failFn 则调用 doneFn
            // 在无可用数据时，在控制台报错
            case isFail:
                if ($.isFunction(failFn)) {
                    failFn(data);
                } else {
                    if (currentPageUrl !== loginPageUrl) {
                        try {
                            $.isFunction(doneFn) && doneFn(data);
                        } catch (e) {}
                    }
                }
                fail.call(this, data);
                break;
            case isNotPemiss:
                systemMessage(data.detail);
                break;
            case notAllowedKeyWord:
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: data.detail
                });
                break;
            default:
                fail.call(this, data);
                break;
        }

    }

    /**
     * 统一处理请求失败与请求成功后不可用的错误消息
     * @param {Object} jqXHR
     * @param {String} errorMsg 可选
     */
    function fail(jqXHR, errorMsg) {
        var context = this,
            newline = '\n',
            indentation = Array(10).join(' '),
            property = [
                'message',
                'result',
                'statusText',
                'status',
                'detail',
                'url'
            ],
            errorInfo = [];

        if (errorMsg) {
            jqXHR[ property[0] ] = errorMsg;
            if (global.console) {
                global.console.error(errorMsg)
            }
        }

        $.each(property, function (i, n) {
            if (jqXHR[ n ] || context[ n ]) {
                errorInfo[errorInfo.length] =
                    newline + n + ' :' + newline +
                    indentation + (jqXHR[ n ] || context[ n ]);
            }
        });

        if (global.console) {
            global.console.error(errorInfo.join(''));
        }
    }

    function always() {
    }


    /**
     * 提交表单时，将无值的表单项过滤掉
     * @param $form $('#formId')
     * @returns {String}
     */
    function clearEmptyValue($form) {
        var dataArray = [];
        $.each($form.serializeArray(), function (i, n) {
            if (n.value !== '') {
                n.value = $.trim(n.value);
                dataArray.push(n);
            }
        });
        return $.param(dataArray);
    }


    return {
        isNotLogin: isNotLogin,
        jsonp: jsonp,
        jsonpost: jsonpost,

        done: done,
        fail: fail,
        always: always,

        clearEmptyValue: clearEmptyValue
    };


});