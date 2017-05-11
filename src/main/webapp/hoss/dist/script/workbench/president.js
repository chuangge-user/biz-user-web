define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    var navigation = require('navigation');
    var getQueryString = require('script/get-query-string');

    var xhr = require('xhr'),
        systemMessage = require('system-message'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');
    template.helper('apiHost', apiHost);
    template.helper('encodeURI', encodeURI);
    var dropdown = require('bootstrap/dropdown');
    var echarts = require('echarts/echarts');
    var config = require('echarts/config');
    var map = require('echarts/chart/map');


    var cityInfo = getQueryString("cityInfo");
    var cityInfoStr = getQueryString("cityInfoStr");
    var timeInfoStr = getQueryString("timeInfoStr");
    var selfUrl = "/hoss-v2/app/workbench/president.html";
    var cityUrl = "/hoss-v2/app/workbench/do-project.html";


    var cityInfoListCache = null;


    /** util start **/
    var Digit = {};
    //四舍五入保留length有效小数
    Digit.round = function(digit, length) {
        length = length ? parseInt(length) : 0;
        if (length <= 0) return Math.round(digit);
        digit = Math.round(digit * Math.pow(10, length)) / Math.pow(10, length);
        return digit;
    };
    /** util end **/


    $(function(){
        $('.dropdown-toggle').dropdown();

        //城市、时间选择时跳转的函数
        function jumpUrl(){
            var cs = $("#cityCurInfo span:first").text();
            var c = $("#cityCurInfo").attr("info");
            var ts = $("#timeInfo span:first").text();
            var url = selfUrl;
            var lnglatStr = "";
            if(c.substring(0,1) == "3"){
                url = cityUrl;
                lnglatStr += "&lng=" + $("#cityCurInfo").attr("lng") + "&lat=" + $("#cityCurInfo").attr("lat");
            }
            window.location.href = apiHost + url + "?cityInfoStr=" + encodeURI(cs) + "&cityInfo=" + c + "&timeInfoStr=" + encodeURI(ts) + lnglatStr;
        }
        //设置时间的选择状态
        if(timeInfoStr != undefined && timeInfoStr != ""){
            $("#timeInfoContent li").each(function(){
                $(this).removeClass("active");
                if($(this).text() == timeInfoStr){
                    $(this).addClass("active");
                    $("#timeInfo span:first").text(timeInfoStr);
                }
            })
        }
        //城市跳转设置
        $("#cityInfoContent").on("click", "a", function(){
            $("#cityCurInfo").attr("info", $(this).attr("info")).attr("lng", $(this).attr("lng")).attr("lat", $(this).attr("lat")).find("span:first").text($(this).text());
            jumpUrl();
            return false;
        })
        //时间跳转设置
        $("#timeInfoContent").on("click", "a", function(){
            $("#timeInfo span:first").text($(this).text());
            jumpUrl();
            return false;
        })



        //echarts地图功能
        var mapOption = {
            title : {
                text: '好屋中国',
                subtext: '房  产  全  民  营  销  平  台',
                sublink: 'http://www.haowu.com',
                x:'center',
                textStyle: {
                    fontSize: '36',
                    color: '#f50'
                },
                subtextStyle: {
                    fontSize: '16'
                }
            },
            tooltip : {
                trigger: 'item',
                formatter: function (params,ticket,callback) {
                    var data = params[5];
                    return data.name+'<br />当前项目数:'+data.curProNum+'<br />下月项目数:'+data.nextProNum+'<br />净收款:&yen;'+data.netIncome+'<br />支出款:&yen;'+data.outcome;
                }
            },
            series : [
                {
                    type: 'map',
                    mapType: 'china',
                    hoverable: false,
                    roam:true,
                    scaleLimit: {max:8, min:1},
                    symbolSize: 10,
                    itemStyle: {
                        normal: {
                            borderWidth:1,
                            borderColor:'#fff',
                            color: '#f50',
                            label: {
                                show: true,
                                textStyle: {
                                    color: '#ddd'
                                }
                            }
                        }
                    },
                    data:[],
                    markPoint : {
                        symbol: 'circle',
                        symbolSize: 4,
                        itemStyle : {
                            normal: {
                                color: '#fff',
                                borderColor: '#666',
                                borderWidth: 1,
                                label: {
                                    show: false
                                }
                            },
                            emphasis: {
                                borderColor: '#333',
                                borderWidth: 3,
                                label: {
                                    show: false
                                }
                            }
                        },
                        data : []
                    }
                }
            ]
        };

//        echarts.init(document.getElementById('map')).setOption(mapOption);


        // 基于准备好的dom，初始化echarts图表
        function loadMapCharts(data){
            var _mapOption = mapOption;

            //对data进行处理成map需要的对象start
            var geoCoord = '';
            var series = _mapOption.series[0];
            if(data != null){
                $.each(data.content, function(i, item){
                    series.markPoint.data[i] = {
                        name: item.cityName,
                        value: item.cityName,
                        id: item.cityId,
                        provinceId: item.provinceId,
                        curProNum: item.currentMonthCount,
                        nextProNum: item.nextMonthCount,
                        netIncome : item.netIncomeAmount,
                        outcome: item.realOutcomeAmount,
                        lng: item.cityLon,
                        lat: item.cityLat
                    }
                    geoCoord += ',"'+item.cityName+'": ['+item.cityLon+", "+item.cityLat+"]";
                })
            }
            series.geoCoord = eval("({"+(geoCoord.length > 0 ? geoCoord.substr(1) : geoCoord)+"})");
            //对data进行处理成map需要的对象end

            echarts.init(document.getElementById('map')).setOption(_mapOption).on(config.EVENT.CLICK, function(param) {
                window.location.href = apiHost + cityUrl + "?cityInfoStr=" + encodeURI(param.data.name) + "&cityInfo=3_" + param.data.id + "_" + param.data.provinceId + "&lng=" + param.data.lng + "&lat=" + param.data.lat;
            });
        }

        function loadInfo(url, param, callback, errorStr, async){
            $.ajax($.extend({
                url: url,
                data: param,
                async: async
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var result = data || {};

                        if (result.status === '1') {
                            callback(data);
                        }
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取相关统计出错！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, errorStr || '获取相关统计失败！');
                })

            return false;
        }

        /////////////  获取城市列表 start  ///////////////
        var getRegionTreeUrl = apiHost + '/hoss/workbench/getUserAreaInfo.do';
        var getRegionTreeCallback = function(data){
            var content = data.data.content[0];

            if(content != undefined){
                $("#cityCurInfo").attr("info", content.type + "_" + content.id).find("span:first").text(content.name);
                if(content.type == 1){
                    cityIds = "";
                    $.each(content.chlidren, function(i3, item3){
                        if(i3 != 0){
                            cityIds += ",";
                        }
                        cityIds = cityIds + item3.id;
                    });
                    $("#cityCurInfo").attr("info", content.type + "_" + cityIds);
                }
            }
            $("#cityInfoContent").html(template("regionListTmpl", data.data));

            //设置城市信息
            if(cityInfo != undefined && cityInfo != '' && cityInfoStr != undefined && cityInfoStr != ''){
                $("#cityCurInfo").attr("info", cityInfo).find("span:first").text(cityInfoStr);
            }
            cityInfo = $("#cityCurInfo").attr("info");
            cityInfoStr = $("#cityCurInfo span:first").text();
            $("#cityInfoContent a").each(function(i, item){
                $(this).removeClass("active");
                if(cityInfo == $(this).attr("info") && cityInfoStr ==  $(this).text()){
                    $(this).addClass("active");
//                    var parentA = $(this).parent().prev().find("a");
//                    if(parentA){
//                        parentA.addClass("active");
//                    }
                }
            });
        }
        loadInfo(getRegionTreeUrl, {}, getRegionTreeCallback, "获取地区列表信息失败！", false);
        ////////////  获取城市列表 start  ///////////////


        //获取全部项目的统计
        function allProjectCount(data){
            if(data.data != undefined){
            $("#currMonthProjectCount").text(data.data.currentMonthCount);
            $("#nextMonthProjectCount").text(data.data.nextMonthCount);
            $("#afterNextMonthProjectCount").text(data.data.afterNextMonthCount);
            }
        }

        //获取全部项目的信息统计
        function allProjectInfoCount(data){
            if(data.data != null){
                $("#buyAmount span").text(data.data.buyAmount);
                $("#netIncomeAmount span").text(data.data.netIncomeAmount);
                $("#refundAmount span").text(data.data.refundAmount);
                $("#applicationExpensesAmount span").text(data.data.realOutcomeAmount);
                $("#dealCount").text(data.data.dealCount);
            }
        }

        function sortCityList(data, type, sortType){

            var stype;
            sortType == "DESC" ? stype = (-1) : stype = 1;

            if(type == "azSort"){
                data.content.sort(function(a, b){
                    return  (stype)*(a.cityPinyinName.localeCompare(b.cityPinyinName));
                });
            }
            if(type == "projectCount"){
                data.content.sort(function(a, b){
                    return  (stype)*(a.currentMonthCount - b.currentMonthCount);
                });
            }
            if(type == "netIncome"){
                data.content.sort(function(a, b){
                    return  (stype)*(a.netIncomeAmount - b.netIncomeAmount);
                });
            }
            if(type == "outcome"){
                data.content.sort(function(a, b){
                    return  (stype)*(a.realOutcomeAmount - b.realOutcomeAmount);
                });
            }
        }

        //对城市列表进行排序
        $("#sortSubBtn").click(function(){
            if(cityInfoListCache != null){
                var _data = $.extend(true,{}, cityInfoListCache);
                sortCityList(_data, $("#selectCondition").val(), $("#sortCondition").val());
                $("#cityPorjectCountInfoList").html(template('cityPorjectCountInfoTmpl', _data));
                //计算净收款占比
                countRate();
            }
            return false;
        });

        //获取城市项目的基本信息和统计
        function cityPorjectCountInfoList(data){

            var _data =  $.extend(true,{}, data.data);
            cityInfoListCache = _data;

            $("#sortSubBtn").click();

            //加载地图组件
            loadMapCharts(_data);
        }

        //计算净收款占比
        function countRate(){
            var cityList = $(".city-list-item .city-list-item");
            var maxNetIncome = 0.0;
            var maxOutcome = 0.0;
            $.each(cityList, function(index, content){
                //计算最大的净收入
                var netIncome = parseFloat($(content).find(".netIncome span").text());
                if(maxNetIncome < netIncome){
                    maxNetIncome = netIncome;
                }
                //计算最大的支出款
                var outcome = parseFloat($(content).find(".outcome span").text());
                if(maxOutcome < outcome){
                    maxOutcome = outcome;
                }
            });
            $.each(cityList, function(index, content){
                //计算净收占比，保留两位有效小数
                if(maxNetIncome != 0.0){
                    var $netProgress = $(content).find(".netProgressBar");
                    var netIncome = parseFloat($(content).find(".netIncome span").text());
                    var netIncomeRate = 0;
                    if(netIncome >= 0 && maxNetIncome >= 0){
                        netIncomeRate =  (netIncome / maxNetIncome) * 100;
                    }
                    $netProgress.css("width", Digit.round(netIncomeRate, 2)+'%');
                }
                //计算支出占比，保留两位有效小数
                if(maxOutcome != 0.0){
                    var $outProgressBar = $(content).find(".outProgressBar");
                    var outcome = parseFloat($(content).find(".outcome span").text());
                    var outcomeRate = 0;
                    if(outcomeRate >= 0 && maxOutcome >= 0){
                        outcomeRate =  (outcome / maxOutcome) * 100;
                    }
                    $outProgressBar.css("width", Digit.round(outcomeRate, 2)+'%');
                }
            });
        }

        //ajax所需传递的参数
        var allProjectCountUrl = apiHost + '/hoss/workbench/allProjectCount.do';
        var allProjectInfoCountUrl = apiHost + '/hoss/workbench/allProjectInfoCount.do';
        var cityPorjectCountInfoListUrl = apiHost + '/hoss/workbench/cityPorjectCountInfoList.do';
        var param = {areaStr: $("#cityCurInfo").attr("info"), timePeriodStr: $("#timeInfo span:first").text()};
        //ajax初始化相关信息
        if(param.areaStr == undefined){
            return false;
        }else if(param.areaStr.split("_")[1] == ""){
            systemMessage("该区域无城市！");
        }else{
            loadInfo(allProjectCountUrl, param, allProjectCount, "获取所选城市项目统计信息失败！");
            loadInfo(allProjectInfoCountUrl, param, allProjectInfoCount, "获取所选城市金额统计信息失败！");
            loadInfo(cityPorjectCountInfoListUrl, param, cityPorjectCountInfoList, "获取城市列表统计信息失败！");
        }

    });

});