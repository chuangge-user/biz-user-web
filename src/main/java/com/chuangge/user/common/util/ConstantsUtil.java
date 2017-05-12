package com.chuangge.user.common.util;



/**
 * Description：常量定义
 * Created by kuangqiuyong on 2014/5/4.
 */

public class ConstantsUtil {
    public static final String COMPANY_NAME = "好屋中国";

    public static final String HOSS_HOST = "hoss_host";

    public static final String LU_JIN_XI="1000560011849";

    //项目电话号码
    public static final String XMJL_MOBILE="";
    /**
     * PHP基站URL
     */
    public static final String PHP_HOST = "php_host";

    /**
     * 二手客服电话
     */
    public static final String HOSS_SECOND_SERVICE_PHONE = "second_service_phone";
    /**
     * 短信KEY
     */
    public static final String SMS_KEY = "sms_key";

    /**
     * 图片基站URL
     */
    public static final String PHP_PIC_HOST = "php_pic_host";

    public static final String HOSS_STASTICS_SYNC_TIME = "hoss-stastics-sync-time";
    
    
    /**
     * 银行图片基站URL
     */
    public static final String PHP_BANKPIC_HOST="php_bankpic_host";
    public static final String PHP_BANKPIC_DEFAUT_URL="http://192.168.1.5";
    

    public static final String HAOWU_WEBSITE = "haowuWebsite";

    /**
     * PHP基站URL
     */
    public static final String PHP_PASSWORD_SYNCHRONIZATION = "/app_hoss/user/update";
    public static final String PHP_PASSWORD_TOKEN = "abcd";

    /**
     * userId的session属性名称,用于从当前hossSession中获取当前登录的用户ID
     */
    public static final String USER_ID = "userId";
    public static final String BROKER = "broker";
    /**
     * 系统标识
     */
    public static final Long SYSTEM = -1l;

    /**
     * 上线ID
     */
    public static final String PARENT_USER_ID = "parentUserId";
    /**
     * 用户名
     */
    public static final String USER_NAME = "userName";
    public static final String USER_CITY_ID = "cityId";
    /**
     * 用户角色
     */
    public static final String USER_ROLE = "userRole";
    /**
     * 用户所属门店
     */
    public static final String USER_ORG_CATEGORY = "userOrgCategory";
    /**
     * 用户所属加盟公司
     */
    public static final String USER_COMPANY_RELATION = "userCompanyRelation";
    /**
     * 报备之后的延迟时间（分钟）
     */
    public static final String FILING_LOOKING_DELAY_TIME_DEFAULT = "30";
    public static final String FILING_LOOKING_DELAY_TIME = "filing_looking_delay_time";

    /**
     * 手机验证码有效期限
     */
    public static final int VERIFICATION_CODE_USED_TIME = 2;

    /**
     * 社会版保护期到期前提醒天数
     */
    public static final String SOCIETY_PROTECT_REMIND_DAYS_DEFAULT = "3";
    public static final String SOCIETY_PROTECT_REMIND_DAYS = "society_protect_remind_time";

    /**
     * 机构版推荐保护期到期前提醒天数
     */
    public static final String ORG_RECOMMEND_PROTECT_REMIND_DAYS_DEFAULT = "3";
    public static final String ORG_RECOMMEND_PROTECT_REMIND_DAYS = "org_recommend_protect_remind_time";

    /**
     * 机构版到访保护期到期前提醒天数
     */
    public static final String ORG_VISITED_PROTECT_REMIND_DAYS_DEFAULT = "3";
    public static final String ORG_VISITED_PROTECT_REMIND_DAYS = "org_visited_society_protect_remind_time";

    /**
     * 当天预约的次数限制
     */
    public static final String CURR_DAY_APPOINTMENT_NUM_DEFAULT = "4";
    public static final String CURR_DAY_APPOINTMENT_NUM = "curr_day_appointment_num";

    /**
     * brokerId的session属性名称，用于从当前的hossSession中获取当前的经纪人ID
     * by ChenXueSong
     */
    public static final String BROKER_ID = "brokerId";

    /**
     * 默认分页大小
     */
    public static final int DEFAULT_PAGE_SIZE = 15;

    /**
     * 好屋推广的数据条数
     */
    public static final int POP_NUM = 2;

    /**
     * 资讯置顶数
     */
    public static final String INFORMATION_POP_NUM_DEFAULT = "5";
    public static final String INFORMATION_POP_NUM = "information_pop_num";

    /**
     * token的session属性名称，用于从当前的hossSession中获取token值
     * by ChenXueSong
     */
    public static final String KEY = "key";

    /**
     * 7天
     */
    public static final long DAY7 = 604800000;
    /**
     * 再次分享可配置的时间
     */
    public static final String SHARE_PROTECTED_DAY = "sharedProtectdIntervalTime";

    /**
     * 今天的分享获得奖励的限定次数
     */
    public static final String TODAY_SHARE_COUNT = "activityTodayShareCount";

    /**
     * 默认的一天分享获得奖励的次数
     */
    public static final String TODAY_DEFAUT_SHARE_COUNT = "3";

    /**
     * mac今天的分享获得奖励的限定次数
     */
    public static final String MAC_TODAY_SHARE_COUNT = "activityMacTodayShareCount";
    public static final String MAC_TODAY_SHARE_COUNT_DEFAULT = "3";

    /**
     * 分享服务费收取比例
     */
    public static final String ACTIVITY_SERVICE_CHARGE_SCALE = "activityServiceChargeScale";



    /**
     * 预约服务费收取比例默认值
     */
    public static final String  APPOINTMENT_ACTIVITY_SERVICE_CHARGE_DEFAULT_SCALE = "20%";

    /**
     * 预约服务费收取比例
     */
    public static final String APPOINTMENT_ACTIVITY_SERVICE_CHARGE_SCALE = "appointmentActivityServiceChargeScale";



    /**
     * 分享服务费收取比例默认值
     */
    public static final String ACTIVITY_SERVICE_CHARGE_DEFAULT_SCALE = "20%";

    /**
     * 1天
     */
    public static final long DAY_TIME_MILLINUS = 24 * 60 * 60 * 1000;

    /**
     * 1小时
     */
    public static final long HOUR_TIME = 60 * 60 * 1000;
    /**
     * 1分钟
     */
    public static final long MINUTE_TIME = 60 * 1000;
    /**
     * 访问PHP的接口URL站点
     */
    public static final String PHP_INTERFACE_BASIC_URL = "http://127.0.0.1/";
    /**
     * 访问php的token字段名与值
     */
    public static final String PHP_TOKEN_NAME = "app_hoss_token";
    public static final String PHP_TOKEN_VALUE = "abcd";
    /**
     * 访问php获取活动id的url地址
     */
    public static final String PHP_INTERFACE_ACTIVITY_URL = "/app_hoss/news/push_news";

    /**
     * 中介经纪人最大推荐数
     */
    public static final String CONDUIT_RECOMMEND_MAX_NUM_DEFAULT = "3";
    public static final String CONDUIT_RECOMMEND_MAX_NUM = "conduit_recommend_max_num";

    /**
     * 独立经纪人最大推荐数
     */
    public static final String ALONE_RECOMMEND_MAX_NUM_DEFAULT = "3";
    public static final String ALONE_RECOMMEND_MAX_NUM = "alone_recommend_max_num";

    /**
     * 社会经纪人最大推荐数
     */
    public static final String SOCIAL_RECOMMEND_MAX_NUM_DEFAULT = "3";
    public static final String SOCIAL_RECOMMEND_MAX_NUM = "society_recommend_max_num";

    public static final String HOUSE_NO_HEADR = "4001808116";

