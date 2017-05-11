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
        '<div id="feedbackModal2" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">' +
        '<div class="modal-dialog modal-m">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' +
        '<h4 class="modal-title">修改密码</h4>' +
        '</div>' +
        '<form id="feedbackSubmitButtion" name="feedbackSubmitButtion" method="post" action="/hoss/sys/questionFeedback.do" enctype="multipart/form-data">' +
        '<div class="modal-body">' +
        '<table class="table">' +
        '<tbody>' +
        '<tr>' +
        '<td>原密码</td>' +
        '<td>' +
        '<input type="password"  id="userOldPwd" name="userOldPwd" />' +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '<td>新密码</td>' +
        '<td>' +
        '<input type="password"  id="userNewPwd" name="userNewPwd" />' +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '<td>重复输入新密码</td>' +
        '<td>' +
        '<input type="password"  id="secondPwd" name="secondPwd">' +
        '</td>' +
        '</tr>' +
        '</tbody>' +
        '</table>' +
        '<br>' +
        '<br>' +
        '<div class="btns text-center">' +
        '<button type="button" class="btn btn-sm btn-warning" id="pwdbuttonsubmit">提交</button>' +
        '</div>' +
        '</div>' +
        '</form>' +
        '</div>' +
        '</div>' +
        '</div>';


    function domPwdReady() {
        $('#userOldPwd').val("");
        $('#userNewPwd').val("");
        $('#secondPwd').val("");

        var $feedback = $('#aUserPwd');
        $feedback.removeAttr('href').attr({
            'href': 'javascript:;',
            'data-target': '#feedbackModal2',
            'data-toggle': 'modal'
        }).off().on('click', function(e) {
            if (e) {
                e.preventDefault();
            }
        });
        $('body').append(feedbackHtml);
        $('header').append('<link rel="stylesheet" type="text/css" href="'+webHost+'/dist/style/account/feedback.css">');
        var $buttonsubmit = $('#pwdbuttonsubmit');

        /**
         * 密码格式[数字/字母/特殊符号]
         * @param test
         * @returns {boolean}
         */
        function checkValidate(test){
            var flag = true;
            if(test.replace(/[a-zA-Z]/).length==test.length) flag = false;
            if(test.replace(/[0-9]/).length==test.length) flag = false;
            if (!flag) {
                if(test.replace(/[#$%,.?:~@^&*()""+-]/).length==test.length) flag = false;
            }
            return flag;
        }
        $buttonsubmit.on('click', function (event) {
            var userOldPwd = $('#userOldPwd').val();
            var userNewPwd = $('#userNewPwd').val();
            var secondPwd = $('#secondPwd').val();
            if (!checkValidate(userNewPwd)) {
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '密码格式必须为[数字+字母+特殊字符]或[数字+字母]组成！'
                });
                return false;
            }
            if(""==userOldPwd||""==userNewPwd||""==secondPwd){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '输入的密码不能为空'
                });
                return false;
            }
            if(6>userNewPwd.length){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '新密码必须大于等于6位'
                });
                return false;
            }
            if(secondPwd!=userNewPwd){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '两次输入的新密码不一样'
                });
                return false;
            }
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/authUpdatePwd.do?oldPaw='+ userOldPwd+"&newPaw="+userNewPwd,
                beforeSend: function () {}
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        if (data.status === '1') {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '修改密码成功！'
                            });
                            $('#feedbackModal2').modal('hide');
                        } else {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '修改密码失败！'
                            });
                        }
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '修改密码失败！'
                        });
                        $('#feedbackModal').modal('hide');
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '修改密码失败！');
                    $('#feedbackModal').modal('hide');
                });


        });
    }

    $(document).ready(domPwdReady);
});