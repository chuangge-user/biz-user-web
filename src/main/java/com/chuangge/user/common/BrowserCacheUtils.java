/**
 * 宝龙电商
 * com.plocc.trade.common
 * BrowserCacheUtils.java
 * 
 * 2013-10-18-下午04:48:47
 *  2013宝龙公司-版权所有
 * 
 */
package com.chuangge.user.common;

import javax.servlet.http.HttpServletResponse;

/**
 * 
 * BrowserCacheUtils
 * 
 * guonan
 * 2013-10-18-下午04:48:47
 * 
 * @version 1.0.0
 * 
 */
public class BrowserCacheUtils {

	/**
	 * 强制浏览器不缓存，当用户后退到
	 * 购物车页面时，强制刷新
	 * cookie 唯一
	 */
	public static void noCache(HttpServletResponse httpservletresponse)
	{
		httpservletresponse.setContentType("text/html; charset=utf-8");
		httpservletresponse.setCharacterEncoding("utf-8");
		httpservletresponse.setHeader("Pragma", "no-cache");
		httpservletresponse.setHeader("Cache-Control", "no-cache");
		httpservletresponse.setHeader("Cache-Control","no-store");
		httpservletresponse.setHeader("Expires", "0");
		httpservletresponse.setDateHeader("Expires", 0);
	}
}
