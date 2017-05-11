require(['jquery', 'datepicker', 'date-extend'], function ($, datepicker, dateExtend) {

    var $datepickerGroup = $('#datepicker > input'),
        startDate,
        endDate;
    var systemMessage = require('system-message');

    $datepickerGroup.datepicker({
        autoclose: true,
        language: 'zh-CN',
        dateFormat: 'yy-mm-dd'
    });

    $datepickerGroup.first().on('changeDate', function (event) {
        startDate = event.date.valueOf();
        $datepickerGroup.last().focus();
    }).prop('placeholder', dateExtend.getPrevMonthToday());

    $datepickerGroup.last().on('changeDate', function (event) {
        endDate = event.date.valueOf();

        if (endDate && startDate && endDate < startDate ) {
            systemMessage('结束时间不能小于开始时间！');
        }
    }).prop('placeholder', dateExtend.getNextMonthToday());

});