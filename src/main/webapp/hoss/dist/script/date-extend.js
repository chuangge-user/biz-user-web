define(function () {
    /**
     * 日期扩展
     * @param {String} month [yyyy-mm-dd]
     */
    var dateExtend = {
        now: function () {
            return new Date();
        },
        // 当天
        getToday: function () {
            return this.toString(this.now());
        },
        // 上一个月的当天
        getPrevMonthToday: function () {
            var now = this.now();
            var prevMonthToday = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return this.toString(prevMonthToday);
        },

        // 本月第一天
        getNowMonthDay: function () {
            var now = this.now();
            var nowMonthToday = new Date(now.getFullYear(), now.getMonth(), 1);
            return this.toString(nowMonthToday);
        },

        //本月最后一天
        getLastMonthDay: function () {
            var now = this.now();
            var nextMonth =new Date(now.getFullYear(), now.getMonth() + 1);
            var date = new Date(nextMonth - 86400000);
            return this.toString(date, 'yyyy-mm-dd');
        },

        // 下一个月的当天
        getNextMonthToday: function () {
            var now = this.now();
            var nextMonthToday = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            return this.toString(nextMonthToday);
        },
        // 本周第一天
        getWeekFirstDay: function () {
            var now = this.now();
            var weekFirstDay = new Date(now - (now.getDay() - 1) * 86400000);
            return this.toString(weekFirstDay);
        },
        // 本周最后一天
        getWeekLastDay: function () {
            var now = this.now();
            var weekFirstDay = new Date(now - (now.getDay() - 1) * 86400000);
            var weekLastDay = new Date((weekFirstDay / 1000 + 6 * 86400) * 1000);
            return this.toString(weekLastDay);
        },
        // 当前月
        getMonthCurrent: function () {
            var now = this.now();
            var month = now.getMonth() + 1;
            month = (month < 10) ? '-0' + month : '-' + month;
            return now.getFullYear() + month;
        },
        // 上月第一天
        getPrevMonthFirstDay: function (month) {
            var now = this.now();
            var date = month ? new Date(month.substring(0, 4) * 1, month.substring(5, 7) * 1 - 1) : now;
            var monthFirstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
            return this.toString(monthFirstDay);
        },
        // 上月最后一天
        getPrevMonthLastDay: function (month) {
            var now = this.now();
            var date = month ? new Date(month.substring(0, 4) * 1, month.substring(5, 7) * 1 - 1) : now;
            var tmpDate = new Date(date.getFullYear(), date.getMonth(), 1);
            var monthLastDay = new Date(tmpDate - 86400000);
            return this.toString(monthLastDay);
        },
        // 上月的天数
        getPrevMonthDays: function (month) {
            return this.getPrevMonthLastDay(month).substring(8, 10) * 1;
        },
        // 指定月的第一天
        getMonthFirstDay: function (month) {
            var now = this.now();
            var date = month ? new Date(month.substring(0, 4) * 1, month.substring(5, 7) * 1 - 1) : new Date(now.getFullYear(), now.getMonth(), 1);
            return this.toString(date, 'yyyy-mm-dd');
        },
        // 指定月的最后一天
        getMonthLastDay: function (month) {
            var now = this.now();
            var nextMonth = month ? new Date(month.substring(0, 4) * 1, month.substring(5, 7) * 1) : new Date(now.getFullYear(), now.getMonth() + 1);
            var date = new Date(nextMonth - 86400000);
            return this.toString(date, 'yyyy-mm-dd');
        },
        // 指定月的天数
        getMonthDays: function (month) {
            return this.getMonthLastDay(month).substring(8, 10) * 1;
        },
        // 下月第一天
        getNextMonthFirstDay: function (month) {
            var date = month ? new Date(month.substring(0, 4) * 1, month.substring(5, 7) * 1 - 1) : now;
            var monthFirstDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            return this.toString(monthFirstDay);
        },
        // 下月最后一天
        getNextMonthLastDay: function (month) {
            var now = this.now();
            var tmpDate = new Date(now.getFullYear(), now.getMonth() + 1 + 1, 1);
            var date = month ? new Date(month.substring(0, 4) * 1, month.substring(5, 7) * 1 + 1) : tmpDate;
            date = new Date(date - 86400000);
            return this.toString(date);
        },
        // 下月的天数
        getNextMonthDays: function (month) {
            return this.getNextMonthLastDay(month).substring(8, 10) * 1;
        },
        // 本季第一天
        getQuarterFirstDay: function () {
            var now = this.now();
            var returnDate = null;
            if (now.getMonth() < 3)
                returnDate = new Date(now.getFullYear(), 0, 1);
            else if (now.getMonth() > 2 && now.getMonth() < 6)
                returnDate = new Date(now.getFullYear(), 3, 1);
            else if (now.getMonth() > 5 && now.getMonth() < 9)
                returnDate = new Date(now.getFullYear(), 6, 1);
            else if (now.getMonth() > 8)
                returnDate = new Date(now.getFullYear(), 9, 1);
            return this.toString(returnDate);
        },
        // 本季最后一天
        getQuarterLastDay: function () {
            var now = this.now();
            if (now.getMonth() < 3)
                returnDate = new Date(now.getFullYear(), 2, 31);
            else if (now.getMonth() > 2 && now.getMonth() < 6)
                returnDate = new Date(now.getFullYear(), 5, 30);
            else if (now.getMonth() > 5 && now.getMonth() < 9)
                returnDate = new Date(now.getFullYear(), 8, 30);
            else if (now.getMonth() > 8)
                returnDate = new Date(now.getFullYear(), 11, 31);
            return this.toString(returnDate);
        },
        // 本年第一天
        getFullYearFirstDay: function () {
            var now = this.now();
            var yearFirstDay = new Date(now.getFullYear(), 0, 1);
            return this.toString(yearFirstDay);
        },
        // 本年最后一天
        getFullYearLastDay: function () {
            var now = this.now();
            var yearLastDay = new Date(now.getFullYear(), 11, 31);
            return this.toString(yearLastDay);
        },
        // 本季开始年月
        getQuarterFirstMonth: function () {
            var now = this.now();
            if (now.getMonth() < 3)
                return now.getFullYear() + '-01';
            else if (now.getMonth() > 2 && now.getMonth() < 6)
                return now.getFullYear() + '-04';
            else if (now.getMonth() > 5 && now.getMonth() < 9)
                return now.getFullYear() + '-07';
            else if (now.getMonth() > 8)
                return now.getFullYear() + '-10';
        },
        // 本季最后年月
        getQuarterLastMonth: function () {
            var now = this.now();
            if (now.getMonth() < 3)
                return now.getFullYear() + '-03';
            else if (now.getMonth() > 2 && now.getMonth() < 6)
                return now.getFullYear() + '-06';
            else if (now.getMonth() > 5 && now.getMonth() < 9)
                return now.getFullYear() + '-09';
            else if (now.getMonth() > 8)
                return now.getFullYear() + '-12';
        },
        // 本年开始年月
        getFullYearFirstMonth: function () {
            var now = this.now();
            return now.getFullYear() + '-01';
        },
        // 本年最后年月
        getFullYearLastMonth: function () {
            var now = this.now();
            return now.getFullYear() + '-12';
        },
        getDay: function (date) {
            date = date || this.now();
            if (Object.prototype.toString.call(date) == '[object String]') {
                date = this.toDate(date);
            }
            return date.getDay();
        },
        toString: function (date, formatString) {
            formatString = formatString || 'yyyy-mm-dd';
            if (date) {
                var year, month, day, hour, minute, second, newdate = '';
                if (Object.prototype.toString.call(date) == '[object Date]') {
                    year = date.getFullYear();
                    month = date.getMonth() + 1;
                    if (month * 1 < 10) {
                        month = '0' + month * 1;
                    }
                    day = date.getDate();
                    if (day * 1 < 10) {
                        day = '0' + day * 1;
                    }
                    hour = date.getHours();
                    if (hour * 1 < 10) {
                        hour = '0' + hour * 1;
                    }
                    minute = date.getMinutes();
                    if (minute * 1 < 10) {
                        minute = '0' + minute * 1;
                    }
                    second = date.getSeconds();
                    if (second * 1 < 10) {
                        second = '0' + second * 1;
                    }
                    switch (formatString) {
                        case 'yyyy-mm-dd':
                            newdate = year + '-' + month + '-' + day;
                            break;
                        case 'yyyy-mm-dd hh:ii':
                            newdate = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
                            break;
                        case 'yyyy-mm-dd hh:ii:ss':
                            newdate = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
                            break;
                    }
                    return newdate;
                } else if (Object.prototype.toString.call(date) == '[object String]') {
                    var dateArr = date.split(' ');
                    var a1 = dateArr[0], a2;
                    if (dateArr.length == 1) {
                        a2 = '00:00:00';
                    } else if (dateArr.length == 2) {
                        a2 = dateArr[1];
                    }
                    var arr = a1.split('-');
                    year = arr[0];
                    month = arr[1];
                    if (month * 1 < 10) {
                        month = '0' + month * 1;
                    }
                    day = arr[2];
                    if (day * 1 < 10){
                        day = '0' + day * 1;
                    }
                    arr = a2.split(':');
                    hour = arr[0];
                    if (hour * 1 < 10){
                        hour = '0' + hour * 1;
                    }
                    minute = arr[1];
                    if (minute * 1 < 10){
                        minute = '0' + minute * 1;
                    }
                    second = arr[2];
                    if (second * 1 < 10){
                        second = '0' + second * 1;
                    }
                    switch (formatString) {
                        case 'yyyy-mm-dd':
                            newdate = year + '-' + month + '-' + day;
                            break;
                        case 'yyyy-mm-dd hh:ii':
                            newdate = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
                            break;
                        case 'yyyy-mm-dd hh:ii:ss':
                            newdate = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
                            break;
                    }
                    return newdate;
                }
            }
            return null;
        },
        toDate: function (date) {
            var dateArr = date.split(' ');
            var a1 = dateArr[0], a2;

            if (dateArr.length == 1) {
                a2 = '00:00:00';
            } else if (dateArr.length == 2) {
                a2 = dateArr[1];
            }
            var arr = a1.split('-'),
                year = arr[0],
                month = arr[1],
                day = arr[2],

            arr = a2.split(':');
            var hour = arr[0],
                minute = arr[1],
                second = arr[2];

            return new Date(year, month - 1, day, hour, minute, second);
        }
    };



    return dateExtend;
});