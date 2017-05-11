/**
 * Created by Li Shaohua on 2014/8/20.
 */
define(function (require) {
    var $ = require('jquery');
    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;
    var fileupload = require('fileupload');
    var systemMessage = require('system-message');

    var $tableDom, $fileType, $businessId;

    function initGlobalVar(tableDom, fileType, businessId) {
        $tableDom = tableDom;
        $fileType = fileType;
        $businessId = businessId;
        $tableDom.attr('class', 'box table table-responsive table-bordered');
    }

    function appendFileViewTable(tableDom, fileType, businessId) {
        initGlobalVar(tableDom, fileType, businessId);
        var fileViewHtml = '<tr id="addFileTr">' +
            '<td>' +
            '附件' +
            '</th>' +
            '<th colspan="2"></th>' +
            '</tr>';
        fileViewHtml = fileViewHtml + generateFileListViewHtmlNoDelete();
        $tableDom.html(fileViewHtml);
    }

    function appendFileUploadTable(tableDom, fileType, businessId) {
        initGlobalVar(tableDom, fileType, businessId);
        var fileViewHtml = '';
        if ($businessId) {
            fileViewHtml = generateFileListViewHtml();
        }

        var fileTableHtml =
            '<tr id="addFileTr">' +
            '    <td style="width: 20%;">' +
            '        附件 <button id="addFile" type="button" class="btn btn-xs btn-success">&nbsp;&nbsp;+&nbsp;&nbsp;</button>' +
            '    </td>' +
            '    <th colspan="2"><input id="fileListJson" name="fileListJson" type="hidden"><i style="font-size: 13px;">(上传附件的格式后缀名为txt,doc,docx,xls,xlsx,ppt,pptx,pdf,jpg,jpeg,png,gif,rar,zip)</i></th>' +
            '</tr>' +
            fileViewHtml +
            '<tr>' +
            '    <td>' +
            '        <input type="file" id="attachFile0" name="attachFile" class="btn"/>' +
            '        <input type="hidden"  name="documentId"/>' +
            '        <span></span>' +
            '    </td>' +
            '    <td style="width: 20%">' +
            '        <input type="button"  id="upAttachFile" class="btn btn-submit btn-warning btn-handfile" align="right" value="上传"/>' +
            '    </td>' +
            '    <td><button class="btn btn-xs btn-danger" removeFile="true" >&nbsp;&nbsp;-&nbsp;&nbsp;</button></td>' +
            '</tr>';
        $tableDom.html(fileTableHtml);

    }


    var $fileUploadTable = $('#fileUploadTable');
    var index = 1;
    $fileUploadTable.on('click', '#addFile', function (event) {
        var num =  $("[name='attachFile']").length;
        if(num>=5){
            systemMessage({
                type: 'info',
                title: '提示：',
                detail: '最多可上传5个附件!'
            });
            return;
        }
        var randomId = "attachFile" + index;
        var fileStr = '<tr> ' +
            '<td> <input type="file" id="' + randomId + '" name="attachFile" class="btn"/><input type="hidden" name="documentId"/> <span></span> </td>' +
            '<td> <input type="button"  id="upAttachFile"   class="btn btn-submit btn-warning btn-handfile" align="right"  value="上传"/> </td>' +
            '<td> <button class="btn btn-xs btn-danger" removeFile="true" >&nbsp;&nbsp;-&nbsp;&nbsp;</button></td>' +
            '</tr>';
        $(fileStr).appendTo($("#fileUploadTable"));
        index++;
    });

    $fileUploadTable.on('click', '[removeFile="true"]', removeFeeInfo);

    var workflowProp = require('script/approval/workflow-properties');
    var isEmpty = workflowProp.isEmpty;

    function removeFeeInfo() {
        if ($(this).parents('tr').find("input[name='documentId']")) {
            var documentId = $(this).parents('tr').find("input[name='documentId']").val();//文件id
            if (!isEmpty(documentId)) {
                $.ajax($.extend({
                    url: apiHost + '/hoss/sys/fileDelete/deleteDocument.do?id=' + documentId
                }, jsonp))
                    .done(function (data) {

                    });
                $(this).parents("tr").remove();
                var fileJson = generateFileJsonStr();
                $('#fileListJson').val(fileJson);
            }
        }
        $(this).parents("tr").remove();
    }

    /**
     * 读取附件列表
     * @params businessType 业务类型  businessId 业务id
     * 警告：同步请求、慎用
     */
    function getFileList(businessType, businessId) {
        var result = undefined;
        var paramsStr = '?businessType=' + businessType + '&businessId=' + businessId;
        $.ajax($.extend({
            url: apiHost + '/hoss/file/fileUtil/getFileList.do' + paramsStr,
            async: false
        }, jsonp))
            .done(function (data) {
                result = data.data.content;
            });
        return result;
    }

    $fileUploadTable.on('click', '.btn-handfile', function (event) {
        var $that = $(this);
        var $attachFile = $(this).parents('tr').find("input[type=file]");
        if(!$attachFile.val()) {
            systemMessage({
                type: 'info',
                title: '提示：',
                detail: '请选择附件！'
            });
            return;
        }
        var fileId = $attachFile.attr("id"),//文件选择框的id名称
            fileName = "attachFile",
            businessId = $businessId,//记录Id
            objType = $fileType,//场景类型(费用申请单)
            docType = "3";//文档类型 暂时没用（不同字段才需要）

        var paramsStr = "?fileId=" + fileName + "&objType=" + objType + "&docType=" + docType;
        if (businessId) {
            paramsStr = paramsStr + "&objId=" + businessId;
        }
        fileupload.ajaxFileUpload({
            url: apiHost + "/hoss/file/fileUtil/uploadFile.do" + paramsStr,              //需要链接到服务器地址
            secureuri: false,
            fileElementId: fileId,
            fileType:['txt','doc','docx','xls','xlsx','ppt','pptx','pdf','jpg','jpeg','png','gif','rar','zip'],
            fileSize:10*1000,//不能超过10M
            dataType: 'json',  //服务器返回的格式类型
            success: function (data) {//成功
                var result = eval("(" + data + ")");//解析返回的json
                if (result.status === '1') {
                    $that.hide();//隐藏上传按钮
                    $that.parents('tr').find("input[type=file]").hide();
                    $that.parents('tr').find("input[name='documentId']").val(result.data.id);
                    $that.parents('tr').find("span").html(result.data.name);
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '上传成功！'
                    });
                    var fileJson = generateFileJsonStr();
                    $('#fileListJson').val(fileJson);
                } else {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '上传失败！'
                    });

                }
            },
            error: function (data, e) //异常
            {
                systemMessage("出错了，请重新上传！");
            }
        });


    });

    function getFileIdList() {
        var fileIdList = $('[name=documentId]');
        var fileIdArr = new Array();
        fileIdList.each(function (i, item) {
            var fileId = $(item).val();
            if(fileId) {
                fileIdArr.push(fileId);
            }
        });
        return fileIdArr;
    }

    function generateFileJsonStr() {
        var fileIdArr = getFileIdList();
        return JSON.stringify(fileIdArr);
    }

    function generateFileListViewHtml() {
        var fileViewHtml = '';
        var fileListResult = getFileList($fileType, $businessId);
        if (fileListResult) {
            $.each(fileListResult, function (i, item) {
                var url = apiHost + "/hoss/sys/fileDownload/download.do?id=" + item.id;
                var fileStr = "<a href='" + url + "'>" + item.name + "</a>";

                var fileStr = '<tr> ' +
                    '<td>' + fileStr + ' <input type="hidden" name="documentId" value="' + item.id + '" /> <span></span> </td>' +
                    '<td></td>' +
                    '<td> <button class="btn btn-xs btn-danger" removeFile="true" >&nbsp;&nbsp;-&nbsp;&nbsp;</button></td>' +
                    '</tr>';
                fileViewHtml = fileViewHtml + fileStr;
            });
        }
        return fileViewHtml;
    }

    function generateFileListViewHtmlNoDelete() {
        var fileViewHtml = '';
        var fileListResult = getFileList($fileType, $businessId);
        if (fileListResult) {
            $.each(fileListResult, function (i, item) {
                var url = apiHost + "/hoss/sys/fileDownload/download.do?id=" + item.id;
                if(fileViewHtml != ''){
                    fileViewHtml += "&nbsp;&nbsp; | &nbsp;&nbsp;";
                }
                fileViewHtml += "<a href='"+url+"'>"+item.name+"</a>";
            });
        }
        return '<tr><td>' + fileViewHtml + '</td><td colspan="2"></td></tr>';
    }

    function uploadFileIsRequired(msg) {
        if(!msg) {
            msg = "请上传附件";
        }
        var fileIdArr = getFileIdList();
        if(!fileIdArr.length) {
            systemMessage({
                type: 'error',
                title: '提示：',
                detail: msg + "!"
            });
            return false;
        } else {
            return true;
        }
    }


    return {
        appendFileUploadTable: appendFileUploadTable,
        appendFileViewTable: appendFileViewTable,
        uploadFileRequiredValidate: uploadFileIsRequired,
        getFileList:getFileList
    };
});