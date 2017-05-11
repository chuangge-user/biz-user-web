define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    require(['jquery', 'datepicker', 'dist/script/bootstrap.min', 'dist/script/bootstrap-select']);

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
    $('#saleRentalcenterId').val(saleRentalcenterId);
    var progressUpload = require('script/progress-upload');

    function domReady() {

        var $fileProgressBox = $('#fileProgressBox');
        progressUpload.bindAddFileLink($('#addFileLink'), $fileProgressBox)

        var $allmap,
            map;

        var $cityId = $('#cityId'),
            $maintainId = $('#maintainId'),
            relationList;

        loadInfo();

        var addBubble = initMap();

        initEvent();

        /**
         * 初始化基本事件
         */
        function initEvent(){

            // 线下地址操作
            var $offlineAdress = $('input[name="offlineAddress"]').hide(),
                $lineFlag = $('input[name="lineFlag"]'),
                $offline = $('#offline');
            $offline.click(function(){
                var checked = (!$offline.is(':checked')) * 1;
                $lineFlag.val(checked); // is checked 返回 Boolean 值  * 1操作 转换为 1 0
                $offlineAdress.toggle();
                if (checked === 1) {
                    $offlineAdress.val('');
                }
            })

            // 城市相关
            var $cityName = $('input[name="cityName"]'),
                $maintainName = $('input[name="maintainName"]')

//            $cityId.change(function(){
//                var cityName = $cityId.find('option:checked').text();
//                $cityName.val(cityName);
//                setAutoComplate($cityId.val()); // 切换城市后重新设置自动匹配
//                map.setCenter(cityName);
//            });
            $maintainId.change(function(){
                $maintainName.val($maintainId.find('option:checked').text());
            });


            $('#editForm').submit(function (event) {
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
                    url: apiHost + '/sale/saleCenter/modSaleCenter.do',
                    data:clearEmptyValue($context),
                    beforeSend: function () {
                        $submit.attr('disabled', 'disabled');
                    }
                }, jsonp)).
                    done(function (data) {
                        function useful(data) {
                            var dataObj = data.data || {};
                            location = 'centre-list.html';
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

        /**
         * 加载信息
         */
        function loadInfo(){
            var queryInfoCode = '/sale/saleCenter/qrySaleCenterInfo.do';
            $.ajax($.extend({
                url: apiHost + queryInfoCode,
                data:{
                    saleRentalcenterId:saleRentalcenterId
                }
            }, jsonp)).
                done(function (data) {

                    function useful(data) {
                        var dataObj = data.data || {};

                        $.each(dataObj, function(key, value){
                            $('span#' + key).text(value);

                            $('input[name=' + key + ']').val(value);
                            $('select[name=' + key + ']').val(value);
                        })

                        if (dataObj.lineFlag == 0) {
                            $('#offline').click().not(':checked').click(); // 兼容傻逼ie
                        }

                        $('[cityName]').text(dataObj.cityName);
                        $('[saleDistrictName]').text(dataObj.saleDistrictName);
                        $('.right-title-name').text(dataObj.saleDistrictName + '周边楼盘');

                        relationList = dataObj.relationList; // 已经选中过的楼盘

                        // 附件列表
                        $.each( dataObj.annexList || [], function(index, obj){
                            var $fileBox = $(progressUpload.getFileBoxStr({
                                    id:obj.annexKey,
                                    name:obj.annexName
                                })).
                                append($('<input type="hidden" name="documentId" value="' + obj.annexKey + '"/>')).
                                show()
                            $fileProgressBox.append($fileBox);
                        })
                        $fileProgressBox.find('[progress]').parent().hide();


                        centreUtil.bindCityAndMaintain($cityId, $maintainId, dataObj.cityId, dataObj.maintainId);
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
                fileKeys += '<input type="hidden" name="annexDTOList[' + index + '].annexKey" value="' + $fileBox.find('[name="documentId"]').val() + '"/>';
                fileKeys += '<input type="hidden" name="annexDTOList[' + index + '].annexName" value="' + $fileBox.find('[fileName]').text() + '"/>';
            });
            $('#fileKeysContainer').html(fileKeys);
        }

        /**
         * 初始化百度地图
         */
        var markerList = [];
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

            //
            //        $.each(content, function (index, item){
            //            addMarker(new BMap.Point(item.longitude, item.latitude), index);
            //        });





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
                url: apiHost + '/sale/external/modRentalByLngLatFromRent.do',
                data:{
                    cityId:cityId,
                    longitude:data.longitude,
                    latitude:data.latitude,
                    theRange:$('#centerRange').val(),
                    villageId:$('#saleDistrictId').val(),
                    rentalcenterId:saleRentalcenterId
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        var rimHTML = '',
                            center = $('#saleDistrictName').val()
                        removeAllMarker();

                        var longitude = $('#longitude').val(),
                            latitude = $('#latitude').val()
                        addBubble(0, {
                            longitude:longitude,
                            latitude:latitude
                        }, center);
                        map.panTo(new BMap.Point(longitude, latitude)); // 移动地图
                        map.setZoom(16); // 缩小放大
                        $.each(dataObj.content || [], function(index, obj){
                            if (obj.villageName == center) {
                                return;
                            }
                            rimHTML += '' +
                                '<tr>' +
                                '<td><input type="checkbox" value="'+obj.villageId + '_' + obj.villageName + '" count="' + obj.cusNum + '" villageName="' + obj.villageName + '" villageId="' + obj.villageId + '" ' + obj.relation + '/></td>' +
                                '<td width="130">' + obj.villageName + '</td>' +
                                '<td><span style="color: #ff0000">' + obj.cusNum + '</span>人</td>' +
                                '<td>' + obj.distance + '米</td>' +
                                '</tr>';

                            addBubble(index + 1, obj, obj.villageName);
                        })

                        $('#districtContainer').empty(); // 清空已经选中的小区
                        checkRange();
                        $('#rimResultList').html(rimHTML)
                        $.each(relationList || [], function(index, obj){ // 加载已经选过小区
                            $('input[villageId="' + obj.districtId + '"]').click();
                        })
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
        $rimResultList.delegate('input[type="checkbox"]', 'click', checkRange)
        function checkRange(e){
            var $selected = $rimResultList.find('input[type="checkbox"]:checked'),
                districtHTML = '',
                count = parseInt($('#centerRegister').val()) || 0,
                names = [$('#saleDistrictName').val()] // 中心小区 默认显示、但不传给后台

            $selected.each(function(index, node){
                var $node = $(node);
                districtHTML += '<input type="hidden" name="districtDTOList[' + index + '].districtId" value="' + $node.attr('villageId') + '"/>';
                districtHTML += '<input type="hidden" name="districtDTOList[' + index + '].districtName" value="' + $node.attr('villageName') + '"/>';

                count += parseInt($node.attr('count'));
                names.push($node.attr('villageName'));
            });

            $('#districtContainer').html(districtHTML); // 覆盖的小区 id name 传给后台
            $('#selectedVillage').text(names.join(',')); // 覆盖的小区
            $('#selectedVillageBrokerCount').text(count); // 总人数
        }

        var $theRange = $('#centerRange'); // 改变搜索范围事件
        $theRange.change(function(){
            searchRim($('#cityId').val(), {
                data:{
                    longitude:$('#longitude').val(),
                    latitude:$('#latitude').val()
                }
            });
        });

        function useless(data) {
            systemMessage({
                type: 'info',
                title: '提示：',
                detail: data.detail
            });
        }

        function checkEmpty() {
            if (!$('#rentalName').val()) {
                systemMessage('租售中心名称不能为空！')
                return true;
            }
        }

    }

    $(document).ready(domReady);




});