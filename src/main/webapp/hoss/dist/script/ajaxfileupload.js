define(function (require) {
    var jQuery = require('jquery'),
        hoss = require('hoss'),
        apiHost = hoss.apiHost,
        $ = jQuery;
    var systemMessage = require('system-message');
    jQuery.extend({
        createUploadIframe: function (id, uri) {
            //create frame
            var frameId = 'jUploadFrame' + id;
            var iframeHtml = '<iframe id="' + frameId + '" name="' + frameId + '" style="position:absolute; top:-9999px; left:-9999px"';
            if (window.ActiveXObject) {
                if (typeof uri == 'boolean') {
                    iframeHtml += ' src="' + 'javascript:false' + '"';

                }
                else if (typeof uri == 'string') {
                    iframeHtml += ' src="' + uri + '"';

                }
            }
            iframeHtml += ' />';
            jQuery(iframeHtml).appendTo(document.body);

            return jQuery('#' + frameId).get(0);
        },
        createUploadForm: function (id, fileElementId, data) {
            //create form
            var formId = 'jUploadForm' + id;
            var fileId = 'jUploadFile' + id;
            var form = jQuery('<form  action="" method="POST" name="' + formId + '" id="' + formId + '" enctype="multipart/form-data"></form>');
            var oldElement = jQuery('#' + fileElementId);
            var newElement = jQuery(oldElement).clone();
            jQuery(oldElement).attr('id', fileId);
            jQuery(oldElement).before(newElement);
            jQuery(oldElement).appendTo(form);

            /*****    增加参数的支持   *****/
            if (data) {
                for (var i in data) {
                    $('<input type="hidden" name="' + i + '" value="' + data[i] + '" />').appendTo(form);
                }
            }

            //set attributes
            jQuery(form).css('position', 'absolute');
            jQuery(form).css('top', '-1200px');
            jQuery(form).css('left', '-1200px');
            jQuery(form).appendTo('body');
            return form;
        },

        ajaxFileUpload: function (s) {
            // TODO introduce global settings, allowing the client to modify them for all requests, not only timeout
            s = jQuery.extend({}, jQuery.ajaxSettings, s);
            var id = new Date().getTime();
            var validateResult = this.validateFileType(s.fileElementId,s.fileType);
            if(!validateResult.success){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: validateResult.msg
                });
                return;
            }
            var validateFileSizeResult = this.validateFileSize(s.fileElementId);
            if(!validateFileSizeResult.success){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: validateFileSizeResult.msg
                });
                return;
            }
            // ADD  s.data
            var form = jQuery.createUploadForm(id, s.fileElementId, s.data);
            var io = jQuery.createUploadIframe(id, s.secureuri);
            var frameId = 'jUploadFrame' + id;
            var formId = 'jUploadForm' + id;
            // Watch for a new set of requests
            if (s.global && !jQuery.active++) {
                jQuery.event.trigger("ajaxStart");
            }
            var requestDone = false;
            // Create the request object
            var xml = {}
            if (s.global)
                jQuery.event.trigger("ajaxSend", [xml, s]);
            // Wait for a response to come back
            var uploadCallback = function (isTimeout) {
                var io = document.getElementById(frameId);
                try {
                    if (io.contentWindow) {
                        xml.responseText = io.contentWindow.document.body ? io.contentWindow.document.body.innerHTML : null;
                        xml.responseXML = io.contentWindow.document.XMLDocument ? io.contentWindow.document.XMLDocument : io.contentWindow.document;

                    } else if (io.contentDocument) {
                        xml.responseText = io.contentDocument.document.body ? io.contentDocument.document.body.innerHTML : null;
                        xml.responseXML = io.contentDocument.document.XMLDocument ? io.contentDocument.document.XMLDocument : io.contentDocument.document;
                    }
                } catch (e) {
                    jQuery.handleError(s, xml, null, e);
                }
                if (xml || isTimeout == "timeout") {
                    requestDone = true;
                    var status;
                    try {
                        status = isTimeout != "timeout" ? "success" : "error";
                        // Make sure that the request was successful or notmodified
                        if (status != "error") {
                            // process the data (runs the xml through httpData regardless of callback)
                            var data = jQuery.uploadHttpData(xml, s.dataType);
                            // If a local callback was specified, fire it and pass it the data
                            if (s.success)
                                s.success(data, status);

                            // Fire the global callback
                            if (s.global)
                                jQuery.event.trigger("ajaxSuccess", [xml, s]);
                        } else
                            jQuery.handleError(s, xml, status);
                    } catch (e) {
                        status = "error";
                        jQuery.handleError(s, xml, status, e);
                    }

                    // The request was completed
                    if (s.global)
                        jQuery.event.trigger("ajaxComplete", [xml, s]);

                    // Handle the global AJAX counter
                    if (s.global && !--jQuery.active)
                        jQuery.event.trigger("ajaxStop");

                    // Process result
                    if (s.complete)
                        s.complete(xml, status);

                    jQuery(io).unbind()

                    setTimeout(function () {
                        try {
                            jQuery(io).remove();
                            jQuery(form).remove();

                        } catch (e) {
                            jQuery.handleError(s, xml, null, e);
                        }

                    }, 100)

                    xml = null

                }
            }
            // Timeout checker
            if (s.timeout > 0) {
                setTimeout(function () {
                    // Check to see if the request is still happening
                    if (!requestDone) uploadCallback("timeout");
                }, s.timeout);
            }
            try {

                var form = jQuery('#' + formId);
                jQuery(form).attr('action', s.url);
                jQuery(form).attr('method', 'POST');
                jQuery(form).attr('target', frameId);
                if (form.encoding) {
                    jQuery(form).attr('encoding', 'multipart/form-data');
                }
                else {
                    jQuery(form).attr('enctype', 'multipart/form-data');
                }
                jQuery(form).submit();

            } catch (e) {
                jQuery.handleError(s, xml, null, e);
            }

            jQuery('#' + frameId).load(uploadCallback);
            return {abort: function () {
            }};

        },

        /** handleError 方法在jquery1.4.2之后移除了，此处重写改方法 **/
        handleError: function (s, xhr, status, e) {
            // If a local callback was specified, fire it
            if (s.error) {
                s.error.call(s.context || s, xhr, status, e);
            }

            // Fire the global callback
            if (s.global) {
                (s.context ? jQuery(s.context) : jQuery.event).trigger("ajaxError", [xhr, s, e]);
            }
        },

        uploadHttpData: function (r, type) {

            //alert("-->" + r.responseText);
            try {
                //debugger;
                var data = !type;
                data = type == "xml" || data ? r.responseXML : r.responseText;
                // If the type is "script", eval it in global context
                if (type == "script") {
                    jQuery.globalEval(data);
                }

                // Get the JavaScript object, if JSON is used.
                if (type == "json") {
                    /*** 如果返回的是字符串(JSON格式字符串)，下面会报错，导致无法走入sucess方法 加上\"  ***/
                        // eval( "data = " + data );
                    eval("data = \" " + data + " \" ");
                }
                // evaluate scripts within html
                if (type == "html") {
                    jQuery("<div>").html(data).evalScripts();
                }
            } catch (e) {
            }
            return data;
        },
        validateFileType:function(fileId,fileType){
            var result = {
                    success:false,
                    msg:'上传文件类型不允许! 附合要求的格式为：'+ fileType
            };
            var target = document.getElementById(fileId);
            var fileName = target.value;
//            console.log(fileName);
            var index = fileName.lastIndexOf(".");
            if($.isArray(fileType)){
                if(index!=-1){
                    var postfix = fileName.substr(index+1).toUpperCase();
                    for(i in fileType){

                        var allowPostfix = fileType[i].toUpperCase();
                        if(postfix==allowPostfix){
                            result.success = true;
                        }
                    }
                }
            }else{
                result.success = true;
            }
            return result;
        },
        //fileSize 以k为单位
        validateFileSize:function(fileId,allowFileSize){
            var result = {
                    success:false,
                    msg:'上传文件大小不能超过'+this.convertSize(allowFileSize)
            };
            if(allowFileSize){

                var isIE = /msie/i.test(navigator.userAgent) && !window.opera;
                var target = document.getElementById(fileId);
                var fileSize = 0;
                if (isIE && !target.files){
                    var filePath = target.value;
                    var fileSystem = new ActiveXObject("Scripting.FileSystemObject");
                    var file = fileSystem.GetFile (filePath);
                    fileSize = file.Size;
                } else {
                    fileSize = target.files[0].size;
                }

                var size = fileSize / 1024*1024;
                if(size<=(1024*allowFileSize)){
                    result.success = true;
                }
            }else{
                result.success = true;
            }
            return result;

        },
        convertSize:function(size){
            if(!size) {
                return '0 KB';
            }
            var sizeNames = [' KB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB'];
            var i = Math.floor(Math.log(size)/Math.log(1024));
            var p = (i > 1) ? 2 : 0;
            return (size/Math.pow(1024, Math.floor(i))).toFixed(p) + sizeNames[i];
        },
        getSrc:function(id){
            return apiHost + '/hoss/sys/fileDownload/download.do?id=' + id;
        }
        ,

        simplePicUpload:function(fileId, callback){
            var fileName = fileId,
                id = '',
                objType = '',
                docType = '1'


            $.ajaxFileUpload({
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

                        if (callback) {
                            callback(result.data);
                        }
//                        $('#uploadImg').attr('src', apiHost + '/hoss/sys/fileDownload/download.do?id=' + result.data.id)
//                        $('#imageId').val(.id);
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
        }
    });


    return $;
});


