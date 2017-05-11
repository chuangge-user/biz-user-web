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
        jsonpost = xhr.jsonpost,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');

    var pagination = require('pagination');

    var confirmation = require('bootstrap/confirmation');

    var systemMessage = require('system-message');
    var dateStr = require('date-extend');

    var fileupload = require('fileupload');

    var queryString = require('get-query-string');

    var areaPicker = require('area-picker');
    var $province = $('#province'),
        $city = $('#city');
    areaPicker.provinceToCity($province, $city);

    var expendMan = require('script/franchise-manage/expend-man')



    function domReady() {


        $('input[name="cellphone"]').blur(function(){
            //alert(this.value)
            var tel = this.value;
            var reg = /^0?1[3|4|5|7|8][0-9]\d{8}$/;
            if (reg.test(tel)) {

            }else{
                $('input[name="cellphone"]').val('');
            };

        })


        var $addForm = $('#addForm'),
            addCode = '/hoss/league/apply/partnerToAddCompany.do'
            expendMan.bind($('#expand_man'));


        // 获取直客专员管理列表
        $addForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]')
            if (event) {
                event.preventDefault();
            }
            if ($submit.hasClass('disabled')) {
                return false;
            }

            if (checkEmpty()) {
                return;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + addCode,
                data:clearEmptyValue($context),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonpost)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        location = document.referrer;
                    }
                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '提交失败！'
                        });
                    }
                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '提交失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });
        })
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
                fileType:['jpg','jpeg','png','gif'],
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



    function checkEmpty(){
        var checkCollection = {
            name:'公司名字',
            location:'公司地址',
            city_s1:'加盟城市',
            c_tel:'电话',
            youbian:'邮编',
            c_profile:'公司介绍',
            expand_man:'拓展人员',
            trench_source:'申请渠道',
            cuname:'联系人',
            job:'职位',
            cellphone:'手机',
            email:'邮件',
            advantage:'加盟理由',
            city_assess:'所在城市评估',
            resource_assess:'自身资源评估',
            strength_assess:'团队实力评估',
            internet_thinking:'互联网思维',
            company_comprehend:'公司实力',
            market:'市场调查及分析、市场计划',
            bussiness_license:'企业营业执照',
            identity_card:'法人身份证明',
            office_environment:'办公环境照片'
        }

//        $.each(checkCollection, function(key, value){
//            if(!$('name=[' + key + ']]').val()){
//                systemMessage(value + '不能为空!')
//            }
//        })
        for (var key in checkCollection) {
            if(!$('[name=' + key + ']').val()){
                systemMessage(checkCollection[key] + '不能为空!');
                return true;
            }
        }

    }

    $(document).ready(domReady);




});