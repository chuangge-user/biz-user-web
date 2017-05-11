define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    //  require('datepicker');
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
    require('script/validate');
//    var datepicker = require('datepicker');

    var areaPicker = require('area-picker');
    var $province = $('#province'),
        $city = $('#city');
    areaPicker.provinceToCity($province, $city);

    var fileOperationUtil = require('script/file-operation-util');

    var modal = require('bootstrap/modal');


    var autocomplete = require('autocomplete');
    $("#autocomplete-ajax").autocomplete(
        {paramName: 'housesName',
            dataType: 'jsonp',
            serviceUrl: apiHost + '/hoss/project/common/getHousesByName.do',
            width: 300,
            maxHeight: 400,
            transformResult: function (response, originalQuery) {
                return {
                    query: originalQuery,
                    suggestions: $.map(response.data.content, function (dataItem) {
                        return {value: dataItem.name + '(' + dataItem.cityName + ')', id: dataItem.id, allDataObj: dataItem};
                    })
                };
            },
            onSelect: function (suggestion) {
                $('#tmp_houses_name').val(suggestion.allDataObj.name + '(' + suggestion.allDataObj.cityName + ')');
                $('#addContent #projectCityName_add').html(suggestion.allDataObj.cityName);
                $('#addContent #houseDeveloperDeveloperName_add').val(suggestion.allDataObj.developerName);

                var projectPosition = suggestion.allDataObj.projectPosition;
                $('#addContent #projectPostion_add').val(projectPosition);
                $('#addContent #poject_cityId_add').val(suggestion.allDataObj.cityId);
                $('#addContent #project_housesId_add').val(suggestion.allDataObj.id);
            }
        }
    );


    function domReady() {
        //查询用户是否负责加盟公司
        checkUserRoleType();
        fileOperationUtil.appendFileUploadTable($('#fileUploadTable'), 'project_expand');
        var messageTemplate = 'messageTemplate';
//        var $searchListContent = $('#searchListContent');
        require(['jquery', 'datepicker', 'date-extend'], function ($, datepicker, dateExtend) {
            $('#projectStartTime input').add($('#opendatetimepicker input')).datepicker({
                autoclose: true,
                language: 'zh-CN',
                dateFormat: 'yy-mm-dd'
            });

            $('#projectEndTime input').add($('#opendatetimepicker input')).datepicker({
                autoclose: true,
                language: 'zh-CN',
                dateFormat: 'yy-mm-dd'
            });

            $('#projectSalesDate input').add($('#opendatetimepicker input')).datepicker({
                autoclose: true,
                language: 'zh-CN',
                dateFormat: 'yy-mm-dd'
            });
            var startTime, endTime;
            $('#projectStartTime input').on('changeDate', function(event) {
                startTime = event.date.valueOf();
                if (endTime && endTime && endTime < startTime) {
                    systemMessage('合作开始日期不能大于合作结束日期！');
                    $(this).val('');
                    startTime = undefined;
                }
            });
            $('#projectEndTime input').on('changeDate', function(event) {
                endTime = event.date.valueOf();
                if (endTime && endTime && endTime < startTime) {
                    systemMessage('合作结束日期不能小于合作开始日期！');
                    $(this).val('');

                }
            });
        });

        var $addForm = $('#addForm');
        $addForm.find('#project_explorer').val(hoss.username);
        $addForm.on('submit', function (event) {
            if (event) {
                event.preventDefault();
            }
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');
            if ($submit.hasClass('disabled')) {
                return false;
            }
            $disabled.removeAttr('disabled');

            var hzType = $('[name="project.saleType"]').val();
            var projectTypesJson = {};
            var proTypeName = null;

            if("DISTRIBUTION" == hzType) {
                proTypeName = $('#purchase_distribution').find('[name="projectTypeList.name"]');
                $.each($('#purchase_group').find('[data-rules]'),function(){
                    $(this).attr("data-rules","{required:false}");
                    if ($(this).attr("name") == "projectTypeList.developerScale") {
                        $(this).attr("data-rules","{required:false,number:false}");
                    }
                });
                $.each($('#purchase_distribution').find('[data-rules]'),function(){
                    $(this).attr("data-rules","{required:true}");
                    if ($(this).attr("name") == "projectTypeList.developerScale") {
                        $(this).attr("data-rules","{required:true,number:true}");
                    }
                });
            }
            if("GROUP_BUY" == hzType) {
                proTypeName = $('#purchase_group').find('[name="projectTypeList.name"]');
                $.each($('#purchase_distribution').find('[data-rules]'),function(){
                    $(this).attr("data-rules","{required:false}");
                    if ($(this).attr("name") == "projectTypeList.developerScale") {
                        $(this).attr("data-rules","{required:false,number:false}");
                    }
                });
                /*$.each($('#purchase_group').find('[data-rules]'),function(){
                    if($(this).attr("data-rules").indexOf("number:true") == -1) {
                        $(this).attr("data-rules","{required:true}");
                    } else {
                        $(this).attr("data-rules","{required:true,number:true,integer:true}");
                    }
                    if ($(this).attr("name") == "projectTypeList.developerScale") {
                        $(this).attr("data-rules","{required:true,number:true}");
                    }
                });*/
            }
            projectTypesJson = generateProjectTypeJsonStr(proTypeName, hzType);
            var devStaffName = $context.find('[name="developerStaffList.staffName"]');
            var devStaffsJson = generateDevStaffJsonStr(devStaffName);
//            var fileListJson = generateFileJsonStr();
//            var paramStr = "?devStaffsJson=" + devStaffsJson + "&projectTypesJson=" + projectTypesJson;
            $addForm.find('[name="devStaffsJson"]').val(devStaffsJson);
            $addForm.find('[name="projectTypesJson"]').val(projectTypesJson);
            $.ajax($.extend({
                url: apiHost + '/hoss/project/expand/expandProject.do',
                // data: $context.serialize(),
                data: clearEmptyValue($context),
                beforeSend: function () {
                    var housesId = $('#project_housesId_add').val();
                    if(!housesId) {
                        alert('系统中没有对应的楼盘');
                        return false;
                    }
                    if($('#tmp_houses_name').val() != $('#autocomplete-ajax').val()) {
                        alert('请选择正确的楼盘信息');
                        return false;
                    }
                    if ($context.isValid()) {
                        var conventionExpenses = $('[name="proContract.conventionExpenses"]').val();
                        if(conventionExpenses && (conventionExpenses.lastIndexOf('.') >= 0 || parseInt(conventionExpenses) < 0)) {
                            alert('开发商约定支出必须为正整数');
                            return false;
                        }
                        var projectName = $context.find('[name="project.title"]').val();
                        if(!confirm('是否确认发起项目：' + projectName + "?")) {
                            return  false;
                        }
                        $submit.attr('disabled', 'disabled');
                        return true;
                    } else {
                        return false;
                    }
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: '创建项目成功！'
                        });
                        $('#addContent').addClass('hide');
                        location.href = document.referrer;
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '创建项目失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);

                }
            );
        });

        $addForm.on('click', '.btn-cancel', function(event) {
            if(confirm("信息将不保存，是否确认取消？")) {
                history.back();
            }
        });

        $addForm.on('change', '[name="projectTypeList.name"]', function(event) {
            var $that = $(this);
            var that = this;
            var $typeNameObjList = $addForm.find('[name="projectTypeList.name"]');
            $typeNameObjList.each(function(i, item) {
                if(item != that) {
                    var tempVal = $(item).val();
                    if(tempVal && $.trim(tempVal) == $.trim($that.val())) {
                        systemMessage('产品名称重复，请重新输入');
                        $that.val('');
                    }
                }
            });
        });

        $addForm.on('click', '#projectTypeAddBtn', function (event) {
            if (event) {
                event.preventDefault();
            }
            var html = '<tr>' +
                '    <td><input type="text" class="form-control-sm input-w4" placeholder="请输入" maxlength="20" data-rules="{required:true}" data-messages="{required:\'产品类型必填\'}"' +
                '               name="projectTypeList.name"></td>' +
                '    <td>' +
                '        <input type="text" class="form-control-sm input-w4" placeholder="请输入" maxlength="10" data-rules="{required:true,number:true}" data-messages="{required:\'团购费必填\',number:\'团购费必须为数字\'}"' +
                '               name="projectTypeList.groupAmount">万享' +
                '        <input type="text" class="form-control-sm input-w5" name="projectTypeList.discountInfo" maxlength="20" data-rules="{required:true}" data-messages="{required:\'优惠信息必填\'}"' +
                '               placeholder="">' +
                '    </td>' +
                '    <td><input type="text" class="form-control-sm input-w5" placeholder="" maxlength="10" data-rules="{required:true,number:true,integer:true}" data-messages="{number:\'套数必须为数字\',number:\'套数必须为数字\',integer:\'套数必须为正整数\'}"' +
                '               name="projectTypeList.groupBuyNum">' +
                '    </td>' +
                '    <td>' +
                '        <button remove="true" class="btn btn-xs btn-danger">-</button>' +
                '    </td>' +
                '</tr>';
//            var html =
//                '<tr> <td> <input type="text" class="form-control-sm input-w4" placeholder="请输入" name="projectTypeList.name"></td> <td> <input type="text" class="form-control-sm input-w4" placeholder="请输入" name="projectTypeList.groupAmount">万享<input type="text" class="form-control-sm input-w5" name="projectTypeList.discountInfo" placeholder=""> </td> <td> <input type="text" class="form-control-sm input-w5" placeholder="" name="projectTypeList.groupBuyNum"> </td> <td> <button class="btn btn-xs btn-danger" remove="true">-</button> </td> </tr>';
            $(html).insertBefore('#addProjectTypeLine');
            return false;
        });

        //分销
        $addForm.on('click', '#projectTypeAddBtn1', function (event) {
            if (event) {
                event.preventDefault();
            }
            var html = '<tr>' +
                '    <td>'+ ($('[name="projectTypeList.developerScale"]').length + 1)+'</td>' +
                '    <td>' +
                '          <input type="text" class="form-control-sm input-w4" placeholder="请输入产品类型" maxlength="100" data-rules="{required:true}" data-messages="{required:\'产品类型必填\'}" name="projectTypeList.name">' +
                '    </td>' +
                '    <td>' +
                '         <input type="text" class="form-control-sm input-w4" placeholder="请输入优惠" maxlength="10" name="projectTypeList.discountInfo">' +
                '    </td>' +
                '    <td>' +
                '        <input type="text" class="form-control-sm input-w5" placeholder="" maxlength="10" data-rules="{number:true}" data-messages="{number:\'套数必须为数字\'}" name="projectTypeList.groupBuyNum">' +
                '    </td>' +
                '    <td>' +
                '       <input type="text" class="form-control-sm input-w4" style="padding: 0px 0px;" placeholder="请输入" maxlength="10" data-rules="{required:true,number:true}" data-messages="{required:\'开发商佣金标准必填\',number:\'开发商佣金标准必须为数字类型\'}" name="projectTypeList.developerScale">' +
                '       <select name="projectTypeList.brokerageType" class="form-control-sm" style="padding: 0px 0px;">' +
                '           <option selected="selected" >佣金类型</option>' +
                '           <option value="1">固定金额(元)</option>' +
                '           <option value="0">房价(%)</option>' +
                '       </select>' +
                '   </td>' +
                '    <td>' +
                '        <button remove="true" class="btn btn-xs btn-danger">-</button>' +
                '    </td>' +
                '</tr>';
            $(html).insertBefore('#addProjectTypeLine1');
            return false;
        });

        $addForm.on('click', '#devStaffAddBtn', function (event) {
            if (event) {
                event.preventDefault();
            }
            var html = '<tr>' +
                '    <td><input type="text" class="form-control-sm input-w15" placeholder="请输入文字" maxlength="30" data-rules="{required:true}" data-messages="{required:\'姓名必填\'}"' +
                '               name="developerStaffList.staffName"></td>' +
                '    <td><input type="text" class="form-control-sm input-w15" placeholder="请输入文字" maxlength="20" data-rules="{required:true}" data-messages="{required:\'职务必填\'}"' +
                '               name="developerStaffList.post"' +
                '               value=""></td>' +
                '    <td><input type="text" class="form-control-sm input-w15" placeholder="请输入文字" maxlength="20" data-rules="{required:true}" data-messages="{required:\'联系方式必填\'}"' +
                '               name="developerStaffList.linkType"></td>' +
                '    <td>' +
                '        <button remove="true" class="btn btn-xs btn-danger">-</button>' +
                '    </td>' +
                '</tr>';
            $(html).insertBefore('#devStaffAddLine');
            return false;
        });

        $addForm.on('click', '[remove="true"]', function (event) {
            if (event) {
                event.preventDefault();
            }
            $(this).parents("tr").remove();
            return false;
        });

        function generateProjectTypeJsonStr(nameList, type) {
            var proTypeArr = new Array();
            nameList.each(function (i, item) {
                var obj = {};
                obj.name = $(item).val();
                if(type == 'GROUP_BUY') {
                    obj.groupAmount = $(item).parents('tr').find('[name="projectTypeList.groupAmount"]').val();
                }
                obj.discountInfo = $(item).parents('tr').find('[name="projectTypeList.discountInfo"]').val();
                obj.groupBuyNum = $(item).parents('tr').find('[name="projectTypeList.groupBuyNum"]').val();
                obj.developerScale = $(item).parents('tr').find('[name="projectTypeList.developerScale"]').val();
                obj.brokerageType = $(item).parents('tr').find('[name="projectTypeList.brokerageType"]').val();
                proTypeArr.push(obj)
            });

            var projectTypesJson = JSON.stringify(proTypeArr);
            return projectTypesJson;
        }

        function generateDevStaffJsonStr(nameList) {
            var devStaffArr = new Array();
            nameList.each(function (i, item) {
                var obj = {};
                obj.staffName = $(item).val();
                obj.post = $(item).parents('tr').find('[name="developerStaffList.post"]').val();
                obj.linkType = $(item).parents('tr').find('[name="developerStaffList.linkType"]').val();
                devStaffArr.push(obj);
            });
            var devStaffsJson = JSON.stringify(devStaffArr);
            return devStaffsJson;
        }

        function generateFileJsonStr() {
            var fileIdList = $('[name=documentId]');
            var fileIdArr = new Array();
            fileIdList.each(function (i, item) {
                var fileId = $(item).val();
                fileIdArr.push(fileId);
            });
            return JSON.stringify(fileIdArr);
        }

        $('[name="project.saleType"]').on("change",
            function(event) {
                if (event) {
                    event.preventDefault();
                }
                if("GROUP_BUY" === $(this).val()) { //团购
                    $('#purchase_group').removeAttr("hidden");
                    if(!$('#purchase_distribution').attr("hidden")) {
                        $('#purchase_distribution').attr("hidden","hidden");
                    }
                }
                if("DISTRIBUTION" === $(this).val()) { //分销
                    $('#purchase_distribution').removeAttr("hidden");
                    if(!$('#purchase_group').attr("hidden")) {
                        $('#purchase_group').attr("hidden","hidden");
                    }
                }

            }
        );


        // 公司类型改进
        var $leagueType = $('#leagueType'),
            $leagueCompany = $('#league_company'),
            $leagueCompanyName = $('#leagueCompanyName').hide(),
            $leagueCompanyModal = $('#leagueCompanyModal'),
            $leagueCompanyId = $('#leagueCompanyId'),
            $selectBtn = $('#selectBtn');

        $leagueType.change(function(){ // 直营，加盟 切换
            $leagueCompany.hide();
            $leagueCompanyName.hide();

            if($leagueType.val() === '0') {
                $leagueCompany.show();
            } else {
                $leagueCompanyName.show();
            }
        });

        // 加盟公司列表 Modal 事件
        $leagueCompanyName.click(function(){
            $leagueCompanyModal.modal();
            $searchForm.submit();
        });

        $selectBtn.click(function(){ // 选择加盟公司事件
            var $companyNode = $searchResultList.find('input[type="checkbox"]:checked'),
                companyName = $companyNode.attr('companyName'),
                id = $companyNode.attr('cid');

            if ($companyNode.length === 0) {
                systemMessage('未选中公司！')
                return ;
            } else if($companyNode.length > 1) {
                systemMessage('只能选中一个公司');
                return;
            }
            $leagueCompanyId.val(id);
            $leagueCompanyName.val(companyName);
            $leagueCompanyModal.modal('hide');
        });

        // 查询加盟公司列表
        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate';

        // 加盟公司列表
        $searchForm.on('submit', function(event){
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

            $.ajax($.extend({
                url: apiHost + '/hoss/league/apply/getLeagueCompanyPagesByUserId.do',
                data: clearEmptyValue($context),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {

                    function useful(data) {
                        var dataObj = data.data || {};
                        var templateId = ($.isArray(dataObj.content) &&
                        dataObj.content.length) ?
                            searchResultTemplate : 'messageTemplate';

                        // 显示数据
                        $searchResultList.html(
                            template(templateId, data)
                        );
                        // 显示分页
                        $searchResultPagination.pagination({
                            $form : $context,
                            totalSize: dataObj.totalElements,
                            pageSize: parseInt($pageSize.val()),
                            visiblePages: 5,
                            info: true,
                            paginationInfoClass: 'pagination-count pull-left',
                            paginationClass: 'pagination pull-right',
                            onPageClick: function (event, index) {
                                $pageNum.val(index - 1);
                                $context.trigger('submit');
                            }
                        });
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取列表数据失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取列表数据失败！');
                })
                .always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });
        });

    }

    //根据角色判断当前登录人的权限加载加盟公司信息
    function checkUserRoleType(){
        $.ajax($.extend({
            url: apiHost + '/hoss/league/apply/checkUserRoleType.do',
            data: ''
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};
                    if(dataObj.leagueType == 1){
                        $('#leagueType').attr("disabled",true);
                    }
                    if(dataObj.leagueType == 2){
                        $('#leagueType').find("option[value='1']").attr("selected",true);
                        $('#leagueCompanyId').val(dataObj.leagueCompanyId);
                        $('#leagueCompanyName').val(dataObj.leagueCompanyName).show().attr("disabled",true);
                        $('#league_company').hide();
                        $('#leagueType').attr("disabled",true);
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

            }
        );
    }


    $(document).ready(domReady);


});