    /**
     * hoss系统部门id
     */
    public static final Long CALL_CENTER_DEP = 1L;//呼叫中心
    public static final Long QUALITY_CONTROL_DEP = 2L;//品控中心
    public static final Long FINANCE_CENTER_DEP = 3L;//财务中心
    public static final Long PERSONNEL_CENTER_DEP = 4L;//人事
    public static final Long DEVELOPMENT_CENTER_DEP = 5L;//拓展中心
    public static final Long PROJECT_CENTER_DEP = 6L;//项目中心
    public static final Long SYSTEM_CENTER_DEP = 7L;//系统中心

    /**
     * hoss系统职位
     */
    public static final Long QUALITY_MANAGER = 12L;//品控经理
    public static final Long QUALITY_ASSISTANT = 13L;//品控助理
    public static final Long PROJECT_MANAGER = 16L;//项目经理
    public static final Long PROJECT_ASSISTANT = 17L;//项目助理
    public static final Long FINANCE_MANAGER = 18L;//财务总监
    public static final Long FINANCE_ASSISTANT = 19L;//财务出纳
    public static final Long SYSTEM_MANAGER = 20L;//系统管理


    /**
     * 分享类型
     */
    public abstract class SharedType {
        public static final String WEIXIN_TYPE = "1";   //微信
        public static final String SINA_WEIBO_TYPE = "2";    //微博
        public static final String SHARE_VIIST = "3";    //分享到访
        public static final String SHARE_DEAL = "4";   //分享成交
        public static final String QQ_ZONE = "5";   //QQ空间
        public static final String REWARD_RECHARGE = "6";   //一次发布会奖励充值
        public static final String INVATE_RECHARGE = "7";   //邀请函充值
        public static final String TWO_REWARD_RECHARGE = "8";   //二次发布会奖励充值
    }

    public abstract class SharedType_CN {
        public static final String WEIXIN_TYPE_CN = "微信朋友圈";
        public static final String SINA_WEIBO_TYPE_CN = "新浪微博";
        public static final String SHARE_VIIST_CN = "分享到访";
        public static final String SHARE_DEAL_CN = "分享成交";
        public static final String QQ_ZONE_CN = "QQ空间";
        public static final String REWARD_RECHARGE_CN = "兑换充值";
    }


    /**
     * 经纪人保护期
     * create by kuangqiuyong
     */
    public abstract class BrokerProtectTime {
        /**
         * 社会经纪人推荐保护天数
         */
        public static final String SOCIAL_BORKER_RECOMMEND_DEFAULT = "7";
        public static final String SOCIAL_BORKER_RECOMMEND = "social_borker_recommend";
        /**
         * 中介推荐保护天数
         */
        public static final String CONDUIT_RECOMMEND_DEFAULT = "7";
        public static final String CONDUIT_RECOMMEND = "conduit_recommend";
        /**
         * 独立经纪人推荐保护天数
         */
        public static final String ALONE_RECOMMEND_DEFAULT = "7";
        public static final String ALONE_RECOMMEND = "alone_recommend";
        /**
         * 到访保护期默认天数
         */
        public static final int VISITED_DEFALUT = 30;

    }

    /**
     * 经纪人注册结果
     */
    public abstract class RegisterResult {
        /**
         * 成功
         */
        public static final String REGISTER_SUCCEED = "1";
        /**
         * 失败
         */
        public static final String REGISTER_FAILURE = "0";
    }

    /**
     * 是否允许带看
     */
    public abstract class LookAllowStatus {
        /**
         * 允许带看
         */
        public static final String LOOK_ALLOW_STATUS_OK = "1";
        /**
         * 不可带看
         */
        public static final String LOKK_ALLOW_STATUS_NO = "0";
    }

    /**
     * 保护期状态
     */
    public abstract class ProtectStatus {

        /**
         * 打开保护期
         */
        public static final String PROTECT_ON = "on";
        /**
         * 关闭保护期
         */
        public static final String PROTECT_OFF = "off";
    }

    /**
     * 保护期类型
     */
    public abstract class ProtectType {

        /**
         * 客户录入\报备保护
         */
        public static final String CLIENT_ENTRY = "entry";
        /**
         * 客户到访保护
         */
        public static final String CLIENT_VISITED = "visited";

        /**
         * 客户录入\报备至到访保护
         */
        public static final String CLIENT_ENTRY_VISITED = "entryAndVisited";
        /**
         * 客户到访验证码
         */
        public static final String IDENTITIFY_CODE = "identitifyCode";
    }

    /**
     * 客户来源渠道
     */
    public abstract class ClientSourceWay {
        /**
         * 社会经纪人
         */
        public static final String SOCIAL_BROKER = "socialBroker";
        /**
         * 中介机构
         */
        public static final String CONDUIT = "conduit";
        /**
         * 独立经纪人
         */
        public static final String ALONE_BROKER = "aloneBroker";
        /**
         * 自然来人
         */
        public static final String NATURE = "nature";
        /**
         * 退款后流转
         */
        public static final String REFUND = "refund";
        /**
         * 社会分享
         */
        public static final String SOICAL_SHARE = "socialShare";

        /**
         * 社会推荐与分享
         */
        public static final String SOICAL_BROKER_SHARE = "social_broker_share";

        /**
         * 中介分享
         */
        public static final String CONDUIT_SHARE = "conduitShare";

        /**
         * 独立经纪人分享
         */
        public static final String ALONE_BROKER_SHARE = "aloneBrokerShare";

        /**
         * 抢钱宝--微信预约接口
         */
        public static final String SOCIAL_WEIXIN = "weixin";

        /**
         * 抢钱宝--php预约接口
         */
        public static final String SOCIAL_HAOWU_WEBSITE  = "haowu_website";
    }

    /**
     * 客户来源渠道
     */
    public abstract class ClientSourceWayCn {
        /**
         * 社会经纪人
         */
        public static final String SOCIAL_BROKER = "社会经纪人";
        /**
         * 中介机构
         */
        public static final String CONDUIT = "中介机构";
        /**
         * 独立经纪人
         */
        public static final String ALONE_BROKER = "独立经纪人";
        /**
         * 自然来人
         */
        public static final String NATURE = "自然来人";
        /**
         * 退款后流转
         */
        public static final String REFUND = "退款后流转";
        /**
         * 社会分享
         */
        public static final String SOICAL_SHARE = "社会分享";

        /**
         * 社会推荐与分享
         */
        public static final String SOICAL_BROKER_SHARE = "社会推荐与分享";

        /**
         * 抢钱宝--微信接口
         */
        public static final String SOCIAL_WEIXIN = "微信";

        /**
         * 抢钱宝--php预约接口
         */
        public static final String SOCIAL_HAOWU_WEBSITE  = "好屋网站";
    }

    /**
     * 经纪人类型
     */
    public static abstract class BrokerType {
        /**
         * 社会
         */
        public static final String BROKER_0 = "0";

        /**
         * 中介
         */
        public static final String BROKER_A = "A";
        /**
         * 业务员
         */
        public static final String BROKER_B = "B";
        /**
         * 大客户
         */
        public static final String BROKER_C = "C";
        /**
         * call客
         */
        public static final String BROKER_D = "D";
        /**
         * 独立经纪人
         */
        public static final String BROKER_E = "E";
    }


    /**
     * 成交经纪人类型
     */
    public static abstract class DealBrokerType {

        /**
         * 老带新/新带新
         */
        public static final String DEALBROKER_OLDANDNEW = "OLD_NEW";
        /**
         * 大客户
         */
        public static final String DEALBROKER_BIGCUSTOMER = "BIG_CUSTOMER";
        /**
         * 专业经纪人 Specialty
         */
        public static final String DEALBROKER_SPECIALTY_BROKER = "SPECIALTY_BROKER";

    }

    /**
     * 成交经纪人类型
     */
    public static abstract class DealBrokerTypeCN {

