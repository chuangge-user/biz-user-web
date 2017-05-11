/**
 * 中介客户管理
 */
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

    function domReady() {

        var $joinerModal = $('#joinerModal');
        $('#joiner').click(function(){
            $joinerModal.modal('show');
        });

        var $roundList = $('#roundList'),
            $roundName = $('#roundName')
        $('#round').click(function(e){
            $roundList.toggle();
        });
        $roundList.delegate('li', 'click', function(e){
            $roundName.text($(e.currentTarget).text());

            systemMessage(
            $(e.currentTarget).text()
            )
        })

        var icon = {w:21,h:25,l:0,t:25,x:6,lb:5}; //默认icon处理位置

        var _icon = icon;

        var $allmap = $('#allmap');
//        $allmap.width($allmap.parent().width());

        // 百度地图API功能
        var map = new BMap.Map("allmap");
        var point = new BMap.Point(0,0);
        map.centerAndZoom(point, 13);
        map.enableScrollWheelZoom(true);   //启用滚轮放大缩小，默认禁用
        map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用

//        map.setCenter(cityInfo.cityName);
        map.setCenter('上海市');

//        // 编写自定义函数,创建标注
//        function addMarker(point, i){
//            var iconImg = createIcon(_icon, i);
//            var marker = new BMap.Marker(point,{icon:iconImg});
//
//            map.addOverlay(marker);
//        }
//
////
//        $.each(content, function (index, item){
//            addMarker(new BMap.Point(item.longitude, item.latitude), index);
//        });
//
//
//
//
//
//        //创建一个Icon
//        function createIcon(json, index){
//            picUrl = apiHost + '/hoss-v2/dist/image/points.png';
//            var imageOffset = new BMap.Size(-json.l,-json.t*11);
//            if(index < 10){
//                imageOffset = new BMap.Size(-json.l,-index * 25);
//            }
//            var icon = new BMap.Icon(picUrl, new BMap.Size(json.w,json.h),{imageOffset: imageOffset});
//            return icon;
//        }

    }

    $(document).ready(domReady);




});