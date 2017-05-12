/**
 * 好屋中国
 * com.hoss.sso.util
 * StringUtils.java
 * 
 * 2015-6-18-下午04:27:56
 *  2013好屋中国-版权所有
 * 
 */
package com.chuangge.user.common.util;

import java.math.BigDecimal;
import java.text.NumberFormat;

/**
 * StringUtils
 * @see
 * autor gn
 * 2015-6-18-下午04:27:56
 * @version 1.0.0
 */
public class StringUtils extends org.apache.commons.lang.StringUtils {
	/**
	 * 除去小数后面多余的0（比如3.00转化成3，4.30转化成4.3）
	 * @param number
	 * @return
	 */
	public static String numberFormat(BigDecimal number){
		if(number == null){
			return "0";
		}
		NumberFormat nf = NumberFormat.getInstance();
        return nf.format(number);
	}
	
	public static String numberFormat(Object number){
		if(number == null){
			return "0";
		}
		NumberFormat nf = NumberFormat.getInstance();
        return nf.format(number);
	}
}
