define(function (require) {

    var $ = require('jquery');
            require('jqprint');

    /**
     * 触发打印功能
     */
    $('button[name=printPluginBtn]').on("click", function() {
        $("title").remove();
        //处理<a></a>标签打印显示问题故克隆在修改dom元素
        var $newPrintDom = $("#printDiv").clone(true);
            $newPrintDom.find("button[name=printPluginBtn]").remove();
            // $newPrintDom.find("a").replaceWith("<span></pan>");
            $.each($newPrintDom.find("a"),
                function(index, item){
                    $(this).replaceWith("<span>" + $(this).text() + "</span>");
                }
            )
            $.each($newPrintDom.find("input:not([hidden=hidden])"),
                function(index, item) {
                    var key = $(item).attr("name");
                    var $newInput = $newPrintDom.find("input[name='" + key + "']");
                        $newInput.replaceWith("<span>" + $(item).val() + "</span>")
                }
            )
            $.each($newPrintDom.find("textarea"),
                function(index, item){
                    $(this).replaceWith("<span>" + $(this).text() + "</span>");
                }
            )
            try{
                $newPrintDom.jqprint();
            }catch(e) {
                throw 'print error!';
            }
    });
});