        /**
         * 老带新/新带新
         */
        public static final String DEALBROKER_OLDANDNEW_CN = "老带新/新带新";
        /**
         * 大客户
         */
        public static final String DEALBROKER_BIGCUSTOMER_CN = "大客户";
        /**
         * 专业经纪人 Specialty
         */
        public static final String DEALBROKER_SPECIALTY_BROKER_CN = "专业经纪人";

    }


    /**
     * 客户流程大状态
     */
    public abstract class BigClientFollowUpStatus {
        /**
         * ***************************流程大状态 开始**********************************
         */
        public static final String CLIENT_BIG_STATUS_NEW_CUSTOMER = "newCustomer"; //表示新推荐客户
        public static final String CLIENT_BIG_STATUS_FILING = "filing";         //表示已报备的状态
        public static final String CLIENT_BIG_STATUS_LOOK = "look";             //表示发起带看状态
        public static final String CLIENT_BIG_STATUS_VISITED = "visited";       //表示已到访状态
        public static final String CLIENT_BIG_STATUS_BUY = "buy";               //表示已下定状态
        public static final String CLIENT_BIG_STATUS_REFUND = "refund";         //退款状态
        public static final String CLIENT_BIG_STATUS_DEAL = "deal";             //成交审核状态
        public static final String CLIENT_BIG_STATUS_BROKERAGE = "brokerage";   //提佣金状态
        public static final String CLIENT_BIG_STATUS_FAIL = "fail";             //失败状态
        /********************************流程大状态 结束*********************************/
    }

    /**
     * 客户流程状态
     */
    public abstract class ClientFollowUpStatus {
        /**
         * *****************************流程小状态 开始********************************
         */
        /**********报备小状态 start*************/
        public static final String STATUS_UNLINKED = "unlinked";                   //意向客户,此状态已废弃
        public static final String STATUS_LINKING = "linking";                     //报备
        public static final String STATUS_LINKED_REJECT = "linked_reject";         //报备拒绝
        public static final String FILING_DELETED = "filing_deleted";              //报备删除
        public static final String STATUS_LINKED = "linked";                       //报备通过
        /**********报备小状态 end*************/

        /**********抢客宝状态 start*************/
        public static final String STATUS_INTENTION = "intention";                 //抢客宝有意向,抢客宝专用，与主流程状态无关
        public static final String STATUS_LATER_PROCESS = "later_process";         //Later process ,抢客宝专用，与主流程状态无关
        public static final String STATUS_KEEP_CONTACT = "keep_contact";           //Keeping contact,抢客宝专用，与主流程状态无关
        public static final String STATUS_NO_INTENTION = "no_intention";           //无意向,抢客宝专用，与主流程状态无关
        public static final String STATUS_VISITING = "visiting";                   //发起带看,抢客宝专用，与主流程状态无关
        /**********抢客宝状态 end*************/

        /**********发起带看状态 start*************/
        public static final String STATUS_LINKED_VISITING = "linked_visiting";     //预约带看
        public static final String STATUS_NO_VISITED_CONFIRM = "no_visited_confirm"; //未到访确认
        public static final String STATUS_NO_VISITED = "no_visited";               //未到访
        /**********发起带看状态 end*************/

        /**********已到访状态 start*************/
        public static final String STATUS_VISITED = "visited";                     //已到访
        /**********已到访状态 end*************/

        /**********下定状态 start*************/
        public static final String STATUS_BUY_PAYING = "buy_paying";               //预下定,已废弃
        public static final String STATUS_BUY_DEPOSIT = "buy_deposit";             //已下定
        public static final String STATUS_BUY_UNMAKE = "buy_unmake";              //财务还没确认收款,下定子表client_groupbuy_amount_record的状态
        public static final String STATUS_BUY_MAKE = "buy_make";                  //财务确认收款,下定子表client_groupbuy_amount_record的状态
        public static final String STATUS_BUY_POS_FAILURE = "buy_posfailure";      //财务pos自动确认收款失败,下定子表client_groupbuy_amount_record的状态
        public static final String STATUS_BUY_FAILED = "buy_failed";                //已退款
        public static final String STATUS_INVALID = "invalid" ;                             //下定明细 client_groupbuy_amount_record 无效数据状态，查询、计算金额过滤
        /**********下定状态 end*************/

        /**********退款状态 start*************/
        public static final String STATUS_REFUND_APPLY = "refund_apply";           // 未退款  (申请退款(未退款))
        public static final String STATUS_REFUND_APPLYING = "refund_applying";        //申请中
        public static final String STATUS_REFUND_FAILED = "refund_failed";            //审核不通过( 不同意退款)
        public static final String STATUS_REFUND_REFUSE = "refund_refuse";           //拒绝退款

        public static final String STATUS_REFUND_AFFIRM_WAIT = "refund_affirm_wait";           //审批通过(审批通过状态——)
        public static final String STATUS_REFUND_AFFIRM = "refund_affirm";           //退款中(审批通过状态)
        public static final String STATUS_REFUND_PAYING = "refund_paying";     //退款支付中 （已提交快钱支付或退款接口）
        public static final String STATUS_REFUND_BILL_FAILURE = "refund_bill_failure";//退款失败(快钱打钱失败)
        public static final String STATUS_REFUND_REFUND = "refund_refund";         //已退款
        public static final String STATUS_REFUND_REFUND_1 = "refund_refund_1";         //已退款 线下退款



        public static final String STATUS_REFUND_PART_FAILURE = "refund_part_failure";//部分退款失败 ( pos多笔付款  退款时，当有退款成功，和退款失败的情况 显示)
        /**********退款状态 end*************/

        /**********成交状态 start*************/
        public static final String STATUS_PROJECT_MANAGER_CHECK = "project_manager_check";         //项目经理合伙人成交确认
        public static final String STATUS_SALE_WAITAPPROVE = "sale_waitapprove";   //成交未审核
        public static final String STATUS_SALE_UNAPPROVED = "sale_unapproved";     //成交审核不通过
        public static final String STATUS_SALE_APPROVED = "sale_approved";         //成交审核通过
        /**********成交状态 end*************/

        /**********提佣状态 start*************/
        public static final String STATUS_BROKERAGE_UNINFORMED = "brokerage_uninformed";//可申请提佣金

         public static final String STATUS_BROKERAGE_APPLIED = "brokerage_applied";  //申请提佣金( 未结算 可直接提现)

       // public static final String STATUS_BROKERAGE_APPLIED = "yuzhijian_countpaying";  //【测试状态】

        public static final String STATUS_BROKERAGE_AUDITING = "brokerage_auditing";  //申请提佣金(未审核状态)审核通过变为 brokerage_applied状态
        public static final String STATUS_BROKERAGE_PAYING= "brokerage_paying"; //结算支付中  （已提交快钱提交付款）
        public static final String STATUS_BROKERAGE_AUDIT_FAILURE = "brokerage_audit_failure";  //申请提佣(审核不通过)
        public static final String STATUS_BROKERAGE_APPLIED_FAILURE = "brokerage_applied_failure";  //申请提佣(快钱打款失败)
        public static final String STATUS_BROKERAGE_PAYED = "brokerage_payed";      //已发放佣金 (已结算)
        /**********提佣状态 end*************/

        public static final String STATUS_INSERT_FAILING = "insert_failing";        //无购房意向,已废弃
        public static final String STATUS_FILLING_FAILING = "filling_failing";      //过报备有效期,已废弃
        public static final String STATUS_FILLING_FAILED = "filling_failed";        //报备过保护期,已废弃
        public static final String STATUS_VISITED_FAILED = "visited_failed";        //下定过保护期,已废弃
        public static final String STATUS_DELETED = "_deleted";                     //标记删除
        /********************************流程小状态 结束*********************************/
    }


    /**
     * 提现审核状态（超过阀值的记录审核）
     */
    public abstract class ApproverAuditstatus {

