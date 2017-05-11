define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var accounting = require("accounting");

    window.checkSaleRate=checkSaleRate;
    function checkSaleRate(obj){
        $("#sale_rate").val(accounting.formatMoney(checkIsNum(obj),"",2,",",".",""));
    }
    window.checkFirst=checkFirst;
    function checkFirst() {
        this.checkGroupBuy();
        this.checkSeparate();
        this.checkOtherIn();

        this.checkhaowu_outcome();
        this.checkpath_commission();
        this.checkpath_reward();
        this.checkpact_outcome();
        this.checkother_outcome();
        this.checkshare_outcome();
    }

    window.checkIsNum = checkIsNum;
    function checkIsNum(num){
        if(""==num){
            return 0;
        }else{
            var num1 = checkComma(num);
            if(isNaN(num1)||parseFloat(num1).toFixed(2)<0){
                return 0;
            }
            return num1;
        }
    }
    window.checkGroupBuy=checkGroupBuy;
    function checkGroupBuy(){
        var num=0;
        var sumGroup=0;
        $('input[name=group_buy_income_projecttype_id]').each(function(){
            var projectTypeId = this.value;
            var s_num =parseInt(checkIsNum($("#group_buy_income_projecttypevalue_"+projectTypeId).val()));
            var s_vaule=parseFloat(checkIsNum($("#group_buy_income_price_"+projectTypeId).val()));
            var s_sum=parseFloat(s_num)*s_vaule;
            $("#group_buy_income_total_"+projectTypeId).text(accounting.formatMoney(s_sum,"",2,",",".",""));
            num=num+s_num;
            sumGroup=sumGroup+s_sum;
            $("#group_buy_income_projecttypevalue_"+projectTypeId).val(s_num)
        });
        $("#budget_set_number").text(num);
        $("#group_buy_income").val(sumGroup);

        checkInCome();
    }
    window.checkSeparate=checkSeparate;
    function checkSeparate(){
        var separatePrice=parseFloat(checkIsNum($("#separatePrice").val()));
        var separateRate=parseFloat(checkIsNum($("#separateRate").val().replace(/[,]/g,"")));
        var sum = separatePrice*separateRate/100;
        $("#separate_income").val(sum);
        $("#separateTotal").text(accounting.formatMoney(sum,"",2,",",".",""));
        $("#separatePrice").val(accounting.formatMoney(separatePrice,"",2,",",".",""));
        $("#separateRate").val(accounting.formatMoney(separateRate,"",2,",",".",""))
        checkInCome();
    }
    window.checkOtherIn=checkOtherIn;
    function checkOtherIn(){

        var advertise_income=parseFloat(checkIsNum($("#s_advertise_income").val()));
        var other_income=parseFloat(checkIsNum($("#s_other_income").val()));
        $("#advertise_income").val(advertise_income);
        $("#other_income").val(other_income);

        checkInCome();
    }
    window.checkInCome=checkInCome;
    function checkInCome(){
        var income = parseFloat(checkIsNum($("#group_buy_income").val()))+parseFloat(checkIsNum($("#separate_income").val()))+
            parseFloat(checkIsNum($("#advertise_income").val()))+parseFloat(checkIsNum($("#other_income").val()));

        $("#income").val(income);

        var sub_tax_outcome_b =parseFloat(checkIsNum($("#sub_tax_outcome_b").val()));
        var team_outcome_b=parseFloat(checkIsNum($("#team_outcome_b").val()));
        var manage_share_outcome_b=parseFloat(checkIsNum($("#manage_share_outcome_b").val()));

        var sub_tax_outcome =income*sub_tax_outcome_b/100;

        var team_outcome=income*team_outcome_b/100;
        var manage_share_outcome=income*manage_share_outcome_b/100;
        var platform_share_outcome = parseFloat(checkIsNum($("#platform_share_outcome").val()));

        var share_outcome = team_outcome+manage_share_outcome+platform_share_outcome;


        $("#sub_tax_outcome").val(sub_tax_outcome);
        $("#tax_outcome").val(sub_tax_outcome);

        $("#team_outcome").val(team_outcome);
        $("#manage_share_outcome").val(manage_share_outcome);
        $("#platform_share_outcome").val(platform_share_outcome);
        $("#share_outcome").val(share_outcome);


        checkOutCome();
    }

    /******************************支出*******************************************/

    window.checkOutCome=checkOutCome;
    function checkOutCome(){
        var outcome = parseFloat(checkIsNum($("#haowu_outcome").val()))+parseFloat(checkIsNum($("#path_commission").val()))+
            parseFloat(checkIsNum($("#path_reward").val()))+parseFloat(checkIsNum($("#pact_outcome").val()))+
            parseFloat(checkIsNum($("#other_outcome").val()))+parseFloat(checkIsNum($("#tax_outcome").val()))+
            parseFloat(checkIsNum($("#share_outcome").val()));
        $("#outcome").val(outcome);
        checkAllCode();
    }
    //好屋自媒体推广
    window.checkhaowu_outcome=checkhaowu_outcome;
    function checkhaowu_outcome(){

        var rob_spread_outcome=parseFloat(checkIsNum($("#s_rob_spread_outcome").val()));
        var media_outcome=parseFloat(checkIsNum($("#s_media_outcome").val()));
        $("#rob_spread_outcome").val(rob_spread_outcome);
        $("#media_outcome").val(media_outcome);

        var haowu_outcome = parseFloat(rob_spread_outcome)+parseFloat(media_outcome);
        $("#haowu_outcome").val(haowu_outcome);

        checkOutCome();
    }
    //渠道分销佣金
    window.checkpath_commission=checkpath_commission;
    function checkpath_commission(){
        var budget_set_number = $("#budget_set_number").text();
        var budget_add_number = 0;
        var society_outcome=0;
        var no_conduit_outcome=0
        var company_outcome=0;
        var conduit_outcome=0;
        var company_conduit_outcome=0;

        var company_outcome_r=$("#company_outcome_b").val();
        var company_conduit_outcome_r=$("#company_conduit_outcome_b").val();

        $('input[name=society_projecttype_id]').each(function(){
            var projectTypeId = this.value;
            var s_num =parseInt(checkIsNum($("#society_num_"+projectTypeId).val()));
            var r_num =parseFloat(checkIsNum($("#society_rate_"+projectTypeId).val()));
            var s_vaule=parseFloat(checkIsNum($("#group_buy_income_price_"+projectTypeId).val()));
            var s_sum=parseFloat(s_num)*s_vaule;
            if(0!=parseFloat(r_num)) {
                company_outcome += s_sum;//公司
            }
            s_sum=s_sum*r_num/100;
            var r_num_rate_=0;
            if(0!=parseInt(budget_set_number)){
                r_num_rate_=s_num/budget_set_number*100;
            }

            $("#society_num_"+projectTypeId).val(s_num);
            $("#society_rate_"+projectTypeId).val(accounting.formatMoney(r_num,"",2,",",".",""));
            $("#society_total_"+projectTypeId).text(accounting.formatMoney(s_sum,"",2,",",".",""));
            $("#society_num_rate_"+projectTypeId).text(accounting.formatMoney(r_num_rate_,"",2,",",".",""));
            budget_add_number+=s_num;
            society_outcome=society_outcome+s_sum;


        });
        $('input[name=no_conduit_projecttype_id]').each(function(){
            var projectTypeId = this.value;
            var s_num =parseInt(checkIsNum($("#no_conduit_num_"+projectTypeId).val()));
            var r_num =parseFloat(checkIsNum($("#no_conduit_rate_"+projectTypeId).val()));
            var s_vaule=parseFloat(checkIsNum($("#group_buy_income_price_"+projectTypeId).val()));
            var s_sum=parseFloat(s_num)*s_vaule;
            if(0!=parseFloat(r_num)) {
                company_outcome += s_sum;//公司
            }
            s_sum=s_sum*r_num/100;
            var r_num_rate_=0;
            if(0!=parseInt(budget_set_number)){
                r_num_rate_=s_num/budget_set_number*100;
            }

            $("#no_conduit_num_"+projectTypeId).val(s_num);
            $("#no_conduit_rate_"+projectTypeId).val(accounting.formatMoney(r_num,"",2,",",".",""));
            $("#no_conduit_total_"+projectTypeId).text(accounting.formatMoney(s_sum,"",2,",",".",""));
            $("#no_conduit_num_rate_"+projectTypeId).text(accounting.formatMoney(r_num_rate_,"",2,",",".",""));
            budget_add_number+=s_num;
            no_conduit_outcome=no_conduit_outcome+s_sum;
        });
        $('input[name=conduit_projecttype_id]').each(function(){
            var projectTypeId = this.value;
            var s_num =parseInt(checkIsNum($("#conduit_num_"+projectTypeId).val()));
            var r_num =parseFloat(checkIsNum($("#conduit_rate_"+projectTypeId).val()));
            var s_vaule=parseFloat(checkIsNum($("#group_buy_income_price_"+projectTypeId).val()));
            var s_sum=parseFloat(s_num)*s_vaule;
            if(0!=parseFloat(r_num)){
                company_conduit_outcome +=s_sum;//公司
            }
            s_sum=s_sum*r_num/100;
            var r_num_rate_=0;
            if(0!=parseInt(budget_set_number)){
                r_num_rate_=s_num/budget_set_number*100;
            }

            $("#conduit_num_"+projectTypeId).val(s_num);
            $("#conduit_rate_"+projectTypeId).val(accounting.formatMoney(r_num,"",2,",",".",""));
            $("#conduit_total_"+projectTypeId).text(accounting.formatMoney(s_sum,"",2,",",".",""));
            $("#conduit_num_rate_"+projectTypeId).text(accounting.formatMoney(r_num_rate_,"",2,",",".",""));
            budget_add_number+=s_num;
            conduit_outcome=conduit_outcome+s_sum;
        });
        //在循环一次
        var str1='';
        var str2='';
        $('input[name=conduit_projecttype_id]').each(function(){

            var projectTypeId = this.value;
            var s_name = $("#typename_"+projectTypeId).text();
            var s_society =parseInt(checkIsNum($("#society_num_"+projectTypeId).val()));
            var s_no_conduit =parseInt(checkIsNum($("#no_conduit_num_"+projectTypeId).val()));
            var s_num=s_society+s_no_conduit;
            var s_vaule=parseFloat(checkIsNum($("#group_buy_income_price_"+projectTypeId).val()));
            var r_company_outcome_b =parseFloat($("#company_outcome_b").val().replace(/[,]/g,""));
            var total = parseFloat(s_num)*s_vaule*r_company_outcome_b/100;

            s_num=s_num;
            total=(accounting.formatMoney(total,"",2,",",".",""));

            str1 +='<tr><td>'+s_name+'</td><td>'+s_num+'</td><td>'+r_company_outcome_b+'%</td><td>'+total+'</td></tr>';

            s_num =parseInt(checkIsNum($("#conduit_num_"+projectTypeId).val()));
            s_vaule=parseFloat(checkIsNum($("#group_buy_income_price_"+projectTypeId).val()));
            var company_conduit_outcome_b =parseFloat($("#company_conduit_outcome_b").val().replace(/[,]/g,""));
            total = parseInt(s_num)*s_vaule*company_conduit_outcome_b/100;
            $("#company_conduit_num"+projectTypeId).val(s_num);
            $("#company_conduit_total_"+projectTypeId).val(accounting.formatMoney(total,"",2,",",".",""));

            str2 +='<tr><td>'+s_name+'</td><td>'+s_num+'</td><td>'+company_conduit_outcome_b+'%</td><td>'+total+'</td></tr>';

        });

        $('#infoAbsolute1 tbody').html(str1);
        $('#infoAbsolute2 tbody').html(str2);

        company_outcome = company_outcome*parseFloat(company_outcome_r)/100;
        company_conduit_outcome = company_conduit_outcome*parseFloat(company_conduit_outcome_r)/100;
        var path_commission = society_outcome+no_conduit_outcome+company_outcome+conduit_outcome+company_conduit_outcome;
        $("#society_outcome").val(society_outcome);
        $("#no_conduit_outcome").val(no_conduit_outcome);
        $("#company_outcome").val(company_outcome);
        $("#conduit_outcome").val(conduit_outcome);
        $("#company_conduit_outcome").val(company_conduit_outcome);

        $("#path_commission").val(path_commission);
        $("#budget_add_number").text(budget_add_number);
        checkOutCome();

    }
    window.checkpath_reward=checkpath_reward;
    function checkpath_reward(){

        var  broker_look_sale_outcome=0;// ——新  直客经纪人带看成交奖励
        var  broker_maintenance_outcome=0;// ——新  直客经纪人纪经人维护
        var  broker_conduit_look_sale__outcome=0;// ——新  中介机构带看成交奖励
        var  broker_work_outcome=0;//经纪机构销售劳务支持 ——新  中介机构纪经人维护

        var lookSaleLookNum=parseInt(checkIsNum($("#lookSaleLookNum").val()));//直客经纪人带看成交奖励——带看量
        var lookSaleLookPrice=parseFloat(checkIsNum($("#lookSaleLookPrice").val()));//直客经纪人带看成交奖励——每组带看费
        var lookSaleSaleNum=parseInt(checkIsNum($("#lookSaleSaleNum").val()));//直客经纪人带看成交奖励——激励期内成交量
        var lookSaleSalePrice=parseFloat(checkIsNum($("#lookSaleSalePrice").val()));//直客经纪人带看成交奖励——单套成交奖励
        var num1=lookSaleLookNum*lookSaleLookPrice;
        var num2=lookSaleSaleNum*lookSaleSalePrice;
        $("#lookSaleLookNum").val(lookSaleLookNum);
        $("#lookSaleLookPrice").val(accounting.formatMoney(lookSaleLookPrice,"",2,",",".",""));
        $("#lookSaleSaleNum").val(lookSaleSaleNum);
        $("#lookSaleSalePrice").val(accounting.formatMoney(lookSaleSalePrice,"",2,",",".",""));
        $("#lookSaleLookTotal").text(accounting.formatMoney(num1,"",2,",",".",""));
        $("#lookSaleSaleTotal").text(accounting.formatMoney(num2,"",2,",",".",""));
        broker_look_sale_outcome = num1+num2;

        broker_maintenance_outcome=parseFloat(checkIsNum($("#s_broker_maintenance_outcome").val()))


        var conduitLookSaleLookNum=parseInt(checkIsNum($("#conduitLookSaleLookNum").val()));//中介机构带看成交奖励——带看量
        var conduitLookSaleLookPrice=parseFloat(checkIsNum($("#conduitLookSaleLookPrice").val()));//中介机构带看成交奖励——每组带看费
        var conduitLookSaleSaleNum=parseInt(checkIsNum($("#conduitLookSaleSaleNum").val()));//中介机构带看成交奖励——激励期内成交量
        var conduitLookSaleSalePrice=parseFloat(checkIsNum($("#conduitLookSaleSalePrice").val()));//中介机构带看成交奖励——单套成交奖励
        var num1=conduitLookSaleLookNum*conduitLookSaleLookPrice;
        var num2=conduitLookSaleSaleNum*conduitLookSaleSalePrice;
        $("#conduitLookSaleLookNum").val(conduitLookSaleLookNum);
        $("#conduitLookSaleLookPrice").val(accounting.formatMoney(conduitLookSaleLookPrice,"",2,",",".",""));
        $("#conduitLookSaleSaleNum").val(conduitLookSaleSaleNum);
        $("#conduitLookSaleSalePrice").val(accounting.formatMoney(conduitLookSaleSalePrice,"",2,",",".",""));
        $("#conduitLookSaleLookTotal").text(accounting.formatMoney(num1,"",2,",",".",""));
        $("#conduitLookSaleSaleTotal").text(accounting.formatMoney(num2,"",2,",",".",""));
        broker_conduit_look_sale__outcome = num1+num2;

        broker_work_outcome=parseFloat(checkIsNum($("#s_broker_work_outcome").val()));

        var path_reward=broker_look_sale_outcome+broker_maintenance_outcome+broker_conduit_look_sale__outcome+broker_work_outcome;
        $("#broker_look_sale_outcome").val(broker_look_sale_outcome);
        $("#broker_maintenance_outcome").val(broker_maintenance_outcome);
        $("#broker_conduit_look_sale__outcome").val(broker_conduit_look_sale__outcome);
        $("#broker_work_outcome").val(broker_work_outcome);

        $("#path_reward").val(path_reward);

        checkOutCome();
    }
    window.checkpact_outcome=checkpact_outcome;
    function checkpact_outcome(){

        var full_pact_outcome = parseFloat(checkIsNum($("#s_full_pact_outcome").val()));
        $("#full_pact_outcome").val(full_pact_outcome);
        $("#pact_outcome").val(full_pact_outcome);
        checkOutCome();
    }
    window.checkother_outcome=checkother_outcome;
    function checkother_outcome(){

        var other_work_outcome=0;//其他劳务费
        var other_look_sale_outcome=0;//——新  其他带看成交奖励
        var roadshow_outcome=0;//——新  巡展
        var activity_ground_outcome=0;//活动/场地
        var activity_spread_outcome=0;//广告宣传费
        var broker_bus_outcome=0;//经纪人交通补贴——新  交通
        var material_outcome=0;//——新  物料
        var other_spread_outcome=0;//其他

        /********************/
        var otherWorkPrice=parseFloat(checkIsNum($("#otherWorkPrice").val()));//其他劳务费——用工标准
        var otherWorkNum=parseInt(checkIsNum($("#otherWorkNum").val()));//其他劳务费——数量
        var otherWorkDay=parseInt(checkIsNum($("#otherWorkDay").val()));//其他劳务费——天
        other_work_outcome = otherWorkPrice*otherWorkNum*otherWorkDay;

        $("#otherWorkPrice").val(accounting.formatMoney(otherWorkPrice,"",2,",",".",""));//其他劳务费——用工标准
        $("#otherWorkNum").val(otherWorkNum);//其他劳务费——数量
        $("#otherWorkDay").val(otherWorkDay);//其他劳务费——天
        $("#otherWorkTotal").text(accounting.formatMoney(other_work_outcome,"",2,",",".",""))
        /********************/
        var otherLookSaleLookNum=parseInt(checkIsNum($("#otherLookSaleLookNum").val()));//中介机构带看成交奖励——带看量
        var otherLookSaleLookPrice=parseFloat(checkIsNum($("#otherLookSaleLookPrice").val()));//中介机构带看成交奖励——每组带看费
        var otherLookSaleSaleNum=parseInt(checkIsNum($("#otherLookSaleSaleNum").val()));//中介机构带看成交奖励——激励期内成交量
        var otherLookSaleSalePrice=parseFloat(checkIsNum($("#otherLookSaleSalePrice").val()));//中介机构带看成交奖励——单套成交奖励
        var num1=otherLookSaleLookNum*otherLookSaleLookPrice;
        var num2=otherLookSaleSaleNum*otherLookSaleSalePrice;
        $("#otherLookSaleLookNum").val(otherLookSaleLookNum);
        $("#otherLookSaleLookPrice").val(accounting.formatMoney(otherLookSaleLookPrice,"",2,",",".",""));
        $("#otherLookSaleSaleNum").val(otherLookSaleSaleNum);
        $("#otherLookSaleSalePrice").val(accounting.formatMoney(otherLookSaleSalePrice,"",2,",",".",""));
        $("#otherLookSaleLookTotal").text(accounting.formatMoney(num1,"",2,",",".",""));
        $("#otherLookSaleSaleTotal").text(accounting.formatMoney(num2,"",2,",",".",""));
        other_look_sale_outcome = num1+num2;

        /********************/
        roadshow_outcome=parseFloat(checkIsNum($("#s_roadshow_outcome").val()));
        /********************/
        activity_ground_outcome=parseFloat(checkIsNum($("#s_activity_ground_outcome").val()));
        /********************/
        activity_spread_outcome=parseFloat(checkIsNum($("#s_activity_spread_outcome").val()));
        /********************/
        material_outcome=parseFloat(checkIsNum($("#s_material_outcome").val()));

        /********************/
        var busPrice=parseFloat(checkIsNum($("#busPrice").val()));//交通——元/天
        var busDay=parseInt(checkIsNum($("#busDay").val()));//交通——天
        broker_bus_outcome=busPrice*busDay;
        $("#busPrice").val(accounting.formatMoney(busPrice,"",2,",",".",""));//交通——元/天
        $("#busDay").val(busDay);//交通——天
        $("#busTotal").text(accounting.formatMoney(broker_bus_outcome,"",2,",",".",""));//交通——天

        /********************/
        other_spread_outcome=parseFloat(checkIsNum($("#s_other_spread_outcome").val()));


        var other_outcome = other_work_outcome+other_look_sale_outcome+roadshow_outcome+activity_ground_outcome+
            activity_spread_outcome+broker_bus_outcome+material_outcome+other_spread_outcome
        $("#other_work_outcome").val(other_work_outcome);
        $("#other_look_sale_outcome").val(other_look_sale_outcome);
        $("#roadshow_outcome").val(roadshow_outcome);
        $("#activity_ground_outcome").val(activity_ground_outcome);
        $("#activity_spread_outcome").val(activity_spread_outcome);
        $("#broker_bus_outcome").val(broker_bus_outcome);
        $("#material_outcome").val(material_outcome);
        $("#other_spread_outcome").val(other_spread_outcome);

        $("#other_outcome").val(other_outcome);

        checkOutCome();
    }
    window.checkshare_outcome=checkshare_outcome;
    function checkshare_outcome(){
        var platform_share_outcome=parseFloat(checkIsNum($("#s_platform_share_outcome").val()));
        this.checkInCome();
        var share_outcome = parseFloat(checkIsNum($("#share_outcome").val()));
        var odl_platform_share_outcome = parseFloat(checkIsNum($("#platform_share_outcome").val()));

        share_outcome = share_outcome+platform_share_outcome-odl_platform_share_outcome;
            $("#share_outcome").val(share_outcome);
        $("#platform_share_outcome").val(platform_share_outcome);

        checkOutCome();
    }
    window.checkAllCode=checkAllCode;
    function checkAllCode(){

        var codeAll = ['income','outcome',
            'group_buy_income','separate_income','advertise_income','other_income',
            'haowu_outcome','path_commission','path_reward','pact_outcome','other_outcome','tax_outcome','share_outcome',
            'rob_spread_outcome','media_outcome',
            'society_outcome','no_conduit_outcome','company_outcome','conduit_outcome','company_conduit_outcome',
            'broker_look_sale_outcome','broker_maintenance_outcome','broker_conduit_look_sale__outcome','broker_work_outcome',
            'full_pact_outcome',
            'other_work_outcome','other_look_sale_outcome','roadshow_outcome','activity_ground_outcome','activity_spread_outcome','broker_bus_outcome','material_outcome','other_spread_outcome',
            'sub_tax_outcome',
            'platform_share_outcome','team_outcome','manage_share_outcome'];

        var income = parseFloat($("#income").val().replace(/[,]/g,""));
        var outcome = parseFloat($("#outcome").val().replace(/[,]/g,""));
        var tax_outcome = parseFloat($("#tax_outcome").val().replace(/[,]/g,""));
        var share_outcome = parseFloat($("#share_outcome").val().replace(/[,]/g,""));
        var rate = 0;
        for(var i=0;i<codeAll.length;i++){
            $("#s_"+codeAll[i]).text(accounting.formatMoney($("#"+codeAll[i]).val(),"",2,",",".",""));
            $("#s_"+codeAll[i]).val(accounting.formatMoney($("#"+codeAll[i]).val(),"",2,",",".",""));
            if(0<parseFloat(income)){
                rate= parseFloat(checkIsNum($("#"+codeAll[i]).val()))/parseFloat(income) *100;
            }else{
                rate=0;
            }
            $("#r_"+codeAll[i]).text(accounting.formatMoney(rate,"",2,",",".",""));
        }

        var budget_set_number = parseInt($("#budget_set_number").text());
        var budget_add_number = parseInt($("#budget_add_number").text());
        if(0!=budget_set_number){

            $("#budget_add_sale_rate").text(accounting.formatMoney(budget_add_number/budget_set_number*100,"",2,",",".",""));
        }
        var jing = income-outcome;
        var mao = jing+tax_outcome+share_outcome;
        var r_jing=0;
        var r_mao=0;
        if(0<parseFloat(income)){
            r_jing=jing/income*100;
            r_mao=mao/income*100;
        }
        $("#r_jing").text(accounting.formatMoney(r_jing,"",0,",",".",""));
        $("#r_mao").text(accounting.formatMoney(r_mao,"",0,",",".",""));
        $("#s_jing").text(accounting.formatMoney(jing,"",2,",",".",""));
        $("#s_mao").text(accounting.formatMoney(mao,"",2,",",".",""));

    }

    window.downloadFile=downloadFile;
    function downloadFile(id){
        var url=apiHost + '/hoss/sys/fileDownload/download.do?id='+id;
        $("#downloadFile_"+id).attr("href",url);
    }
});




