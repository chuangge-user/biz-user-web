/**
 * 中介客户详情
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


    var queryString = require('get-query-string');

    function domReady() {
        var id = queryString('id');
        if (!id) {
            systemMessage('参数错误！');
            return false;
        }
        $('#applyContract').click(function(){
            if( $('label[name="internet_thinking"]').html()==""){
                systemMessage('资料不完善，请在编辑中完善资料');
                return false;
            }

        });


        $.ajax($.extend({
                url: apiHost + '/hoss/league/apply/searchLeaguePartnerDetailById.do',
                data: {id: id}
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        if (data.status == 1) {
                            var _data = data.data;
                            $('label[name="themeName"]').html(_data.name);
                            $('label[name="location"]').html(_data.location);
                            $('label[name="cityids"]').html(_data.city_name);
                            $('label[name="province"]').html(_data.province_name);
                            $('label[name="advertiserTel"]').html(_data.c_tel);
                            $('label[name="youbian"]').html(_data.youbian);
                            $('label[name="fax"]').html(_data.fax);
                            $('label[name="c_profile"]').html(_data.c_profile);
                            $('label[name="user_name"]').html(_data.user_name);
                            if(_data.trench_source==0){
                                $('label[name="trench_source"]').html("加盟网站");
                            }
                            else if(_data.trench_source==1){
                                $('label[name="trench_source"]').html("微信");
                            }
                            else if(_data.trench_source==2){
                                $('label[name="trench_source"]').html("招商会议");
                            }
                            else if(_data.trench_source==3){
                                $('label[name="trench_source"]').html("线下");
                            }
                            else{
                                $('label[name="trench_source"]').html("其他类型");
                            }
                            $('label[name="advertiserLinker"]').html(_data.cuname);
                            $('label[name="job"]').html(_data.job);
                            $('label[name="department"]').html(_data.department);
                            $('label[name="tel"]').html(_data.tel);
                            $('label[name="cellphone"]').html(_data.cellphone);
                            $('label[name="email"]').html(_data.email);
                            $('label[name="qq"]').html(_data.qq);
                            $('label[name="msn"]').html(_data.msn);
                            $('label[name="advantage"]').html(_data.advantage);

                            $('label[name="city_assess"]').html(_data.city_assess);

                            $('label[name="resource_assess"]').html(_data.resource_assess);

                            $('label[name="strength_assess"]').html(_data.strength_assess);

                            $('label[name="internet_thinking"]').html(_data.internet_thinking);

                            $('label[name="company_comprehend"]').html(_data.company_comprehend);

                            $('label[name="market"]').html(_data.market);

                            $('#applyContract').attr("href","../contract/contract-new.html?id="+_data.id);

                            if( _data.bussiness_license){
                                $('#companyLink').attr('href', apiHost + '/hoss/sys/fileDownload/download.do?id=' + _data.bussiness_license);
                            }else{
                                $('#companyLink').click(function () {
                                    $('#companyLink').attr('href', '###');
                                    systemMessage('提示：没有上传该图片，请在编辑中上传');
                                });
                            }

                            if( _data.identity_card){
                                $('#identityLink').attr('href', apiHost + '/hoss/sys/fileDownload/download.do?id=' + _data.identity_card);
                            }else{
                                $('#identityLink').click(function () {
                                    $('#identityLink').attr('href', '###');
                                    systemMessage('提示：没有上传该图片，请在编辑中上传');
                                });
                            }

                            if( _data.office_environment){
                                $('#picLink').attr('href', apiHost + '/hoss/sys/fileDownload/download.do?id=' + _data.office_environment);
                            }else{
                                $('#picLink').click(function () {
                                    $('#picLink').attr('href', '###');
                                    systemMessage('提示：没有上传该图片，请在编辑中上传');
                                });
                            }

                            if (!_data.remarks) {
                                _data.remarks = '#无备注信息#';
                            }
                            $('.remarks').html(_data.remarks);

                            var select_channel_ids = _data.channelIds;
                            //判断是否已经选择了
                            if ($.trim($('.td_select_channel').html()) != '') {
                                //判断是否已经取得了投放渠道
                                if (select_channel_ids) {
                                    //选择
                                    var _select_channel_ids = select_channel_ids.split(',');
                                    if (_select_channel_ids.length > 0) {
                                        for (var i = 0; i < _select_channel_ids.length; i++) {
                                            $("input:checkbox[value=" + _select_channel_ids[i] + "]").attr('checked', 'checked');
                                        }
                                    }
                                }
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


    }

    $(document).ready(domReady);




});