        /**
         * 通过
         */
        public static final String STATUS_PASSED = "passed";
        /**
         * 不通过
         */
        public static final String STATUS_UNPASS = "unpass";
    }


    /**
     * 提现审核状态（超过阀值的记录审核）
     */
    public abstract class ApproverLimitvalue {

        /**
         * 默认值
         */
        public static final String DEFAULT_VALUE = "500";
        /**
         * key
         */
        public static final String KEY_CODE = "LIMIT_VALUE_KEY";
    }

    /**
     * 客户报备状态
     */
    public abstract class ClientFilingStatus {

        /**
         * 报备处理中
         */
        public static final String STATUS_DEALING = ClientFollowUpStatus.STATUS_LINKING;
        /**
         * 报备失败
         */
        public static final String STATUS_FAIL = ClientFollowUpStatus.STATUS_LINKED_REJECT;
        /**
         * 报备成功
         */
        public static final String STATUS_SUCCESS = ClientFollowUpStatus.STATUS_LINKED;
    }

    /**
     * call客的状态码
     */
    public abstract class CallClientCode {

        public static final int MAXLOOKCOUNT = 4;                                                   //每天发起同一个楼盘带看的次数
        public static final String CLIENT_GT_MAXLOOKCOUNT_CODE = "gt_maxlookcount";                    // 带看次数大于一天的 限制
        public static final String CLIENT_GT_MAXLOOKCOUNT_MESSAGE = "发起带看的次数大于一天的限制";     //消息

        /**
         * ************************* begin待跟进状态   ***********************************************
         */
        public static final String STATUS_UNSURE_UNLINKED = "unsure_unlinked";                   //待跟进--意向不明确的客户
        public static final String STATUS_PHONE_UNRECEIVED = "phone_unreceived";                 //待跟进--电话未接通
        /**************************** end 待跟进状态   ************************************************/

    }

    /**
     * SMS消息和状态
     */
    public abstract class SmsMessageStatus {

        /**
         * ************************ begin 电话接通反馈的状态  ********************************
         */
        public static final String PHONE_FEEDBACK_INTENTION = "feedback_intention";             // 有意向
        public static final String PHONE_FEEDBACK_REFUSE = "feedback_refuse";                     // 拒绝
        public static final String PHONE_FEEDBACK_NEED_TOUCH = "feedback_need_touch";                     // 继续联系
        public static final String PHONE_FEEDBACK_NOT_CONNECTED = "feedback_ not_connected";     // 电话未接通
        /*************************** end  电话接通反馈的状态  *********************************/


        /**
         * ************************ begin 短信发送状态  ********************************
         */
        public static final String SMS_SEND_SUCCESS = "sms_success";             // 短信发送成功状态码
        public static final String SMS_SEND_FAILURE = "sms_failure";             // 短信发送失败状态码
        /*************************** end 短信发送状态  ***********************************/

        /**
         * ************************* begin 短信发送后的状态实体信息  **************************
         */
        public static final String SMS_MESSAGE_SUCCESS = "短信发送成功!";         // 短信发送成功状态码
        public static final String SMS_MESSAGE_FAILURE = "短信发送失败!";         // 短信发送成功状态码
        /**************************** end   短信发送后的状态实体信息   ***************************/
    }

    /**
     * 手机验证码状态值
     */
    public abstract class PhoneValidateCodeStatus {

        public static final String STATUS_USED = "used";      //有效
        public static final String STATUS_OVERDUE = "overdue";//过期
        public static final String STATUS_VISITED = "visited";//已到访
    }

    /**
     * 系统用户状态
     * by Chen Xuesong
     */
    public abstract class UserStatus {
        public static final int USER_IS_DISABLED = 0;
        public static final int USER_IS_ENABLED = 1;
        public static final String USER_ENABLED = "on";
        public static final String USER_DISABLED = "off";
    }

    /**
     * 客户类型
     */
    public abstract class CilentType {
        public static final String OBSCURE = "社会模糊";
        public static final String PRECISE = "社会模糊";
    }

    public abstract class ProjectType
    {
        public static final String COOPERATE = "1";
        public static final String NONCOOPERATE = "0";
    }

    /**
     * 经纪人实名认证状态
     */
    public abstract class BrokerApproveStatus {

        public static final String APPROVE_UN_APPROVING = "unapproving";     // 实名认证中
        public static final String APPROVE_UN_APPROVED = "unapproved";     // 实名认证不通过
        public static final String APPROVE_APPROVED = "approved";             // 实名认证通过
    }

    /**
     * 经纪人审核记录
     */
    public abstract class BrokerApprovedRecordStatus {

        public static final String APPROVING = "approving";     // 实名认证中
        public static final String APPROVED_FAIL = "approved_fail";     // 实名认证不通过
        public static final String APPROVED_SUCCESS = "approved_success";             // 实名认证通过
    }

    /**
     * 客户付款方式
     */
    public abstract class ClientPayWay {
        public static final String CASH = "cash";               //现金
        public static final String POS = "pos";                   //POS
        public static final String POSWITHCASH = "poswithcash"; //现金+POS
        public static final String MULTIPOS = "multipos";       //pos多次
    }
  /*  */

    /**
     * 请求返回状态码
     */
    public abstract class ResponseStatus {
        /**
         * 成功返回
         */
        public static final String RESPONSE_SUCCESS = "1";
        /**
         * 失败返回
         */
        public static final String RESPONSE_FAILURE = "0";
    }

    /**
     * 我的钱包状态
     */
    public abstract class BrokerAccountStatus {
        /**
         * 启用
         */
        public static final String ON = "on";
        /**
         * 禁用
         */
        public static final String OFF = "off";
    }

    /**
     * 钱包流水记录的状态
     */
    public abstract class BrokerAccountRecordStatus {
        /**
         * 已申请提佣
         */
        public static final String APPLY = "apply";
        /**
         * 提佣申请已通过
         */
        public static final String APPLIED = "applied";

        /**
         * 提佣申请审核未通过
         */
        public static final String UNAPPLIED = "unapplied";

        /**
         * 提佣失败
         */
        public static final String APPLY_FAILURE = "applied_failure";



    }

    public abstract class BrokerAccountRecordStatusCN {
        /**
         * 已申请提佣
         */
        public static final String APPLY = "已申请提佣";
        /**
         * 提佣申请已通过
         */
        public static final String APPLIED = " 已完成";

        /**
         * 提佣申请审核未通过
         */
        public static final String UNAPPLIED = "未通过审核";

        /**
         * 提佣失败
         */
        public static final String APPLY_FAILURE = "提佣失败";
    }

    /**
     * 我的钱包记录的流向
     */
    public abstract class BrokerAccountDirect {
        /**
         * 流进
         */
        public static final String IN = "in";
        /**
         * 流出
         */
        public static final String OUT = "out";
    }

    /**
     * 我的钱包记录的流水类型
     */
    public abstract class BrokerAccountType {
        /**
         * 分享
         */
        public static final String SHARE = "sharing";
//        /**佣金推荐成交的客户就用，推荐返现RECOMMEND
//         * 佣金
//         */
//        public static final String BROKERAGEs = "brokerage";

        /**
         * 推荐返现
         */
        public static final String RECOMMEND = "recommend";

        /**
         * 团队返现
         */
        public static final String TEAM = "team";

        /**
         * 提现
         */
        public static final String WITHDRAWAL = "withdrawal";

        /**
         * 红包返现
         */
        public static final String RED_PACKAGE = "red_package";

        /**
         * 红包分享返现
         */
        public static final String RED_PACKAGE_SHARE = "red_share";

        /**
         * 关注红包返现
         */
        public static final String RED_PACKAGE_FORK = "red_fork";

