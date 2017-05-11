define(function (require) {
    var hoss = require('hoss'),
        global = hoss.global,
        currentPageUrl = hoss.currentPageUrl,
        webHost = hoss.webHost,
        apiHost = hoss.apiHost,
        sessionStorage = hoss.sessionStorage,
        account = hoss.account,
        username = hoss.username,
        hossMenu = hoss.hossMenu;

    var $ = require('jquery');
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');
    template.helper('_webHost_', webHost);

    var help = require('help');

    function getPageNavData(hossMenuData) {
        var baseUrl = global.require.baseUrl,
            // urlCode = currentPageUrl.slice(baseUrl.length - 1),
            urlCode = currentPageUrl.slice(baseUrl.length),
            isFirst = true,
            navId = Number(sessionStorage.getItem('navid')) || -1,
            subnavId = Number(sessionStorage.getItem('subid')) || -1,

            recursion = function (menuData) {
                var i = 0,
                    il = menuData.length,
                    item;

                if (!$.isArray(menuData)) {
                    if (console) {
                        console.error(
                            '模块：navigation.js\r\n' +
                            '详情：getPageNavData 的参数 menuData 类型不正确！'
                        );
                    }
                }

                for (; i < il; i += 1) {
                    item = menuData[i];

                    if (item.code === urlCode) {
                        if (isFirst) {
                            navId = item.id;
                        } else {
                            if (item.parentId !== navId && subnavId === -1) {
                                subnavId = item.parentId;
                            } else {
                                subnavId = Number(sessionStorage.getItem('subid')) || item.id;
                            }
                        }
                    }

                    if (item.chlidren) {
                        isFirst = false;
                        recursion(item.chlidren);
                    }
                }
            };

        recursion(hossMenuData);

        return {
            navId: navId,
            subnavId: subnavId,
            urlCode: urlCode
        };
    }

    function addBadgeByNav($nav) {
        $.ajax($.extend({
            url: apiHost + '/hoss/sys/messageAndTaskCount.do',
            beforeSend: function () {}
        }, jsonp)).
        done(function (data) {
            function useful(data) {
                var dataObj = data.data || {};

                $.each(dataObj, function (name, value) {
                    if ($.isNumeric(value) && value > 0) {
                        value = value > 99 ? '&middot;&middot;&middot;' : value;

                        $nav.
                            find('a[data-id=' + name + ']').
                            append('<sup class="badge">'+ value +'</sup>');
                    }
                });
            }

            function useless(data) {
                if (console) {
                    console.error(
                        data.detail ||
                        '获取消息待办个数失败！'
                    );
                }
            }

            doneCallback.call(this, data, useful, useless);
        }).
        fail(function (jqXHR) {
            failCallback.call(this, jqXHR, '获取消息待办个数失败！');
        });
    }



    function domReady() {
        var navData = getPageNavData(hossMenu);

        // 一级导航
        var navId = navData.navId,
            hasSubnav = navId !== -1,
            $nav = $('#nav'),
            navTemplate =  //  长度大于 9 有特殊处理
                '<% $each(hossMenu, function(nav, i){ %>' +
                '   <% if (i > 9 ) { %>' +
                '       <% return;%>' +
                '   <% } %>' +
                '<li><a href="<%= _webHost_ %><%= nav.code %>" data-id="<%= nav.id %>"><%= nav.name %></a></li>' +
                '<% }); %>' +
                    (hoss.hossMenu.length > 9 ?
                '<li class="menu-dx"  id="menuDown"><a><span class="glyphicon glyphicon-chevron-down"></span></a><ul><% $each(hossMenu, function(nav, i){ %>' +
                '   <% if (i > 9 ) { %>' +
                '       <li class=""><a class="btn btn-xs" href="<%= _webHost_ %><%= nav.code %>" data-id="<%= nav.id %>"><%= nav.name %></a></li>' +
                '   <% } %>' +
                '<% }); %></ul></li>':''),
            navRender = template.compile(navTemplate),
            navHtml = navRender(hoss);

        $nav.html(navHtml).fadeIn('fast');

        // 添加气泡提醒
        addBadgeByNav($nav);

        $nav.on('mousedown', 'a[data-id]', function () {
            sessionStorage.setItem('navid', $(this).attr('data-id'));
            sessionStorage.removeItem('subid');
        });


        $('#menuDown').hover(function(e){
            $('#menuDown').find('ul').toggle();
        });
//        <ul id="nav" class="nav nav-main">
//            <li class="active"><a href="">我的工作台</a></li>
//            <li><a href="">我的工作台<sup class="badge">&middot;&middot;&middot;</sup></a></li>
//            <li><a href="">我的工作台<sup class="badge">3</sup></a></li>
//        </ul>

        // 高亮一级导航
        $nav.
            find('a[data-id="'+ navId +'"]').first().
            parent('li').addClass('active');



        // 二级导航
        var $container = $('#container'),
            $sidebar = $('#sidebar'),
            $subnav = $('#subnav'),
            subnavId = navData.subnavId,
            subnavTemplate,
            subnavRender,
            subnavHtml = '';

        subnavTemplate =
            '<% $each(chlidren, function(subnav, i){ %>' +
            '<li><a href="<%= _webHost_ %><%= subnav.code %>" data-id="<%= subnav.id %>" data-pid="<%= subnav.parentId %>">' +
            '<i class="i-doc"></i>' +
            '<span class="nav-side-txt"><%= subnav.name %></span>' +
            '<i class="i-arrow"></i></a></li>' +
            '<% }); %>';

        subnavRender = template.compile(subnavTemplate);

        $.each(hossMenu || [], function (i, subnavData) {
            if (subnavData.id.toString() === navId.toString()) {
                subnavHtml = subnavRender(subnavData);
                return false;
            }
        });

        $subnav.html(subnavHtml);

        if (hasSubnav &&
            $subnav.find('a[data-id="'+ subnavId +'"]').length) {
            $sidebar.fadeIn('fast');

            sessionStorage.setItem('subid', subnavId);
            $subnav.on('mousedown', 'a[data-id]', function () {
                sessionStorage.setItem('subid', $(this).attr('data-id'));
            });
//        <ul id="subnav" class="nav nav-side">
//            <li class="active"><a href="#"><i class="i-hierarchy"></i><span class="nav-side-txt">项目概述</span><i class="i-arrow"></i></a></li>
//            <li><a href="#"><i class="i-doc"></i><span class="nav-side-txt">项目概述</span><i class="i-arrow"></i></a></li>
//        </ul>

            // 高亮二级导航
            $subnav.
                find('a[data-id="'+ subnavId +'"]').first().
                parent('li').addClass('active');

        } else {
            sessionStorage.removeItem('subid');
            $container.removeClass('show-sidebar');
            $sidebar.remove();
        }


        // 浮动导航栏
        var $header = $('header');
        $('<div class="header-height"></div>').insertBefore($header);



        // 帮助文档
        help.initHelp();


        // 用户信息
        var now = new Date(),
            week = ['日', '一', '二', '三', '四', '五', '六'],
            $accountInfo = $('#accountInfo'),
            $accountDay = $('#accountDay'),
            $accountWeek = $('#accountWeek'),
            $accountRole = $('#accountRole'),
            $accountName = $('#accountName');

        $accountDay.html(
            now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日'
        );
        $accountWeek.html(
            '星期' + week[now.getDay()]
        );
        $accountRole.html(account).hide();
        $accountName.html(username);

        $accountInfo.fadeIn('fast');


        $accountName.after("<a id='aUserPwd' href='javascript:;'>修改密码</a>");


        // 退出
        require('script/account/logout');
        // 问题反馈
        require('script/account/feedback');
        //修改密码
        require('script/account/userPwdUpdate');

        //权限校验
        require('script/authcheck');
    }



    $(document).ready(domReady);

});