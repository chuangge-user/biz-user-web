define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    var navigation = require('navigation');
    var getQueryString = require('script/get-query-string');
    var pagination = require('pagination');

    var xhr = require('xhr'),
        systemMessage = require('system-message'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var rate = function (a, b, c) {
        var r = 0,
            c = c || 100;

        if (a > 0 && b > 0) {
            r = (a / b) * c;
            r = accounting.toFixed(r, 2);
        }

        if (r <= 0) {
            r = 0;
        }

        return r;
    }

    var template = require('template');
    template.helper("apiHost", apiHost);
    var accounting = require('accounting');
    template.helper('_rate_', rate);
    var autocomplete = require('autocomplete');
    var dropdown = require('bootstrap/dropdown');


    var cityId;
    var loadingStr = "加载中...";
    var $searchForm = $("#searchForm");
    var $projectNameInput = $("#projectNameInput");
    var $sortType = $("#sortType");
    var $sortBtn = $("#sortBtn");
    var $pageNum = $searchForm.find('input[name=page]');
    var $pageSize = $searchForm.find('input[name=size]');
    var $searchResultPagination = $('#searchResultPagination');
    var cityProjectInfoListData = "";
    var ajaxArr = [];

    var cityInfo = getQueryString("cityInfo");
    var cityInfoStr = getQueryString("cityInfoStr");
    var timeInfoStr = getQueryString("timeInfoStr");
    var lngInfoStr = getQueryString("lng");
    var latInfoStr = getQueryString("lat");
    var selfUrl = "/hoss-v2/app/workbench/president.html";
    var cityUrl = "/hoss-v2/app/workbench/do-project.html";

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

        function closeAjaxRequest(){
            $.each(ajaxArr, function(i, item){
                item.abort();
            });
        }

        //退出事件
        $("#logout").click(function(event){
            if (event) {
                event.preventDefault();
            }

            closeAjaxRequest();

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/v2/Logout.do'
            }, jsonp)).
                done(function (data) {
                    data.status = isNotLogin;
                    doneCallback.call(this, data);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '退出失败');
                }).
                always(function () {
                    sessionStorage.clear();
                });
        });

        //优化刷新页面事件
        window.onbeforeunload = function(){
            closeAjaxRequest();
        }

        //城市、时间选择时跳转的函数
        function jumpUrl(){
            var cs = $("#cityCurInfo span:first").text();
            var c = $("#cityCurInfo").attr("info");
            var ts = $("#timeInfo span:first").text();
            var url = selfUrl;
            var lnglatStr = "";
            if(c.substring(0,1) == "3"){
                url = cityUrl;
                lnglatStr = "&lng=" + $("#cityCurInfo").attr("lng") + "&lat=" + $("#cityCurInfo").attr("lat");
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

        function paginationInfo(data){
            // 显示分页
            $searchResultPagination.pagination({
                $form: $searchForm,
                totalSize: data.totalElements,
                pageSize: parseInt($pageSize.val()),
                visiblePages: 5,
                info: false,
                paginationInfoClass: 'pagination-count pull-left',
                paginationClass: 'pagination pagination-sm',
                onPageClick: function (event, index) {
                    var _data = sortData(data);
                    _data.content = selectData(_data);

                    $("#cityProjectInfoList").html(template("cityProjectInfo", _data));
                    initMap(_data.content);//创建和初始化地图
                }
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

        function loadInfoErrorCallback(url, param, successCallback, errorCallback){
            var ajaxInfo = $.ajax($.extend({
                url: url,
                data: param
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var result = data || {};

                        if (result.status === '1') {
                            successCallback(data);
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
//                    errorCallback(data);
//                    failCallback.call(this, jqXHR, errorStr || '获取相关统计失败！');
                });

            ajaxArr.push(ajaxInfo);

            return false;
        }

        /////////////  获取城市列表 start  ///////////////
        var getRegionTreeUrl = apiHost + '/hoss/workbench/getUserAreaInfo.do';
        var getRegionTreeCallback = function(data){
            var content = data.data.content[0];
            $("#cityCurInfo").attr("info", content.type + "_" + content.id + "_" + content.provinceId).attr("lng", content.longitude).attr("lat", content.latitude).find("span:first").text(content.name);
            $("#cityInfoContent").html(template("regionListTmpl", data.data));

            //设置城市信息
            if(cityInfo != undefined && cityInfo != '' && cityInfoStr != undefined && cityInfoStr != ''){
                $("#cityCurInfo").attr("info", cityInfo).attr("lng", lngInfoStr).attr("lat", latInfoStr).find("span:first").text(cityInfoStr);
                $("#projectAreaInfo span:first").text(cityInfoStr);
                $("#cityProjectCountInfo span:first").text(cityInfoStr);
            }

            cityInfo = $("#cityCurInfo").attr("info");
            cityInfoStr = $("#cityCurInfo span:first").text();
            cityId = cityInfo.split("_")[1];

            $("#cityInfoContent a").each(function(i, item){
                $(this).removeClass("active");
                if(cityInfo == $(this).attr("info") && cityInfoStr ==  $(this).text()){
                    $(this).addClass("active");
                    var parentA = $(this).parent().prev().find("a");
                    if(parentA){
                        parentA.addClass("active");
                    }
                }
            });
        }
        loadInfo(getRegionTreeUrl, {}, getRegionTreeCallback, "获取地区列表信息失败！", false);
        ////////////  获取城市列表 start  ///////////////



        //下拉项目列表
        $projectNameInput.autocomplete(
            {
                paramName: 'projectName',
                dataType: 'jsonp',
                serviceUrl: apiHost + '/hoss/workbench/projectList.do?cityId=' + cityId,
                width: 150,
                maxHeight: 400,
                transformResult: function (response, originalQuery) {
                    return {
                        query: originalQuery,
                        suggestions: $.map(response.data.content, function (dataItem) {
                            return {value: dataItem.projectName, id: dataItem.projectId};
                        })
                    };
                },
                onSelect: function (suggestion) {

                }
            }
        );


        function sortData(data){

            var _data = $.extend(true,{}, data);
            var projectNameInputVal = $projectNameInput.val();
            var sortTypeVal = $sortType.val();

            //根据排序类型进行排序
            _data.content.sort(function(a, b){
                if(sortTypeVal == 1){
                    return a.projectName.localeCompare(b.projectName);
                }
                if(sortTypeVal == 2){
                    return a.projectStartDate - b.projectStartDate;
                }
                if(sortTypeVal == 3){
                    return rate(a.nowDay,a.allDay) - rate(b.nowDay, b.allDay);
                }
                if(sortTypeVal == 4){
                    return rate(b.nowIncome,b.allIncome) - rate(a.nowIncome, a.allIncome);
                }
                if(sortTypeVal == 5){
                    return rate(b.nowExpenses,b.allExpenses) - rate(a.nowExpenses, a.allExpenses);
                }
                if(sortTypeVal == 6){
                    return rate(b.nowDealCount,b.allCount) - rate(a.nowDealCount, a.allCount);
                }
            });
            //根据项目名称过滤项目
            var ival = $.trim(projectNameInputVal);
            for(var i = _data.content.length - 1; i >= 0; i--){
                if(_data.content[i].projectName.indexOf(ival) == -1){
                    _data.content.splice(i, 1);
                }
            }
            _data.totalElements = _data.content.length;
//            _data.content = selectData(_data);
            return _data;
        }

        function selectData(data){
            var content = [];
            var curIndex = (parseInt($("#searchResultPagination ul li.active").text()) - 1) || 0;
            var pageSize = parseInt($pageSize.val());
            var curSize = data.content.length > (curIndex + 1) * pageSize ? (curIndex + 1) * pageSize : data.content.length;
            for(var i = curIndex*pageSize; i < curSize; i++){
                content.push(data.content[i]);
            }
            $pageNum.val(curIndex);
            return content;
        }

        $searchForm.submit(function(){
            $("#searchResultPagination ul li").removeClass("active").first().addClass("active");
            var _cityProjectInfoListData = $.extend(true,{}, cityProjectInfoListData);
            var _data = sortData(_cityProjectInfoListData);
            _data.content = selectData(_data);

            _cityProjectInfoListData.totalElements = _data.totalElements;
            $("#cityProjectInfoList").html(template("cityProjectInfo", _data));
            initMap(_data.content);//创建和初始化地图
            paginationInfo(_cityProjectInfoListData);
            return false;
        });



        //获取地图上方的城市统计信息回调方法
        function cityProjectCountCallback(data){
            $("#overProjectCount").html(data.data.overProjectCount);
            $("#nowProjectCount").html(data.data.nowProjectCount);
        }
        var cityProjectCountUrl = apiHost + '/hoss/workbench/cityProjectCount.do';
        var param = {
            cityId: cityId
        }
        var errorStr = "获取城市信息列表失败！";
        loadInfo(cityProjectCountUrl, param, cityProjectCountCallback, errorStr);








        var breakSize = 5;
        var getProgressInfoListByProjectIdUrl = apiHost + '/hoss/workbench/getProgressInfoListByProjectId.do';
        function loadProjectListByProjectIds(ids,callback){

            var params = [];
            $(ids).each(function(){
                params.push({name:"ids",value:this});
            })


            var  i = 0;
            function errorCallback(){
                if( i<=breakSize ){
                    loadInfoErrorCallback(getProgressInfoListByProjectIdUrl, params, callback, errorCallback );
                    i++;
                }
            }
            loadInfoErrorCallback(getProgressInfoListByProjectIdUrl,params, callback, errorCallback );
        }

        var batchSize=10;
        var dataSize=1;
        function lazyData(data){
            var ids = [];

            dataSize=data.content.length;

            function successCallback(data){
                $(data.data.content).each(function(i, item){
                    //数据处理
                    for(var j = 0; j < cityProjectInfoListData.content.length; j++){
                        if(item.projectId == cityProjectInfoListData.content[j].projectId){
                            cityProjectInfoListData.content[j].nowIncome = item.nowIncome;
                            cityProjectInfoListData.content[j].nowExpenses = item.nowExpenses;

                            var $income = $("#income_"+item.projectId);
                            var $outcome = $("#outcome_"+item.projectId);
                            var $allIncome = $("#allIncome_"+item.projectId);
                            var $allExpenses = $("#allExpenses_"+item.projectId);
                            if($income && $outcome){
                                $("#nowIncome_"+item.projectId).text(item.nowIncome);
                                $("#nowExpenses_"+item.projectId).text(item.nowExpenses);

                                var incomeRate = rate(item.nowIncome, parseFloat($allIncome.text()));
                                var outcomeRate = rate(item.nowExpenses, parseFloat($allExpenses.text()));
                                $("#income_"+item.projectId).css("width", incomeRate+"%").text(incomeRate+"%");
                                $("#outcome_"+item.projectId).css("width", outcomeRate+"%").text(outcomeRate+"%");
                            }
                        }
                    }
                });

                dataSize-=data.data.content.length;
                if( dataSize <= 0 ){

                    var html=[];
                    html.push( '<option value="1">首字母</option>' );
                    html.push( '<option value="2">项目开始时间</option>' );
                    html.push( '<option value="3">时间进度</option>' );
                    html.push( '<option value="4">预调收入</option>' );
                    html.push( '<option value="5">申请费用</option>' );
                    html.push( '<option value="6">成交套数</option>' );

                    $("#sortType").html(html.join(""));
                }
            }

            for(var i = 0; i < data.content.length; i++){
                ids.push( data.content[i].projectId );
                if( ids.length == batchSize){
                    loadProjectListByProjectIds(ids,successCallback,dataSize);
                    ids = [];
                }
            }

            if( ids.length > 0 ){
                loadProjectListByProjectIds(ids,successCallback,dataSize);
            }

//            var index = 0;
//
//            function successCallbackEvent(dt){
//                successCallback(dt);
//
//                loadNextProjectList();
//            }
//
//            function loadNextProjectList(){
//                ids = [];
//
//                for(var i = index; i < data.content.length; i++){
//                    ids.push( data.content[index++].projectId );
//                    if(ids.length >= 10){
//                        break;
//                    }
//                }
//
//                if( ids.length != 0){
//                    loadProjectListByProjectIds(ids,successCallbackEvent,dataSize);
//                }
//            }
//
//            loadNextProjectList();
        }



        //城市信息列表回调方法
        function cityProjectListCallback(data){
            cityProjectInfoListData = sortData(data.data);  //缓存城市项目信息列表信息

            var _data = {};
            _data.content = selectData(cityProjectInfoListData);

            //异步加载获取预调收入和申请费用
            lazyData(cityProjectInfoListData);

//            var _data = sortData(cityProjectInfoListData);
            $("#cityProjectInfoList").html(template("cityProjectInfo", _data));

            initMap(_data.content);//创建和初始化地图
            paginationInfo(cityProjectInfoListData);
        }
        var projectProgressInfoListUrl = apiHost + '/hoss/workbench/projectProgressInfoList.do';
        var param = {
            cityId : cityId
        }
        var errorStr = "获取城市信息列表失败！";
        loadInfo(projectProgressInfoListUrl, param, cityProjectListCallback, errorStr);




        //////////////

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

        //获取全部项目的统计
        function allProjectCount(data){
            //处理当前项目数跳转到项目管理页面
            var cityIdInfo = $("#cityCurInfo").attr("info");
            if(cityIdInfo != undefined && cityIdInfo.indexOf("_") != -1 && cityIdInfo.split("_")[0] == "3"){
                var projectManagerUrl = apiHost + '/hoss-v2/app/my-workbench/project-manager.html?cityId=' + cityIdInfo.split("_")[1] + "&provinceId=" + cityIdInfo.split("_")[2];
                $("#currMonthProjectCount").parent().attr("href", projectManagerUrl);
            }
            if(data.data){
                $("#currMonthProjectCount").text(data.data.currentMonthCount);
                $("#nextMonthProjectCount").text(data.data.nextMonthCount);
                $("#afterNextMonthProjectCount").text(data.data.afterNextMonthCount);
            }
        }

        //ajax所需传递的参数
        var allProjectCountUrl = apiHost + '/hoss/workbench/allProjectCount.do';
        var allProjectInfoCountUrl = apiHost + '/hoss/workbench/allProjectInfoCount.do';
        var param = {areaStr: $("#cityCurInfo").attr("info"), timePeriodStr: $("#timeInfo span:first").text()};
        //ajax初始化相关信息
        if(param.areaStr == undefined){
            return false;
        }else{
            loadInfo(allProjectCountUrl, param, allProjectCount, "获取所选城市项目统计信息失败！");
            loadInfo(allProjectInfoCountUrl, param, allProjectInfoCount, "获取所选城市金额统计信息失败！");
        }

        /////////////







        ///////////////////////   map start   ///////////////////////////

        //创建和初始化地图函数：
        function initMap(data){
            window.map = new BMap.Map("map");
            var $cityCurInfo = $("#cityCurInfo");
            map.centerAndZoom(new BMap.Point(parseFloat($cityCurInfo.attr("lng")), parseFloat($cityCurInfo.attr("lat"))), 12);
            map.enableScrollWheelZoom();
            addMarker(data);//向地图中添加marker
        }

        //创建marker
        window.addMarker = function (data){
            map.clearOverlays();
            var icon = {w:21,h:25,l:0,t:25,x:6,lb:5}; //默认icon处理位置

            for(var i=0;i<data.length;i++){
                var json = data[i];

                if(json.residenceLat == undefined || json.residenceLon == undefined){
                    continue;
                }

                var p0 = json.residenceLon;
                var p1 = json.residenceLat;
                var point = new BMap.Point(p0,p1);
                var _icon = icon;
                var iconImg = createIcon(_icon, i);
                var marker = new BMap.Marker(point, {icon:iconImg});
                var label = new BMap.Label(json.projectName,{"offset":new BMap.Size(_icon.lb - _icon.x + 10,-20)});
                label.setStyle({
                    borderColor:"#808080",
                    color:"#333"
                });
                marker.setLabel(label);
                marker.getLabel().hide();
                map.addOverlay(marker);


                (function(i){
                    var _json = json;
                    var _iw = createInfoWindow();
                    var _marker = marker;
                    _marker.addEventListener("click",function(){
                        this.openInfoWindow(_iw);
                        loadInfoWindow(_iw, _json);
                    });
                    _marker.addEventListener("mouseover",function(){
                        markerHoverEvent(_marker, _json, _json.projectId, true);
                    });
                    _marker.addEventListener("mouseout",function(){
                        markerHoverEvent(_marker, _json, _json.projectId, false);
                    });
                    label.addEventListener("click",function(){
                        _marker.openInfoWindow(_iw);
                    })

                    $("#residenceInfo_" + _json.projectId).click(function(){
                        _marker.openInfoWindow(_iw);
                        loadInfoWindow(_iw, _json);
                    })
                })(i)
            }

        }

        function scrollToTarget(parentNode, targetNode){
            var parentScrollTop = parentNode.scrollTop();
            var targetPositionTop = targetNode.position().top;
            var disHeight = (parentNode.outerHeight(true) - targetNode.outerHeight(true)) / 2;

            disHeight = parentScrollTop + targetPositionTop - disHeight;
            parentNode.stop().animate({"scrollTop": disHeight > 0 ? disHeight : 0});
        }

        function markerHoverEvent(marker, json, index, isMouseOver){
            if(isMouseOver){
                marker.getLabel().show();
                scrollToTarget($("#cityProjectInfoList"), $("#residenceInfo_" + index));
                $("#residenceInfo_" + index).addClass('city-list-item-hover').find('.i-city-order').addClass('i-city-order-hover');
            }else{
                marker.getLabel().hide();
                $("#residenceInfo_" + index).removeClass('city-list-item-hover').find('.i-city-order').removeClass('i-city-order-hover');
            }
        }


        function loadInfoWindow(iw, json){
            if(iw.getContent() == loadingStr){
                function projectDetailInfoCallback(data){
                    iw.setContent(template("infoWindow", data.data));
                }

                var projectProgressInfoListUrl = apiHost + '/hoss/workbench/projectDetailInfo.do';
                var param = {
                    projectId : json.projectId
                }
                var errorStr = "获取项目信息列表失败！";
                loadInfo(projectProgressInfoListUrl, param, projectDetailInfoCallback, errorStr);
            }
        }

        //创建InfoWindow
        function createInfoWindow(){
            var iw = new BMap.InfoWindow(loadingStr, {enableMessage: false});
            return iw;
        }

        //创建一个Icon
        function createIcon(json, index){
            picUrl = apiHost + '/hoss-v2/dist/image/points.png';
            var imageOffset = new BMap.Size(-json.l,-json.t*11);
            if(index < 10){
                imageOffset = new BMap.Size(-json.l,-index * 25);
            }
            var icon = new BMap.Icon(picUrl, new BMap.Size(json.w,json.h),{imageOffset: imageOffset,infoWindowAnchor:new BMap.Size(json.lb+5,1),offset:new BMap.Size(json.w,json.h)});
            return icon;
        }

        ///////////////////////   map start   ///////////////////////////
    });



    function resizeFrame(){
        var win_height = $(window).height();
        var header_height = $(".header").outerHeight(true);
        var containerTop_height = $("#containerTop").outerHeight(true);

        var sortDis_height = $("#sortDis").outerHeight(true);
        var searchResultPagination_height = $("#searchResultPagination").outerHeight(true);

        var mapDesc_height = $("#mapDesc").outerHeight(true);

        var dis_height = win_height - header_height - containerTop_height;
        var dis_height2 = dis_height - mapDesc_height;
        dis_height = dis_height - sortDis_height - searchResultPagination_height;

        if(dis_height >= 0){
            $("#cityProjectInfoList").height(dis_height);
        }
        if(dis_height2 >= 0){
            $("#map").height(dis_height2);
        }
    }

    //框架resize
    resizeFrame();
    $(window).resize(function() {
        resizeFrame();
    });

});