        /**
         * 红包预约返现
         */
        public static final String RED_PACKAGE_APPOINTEMENT = "red_appointement";

        /**
         * 邀约返现
         */
        public static final String INVITATION_REG = "invitation_reg";

        /**         * 提现退回
         */
        public static final String AUDIT = "audit";

        /**
         * 提佣失败
         */
        public static final String APPLY_FAILURE = "applied_failure";

        /**
         * 帮趣推广
         */
        public static final String BANGQU_EXTENSION = "extension";

    }

    /**
     * 流水类型中文
     */
    public abstract class BrokerAccountTypeCN {
        /**
         * 分享
         */
        public static final String SHARE_CN = "【分享返现】";
        /**
         * 佣金
         */
        public static final String BROKERAGE_CN = "【佣金返现】";

        /**
         * 推荐返现
         */
        public static final String RECOMMEND_CN = "【推荐返现】";

        /**
         * 团队返现
         */
        public static final String TEAM_CN = "【团队返现】";

        /**
         * 提现
         */
        public static final String WITHDRAWAL_CN = "【佣金提现】";

        /**
         * 红包返现
         */
        public static final String RED_PACKAGE_CN = "【红包返现】";
        /**
         * 邀约返现
         */
        public static final String INVITATION_CN = "【邀约返现】";

        public static final String RED_PACKAGE_FORK_CN = "关注红包";

        public static final String RED_PACKAGE_APPOINTEMENT_CN = "预约红包";

        public static final String INVITATION_REG_CN = "抢钱宝";
    }


    /**
     * App更新的 记录 的状态码
     *
     * @author WangLei  createtIime:2014-下午7:27:59
     */
    public abstract class AppStatus {
        public static final String APP_ENABLE_STATUS = "enable";//可用状态
        public static final String APP_DISABLE_STATUS = "disable";//不可用状态
    }


    /**
     * 代理机构是否禁用状态
     *
     * @author WangLei  createtIime:2014-下午9:04:38
     */
    public abstract class AgentStatus {
        public static final String AGENT_ON_STATUS = "on";//可用状态
        public static final String AGENT_OFF_STATUS = "off";//不可用状态
    }


    /**
     * 代理机构与楼盘的状态
     *
     * @author WangLei createtIime:2014-下午11:45:24
     */
    public abstract class AgentHousesStatus {
        public static final String AGENTHOUSES_ON_STATUS = "on";// 可用状态
        public static final String AGENTHOUSES_OFF_STATUS = "off";// 不可用状态

    }

    /**
     * 楼盘 项目活动的发布渠道
     *
     * @author WangLei  createtIime:2014-下午11:25:10
     */
    public abstract class PublishChannel {
        public static final String WEB_CHANNEL = "web";//好屋中国网站：web，
        public static final String SOCIAL_CHANNEL = "social";//社会版APP：social，
        public static final String ORGAZITION_CHANNEL = "organization";//机构版APP：organization',
        public static final String COMMUNITY_CHANNEL = "community";//社区APP：community'
        public static final String PARTNER_CHANNEL= "partner";//合伙人APP：partner'
    }

    /**
     * 广告状态
     *
     * @author Wanglei（randy）
     */
    public abstract class ProjectActivityStatus {
        public static final String ACTIVITY_APPROVED = "approved";//待审核
        public static final String ACTIVITY_READY = "ready";//待投放
        public static final String ACTIVITY_EDIT = "edit";//待编辑
        public static final String ACTIVITY_STOP = "stop";//已暂停
        public static final String ACTIVITY_ON = "on";//投放中
        public static final String ACTIVITY_OFF = "off";//已下架
    }
    public abstract class ProjectActivityStatusName {
        public static final String ACTIVITY_ON = "投放中";//投放中
        public static final String ACTIVITY_OFF = "已下架";//已下架
        public static final String ACTIVITY_STOP = "已暂停";//已暂停
        public static final String ACTIVITY_APPROVED = "待审核";//待审核
        public static final String ACTIVITY_EDIT = "待编辑";//待编辑
        public static final String ACTIVITY_READY = "待投放";//待投放
    }
    /**
     * 楼盘项目活动的是否推送
     *
     * @author Wanglei
     */
    public abstract class ProjectActivityIsPush {
        public static final String ISPUSH_YES = "yes";//已推送
        public static final String ISPUSH_NO = "no";//没有推送
    }

    /**
     * 活动奖励规则状态
     */
    public abstract class ActivityRewardRuleStatus {
        public static final String RULE_ON = "on";//活动奖励规则开启
        public static final String RULE_OFF = "off";//活动奖励规则关闭
    }

    /**
     * 楼盘项目活动类型
     *
     * @author WangLei  createtIime:2014-下午11:39:51
     */
    public abstract class ActivityType {
        public static final String SHARING_TYPE = "sharing";//分享 id: 24
        public static final String INFORMATION_TYPE = "information";//资讯  id: 25
        public static final String KNOWLEDGE_TYPE = "knowledge";//知识  id: 19
        public static final String SKILLS_TYPE = "skills";//技能 id: 20
        public static final String CASE_TYPE = "case";//案例类  id: 21
        public static final String EXPRESS_TYPE = "express";//行业速递  id: 22
    }

    /**
     * follow表中的type状态
     *
     * @author zhoujun
     */
    public abstract class FollowHouseType {
        public static final String HOUSE_NEW = "new_house";//新房
        public static final String HOUSE_SECOND = "second_house";// 二手房
        public static final String HOUSE_FOREIGN = "foreign_house";// 二手房

        public static final int REQUEST_HOUSE_NEW = 0;    //新房
        public static final int REQUEST_HOUSE_SECOND = 1; //二手房
    }

    /**
     * 文档类型
     */
    public abstract class DocumentType {
        public static final String NONE = "0";//无类型
        public static final String RECEIPT = "1"; //收据
        public static final String CONTRACT = "2"; //合同
        public static final String OLD_CONTRACT = "old_contract"; //老业主合同
        public static final String HANDWRITING_DECLARE = "3"; //手写申明
        public static final String ID_CARD = "4";  //身份证
        public static final String BANK_CARD = "5"; //银行卡
        public static final String SOUND = "6";  //语音
        public static final String RELATED_PIC = "7"; //关联图片
        public static final String ID_CARD_B = "8";  //身份证反面
        public static final String FACE = "9";  //头像
        public static final String AD = "10";  //活动投放

        public static final String HUKOUBEN = "10"; //Hu kou ben
        public static final String JIEHUNZHENG = "11"; //JIE HUN ZHENG
        public static final String POS_PIC = "12"; //POS小票附件
    }

    /**
     * 场景类型
     */
    public abstract class DocumentObjectType {
        public static final String GROUP_BUY_DOC = "group_buy";//下定文档类型
        public static final String REFUND_DOC = "refund"; //退款文档类型
        public static final String LINK_MAN_DOC = "link_man";//关联人文档类型
        public static final String IDCARD_DOC = "idcard";//身份证文档类型
        public static final String BANK_CARD_DOC = "bank_card";//银行卡文档类型
        public static final String PROJECT_ACTIVITY = "project_activity";//活动投放
        public static final String DEAL_HAND_WRITE = "deal_hand_write"; //DocumentType :3 对应的 文档类型(手写声明)
        public static final String DEAL_ID_CARD = "deal_id_card"; //DocumentType :5 对应的 文档类型(身份证)
        public static final String DEAL_BANK_CARD = "deal_bank_card"; //DocumentType :5 对应的 文档类型(银行卡)
        public static final String OLD_CONTRACT = "old_contract"; //老业主合同
    }

    /**
     * 7天的无奖励 时间有没有到的状态
     *
     * @author WangLei  createtIime:2014-下午3:29:57
     */
    public abstract class Day7ShareStatus {
        public static final String ON_STATUS = "1";//过了7天
        public static final String OFF_STATUS = "0";//没有过7天
    }

