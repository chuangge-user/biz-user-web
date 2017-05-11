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
        if (!id) {
            systemMessage('参数错误！');
            return false;
        }


        $.ajax($.extend({
            url: apiHost + '/hoss/league/contract/showContract.do',
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
                        $('label[name="deposit"]').html(_data.content[0].deposit);
                        var issign = _data.content[0].signatory_format;
                        if (issign===0) {
                            $('label[name="signatory_format"]').html("新签");
                        } else {
                            $('label[name="signatory_format"]').html("续签");
                        }
                        $('label[name="contract_period_start"]').html(_data.content[0].contract_period_start);
                        $('label[name="contract_period_end"]').html(_data.content[0].contract_period_end);
                        $('label[name="contract_createtime"]').html(_data.content[0].contract_createtime);
                        $('label[name="archive_time"]').html(_data.content[0].archive_time);
                        $('label[name="deposit"]').html(_data.content[0].deposit);
                        var attachid = _data.content[0].attachment;
                        if (attachid!=0) {
                            var durl = apiHost + "/hoss/sys/fileDownload/download.do?id=" + attachid;
                            $('label[name="attachment"]').html("<a href='"+durl+"'>查看合同附件</a>");
                        }

                      //  $('label[name="contract_period_start"]').html(_data.content[0].contract_period_start);
                       // $('label[name="contract_period_end"]').html(_data.content[0].contract_period_end);
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




        


    }

    $(document).ready(domReady);




});