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

    var workflowProp = require('script/approval/workflow-properties');
    var flowStatus = workflowProp.flowStatus;
    var workflowObj = workflowProp.workflowObj;
    var processKey = workflowProp.definitionConstants.YDYS;

    var getQueryString = require('script/get-query-string');
    var businessKey = "";
    var wfInstanceId = "";
    var taskId = "";

    var accounting = require("accounting");

    $(function () {
        var $flow = $("#flow");
        $("a.toTab").click(function () {
            $("html, body").animate({
                scrollTop: $flow.offset().top + "px"
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

        workflowObj.wfInstanceId = wfInstanceId;
        workflowObj.businessKey = businessKey;
        workflowObj.taskId = taskId;
        workflowObj.processKey = processKey;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowObj.flowType = 'new';
        workflowProp.showWorkFlowAll(workflowObj);

        var $city = $('#cityId'),
            $project=$('#projectId'),
            isEmptyValue = '';

        // 获取项目信息
        $project.on('change', function () {
            var that = this;

            if ($.trim(this.value) == isEmptyValue) {
                return;
            }
            getMonthInfo(this.value);
        });

        //城市数据加载
        var projectUtil = require("script/project/project-util");
        var first_project = getQueryString("projectId");
        projectUtil.bindingProjectAndCity('projectId', 'cityId',function() {
            if(null!=getQueryString('cityId')&&"null"!=getQueryString('cityId')&&""!=getQueryString('cityId')&&"Null"!=getQueryString('cityId')){
                $("#cityId").val(getQueryString('cityId'));
                $("#cityId").trigger('change', function () {
                    if(null!=getQueryString('projectId')&&"null"!=getQueryString('projectId')&&""!=getQueryString('projectId')&&"Null"!=getQueryString('projectId')){
                        $("#projectId").val(getQueryString('projectId'));
                    }
                    if(null!=first_project&&"null"!=first_project&&""!=first_project&&"Null"!=first_project){
                        getMonthInfo(first_project);
                        first_project = null;
                    }
                });
            }

            if(""!=$project.val()&&!isNaN($project.val())&&-1!=$project.val()){
                getMonthInfo($project.val())
            }
        });


        function getMonthInfo(obj){

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/month/findMonthByProjectId.do',
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

                                checkNum();
                                doCheckMonth(data.data.end_date);
                            }
                        }
                    );
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取项目信息失败');
                })
                .always(function (data) {});
        }

        // 提交审批
        $("#warningBtn").on('click', function () {
            if(!confirm('确定提交审批吗?')){
                return false;
            }
            $("#createForm").attr('action',apiHost+'/hoss/sys/month/addMonthBy.do');
            $("#flowDealType").val("submit");
            $("#createForm").submit();
        });
        //保存草稿
        $("#infoBtn").on('click', function () {
            $("#createForm").attr('action',apiHost+'/hoss/sys/month/addMonthBy.do');
            $("#flowDealType").val("draft");
            $("#createForm").submit();
        });

        window.deleteDiv =function(id){
            var uid = "deleteId"+id;
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/fileDelete/deleteDocument.do',
                data: {
                    id:id
                },
                success:function(data){
                    var dataObj = data.data || {};
                    if("1"==data.status){
                        $("#"+uid+"").hide();
                        systemMessage("删除文件成功")
                    }else{
                        systemMessage("删除文件失败")
                    }
                },
                error: function(jqXHR){
                    failCallback(jqXHR, '操作文件失败');
                }
            }, jsonp));
        }
    });


    window.change=change;
    function change(typeName,num){
        var num1 = checkComma(num);
        var hiddennow='#'+typeName;
        var bb='#s_'+typeName+"";
        if(""==num1||isNaN(num1)||parseFloat(num1).toFixed(2)<0){
            $(hiddennow).val(0);
            $(bb).val("0.00");
        }else{
            $(bb).val(accounting.formatMoney(num1,"",2,",",".",""));
            $(hiddennow).val(parseFloat(num1).toFixed(2));
        }
        checkNum();
    }
    window.changeb=changeb;
    function changeb(typeName,num1){
        var hiddennow='#'+typeName+"_b";
        $(hiddennow).val(num1);
        checkNum();
    }
    window.checkNum=checkNum;
    function checkNum(){

        var  group_buy_income=$("#group_buy_income").val();
        var  separate_income=$("#separate_income").val();
        var  advertise_income=$("#advertise_income").val();
        var  other_income=$("#other_income").val();
        var income = (parseFloat(group_buy_income)+parseFloat(separate_income)+parseFloat(advertise_income)+parseFloat(other_income)).toFixed(2);

        $("#s_income").text(accounting.formatMoney(income,"",2,",",".",""));
        if(0!=parseFloat(income)){
            $("#income").text(income);
            $("#b_group_buy_income").text((parseFloat(group_buy_income)/parseFloat(income)*100).toFixed(2));
            $("#b_separate_income").text((parseFloat(separate_income)/parseFloat(income)*100).toFixed(2));
            $("#b_advertise_income").text((parseFloat(advertise_income)/parseFloat(income)*100).toFixed(2));
            $("#b_other_income").text((parseFloat(other_income)/parseFloat(income)*100).toFixed(2));
            $("#b_income").text((parseFloat(income)/parseFloat(income)*100).toFixed(2));
        }else{
            $("#income").text("0.00");
            $("#b_group_buy_income").text("0.00");
            $("#b_separate_income").text("0.00");
            $("#b_advertise_income").text("0.00");
            $("#b_other_income").text("0.00");
            $("#b_income").text("0.00");
        }

        //支出三级目录
        var  rob_spread_outcome=$("#rob_spread_outcome").val();

        var  conduit_outcome=$("#conduit_outcome").val();
        var  no_conduit_outcome=$("#no_conduit_outcome").val();

        var  broker_work_outcome=$("#broker_work_outcome").val();
        var  broker_bus_outcome=$("#broker_bus_outcome").val();

        var  full_pact_outcome=$("#full_pact_outcome").val();

        var  activity_ground_outcome=$("#activity_ground_outcome").val();
        var  other_work_outcome=$("#other_work_outcome").val();
        var  activity_spread_outcome=$("#activity_spread_outcome").val();
        var  other_spread_outcome=$("#other_spread_outcome").val();

        var  sub_tax_outcome=(parseFloat(income)*$("#b_sub_tax_outcome").val()/100).toFixed(2);

        var  manage_share_outcome=(parseFloat(income)*$("#b_manage_share_outcome").val()/100).toFixed(2);
        var  platform_share_outcome=(parseFloat(income)*$("#b_platform_share_outcome").val()/100).toFixed(2);

        //支出二级目录，还有三级
        var  haowu_outcome=(parseFloat(rob_spread_outcome)).toFixed(2);
        var  path_commission=(parseFloat(conduit_outcome)+parseFloat(no_conduit_outcome)).toFixed(2);
        var  path_reward=(parseFloat(broker_work_outcome)+parseFloat(broker_bus_outcome)).toFixed(2);
        var  pact_outcome=(parseFloat(full_pact_outcome)).toFixed(2);
        var  other_outcome=(parseFloat(activity_ground_outcome)+parseFloat(other_work_outcome)+parseFloat(activity_spread_outcome)+parseFloat(other_spread_outcome)).toFixed(2);;
        var  tax_outcome=(parseFloat(sub_tax_outcome)).toFixed(2);
        var  share_outcome=(parseFloat(manage_share_outcome)+parseFloat(platform_share_outcome)).toFixed(2);

        var zhijiecome = (parseFloat(haowu_outcome)+parseFloat(path_commission)+parseFloat(path_reward)+parseFloat(pact_outcome)+parseFloat(other_outcome)).toFixed(2);;
        var outcome = (parseFloat(haowu_outcome)+parseFloat(path_commission)+parseFloat(path_reward)+parseFloat(pact_outcome)+parseFloat(other_outcome)+parseFloat(tax_outcome)+parseFloat(share_outcome)).toFixed(2);

        var mycome = (parseFloat(income)-parseFloat(outcome)).toFixed(2);

        $("#s_haowu_outcome").text(accounting.formatMoney(haowu_outcome,"",2,",",".",""));
        $("#s_path_commission").text(accounting.formatMoney(path_commission,"",2,",",".",""));
        $("#s_path_reward").text(accounting.formatMoney(path_reward,"",2,",",".",""));
        $("#s_pact_outcome").text(accounting.formatMoney(pact_outcome,"",2,",",".",""));
        $("#s_other_outcome").text(accounting.formatMoney(other_outcome,"",2,",",".",""));
        $("#s_tax_outcome").text(accounting.formatMoney(tax_outcome,"",2,",",".",""));
        $("#s_share_outcome").text(accounting.formatMoney(share_outcome,"",2,",",".",""));
        $("#s_zhijiecome").text(accounting.formatMoney(zhijiecome,"",2,",",".",""));
        $("#s_outcome").text(accounting.formatMoney(outcome,"",2,",",".",""));

        $("#s_sub_tax_outcome").text(accounting.formatMoney(sub_tax_outcome,"",2,",",".",""));
        $("#s_manage_share_outcome").text(accounting.formatMoney(manage_share_outcome,"",2,",",".",""));
        $("#s_platform_share_outcome").text(accounting.formatMoney(platform_share_outcome,"",2,",",".",""));

        $("#s_mycome").text(accounting.formatMoney(mycome,"",2,",",".",""));

        if(0!=parseFloat(outcome)){

            $("#b_rob_spread_outcome").text((parseFloat(rob_spread_outcome)/parseFloat(income)*100).toFixed(2));

            $("#b_conduit_outcome").text((parseFloat(conduit_outcome)/parseFloat(income)*100).toFixed(2));
            $("#b_no_conduit_outcome").text((parseFloat(no_conduit_outcome)/parseFloat(income)*100).toFixed(2));

            $("#b_broker_work_outcome").text((parseFloat(broker_work_outcome)/parseFloat(income)*100).toFixed(2));
            $("#b_broker_bus_outcome").text((parseFloat(broker_bus_outcome)/parseFloat(income)*100).toFixed(2));

            $("#b_full_pact_outcome").text((parseFloat(full_pact_outcome)/parseFloat(income)*100).toFixed(2));

            $("#b_activity_ground_outcome").text((parseFloat(activity_ground_outcome)/parseFloat(income)*100).toFixed(2));
            $("#b_other_work_outcome").text((parseFloat(other_work_outcome)/parseFloat(income)*100).toFixed(2));
            $("#b_activity_spread_outcome").text((parseFloat(activity_spread_outcome)/parseFloat(income)*100).toFixed(2));
            $("#b_other_spread_outcome").text((parseFloat(other_spread_outcome)/parseFloat(income)*100).toFixed(2));

            $("#b_sub_tax_outcome").text((parseFloat(sub_tax_outcome)/parseFloat(income)*100).toFixed(2));

            $("#b_manage_share_outcome").text((parseFloat(manage_share_outcome)/parseFloat(income)*100).toFixed(2));
            $("#b_platform_share_outcome").text((parseFloat(platform_share_outcome)/parseFloat(income)*100).toFixed(2));

            $("#b_haowu_outcome").text((parseFloat(haowu_outcome)/parseFloat(income)*100).toFixed(2));
            $("#b_path_commission").text((parseFloat(path_commission)/parseFloat(income)*100).toFixed(2));
            $("#b_path_reward").text((parseFloat(path_reward)/parseFloat(income)*100).toFixed(2));
            $("#b_pact_outcome").text((parseFloat(pact_outcome)/parseFloat(income)*100).toFixed(2));
            $("#b_other_outcome").text((parseFloat(other_outcome)/parseFloat(income)*100).toFixed(2));
            $("#b_tax_outcome").text((parseFloat(tax_outcome)/parseFloat(income)*100).toFixed(2));
            $("#b_share_outcome").text((parseFloat(share_outcome)/parseFloat(income)*100).toFixed(2));


            $("#b_zhijiecome").text((parseFloat(zhijiecome)/parseFloat(income)*100).toFixed(2));
            $("#b_outcome").text((parseFloat(outcome)/parseFloat(income)*100).toFixed(2));
            $("#b_mycome").text((parseFloat(mycome)/parseFloat(income)*100).toFixed(2));
        }else{

            $("#b_rob_spread_outcome").text("0.00");

            $("#b_conduit_outcome").text("0.00");
            $("#b_no_conduit_outcome").text("0.00");

            $("#b_broker_work_outcome").text("0.00");
            $("#b_broker_bus_outcome").text("0.00");

            $("#b_full_pact_outcome").text("0.00");

            $("#b_activity_ground_outcome").text("0.00");
            $("#b_other_work_outcome").text("0.00");
            $("#b_activity_spread_outcome").text("0.00");
            $("#b_other_spread_outcome").text("0.00");

            $("#b_sub_tax_outcome").text("0.00");

            $("#b_manage_share_outcome").text("0.00");
            $("#b_platform_share_outcome").text("0.00");

            $("#b_haowu_outcome").text("0.00");
            $("#b_path_commission").text("0.00");
            $("#b_path_reward").text("0.00");
            $("#b_pact_outcome").text("0.00");
            $("#b_other_outcome").text("0.00");
            $("#b_tax_outcome").text("0.00");
            $("#b_share_outcome").text("0.00");


            $("#b_zhijiecome").text("0.00");
            $("#b_outcome").text("0.00");
            $("#b_mycome").text("0.00");

        }
    }
    window.doCheckMonth=doCheckMonth;
    function doCheckMonth(obj){

        $("#warningBtn").show();
        $("#infoBtn").show();
        var myDate = new Date();
        var year=myDate.getFullYear();    //获取完整的年份(4位,1970-????)
        var month=myDate.getMonth()+1;       //获取当前月份(0-11,0代表1月)
        var day=myDate.getDate();        //获取当前日(1-31)

        var str= new Array();
        str=obj.split("-")
        if(str.length>0&&parseInt(str[0])>=parseInt(year)){

            var isselected = "";
            if(day>=20){
                isselected = " selected='selected'";
            }
            var months=[];
            if(parseInt(str[0])==parseInt(year)&&parseInt(str[1])==parseInt(month)){
                months.push("<option value='"+month+"'>"+year+"年"+month+"月</option>");
            }else if(parseInt(str[0])>parseInt(year)||(parseInt(str[0])==parseInt(year)&&parseInt(str[1])>parseInt(month))){
                months.push("<option value='"+month+"'>"+year+"年"+month+"月</option>");
                months.push(getNextMonth(month,year,isselected));
            }else{
                $("#warningBtn").hide();
                $("#infoBtn").hide();
            }
            if(months.length>0){
                $("#month").html(months.join(""));
            }
        }
    }

    window.getNextMonth=getNextMonth;
    function getNextMonth(month,year,isselected){

        if(12==month){

            year =parseInt(year)+1;
            month=1;

            return "<option value='"+month+"' "+isselected+">"+year+"年"+month+"月</option>";
        }else{
            month =parseInt(month)+1;
            return "<option value='"+month+"' "+isselected+">"+year+"年"+month+"月</option>";
        }
    }

    window.delDiv=delDiv;
    function delDiv(obj){
        var id = $(this).attr('data-id');

        if (!id || id === '') {
            return false;
        }

        deleteDiv(id);

        return false;
    }
});
