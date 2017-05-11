
/**
 * 中介基本信息
 */
define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    require('datepicker');

    var navigation = require('navigation');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');

    var pagination = require('pagination');

    var confirmation = require('bootstrap/confirmation');
    var $tab = require('bootstrap/tab');

    var systemMessage = require('system-message');
    var dateStr = require('date-extend');

    var queryString = require("get-query-string"),
        intermediaryId = queryString("intermediaryId");



//    $(function () {
//        var $countweekmonth = $('#count-week-month');
//        $countweekmonth.find('a:first').tab('show');
//    });

    function domReady(){

        // Tab 栏 项目ID
       $('.yw2').find('a').each(function(i, a){
            $(a).attr('href', $(a).attr('href') + '?intermediaryId=' + intermediaryId);
        });

        // 统计信息
        var getIntermediaryReportCode = '/hoss/partner/getIntermediaryReportByIntermediaryId.do',
            getIntermediaryReportCodeTemplate = 'getIntermediaryReportCodeTemplate',
            reportParams = {intermediaryId:intermediaryId},
            messageTemplate = 'messageTemplate',
            $searchReportResult = $('#searchReportResult'),
            $informationTitle = $('#informationTitle'),
            informationTitleTemplate = 'informationTitleTemplate'

        $.ajax($.extend({
                url: apiHost + getIntermediaryReportCode,
                data: reportParams,
                beforeSend: function () {}
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = getIntermediaryReportCodeTemplate;
//                            templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
//                                getIntermediaryReportCodeTemplate :
//                                messageTemplate;

                        // 显示数据
                        $searchReportResult.html(
                            template(templateId, data)
                        ).find('a[id=showAllBrokerLink]').click(function(){
                            $shopId[0].selectedIndex = 0;
                            $searchBrokerForm.submit();
                        });

                        $informationTitle.html(
                          template(informationTitleTemplate, data)
                        );

                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取统计信息失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取统计信息失败！');
                }).
                always(function () {
                });


        // 经纪人列表
        var $searchBrokerForm = $('#searchBrokerForm'),
            $borkerPageNum = $searchBrokerForm.find('input[name=page]'),
            $borkerPageSize = $searchBrokerForm.find('input[name=size]'),
            $searchBrokerResultList = $('#searchBrokerResultList'),
            $searchBrokerResultPagination = $('#searchBrokerResultPagination'),
            $shopId = $searchBrokerForm.find('[name=shopId]'),
            $keyword = $searchBrokerForm.find('[name=keyword]'),
            searchBrokerTemplate = 'searchBrokerTemplate',
            searchBrokerListCode = '/hoss/partner/getIntermediaryBrokerListById.do';


        $searchBrokerForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + searchBrokerListCode,
                data: {
                    intermediaryId:intermediaryId,
                    shopId:$shopId.val(),
                    keyword:$keyword.val(),
                    page:$borkerPageNum.val(),
                    size:$borkerPageSize.val()
                },
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                                searchBrokerTemplate :
                                messageTemplate;

                        // 显示数据
                        $searchBrokerResultList.html(
                            template(templateId, data)
                        );

                        // 显示分页
                        $searchBrokerResultPagination.pagination({
                            $form: $context,
                            totalSize: dataObj.totalElements,
                            pageSize: parseInt($borkerPageSize.val()),
                            visiblePages: 5,
                            info: true,
                            paginationInfoClass: 'pagination-count pull-left',
                            paginationClass: 'pagination pull-right',
                            onPageClick: function (event, index) {
                                $borkerPageNum.val(index - 1);
                                $context.trigger('submit');
                            }
                        });



//                        // 确认 合作&取消合作
//                        $searchResultList.find('span[data-toggle=confirmation]').confirmation({
//                            btnOkLabel: '确认',
//                            btnCancelLabel: '取消',
//                            onShow: function (event, element) {
//                                setCooperationStatus.isConfirm = false;
//                                $(element).on('click.setCooperationStatus', setCooperationStatus);
//                            },
//                            onHide: function (event, element) {
//                                setCooperationStatus.isConfirm = false;
//                                $(element).off('.setCooperationStatus');
//                            },
//                            onConfirm: function (event, element) {
//                                setCooperationStatus.isConfirm = true;
//                                $(element).trigger('click.setCooperationStatus');
//                            }
//                        });



                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取中介经纪人列表数据失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取中介经纪人列表数据失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        }).trigger('submit');


        // 门店列表
        var $searchStoreForm = $('#searchStoreForm'),
            $storePageNum = $searchStoreForm.find('input[name=page]'),
            $storePageSize = $searchStoreForm.find('input[name=size]'),
            $searchStoreResultList = $('#searchStoreResultList'),
            $searchStoreResultPagination = $('#searchStoreResultPagination'),
            searchStoreTemplate = 'searchStoreTemplate',
            getStoreListCode = '/hoss/partner/getStoreListByIntermediaryId.do';
        $searchStoreForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + getStoreListCode,
                data: {
                    intermediaryId:intermediaryId,
                    page:$storePageNum.val(),
                    size:$storePageSize.val()
                },
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                                searchStoreTemplate :
                                messageTemplate;

                        dataObj.ORG_ID = intermediaryId;

                        // 显示数据
                        $searchStoreResultList.html(
                            template(templateId, data)
                        ).find('[shopId]').click(function(e){
                                var shopId = $(e.currentTarget).attr('shopId');
                                $shopId.val(shopId);
                                $searchBrokerForm.submit();
                            });

                        // 显示分页
                        $searchStoreResultPagination.pagination({
                            $form: $context,
                            totalSize: dataObj.totalElements,
                            pageSize: parseInt($storePageSize.val()),
                            visiblePages: 5,
                            info: true,
                            paginationInfoClass: 'pagination-count pull-left',
                            paginationClass: 'pagination pull-right',
                            onPageClick: function (event, index) {
                                $storePageNum.val(index - 1);
                                $context.trigger('submit');
                            }
                        });

                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取门店列表数据失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取门店列表数据失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        }).trigger('submit');


        // 附件列表 by chenxuesong
        var $documentForm = $('#documentForm'),
            $documentList = $('#documentList'),
            documentTemplate = 'documentTemplate',
            getDocumentListCode = '/hoss/partner/getDocumentListByIntermediaryId.do';
        $documentForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + getDocumentListCode,
                data: {
                    intermediaryId:intermediaryId
                },
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                                documentTemplate :
                                messageTemplate;

                        dataObj.ORG_ID = intermediaryId;

                        // 显示数据
                        $documentList.html(
                            template(templateId, data)
                        );
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取附件列表数据失败！'
                        });
                    }
                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取附件列表数据失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        }).trigger('submit');


        // 门店列表 select
        var $storeSelect = $('#shopId'),
            storeListTempalte = 'storeListTempalte';
        $.ajax($.extend({
            url: apiHost + getStoreListCode,
            data: {
                intermediaryId:intermediaryId,
                page:0,
                size:1000 // 门店下拉列表长度 1000
            },
            beforeSend: function () {
            }
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    // 显示 select
                    $storeSelect.html(
                        template(storeListTempalte, data)
                    );
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取门店 select 数据失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            })


        // 读取管理员列表
        var $searchManagerForm = $('#searchManagerForm'),
            $managerPageNum = $searchManagerForm.find('input[name=page]'),
            $managerPageSize = $searchManagerForm.find('input[name=size]'),
            $searchManagerResultList = $('#searchManagerResultList'),
            $searchManagerResultPagination = $('#searchManagerResultPagination'),
            searchManagerTemplate = 'searchManagerTemplate',
            searchManagerListCode = '/hoss/partner/getIntermediaryManagerListById.do';

        $searchManagerForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + searchManagerListCode,
                data: {
                    intermediaryId:intermediaryId,
                    page:$managerPageNum.val(),
                    size:$managerPageSize.val()
                },
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                                searchManagerTemplate :
                                messageTemplate;

                        // 显示数据
                        $searchManagerResultList.html(
                            template(templateId, data)
                        );

                        // 显示分页
                        $searchManagerResultPagination.pagination({
                            $form: $context,
                            totalSize: dataObj.totalElements,
                            pageSize: parseInt($managerPageSize.val()),
                            visiblePages: 5,
                            info: true,
                            paginationInfoClass: 'pagination-count pull-left',
                            paginationClass: 'pagination pull-right',
                            onPageClick: function (event, index) {
                                $managerPageNum.val(index - 1);
                                $context.trigger('submit');
                            }
                        });

                        $searchManagerResultList.find('[type=reset]').confirmation({
                            btnOkLabel: '确认',
                            btnCancelLabel: '取消',
                            onShow: function (event, element) {
                                resetManager.isConfirm = false;
                                $(element).on('click.resetManager', resetManager);
                            },
                            onHide: function (event, element) {
                                resetManager.isConfirm = false;
                                $(element).off('.resetManager');
                            },
                            onConfirm: function (event, element) {
                                resetManager.isConfirm = true;
                                $(element).trigger('click.resetManager');
                            }
                        });

                        $searchManagerResultList.find('[type=status]').confirmation({
                            btnOkLabel: '确认',
                            btnCancelLabel: '取消',
                            onShow: function (event, element) {
                                setManagerDisable.isConfirm = false;
                                $(element).on('click.setManagerDisable', setManagerDisable);
                            },
                            onHide: function (event, element) {
                                setManagerDisable.isConfirm = false;
                                $(element).off('.setManagerDisable');
                            },
                            onConfirm: function (event, element) {
                                setManagerDisable.isConfirm = true;
                                $(element).trigger('click.setManagerDisable');
                            }
                        });

                        $searchManagerResultList.find('[type=edit]').click(editClick);


//                        // 确认 合作&取消合作
//                        $searchResultList.find('span[data-toggle=confirmation]').confirmation({
//                            btnOkLabel: '确认',
//                            btnCancelLabel: '取消',
//                            onShow: function (event, element) {
//                                setCooperationStatus.isConfirm = false;
//                                $(element).on('click.setCooperationStatus', setCooperationStatus);
//                            },
//                            onHide: function (event, element) {
//                                setCooperationStatus.isConfirm = false;
//                                $(element).off('.setCooperationStatus');
//                            },
//                            onConfirm: function (event, element) {
//                                setCooperationStatus.isConfirm = true;
//                                $(element).trigger('click.setCooperationStatus');
//                            }
//                        });



                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取中介管理员列表数据失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取中介管理员列表数据失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        }).trigger('submit');

        // 新增管理员
        var addManagerCode = '/hoss/partner/addIntermediaryManager.do',
            $addManagerForm = $('#addManagerForm'),
            $managerName = $addManagerForm.find('[name=name]'),
            $managerMobile = $addManagerForm.find('[name=mobile]');
        $addManagerForm.on('submit',function(event){
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }
            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + addManagerCode,
                data: {
                    intermediaryId:intermediaryId,
                    name:$managerName.val(),
                    mobile:$managerMobile.val()
                },
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '新增管理员成功！'
                        });

                        // 重新查询
                        $searchManagerForm.submit();

                        $addManagerForm[0].reset();

                        $('.close').click();
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '新增管理员失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });
        });


        // 编辑管理员
        var editManagerCode = '/hoss/partner/intermediaryManagerEdit.do',
            $editManagerForm = $('#editManagerForm'),
            $editName = $editManagerForm.find('[name=name]'),
            $editMobile = $editManagerForm.find('[name=mobile]'),
            $brokerId = $editManagerForm.find('[name=brokerId]');
        $editManagerForm.on('submit',function(event){
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }
            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + editManagerCode,
                data: {
                    brokerId:$brokerId.val(),
                    name:$editName.val(),
                    mobile:$editMobile.val()
                },
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '保存管理员信息成功！'
                        });

                        // 重新查询
                        $searchManagerForm.submit();

                        $('.close').click();
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '保存管理员信息失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                })
        });
        function editClick(e){ // 设置 编辑内容
            var $target = $(e.currentTarget);
            var $tr = $target.parents('tr');
            $editName.val($tr.find('[name=name]').text());
            $editMobile.val($tr.find('[name=mobile]').text());
            $brokerId.val($tr.find('[name=brokerId]').val());
        }

        // 重置管理员
        var resetManagerCode = '/hoss/partner/intermediaryManagerResetAccount.do'
        function resetManager(e) {
            var $target = $(e.currentTarget);
            var $tr = $target.parents('tr');
            if (!resetManager.isConfirm) {
                return false;
            }
            resetManager.isConfirm = false;

            $.ajax($.extend({
                url: apiHost + resetManagerCode,
                data: {
                    brokerId:$tr.find('[name=brokerId]').val()
                },
                beforeSend: function () {
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '重置管理员成功！'
                        });

                        // 重新查询
                        $searchManagerForm.submit();
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '重置管理员失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                })
        }

        // 设置管理员状态 禁用 & 启用
        var setManagerDisableCode = '/hoss/partner/intermediaryManagerDisabledOrEnable.do';
        function setManagerDisable(e) {
            var $target = $(e.currentTarget);
            var $tr = $target.parents('tr');
            if (!setManagerDisable.isConfirm) {
                return false;
            }
            setManagerDisable.isConfirm = false;


            $.ajax($.extend({
                url: apiHost + setManagerDisableCode,
                data: {
                    brokerId:$tr.find('[name=brokerId]').val(),
                    type:$target.attr('status')
                },
                beforeSend: function () {
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '禁用管理员成功！'
                        });

                        // 重新查询
                        $searchManagerForm.submit();
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '禁用管理员失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                })
        }

        // 本月本周数据
        var getReportByDateCode = '/hoss/partner/getIntermediaryReportByIntermediaryIdAndDateType.do',
            getReportByDateTemplate = 'getReportByDateTemplate',
            $getReportByWeekResult = $('#toweek'),
            $getReportByMonthResult = $('#tomonth')

        // 1 本周    2 本月
        getReportByDate(1, $getReportByWeekResult);
        getReportByDate(2, $getReportByMonthResult);
        function getReportByDate(type, $result){
            $.ajax($.extend({
                url: apiHost + getReportByDateCode,
                data: {
                    intermediaryId:intermediaryId,
                    dateType:type
                },
                beforeSend: function () {}
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = getReportByDateTemplate;

                        dataObj.ORG_ID = intermediaryId; // 为模板填充做数据
                        if ($result == $getReportByWeekResult) {
                            dataObj.startTime = dataObj.weekStartDate;
                            dataObj.endTime = dataObj.weekEndDate;
                        } else {
                            dataObj.startTime = dataObj.monthStartDate;
                            dataObj.endTime = dataObj.mothEndDate;
                        }

                        // 显示数据
                        $result.html(
                            template(templateId, data)
                        );

                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取统计信息失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                })
        }


        // 门店经纬度列表
        var getPointListCode = '/hoss/partner/getStoreLatitudeLongitudeListByIntermediaryId.do';

        $.ajax($.extend({
            url: apiHost + getPointListCode,
            data: {
                intermediaryId:intermediaryId
            },
            beforeSend: function () {}
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    var content = dataObj.storeLatitudeLongitudeList || [];
                    var cityInfo = dataObj.cityInfo;


                    var icon = {w:21,h:25,l:0,t:25,x:6,lb:5}; //默认icon处理位置

                    var _icon = icon;

                    var $allmap = $('#allmap');
                    $allmap.width($allmap.parent().width());

                    // 百度地图API功能
                    var map = new BMap.Map("allmap");
                    var point = new BMap.Point(0,0);
                    map.centerAndZoom(point, 13);
                    map.enableScrollWheelZoom(true);   //启用滚轮放大缩小，默认禁用
                    map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用

                    map.setCenter(cityInfo.cityName);

                    // 编写自定义函数,创建标注
                    function addMarker(point, i){
                        var iconImg = createIcon(_icon, i);
                        var marker = new BMap.Marker(point,{icon:iconImg});

                        map.addOverlay(marker);
                    }

//
                    $.each(content, function (index, item){
                        addMarker(new BMap.Point(item.longitude, item.latitude), index);
                    });





                    //创建一个Icon
                    function createIcon(json, index){
                        picUrl = apiHost + '/hoss-v2/dist/image/points.png';
                        var imageOffset = new BMap.Size(-json.l,-json.t*11);
                        if(index < 10){
                            imageOffset = new BMap.Size(-json.l,-index * 25);
                        }
                        var icon = new BMap.Icon(picUrl, new BMap.Size(json.w,json.h),{imageOffset: imageOffset});
                        return icon;
                    }
                }




                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取门店经纬度列表失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            })

        window.downloadFile=downloadFile;
        function downloadFile(id){
            var url=apiHost + '/hoss/sys/fileDownload/download.do?id='+id;
            $("#downloadFile_"+id).attr("href",url);
        }
    }


    $(document).ready(domReady);
});