    /**
     * 分享是否可以得到奖励状态
     *
     * @author WangLei  createtIime:2014-下午4:45:12
     */
    public abstract class ShareStatus {
        public static final String ON_STATUS = "1";//可以得到奖励状态
        public static final String OFF_STATUS = "0";//不可以得到奖励状态


    }

    //通用的消息
    public abstract class CommonMessage {
        public static final String FAILED_MESSAGE = "获取数据失败!";//获取数据失败
        public static final String SUCCESS_MESSAGE = "请求数据成功!";//获取数据失败
        public static final String ERROR_MESSAGE = "请求数据出错!!";//获取数据出错!
        public static final String PARAM_ERROR_MESSAGE = "请求参数传递错误!!";//参数传递错误

    }

    //通用的状态码
    public abstract class CommonCode {
        public static final String FAILED_CODE = "0";//获取数据失败状态码
        public static final String SUCCESS_CODE = "1";//获取数据成功状态码
        public static final String ERROR_CODE = "0"; //获取数据出错状态码
        public static final String PARAM_ERROR_CODE = "0";//参数传递错误状态码
        public static final String NO_LOGIN = "-99";//参数传递错误状态码
        public static final String BUSSINESS_ERROR_CODE = "-101"; //业务异常

    }

    //通用的结果
    public abstract class CommonResult {
        public static final String SUCCESS = "1";//成功
        public static final String FAILURE = "0";//失败
    }

    /**
     * 奖励类型type
     */
    public abstract class RewardType {
        public static final String SHARING_TYPE = "share";//分享奖励
        //add by wanglei(randy) on 2014-06-15
        public static final String CLICK_TYPE = "click";//点击
        public static final String APPOINTMENT_TYPE = "appointment";//预约
        //add by wanglei(randy) on 2014-06-14
        public static final String VISIT_TYPE = "visit";//到访
        public static final String ORDER_TYPE = "order";//下定奖励
        public static final String DEAL_TYPE = "deal";//成交
        public static final String HAOWU_APPOINTMENT_TYPE = "haowuappointment";//好屋预约

    }

    /**
     * 奖励状态
     * add by wanglei(randy) on 2014-06-14
     */
    public abstract class RewardStatus {
        public static final String REWARD_REWARDE = "reward";//待奖励
        public static final String REWARD_REWARDED = "rewarded";//已奖励
        public static final String REWARD_UNREWARD = "unreward";//未奖励
        public static final String REWARD_HAOWU_REWARDED = "haowurewarded";//好屋奖励
    }

    /**
     * 身份证审核的状态
     */
    public abstract class IdcardApproveStatus {
        public static final String UNAPPROVED_STATUS = "unapproved";//1未审核
        public static final String NOT_PASS_APPROVED_STATUS = "not_pass_approved";//2审核不通过
        public static final String APPROVED_STATUS = "approved";//3审核通过
    }

    /**
     * 银行卡审核的状态
     */
    public abstract class BankCardApproveStatus {
        public static final String UNAPPROVED_STATUS = "unapproved";//1未审核
        public static final String NOT_PASS_APPROVED_STATUS = "not_pass_approved";//2审核不通过
        public static final String APPROVED_STATUS = "approved";//3审核通过
        public static final String UNBIND_STATUS = "unbind";//解绑
    }

    /**
     * 银行卡默认是与否状态码
     */
    public abstract class BankDefaultStatus {
        public static final String ON_STATUS = "on";//默认
        public static final String OFF_STATUS = "off";//不默认

    }

    /**
     * hoss后台系统用户帐号状态
     */
    public abstract class SysUserStatus {
        public static final String IS_ENABLED = "1";
        public static final String IS_DISABLED = "0";
    }

    /**
     * 流水类型(broker_account_record:type [])
     */
//    public abstract class AcountFlowType{
//    	
//    	 public static final String BROKERAGE = "brokerage";	//佣金
//    	 public static final String SHARING = "sharing";		//分享
//    	 public static final String WITHDRAW = "withdraw";		//提现
//    	 
//    }


    /**
     * hoss后台系统帐号的职位类型（可补充）
     */
    public abstract class SysUserPosition {
        public static final String MASTER = "管理者";
        public static final String PM = "项目经理";
        public static final String PMASSISTANT = "项目助理";
        public static final String PKMANAGER = "品控主管";
        public static final String PKASSISTANT = "品控专员";
        public static final String FM = "财务主管";
        public static final String FMASSISTANT = "财务助理";
        public static final String EXPANDASSISTANT = "拓展专员";
    }

    /**
     * hoss后台数据权限角色
     */
    public abstract class DataRole {
        public static final String DATA_MASTER = "master";
        public static final String DATA_CITY_M = "cityMaster";
        public static final String DATA_PROJECT = "project";
    }

    /**
     * 项目状态
     */
    public abstract class ProjectRunningStatus {
        /**
         * 项目正常操作运行状态
         */
        public static final String ON = "1";
        /**
         * 项目未开始已结束或中止
         */
        public static final String OFF = "0";
    }

    /**
     * 系统部门
     */
    public abstract class Department {
        public static final String CALLDEPT = "呼叫中心";//1
        public static final String PKDEPT = "品控中心";//2
        public static final String FINANCEDEPT = "财务中心";//3
        public static final String PERSONNEL = "人事";//4
        public static final String EXPANDDEPT = "拓展中心";//5
        public static final String PROJECTDEPT = "项目中心";//6
    }

    /**
     * zone海外城市——排序
     */
    public abstract class ZoneOrder {
        public static final int defaultOrder = 0;//默认
    }

    /**
     * zone海外城市——状态
     */
    public abstract class ZoneStatus {
        public static final int defaultStatus = 1;//默认
    }

    /**
     * sys_province省份——排序
     */
    public abstract class ProvinceOrder {
        public static final int defaultOrder = 0;//默认
    }

    /**
     * sys_province省份——状态
     */
    public abstract class ProvinceStatus {
        public static final int defaultStatus = 1;//默认
    }

    /**
     * sys_city省份——排序
     */
    public abstract class CityOrder {
        public static final int defaultOrder = 0;//默认
    }

    /**
     * sys_city省份——状态
     */
    public abstract class CityStatus {
        public static final int defaultStatus = 0;//默认
    }

    /**
     * sys_area区域——排序
     */
    public abstract class AreaOrder {
        public static final int defaultOrder = 0;//默认
    }

    /**
     * sys_area区域——状态
     */
    public abstract class AreaStatus {
        public static final int defaultStatus = 0;//默认
    }

    /**
     * sys_plate板块——排序
     */
    public abstract class PlateOrder {
        public static final int defaultOrder = 0;//默认
    }

    /**
     * sys_plate板块——状态
     */
    public abstract class PlateStatus {
        public static final int defaultStatus = 0;//默认
    }

    /**
     * 退款表package_status状态
     */
    public abstract class ClientRefundPackageSstatus {
        public static final String PACKEDSTATUS = "packed";//已打包
        public static final String UNPACKEDSTATUS = "unpacked";//未打包

        /**
         * Add by yuzhijian*
         */
        public static final String PACKEDSTATUS_TYPE_REFUND = "refund";//打包类别为退款确认
        public static final String PACKEDSTATUS_TYPE_APPROVED = "approved";//未
        // 打包类型提现

    }

    /**
     * 楼盘是否推送过
     */
    public abstract class HousesIsPush {
        public static final String YES_PUSH = "yes";//已推送
        public static final String NO_PUSH = "no";//未推送
    }


    /**
     * 活动编辑状态
     */
    public abstract class ActivityEditStatus {
        public static final int EDITABLE = 1;   //编辑过的
        public static final int NOT_EDITABLE = 0;//未编辑的
    }

