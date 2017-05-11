define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue;

    var template = require('template');


    /**
     * 获得金额汇总
     * @param apiAddress 接口地址
     */
    function getMondySummary(apiAddress, $searchForm, $template, $isAppend) {
        var $totalMoneyDetail = $('#totalMoneyDetail');
        if (!$template)
            $template = 'totalMoneyDetailTemplate';

        function moneySummary() {
            $.ajax($.extend({
                url: apiHost + apiAddress,
                data: clearEmptyValue($searchForm),
                beforeSend: function () {
                },
                success: function(data){
                    //是否附加数据
                    if ($isAppend) {
                        $totalMoneyDetail.append(
                            template($template, data)
                        );
                    } else {
                        $totalMoneyDetail.html(
                            template($template, data)
                        );
                    }
                },
                error: function(){
                    $totalMoneyDetail.html('<font color="red">汇总失败</font>');
                }
            }, jsonp));
        }

        moneySummary();

        //查询按钮事件(防止点击翻页时都去请求金额汇总接口)
        $searchForm.find('input[type="submit"]').off('click').on('click', function(e){
            e.preventDefault();
            moneySummary();
            $searchForm.submit();
        });
    }


    return {
        getMondySummary: getMondySummary
    };

});