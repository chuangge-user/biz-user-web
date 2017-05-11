/**
 * 组织架构
 */
define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    require(['jquery', 'datepicker', 'dist/script/bootstrap-select']);
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

    var queryString = require('get-query-string'), // 读取 URL 附加参数
        appendParams = {},
        appendParamsStr;
    $.each({
        TYPE:queryString('TYPE'),
        ORG_ID:queryString('ORG_ID'),
        EMPLOY_ID:queryString('EMPLOY_ID'),
        CORPORATION_STATUS:queryString('CORPORATION_STATUS'),
        EMPLOY_NAME:queryString('EMPLOY_NAME'),
        projectId:queryString('projectId'),
        PROJECT_STATUS:queryString('PROJECT_STATUS'),
        shopId:queryString('shopId')
    }, function(key, value){ // 清理空参
        if (value) {
            appendParams[key] = value;
        }
    });
    appendParamsStr = $.param(appendParams) + '&';
    template.helper('jquery_map', $.map);
    template.helper('map_filter', function(obj){
        return obj.name;
    });

    function domReady() {
        require('script/validate');
        var selectDepartmentID = 0,
            selectParentDepartmentID = 0,
            selectDepartmentName='',
            selectUserID = 0,
            isSelected = false,

            $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),

            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate',
            //接口
            getAgentDepartmentTreePort = '/hoss/sys/agent/getAgentDepartmentTree.do',//部门树
            getAllAgentUserListPort = '/hoss/sys/agent/getAllAgentUserList.do',//员工列表
            getAgentUserPositionListPort = '/hoss/sys/agent/getAgentUserPositionList.do',
            createNewAgentUserPort = '/hoss/sys/agent/createNewAgentUser.do',//添加员工
            modifyAgentUserStatusPort = '/hoss/sys/agent/modifyAgentUserStatus.do',//启用，禁用
            resetAgentUserPasswordPort = '/hoss/sys/agent/resetAgentUserPassword.do',
            findAgentUserPort = '/hoss/sys/agent/findAgentUser.do',
            modifyAgentUserPort = '/hoss/sys/agent/modifyAgentUser.do',//编辑员工
            removeAgentDepartmentPort = '/hoss/sys/agent/removeAgentDepartment.do',//删除部门
            modifyAgentDepartmentPort = '/hoss/sys/agent/modifyAgentDepartment.do',//编辑部门
            createNewAgentDepartmentPort = '/hoss/sys/agent/createNewAgentDepartment.do';//新增部门

        loadDepartmentData();//部门-初始化
        loadUserData();//用户-初始化
        //部门-点击事件
        $("#getAgentDepartmentTree").on('click','.sector-item',function(){
            var o = $(this);
            selectDepartmentID = o.attr('grounID');
            selectParentDepartmentID = o.attr('parentId');
            selectDepartmentName = $.trim(o.text());
            $(".sector-item").removeClass('active');
            o.addClass('active');
            //新增部门-下拉列表-自动
            $("#parentGroup").val(selectParentDepartmentID);
            //编辑部门-自动
            $('#editDepartmentID').find("input[name='name']").val(selectDepartmentName);
            $("#parentGroup-edit").val(selectParentDepartmentID);
            $("#departId").val(selectDepartmentID);
            $pageNum.val(0);
            $searchForm.trigger('submit');
        });
        $("#getAgentDepartmentTree").on('click','#company-name',function(){
            selectDepartmentID = 0;
            selectParentDepartmentID = 0;
            selectDepartmentName = '';
            $(".sector-item").removeClass('active');
            $("#departId").val('');
            $searchForm.trigger('submit');
        });
        //新增部门-按钮
        $('.new-department').on('click',function(){
            $('#newSectorForm').find("input[name='name']").val('');
        });
        //新增部门-提交
        $('#btnSubNewDepartmentForm').bind('click',function(){
            var parentId = $('#parentGroup').val(),
                name = $('#newSectorForm').find("input[name='name']").val(),
                params = {parentId:parentId,name:name};
            if(!name){
                message('部门名称必填！');
                return false;
            }
            loadData(createNewAgentDepartmentPort,params,null,null,function(){
                message('新增部门成功！');
                $('#newDepartmentID').modal('hide');
                loadDepartmentData();
            });
        });
        //是否选中可编辑部门
        $('.edit-department').bind('click',function(){
            if(!selectDepartmentID){
                message('请选择您要编辑的部门！');
                return false;
            }
        })
        //编辑部门-提交
        $('#btnSubEditDepartmentForm').bind('click',function(){
            var id = selectDepartmentID,
                name = $('#editSectorForm').find("input[name='name']").val(),
                parentId = $('#parentGroup-edit').val(),
                params = {parentId:parentId,name:name,id:id};
            if(!name){
                message('部门名称必填！');
                return false;
            }
            loadData(modifyAgentDepartmentPort,params,null,null,function(){
                message('编辑成功！');
                $('#editDepartmentID').modal('hide');
                loadDepartmentData();
                $searchForm.trigger('submit');
            });
        });
        //删除部门
        $('.del-department').bind('click',function(){
            if(!selectDepartmentID){
                message('请选择您要删除的部门！');
                return false;
            }
            var params = {id:selectDepartmentID};
            loadData(removeAgentDepartmentPort,params,null,null,function(){
                message(selectDepartmentName+'删除成功！');
                loadDepartmentData();
                loadUserData();
            });
            selectDepartmentID = 0;
            $('#company-name').trigger('click');
        })
        //添加员工
        $('#btnUserForm').bind('click',function(){
            var form = $('#addUserForm'),
                name = form.find("input[name='name']").val(),
                mobile = form.find("input[name='mobile']").val(),
                departmentId = form.find("#userDepartment").val(),
                positionIds='',
                roleIds='',
                sendPwd = (form.find("input[name='sms']")[0].checked==true)?'Y':'N',
                params='';
            form.find("input[name='userPosition']:checked").each(function(){
                positionIds +=$(this).val()+',';
            });
            positionIds = $.trim(positionIds).substr(0,$.trim(positionIds).length-1);
            form.find("input[name='userPosition']:checked").each(function(){
                roleIds +=$(this).attr('roleId')+',';
            });
            roleIds = $.trim(roleIds).substr(0,$.trim(roleIds).length-1);
            params = 'name='+encodeURIComponent(name)+'&mobile='+mobile+'&departmentId='+departmentId+'&positionIds='+positionIds+'&roleIds='+roleIds+'&sendPwd='+sendPwd;
            if(!$('#userForm').isValid()) {
                return false;
            }
            if(!/^(1)\d{10}$/i.test(mobile)) {
                message('手机输入不正确！');
                return false;
            }
            if(!positionIds) {
                message('职位必填！');
                return false;
            }
            loadData(createNewAgentUserPort,params,null,null,function(){
                $('#userAdd').modal('hide');
                message('会员添加成功！');
                $searchForm.trigger('submit');
            });
        });
        //清空已添加员工信息
        $('#btn-add-user').on('click',function(){
            $('#addUserForm')[0].reset();
        });
        //编辑员工-初始化
        $('#searchResultList').on('click','.item-edit',function(){
            var id = $(this).attr('userID'),
                params = {userId:id},
            selectUserID = id;
            loadData(findAgentUserPort,params,null,null,function(data){
                $('#editUserForm').find("input[name='name']").val(data.data.name);
                $('#editUserForm').find("input[name='mobile']").val(data.data.mobile);
                $('#editUserForm').find("input[name='id']").val(id);
                $('#userEditDepartment').val(data.data.departList[0].id);
                $('#editPositionList').find("input:checkbox").each(function(){
                    this.checked=false;
                });
                $.each(data.data.positionList,function(k,v){
                    $('#editPositionList').find("input[positionId="+v.id+"]")[0].checked = true;
                });
                //设置不可编辑
                if(!!~$.inArray('AGENT_ADMINISTRATOR',$.map(data.data.positionList, function (v) {
                        return v.code;
                    })))
                {
                    $('#editUserForm').find("input[name='name']").attr('disabled','disabled');
                    $('#editUserForm').find("input[name='mobile']").attr('disabled','disabled');
                    $('#editUserForm').find('#userEditDepartment').attr('disabled','disabled');
                }else{
                    $('#editUserForm').find("input[name='name']").removeAttr('disabled');
                    $('#editUserForm').add("input[name='mobile']").removeAttr('disabled');
                    $('#editUserForm').add('#userEditDepartment').removeAttr('disabled');
                }
                $('#editUserForm').find("input,select").removeClass('hoss-form-field-error');
                $('.x-icon-error').remove();
            });
        })
        //编辑员工-提交
        $('#btnUserEditForm').bind('click',function(){
            var form = $('#editUserForm'),
                id = form.find("input[name='id']").val(),
                name = form.find("input[name='name']").val(),
                mobile = form.find("input[name='mobile']").val(),
                departmentId = form.find("#userEditDepartment").val(),
                positionIds='',
                roleIds='',
                sendPwd = (form.find("input[name='sms']")[0].checked==true)?'Y':'N',
                params='';
            form.find("input[name='userPosition']:checked").each(function(){
                positionIds +=$(this).val()+',';
            });
            positionIds = $.trim(positionIds).substr(0,$.trim(positionIds).length-1);
            form.find("input[name='userPosition']:checked").each(function(){
                roleIds +=$(this).attr('roleId')+',';
            });
            roleIds = $.trim(roleIds).substr(0,$.trim(roleIds).length-1);
            params = 'id='+id+'&name='+encodeURIComponent(name)+'&mobile='+mobile+'&departmentId='+departmentId+'&positionIds='+positionIds+'&roleIds='+roleIds+'&sendPwd='+sendPwd;
            if(!$('#editUserForm').isValid()) {
                return false;
            }
            if(!/^(1)\d{10}$/i.test(mobile)) {
                message('手机输入不正确！');
                return false;
            }
            if(!positionIds) {
                message('职位必填！');
                return false;
            }
            loadData(modifyAgentUserPort,params,null,null,function(){
                $('#userEdit').modal('hide');
                message('会员修改成功！');
                $searchForm.trigger('submit');
            });
        });
        //员工启用
        $('#searchResultList').on('click','.item-enable',function(){
            var id = $(this).attr('userID'), params = {userIds:id,disabled:0};
            loadData(modifyAgentUserStatusPort,params,null,null,function(){
                message('用户已启用');
                $searchForm.trigger('submit');
            });
        })
        //员工禁用
        $('#searchResultList').on('click','.item-disable',function(){
            var id = $(this).attr('userID'), params = {userIds:id,disabled:1};
            loadData(modifyAgentUserStatusPort,params,null,null,function(){
                message('用户已禁用');
                $searchForm.trigger('submit');
            });
        })
        //密码重置
        $('#searchResultList').on('click','.item-setPWD',function(){
            var id = $(this).attr('userID'), params = {userId:id};
            loadData(resetAgentUserPasswordPort,params,null,null,function(){
                message('密码已重置');
                $searchForm.trigger('submit');
            });
        })
        //全选
        $('#searchResultList').on('click','#btn-selectAll,.select-all',function(){
            var o = jQuery('.select-item').add('.select-all');
            if(isSelected){
                isSelected = false;
                o.each(function(){
                    this.checked=false;
                })
            }else{
                isSelected = true;
                o.each(function(){
                    this.checked=true;
                })
            }
        });
        //选择禁用
        $('#searchResultList').on('click','#btn-disableAll',function(){
            var o = $('.select-item:checked'),params='',ids='';
            var ids = o.map(function(){
                return $(this).attr('userid');
            }).get().join(',');
            if(!ids){
                message('请选择用户');
                return false;
            }
            params = {userIds:ids,disabled:1};
            loadData(modifyAgentUserStatusPort,params,null,null,function(){
                message('用户已禁用');
                $searchForm.trigger('submit');
                isSelected = false;
            });
        })
        //选择启用
        $('#searchResultList').on('click','#btn-enableAll',function(){
            var o = $('.select-item:checked'),params='',ids='';
            var ids = o.map(function(){
                return $(this).attr('userid');
            }).get().join(',');
            if(!ids){
                message('请选择用户');
                return false;
            }
            params = {userIds:ids,disabled:0};
            loadData(modifyAgentUserStatusPort,params,null,null,function(){
                message('用户已启用');
                $searchForm.trigger('submit');
                isSelected = false;
            });
        });
        // 获取员工列表
        $searchForm.on('submit', function (event) {
            var $context = $(this),
                $submit = $context.find('input[type=submit]');
            if (event) {
                event.preventDefault();
            }
            if ($submit.attr('disabled')) {
                return false;
            }
            $.ajax($.extend({
                url: apiHost + getAllAgentUserListPort,
                data:appendParamsStr + clearEmptyValue($context),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                                searchResultTemplate :
                                messageTemplate;
                        $searchResultList.find('tbody').html(
                            template(templateId, data)
                        ).find('[status]');
                        $searchResultPagination.pagination({
                            $form: $context,
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
                        isSelected = false;
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
                }).
                always(function () {
                    $submit.removeAttr('disabled').blur();
                });
        }).trigger('submit');
        // 调用systemMessage
        function message(m){
            systemMessage({type: 'info', title: '提示：', detail: m, wait:1000, autoHide: true});
        }
        // 加载公用部分
        function loadDepartmentData(){
            loadData(getAgentDepartmentTreePort,null,'getAgentDepartmentTreeTemplate',$('#getAgentDepartmentTree'), function () {
                $('.org-menu').height()>600 && $('.container-fluid').css('min-height',($('.org-menu').height()+40));
            });//部门树
            loadData(getAgentDepartmentTreePort,null,'newParentDepartmentTemplate',$('#parentGroup'));//新增选择部门
            loadData(getAgentDepartmentTreePort,null,'editParentDepartmentTemplate',$('#parentGroup-edit'));//编辑选择部门
            loadData(getAgentDepartmentTreePort,null,'userDepartmentTemplate',$('#userDepartment'));//新增员工选择部门
            loadData(getAgentDepartmentTreePort,null,'userDepartmentTemplate',$('#userEditDepartment'));//编辑员工选择部门
            $('#newSectorForm').find("input[name='name']").val('');
        }
        function loadUserData(){
            loadData(getAgentUserPositionListPort,null,'getAgentUserPositionListTemplate',$('#positionList'));//新增员工角色列表
            loadData(getAgentDepartmentTreePort,null,'userDepartmentTemplate',$('#userDepartment'));//新增员工选择部门
            loadData(getAgentUserPositionListPort,null,'getAgentUserPositionListTemplate',$('#editPositionList'));//编辑员工角色列表
            loadData(getAgentDepartmentTreePort,null,'userDepartmentTemplate',$('#userEditDepartment'));//编辑员工选择部门
        }
        // 加载数据方法
        function loadData(code, params, successTemplate, $searchResultList, callback){
            $.ajax($.extend({
                url: apiHost + code,
                data: params
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = successTemplate;
                        if(successTemplate && $searchResultList){
                            $searchResultList.html(
                                template(templateId, data)
                            );
                        }
                        (!!$.isFunction(callback))&&callback(data);
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
        }
    }
    $(document).ready(domReady);
});