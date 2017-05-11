/*
 * 读取接口数据
 * v:1.02
 * */

define(function () {

    'use strict';

    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        navigation = require('navigation'),
        xhr = require('xhr'),
        jsonp = xhr.jsonp,
        jsonpost = xhr.jsonpost,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail,
        template = require('template'),
        pagination = require('pagination'),
        systemMessage = require('system-message'),
        $ = require('jquery'),
        validate = require('script/validate'),
        datepicker = require('datepicker');

    var Loaddata = function (obj) {
        this.options = this.init(obj);
        this.ajax();
    };

    Loaddata.prototype = {

        constructor:Loaddata,

        init: function (obj) {
            var options =  $.extend({
                port: null, //接口地址:字符串
                params: null, //接口参数：jQuery form对象 或 对象
                beforeFn: null, //调用接口之前函数：函数
                doneFn: null, //接口调用成功后函数：函数
                templateFrom: null, //调用模板ID：字符串
                templateTo: null, //插入模板对象：jQuery对象
                page: {}, //分页对象：对象，都是jQuery对象。pageObj:分页载体，pageForm：列表表单，pageSize：<input name=size>,pageNum:<input name=page>
                debug: false, //显示数据
                title: '', //提示信息
                method: jsonp //请求方式 GET：jsonp ，POST：jsonpost。默认 GET
            }, obj);
            return {
                port: options.port,
                params: (options.params instanceof $) ? clearEmptyValue(options.params) : options.params,
                beforeFn: options.beforeFn,
                doneFn: options.doneFn,
                templateFrom: options.templateFrom,
                templateTo: options.templateTo,
                page: options.page,
                pageObj: options.page.pageObj,
                pageForm: options.page.pageForm,
                pageSize: options.page.pageSize,
                pageNum: options.page.pageNum,
                pageClick: options.page.pageClick,
                debug: options.debug,
                title: options.title,
                method: options.method
            };
        },

        ajax: function () {
            var o = this.options,
                that = this;
            $.ajax($.extend({
                url : apiHost + o.port,
                data : o.params,
                beforeSend : that.before()
            }, o.method)).
                done(function (data) {
                    that.helper();
                    function useful(data) {
                        that.debug(data);
                        that.done();
                        that.template(data);
                        that.page(data);
                    }
                    function useless(data) {
                        systemMessage({type: 'info', title: '提示：', detail: data.detail || '获取列表数据失败！'});
                    }
                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    that.fail(jqXHR);
                }).
                always(function () {
                    that.always();
                });
        },

        before: function () {
            if ($.isFunction(this.options.beforeFn)) {
                this.options.beforeFn();
            }
        },

        done: function () {
            if ($.isFunction(this.options.doneFn)) {
                this.options.doneFn();
            }
        },

        helper: function () {
            template.helper('jquery_map', $.map);
            template.helper('map_filter', function(obj){
                return obj.name;
            });
        },

        page: function (data) {
            var o = this.options;
            if (o.pageObj.size() === 1 && o.pageForm.size() === 1 && o.pageSize.size() === 1 && o.pageNum.size() === 1) {
                o.pageObj.pagination({
                    $form: o.pageForm,
                    totalSize: (data.data || {}).totalElements,
                    pageSize: parseInt(o.pageSize.val(), 10),
                    visiblePages: 5,
                    info: true,
                    paginationInfoClass: 'pagination-count pull-left',
                    paginationClass: 'pagination pull-right',
                    onPageClick: function (event, index) {
                        o.pageNum.val(index - 1);
                        if ($.isFunction(o.pageClick)) {
                            o.pageClick();
                        }
                    }
                });
            }
        },

        template: function (data) {
            if (this.options.templateFrom && this.options.templateTo.size() > 0) {
                this.options.templateTo.html(template(this.options.templateFrom, data));
            }
        },

        fail: function (jqXHR) {
            failCallback.call(this, jqXHR, '获取列表数据失败！');
        },

        always: function () {

        },

        debug: function (data) {
            var o = this.options;
            if (o.debug) {
                console.log('提示信息：' + o.title);
                console.log('请求接口：' + apiHost + o.port);
                console.log('接口参数：' + o.params);
                console.log('请求方式：' + o.method.type);
                console.log('接口返回：');
                console.log(data);
            }
        }
    };

    var message = function (m) {
        systemMessage({type: 'info', title: '提示：', detail: m, wait: 1000, autoHide: true});
    };

    return {
        loaddata: function (obj) {
            return new Loaddata(obj);
        },
        m: message
    }
});