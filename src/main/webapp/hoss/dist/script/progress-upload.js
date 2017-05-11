define(function (require) {


    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var xhr = require('xhr'),
        jsonp = xhr.jsonp


    var queryString = require("script/get-query-string"),
        sysMessage = require('system-message');

    function addFile ($file, $target) {
        var random = Math.random().toString().split('.')[1],
            $uploadNode = $(getNodeStr(random)),
            $form = $uploadNode.find('form'),
            $fileBox = $(getFileBoxStr({})),
            $uploadIframe = $fileBox.find('[upload]'),
            $delete = $fileBox.find('a[delete]'),
            $fileName = $fileBox.find('[fileName]'),
            $progress = $fileBox.find('[progress]'),
            $speed = $fileBox.find('[speed]'),
            $lastTime = $fileBox.find('[lastTime]'),
            prevBytes = 0

        $form.append($file);

        $target.append($fileBox);
        $(document.body).append($uploadNode);


//        $uploadNode.find('input[type=file]').click().change(function(){ // $file 从外部获取 不再需要此事件
            var fileNames = $file.val().split(/\\/)
            $form.submit();
            $fileBox.show();
            $fileName.text(fileNames[fileNames.length - 1]);
            $uploadNode.find('[name=showUploadProgress' + random+ ']')[0].src = apiHost + '/uploading/showUploadProgress.do?callback=parent.showUploadProgress' + random + '&interval=250';
//        });


        // 进度回调  计算速度和剩余时间
        window['showUploadProgress' + random] = function (bytesRead, contentLength, pItems) {
            var KB = (bytesRead - prevBytes) * 4  / 1024;
            var lastKB = (contentLength - bytesRead)  / 1024;
            var lastSec = lastKB / KB,
                lastMinutes = parseInt(lastSec / 60),
                lastHours = parseInt(lastMinutes / 60)


            lastSec = lastSec % 60;
            if (lastSec < 10) {
                lastSec = '0' + lastSec;
            }

            if (lastMinutes < 10) {
                lastMinutes = '0' + lastMinutes;
            }

            if (lastHours < 10) {
                lastHours = '0' + lastHours;
            }



            $speed.text(KB.toFixed(2) + 'KB/S');
            $lastTime.text(lastHours + ':' + lastMinutes + ':' + lastSec)
            $progress.css('width', parseInt(bytesRead / contentLength));

        };

        window['uploadComplete' + random] = function(data) {

            var status = '上传完成';
            var mb = ((data.data.size||0) / 1024 / 1024).toFixed(2) + 'M';
            if (data.status == '0') {
                sysMessage(data.detail);
                status = '上传失败!';
                $speed.parent().html('<font color="#c3c3c3">' + mb + '</font>&nbsp;&nbsp;&nbsp;<font color="green">' +
                    status +
                    '</font>');
            }else{
                $speed.parent().html('<font color="#c3c3c3">' + mb + '</font>&nbsp;&nbsp;&nbsp;<font color="green">' +
                    status +
                    '</font>' +
                    '<input type="hidden" name="documentId" value="' + data.data.id + '" />' +
                    '');
                // 设置下载路径
                $fileName.attr('href', apiHost + "/hoss/sys/fileDownload/download.do?id=" + data.data.id)
            }
            $lastTime.hide();

            $uploadNode.remove(); // 删除 form 和 iframe
        };

    }

    function getNodeStr (random) {
        var speed = 250;
        var objStr = '';
        var objId = queryString('businessKey'); //
        if (objId) {
            objStr = '<input type="hidden" name="objId" value="' + objId + '">';
        }

        var nodeStr = '' +
            '<div style="width:0px;height:0px;overflow: hidden;">' +
            '<form  method="post" target="upload_iframe' + random + '" enctype="multipart/form-data" action="' + apiHost + '/uploading/upload.do?callback=parent.uploadComplete' +
            random + '">' +
            '' +
            '<input type="hidden" name="objType" value="cm_apply_contract">' +
            '<input type="hidden" name="docType" value="3">' + objStr +
            '</form>' +
            '<iframe name="showUploadProgress' + random + '"' + '></iframe>' +
            '<iframe name="upload_iframe' + random + '"' + '></iframe>' +
            '</div>'


        return nodeStr;
    }

    /**
     *
     * @param def  { id, name
     * @returns {string}  上传框 html
     */
    function getFileBoxStr(def){
        var obj = $.extend({
            id:'',
            name:''
        }, def);

        var boxStr = '<div class="file-box" cellpadding="10">' +
            '<table style="width: 100%;height: 100%">' +
            '<tr>' +
            '<td><span class="glyphicon glyphicon-file" style="margin-left: 8px;"></span></td>' +
            '<td width="70%"><a href="' + apiHost + "/hoss/sys/fileDownload/download.do?id=" + obj.id + '" fileName>' + obj.name + '</a></td>' +
            '<td><a href="#" delete="' + obj.id + '">删除</a></td>' +
            '</tr>' +
            '<tr>' +
            '<td></td>' +
            '<td>' +
            '<div style="border:1px solid #8FB5FC;width:101px; height: 14px;padding: 0.5px;float: left">' +
            '<div progress style="width:1px;height: 10px;background-color: #89B5E9"></div>' +
            '</div>' +
            '<div speed></div>' +
            '</td>' +
            '<td>' +
            '<span lastTime></span>' +
            '</td>' +
            '</tr>' +
            '</table>' +
            '</div>';

        return boxStr;
    }

    /** 图片上传绑定
     * @param $addFileLink  选择文件按钮
     * @param $box 添加位置
     * @param fileCount 最大数量
     * @param typeList 限制未见类型
     */
    function bindAddFileLink($addFileLink, $box, fileCount, typeList){

        fileCount = fileCount || 5; // 默认最多5个附件
        typeList = typeList || ["txt", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "pdf", "jpg", "jpeg", "png", "gif", "rar", "zip"];
        var $label = $('<label></label>');
        $label.insertAfter($addFileLink).
            append($('<span class="pointer" style="color: #428bca;text-decoration: underline">' + $addFileLink.remove().text() + '</span>')).
            append($('<input type="file" name="file" class="hidden">')).
            delegate('input', 'change', function(){

                var $file = $label.find('input'); // 只要选择就必须移除此 file ， 避免 max 了之后, 删除再选不出发 change
                $label.append($file.clone());

                var val = $file.val().split('.'),
                    fileType = val[val.length - 1];
                // 显示上传的文件类型
                if (!fileType || typeList.indexOf(fileType.toLocaleLowerCase()) == -1) {
                    sysMessage('文件类型错误！');
                    return;
                }

                if ($('.file-box[style]').length >= fileCount) {
                    sysMessage('最多添加 ' + fileCount + ' 个附件！');
                    $file.remove();
                } else {
                    addFile($file, $box); // 执行上传图片
                }

            });

//
//        $addFileLink.click(function(e){
//            e.preventDefault();

//        });

        bindDelete($box);
    }

    // 绑定删除
    function bindDelete($box){
        $box.delegate('a[delete]', 'click', function(e){
            e.preventDefault();
            var $target = $(e.currentTarget),
                documentId = $target.attr('delete'),
                $fileBox = $target.closest('.file-box'),
                $prev = $fileBox.prev() // 可能是 上传未完成时的 iframe 层
            $fileBox.remove();
            if ($prev.length && !$prev.hasClass('file-box')) {
                $prev.remove();
            }


            if (documentId) { // 删除
                $.ajax($.extend({
                    url: apiHost + '/hoss/sys/fileDelete/deleteDocument.do?id=' + documentId
                }, jsonp))
                    .done(function (data) {
                    });
            }

        });
    }


    return {
		addFile:addFile,
        getFileBoxStr:getFileBoxStr,
        bindAddFileLink:bindAddFileLink
	};
});


