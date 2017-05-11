(function (global) {

//     var baseUrl = global.location.protocol + '//' + global.location.host + '/hoss-v2/',
    var baseUrl = global.location.protocol + '//' + global.location.host + '/biz-user-web/hoss/',

        script = 'dist/script',
        widget = 'dist/widget';

    require.baseUrl = baseUrl;

    require.config({
        // 基础路径
        baseUrl: baseUrl,

        paths: {
            // 路径配置 简化路径
            'script': script,
            'widget': widget,

            'bootstrap':'lib/bootstrap/3.2.0',
            'echarts':'lib/echarts/2.0.1',
            'zrender':'lib/echarts/2.0.1/zrender',



            // 别名配置 简化模块标识符
            'jquery': 'lib/jquery/2.1.1/jquery',
            'template': 'lib/template/3.0.0/template',

            'hoss': script + '/hoss',
            'xhr': script + '/xhr',
            'navigation': script + '/navigation',
            'help': script + '/help',

            'area-picker': script + '/area-picker',
            'date-extend': script + '/date-extend',
            'accounting': script + '/accounting',
            'fileupload': script + '/ajaxfileupload',
            'get-query-string': script + '/get-query-string',
            'system-message': script + '/system-message',
            'select-checkbox': script + '/select-checkbox',
            'load-css': script + '/load-css',
            'event-proxy': script + '/event-proxy',

            'autocomplete': widget + '/autocomplete/autocomplete',
            'datepicker': widget + '/datepicker/datepicker',
            'datetimepicker': widget + '/datetimepicker/datetimepicker',
            'pagination': widget + '/pagination/pagination',
            'placeholder': widget + '/placeholder/placeholder',
            'ztree': widget + '/ztree/ztree',
            'jqprint': script + '/jqprint',
            'ztree-exhide': widget + '/ztree/ztree-exhide',
            'jqprint-util': script + '/jqprint-util',
            'checkSubmit': script + '/checkSubmit',
            'moneySummary': script + '/moneySummary'
        }
    });

}(this));