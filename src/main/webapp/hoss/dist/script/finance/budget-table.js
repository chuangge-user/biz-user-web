define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');

    var pagination = require('pagination');

    var confirmation = require('bootstrap/confirmation');

    var systemMessage = require('system-message');


    var accounting = require("accounting");

    $(function () {
        var $approvalListTab = $('#approvalListTab');
        $approvalListTab.find('a:first').tab('show');
        $("a.toTab").click(function () {
            $("html, body").animate({
                scrollTop: $approvalListTab.offset().top + "px"
            }, {
                duration: 500,
                easing: "swing"
            });
            return false;
        });
        $(".goback").click(function () {
            history.back();
            return false;
        });
    });


    $(document).ready(function () {


        var $city = $('#cityId'),
            $project=$('#projectId'),
            isEmptyValue = '';

        window.excelDownload =function(){
            var id = $("#projectId").val();
            if(-1==id||"-1"==id){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail:  '请选择项目！'
                });
                return false;
            }
            var uu = apiHost + '/hoss/sys/finance/toExcelDownloadByFinance.do?projectId='+id;
            $('#excelId').attr('href',uu);
        }

        // 获取项目信息
        $project.on('change', function () {
            var that = this;

            if ($.trim(this.value) == isEmptyValue) {
                return;
            }
            getProjectInfo($project.val());
        });
        //城市数据加载
        var projectUtil = require("script/project/project-util");
        projectUtil.bindingProjectAndCity('projectId', 'cityId', function() {

            if(""!=$project.val()&&!isNaN($project.val())&&-1!=$project.val()){
                getProjectInfo($project.val())
            }
        });

        function getProjectInfo(obj){

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/finance/findFinanceByProjectId.do',
                data: {projectId: obj}
            }, jsonp))
                .done(function (data) {
                    doneCallback.call(
                        this,
                        data,
                        function (data) {
                            if("1"!=data.status&&1!=data.status){
                                systemMessage({
                                    type: 'error',
                                    title: '提示：',
                                    detail: data.detail || '获取数据失败！'
                                });
                            }else{
                                $("#showInfo").html(
                                    template('tabContentTemplate', data)
                                );
                                $("#dataShow").text(data.data.start_date+"至"+data.data.end_date);

                                /***********************************颜色***********************************/
//
//                                    //支出二级目录，还有三级
//                                checkColor(data.data.cbvo.outcome,data.data.projectBudgetVo.outcome,"outcome");
//
//                                checkColor(data.data.cbvo.haowu_outcome,data.data.projectBudgetVo.haowu_outcome,"haowu_outcome");
//                                checkColor(data.data.cbvo.path_commission,data.data.projectBudgetVo.path_commission,"path_commission");
//                                checkColor(data.data.cbvo.path_reward,data.data.projectBudgetVo.path_reward,"path_reward");
//                                checkColor(data.data.cbvo.pact_outcome,data.data.projectBudgetVo.pact_outcome,"pact_outcome");
//                                checkColor(data.data.cbvo.other_outcome,data.data.projectBudgetVo.other_outcome,"other_outcome");
//                                checkColor(data.data.cbvo.tax_outcome,data.data.projectBudgetVo.tax_outcome,"tax_outcome");
//                                checkColor(data.data.cbvo.share_outcome,data.data.projectBudgetVo.share_outcome,"share_outcome");
//
//                                //支出三级目录
//                                checkColor(data.data.cbvo.rob_spread_outcome,data.data.projectBudgetVo.rob_spread_outcome,"rob_spread_outcome");
//
//                                checkColor(data.data.cbvo.conduit_outcome,data.data.projectBudgetVo.conduit_outcome,"conduit_outcome");
//                                checkColor(data.data.cbvo.no_conduit_outcome,data.data.projectBudgetVo.no_conduit_outcome,"no_conduit_outcome");
//
//                                checkColor(data.data.cbvo.broker_work_outcome,data.data.projectBudgetVo.broker_work_outcome,"broker_work_outcome");
//                                checkColor(data.data.cbvo.broker_bus_outcome,data.data.projectBudgetVo.broker_bus_outcome,"broker_bus_outcome");
//
//                                checkColor(data.data.cbvo.full_pact_outcome,data.data.projectBudgetVo.full_pact_outcome,"full_pact_outcome");
//
//                                checkColor(data.data.cbvo.activity_ground_outcome,data.data.projectBudgetVo.activity_ground_outcome,"activity_ground_outcome");
//                                checkColor(data.data.cbvo.other_work_outcome,data.data.projectBudgetVo.other_work_outcome,"other_work_outcome");
//                                checkColor(data.data.cbvo.activity_spread_outcome,data.data.projectBudgetVo.activity_spread_outcome,"activity_spread_outcome");
//                                checkColor(data.data.cbvo.other_spread_outcome,data.data.projectBudgetVo.other_spread_outcome,"other_spread_outcome");
//
//                                checkColor((data.data.cbvo.haowu_outcome + data.data.cbvo.path_commission+ data.data.cbvo.path_reward+ data.data.cbvo.pact_outcome+ data.data.cbvo.other_outcome),
//                                    (data.data.projectBudgetVo.haowu_outcome + data.data.projectBudgetVo.path_commission+ data.data.projectBudgetVo.path_reward+ data.data.projectBudgetVo.pact_outcome+ data.data.projectBudgetVo.other_outcome),
//                                    "zhijie");
//
//                                checkColor(data.data.cbvo.sub_tax_outcome,data.data.projectBudgetVo.sub_tax_outcome,"sub_tax_outcome");
//
//                                checkColor(data.data.cbvo.manage_share_outcome,data.data.projectBudgetVo.manage_share_outcome,"manage_share_outcome");
//                                checkColor(data.data.cbvo.platform_share_outcome,data.data.projectBudgetVo.platform_share_outcome,"platform_share_outcome");
//
//                                checkColor((data.data.cbvo.income-data.data.cbvo.outcome),(data.data.projectBudgetVo.income-data.data.projectBudgetVo.outcome),"lirun");
                            }
                        }
                    );
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取项目信息失败');
                })
                .always(function (data) {});
        }
    });


    window.checkDiv=checkDiv;
    function checkDiv(num1,num2){
        var num = 0;
        if(0!=accounting.unformat(num2)&&"0"!=accounting.unformat(num2)){
            num= (accounting.unformat(num1)/(num2)*100).toFixed(2);
        }
        return accounting.formatMoney(num,"",2,",",".","");

    }
    window.checkColor=checkColor;
    function checkColor(num1,num2,name){
        if(parseFloat(num1)>=parseFloat(num2)&&parseFloat(num2)>0){
            $("#"+name).addClass("td-red");
        }else{
            $("#"+name).removeClass("td-red");
        }
    }
    window.checkSub=checkSub;
    function checkSub(num1,num2){
        var num = 0;

        num = (parseFloat(accounting.unformat(num1))-parseFloat(accounting.unformat(num2))).toFixed(2);

        return accounting.formatMoney(num,"",2,",",".","");

    }

});


