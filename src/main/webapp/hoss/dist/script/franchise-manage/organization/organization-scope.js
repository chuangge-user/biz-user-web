/**
 * 职务权限显示
 */
define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;
    var navigation = require('navigation');
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        doneCallback = xhr.done,
        failCallback = xhr.fail;
    var template = require('template');
    var systemMessage = require('system-message');
    template.helper('recursiveFn', function(obj){
        alert(obj);
    });
    function domReady() {
        var searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate',
            getAgentUserRoleListPort = '/hoss/sys/agent/getAgentUserRoleList.do',
            getPermissionListByRoleIdPort = '/hoss/sys/agent/getPermissionListByRoleId.do';
        //获取加盟商的角色列表
        loadData(getAgentUserRoleListPort,null,'getAgentUserRoleListTemplate',$('#getAgentUserRoleList'),function(){
            //根据角色ID获取该角色下所有权限
            $('.user-role').on('click',function(){
                var o = $(this),roleId= o.attr('roleId'),params = {roleId:roleId};
                loadData(getPermissionListByRoleIdPort,params,'getPermissionListByRoleIdTemplate',$('#getPermissionListByRoleId'),function(){
                    $('#select-name,#select-description').text(o.text());
                });
            }).eq(0).click();// 加载第一个节点数据
        });
        // 加载数据方法
        function loadData(code, params, successTemplate, $searchResultList, callback){
            $.ajax($.extend({
                url: apiHost + code,
                data: params
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = successTemplate;
                        if(successTemplate && $searchResultList){
                            $searchResultList.html(
                                template(templateId, data)
                            );
                        }
                        (!!callback)&&callback();
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
                })
        }
    }
    $(document).ready(domReady);
});