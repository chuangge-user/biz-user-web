define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;
    var $ = require('jquery');
//    var navigation = require('navigation');
    var modal = require('bootstrap/modal');
    var systemMessage = require('system-message');
    var fileupload = require('fileupload');
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var feedbackHtml =
        '<div id="feedbackModal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">' +
        '<div class="modal-dialog modal-m">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' +
        '<h4 class="modal-title">问题反馈</h4>' +
        '</div>' +
        '<form id="feedbackSubmitButtion" name="feedbackSubmitButtion" method="post" action="/hoss/sys/questionFeedback.do" enctype="multipart/form-data">' +
        '<div class="modal-body">' +
        '<table class="table">' +
        '<tbody>' +
        '<tr>' +
        '<td>反馈类型</td>' +
        '<td>' +
        '<select class="form-control-sm" id="feeType" name="feeType">' +
        '<option value="0">请选择</option>' +
        '<option value="1">界面问题</option>' +
        '<option value="2">具体功能</option>' +
        '<option value="3">其他问题</option>' +
        '</select>' +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '<td>提交类型</td>' +
        '<td>' +
        '<select class="form-control-sm" id="submitType" name="submitType">' +
        '<option value="0">请选择</option>' +
        '<option value="1">发现一个错误</option>' +
        '<option value="2">提交改进建议</option>' +
        '</select>' +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '<td>反馈内容</td>' +
        '<td>' +
        '<textarea class="form-control" id="content" name="content"></textarea>' +
        '</td>' +
        '</tr>' +
        //'<table id="feedbackfileUploadTable" class="table table-hover table-responsive table-bordered"></table>' +
        '<td colspan="2"><input id="imageFile" name="imageFile" type="file"></td>' +
        '<tr>' +
        '<td></td>' +
        '<td><span class="description">您可以上传1M以内的jpg、jpeg、png和gif格式的图片文件</span></td>' +
        '</tr>' +
        '<tr>' +
        '<td colspan="2">如有任何建议也可发送至邮箱：hoss@haowu.com</td>' +
        '</tr>' +
        '</tbody>' +
        '</table>' +
        '<br>' +
        '<br>' +
        '<div class="btns text-center">' +
        '<button type="button" class="btn btn-sm btn-warning" id="buttonsubmit">提交</button>' +
        '</div>' +
        '</div>' +
        '</form>' +
        '</div>' +
        '</div>' +
        '</div>';


    function domReady() {
        var $feedback = $('#feedback');
        $feedback.removeAttr('href').attr({
            'href': 'javascript:;',
            'data-target': '#feedbackModal',
            'data-toggle': 'modal'
        }).off().on('click', function(e) {
            if (e) {
                e.preventDefault();
            }
        });
        $('body').append(feedbackHtml);
        $('header').append('<link rel="stylesheet" type="text/css" href="'+webHost+'/dist/style/account/feedback.css">');
        var $buttonsubmit = $('#buttonsubmit');
        //var fileOperationUtil = require('script/file-operation-util-feedback');
        //fileOperationUtil.appendFileUploadTable($('#feedbackfileUploadTable'), 'question_feedback');



        $buttonsubmit.on('click', function (event) {
            var feeType = $('#feeType').val();
            var submitType = $('#submitType').val();

            if(feeType==0&&submitType==0){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '反馈类型跟提交类型必填一个！'
                });
                return ;
            }

            var content = $('#content').val();

            if(content==""){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '反馈内容不能为空！'
                });
                return ;
            }
            var fileId = $('#imageFile').attr("id");

            var fileIdvalue = $('#imageFile').val();
            var paramsStr = "?feeType=" + feeType + "&submitType=" + submitType + "&content=" + content;
            if(fileIdvalue==""){
                // 无文件提交
                $.ajax($.extend({
                    url: apiHost + '/hoss/sys/questionFeedbackNoFile.do'+ paramsStr,
                    beforeSend: function () {}
                }, jsonp)).
                    done(function (data) {
                        function useful(data) {
                            if (data.status === '1') {
                                systemMessage({
                                    type: 'info',
                                    title: '提示：',
                                    detail: data.detail || '反馈问题成功！'
                                });
                                $('#feedbackModal').modal('hide');
                            } else {
                                systemMessage({
                                    type: 'info',
                                    title: '提示：',
                                    detail: data.detail || '反馈问题失败！'
                                });
                                $('#feedbackModal').modal('hide');
                            }
                        }

                        function useless(data) {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '反馈问题失败！'
                            });
                            $('#feedbackModal').modal('hide');
                        }

                        doneCallback.call(this, data, useful, useless);
                    }).
                    fail(function (jqXHR) {
                        failCallback.call(this, jqXHR, '反馈问题失败！');
                        $('#feedbackModal').modal('hide');
                    });

            }else{
                fileupload.ajaxFileUpload({
                    url: apiHost + "/hoss/sys/questionFeedback.do" + paramsStr,              //需要链接到服务器地址
                    secureuri: false,
                    fileElementId: fileId,
                    fileType:['jpg','jpeg','png','gif'],
                    fileSize:1*1000,//不能超过1M
                    dataType: 'json',  //服务器返回的格式类型
                    success: function (data) {//成功
                        var result = eval("(" + data + ")");//解析返回的json
                        if (result.status === '1') {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: result.detail || '反馈问题成功！'
                            });
                            $('#feedbackModal').modal('hide');
                        } else {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: result.detail || '反馈问题失败！'
                            });
                            $('#feedbackModal').modal('hide');
                        }
                    },
                    error: function (data, e) //异常
                    {
                        systemMessage("反馈问题失败！");
                        $('#feedbackModal').modal('hide');
                    }
                });
            }
        });
    }

    $(document).ready(domReady);
});