    /**
     * 中介公司合作状态
     */
    public abstract class OrgCoopStatus {
        public static final String ON = "on";//合作中
        public static final String OFF = "off";//中止
    }

    /**
     * 中介公司结算周期
     */
    public abstract class OrgEndCycle {
        public static final String DAY = "day";//按天结算
        public static final String WEEK = "week";//按周结算
        public static final String MONTH = "month";//按月结算
        public static final String QUARTER = "quarter";//按季度结算
        public static final String YEAR = "year";//按年结算
    }

    /**
     * Agent Constant
     */
    public abstract class AgentConstant {
        /**
         * Record result
         */
        public static final String CLIENT_HAS_INTENTION = "有意向";
        public static final String CLIENT_KEEP_CONTACT = "继续跟进";
        public static final String CLIENT_NO_INTENTION = "无意向";
        public static final String CLIENT_NO_RESPONSE = "未拨通";

        /**
         * Client State
         */
        public static final String VISITING = "即将到访";
        public static final String CONFIRMING = "继续跟进";
        public static final String LATER = "尚未联系";

        /**
         * Is top sale
         */
        public static final String YES = "yes";
        public static final String NO = "no";

        /**
         * 抢客状态
         */
        public static final String SUCCESS = "success";
        public static final String FAIL = "fail";

        /**
         * Agent com.hoss.agent.timer configure constant
         */
        public static final String AGENT_LATER_PROCESS_EXPIRE = "agentLaterProcessExpireTime";
        public static final String AGENT_TRUBBLE_EXPIRE = "agentTrubbleExpireTime";
        public static final String AGENT_CALLING_LOCK_EXPIRE = "agentCallingLockExpireTime";
        public static final String AGENT_KEEP_CONTACT_EXPIRE_TIME = "agentKeepContactExpireTime";
        public static final String AGENT_MAX_ROB_TIMES = "8";
        public static final String AGENT_TOP_SALE_FIRST_TIME = "agentTopSaleFirstTime";
        public static final String AGENT_TOP_SALE_PRIOR_TIME = "agentTopSalePriorTime";
        public static final String AGENT_CLIENT_INTENTION_EXPIRE = "agentClientIntentionExpireTime";

        /**
         * Client exchange log scene
         */
        public static final String AGENT_SCENE = "agent";

        /**
         * Agent work record constant
         */
        public static final String CLIENT_DEAL = "认购房源";
        public static final String CLIENT_BUY = "缴纳定金";
        public static final String CLIENT_SUCCESS = "抢客成功";

    }

    /**
     * 新房分组类别
     */
    public abstract class NewHouseGroupType {
        /**
         * 好屋推广
         */
        public static final String NEW_HOUSE_HAOWU_POPULARIZE = "0";
        /**
         * 本市
         */
        public static final String NEW_HOUSE_LOCAL_CITY = "1";
        /**
         * 全国旅游
         */
        public static final String NEW_HOUSE_TOUR = "2";
        /**
         * 海外
         */
        public static final String NEW_HOUSE_ABROAD = "3";
    }

    /**
     * 是否为推荐的房源
     */
    public abstract class RecommendStatus {
        public static final int APP_RECOMMEND_YES = 1; //推荐
        public static final int APP_RECOMMEND_NO = 0;  //不推荐
    }

    /**
     * 经纪与楼盘的合作状态
     */
    public abstract class CooperationState {
        public static final int COOPERATION_STATE_YES = 1;  //合作
        public static final int COOPERATION_STATE_NO = 0;   //未合作
    }

    public abstract class CollectionStatus {
        public static final String NORMAL = "0";
        public static final String DELETE = "1";
    }

    /**
     * 收藏状态
     */
    public abstract class FavoriteState {
        public static final int FAVORITE_STATE_YES = 1;
        public static final int FAVORITE_STATE_NO = 0;
    }

    /**
     * 房源数据类型
     */
    public abstract class HouseDataType {
        public static final int CHINA = 1; //国内地产
        public static final int ABROAD = 2;//国外地产
        public static final int TOUR = 3;  //旅游地产
    }

    /**
     * 默认房源国家,中国
     */
    public static final int DEFAULT_COUNTRY = 0;
    /**
     * 旅游地产
     */
    public static final String HOUSE_TOUR_TYPE = "7";
    /**
     * 海外地产
     */
    public static final String HOUSE_ABORAD_TYPE = "8";

    /**
     * app更新
     */
    public abstract class UpdateNeed {

        public static final String NEED = "Y";
        public static final String UN_NEED = "N";
    }


    /**
     * 业务员帐号状态
     */
    public abstract class AgentSalesStatus {
        public static final String ON = "on";
        public static final String OFF = "off";
    }

    /**
     * 业务员帐号最大枪客数量
     */
    public abstract class AgentSalesMaxTimes {
        public static final int AgentSalesMaxTimes = 8;
    }


    /**
     * 客户来源经纪人类型
     */
    public abstract class ClientSourceOfBroker {
        public static final int MYSELF = 0;  //自己
        public static final int UNDER_LINE = 1; //下线
    }

    /**
     * 客户跟进计划状态
     */
    public abstract class ClientWorkPlanStatus {
        public static final short REMIND_STATUS_NO = 0; //未查看
        public static final short REMIND_STATUS_YRS = 1; //已查看
    }

    public abstract class ClientListQueryCondition {

        public static final String FILING = "01";   //报备
        public static final String VISITED = "02";   //到访
        public static final String GROUPBY = "03";   //下定
        public static final String DEALED = "04";   //成交
        public static final String TODAY_CONCAT = "11";  //今天联系
        public static final String LATELY_THREE_DAY = "12"; //近三天联系
        public static final String THIS_WEEK = "13";    //本周联系
        public static final String THIS_MONTH = "14";   //本月联系
        public static final String MYSELF = "21";      //自有客户
        public static final String UNDER_LINE = "22";  //下线客户
    }

    public abstract class ClientConditionIsMyself {
        public static final String DEFAUTL_ALL = "all";
        public static final String MYSELF = "myself";
        public static final String UNDER_LINE = "underLine";
    }


    /**
     * 验证码codetype
     */
    public abstract class IdentitifyCodeType {
        public static final String BROKER_ADD = "broker_add";
        public static final String BROKER_FIND = "broker_find";
        public static final String BROKER_PHONE = "broker_phone";
        public static final String AGENT_ADD = "agent_add";
        public static final String ProjectAssistant_FIND = "assistant_find";
    }

    /**
     * 保护期提醒
     */
    public abstract class ProtecteRemind {
        public static final String REMIND_YES = "1"; //提醒
        public static final String REMIND_NO = "0";  //不提醒
    }

    /**
     * sys_user_project_log  type类型   update delete
     */
    public abstract class SysUserProjectLogType {
        public static final String UPDATE = "update";//修改项目员工关系时的插入类型
        public static final String DELETE = "delete";//删除项目员工关系时的插入类型
    }

    public abstract class DataIsAbledStatus {
        public static final String ENABLED = "enabled";
        public static final String DISABLED = "disabled";
    }

    /**
     * Constant for project assistant
     */
    public abstract class ProjectAssistantConstant {
        public static final String SUBMIT_TYPE_APPLY_REFUND = "apply_refund";
        public static final String SUBMIT_TYPE_CONFIRM_GROUPBUY = "confirm_groupbuy";
        public static final String SUBMIT_TYPE_RELATIONSHIP = "relationship";

        public static final String RELATIONSHIP_TYPE_COUPLE = "couple"; //夫妻
        public static final String RELATIONSHIP_TYPE_CHILD = "child";   //子女
        public static final String RELATIONSHIP_TYPE_BOY_GRIL_FRIENT = "boy_gril"; //男女朋友
        public static final String RELATIONSHIP_TYPE_OTHER = "other"; //其他
    }

