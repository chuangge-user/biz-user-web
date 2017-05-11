define(function (require) {
    var hoss = require('hoss'),
        webHost = hoss.webHost,
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
//    var datepicker = require('datepicker');
    require('script/validate');
    var fileupload = require('fileupload');

    var areaPicker = require('area-picker');
    var $province = $('#province'),
        $city = $('#city');
    areaPicker.provinceToCity($province, $city);
    var fileUtil = require('script/file-operation-util');

    var workflowProp = require('script/approval/workflow-properties');
    var getLocationParam = workflowProp.getLocationParam;
    var projectId = getLocationParam('projectId');

    var editPageUrl = apiHost + "/hoss-v2/app/expand/project-status-manage.html";


    var modal = require('bootstrap/modal');

    function domReady() {

        var messageTemplate = 'messageTemplate';
        var $editProjectForm = $('#editProjectForm');

        initProjectData();
        //checkUserRoleType($editProjectForm);

        $editProjectForm.on('submit', function (event) {
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
            var hzType = $('[name="project.saleType"]').val();

            var projectTypesJson = {};
            var proTypeName = $('#editProjectTypeTable').find('[name="projectTypeList.name"]');

            var projectTypesJson = generateProjectTypeJsonStr(proTypeName, hzType);
            var devStaffName = $context.find('[name="developerStaffList.staffName"]');
            var devStaffsJson = generateDevStaffJsonStr(devStaffName);

//            var paramStr = "?devStaffsJson=" + devStaffsJson + "&projectTypesJson=" + projectTypesJson;
            $editProjectForm.find('[name="devStaffsJson"]').val(devStaffsJson);
            $editProjectForm.find('[name="projectTypesJson"]').val(projectTypesJson);

            $.ajax($.extend({
                url: apiHost + '/hoss/project/expand/modifyProject.do',
                data: clearEmptyValue($context),
                //           data: clearEmptyValue($context),
                beforeSend: function () {
                    if ($context.isValid()) {
                        var conventionExpenses = $('[name="proContract.conventionExpenses"]').val();
                        if(conventionExpenses && (conventionExpenses.lastIndexOf('.') >= 0 || parseInt(conventionExpenses) < 0)) {
                            alert('开发商约定支出必须为正整数');
                            return false;
                        }
                        var projectName = $context.find('[name="project.title"]').val();
                        if(!confirm('是否确认修改项目：' + projectName + "?")) {
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
                            detail: '修改项目成功！'
                        });
                        var gobackHref = getLocationParam('gobackHref');
                        if(gobackHref){
                            var hf = gobackHref == "" ? "/app/project/overview.html" : gobackHref;
                            location.href = webHost + hf;
                        }else{
                            location.href = editPageUrl;
                        }
                    }
                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '修改项目失败！'
                        });
                    }
                    doneCallback.call(this, data, useful, useless);

                }
            );
        });

        $editProjectForm.on('click', '.btn-cancel', function(event) {
            if(confirm("信息将不保存，是否确认取消？")) {
                history.back();
            }
        });
        $editProjectForm.on('click', '#projectTypeAddBtn_update', function (event) {
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
                '    <td><input type="text" class="form-control-sm input-w5" placeholder="" maxlength="10" data-rules="{integer:true}" data-messages="{integer:\'套数必须为正整数\'}"' +
                '               name="projectTypeList.groupBuyNum">' +
                '    </td>' +
                '    <td>' +
                '        <button remove="true" class="btn btn-xs btn-danger">-</button>' +
                '    </td>' +
                '</tr>';
            $(html).insertBefore('#addProjectTypeLine_update');
            return false;
        });
        /**
         * 分销
         */
        $editProjectForm.on('click', '#projectTypeAddBtn1', function (event) {
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
                '        <input type="text" class="form-control-sm input-w5" placeholder="" maxlength="10" data-rules="{integer:true}" data-messages="{integer:\'套数必须为正整数\'}" name="projectTypeList.groupBuyNum">' +
                '    </td>' +
                '    <td>' +
                '       <input type="text" class="form-control-sm input-w4" style="padding: 0px 0px;" placeholder="请输入" maxlength="10" data-rules="{required:true,number:true}" data-messages="{required:\'开发商佣金标准\',number:\'开发商佣金标准必须为数字类型\'}" name="projectTypeList.developerScale">' +
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

        $editProjectForm.on('click', '#devStaffAddBtn_update', function (event) {
            if (event) {
                event.preventDefault();
            }
            var html =
                '<tr>' +
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
            $(html).insertBefore('#devStaffAddLine_update');
            return false;
        });

        $editProjectForm.on('click', '[remove="true"]', function (event) {
            if (event) {
                event.preventDefault();
            }
            $(this).parents("tr").remove();
            return false;
        });

        $editProjectForm.on('change', '[name="projectTypeList.name"]', function(event) {
            var $that = $(this);
            var that = this;
            var $typeNameObjList = $editProjectForm.find('[name="projectTypeList.name"]');
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

        function generateProjectTypeJsonStr(nameList, type) {
            var proTypeArr = new Array();
            nameList.each(function (i, item) {
                var obj = {};
                obj.id = $(item).parents('tr').find('[name="projectTypeList.id"]').val();
                obj.name = $(item).val();

                if(type == 'GROUP_BUY') {
                    obj.groupAmount = $(item).parents('tr').find('[name="projectTypeList.groupAmount"]').val();
                }
                obj.discountInfo = $(item).parents('tr').find('[name="projectTypeList.discountInfo"]').val();
                obj.developerScale = $(item).parents('tr').find('[name="projectTypeList.developerScale"]').val();
                obj.groupBuyNum = $(item).parents('tr').find('[name="projectTypeList.groupBuyNum"]').val();
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

        window.editStatus=editStatus;
        function editStatus(id,statusName){
            $.ajax($.extend({
                url: apiHost + '/hoss/project/common/updateProjectTypeByStatus.do?id='+ id+"&statusName="+statusName,
                beforeSend: function () {}
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        if (data.status === '1') {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '修改信息成功！'
                            });
                            location.reload();
                        } else {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '修改信息失败！'
                            });
                        }
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '修改信息失败！'
                        });
                        $('#editAccountModal').modal('hide');
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '修改信息失败！');
                    $('#editAccountModal').modal('hide');
                });
        }

        $editProjectForm.on('change','#leagueType',function(event){// 直营，加盟 切换
            var $leagueType = $editProjectForm.find('#leagueType'),
                $leagueCompany = $editProjectForm.find('#league_company'),
                $leagueCompanyName = $editProjectForm.find('#leagueCompanyName'),
                $leagueCompanyId = $editProjectForm.find('#leagueCompanyId');
            $leagueCompany.hide();
            $leagueCompanyName.hide();

            if($leagueType.val() === '0') {
                $leagueCompany.show();
                $leagueCompanyId.val(0);
            } else {
                $leagueCompanyName.val('');
                $leagueCompanyName.show();
            }
        });
        var $leagueCompanyModal = $('#leagueCompanyModal'),
            $searchForm = $('#searchForm');
        // 加盟公司列表 Modal 事件
        $editProjectForm.on('click','#leagueCompanyName',function(){
            $leagueCompanyModal.modal();
            $searchForm.submit();
        });
        // 公司类型改进
        var $selectBtn = $('#selectBtn');
        $selectBtn.click(function(){ // 选择加盟公司事件
            var $companyNode = $searchResultList.find('input[type="checkbox"]:checked'),
                companyName = $companyNode.attr('companyName'),
                id = $companyNode.attr('cid'),
                $leagueCompanyName = $editProjectForm.find('#leagueCompanyName'),
                $leagueCompanyId = $editProjectForm.find('#leagueCompanyId');

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

    function initProjectData() {
        $.ajax($.extend({
            url: apiHost + '/hoss/project/common/getProjectDto.do',
            data: {
                projectId: projectId
            }
        }, jsonp))
            .done(function (data) {
                function useful(data) {
                    var dataObj = data || {};
                    var templateId = !$.isEmptyObject(dataObj) ? 'editTableTemplate' : 'messageTemplate';
                    // 显示数据
                    $('#editContractTable').find('tbody').html(template(templateId, dataObj.data));
                    if (!$.isEmptyObject(dataObj)) {
                        $('#editProjectTypeTable').html(template('editTableProjectTypeTemplate', dataObj.data));
                        $('#editDevStaffTable').find('tbody').html(template('editTableDevStaffTemplate', dataObj.data));
                        fileUtil.appendFileUploadTable($('#fileUploadTable'), 'project_expand', dataObj.data.project.id);
                    }
                    $("[value='"+dataObj.data.project.saleType+"']").attr("selected",true);
                    $('#editContentOuter').removeClass('hide');
                    if(dataObj.data.project.leagueType == 0){
                        $("#leagueCompanyName").hide();
                    }else{
                        $("#league_company").hide();
                    }
                    var proStartTime = dataObj.data.project.startTime;
                    var regEx = new RegExp("\\-","gi");
                    proStartTime = proStartTime.replace(regEx,"/");
                    var startTime = Date.parse(proStartTime);
                    require(['jquery', 'datepicker', 'date-extend'], function () {
                        $('#projectStartTime_update input').add($('#opendatetimepicker input')).datepicker({
                            autoclose: true,
                            language: 'zh-CN',
                            dateFormat: 'yy-mm-dd'
                        });
                        $('#projectEndTime_update input').add($('#opendatetimepicker input')).datepicker({
                            autoclose: true,
                            language: 'zh-CN',
                            dateFormat: 'yy-mm-dd'
                        });
                        $('#pojectSalesDate_update input').add($('#opendatetimepicker input')).datepicker({
                            autoclose: true,
                            language: 'zh-CN',
                            dateFormat: 'yy-mm-dd'
                        });
                        $('#projectEndTime_update input').on('changeDate', function(event) {
                            var endTime = event.date.valueOf();
                            if (endTime && endTime && endTime < startTime) {
                                systemMessage('合作结束日期不能小于合作开始日期！');
                                $(this).val('');
                            }
                        });
                    });
                    checkUserRoleType();
                }
                function useless(data) {
                    systemMessage(data.detail || '查看失败！');
                }
                doneCallback.call(this, data, useful, useless);
            })
            .fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '查看失败！');
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
                    var $leagueType = $('#leagueType'),
                        $leagueCompany = $('#league_company'),
                        $leagueCompanyName = $('#leagueCompanyName'),
                        $leagueCompanyId = $('#leagueCompanyId');
                    if(dataObj.leagueType == 1){
                        $leagueType.attr("disabled",true);
                    }
                    if(dataObj.leagueType == 2){
                        $leagueType.find("option[value='1']").attr("selected",true);
                        $leagueCompanyId.val(dataObj.leagueCompanyId);
                        $leagueCompanyName.val(dataObj.leagueCompanyName).show().attr("disabled",true);
                        $leagueCompany.hide();
                        $leagueType.attr("disabled",true);
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