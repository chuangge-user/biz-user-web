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
    var queryString = require('get-query-string'); // 读取 URL 附加参数
    function domReady() {

        var id = queryString('id');
        var contractId = queryString('contractId');
        if (!id) {
            systemMessage('参数错误！');
            return false;
        }


        $.ajax($.extend({
            url: apiHost + '/hoss/league/contract/showOpen.do',
            data: {id: id,contractId:contractId}
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    if (data.status == 1) {
                        var dataObj = data.data || {};
                        $('#companyName').html(dataObj.name);
                        var location = dataObj.location;
                        if (dataObj.city_name!=undefined) {
                            location = dataObj.city_name+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+location;
                        }
                        if (dataObj.province_name!=undefined) {
                            location = dataObj.province_name+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+location;
                        }
                        $('#location').html(location);
                        $('#contract_period_end').html(dataObj.contract_period_end);
                        $('#userName').html(dataObj.userName);
                        $('#mobile').html(dataObj.mobile);
                        $('input[name="userId"]').val(dataObj.userId);
                        $('input[name="companyId"]').val(dataObj.id);
                        $('input[name="contractId"]').val(dataObj.contractId);
                        $('#modifyLink').attr("href","modify.html?id="+dataObj.id+"&contractId="+dataObj.contractId+"&userId="+dataObj.userId);
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


        require('script/validate');
        //提交
        $("#resetPassword").click(function(event){
            var confirmStr = "重置";
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
                url : apiHost + "/hoss/league/contract/resetPWD.do",
                dataType : 'json',
                data :$("#addForm").serialize(),
                success: function(msg){

                }

            }).done(function (data) {

            }).fail(function (jqXHR, textStatus, errorThrown) {
                var json = eval('(' + jqXHR.responseText+ ')');
                if (json.detail.indexOf("成功") == -1 ) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: json.detail || '重置失败！'
                    });
                } else {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: json.detail || '重置成功！'
                    });
                    //location.href=document.referrer;
                }
                $disabled.attr('disabled', 'disabled');
                $context.removeAttr('disabled').blur();
            });

        });


    }

    $(document).ready(domReady);




});