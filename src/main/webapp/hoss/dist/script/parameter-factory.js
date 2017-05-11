define(function (require) {


    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var xhr = require('xhr'),
        jsonp = xhr.jsonp

    var datepicker = require('datepicker');

    var queryString = require("script/get-query-string"),
        sysMessage = require('system-message'),
        dateExtend = require('date-extend')


    // modal 列表
    var modalCollections = {
        'default-modal':{
            modal:'' +
                '<div id="default-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">' +
                '   <div class="modal-dialog modal-sm">' +
                '       <div class="modal-content">' +
                '           <div class="modal-body">' +
                '               <input data-type="value" type="text" class="form-control" /><br/>' +
                '               <div class="text-center">' +
                '                   <input type="button" submit value="确定" class="btn btn-success"/>' +
                '                &nbsp;&nbsp;&nbsp;' +
                '                   <input type="button" cancel value="取消" class="btn btn-default" data-dismiss="modal"/>' +
                '               </div>' +
                '           </div>' +
                '       </div>' +
                '   </div>' +
                '</div>',
            queryCode:'',
            callback:function(data){

            }
        },

        'maintainer-modal':{
            modal:'' +
                '<div id="maintainer-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">' +
                '   <div class="modal-dialog modal-sm">' +
                '       <div class="modal-content">' +
                '           <div class="modal-body">' +
                '               <select data-type="value" class="form-control"></select>' +
                '               <br/>' +
                '               <div class="text-center">' +
                '                   <input type="button" submit value="确定" class="btn btn-success"/>' +
                '                &nbsp;&nbsp;&nbsp;' +
                '                   <input type="button" cancel value="取消" class="btn btn-default" data-dismiss="modal"/>' +
                '               </div>' +
                '           </div>' +
                '       </div>' +
                '   </div>' +
                '</div>',
            queryCode:'/hoss/sys/findAuthUserByPositionCodeMyCity.do?positionCode=CITY_INTERMEDIARY_SPECIALIST',
            callback:function(data){
                var optionsHTML = '',
                    checked = 'selected="selected"';
                $.each(data.data.content, function(index, obj){
                    if (index) {
                        checked = '';
                    }
                    optionsHTML += '<option ' + checked + ' value="' + obj.id + '">' + obj.name + '</option>';
                })
                $('#maintainer-modal select').html(optionsHTML);
            }
        },

        'entrust-status-modal':{
            modal:'' +
                '<div id="entrust-status-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">' +
                '   <div class="modal-dialog modal-sm">' +
                '       <div class="modal-content">' +
                '           <div class="modal-body">' +
                '               <select data-type="value" class="form-control">' +
                '               <option value="0">未接单</option>' +
                '               <option value="1">服务中</option>' +
                '               <option value="2">已成交</option>' +
                '               </select>' +
                '               <br/>' +
                '               <div class="text-center">' +
                '                   <input type="button" submit value="确定" class="btn btn-success"/>' +
                '                &nbsp;&nbsp;&nbsp;' +
                '                   <input type="button" cancel value="取消" class="btn btn-default" data-dismiss="modal"/>' +
                '               </div>' +
                '           </div>' +
                '       </div>' +
                '   </div>' +
                '</div>',
            init:function(){
                var orderStatus = queryString('orderStatus')
                var $input = $('#entrust-status-modal [data-type="value"]');
                var $target = $('span[type="entrust-status-modal"]'),
                    toggle = $target.attr('toggle'),
                    type = $target.attr('type'),
                    title = $target.text(),
                    $modal = $('#' + type);

                if (orderStatus) {
                    $input.val(orderStatus);
                    addParameterItem(toggle, title, getParamText($modal, type), getParamValue($modal, type), true); // 添加参数 不出发提交事件
                }
            }
        },

        'interval-modal':{
            modal:'' +
                '<div id="interval-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">' +
                '   <div class="modal-dialog" style="width: 500px;">' +
                '       <div class="modal-content">' +
                '           <div class="modal-body">' +
                '               <div class="search-line text-center" data-type="container">' +
                '                   <input type="text" class="form-control"/>~<input type="text" class="form-control />" ' +
                '               </div>' +
                '               <br/><br/>' +
                '               <div class="text-center">' +
                '                   <input type="button" submit value="确定" class="btn btn-success"/>' +
                '                &nbsp;&nbsp;&nbsp;' +
                '                   <input type="button" cancel value="取消" class="btn btn-default" data-dismiss="modal"/>' +
                '               </div>' +
                '           </div>' +
                '       </div>' +
                '   </div>' +
                '</div>',
            init:function(){

                var $input = $('#interval-modal [data-type="container"] input[type="text"]');
                $input.datepicker({
                    autoclose: true,
                    language: 'zh-CN',
                    dateFormat: 'yyyy-mm-dd'
                });

                $input.eq(0).datepicker('setDate', dateExtend.getNowMonthDay())
                $input.eq(1).datepicker('setDate', dateExtend.getLastMonthDay())
//                $('span[type="interval-modal"]').click(); // 主动触发 modal
//                $('#interval-modal [submit]').click(); // 主动触发点确定
//                addParameterItem('toggle', 'title', 'text', 'value');
                var $target = $('span[type="interval-modal"]'),
                    toggle = $target.attr('toggle'),
                    type = $target.attr('type'),
                    title = $target.text(),
                    $modal = $('#' + type);

                addParameterItem(toggle, title, getParamText($modal, type), getParamValue($modal, type), true); // 添加参数 不出发提交事件
            }
        },

        'city-list-modal':{
            modal:'' +
                '<div class="modal fade in" id="city-list-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="false">' +
                '<div class="modal-dialog modal-lg">' +
                '<div class="modal-content">' +
                '<div class="modal-body">' +
                '<table class="allCityListTable table table-hover">' +
                '<tbody>' +
                '<tr>' +
                '<th><a href="#" class="area-link">华北区</a></th>' +
                '<td><a class="city-link" data-id="120100" data-name="天津市" href="#">天津市</a></td>' +
                '</tr>' +
                '</tbody>' +
                '</table>' +
                '<div class="text-right">' +
                '<input submit type="submit" value="确定" class="btn btn-success"/>&nbsp;&nbsp;&nbsp;' +
                '<input type="button" value="取消" class="btn btn-default" data-dismiss="modal"/>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>\<' +
                '/div>',
            init:function(){
                var $cityListModal = $('#city-list-modal')
                $cityListModal.delegate('[class="city-link"]', 'click', function(e){ // 选中城市
                    setCheckStatus(e, e.currentTarget, 'addClass')
                });

                $cityListModal.delegate('.city-link.city-link-selected', 'click', function(e) { // 取消城市
                    setCheckStatus(e, e.currentTarget, 'removeClass')
                });

                $cityListModal.delegate('[class="area-link"]', 'click', function(e){ // 选中区域
                    var target = e.currentTarget;
                    setCheckStatus(e, target, 'addClass');
                })

                $cityListModal.delegate('.area-link.city-link-selected', 'click', function(e){ // 取消区域
                    var target = e.currentTarget;
                    setCheckStatus(e, target, 'removeClass');
                })
            },
            queryCode:'/hoss/sys/findMyBigAreaDTOListByUserId.do',
            callback:function(data){
                var cityListHTML = '',
                    checked = 'selected="selected"';
                $.each(data.data.content, function(index, children){
                    cityListHTML += '<tr><th width="80"><a href="#" class="area-link" data-id="' + children.id + '">' + children.name + '</a></th><td>';
                    $.each(children.chlidren, function(index, children){
                        cityListHTML += '<a class="city-link"  data-id="' + children.id + '"  href="#">' + children.name + '</a>';
                    });
                    cityListHTML += '</td></tr>';
                })

//                '<tr>' +
//                '<th><a href="#" class="area-link">华北区</a></th>' +
//                '<td><a class="city-link" data-id="120100" data-name="天津市" href="#">天津市</a></td>' +
//                '</tr>' +
                $('#city-list-modal tbody').html(cityListHTML);
            }
        }

    };

    var $parameterBody;

    /** 绑定参数
     *
     * @param $container
     * @param parameters
     * {
     *  key:{
     *      text:显示文本
     *      placeholder:
     *      type :  city-list-modal 区域     default-modal 普通文本   maintainer-modal 维护人    entrust-status-modal 委托状态  interval-modal 时间段
     *   }
     * }
     *
     */
    function bindFactory($container, parameters){

        $container.html('<div parameters-title-box class="">' +
            '精确搜索：' +
            '</div>' +
            '<div class="parameter-body">' +
            '</div>'
        );

        $parameterBody = $container.find('.parameter-body');

        // 添加参数事件
        $container.delegate('span[toggle]', 'click', addParameterClick)
        $container.delegate('.glyphicon-remove', 'click', removeParameterClick)

        showParameters($container, parameters);
    }

    // 显示参数添加列表
    function showParameters($container, collections){
        var $parametersTitleBox = $container.find('[parameters-title-box]')
        $.each(collections, function(key, obj){
            var $title = $('<span class="parameter-title" toggle="' + key + '" placeholder="' + obj.placeholder + '" type="' + obj.type + '">' + obj.text + '</span>');
            $parametersTitleBox.append($title);

        });

        registerModal(collections); // 根据传入参数 注册 modal
    }

    // 将所需 modal 添加到页面
    function registerModal(collections){

        var $body = $(document.body);

        $.each(collections, function(key, param){
            var modalObj = modalCollections[param.type];
            if (!modalObj) {
                return;
            }

            $body.append($(modalObj.modal)); // 将 modal 插入页面

            if (modalObj.queryCode) { // 需要请求异步数据
                $.ajax($.extend({
                    url: apiHost + modalObj.queryCode,
                    data:''
                }, jsonp)).
                    done(function (data) {
                        modalObj.callback(data);
                    })
            }

            if (modalObj.init) { // 初始化
                modalObj.init();
            }
        })

    }

    // 添加参数事件
    function addParameterClick(e) {
        var $target = $(e.currentTarget),
            toggle = $target.attr('toggle'),
            placeholder = $target.attr('placeholder'),
            type = $target.attr('type'),
            title = $target.text();

        var $modal = $('#' + type),
            $submit = $modal.find('[submit]'),
            $value = $modal.find('[data-type="value"]').attr('placeholder', placeholder);

        setOldValue($modal, $value, toggle, type);

        if (!$modal.length) { // 点击了不存在的 modal
            sysMessage('不存在的 modal');
            return;
        }

        // 显示 modal
        $modal.modal();

        // 确定按钮   off 避免 上次框取消后，下次确定会加多个框
        $submit.off('click').one('click', function(){
            addParameterItem(toggle, title, getParamText($modal, type), getParamValue($modal, type));
            $modal.modal('hide'); // 隐藏 modal
        })
    }

    /** 新增 | 替换  参数
     *
     * @param toggle 请求 key 名字
     * @param title 参数标题
     * @param text 参数表面文本
     * @param value 参数值
     */
    function addParameterItem(toggle, title, text, value, noResearch){
        if (!value) { // 添加了空值
            return;
        }

        var $parameterItem = $('<span class="parameter-item">' +
            '   <span class="glyphicon glyphicon-remove pointer" aria-hidden="true">' +
            '   </span> ' +
            title + '：'+ text +
            '   <input type="hidden" name="' + toggle + '" value="' + value + '"/>' +
            '</span>');

        var oldItem = $parameterBody.find('input[name="' + toggle + '"]').closest('.parameter-item');

        if (oldItem.length) { // 更新旧参数
            $parameterItem.insertBefore(oldItem);
            oldItem.remove();
        } else {  // 新参数
            $parameterBody.append($parameterItem);
        }

        if (!noResearch) {
            research($parameterItem.closest('form')); // 重新查询
        }

    }

    /** 设置旧值
     *
     * @param $modal 当前操作的 $modal
     * @param $value 当前操作的基本文本框
     * @param toggle 请求 key 的 name
     * @param type modal type
     */
    function setOldValue($modal, $value, toggle, type){
        // 设置旧值
        var oldValue = $parameterBody.find('input[name="' + toggle + '"]').val();
        var tagName = $value[0] ? $value[0].tagName :'';

        if (tagName == 'INPUT') {
            $value.val(oldValue);
        }

        if (tagName == 'SELECT' && oldValue) {
            $value.val(oldValue);
        }
    }

    /**
     * 获取真实 value 文本
     * @param $modal 操作的 $modal
     * @param type modal type
     */
    function getParamValue($modal, type){
        var value = '',
            valueArray = []
        if (type == 'default-modal' || type == 'maintainer-modal' || type == 'entrust-status-modal') {
            value = $modal.find('[data-type="value"]').val();
        } else if (type == 'interval-modal') {
            valueArray = $modal.find('[data-type="container"] input[type="text"]').map(function(index, node){
                return $(node).val();
            }).toArray();
            if (valueArray[0] && valueArray[1]) { // 两个时间都选 才有效
                value = valueArray.join(',');
            }
        } else if (type =='city-list-modal') {
//            $modal.find('[class="area-link"]').each(function(index, areaLink){ // 选中的单个城市
//                $(areaLink).closest('tr').find('.city-link.city-link-selected').each(function(index, cityLink){
//                    valueArray.push($(cityLink).attr('data-id'));
//                });
//            });

            $modal.find('.city-link.city-link-selected').each(function(index, areaLink){ // 选中的大区
                    valueArray.push($(areaLink).attr('data-id'))
            });

            value = valueArray.join(',');
        }

        return value;
    }

    /**
     * 获取参数标题后跟随的文本
     * @param $modal 当前操作的 $modal
     * @param type modal type
     */
    function getParamText($modal, type){
        var text = '',
            textArray = [],
            abbr = true,
            cut;

        if (type == 'default-modal') {
            text = $modal.find('[data-type="value"]').val();
        } else if (type == 'maintainer-modal' || type == 'entrust-status-modal') {
            text = $modal.find('[data-type="value"] option:selected').text();
        } else if (type == 'interval-modal') {
            text = $modal.find('[data-type="container"] input[type="text"]').map(function(index, node){
                return $(node).val();
            }).toArray().join('~');
            abbr = false; // 时间不缩写
        } else if (type =='city-list-modal') {
            $modal.find('[class="area-link"]').each(function(index, areaLink){ // 选中的单个城市
                $(areaLink).closest('tr').find('.city-link.city-link-selected').each(function(index, cityLink){
                    textArray.push($(cityLink).text());
                });
            });

            $modal.find('.area-link.city-link-selected').each(function(index, areaLink){ // 选中的大区
                textArray.push($(areaLink).text())
            });

            text = textArray.join(',');
        }

        if (text.length > 11 && abbr) { // 裁剪文本， 避免过长
            cut = text.substr(0, 8) + '...';
        } else {
            cut = text;
        }

        return '<span title="' + text + '">' + cut + '</span>';
    }

    // 删除参数
    function removeParameterClick(e) {
        var $target = $(e.currentTarget);
        var $form = $target.closest('form');
        $target.closest('.parameter-item').remove();
//        $form.submit();
        research($form);
    }

    // 变更条件后重新查询
    function research($form){
        $form.find('[name="page"]').val(0); // 变更条件后要从第一页开始查询
        $form.submit();
    }


    /**
     * 添加或者移除选中状态
     * @param e Event
     * @param target Event.currentTarget
     * @param method addClass | removeClass
     */
    function setCheckStatus(e, target, method){
        if (e) {
            e.preventDefault();
        }
        var $target = $(target),
            $tr = $target.closest('tr'),
            $areaLink = $tr.find('.area-link'),
            $cityLink,
            $cityLinkSelected;

        // 更新状态
        $(target)[method]('city-link-selected');


        $cityLink = $tr.find('.city-link');
        $cityLinkSelected = $tr.find('.city-link.city-link-selected');

        if ($target.hasClass('area-link')) { // 区域下的子集也需要更新选中状态
            $cityLink.each(function(index, target){
                $(target)[method]('city-link-selected');
            });
        } else { // 子集状态也会更新父级是否选中
            if ($cityLinkSelected.length == $cityLink.length) { // 设置区域选中
                $areaLink.addClass('city-link-selected');
            } else { // 取消区域选中
                $areaLink.removeClass('city-link-selected');
            }
        }
    }

    return {
        bindFactory:bindFactory
	};
});


