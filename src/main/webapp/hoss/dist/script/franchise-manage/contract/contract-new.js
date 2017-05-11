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
    //var companyName = require('script/franchise-manage/league_companyName');
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


    var startTime = queryString('contract_period_start'),
        endTime = queryString('contract_period_end'),
        companyid = queryString('id');

    function domReady() {
        //companyName.bind($('#companyName'));

        /*新增合同页面*/
        //$('.select-company').selectpicker({
        //    'noneSelectedText': '请选择加盟公司'
        //});


        $.ajax($.extend({
            url: apiHost + '/hoss/league/contract/addContract.do',
            data:''
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    var optionHTML = '<option value="">请选择加盟公司</option>';
                    $.each(dataObj.content, function(index, obj){
                        optionHTML += '<option value="' + obj.id + '">' + obj.name + '</option>';
                    });

                    jQuery("#companyName").html(optionHTML);
                    jQuery("#companyName").val(companyid);
                    changeCompany();
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
                failCallback.call(this, jqXHR, '获取加盟公司列表失败！');
            })

        $('input[name=startDate]').attr("value", dateStr.getToday());

        if (startTime){ // 本周数据、 本月数据 跳转附带 日期参数

            $('input[name=contract_period_start]').val(startTime);
            $('input[name=contract_period_end]').val(endTime);
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
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate';

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

        }).trigger('submit');




        jQuery('#companyName').bind('change',changeCompany);

        function changeCompany(){
            var val = jQuery('#companyName').val();
            if (val === "") {
                jQuery(".company-name").html("");
                jQuery(".company-address").html("");
                jQuery(".company-contact").html("");
                jQuery(".company-tel").html("");
                jQuery(".signatory_format").html("");
                jQuery("#issign").val("");
            } else {
                $.ajax($.extend({
                    url: apiHost + "/hoss/league/contract/selectCompany.do?id="+val
                }, jsonp)).
                    done(function (data) {
                        function useful(data) {
                            var dataObj = data.data;

                            // 显示数据
                            jQuery(".company-name").html(dataObj.name);
                            var location = dataObj.location;
                            if (dataObj.city_name!=undefined) {
                                location = dataObj.city_name+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+location;
                            }
                            if (dataObj.province_name!=undefined) {
                                location = dataObj.province_name+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+location;
                            }
                            jQuery(".company-address").html(location);
                            jQuery(".company-contact").html(dataObj.cuname);
                            jQuery(".company-tel").html(dataObj.cellphone);
                            jQuery("#issign").val(dataObj.isSign);
                            if (dataObj.isSign === 0) {
                                jQuery(".signatory_format").html("新签");
                            } else {
                                jQuery(".signatory_format").html("续签");
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
                        $disabled.attr('disabled', 'disabled');
                        $submit.removeAttr('disabled').blur();
                    });
            }
            //setCompanyInfo(val);

        }

        function setCompanyInfo(id){
            var data = {"data":[{"name":"公司名称1","address":"地址1","id":1},{"name":"公司名称1","address":"地址2","id":2}]};
            jQuery.each(data.data,function(k,v){
                if(id== v.id){
                    jQuery.each(v,function(k2,v2){
                        var className = '.company-'+k2;
                        jQuery(className).text(v2);
                    });
                }
            });
        }

        //var fileOperationUtil = require('script/file-operation-util');
        //fileOperationUtil.appendFileUploadTable($('#fileUploadTable'), 'common_form', '');
        require('script/validate');
        //提交
        $("a[data-type]").click(function(event){

            var flowDealType = $(this).attr("data-type");
            if(!$('#newContractForm').isValid()) {
                return false;
            }
            if (checkMoney($('[name=deposit]').val())) {
                return;
            }
            var confirmStr = "提交审批";
            if(flowDealType == 'draft'){
                confirmStr = "保存草稿"
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


            $.ajax({
                type: "POST",
                url : apiHost + "/hoss/league/contract/commitContract.do",
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
    }

    function checkMoney(money){
        if (money&&!/^[0-9]{1,9}(\.[0-9]{1,2})?$/.test(money)) {
            systemMessage('保证金输入有误，金额必须小于10位数。可保留两位小数点');
            return true;
        }
    }

    $(document).ready(domReady);




});