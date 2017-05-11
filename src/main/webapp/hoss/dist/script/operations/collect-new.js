define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    require('datepicker');
    require('datetimepicker');

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
    var fileupload = require('fileupload');
    var ztree = require('ztree');

    var selectArea = require('script/operations/select-area');


    function domReady() {
        window.ue = UE.getEditor('editor',{
                initialFrameWidth : 700
            });
        window.upload = fileupload;
        window._hoss = hoss; // 富文本上传图片需要的 全局

        // 选择发布类型
        var $message = $('tr[message]'),
            $poster = $('tr[poster]')
        $('input[type=radio]').click(function(e){
            var type = $(e.currentTarget).val();
            if (type === 'in') {
                $message.show();
                $poster.hide();
            } else {
                $message.hide();
                $poster.show();
            }
        }).
            eq(0).click();


        $('#datepicker input').datetimepicker({
            weekStart: 1,                 // 星期第一天 周一
            autoclose: true,              // 选择日期后是否立即关闭
            startDate:new Date(),
            todayHighlight: true,         // 高亮当前日期
            startView: 2,                 // 打开后首选显示的视图 (2日, 3月)
            minView: 0,                   // 能够提供的 精确视图 (0分,1时,2日, 3)
            minuteStep: 5,                // 分钟的显示密度, 默认5
            format: 'yyyy-mm-dd hh:ii',    // 日期格式
            language:'zh-CN'
        })


        // 新增
        var $addForm = $('#addForm'),
            addCode = '/hoss/partnerOperate/addSysInfo.do'

        $addForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if (event) {
                event.preventDefault();
            }


            // 提交前的数据
            var publishObject = [];
            $('input[type=checkbox]:checked').map(function(index, node){
                publishObject.push($(node).val());
            });
            $('#publishObject').val(
                publishObject.join(',')
            );

            var cityIds = [];
            $('.selected-area input').each(function(index, node){
                cityIds.push($(node).attr('areaid'));
            });
            $('#cityIds').val(cityIds.join(','));

            if ($('input[type=radio]:checked').val() == 'assembly') {
                $('#info').val(encodeURIComponent(ue.getContent()));
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + addCode,
                data: clearEmptyValue($context),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

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
                    failCallback.call(this, jqXHR, '新增集结号失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        });


        // 上传图片
        $('#upload-label').delegate('input', 'change', function(){

            var fileName = 'imgFile',
                id = '',
                objType = '',
                fileId = 'imgFile',
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

                        $('#uploadImg').attr('src', apiHost + '/hoss/sys/fileDownload/download.do?id=' + result.data.id)
                        $('#imageId').val(result.data.id);
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


        // 消息长度限制！
        var $info = $('#info');
        $info.keyup(function(e){
            var context = $(e.currentTarget).val();
            if(context.length > 500) {
                $info.val(context.substr(0, 500));
                systemMessage('消息内容最多500字！');
            }
        });
    }


    $(domReady);
});


