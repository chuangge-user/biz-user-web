/*
 * 读取接口数据
 * */

define(function () {
    'use strict';
    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail,
        template = require('template'),
        pagination = require('pagination'),
        systemMessage = require('system-message'),
        $ = require('jquery'),
        loaddata,
        message;

    loaddata = function (obj) {
        var options = $.extend({
                port: null, //接口地址:字符串
                params: null, //接口参数：jQuery form对象 或 对象
                beforeFn: null, //调用接口之前函数：函数
                doneFn: null, //接口调用成功后函数：函数
                templateFrom: null, //调用模板ID：字符串
                templateTo: null, //插入模板对象：jQuery对象
                page: {}, //分页对象：对象，都是jQuery对象。pageObj:分页载体，pageForm：列表表单，pageSize：<input name=size>,pageNum:<input name=page>
                debug: false, //显示数据
                title: '' //提示信息
            }, obj),
            port = options.port,
            params = (options.params instanceof $) ? clearEmptyValue(options.params) : options.params,
            beforeFn = options.beforeFn,
            doneFn = options.doneFn,
            templateFrom = options.templateFrom,
            templateTo = options.templateTo,
            page = options.page,
            pageObj = page.pageObj,
            pageForm = page.pageForm,
            pageSize = page.pageSize,
            pageNum = page.pageNum,
            pageClick = page.pageClick,
            debug = options.debug,
            title = options.title;
        $.ajax($.extend({
            url : apiHost + port,
            data : params,
            beforeSend : function () {
                if (debug) {
                    console.log('提示信息：' + title);
                    console.log('请求接口：' + port);
                    console.log('接口参数：' + params);
                    console.log('请求地址：' + apiHost + port + '?' + params);
                    console.profile('性能:');
                }
                if ($.isFunction(beforeFn)) {
                    beforeFn();
                }
            }
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    if (debug) {
                        console.log('接口返回：');
                        console.log(data);
                        console.profileEnd();
                    }
                    if (templateFrom && templateTo.size() > 0) {
                        templateTo.html(template(templateFrom, data.data));
                    }
                    if ($.isFunction(doneFn)) {
                        doneFn(data);
                    }
                    if (pageObj && pageForm && pageSize && pageNum) {
                        pageObj.pagination({
                            totalSize: (data.data || {}).totalElements,
                            pageSize: parseInt(pageSize.val(), 10),
                            visiblePages: 5,
                            info: true,
                            paginationInfoClass: 'pagination-count pull-left',
                            paginationClass: 'pagination pull-right',
                            onPageClick: function (event, index) {
                                pageNum.val(index - 1);
                                if ($.isFunction(pageClick)) {
                                    pageClick();
                                } else {
                                    pageForm.trigger('submit');
                                }
                            }
                        });
                    }
                }
                function useless(data) {
                    systemMessage({type: 'info', title: '提示：', detail: data.detail || '获取列表数据失败！'});
                }
                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取列表数据失败！');
            }).
            always(function () {
            });
    };
    message = function (m) {
        systemMessage({type: 'info', title: '提示：', detail: m, wait: 1000, autoHide: true});
    };
    return {
        loaddata: loaddata,
        message: message
    };
});