define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    require(['jquery', 'datepicker', 'dist/script/bootstrap.min']);

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

    // 参数工厂
    var parameterFactory = require('script/parameter-factory');

//    修改维护人接口
    var CHANGE_SINGLE_MAINTAIN = '/sale/center/changeSingleMaintain.do',
        CHANGE_BATCH_MAINTAIN = '/sale/center/changeBatchMaintain.do'


    function domReady() {

        // 初始化参数
        parameterFactory.bindFactory($('#parameterContainer'), {
            'cityIdArray': {
                text: '城市',
                type: 'city-list-modal'
            },
            'rentalName':{
                text:'租售中心名称',
                placeholder:'',
                type:'default-modal'
            },
            'saleDistrictName':{
                text:'小区名称',
                placeholder:'',
                type:'default-modal'
            },
            'rentalName':{
                text:'租售中心名称',
                placeholder:'',
                type:'default-modal'
            },
            'maintainId':{
                text:'维护人',
                type:'maintainer-modal'
            }
//            ,
//            'status':{
//                text:'委托状态',
//                type:'entrust-status-modal'
//            },
//            'brokerInfo':{
//                text:'经纪人',
//                placeholder:'请输入姓名或手机号',
//                type:'default-modal'
//            },
//
//            'time':{
//                text:'时间段',
//                type:'interval-modal'
//            }
        })

        initFixParams();


        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate',
            queryListCode = '/sale/saleCenter/qrySaleCenterList.do'

        // 获取列表
        $searchForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]'),
                $searchResultList = $('#searchResultList')

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');


            $.ajax($.extend({
                url: apiHost + queryListCode,
                data:clearEmptyValue($context),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                                searchResultTemplate :
                                messageTemplate;

                        // 显示数据
                        $searchResultList.html(
                            template(templateId, data)
                        );

                        // 显示分页
                        $searchResultPagination.pagination({
                            $form: $context,
                            totalSize: dataObj.totalElements,
                            pageSize: parseInt($pageSize.val()),
                            visiblePages: 5,
                            info: true,
                            paginationInfoClass: 'pagination-count pull-left',
                            paginationClass: 'pagination pull-right',
                            onPageClick: function (event, index) {
                                $pageNum.val(index - 1);
                                $context.trigger('submit');
                            }
                        });


                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取列表数据失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        }).trigger('submit');

        $searchResultList.delegate('input[type=checkbox]', 'click', function(e){
            var $target = $(e.currentTarget),
                cityId = $target.val(),
                $notMyCity = $searchResultList.find('input[value!=' + cityId + ']'),
                checkedLength = $searchResultList.find('input:checked').length

            $searchResultList.find('input[type=checkbox]').prop('disabled', false);
            if ($target.is(':checked') || checkedLength > 0) {
                $notMyCity.prop('disabled', true);
            }
        })

        function useless(data) {
            systemMessage({
                type: 'info',
                title: '提示：',
                detail: data.detail
            });
        }

        // 全选
        var $selectAllBtn = $('#selectAllBtn'),
            $centerIdContainer = $('#centerIdContainer')
        $selectAllBtn.click(function(e){
            e.preventDefault();
            $searchResultList.find('input[type="checkbox"]').not(':checked').click();
        });
        // 批量修改
        $('#changeAllBtn').click(function(){
            var cityIds = [],
                oneCity = true,
                centerIdHTML = ''
            $searchResultList.find('input[type="checkbox"]:checked').closest('tr').each(function(index, tr){
                var $tr = $(tr);
                cityIds.push($tr.find('[cityId]').val());
                if (cityIds[cityIds.length - 1] != cityIds[0]) {
                    oneCity = false;
                }

                centerIdHTML += getCenterIdHTML(index, $tr.find('[centerId]').val());
            })

            $('#cityId').val(cityIds[0]);

            if (!oneCity) {
                systemMessage('必须选中同一城市信息才能批量修改');
                return;
            }
            if (!cityIds.length) {
                systemMessage('请至少选中一个租售中心！');
                return;
            }
            $centerIdContainer.html(centerIdHTML);
            getCommissioner(cityIds[0]);
        });

        // 修改维护人
        var $changeModal = $('#changeModal'),
            $changeForm = $('#changeForm'),
            $maintainId = $('#maintainId'),
            $maintainName = $('#maintainName')
//            $centerId = $('#centerId'),
//            $centerIds = $('#centerIds')
        $searchResultList.delegate('a[change]', 'click', function(e){ // 单个维护人
            e.preventDefault();

            var $target = $(e.currentTarget),
                $tr = $target.closest('tr'),
                cityId = $tr.find('[cityId]').val(),
                centerId= $tr.find('[centerId]').val(),
                maintainId = $tr.find('[maintainId]').val()


            $('#cityId').val(cityId);

//            $changeCode.val(CHANGE_SINGLE_MAINTAIN); // 修改单个接口
//            $changeCode.val(CHANGE_BATCH_MAINTAIN); // 修改单个接口
//            $centerIds.val(centerId);
            $centerIdContainer.html(getCenterIdHTML(0, centerId));

            getCommissioner(cityId, maintainId);
        })
        function getCenterIdHTML(index, id){
            return '<input type="hidden" name="centerIds[' + index + ']" value="' + id + '"/>';
        }

        // 获取维护人列表
        function getCommissioner(cityId, maintainId) {
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/findAuthUserPageByPositionCodeAndRegionId.do?positionCode=CITY_INTERMEDIARY_SPECIALIST&cityId=' + cityId,
                data:''
            }, jsonp)).
                done(function (data) {
                    var options = $.map(data.data.content, function(obj){
                        return '<option value="' + obj.id + '">' + obj.name + '</option>'
                    }).join('')
                    $maintainId.html(options);
                    if (maintainId) {
                        $maintainId.val(maintainId);
                    }
                    $maintainId.change();
                    $changeModal.modal();
                })
        }

        // 提交修改维护人
        $changeForm.submit(function(e){
            e.preventDefault();

            $.ajax($.extend({
                url: apiHost + '/sale/center/changeBatchMaintain.do',
                data:clearEmptyValue($changeForm)
            }, jsonp)).
                done(function (data) {

                    function useful(data) {
                        var dataObj = data.data || {};

                        $changeModal.modal('hide');
                        $searchForm.submit();
                    }

                    doneCallback.call(this, data, useful, useless);

                })
        });

        // 维护人名字也要传、有个卵用？
        $maintainId.change(function(){
            $maintainName.val($maintainId.find('option:checked').text());
        });

        /**
         * 初始化
         */
        function initFixParams(){
            $('#cityIdQueryList').val(queryString('cityIdQueryList'));
            $('#agencyStatus').val(queryString('agencyStatus'));
            $('#startDate').val(queryString('startDate'));
            $('#endDate').val(queryString('endDate'));
            $('#orgId').val(queryString('orgId'));
        }


    }

    $(document).ready(domReady);




});