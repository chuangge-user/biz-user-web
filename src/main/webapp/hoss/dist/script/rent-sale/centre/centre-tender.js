define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    require(['jquery', 'datepicker']);

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

    var centreUtil = require('script/rent-sale/centre/centre-util');
    var queryString = require("script/get-query-string")
    var saleRentalcenterId = queryString('saleRentalId');
    var progressUpload = require('script/progress-upload');

    function domReady() {

        $('#saleRentalcenterId').val(saleRentalcenterId);
        progressUpload.bindAddFileLink($('#addFileLink'), $('#fileProgressBox'))

        var $allmap,
            map,
            markerList = [];

        loadInfo();

        var addBubble = initMap();

        initEvent();

        /**
         * 初始化基本事件
         */
        function initEvent(){

            // 时间选择
            $('#bidStartDate,#bidEndDate').one('click', function(e){
                $(e.currentTarget).datepicker({
                    autoclose: true,
                    language: 'zh-CN',
                    dateFormat: 'yy-mm-dd'
                }).datepicker('show')
            })

            // 招标描述控制
            var $bidDescribe = $('#bidDescribe');
            $bidDescribe.keyup(function(){
                var value = $bidDescribe.val();
                if (value.length > 500) {
                    $bidDescribe.val(value.substr(0, 500));
                }
            });
//            #bidEndDate

            var $theRange = $('#theRange'); // 改变搜索范围事件
            $theRange.change(function(){
                searchRim($('#cityId').val(), {
                    data:{
                        longitude:$('#longitude').val(),
                        latitude:$('#latitude').val()
                    }
                });
            });

            $('#addForm').submit(function (event) {
                var $context = $(this),
                    $disabled = $context.find('[disabled]'),
                    $submit = $context.find('input[type=submit]')

                if (event) {
                    event.preventDefault();
                }

                if ($submit.hasClass('disabled')) {
                    return false;
                }
                if (checkEmpty()) {
                    return;
                }


                $disabled.removeAttr('disabled');

                initFileKeys();

                $.ajax($.extend({
                    url: apiHost + '/sale/bidding/saveBid.do',
                    data:clearEmptyValue($context),
                    beforeSend: function () {
                        $submit.attr('disabled', 'disabled');
                    }
                }, jsonp)).
                    done(function (data) {
                        function useful(data) {
                            var dataObj = data.data || {};
                            location = 'centre-list.html';
//                            location = '../bidding-manage/bidding-list.html';
                        }


                        doneCallback.call(this, data, useful, useless);
                    }).
                    fail(function (jqXHR) {
                        failCallback.call(this, jqXHR, '新建租售中心失败！');
                    }).
                    always(function () {
                        $disabled.attr('disabled', 'disabled');
                        $submit.removeAttr('disabled').blur();
                    });

            })

        }

        function checkEmpty() {

            if (!$('#bidStartDate').val()) {
                systemMessage('招标开始日期不能为空！')
                return true;
            }
            if (!$('#bidEndDate').val()) {
                systemMessage('招标结束日期不能为空！')
                return true;
            }

            var bidPrice = $('#bidPrice').val();
            if (bidPrice&&!/^[0-9]{1,39}(\.[0-9]{1,2})?$/.test(bidPrice)) { // 非空则验证后两位小数点
                systemMessage('竞标低价输入有误，最多保留小数后两位');
                return true;
            }

            if (!$('#contact').val()) {
                systemMessage('联系人不能为空！')
                return true;
            }
            if (!$('#contactPhone').val()) {
                systemMessage('联系方式不能为空！')
                return true;
            }
        }
        /**
         * 加载信息
         */
        function loadInfo(){
            var queryInfoCode = '/sale/bidding/createBid.do';
            $.ajax($.extend({
                url: apiHost + queryInfoCode,
                data:{
                    centerId:saleRentalcenterId
                }
            }, jsonp)).
                done(function (data) {

                    function useful(data) {
                        var dataObj = data.data || {};

                        $.each(dataObj, function(key, value){
                            var $node = $('#' + key);
                            $node.text(value);
                            $node.val(value);
                        })

                        $('.right-title-name').text(dataObj.centerName + '周边门店');
                        $('#saleRentalDistrictRelationList').text($.map(dataObj.saleRentalDistrictRelationList, function(obj){ // 覆盖小区
                            return obj.saleDistrictName;
                        }).join(','));

                        map.setCenter(dataObj.cityName);
                        searchRim(dataObj.cityId, {
                            data:dataObj
                        });
                    }

                    doneCallback.call(this, data, useful, useless);

                })
        }

        /**
         * 初始化附件值
         */
        function initFileKeys(){
            var fileKeys = '';
            $('#fileProgressBox .file-box').each(function(index, fileBox){
                var $fileBox = $(fileBox);
                fileKeys += '<input type="hidden" name="files[' + index + '].fileKey" value="' + $fileBox.find('[name="documentId"]').val() + '"/>';
                fileKeys += '<input type="hidden" name="files[' + index + '].fileName" value="' + $fileBox.find('[fileName]').text() + '"/>';
            });
            $('#fileKeysContainer').html(fileKeys);
        }

        /**
         * 初始化百度地图
         */
        function initMap(){
            var icon = {w:21,h:25,l:0,t:25,x:6,lb:5}; //默认icon处理位置

            var _icon = icon;

            $allmap = $('#allmap');
//          $allmap.width($allmap.parent().width());

            // 百度地图API功能
            map = new BMap.Map("allmap");
            var point = new BMap.Point(0,0);
            map.centerAndZoom(point, 13);
            map.enableScrollWheelZoom(true);   //启用滚轮放大缩小，默认禁用
            map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用
            map.addControl(new BMap.NavigationControl()); // 缩放控件
            map.addControl(new BMap.ScaleControl({anchor: 0})); // 比例尺

            // map.setCenter(cityInfo.cityName);
            map.setCenter($('#cityName').val() || '上海市');

            // 编写自定义函数,创建标注
            function addMarker(point, i, info){
                var iconImg = createIcon(_icon, i);
                var marker = new BMap.Marker(point,{icon:iconImg});

                map.addOverlay(marker);
                markerList.push(marker);

                $(marker.Jc).attr('title', info);
                var opts = {
                    width : 200,     // 信息窗口宽度
                    height: 40,     // 信息窗口高度
                    enableMessage:false //设置允许信息窗发送短息
                }
                var infoWindow = new BMap.InfoWindow(info, opts);  // 创建信息窗口对象
                marker.addEventListener("click", function(){
                    map.openInfoWindow(infoWindow,point); //开启信息窗口
                });
                if (i == 0) {
                    marker.setAnimation(2); //跳动的动画
                }
            }

            //创建一个Icon
            function createIcon(json, index){
                picUrl = apiHost + '/hoss-v2/dist/image/points.png';
                var imageOffset = new BMap.Size(-json.l,-json.t*11);
                if(index < 10){
                    imageOffset = new BMap.Size(-json.l,-index * 25);
                }
                var icon = new BMap.Icon(picUrl, new BMap.Size(json.w,json.h),{imageOffset: imageOffset});
                return icon;
            }

            return function (index, item, info){
                addMarker(new BMap.Point(item.longitude, item.latitude), index, info);
            }
        }

        /**
         * 查询周边小区
         * @param suggestion
         */
        function searchRim(cityId, suggestion) {
            var data = suggestion.data;
            $.ajax($.extend({
                url: apiHost + '/sale/external/findSurroundStoreList.do',
                data:{
                    cityId:cityId,
                    longitude:data.longitude,
                    latitude:data.latitude,
                    theRange:$('#theRange').val()
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        removeAllMarker();

                        var longitude = $('#longitude').val(),
                            latitude = $('#latitude').val()
                        addBubble(0, {
                            longitude:longitude,
                            latitude:latitude
                        }, $('#centerName').text());
                        map.panTo(new BMap.Point(longitude, latitude)); // 移动地图
                        map.setZoom(16); // 缩小放大

                        var rimHTML = '',
                            content = dataObj.content ||[];
//                        removeAllMarker();
                        $.each(content, function(index, obj){
                            rimHTML += '' +
                                '<tr>' +
                                '<td><input type="checkbox" orgId="' + obj.orgId + '"  orgName="' + obj.orgName + '"  storeId="' + obj.storeId + '"   storeName="' + obj.storeName + '"   count="' + obj.cusNumber + '" villageName="' + obj.storeName + '"/></td>' +
                                '<td width="130">' + obj.orgName + '-' + obj.storeName + '</td>' +
                                '<td><span style="color: #ff0000">' + obj.cusNumber + '</span>人</td>' +
                                '<td>' + obj.apartForm + '米</td>' +
                                '</tr>';

                            addBubble(index + 1, obj, obj.orgName + '-' + obj.storeName);
                        })

                        if (content.length === 0) {
                            rimHTML = '<tr><td colspan="4">暂无门店信息！</td></tr>';
                        }
                        $('#rimResultList').html(rimHTML);
                    }


                    doneCallback.call(this, data, useful, useless);
                })
        }

        /**
         * 移除所有的 marker
         */
        function removeAllMarker(){
            while(markerList.length > 0) {
                map.removeOverlay(markerList.pop())
            }
        }

        // 选中小区、设置地图、 等等
        var $rimResultList = $('#rimResultList');
        $rimResultList.delegate('input[type="checkbox"]', 'click', function(e){
            var $target = $(e.currentTarget),
                $selected = $rimResultList.find('input[type="checkbox"]:checked'),
                orgsHTML = '',
                count = 0,
                names = []

            $selected.each(function(index, node){
                var $node = $(node)
                orgsHTML += '<input type="hidden" name="orgs[' + index + '].orgId" value="' + $node.attr('orgId') + '"/>';
                orgsHTML += '<input type="hidden" name="orgs[' + index + '].orgName" value="' + $node.attr('orgName') + '"/>';
                orgsHTML += '<input type="hidden" name="orgs[' + index + '].storeId" value="' + $node.attr('storeId') + '"/>';
                orgsHTML += '<input type="hidden" name="orgs[' + index + '].storeName" value="' + $node.attr('storeName') + '"/>';
                count += parseInt($node.attr('count'));
                names.push($node.attr('villageName'));
            });

            $('#orgsContainer').html(orgsHTML); // 覆盖的小区 id name 传给后台
            $('#selectedVillage').text(names.join(',')); // 覆盖的小区

//            $('#selectedVillageBrokerCount').text(count); // 总人数
        })

        function useless(data) {
            systemMessage({
                type: 'info',
                title: '提示：',
                detail: data.detail
            });
        }

    }

    $(document).ready(domReady);




});