/**
 * 中介客户管理
 */
define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    require(['jquery', 'datepicker', 'dist/script/bootstrap.min', 'dist/script/bootstrap-select']);
    var navigation = require('navigation');
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;
    var template = require('template');
    var pagination = require('pagination');
    var confirmation = require('bootstrap/confirmation');
    var systemMessage = require('system-message');
    var dateStr = require('date-extend');
    var queryString = require('get-query-string'), // 读取 URL 附加参数
        appendParams = {},
        appendParamsStr;
    $.each({
        TYPE:queryString('TYPE'),
        ORG_ID:queryString('ORG_ID'),
        EMPLOY_ID:queryString('EMPLOY_ID'),
        CORPORATION_STATUS:queryString('CORPORATION_STATUS'),
        EMPLOY_NAME:queryString('EMPLOY_NAME'),
        projectId:queryString('projectId'),
        PROJECT_STATUS:queryString('PROJECT_STATUS'),
        shopId:queryString('shopId')
    }, function(key, value){ // 清理空参
        if (value) {
            appendParams[key] = value;
        }
    });
    appendParamsStr = $.param(appendParams) + '&';

    var startTime = queryString('startTime'),
        endTime = queryString('endTime');


    function domReady() {

        $('.selectpicker').selectpicker({
            'noneSelectedText': '单据状态'
        });

        $('input[name=startDate]').attr("value", dateStr.getToday());

        if (startTime){ // 本周数据、 本月数据 跳转附带 日期参数

            $('input[name=startTime]').val(startTime);
            $('input[name=endTime]').val(endTime);
        }

        var $datepickerGroup = $('#datepicker > input'),
            startDate;
        $datepickerGroup.datepicker({
            autoclose: true,
            language: 'zh-CN',
            dateFormat: 'yy-mm-dd'
        });
        jQuery("#contract_createtime").datepicker({
            autoclose: true,
            language: 'zh-CN',
            dateFormat: 'yy-mm-dd'
        });
        jQuery("#archive_time").datepicker({
            autoclose: true,
            language: 'zh-CN',
            dateFormat: 'yy-mm-dd'
        });
        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate',
            queryClientRecordListCode = '/hoss/league/contract/showContract.do';





        var id = queryString('id');
        if (!id) {
            systemMessage('参数错误！');
            return false;
        }


        $.ajax($.extend({
            url: apiHost + queryClientRecordListCode,
            data: {id: id}
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    if (data.status == 1) {
                        var _data = data.data;
                        $('label[name="companyName"]').html(_data.content[0].companyName);
                        var location = _data.content[0].location;
                        if (_data.content[0].city_name!=undefined) {
                            location = _data.content[0].city_name+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+location;
                        }
                        if (_data.content[0].province_name!=undefined) {
                            location = _data.content[0].province_name+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+location;
                        }
                        $('label[name="location"]').html(location);
                        $('label[name="cuname"]').html(_data.content[0].cuname);
                        $('label[name="cellphone"]').html(_data.content[0].cellphone);
                        //$('label[name="deposit"]').html(_data.content[0].deposit);
                        $('label[name="signatory_format"]').html(_data.content[0].signatory_format);
                        var issign = _data.content[0].signatory_format;
                        $('#issign').val(issign);
                        if (issign===0) {
                            $('label[name="signatory_format"]').html("新签");
                        } else {
                            $('label[name="signatory_format"]').html("续签");
                        }
                        $('input[name="league_company_id"]').val(_data.content[0].league_company_id);
                        $('input[name="id"]').val(_data.content[0].id);
                        $('input[name="contract_period_start"]').val(_data.content[0].contract_period_start);
                        $('input[name="contract_period_end"]').val(_data.content[0].contract_period_end);
                        $('input[name="contract_createtime"]').val(_data.content[0].contract_createtime);
                        $('input[name="archive_time"]').val(_data.content[0].archive_time);
                        $('input[name="deposit"]').val(_data.content[0].deposit);
                        var attachid = _data.content[0].attachment;
                        if (attachid!=0) {
                            var durl = apiHost + "/hoss/sys/fileDownload/download.do?id=" + attachid;
                            $('th[name="attachment"]').html("<a href='"+durl+"'>查看合同附件</a>");
                            $('input[name="attachment"]').val(attachid);
                        }
                    } else {
                        systemMessage('获取投放详情失败！');
                        return false;
                    }

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
                failCallback.call(this, jqXHR, '获取数据失败！');
            })


        // 获取直客专员管理列表
        $searchForm.on('submit', function (event) {
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


            // 设置多选的值
            var selectVal= $('#id_select').val();
            $('input[name=basicStatus]').val(selectVal&&selectVal.join(','));



        }).trigger('submit');



        //var fileOperationUtil = require('script/file-operation-util');
        //fileOperationUtil.appendFileUploadTable($('#fileUploadTable'), 'common_form', '');
        require('script/validate');
        //提交
        $("a[data-type]").click(function(event){

            var flowDealType = $(this).attr("data-type");
            if(!$('#newContractForm').isValid()) {
                return false;
            }
            var confirmStr = "提交";
            if(flowDealType == 'draft'){
                confirmStr = "保存草稿"
            }
            if (checkMoney($('[name=deposit]').val())) {
                return;
            }
            if(!confirm('确定' + confirmStr +'吗?')){
                return;
            }
            var $context = $(this),
                $disabled = $context.find('[disabled]');

            if (event) {
                event.preventDefault();
            }

            if ($context.hasClass('disabled')) {
                return false;
            }
            $disabled.removeAttr('disabled');

            //var commonForm = {};
            //if(!isEmpty(taskId)){
            //    commonForm.taskId = taskId;
            //}
            //if(!isEmpty(businessKey)){
            //    commonForm.businessKey = businessKey;
            //}
            //if(!isEmpty(wfInstanceId)){
            //    commonForm.wfInstanceId = wfInstanceId;
            //}
            $.ajax({
                type: "POST",
                url : apiHost + "/hoss/league/contract/modifyContract.do",
                dataType : 'json',
                data :$("#newContractForm").serialize(),
                success: function(msg){

                }

            }).done(function (data) {

            }).fail(function (jqXHR, textStatus, errorThrown) {
                var json = eval('(' + jqXHR.responseText+ ')');
                if (json.detail.indexOf("成功") == -1 ) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: json.detail || '提交失败！'
                    });
                } else {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: json.detail || '提交成功！'
                    });
                    location.href=document.referrer;
                }
                $disabled.attr('disabled', 'disabled');
                $context.removeAttr('disabled').blur();
            });

        });

        $(".goback").click(function () {
            location.href=document.referrer;
        });
        var fileupload = require('fileupload');
        // 上传图片
        $('label').delegate('input', 'change', function(e){
            var $target = $(e.currentTarget),
                $td = $target.closest('td'),
                $hidden = $td.find('input[type="hidden"]'),
                $a = $td.find('a');

            var fileName = $target.attr('name'),
                id = '',
                objType = '',
                fileId = $target.attr('id'),
                docType = '1'


            fileupload.ajaxFileUpload({
                url: apiHost + "/hoss/file/fileUtil/uploadFile.do?fileId="+fileName+"&objId="+id+"&objType="+objType+"&docType="+docType,               //需要链接到服务器地址
                secureuri:false,
                fileElementId:fileId,
                fileSize:10*1000,//不能超过10M
                dataType: 'json',  //服务器返回的格式类型
                success: function (data) //成功
                {
                    var result =  $.parseJSON(data.substr(1, data.length - 2));//解析返回的json
                    if (result.status === '1') {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '上传成功！'
                        });

                        $a.attr('href', apiHost + '/hoss/sys/fileDownload/download.do?id=' + result.data.id)
                        $a.text(result.data.name);
                        $hidden.val(result.data.id);
                    }else{
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '上传失败！'
                        });
                    }
                },
                error: function (data, e) //异常
                {
                    systemMessage("文件超过10M，请重新上传！");
                }
            });
        })

        function checkMoney(money){
            if (money&&!/^[0-9]{1,9}(\.[0-9]{1,2})?$/.test(money)) {
                systemMessage('保证金输入有误，金额必须小于10位数。可保留两位小数点');
                return true;
            }
        }
    }

    $(document).ready(domReady);




});