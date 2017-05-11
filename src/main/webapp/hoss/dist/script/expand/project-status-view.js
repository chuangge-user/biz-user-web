define(function (require) {
    var hoss = require('hoss'),
        webHost = hoss.webHost,
        apiHost = hoss.apiHost;


    var $ = require('jquery');
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
    var fileUtil = require('script/file-operation-util');

    var areaPicker = require('area-picker');
    var $province = $('#province'),
        $city = $('#city');
    areaPicker.provinceToCity($province, $city);

    var workflowProp = require('script/approval/workflow-properties');
    var getLocationParam = workflowProp.getLocationParam;
    var projectId = getLocationParam('projectId');
    var modal = require('bootstrap/modal');

    function domReady() {
        var messageTemplate = 'messageTemplate';
        initProjectData();
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
                    var templateId = !$.isEmptyObject(dataObj) ? 'viewTableTemplate' : 'messageTemplate';
                    if (!$.isEmptyObject(dataObj)) {
                        var resultData = dataObj.data;
                        // 显示数据
                        $('#viewContractTable').find('tbody').html(template('viewTableTemplate', resultData));
                        $('#viewProjectTypeTable').html(template('viewTableProjectTypeTemplate', resultData));
                        $('#viewDevStaffTable').find('tbody').html(template('viewTableDevStaffTemplate', resultData));
                        fileUtil.appendFileViewTable($('#fileViewTable'), 'project_expand', resultData.project.id);
                        $('#viewContractTable').on('click', "#modifyLink", function(event) {
                            var that = $(this);
                            that.attr('href', './project-status-edit.html?projectId=' + projectId + '&gobackHref=' + getLocationParam('gobackHref'));
                        });
                    } else {
                        $('#viewContractTable').find('tbody').html(template('messageTemplate', dataObj.data));
                    }

                    $('.btn-back').on('click', function(event) {
                        var gobackHref = getLocationParam('gobackHref');
                        if(gobackHref)  {
                            location.href = webHost + gobackHref;
                        } else {
                            location.href = document.referrer;
                        }

                    });

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

    $(document).ready(domReady);


});