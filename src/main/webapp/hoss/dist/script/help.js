/// HTML 格式
///                <span class="glyphicon glyphicon-question-sign pull-right" key="qdglgzt" style="margin: 15px;"></span>

define(function (require) {

    var $ = require('jquery');
    var popover = require('bootstrap/tooltip');

    var helpDictionary = {
        'qdglgzt':{
            title:'帮助：',
            content:' ' +
                '1.该渠道执行效果图统计各个渠道总导客情况<br /><br />' +
                '2.渠道套均成本=渠道费用/渠道成交单数<br /><br />' +
                '3.渠道收入百分比=渠道成交产生的团购费收入总的团购费收入<br /><br />' +
                '4.渠道执行情况明细表显示各渠道具体的导客情况，可点击查看详情<br /><br />',
            page:'渠道管理工作台app/project/channel-manage.html'
        },
        'khglgzt': {
            title: '帮助：',
            content: '' +
                '1.客户统计表汇总各个渠道各个客户状态（按客户最新状态统计）的导客情况<br /><br />' +
                '2.该图表汇总客户预约、来访、认筹、转筹、退款的变化趋势<br /><br />' +
                '3.统计成交客户面积分布<br /><br />' +
                '4.统计成交客户年龄分布<br /><br />' +
                '5.汇总成交客户的性别分布<br /><br />' +
                '6.统计成交客户的住址分布，细化到城区<br /><br />' +
                '7.统计各个渠道的成交客户分布',
            page: '客户管理工作台app/project/customer-manage.html'
        },
        'xmqzqyxb': {
            title: '帮助：',
            content: '' +
                '1.项目一开始必须提交全周期预算，审批通过后才可以做和费用有关的审批，可以对全周期做变更<br /><br />' +
                '2.当项目中止或结案后，不可以再编辑、保存或是提交<br /><br />' +
                '3.利润小于15%或是直接费合计大于30%必须填写备注，没填写提示“利润小于15%或是直接费合计大于30%必须填写备注”',
            page: '客户管理工作台app/approval/new-apply/project-period-budget.html'
        },
        'cbglgzt':{
            title:'帮助：',
            content:' ' +
                '1.显示项目全周期或月度的收入情况<br /><br />' +
                '2.显示项目全周期或月度的支出情况<br /><br />',
            page:'成本管理工作台app/project/cost-manage.html'
        },
        'xmydysb':{
            title:'帮助：',
            content:' ' +
                '1.一个项目本月预算只能保存或是提交一次，项目结束后不可以在提交保存或是提交<br /><br />' +
                '2.月度预算审批通过后才可以做本月的费用申请',
            page:'项目月度预算表app/approval/new-apply/project-month-budget.html'
        },
        'xmfysqd':{
            title:'帮助：',
            content:' ' +
                '1.和费用有关的必须先要提交费用申请单，费用报销单和合同审批单是和费用申请单进行关联的<br /><br />' +
                '2.小于1000元的费用可以直接走费用报销<br /><br />' +
                '3.申请单中的费用明细只能报销一次',
            page:'项目费用申请单app/approval/new-apply/project-cost-apply.html'
        },
        'xmfybxd':{
            title:'帮助：',
            content:' ' +
                '1.费用申请单可不选择,不选择时,费用类型只能为其它费用中的其它项，总金额在1000元以内<br /><br />' +
                '2.选择费用申请单后，自动带出申请单中的费用明细，勾选要报销的费用明细，已经报销过的费用明细，不能再次勾选<br /><br />' +
                '3.费用报销单可以对个人付款和供应商付款',
            page:'项目费用报销单app/approval/new-apply/project-cost-reimbursement.html'
        },
        'xmhtspd':{
            title:'帮助：',
            content:' ' +
                '1、费用申请单必须选择，可选的申请单是仍有待销明细的；<br /><br />' +
                '2、选择费用申请单后勾选要报销的费用明细；<br /><br />' +
                '3、付款可分一次或多次，必须注明每次付款的时间及金额。',
            page:'项目合同审批单/app/approval/new-apply/project-contract-approval.html'
        },
        'xmhtfkd':{
            title:'帮助：',
            content:' ' +
                '1、先选择未完成支付的合同审批单；<br /><br />' +
                '2、支付次数严格按照合同的次数，不能超过合同中约定的付款次数；<br /><br />' +
                '3、每次付款的金额加上已付款的金额不能超过到本次为止应付的总金额。',
            page:'项目合同付款单app/approval/new-apply/project-contract-pay.html'
        },
        'xmbzjfkd':{
            title:'帮助：',
            content:'1.一个项目保证金支付只能有一次，审批通过后就不能在申请' +
                '和开发商合同中已经规定和保证金金额，申请时不能超过合同中的保证金金额',
            page:'项目保证金付款单app/approval/new-apply/project-bail-pay.html'
        },
        'xmtksqd':{
            title:'帮助：',
            content:'1.项目下进行退款申请的未退款名单，统一进行提交',
            page:'项目退款申请单app/approval/new-apply/project-refund-apply.html'
        },
        'tgfjmsqd':{
            title:'帮助：',
            content:'1.转筹审核后对未交齐团购费的用户进行减免申请',
            page:'团购费减免申请单app/approval/new-apply/group-fee-reduce-apply.html'
        },
        'xmwplysqd':{
            title:'帮助：',
            content:'1.项目物品领用申请单',
            page:'项目物品领用申请单app/approval/new-apply/project-items-apply.html'
        },
        'xmwphxd':{
            title:'帮助：',
            content:'1.项目物品核销单',
            page:'项目物品核销单app/approval/new-apply/project-items-examine.html'
        },
        'zjyjsq':{
            title:'帮助：',
            content:'1、中介公司的结佣以城市为单位，按周期进行结算，可以选择3个月以内的结佣周期',
            page:'中介佣金申请app/quality-control/brokerage-apply.html'
        },
        'qdgl':{
            title:'帮助：',
            content:'' +
                '1、项目可以和所有中介合作，也可以只和指定的中介合作<br /><br />' +
                '2、不管项目是和所有中介合作或指定中介合作，都可以单独设置某个中介的佣金比例',
            page:'渠道管理app/project/project-channel-manage.html?projectId=1027277251'
        },
        'tkgl':{
            title:'帮助：',
            content:'' +
                '1.APP端提交退款申请的用户名单列表，可导出退款申请表进行线下确认，选择用户进行批量退款申请，选择用户进行拒绝退款操作',
            page:'退款管理app/case-field/refund-manage.html'
        },
        'tgfjm':{
            title:'帮助：',
            content:'1.转筹审核后未交齐团购费的用户列表，逐个进行团购费减免申请',
            page:'团购费减免app/case-field/group-buying-reduce.html'
        },
        'kfssqtf':{ // 跳过
            title:'帮助：',
            content:'1、奖励分为4种类别：分享、预约、到访、关注，前三种是奖励分享的经纪人，关注是经纪人分享后客户看到并关注活动就能获得奖励；' +
                '分享及到访奖励为固定金额，用户可以自己设定金额及总奖励次数；预约及关注奖励为红包，用户需设定总奖励金额及红包个数；' +
                '预约及到访的奖励在用户设定的奖励使用完后，好屋平台仍然会给予奖励，预约红包的金额固定（具体金额根据系统配置），到访奖励' +
                '金额根据用户设定的奖励金额；<br /><br />' +
                '2、预约红包面值为5、10、20、30、50、90，系统可设定，用户设定奖励时红包的平均金额必须介于最小值和最大值之间，具体的金额' +
                '按正态分布；<br /><br />' +
                '关注红包由系统设定最大值及最小值，红包的平均金额必须介于两者之间，每个红包的实际金额随机生成，但是实际金额分布按正态分布' +
                '3、投放时间精确到分钟，用户可以选择手工上架将广告变为投放中的状态，也可以由系统根据投放时间将广告自动变为投放中的状态',
            page:'开发商申请投放app/ad/hw-release-manage.html'
        },
        'hwtfgl':{
            title:'帮助：',
            content:'' +
                '1、广告投放分为好屋投放和广告商投放，运营同事可以执行两种投放，操作时需要进行选择，而项目经理只执行好屋投放；<br /><br />' +
                '2、好屋投放指的是奖励金额由好屋负责，广告商投放的则由广告商负责；',
            page:'好屋投放管理app/ad/hw-release-manage.html'
        },
        'ggscz': {
            title: '帮助：',
            content: '1、广告商充值先通过线下给好屋打款，打款确认后由运营用户在这个页面执行充值操作',
            page: '广告上充值app/ad/advertiser-recharge.html'
        },
        'skqrgl': {
            title: '帮助：',
            content: '' +
                '1.POS刷卡收佣系统自动确认<br /><br />' +
                '2.现金收佣或自动确认失败需要财务人员自己确认',
            page: '收款确认管理app/finance/receivables-confirmed.html'
        },
        'tkqrgl': {
            title: '帮助：',
            content: '1.项目部退款申请表审批通过后系统自动打钱到客户帐号上',
            page: '退款确认管理/app/finance/refund-confirmed.html'
        },
        'txqrgl': {
            title: '帮助：',
            content: '1.抢钱宝客户提现由运营人员确认，系统自动打钱到客户帐号上',
            page: '提现确认管理/app/finance/cash-confirmed.html'
        },
        'cjkpgl': {
            title: '帮助：',
            content: '' +
                '1.列表显示客户成交确认的信息<br /><br />' +
                '2.财务人员输入开票编号，确认开票',
            page: '成交开票管理/app/finance/done-invoice-manage.html'
        },
        'hzjtd': {
            title: '帮助：',
            content: '坏账计提单',
            page: '坏账计提单app/finance/bail-manage.html'
        },
        'cnzfgl': {
            title: '帮助：',
            content: '' +
                '1.本页面显示费用报销单、项目合同付款单、项目保证金付款单审批通过的单据<br /><br />' +
                '2.出纳支付过的单据点击“已支付”按钮，支付状态变为已支付',
            page: '出纳支付管理app/finance/cashier-manage.html'
        },
        'xmskrb': {
            title: '帮助：',
            content: '' +
                '1.按照项目统计每天发生的转筹金额、认筹金额、退款金额、开票金额',
            page: '项目收款日报app/finance/receivables-daily.html'
        },
        'zzjggl': {
            title: '帮助：',
            content: '' +
                '1、组织架构及员工信息定期从虎虎中进行增量同步',
            page: '组织架构管理 app/admin/organization.html'
        },
        'qxgl': {
            title: '帮助：',
            content: '' +
                '1、权限类型中的目录对应登录后页面的一级菜单，菜单对应二级菜单，操作对应具体的页面或页面中的具体操作，如新建费用申请单',
            page: '权限管理 app/admin/permission-manage.html'
        },
        'yggl': {
            title: '帮助：',
            content: '' +
                '1、此页面为系统管理员操作的页面，主要功能是为用户设置角色、禁用or启用账号、重置登录名\密码功能。<br /><br />' +
                '2、用户名、邮箱、手机号码、部门、密码的默认值都从虎虎增量同步，频率是每天一次。<br /><br />' +
                ' a) 如果用户的用户名、邮箱、手机在虎虎中有变化，则在hoss内也同步更新。<br /><br />' +
                ' b) 如果用户在虎虎中删除，则在hoss内自动将该用户的账号禁用。<br /><br />' +
                '3、用户可以用登录名、邮箱、手机三者之一登录hoss后台。<br /><br />' +
                '4、点击【重置账号】可以为该用户在hoss内重置登录名和密码。重置后的密码不回写虎虎；登录名不允许重复，也不允许和邮箱、手机重复。<br /><br />' +
                '5、点击【禁用】后，则用户无法登录；点击【启用】后恢复。<br /><br />' +
                '6、设置职位可以设置对应的区域或城市公司，这决定其数据权限。',
            page: '员工管理app/admin/staff-manage.html'
        },
        'jsgl': {
            title: '帮助：',
            content: '' +
                '1、本页面的功能是新增、删除、禁用or启用系统的角色，并管理每个角色下的用户',
            page: '角色管理app/admin/role-manage.html'
        },
        'qxsz': {
            title: '帮助：',
            content: '' +
                '定义登录用户在hoss中可以看到哪些菜单和页面，以及在页面中可以进行哪些具体的操作。' +
                '其中的第一级表示目录，第二级表示菜单，第三级是页面中具体的操作项，数据同步自权限管理中的树。',
            page: '权限设置app/admin/permission-setting.html'
        }
    };


    return {
        initHelp:function() {
            var helpSpan = $('span.glyphicon-question-sign');

            helpSpan.each(function (index, item) {
                var $item = $(item);
                var key = $item.attr('key');
                var helpObj = helpDictionary[key];

                // 无标题的提示 over  enter 触发
                $item.attr('data-toggle', 'tooltip');

                // 加 span 处理字体居中. 编号不齐
                $item.attr('data-original-title',
                        '<span style=\"text-align: left;display: block;font-weight:normal;\">' + helpObj.content + '</span>');

                // 可带标题的提示 click 触发
//                $item.attr('data-toggle', 'popover');
//                $item.attr('title', helpObj.title);
//                $item.attr('data-content', helpObj.content);

                $item.attr('data-placement', 'left');
                $item.css('font-size', 16);
                $item.tooltip({html:true});
            });
        }
    };

});