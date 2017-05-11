define(function (require) {
    var hoss = require('hoss'),
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

    var queryString = require('script/get-query-string');
    var id = queryString('id'),
        putDown = queryString('putDown')

    function domReady() {
        // 投诉处理 两个按钮
        $('#setDownBtn,#waitBtn').click(function(e){
            $('#operationModal').modal();

            $('#dealResult').val($(e.currentTarget).attr('action'));
            $('#id').val(id);
        });

        loadInfo(id);

        $('#addForm').on('submit', dealComplain)

        //  已下架隐藏
        if (putDown) {
            $('input[action]').hide();
        }

    }

    // 处理信息
    function dealComplain(event) {
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
            url: apiHost + '/hoss/partnerComplaint/submitDeal.do',
            data: clearEmptyValue($context),
            beforeSend: function () {
                $submit.attr('disabled', 'disabled');
            }
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    location = document.referrer;
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
                failCallback.call(this, jqXHR, '处理失败！');
            }).
            always(function () {
                $disabled.attr('disabled', 'disabled');
                $submit.removeAttr('disabled').blur();
            });
    }

    // 加载信息
    function loadInfo(id) {
        $.ajax($.extend({
            url: apiHost + '/hoss/partnerComplaint/getComplaintHouseInfo.do',
            data: {
                id:id
            },
            beforeSend: function () {
            }
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

//                    console.dir(dataObj);
                    $('#complainList').html( // 填充投诉人列表
                        template('complainListTemplate', data)
                    );

                    $('#houseBaseInfoVo').html( // 填充基本信息
                        template('houseBaseInfoVoTemplate', data)
                    );

                    $('#ownerInfo').html( // 业主信息
                        template('ownerInfoTemplate', data)
                    );

                    $('#complainedDealResultVoList').html( // 处理结果
                        template('complainedDealResultVoListTemplate', data)
                    );


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
                failCallback.call(this, jqXHR, '加载详情失败！');
            })
    }


    $(domReady);
});


