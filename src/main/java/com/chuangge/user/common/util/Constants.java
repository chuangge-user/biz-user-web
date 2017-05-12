/**
 * haowuzhongguo
 * com.plocc.auth.common.utility
 * Constants.java
 *
 * 2013-7-18-下午7:50
 * 2013宝龙公司-版权所有
 *
 */
package com.chuangge.user.common.util;

/**
 * Constants
 *
 * @author gn
 * @version 1.0.0
 * @date 2013-7-18-下午7:50
 * @email gn-hws@powerlong.com
 * @description 常量类
 */
public class Constants {

    /**
     * 是否
     */
    /*================== COOKIE ticket redirectURL =================================================================*/
    public final static int DEL_STAT_ON = 1;
    public final static int DEL_STAT_OFF = 0;

    // SESSION 中存放 用户信息的 KEY
    public final static String CAS_AUTHENTICATION_KEY = "cas_authentication_key";
    // 重定向
    public final static String CAS_REDIRECT_URL_KEY = "redirect";

    /**
     * Web层
     */
    /*================== COOKIE ticket redirectURL =================================================================*/
    // 票据
    public final static String CAS_TICKET_KEY = "ticket";
    // 退出请求
    public final static String CAS_LOGOUT_KEY = "cas_logout";

    //sessionTgc
    public final static String CAS_LOGIN_TGC = "tgc";

    //sessionTgc
    public final static String CAS_TGC_KEY = "tgc";
    
    //sessionTgc
    public final static String HOSS_SESSION_LOGIN_ID = "hossSessionId";
    
    //userId
    public final static String CAS_LOGIN_UID = "uid";
   
    //userId
    public final static String CAS_UID_KEY = "uid";
    
    /**
     * 搜索引擎默认查询条数
     */
    public final static int SEARCH_PAGE_SIZE = 20;
    /**
     * 搜索引擎关键字默认查询条数
     */
    public final static int SEARCH_KEY_PAGE_SIZE = 10;
}
