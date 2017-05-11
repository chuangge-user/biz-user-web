define(function (require) {
    var hoss = require('hoss'),
        webHost = hoss.webHost,
        username = hoss.username,
        usermobile=hoss.usermobile,
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var navigation = require('navigation');
    var dateExtend = require('date-extend');

    var template = require('template');
    var datepicker = require('datepicker');
    var pagination = require('pagination');
    var confirmation = require('bootstrap/confirmation');
    var systemMessage = require('system-message');
    var fileupload = require('fileupload');
    var progressUpload = require('script/progress-upload');
    var getQueryString = require('get-query-string');

    var _download = apiHost + '/sale/common/downloadByKey.do?mKey=';

    //全局保存已经选择的渠道
    var select_channel_ids = '';

    var tmpWebPath = hoss.location.host;
    template.helper('tmpWebPath',tmpWebPath);

    //端口：招标审核,招标拒绝
    var bidReviewPort = '/sale/bidinfo/bidReview.do',
    bidRefusePort='/sale/bidinfo/bidRefuse.do';





    function domReady() {
        progressUpload.bindAddFileLink($('#addFileLink'), $('#fileProgressBox'))
        var saleBidinfoId = getQueryString('saleBidinfoId'),
            saleRentalcenterId = getQueryString('saleRentalcenterId'),
            refuseId = getQueryString('id');
        if (!saleBidinfoId) {
            systemMessage('参数错误！');
            return false;
        }
        //*******竞标审核详情*******//
        loadData(bidReviewPort,{saleBidinfoId: saleBidinfoId,saleRentalcenterId:saleRentalcenterId},'infoTemplate',$('#infoBox'));
        //*******签约*******//
        $('#infoBox').on('click','.signing',function(){
            var o = $(this),rentalName= o.attr('data-rentalName'),orgName= o.attr('data-orgName');
            $("#datasaleBidinfoId").val(o.attr('data-saleBidinfoId'));
            $("#datasaleRentalcenterId").val(o.attr('data-saleRentalcenterId'));
            $("#dataId").val(o.attr('data-Id'));
            $("#dataorgId").val(o.attr('data-orgId'));
            $("#dataorgName").val(o.attr('data-orgName'));
            $("#datarentalName").val(o.attr('data-rentalName'));
            $('#rentalName').text(rentalName);
            $('#orgName').text(orgName);
        });
        // 加载数据方法
        function loadData(code, params, successTemplate, $searchResultList, callback){
            $.ajax($.extend({
                url: apiHost + code,
                data: params,
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = successTemplate;
                        $searchResultList.html(
                            template(templateId, data)
                        );
                        if(callback){
                            callback();
                        }
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
                }).
                always(function () {
                });
        }

        function initDate(){
            var signDate=$("#signDate"),
                cooperStartDate=$("#cooperStartDate"),
                cooperEndDate=$("#cooperEndDate");

            signDate.val( dateExtend.getToday() ).datepicker({
                language: 'zh-CN',
                startDate:new Date(),
                format: 'yyyy-mm-dd',
                autoclose:true
            });

            cooperStartDate.datepicker({
                language: 'zh-CN',
                format: 'yyyy-mm-dd',
                autoclose:true
            });
            cooperEndDate.datepicker({
                language: 'zh-CN',
                dateFormat: 'yy-mm-dd',
                autoclose:true
            })
        }

        /**
         * 表单验证函数
         * @returns {boolean}
         */
        function validate(){
            var sd = $("#signDate").datepicker("getDate"), s = $("#cooperStartDate").datepicker("getDate"),  e  = $("#cooperEndDate").datepicker("getDate");

            if( !sd){
                systemMessage({type:"error",detail:"签约日期不能为空！"});
                return false;
            }

            if( !s || !e){
                systemMessage({type:"error",detail:"开始时间和结束时间不能为空！"});
                return false;
            }

            if ( s && e && e < s ) {
                systemMessage({type:"error",detail:"结束时间不能小于开始时间！"});
                return false;
            }

            if ( $("#sginMoney").val().length < 1  ) {
                systemMessage({type:"error",detail:"签约金额不能为空！"});
                return false;
            }

            return true;
        }

        // 提交表单
        var $signForm =  $("#signForm");
        $signForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $btnSubmit = $context.find('input[type=submit]');

            if (event) {
                event.preventDefault();
            }
            if ($btnSubmit.hasClass('disabled')) {
                return false;
            }

            initFileKeys();
            $disabled.removeAttr('disabled');

            // TODO: 各种表单验证, 保存
            if(!true) {
                return false;
            }

            $.ajax($.extend({
                url: apiHost + '/sale/bidinfo/bidSign.do',
                data: clearEmptyValue($signForm),
                beforeSend: function () {
                    $btnSubmit.attr('disabled', 'disabled');
                }
            }, jsonp)).done(
                function (data) {
                    function useful(data) {
                        var dataObj = data.detail || {};
                        systemMessage({
                            type: 'info',
                            title: '操作提示：',
                            detail: dataObj
                        });
                        // 异步回调
                        location = document.referrer;




                    }
                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail
                        });
                    }
                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '');
                }).
                always(function () {
                    $submit.removeAttr('disabled').blur();
                }
            );

        });

        /**
         * 初始化附件值
         */
        function initFileKeys(){
            var fileKeyHTML = '';
            $('#fileProgressBox .file-box').each(function(index, fileBox){
                var $fileBox = $(fileBox);
                fileKeyHTML += '<input type="hidden" name="files[' + index + '].fileName" value="' + $fileBox.find('[fileName]').text() + '" />';
                fileKeyHTML += '<input type="hidden" name="files[' + index + '].fileKey" value="' + $fileBox.find('input[name="documentId"]').val() + '" />';
            });

            $('#fileContainer').html(fileKeyHTML);
        }


        // 拒绝 bidRefuse
        $('#infoBox').on('click', '.bidRefusebtn', function() {
            var o = $(this),refuseId= o.attr('data-Id');
            $.ajax($.extend({
                url: apiHost + bidRefusePort,
                data: {
                    id:refuseId
                },
                beforeSend: function () {

                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {

                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '拒绝签约成功！'
                        });
                        // 可能还需要其他操作 ：签约功能失效
                        location = document.referrer;

                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取数据失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                })
        });



        initDate();
    }

    $(document).ready(domReady);
});
