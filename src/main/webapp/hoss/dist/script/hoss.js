define(function (require) {

    var $ = require('jquery');
    var getQueryString = require('get-query-string');

    var global = (function () {
            return this;
        })(),

        location = global.location,
        sessionStorage = global.localStorage,

        //apiHost = global.location.protocol + '//' + global.location.host,
        //webHost = global.require.baseUrl.slice(0, -1),
        apiHost = global.require.baseUrl.slice(0, -6),
        webHost = global.require.baseUrl,

        loginPageUrl = webHost + '/app/account/login.html',
        huhooLoginPageUrl = webHost + '/app/account/huhoo-to-hoss.html',
        currentPageUrl = location.href.split('?').shift(),
        
        redirect = getQueryString('redirect'),

        sessionData = JSON.parse(sessionStorage.getItem('sessionData')) || {},
        account = sessionData.userName,
        username = sessionData.name,
        hossMenu = sessionData.permissionsList;

    currentPageUrl = currentPageUrl.split('#').shift();

//    // 未登录，回登录页
//    if (!account &&
//        currentPageUrl != loginPageUrl &&
//        currentPageUrl != huhooLoginPageUrl) {
//        sessionStorage.clear();
//        location.href = loginPageUrl;
//    }

    // 在登录页，已登录
    // 根据已登录的角色转走
//    if (account &&
//        currentPageUrl === loginPageUrl) {
//        location.href = router(redirect);
//    }

    /**
     * 路由
     * 返回一个菜单中第一个出现的URL地址。
     * 没有获到到URL时，提示：没有对应的权限，并返回登录页。
     * @returns {String}
     */
    function router(url) {
        sessionData = JSON.parse(sessionStorage.getItem('sessionData')) || {};
        account = sessionData.userName;
        username = sessionData.name;
        hossMenu = sessionData.permissionsList;

    	if (sessionData.homePageUrl){
    		return sessionData.homePageUrl;
    	}
    	
        var url = '';

        $.each(hossMenu || [], function (i, n) {
            if (n.code) {
                url = n.code;
                sessionStorage.setItem('navid', n.id);
                return false;
            }
            $.each(n.chlidren || [], function (ci, cn) {
                if (cn.code) {
                    url = cn.code;
                    sessionStorage.setItem('navid', n.id);
                    return false;
                }
            });
        });

        return webHost + url;
    }


    var Spinner = require('script/spin'),
        spinner = new Spinner({
            length: 18,
            width: 5,
            radius: 8,
            color: '#666'
        }),
        $spinnerBg = $('<div id="spinner" style="display: none; position: fixed; top: 0; right: 0; z-index: 2; width: 100%; height: 100%; opacity: .3; background: #000;"></div>'),
        $body = $('body'),
        $container = $('#container');

    $body.append($spinnerBg);
    $( document ).ajaxStart(function() {
        var $input = $('input:focus'),
            $select = $('select:focus');

        if (currentPageUrl === loginPageUrl || currentPageUrl.indexOf('do-project.html')>-1||
            $input.length ||
            $select.length) {
            return;
        }

        $spinnerBg.show();
        spinner.spin(
            $container.get(0) ||
            $body.get(0)
        );
    });
    $( document ).ajaxStop(function() {
        $spinnerBg.hide();
        spinner.stop();
    });

    $( window ).on('error', function (e){
        $spinnerBg.hide();
        spinner.stop();
    });


    return {
        global: global,

        location: location,
        sessionStorage: sessionStorage,

        apiHost: apiHost,
        webHost: webHost,

        loginPageUrl: loginPageUrl,
        currentPageUrl: currentPageUrl,

        account: account,
        username: username,
        hossMenu: hossMenu,

        router: router
    };
});