/**
 * 项目日报收款
 */
define(function (require) {
    var hoss = require('hoss'),
        global = hoss.global,
        apiHost = hoss.apiHost;

    var $ = require('jquery');
        require('datepicker');

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
    var areaPicker = require('area-picker');

    var zTree = require('ztree');

    var fileupload = require('fileupload');





    function domReady() {

        $('input[name=startDate]').attr("value", dateStr.getToday());
        var $datepickerGroup = $('#datepicker > input'),
            startDate;
        $datepickerGroup.datepicker({
            autoclose: true,
            language: 'zh-CN',
            dateFormat: 'yy-mm-dd'
        });
        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            $startTime = $searchForm.find('input[name=startTimeStr]'),
            $endTime = $searchForm.find('input[name=endTimeStr]'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate';


        // 读取城市列表
        var cityListTemplate = 'cityListTemplate',
            areaListTemplate = 'areaListTemplate',
            $cityList = $('select[name=cityId]'),
            $areaList = $('select[name=plateId]')
        areaPicker.getCityListByUser(function(data){
            $cityList.html(
                template(cityListTemplate, data)
            ).eq(0).change(function(e){ // 暂时注掉板块查询
//                    var cityId = $(e.currentTarget).val();
//                    if (cityId) {
//                        areaPicker.getPlateListByCityId(cityId, function(data){
//                            $areaList.html(
//                                template(areaListTemplate, data)
//                            );
//                        });
//                    } else {
//                        $areaList.html(
//                            template(areaListTemplate, {data:{content:[]}})
//                        );
//                    }
                });
        });


        // 获取中介列表
        var searchIntermediaryListCode = '/hoss/partner/getIntermediaryList.do';
        $searchForm.on('submit', function (event) {
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
                url: apiHost + searchIntermediaryListCode,
                data: clearEmptyValue($context),
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

                        // 跳转客户列表的， 查询条件填充
                        dataObj.startTime = $startTime.val();
                        dataObj.endTime = $endTime.val();

                        // 显示数据
                        $searchResultList.find('tbody').html(
                            template(templateId, data)
                        );

                        // 编辑事件
                        $searchResultList.find('[modify]').click(modifyClick);
                        // 编辑事件
                        $searchResultList.find('[audit]').click(modifyAuditClick);

                        // 变更创建人
                        $searchResultList.find('[change-button]').click(setAttacheClick);

                        // 显示分页
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



                       // 确认 合作&取消合作
                        $searchResultList.find('span[data-toggle=confirmation]').confirmation({
                            btnOkLabel: '确认',
                            btnCancelLabel: '取消',
                            onShow: function (event, element) {
                                setCooperationStatus.isConfirm = false;
                                $(element).on('click.setCooperationStatus', setCooperationStatus);
                            },
                            onHide: function (event, element) {
                                setCooperationStatus.isConfirm = false;
                                $(element).off('.setCooperationStatus');
                            },
                            onConfirm: function (event, element) {
                                setCooperationStatus.isConfirm = true;
                                $(element).trigger('click.setCooperationStatus');
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
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取列表数据失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        }).trigger('submit');



        // 新建中介
        var $addForm = $('#addForm'),
            addIntermediaryCode = '/hoss/partner/addIntermediaryList.do'

        $addForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('#addButton');



            if (event) {
                event.preventDefault();
            }



            if ($submit.hasClass('disabled')) {
                return false;
            }

            if (!checkAddForm()){
                return;
            }


            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + addIntermediaryCode,
                data: clearEmptyValue($context),
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

                        // 添加成功、重新差一下列表
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '新增中介成功！'
                        });
                        $searchForm.submit();
                        $('.close').click();
                        $addForm[0].reset();

                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '新增中介失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '新增中介失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        });

        function checkAddForm(){
            if(!checkValue($addForm.find('[name=orgName]'))){ // 中介名称
                return false;
            }

            if(!checkValue($addForm.find('[name=cityId]'))){ // 选择城市
                return false;
            }

            if(!checkValue($addForm.find('[name=responserName]'))){ // 中介负责人
                return false;
            }

            if(!checkValue($addForm.find('[name=contactPhone]'))){ // 联系电话
                return false;
            }

            if(!checkValue($addForm.find('[name=name]'))){ // 管理员姓名
                return false;
            }

            if(!checkValue($addForm.find('[name=tel]'))){ // 联系电话
                return false;
            }

            return true;
        }

        function checkValue($node){
            if (!$node.val()){
                systemMessage($node.attr('placeholder'));
                return false;
            }
            return true;
        }


        // 编辑中介
        var $editForm = $('#editForm'),
            editIntermediaryCode = '/hoss/partner/changeIntermediaryList.do',
            getIntermediaryCode = '/hoss/partner/goIntermediaryInfo.do',
            intermediaryId;

        function modifyClick(e){
            var $tr = $(e.currentTarget).parents('tr');
            intermediaryId = $tr.find('[key=id]').val();

            var $editFileTrNext = $('#editFileTr').next();
            while($editFileTrNext.next().length) {
                $editFileTrNext.next().remove();
            }
            if($editFileTrNext){
                $editFileTrNext.remove();
            }



            $editSelected.editing = true; // 是否在编辑

            $.ajax($.extend({
                url: apiHost + getIntermediaryCode,
                data: {intermediaryId:intermediaryId},
                beforeSend: function () {
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};




                        // 设置原始内容
                        $editForm.find('[name=orgName]').val(dataObj.partnerOrganization.orgName);
                        $editForm.find('[name=cityId]').val(dataObj.partnerOrganization.cityId);
                        selectChange();
                        $editForm.find('[name=id]').val(dataObj.partnerOrganization.id);
                        $editForm.find('[name=responserName]').val(dataObj.partnerOrganization.responserName);
                        $editForm.find('[name=contactPhone]').val(dataObj.partnerOrganization.contactPhone);
                        $editForm.find('[name=regions]').val(dataObj.partnerOrganization.regionIds || '');
                        $editSelected.html(dataObj.partnerOrganization.regionNames || '');
                        $editForm.find('[name=mainBusiness]').val(dataObj.partnerOrganization.mainBusiness);
                        $editForm.find('[name=parentBank]').val(dataObj.partnerOrganization.parentBank);
                        $editForm.find('[name=parentCare]').val(dataObj.partnerOrganization.parentCare);
                        if($editForm.find('[isOld=true]').length <= 0){
                            var fileStr = '';
                            $.each(dataObj.documentList || [], function (i, item) {
                                var name = item.name;
                                if (name.length > 20) {
                                    name = name.substr(0, 17) + '...';
                                }
                                fileStr = fileStr + '<tr> ' +
                                    '<th colspan="2"><input type="file" isOld="true"  id="preEditFile0" name="preEditFile" style="display: none;">' +
                                    '<input type="hidden" name="documentIdList" value="' +item.id+'">' +
                                    '<span title="'+item.name+'">' + name + '</span></th>' +
                                    '<th> <button class="btn btn-xs btn-danger" remove="true" >&nbsp;&nbsp;-&nbsp;&nbsp;</button></th>' +
                                    '</tr>';
                            });

                            /*if (!dataObj.documentList.length) {
                                $('#editFile').click();
                            }*/
                            $(fileStr).find("button[remove=true]").click(removeOrg).end().appendTo($("#editOrgTable"));
                        }
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '读取中介失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '读取中介失败！');
                });

        }

        $editForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            if (!checkEditForm()){
                return;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + editIntermediaryCode,
                data: clearEmptyValue($context),
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

                        // 提示成功
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '修改中介信息成功！'
                        });

                        // 重新查询一遍吧
                        $searchForm.submit();
                        // 关闭
                        $('.eidt-intermediary .close').click();

                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '修改中介信息失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '新增中介失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        });
        function checkEditForm(){

            if(!checkValue($editForm.find('[name=orgName]'))){ // 中介名称
                return false;
            }

            if(!checkValue($editForm.find('[name=cityId]'))){ // 选择城市
                return false;
            }

            if(!checkValue($editForm.find('[name=responserName]'))){ // 中介负责人
                return false;
            }

            if(!checkValue($editForm.find('[name=contactPhone]'))){ // 联系电话
                return false;
            }
//            if(!checkValue($editForm.find('[name=regions]'))){ // 覆盖板块  不是必填 修改人：魏小龙
//                return false;
//            }

            return true;
        }

        // 合作取消合作

        var cooperationOrCancelCooperationCode = '/hoss/partner/cooperationOrCancelCooperation.do';

        function setCooperationStatus(e){

            if (!setCooperationStatus.isConfirm) {
                return false;
            }
            setCooperationStatus.isConfirm = false;

            var $that = $(this),
                $tr = $that.parents('tr'),
                id = $tr.find('[key=id]').val(),
                type = $that.attr('type');

            $.ajax($.extend({
                url: apiHost + cooperationOrCancelCooperationCode,
                data: {
                    intermediaryId:id,
                    isCooperationType:type
                },
                beforeSend: function () {

                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                                searchResultTemplate :
                                messageTemplate;

                        // 更新合作状态成功
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '更新合作状态成功！'
                        });

                        $searchForm.submit();
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '更新合作状态失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '更新合作状态成功！');
                }).
                always(function () {

                });
        }


        // 选择板块
        /**获取板块**/

        var $plateTree = $("#storesection"),
            $setRegionsModal = $('.setRegionsModal'),
            $addRegionsLink = $('#addRegionsLink'),
            $editRegionsLink = $('#editRegionsLink'),
            $auditRegionsLink = $('#auditRegionsLink'),
            $addIntermediary = $('.add-intermediary'),
            $eidtIntermediary = $('.eidt-intermediary'),
            $auditIntermediary = $('.audit-intermediary'),
            $addSelected = $('#addSelected'),
            $editSelected = $('#editSelected'),
            $auditSelected = $('#auditSelected'),
            $regions,
            $selected,
            $cityId,
            getTreeCode = '/hoss/partner/setIntermediaryRegionPlate.do',
//            ?intermediaryId=1
            treeNodeClick = function (event, treeId, treeNode) {
                if (!treeNode.id) {
                    return false;
                }

                treeObj.checkNode(treeNode, true, true);
            };

        // 新增和编辑中介 点击选择
        $addRegionsLink.click(getPlate);
        $editRegionsLink.click(getPlate);
        $auditRegionsLink.click(getPlate);

        var treeObj,
            treeSetting = {
                data: {
                    key: {
                        children: 'chlidren',
                        name: 'name'
                    }
                },
                check: {
                    enable: true
                },
                callback: {
                    onClick: treeNodeClick
                }
            };
        function getPlate() {
            if ($addIntermediary.css('display') === 'block') {
                $regions = $addForm.find('[name=regions]');
                $cityId = $addForm.find('[name=cityId]');
                $selected = $addSelected;
                intermediaryId = null; // 新建的时候清空中介ID
            } else if($eidtIntermediary.css('display') === 'block'){
                $regions = $editForm.find('[name=regions]');
                $cityId = $editForm.find('[name=cityId]');
                $selected = $editSelected;
            }else if($auditIntermediary.css('display') === 'block'){
                $regions = $auditForm.find('[name=regions]');
                $cityId = $auditForm.find('[name=cityId]');
                $selected = $auditSelected;
            }



            if ($regions.val() == '' || $editSelected.editing || $auditSelected.editing) { // 确保编辑的时候 会读一次

                $editSelected.editing = false;
                $auditSelected.editing = false;

                if(!$cityId.val()){
                    systemMessage('请先选择城市！');
                    $setRegionsModal.find('.close').click();
                    return;
                }

                // 读取城市树 数据
                $.ajax($.extend({
                    url: apiHost + getTreeCode,
                    data: {
                        intermediaryId:intermediaryId,
                        cityId:$cityId.val()
                    },
                    beforeSend: function () {

                    }
                }, jsonp)).
                    done(function (data) {
                        function useful(data) {
                            var dataObj = data.data || {};

                            var treeAllNodes,
                                currentNode;

                            if (dataObj.regionTree) {
                                treeObj = $.fn.zTree.init(
                                    $plateTree,
                                    treeSetting,
                                    dataObj.regionTree
                                );

                                // treeObj.expandAll(true);
                                // 打开根节点
                                treeObj.expandNode(
                                    treeObj.getNodes()[0],
                                    // treeObj.getNodeByParam('id', -1),
                                    true,
                                    false,
                                    false
                                );

                                treeAllNodes = treeObj.getNodes();
                            }

                            if (treeAllNodes&&dataObj.regionList) {

                                $.each(dataObj.regionList || [], function (i, item) {
                                    if (item.id) {
//                                        currentNode = treeObj.getNodeByParam('id', item.id);
                                        currentNode = treeObj.getNodesByFilter(filter, true);
                                        treeObj.checkNode(
                                            currentNode,
                                            true,
                                            true
                                        );
                                    }

                                    function filter(node){
                                        return node.id === item.id &&
                                            node.type === item.type;
                                    }
                                });

                            }

                        }

                        function useless(data) {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '获取板块树失败！'
                            });
                        }

                        doneCallback.call(this, data, useful, useless);
                    })

            }
        }


        // 选完板块点击确定
        $('#setRegionsButton').click(function(){
            var selectedResult = getSelectedNodes(treeObj.getNodes());
            $regions.val(
                selectedResult.idAndType.join(',')
            );
            $selected.html(selectedResult.names.join(','));
            $setRegionsModal.find('.close').click();
        });

        // 筛选选中的节点列表
        function getSelectedNodes (treeAllNodes) {
            var selectedNodes  = {idAndType:[], names:[]},
                recursion = function (tree) {
                    var i = 0,
                        il = tree.length,
                        item,
                        status;

                    for (; i < il; i += 1) {

                        item = tree[i];
                        status = item.getCheckStatus();

                        if (status.checked) {
                            if (!status.half) {
                                selectedNodes.idAndType.push(item.id + '_' + item.type);
                                selectedNodes.names.push(item.name);
                            } else if (item.chlidren && status.half) {
                                recursion(item.chlidren);
                            }
                        }

                    }
                };

            recursion(treeAllNodes);

            return selectedNodes;
        }



        // 检查是否选择城市
        $('[data-target=".add-intermediary"]').click(function(){

            $addForm[0].reset();
            selectChange();
        });

        $cityList.change(selectChange);
        function selectChange(){
            $regions&&$regions.val('');
            checkCityId($addRegionsLink);
            checkCityId($editRegionsLink);
            checkCityId($auditRegionsLink);
        }
        function checkCityId($link){
            var $cityId = $link.parents('form').find('[name=cityId]');

            if ($cityId.val()){
                $link.attr('data-toggle','modal');
            } else {
                $link.removeAttr('data-toggle');
            }
        }


        // 读取专员列表
        var $listSelect = $('#listSelect'),
            getAttacheListCode = '/hoss/partner/projectManger/findCitySysUserList.do',
            setAttacheCode = '/hoss/partner/changeMaintenancer.do',
            $setAttacheBtn = $('#setAttache'),
            listTemplate = 'listTemplate',
            cityId,
            orgId;

        function setAttacheClick(e){
            var $target = $(e.currentTarget);

            orgId = $target.parent().find('[key=id]').val();
            cityId = $target.attr('cityId');
            getAttacheList();
        }

        // 专员列表
        function getAttacheList() {
            $.ajax($.extend({
                url: apiHost + getAttacheListCode,
                data: {
                    cityId:cityId
                },
                beforeSend: function () {

                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        // 中介专员数据
                        $listSelect.html(
                            template(listTemplate, data)
                        );

                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取专员列表失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取专员列表失败！');
                }).
                always(function () {


                });
        }




        // 指定专员
        $setAttacheBtn.click(function(){

            // 请选择
            if (!$listSelect.val()){
                systemMessage('请选择一个专员！');
                return;
            }

            $.ajax($.extend({
                url: apiHost + setAttacheCode,
                data: {
                    orgId:orgId,
                    authUserId:$listSelect.val()
                },
                beforeSend: function () {

                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {

                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '指定专员成功！'
                        });

                        // 可能还需要其他操作
                        $('.close').click();
                        $searchForm.submit();
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
        });

        /*新增中介文件上传*/
        var index = 1;
        $("#addFile").click(function(){
            var num =  $("[name='attachFile']").length;
            if(num>=5){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '最多可上传5个附件!'
                });
                return;
            }
            var randomId = "attachFile"+index;
            var fileStr = '<tr> ' +
                '<th colspan="2"> <input type="file" id="'+randomId+'" name="attachFile"/><input type="hidden" name="documentIdList"/> <span></span> </th>' +
                /*'<th> <input type="button"  id="upAttachFile"   class="btn btn-danger btn-handfile" align="right"  value="上传"/> </th>' +*/
                '<th> <button class="btn btn-xs btn-danger" remove="true" >&nbsp;&nbsp;-&nbsp;&nbsp;</button></th>' +
                '</tr>';

            $(fileStr).find("button[remove=true]").click(removeOrg).end().appendTo($("#addOrgTable"));
            index++;
        });

        /*删除文件*/
        $('button[remove=true]').click(removeOrg);

        function removeOrg(){
            if($(this).parents('tr').find("input[name='documentIdList']")){
                var documentId = $(this).parents('tr').find("input[name='documentIdList']").val();//文件id
                if(!isEmpty(documentId)){
                    $.ajax($.extend({
                        url: apiHost + '/hoss/sys/fileDelete/deleteDocument.do?id='+documentId
                    }, jsonp))
                        .done(function (data) {

                        });
                    $(this).parents("tr").remove();
                }
            }
            $(this).parents("tr").remove();
            $("input[name=amount]").eq(0).trigger("blur");
        }

        /*直接上传，无需点击按钮*/
        var $addForm = $("#addForm");
        $addForm.on ('change',("[type='file']"),function(){
            var $that = $(this);
            var $attachFile = $(this).parents('tr').find("input[type=file]");
            var fileId=$attachFile.attr("id"),//文件选择框的id名称
                fileName="attachFile",
                id = 0,//记录Id
                objType ="add_org",//场景类型(费用申请单)
                docType="3";//文档类型 暂时没用（不同字段才需要）

            if ($attachFile.val() == "") {
                systemMessage({
                    type: 'alert',
                    title: '警告！',
                    detail: '请先选择文件！'
                });
                return false;
            }
            fileupload.ajaxFileUpload({
                url: apiHost + "/hoss/file/fileUtil/uploadFile.do?fileId="+fileName+"&objId="+id+"&objType="+objType+"&docType="+docType,              //需要链接到服务器地址
                secureuri:false,
                fileElementId:fileId,
                fileType:['txt','doc','docx','xls','xlsx','ppt','pptx','pdf','jpg','jpeg','png','gif','rar','zip'],
                fileSize:10*1000,//不能超过10M
                dataType: 'json',  //服务器返回的格式类型
                success: function (data) //成功
                {

                    var result =  eval("("+data+")");//解析返回的json

                    if (result.status === '1') {
//                        console.log(result);
                        $("#"+fileId).hide();
                        $("#"+fileId).parents('th').find("input[name='documentIdList']").val(result.data.id);
                        var name = result.data.name;
                        if (name.length > 20) {
                            name = name.substr(0, 17) + '...';
                        }
                        $("#"+fileId).parents('th').find("span").attr('title',result.data.name);
                        $("#"+fileId).parents('th').find("span").html(name);
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '上传成功！'
                        });

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

        function isEmpty(v, allowBlank) {
            return v === null || v === undefined || (($.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
        }

        /*编辑中介文件上传以及修改*/
        var index = 1;
        $("#editFile").click(function(){
            var num =  $("[name='preEditFile']").length;
            if(num>=5){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '最多可上传5个附件!'
                });
                return;
            }
            var randomId = "preEditFile"+index;
            var fileStr = '<tr> ' +
                '<th colspan="2"> <input type="file" id="'+randomId+'" name="preEditFile"/><input type="hidden" name="documentIdList"/> <span></span> </th>' +
                /*'<th> <input type="button"  id="upAttachFile"   class="btn btn-danger btn-handfile" align="right"  value="上传"/> </th>' +*/
                '<th> <button class="btn btn-xs btn-danger" remove="true" >&nbsp;&nbsp;-&nbsp;&nbsp;</button></th>' +
                '</tr>';

            $(fileStr).find("button[remove=true]").click(removeOrg).end().appendTo($("#editOrgTable"));
            index++;
        });

        /*删除文件*/
        $('button[remove=true]').click(removeOrg);

        /*function removeOrg(){
            if($(this).parents('tr').find("input[name='documentIdList']")){
                var documentId = $(this).parents('tr').find("input[name='documentIdList']").val();//文件id
                if(!isEmpty(documentId)){
                    $.ajax($.extend({
                        url: apiHost + '/hoss/sys/fileDelete/deleteDocument.do?id='+documentId
                    }, jsonp))
                        .done(function (data) {

                        });
                    $(this).parents("tr").remove();
                }
            }
            $(this).parents("tr").remove();
            $("input[name=amount]").eq(0).trigger("blur");
        }*/

        /*直接上传，无需点击按钮*/
        var $editForm = $("#editForm");
        $editForm.on ('change',("[type='file']"),function(){
            var $that = $(this);
            var $preEditFile = $(this).parents('tr').find("input[type=file]");
            var fileId=$preEditFile.attr("id"),//文件选择框的id名称
                fileName="preEditFile",
                id = 0,//记录Id
                objType ="add_org",//场景类型(费用申请单)
                docType="3";//文档类型 暂时没用（不同字段才需要）

            if ($preEditFile.val() == "") {
                systemMessage({
                    type: 'alert',
                    title: '警告！',
                    detail: '请先选择文件！'
                });
                return false;
            }
            fileupload.ajaxFileUpload({
                url: apiHost + "/hoss/file/fileUtil/uploadFile.do?fileId="+fileName+"&objId="+id+"&objType="+objType+"&docType="+docType,              //需要链接到服务器地址
                secureuri:false,
                fileElementId:fileId,
                fileType:['txt','doc','docx','xls','xlsx','ppt','pptx','pdf','jpg','jpeg','png','gif','rar','zip'],
                fileSize:10*1000,//不能超过10M
                dataType: 'json',  //服务器返回的格式类型
                success: function (data) //成功
                {

                    var result =  eval("("+data+")");//解析返回的json

                    if (result.status === '1') {
//                        console.log(result);
                        $("#"+fileId).hide();
                        $("#"+fileId).parents('th').find("input[name='documentIdList']").val(result.data.id);
                        var name = result.data.name;
                        if (name.length > 20) {
                            name = name.substr(0, 17) + '...';
                        }
                        $("#"+fileId).parents('th').find("span").attr('title',result.data.name);
                        $("#"+fileId).parents('th').find("span").html(name);
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '上传成功！'
                        });

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


        /*审核中介界面文件上传以及修改*/
        var index = 1;
        $("#auditFile").click(function(){
            var num =  $("[name='preAuditFile']").length;
            if(num>=5){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '最多可上传5个附件!'
                });
                return;
            }
            var randomId = "preAuditFile"+index;
            var fileStr = '<tr> ' +
                '<th colspan="2"> <input type="file" id="'+randomId+'" name="preAuditFile"/><input type="hidden" name="documentIdList"/> <span></span> </th>' +
                /*'<th> <input type="button"  id="upAttachFile"   class="btn btn-danger btn-handfile" align="right"  value="上传"/> </th>' +*/
                '<th> <button class="btn btn-xs btn-danger" remove="true" >&nbsp;&nbsp;-&nbsp;&nbsp;</button></th>' +
                '</tr>';

            $(fileStr).find("button[remove=true]").click(removeOrg).end().appendTo($("#auditOrgTable"));
            index++;
        });

        /*删除文件*/
        $('button[remove=true]').click(removeOrg);

        /*function removeOrg(){
         if($(this).parents('tr').find("input[name='documentIdList']")){
         var documentId = $(this).parents('tr').find("input[name='documentIdList']").val();//文件id
         if(!isEmpty(documentId)){
         $.ajax($.extend({
         url: apiHost + '/hoss/sys/fileDelete/deleteDocument.do?id='+documentId
         }, jsonp))
         .done(function (data) {

         });
         $(this).parents("tr").remove();
         }
         }
         $(this).parents("tr").remove();
         $("input[name=amount]").eq(0).trigger("blur");
         }*/

        /*直接上传，无需点击按钮*/
        var $auditForm = $("#auditForm");
        $auditForm.on ('change',("[type='file']"),function(){
            var $that = $(this);
            var $preAuditFile = $(this).parents('tr').find("input[type=file]");
            var fileId=$preAuditFile.attr("id"),//文件选择框的id名称
                fileName="preAuditFile",
                id = 0,//记录Id
                objType ="add_org",//场景类型(添加编辑审核中介)
                docType="3";//文档类型 暂时没用（不同字段才需要）

            if ($preAuditFile.val() == "") {
                systemMessage({
                    type: 'alert',
                    title: '警告！',
                    detail: '请先选择文件！'
                });
                return false;
            }
            fileupload.ajaxFileUpload({
                url: apiHost + "/hoss/file/fileUtil/uploadFile.do?fileId="+fileName+"&objId="+id+"&objType="+objType+"&docType="+docType,              //需要链接到服务器地址
                secureuri:false,
                fileElementId:fileId,
                fileType:['txt','doc','docx','xls','xlsx','ppt','pptx','pdf','jpg','jpeg','png','gif','rar','zip'],
                fileSize:10*1000,//不能超过10M
                dataType: 'json',  //服务器返回的格式类型
                success: function (data) //成功
                {

                    var result =  eval("("+data+")");//解析返回的json

                    if (result.status === '1') {
//                        console.log(result);
                        $("#"+fileId).hide();
                        $("#"+fileId).parents('th').find("input[name='documentIdList']").val(result.data.id);
                        var name = result.data.name;
                        if (name.length > 20) {
                            name = name.substr(0, 17) + '...';
                        }
                        $("#"+fileId).parents('th').find("span").attr('title',result.data.name);
                        $("#"+fileId).parents('th').find("span").html(name);
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '上传成功！'
                        });

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


        // 中介审核
        var $auditForm = $('#auditForm'),
            auditIntermediaryCode = '/hoss/partner/auditOrganization.do',
            getAuditIntermediaryCode = '/hoss/partner/goIntermediaryInfo.do',
            intermediaryId;

        function modifyAuditClick(e){
            var $tr = $(e.currentTarget).parents('tr');
            intermediaryId = $tr.find('[key=id]').val();

            var $auditFileTrNext = $('#auditFileTr').next();
            while($auditFileTrNext.next().length) {
                $auditFileTrNext.next().remove();
            }
            if($auditFileTrNext){
                $auditFileTrNext.remove();
            }

            $auditSelected.editing = true; // 是否在编辑

            $.ajax($.extend({
                url: apiHost + getAuditIntermediaryCode,
                data: {intermediaryId:intermediaryId},
                beforeSend: function () {
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        // 设置原始内容
                        $auditForm.find('[name=orgName]').val(dataObj.partnerOrganization.orgName);
                        $auditForm.find('[name=cityId]').val(dataObj.partnerOrganization.cityId);
                        selectChange();
                        $auditForm.find('[name=id]').val(dataObj.partnerOrganization.id);
                        $auditForm.find('[name=responserName]').val(dataObj.partnerOrganization.responserName);
                        $auditForm.find('[name=contactPhone]').val(dataObj.partnerOrganization.contactPhone);
                        $auditForm.find('[name=regions]').val(dataObj.partnerOrganization.regionIds || '');
                        $auditSelected.html(dataObj.partnerOrganization.regionNames || '');
                        $auditForm.find('[name=mainBusiness]').val(dataObj.partnerOrganization.mainBusiness);
                        $auditForm.find('[name=parentBank]').val(dataObj.partnerOrganization.parentBank);
                        $auditForm.find('[name=parentCare]').val(dataObj.partnerOrganization.parentCare);
                        if($auditForm.find('[isOld=true]').length <= 0){
                            var fileStr = '';
                            $.each(dataObj.documentList || [], function (i, item) {
                                var name = item.name;
                                if (name.length > 20) {
                                    name = name.substr(0, 17) + '...';
                                }
                                fileStr = fileStr + '<tr> ' +
                                    '<th colspan="2"><input type="file" isOld="true"  id="preEditFile0" name="preEditFile" style="display: none;">' +
                                    '<input type="hidden" name="documentIdList" value="' +item.id+'">' +
                                    '<span title="'+item.name+'">' + name + '</span></th>' +
                                    '<th> <button class="btn btn-xs btn-danger" remove="true" >&nbsp;&nbsp;-&nbsp;&nbsp;</button></th>' +
                                    '</tr>';
                            });

                            /*if (!dataObj.documentList.length) {
                             $('#editFile').click();
                             }*/
                            $(fileStr).find("button[remove=true]").click(removeOrg).end().appendTo($("#auditOrgTable"));
                        }
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '读取中介失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '读取中介失败！');
                });

        }

        $auditForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            if (!checkAuditForm()){
                return;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + auditIntermediaryCode,
                data: clearEmptyValue($context),
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

                        // 提示成功
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '审核中介信息成功！'
                        });

                        // 重新查询一遍吧
                        $searchForm.submit();
                        // 关闭
                        $('.audit-intermediary').modal('hide');

                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '审核中介信息失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '审核中介失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        });
        function checkAuditForm(){

            if(!checkValue($auditForm.find('[name=orgName]'))){ // 中介名称
                return false;
            }

            if(!checkValue($auditForm.find('[name=cityId]'))){ // 选择城市
                return false;
            }

            if(!checkValue($auditForm.find('[name=responserName]'))){ // 中介负责人
                return false;
            }

            if(!checkValue($auditForm.find('[name=contactPhone]'))){ // 联系电话
                return false;
            }
//            if(!checkValue($auditForm.find('[name=regions]'))){ // 覆盖板块  不是必填 修改人：魏小龙
//                return false;
//            }

            return true;
        }

    }

    $(document).ready(domReady);



});
