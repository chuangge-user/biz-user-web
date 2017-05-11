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

    var fileupload = require('fileupload');

    var dateStr = require('date-extend');

    var queryString = require('get-query-string');

    var expendMan = require('script/franchise-manage/expend-man');

    var areaPicker = require('area-picker');
    var $province = $('#province'),
        $city = $('#city');


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



        var id = queryString('id');
        if (!id) {
            systemMessage('参数错误！');
            return false;
        }

        var $addForm = $('#addForm'),
            addCode = '/hoss/league/apply/partnerToAddCompany.do';


        var $searchForm = $('#updateForm'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate',
            queryListCode = '/hoss/league/apply/searchLeaguePartnerDetailById.do',
            $tabType = $('#tabType')

            $searchForm.find('[result-target]').click(function(e){ // 切换 Tab 事件
            var resultTarget = $(e.currentTarget).attr('result-target');
            $tabType.val(resultTarget);
            $searchForm.submit();
            });

        // 获取直客专员管理列表
        $searchForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]'),
                tabType = $tabType.val(),
                $searchResultList = $('#' + tabType)
            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');


                $.ajax($.extend({
                    url: apiHost + "/hoss/league/apply/updateLeagueCompanyDetailById.do",
                    data:clearEmptyValue($context),
                    beforeSend: function () {
                        $submit.attr('disabled', 'disabled');
                    }
                }, jsonpost)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        systemMessage('提交成功！')
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


        $.ajax($.extend({
            url: apiHost + queryListCode,
            data: {id: id}
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    if (data.status == 1) {
                        var _data = data.data;
                        $('input[name="name"]').val(_data.name);
                        $('input[name="location"]').val(_data.location);
                        // $('label[name="cityids"]').val(_data.city_name);
                        $('input[name="c_tel"]').val(_data.c_tel);
                        $('input[name="youbian"]').val(_data.youbian);
                        $('input[name="fax"]').val(_data.fax);
                        $("#c_profile").val(_data.c_profile);
                        $('input[name="user_name"]').val(_data.user_name);
                        $('input[name="cuname"]').val(_data.cuname);
                        $('input[name="job"]').val(_data.job);
                        $('input[name="department"]').val(_data.department);
                        $('input[name="tel"]').val(_data.tel);
                        $('input[name="cellphone"]').val(_data.cellphone);
                        $('input[name="email"]').val(_data.email);
                        $('input[name="qq"]').val(_data.qq);
                        $('input[name="msn"]').val(_data.msn);
                        $("#advantage").val(_data.advantage);//可正常设值
                        $("#city_assess").val(_data.city_assess);//可正常设值
                        $("#resource_assess").val(_data.resource_assess);//可正常设值
                        $("#strength_assess").val(_data.strength_assess);//可正常设值
                        $("#internet_thinking").val(_data.internet_thinking);//可正常设值
                        $("#company_comprehend").val(_data.company_comprehend);//可正常设值
                        $("#market").val(_data.market);//可正常设值
                        if(!_data.bussiness_license){
                            $('#companyLink').html('');
                        }
                        if(!_data.identity_card){
                            $('#identityLink').html('');
                        }
                        if(!_data.office_environment){
                            $('#picLink').html('');
                        }
                        $('#companyLink').attr('href', apiHost + '/hoss/sys/fileDownload/download.do?id=' + _data.bussiness_license);
                        $('#identityLink').attr('href', apiHost + '/hoss/sys/fileDownload/download.do?id=' + _data.identity_card);
                        $('#picLink').attr('href', apiHost + '/hoss/sys/fileDownload/download.do?id=' + _data.office_environment);
                        $('input[name="bussiness_license"]').val(_data.bussiness_license);
                        $('input[name="identity_card"]').val(_data.identity_card);
                        $('input[name="office_environment"]').val(_data.office_environment);
                        $('input[name="id"]').val(_data.id);//公司的Id
                        var  num=_data.trench_source;
                        //$('#trench_source option[value="1"]').attr("selected","true");
                        $('#trench_source').val(num);
                        if(_data.league_status==0){
                            $("#league_status1").attr("checked",true);
                        }
                        if(_data.league_status==1){
                            $("#league_status2").attr("checked",true);

                        }



                        areaPicker.provinceToCity($province, $city, _data.city_s1, _data.city_s2);

                        expendMan.bind($('#expand_man'), _data.expand_man);

                    } else {
                        systemMessage('获取投放详情失败！');
                        return false;
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
            })


        // 上传图片
        $('label').delegate("input[type!='radio']", 'change', function(e){
            //console.log(jQuery(this));
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

    $(document).ready(domReady);




});