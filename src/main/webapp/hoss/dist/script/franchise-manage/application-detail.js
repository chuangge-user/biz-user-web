define(function (require) {
    var hoss = require('hoss'),
        webHost = hoss.webHost,
        username = hoss.username,
        usermobile=hoss.usermobile,
        apiHost = hoss.apiHost;

    require(['jquery', 'datepicker', 'dist/script/bootstrap-select']);

    var $ = require('jquery');
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var navigation = require('navigation');
    var dateExtend = require('date-extend');
    var template = require('template');
    var pagination = require('pagination');
    var confirmation = require('bootstrap/confirmation');
    var systemMessage = require('system-message');
    var fileupload = require('fileupload');
    var getQueryString = require('get-query-string');
    var expendMan = require('script/franchise-manage/expend-man');
    var _download = apiHost + '/kbd/common/downloadByKey.do?mKey=';

    //全局保存已经选择的渠道
    var select_channel_ids = '';

    function domReady() {
        var id = getQueryString('id');
        if (!id) {
            systemMessage('参数错误！');
            return false;
        }
        var $addForm = $('#updateForm');
        expendMan.bind($('#expand_man'));
        $addForm.on('submit', function (event) {

            if($("#gatherStatus1").is(':checked')){
                $('input[name="gatherStatus"]').val(1)
            }
            if($("#gatherStatus2").is(':checked')){
                $('input[name="gatherStatus"]').val(2)
            }
            if ($('input[name="gatherStatus"]').val() == '2') {
                if($('#reason').val()==""){
                    systemMessage('请填写无效原因')
                    return ;
                }

            }
            if ($('input[name="gatherStatus"]').val() == '1') {
                if ($('input[name="expand_man"]').val() == "") {
                    systemMessage('请填选择拓展人员！')
                    return;
                }
            }

            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]')
            if (event) {
                event.preventDefault();
            }
            if ($submit.hasClass('disabled')) {
                return false;
            }
            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + "/hoss/league/apply/dealLeagueToJoin.do",
                data: clearEmptyValue($context),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        systemMessage('修改成功！')
                        location = document.referrer;
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '修改失败！'
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

        //*******查询加盟公司的详情*******//
        $.ajax($.extend({
            url: apiHost + '/hoss/league/apply/searchLeagueCompanyDetailById.do',
            data: {id: id},
            success: function (data) {
                if (data.status == 1) {
                    var _data = data.data;
                    $('label[name="themeName"]').html(_data.name);
                    $('input[name="companyName"]').val(_data.name);//设置隐藏公司名称的值
                    $('label[name="location"]').html(_data.location);
                    $('label[name="cityids"]').html(_data.city_name);
                    $('label[name="province"]').html(_data.province_name);
                    $('label[name="advertiserTel"]').html(_data.c_tel);
                    $('label[name="youbian"]').html(_data.youbian);
                    $('label[name="fax"]').html(_data.fax);
                    $('label[name="c_profile"]').html(_data.c_profile);
                    $('label[name="advertiserLinker"]').html(_data.cuname);
                    $('label[name="job"]').html(_data.job);
                    $('label[name="department"]').html(_data.department);
                    $('label[name="tel"]').html(_data.tel);
                    $('label[name="cellphone"]').html(_data.cellphone);
                    $('input[name="cellphone"]').val(_data.cellphone);//设置隐藏公司名称的值
                    $('label[name="email"]').html(_data.email);
                    $('label[name="qq"]').html(_data.qq);
                    $('label[name="msn"]').html(_data.msn);
                    $('label[name="advantage"]').html(_data.advantage);
                    $('input[name="id"]').val(_data.id);
                    $('label[name="market"]').html(_data.market);
                } else {
                    systemMessage('获取投放详情失败！');
                    return false;
                }
            },
            error: function () {
                systemMessage('获取投放详情失败！');
                return false;
            }
        }, jsonp));

        // 单选框， 选择无效要 show 无效原因
        var $failReason = $('#failReason').hide();
        $('input[name="status"]').click(function(e){
            var $target = $(e.currentTarget);
            if ($target.val() == '2') {
                $failReason.show();
                //可能是 先点击有效信息之后 有点击无效信息 ，清空拓展人员
                $('input[name="expand_man"]').val("");
            } else {
                $failReason.hide();
                //可能是 先点击无效信息之后 有点击有效信息 ，清空无效理由
                $('#reason').val("");
            }
        });

        $('#btnUserForm').click(function(){
            var expand_man = $('#expand_man').val();
            $addForm.find('[name="expand_man"]').val(expand_man);
            if (!expand_man) {
                systemMessage('请选择拓展专员')
                return ;
            }

            $addForm.submit();
            $('#expand-man-modal').modal('hide');
        });

    }

$(document).ready(domReady);
});
