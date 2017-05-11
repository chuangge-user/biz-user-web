define(function(require, exports, module) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');
    template.helper('_fixHref_', function (str) {
        return String(str).replace(
            /(href=["'])(.+?)(["'])/ig,
                '$1'+ webHost +'$2$3'
        );
    });

    var accounting = require('accounting');
    template.helper('$Math', accounting);

    var $ = require('jquery');
    require('datepicker');

    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');
    var $modal = require('bootstrap/modal');
    var projectUtil = require("script/project/project-util");
    var systemMessage = require('system-message');

    $(function () {

        var $projectId = null;

        var $cityId = null;

        var $searchFormRemind = $('#searchFormRemind');

        projectUtil.bindingProjectAndCity('projectSelect', 'citySelect');

        var iconClass = {
            red : 'i-process-remind', //提醒 红色
            white : 'i-process-not-start', //未开始  白色
            orange  : 'i-process-done',  //完成 橙色
            darkGrey : 'i-process-not-pass' //未通过 深灰色
        }

        var proInfoList = projectUtil.appendProjectSelectUtil('project_bench_detail', function (proInfo) {
            $projectId = proInfo.id;
            $cityId = proInfo.cityId;
            initUrl();
            initProjectBench();
            qdrwShowIcon();
            qdydShowIcon();
            qdysShowIcon();
            findStatusColor();
            findChannelStatusColor();
        });


        initUrl();

        //获取佣金设置进度状态颜色
        function findStatusColor() {
            initzjColor("/hoss/bench/findStatusColor.do?projectId=" + $projectId, "liqu");
        }

        function findChannelStatusColor() {
            initzjColor("/hoss/bench/findChannelStatusColor.do?projectId=" + $projectId, 'channel');
        }

        /**
         * 初始化渠道、佣金图标颜色
         * @param url
         * @param type
         */
        function initzjColor(url, type) {
            $.ajax($.extend({
                url: apiHost + url,
                data: {
                    projectId: $projectId
                },
                beforeSend: function () {

                }
            }, jsonp))
                .done(function (data) {

                    function useful(data) {
                        if ('liqu' == type) {
                            $('.qd-liqu > i').attr("class", iconClass[data.data.split(":")[0] || 'orange']);
                        }
                        if ('channel' == type) {
                            $('.qd-manager > i').attr("class", iconClass[data.data.split(":")[0] || 'orange']);
                        }
                    }
                    function useless(data) {

                    }
                    doneCallback.call(this, data,useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                });
        }

        /**渠道任务分解*/
        function qdrwShowIcon() {
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/channel/findByProjectId.do',
                data: {
                    projectId: $projectId
                },
                beforeSend: function () {

                }
            }, jsonp))
                .done(function (data) {
                    function useless(data) {
                        var className = iconClass[data.data.color];
                        $('.qd-rw-budget > i').attr("class", className);
                        if ("1" != data.status && 1 != data.status) {
                            systemMessage({
                                type: 'error',
                                title: '提示：',
                                detail: '获取数据失败！'
                            });
                        } else {
                            if (-1 == data.data.id || "-1" == data.data.id) {
                                $('.qd-rw-budget').attr("href", '../approval/new-apply/channel-plan-apply.html?cityId=' + $cityId + '&projectId=' + $projectId);
                            } else {
                                $('.qd-rw-budget').attr("href", '../approval/wait-apply/channel-plan-view.html?businessKey=' + data.data.id + '&wfInstanceId=' + data.data.code);
                            }
                        }
                    }

                    doneCallback.call(this, data, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                });
        };

        /**月度计划*/
        function qdydShowIcon() {
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/month/findByProjectId.do',
                data: {
                    projectId: $projectId
                },
                beforeSend: function () {

                }
            }, jsonp))
                .done(function (data) {
                    function useless(data) {
                        var className = iconClass[data.data.color];
                        $('.qd-yd-budget > i').attr("class", className);
                        if ("1" != data.status && 1 != data.status) {
                            systemMessage({
                                type: 'error',
                                title: '提示：',
                                detail: '获取数据失败！'
                            });
                        } else {
                            if (-1 == data.data.id || "-1" == data.data.id) {
                                //没有数据跳到  /hoss-v2/
                                $('.qd-yd-budget').attr("href", '../approval/new-apply/project-month-budget.html?cityId=' + $cityId + '&projectId=' + $projectId);
                            } else {
                                $('.qd-yd-budget').attr("href", '../approval/wait-apply/project-month-budget-view.html?businessKey=' + data.data.id + '&wfInstanceId=' + data.data.code);
                            }
                        }
                    }
                    doneCallback.call(this, data, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                });
        };

        /**月度预算*/
        function qdysShowIcon() {
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/budget/findByProjectId.do',
                data: {
                    projectId: $projectId
                },
                beforeSend: function () {

                }
            }, jsonp))
                .done(function (data) {
                    function useless(data) {
                        var className = iconClass[data.data.color];
                        $('.qd-ys-budget > i').attr("class", className);
                        if ("1" != data.status && 1 != data.status) {
                            systemMessage({
                                type: 'error',
                                title: '提示：',
                                detail: '获取数据失败！'
                            });
                        } else {
                            if (-1 == data.data.id || "-1" == data.data.id) {
                                //没有数据跳到  /hoss-v2/
                                $('.qd-ys-budget').attr("href", '../approval/new-apply/project-period-budget.html?cityId=' + $cityId + '&projectId=' + $projectId);
                            } else {
                                $('.qd-ys-budget').attr("href", '../approval/wait-apply/project-period-budget-view.html?businessKey=' + data.data.id + '&wfInstanceId=' + data.data.code);
                            }
                        }
                    }

                    doneCallback.call(this, data, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                });
        };

        function initUrl(){
            $('#qd-manager').attr("href", "../project/project-channel-manage.html?projectId=" + $projectId);
            $('.qd-liqu').attr("href", "../approval/new-apply/channel-brokerage-apply.html?project=" + $projectId);

            /**渠道任务分解*/
            $('.qd-rw-budget').on('click', function() {
                qdrwShowIcon();
            });

            /**月度预算*/
            $('.qd-yd-budget').on('click', function() {
                qdydShowIcon();
            });

            /*** 全周期预算*/
            $('.qd-ys-budget').on('click', function() {
                qdysShowIcon();
            });
        };

        function initProjectBench() {
            $.ajax($.extend({
                url: apiHost + '/hoss/bench/findWorkBenchOverview.do?projectId=' + $projectId,
                beforeSend: function () {

                }
            }, jsonp))
                .done(function (data) {
                    function useless(data) {
                        var dataObj = data.data || {};
                        $('.channel-zc-total').html(
                            template('channeldfSearchResultTemplate', data)
                        );
                        $('.expenditure-zc-total').html(
                            template('expenditureppSearchResultTemplate', data)
                        );
                        $('.income-sr-total').html(
                            template('incomeppSearchResultTemplate', data)
                        );
                    }
                    doneCallback.call(this, data, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                    onDetailEvents();
                });
            return false;
        }

        function onDetailEvents () {
            /**
             *实际净收明细
             */
            $('.actualIncome-ul').on('click', function() {
                var url = apiHost + '/hoss/bench/findChannelDeaTotallList.do?projectId=' + $projectId;
                benchCommAjax(url, "todaySearchResultTemplate", '.sr-table', '.income_amount');
                return false;
            });

            /**
             * 预调收入明细
             */
            $('.anticipatedRevenue-ul').on('click', function() {
                var url = apiHost + '/hoss/bench/findAdvanceDetail.do?projectId=' + $projectId;
                benchCommAjax(url, "actualIcomeSearchResultTemplate", '.plan-table', null);
                return false;
            });

            /**
             * 支出明细
             */
            $('.details-chart-zc').on('click', function() {
                var url = apiHost + '/hoss/bench/findFeeTotalList.do?projectId=' + $projectId;
                benchCommAjax(url, "incomeSearchResultTemplate", '.km-table','.income_total');
                return false;
            });

            /**
             * 渠道明细图
             */
            $('.details-chart-qd').on('click', function() {
                var url = apiHost + '/hoss/bench/findChannelTotalList.do?projectId=' + $projectId;
                benchCommAjax(url, "channelIdealTotalSearchResultTemplate", '.zc-table','.channel_count');
                return false;
            });
        }

        /**
         * 通用请求
         * @param url
         * @param templateName
         * @param type
         * @returns {boolean}
         */
        function benchCommAjax(url, templateName, className, totalName) {
            $.ajax($.extend({
                url: url,
                beforeSend: function () {

                }
            }, jsonp))
                .done(function (data) {
                    function useless(data) {

                        data.data.projectId = $projectId;

                        var dataObj = data.data || {};

                        if('.channel_count' == totalName) {
                            data.data.dealCount = $('#dlCount').val() || 0;
                            data.data.haowuCount = $('#hwCount').val() || 0;
                            data.data.percentageRatio = $('#paRatio').val() || 0;
                        }

                        $(className).find('tbody').html(
                            template(templateName, data)
                        );

                        if('.channel_count' == totalName) {
                            $(totalName).html(
                                template('channelCountSearchResultTemplate', data)
                            );
                        }
                        if('.income_total' == totalName) {
                            $(totalName).html(
                                template('incomeTotalSearchResultTemplate', data)
                            );
                        }
                        if('.income_amount' == totalName) {
                            $(totalName).html(
                                template('incomeAmountSearchResultTemplate', data)
                            );
                        }
                        $(className).modal('show');
                    }
                    doneCallback.call(this, data, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {

                });
            return false;
        }

        $('#formControlSmSelect').on('change',function(){
            $searchFormRemind.submit();
        });
        //工作提醒查询
        $searchFormRemind.on('submit', function () {
            $('.work-remind-list').empty();
            $.ajax($.extend({
                url: apiHost + '/hoss/bench/getRemindOfWord.do',
                data: $searchFormRemind.serialize(),
                beforeSend: function () {

                }
            }, jsonp))
                .done(function (data) {
                    function useless(data) {
                        var dataObj = data.data || {};
                        $('.work-remind-list').html(
                            template("viewUlTemplate", data)
                        );
                    }
                    doneCallback.call(this, data, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                });
            return false;
        }).trigger('submit');
    });
});