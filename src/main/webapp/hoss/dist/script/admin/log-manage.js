
define(function (require) {

    var $ = require('jquery');
    var navigation = require('navigation');
    var modal = require('bootstrap/modal');

    var systemMessage = require('system-message');

    require(['jquery', 'datepicker', 'date-extend'], function ($, datepicker, dateExtend) {

        var $datepickerGroup = $('#datepicker > input'),
            startDate,
            endDate;

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

    require(['jquery', 'datetimepicker', 'date-extend'], function ($, datetimepicker, dateExtend) {
        var $datepickerGroup = $('#datetimepicker > input');

        $datepickerGroup.datetimepicker({
            autoclose: true,
            minuteStep: 5,
            language: 'zh-CN',
            dateFormat: 'yy-mm-dd'
        }).on('changeDate', function (event) {
//            console.log(event);
        }).prop('placeholder', dateExtend.toString(new Date(), 'yyyy-mm-dd hh:ii'));

    });


});