    /**
     * 团体经济人类型
     */
    public abstract class BrokerTeamTypeID {
        public static final long CONDUIT_BROKER_TEAM_TYPE_ID = 1L;//中介
        public static final long ALONE_BROKER_TEAM_TYPE_ID = 2L; //独立经纪人
    }

    /**
     * 是否置顶
     */
    public abstract class TopStatus {
        public static final int TOP_YES = 1;
        public static final int TOP_NO = 0;
    }

    /**
     * 项目是否针对所有经纪人开放
     */
    public abstract class ProjectIsAllBrokerOpen {
        public static final int OPEN_YES = 1; //所有中介开放
        public static final int OPEN_NO = 0;  //部分中介合作
    }

    /**
     * 分配状态
     */
    public abstract class DistributionStatus {
        public static final String ON = "on";
        public static final String OFF = "off";
    }


    //模版是否启用
    public abstract class LiquidationTemplateDisabled {
        public static final int YES = 0;//是
        public static final int NO = 1;//停用
    }


    public abstract class SmsChannel {
        /**
         * *****************短信发送渠道定义 start************************
         */
        public static final String DEFAULT = "system";          //系统
        public static final String SOCIETY = "society";         //社会版
        public static final String ORG = "org";                 //机构版
        public static final String PROJECT_ASSISTANT = "projectAssistant"; //项目助理
        public static final String AGENT = "agent";             //抢客宝
        /********************短信发送渠道定义 end  *************************/
    }

    //对所有中介开放
    public abstract class IsPublicForAllTeam {
        public static final int YES = 0;//对所有中介开放：0
        public static final int NO = 1;//,对指定中介开放:1
    }

    //Hoss角色的启用与禁用
    public abstract class HossRoleStatus {
        public static final int YES = 1;//启用：1
        public static final int NO = 0;//,禁用: 0
    }

    /**
     * 关联人状态
     */
    public abstract class ClientLinkmanStatus {
        public static final String APPROVING = "approving";
        public static final String APPROVED_FAIL = "approved_fail";
        public static final String APPROVED_SUCCESS = "approved_success";
    }

    /**
     * 项目助理未到访客户的电话确认状态
     */
    public abstract class ProjectAssistantConfirmStatus {

        public static final String CONTINUE = "continue";   //继续联系
        public static final String CHANGE_SCHUDLE = "change_schdule"; //行程改变
        public static final String DELAY = "delay";                   //迟到
        public static final String NO_INTENTION = "no_intention";    //无意向
    }

    public abstract class BrokerRatio{
        public static final int SOCIAL_BROKER_RATIO = 20;
        public static final int ORG_BROKER_RETIO = 80;
    }

    /**
     * 客户预约限制天数
     */
    public static final String APPOINTMENT_LIMIT_DAYS = "appointment_limit_days";
    public static final String APPOINTMENT_LIMIT_DAYS_DEFAULT = "30";

    /**
     * 预约次数
     */
    public static final String APPOINTMENT_LIMIT_NUM = "appointment_limit_num";
    public static final String APPOINTMENT_LIMIT_NUM_DEFALUT = "3";

    /**
     * 活动——投放渠道
     */
    public abstract class ProjectActivityPutType {

        public static final int PROJECT = 1;//合作楼盘项目
        public static final int HOUSES = 2;//非合作楼盘项目
        public static final int OTHERS = 3;//非楼盘产品
    }

    /**
     * 经济人账户启用、注销、封号
     */
    public abstract class HossBrokerDisable {
        public static final int ZERO = 0;//注销
        public static final int ONE = 1;//启用
        public static final int TWO = 2;//封号
    }


    /**
     * 助理宝配置的键
     */
    public abstract class ProjectAssistantConfigKey
    {
        public static final String SMS_NUMBER = "sms_number";
        public static final String DEFAULT_SMS_NUMBER = "10690999106";
    }

    //经纪人一天最大推荐客户数
    public static final String  ONE_DAY_MAX_CUSTOMER_NUM = "one_day_max_customer_num";
    public static final String  ONE_DAY_MAX_CUSTOMER_NUM_DEFAULT = "10";

    public static  final String MOBILE_PHONE_REGEX = "mobile_phone_regex";
    public static  final String MOBILE_PHONE_REGEX_DEFAULT="^1(((34[0-8]|705)|(3[5-9]|47|5[012789]|78|8[23478])[0-9])|(709|(3[0-2]|45|5[56]|76|8[56])[0-9])|((349|700)|([35]3|77|8[019])[0-9]))\\d{7}$";


    /**
     * 验证码状态
     */
    public abstract class VerifyCodeStatus{

        public static final String REG_VERIFY_STATUS = "reg_verify_status";      //注册码验证状态
        public static final String MODIFY_PASSWD_STATUS = "modify_passwd_status";  //修改密码验证状态
        public static final String STATUS_CODE_NO_VERIFY ="0";  //未验证
        public static final String STATUS_CODE_HAVE_VERIFY = "1"; //已验证
    }

    public abstract class ClientsDetails{

        /** 报备客户的客户详情 */
        public static final String FILLING_CLIENTS = "0";

        /** 到访客户的客户详情 */
        public static final String VISITING_CLIENTS = "1";

        /** 下定客户的客户详情 */
        public static final String BUY_CLIENTS = "2";

        /** 成交客户的客户详情 */
        public static final String DEAL_CLIENTS = "3";

    }

    public abstract class dealPartnerType{

        /** 老带新/新带新 */
        public static final String OLD_NEW = "OLD_NEW";
        /** 专业经纪人 */
        public static final String SPECIALTY_BROKER = "SPECIALTY_BROKER";
        /** 大客户 */
        public static final String BIG_CUSTOMER = "BIG_CUSTOMER";

    }

    public abstract class ProjectSaleType{
        public static final String GROUP_BUY = "GROUP_BUY";//团购模式
        public static final String DISTRIBUTION = "DISTRIBUTION";//分销模式

    }

    public abstract class DistributionDetail {
        public static final String UNCONFIRMED = "unconfirmed";//未确认
        public static final String CONFIRMED = "confirmed";//确认
    }

    /**
     * 社会经纪人公共号,主要用于无推荐人的客户
     */
    public static final String DEFAULT_SOCIAL_BROKER_PHONE = "00000000000";
    public static final String DEFAULT_BROKER_PHONE = "00000000000";


    /**
     * 下定表 pose方式
     */
    public abstract class PoseType {
        public static final int OLD_INFO = 0;                   //0其他（以前的）
        public static final int RECEIPT_POS = 1;                   //1快钱
        public static final int OTHER_POS = 2;                   //2其他pos
    }

    /**
     * 下定表 是否代付
     */
    public abstract class IsHelpbuy {
        public static final int NOTHING = -1;                   //-1无
        public static final int MYSELF = 0;                   //0自己
        public static final int OTHER = 1;                   //1快钱
    }

    /**
     * 退款明细 type  类型：0)线下退款，1)快钱退款，2)其他pos
     */
    public abstract class RefundType {
        public static final int OLD_INFO = 0;                   //0线下退款
        public static final int RECEIPT_POS = 1;                   //1快钱退款
        public static final int OTHER_POS = 2;                   //2其他pos
    }

    /**
     * 是否是老数据：0）20150122之前产生的数据，1）20150122之后产生的数据
     */
    public abstract class RefundIsOldType{

        public static final int OLD_INFO = 0;                   //0 20150122之前产生的数据
        public static final int NEW_INFO = 1;                   //1 20150122之后产生的数据
    }
    /**
     * 增补：1）正常，不需要增补；2）增补，需要增补数据
     */
    public abstract class GroupBuySupplement{

        public static final int NUM_ONE = 1;                   //1）正常
        public static final int NUM_TWO = 2;                   //2）增补
    }
}


