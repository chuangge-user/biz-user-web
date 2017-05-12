/**
 * 宝龙电商
 * com.plocc.framework.utils
 * Validation.java
 *
 * 2013-7-5-下午17:51
 * 2013宝龙公司-版权所有
 *
 */
package com.chuangge.user.common.util;

import java.io.Serializable;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Validation
 *
 * @author Zhanggj
 * @version 1.0.0
 * @email zhanggj-hws@powerlong.com
 * @date 2013-7-5-上午17:51
 * @description 验证 对象
 */

public class Validation implements Serializable {
    //数字
    public static final Pattern numberRegex = Pattern.compile("^[0-9]+$");
    
    //数字 包括负数
    public static final Pattern numberRegexAll = Pattern.compile("^[-\\+]?[\\d]*$");
    
    //包含数字以及横线
    public static final Pattern onlyCharAndNumberRegex = Pattern.compile("^[a-zA-Z0-9]+([-_][a-zA-Z0-9]+)*$");
    //同上在加中文
    public static final Pattern onlyCharAndNumberAndChRegex = Pattern.compile("^[a-zA-Z0-9\u4e00-\u9fa5\\s]+([-_][a-zA-Z0-9\u4e00-\u9fa5\\s]+)*$");
    //邮箱
    public static final Pattern emailRegex = Pattern.compile("\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.[a-z]+([-.][a-z]+)*$");
    //手机号
    public static final Pattern mobileRegex = Pattern.compile("^1\\d{10}$", Pattern.CASE_INSENSITIVE);
    //图片后缀
    public static final Pattern imagePostfixRegex = Pattern.compile("\\.(?:GIF|JPG|JPEG|BMP|PNG)$", Pattern.CASE_INSENSITIVE);
    //日期
    public static final Pattern dateRegex = Pattern.compile("^\\d{4}(\\/|\\-|年)\\d{1,2}(\\/|\\-|月)\\d{1,2}.?(\\s\\d{1,2}.\\d{1,2}(.\\d{1,2})?)?$");
    //日期
    public static final Pattern dateRegexSimple = Pattern.compile("^\\d{4}.\\d{1,2}.\\d{1,2}.?$");
    //网址
    public static final Pattern urlRegex = Pattern.compile("^http:\\/\\/([\\w-]+(\\.[\\w-]+)+)+$");
    //标签
    public static final Pattern tagRegex = Pattern.compile("^\\s*(([a-z0-9A-Z\\u4e00-\\u9fa5]{2,8})\\s+){0,2}([a-z0-9A-Z\\u4e00-\\u9fa5]{2,8}\\s*)?$");

    public static Boolean isNull(Object object) {
        return object == null ? true : false;
    }

    public static Boolean isEmpty(Integer number) {
        return (isNull(number) || number == 0 || number < 1) ? true : false;
    }

    public static Boolean isEmpty(Long number) {
        return (isNull(number) || number == 0 || number < 1) ? true : false;
    }

    public static Boolean isEmpty(String string) {
        return (isNull(string) || string.trim().equalsIgnoreCase("")) ? true : false;
    }

    public static Boolean isEmpty(List list) {
        return (isNull(list) || list.size() < 1) ? true : false;
    }

    public static Boolean isEmpty(Object[] objects) {
        return (isNull(objects) || objects.length < 1) ? true : false;
    }

    public static Boolean isEmpty(Collection objects) {
        return (isNull(objects) || objects.isEmpty() || (objects.size() == 1 && objects.iterator().next() == null)) ? true : false;
    }

    public static Boolean isEmpty(Object object, String... equals) {
        if (isNull(object)) {
            return true;
        } else if (object instanceof String) {
            return isEmpty((String) object) ? true : equals.length == 0 ? false : ((String) object).equalsIgnoreCase(equals[0]);
        } else if (object instanceof Long) {
            return isEmpty((Long) object);
        } else if (object instanceof Collection) {
            return isEmpty((Collection) object);
        } else if (object instanceof Integer) {
            return isEmpty((Integer) object);
        } else if (object instanceof Object[]) {
            return isEmpty((Object[]) object);
        } else if (object instanceof Map) {
            return ((Map) object).isEmpty();
        }
        return equals.length == 0 ? false : object.toString().equalsIgnoreCase(equals[0]);
    }


    public static Boolean isNotEmpty(Object object) {
        return !isEmpty(object);
    }

    /**
     * <b>功能：</b>验证字符串str是否只包含英文,数字和"-_"
     *
     * @param str 待验证字符串
     * @return true    是只包含英文,数字和"-_" false	不是只包含英文,数字和"-_"
     */
    public static boolean onlyCharAndNumber(String str) {
        return onlyCharAndNumberRegex.matcher(str).find();
    }


    /**
     * <b>功能：</b>验证字符串str是否只包含英文,数字,中文,空格和"-_"
     *
     * @param str 待验证字符串
     * @return true    是只包含英文,数字,中文和"-_" false	不是只包含英文,数字,中文和"-_"
     */

    public static boolean onlyCharAndNumberAndCh(String str) {
        return onlyCharAndNumberAndChRegex.matcher(str).find();
    }

    /**
     * <b>功能：</b>验证字符串email是否符合email格式
     *
     * @param email 待验证邮件地址
     * @return true    符合 false	不符合
     */
    public static boolean isEmail(String email) {
        return isEmpty(email) ? false : emailRegex.matcher(email).find();
    }

    /**
     * <b>功能：</b>验证字符串url是否符合url格式
     *
     * @param url 待验证URL地址
     * @return true    符合 false	不符合
     */
    public static boolean isUrl(String url) {
        return isEmpty(url) ? false : urlRegex.matcher(url).find();
    }


    /**
     * <b>功能：</b>验证字串是否手机号
     *
     * @param mobile 待验证手机号
     * @return true    符合 false	不符合
     */
    public static boolean isMobile(String mobile) {
        return isEmpty(mobile) ? false : mobileRegex.matcher(mobile).find();
    }

    /**
     * <b>功能：</b>验证字串图片文件是否属于限定的某中类型格式
     *
     * @param filepath 待验证图片名称
     * @return true    符合 false	不符合
     */
    public static boolean isImagefile(String filepath) {
        return isEmpty(filepath) ? false : imagePostfixRegex.matcher(filepath).find();
    }


    /**
     * <b>功能：</b>验证字符串date是否符合Date格式
     *
     * @param date 待验证邮件地址
     * @return true    符合 false	不符合
     */
    public static boolean isDate(Object date) {
        if (date instanceof Date) {
            return true;
        }
        return isEmpty(date) ? false : dateRegex.matcher(date.toString()).find();
    }

    //"^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-))$"
    //^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-)) (20|21|22|23|[0-1]?\d):[0-5]?\d:[0-5]?\d$


    public static boolean isNumber(String number) {
        return isEmpty(number) ? false : numberRegex.matcher(number).find();
    }
    
    public static boolean isNumberAll(String number) {
        return isEmpty(number) ? false : numberRegexAll.matcher(number).find();
    }

    /**
     * <b>功能：</b>验证字符串tags是否符合 Tags标签 正确格式 (aaa ddd ccc)
     *
     * @param tags
     * @return true|false 符合标签格式 true 否则false
     */
    public static boolean tags(String tags) {
        return isEmpty(tags) ? false : tagRegex.matcher(tags).find();
    }

    /**
     * <b>功能：</b>查找字符串email的邮箱名称
     *
     * @param email
     * @return 邮箱 用户名
     */
    public static String findEmailName(String email) {
        return isEmpty(email) || email.indexOf("@") == -1 ? "" : email.substring(0, email.indexOf("@"));
    }
    
    /**
     * 判断字符串是否 在指定的长度内
     */
    public static boolean isLength(String str, int min, int max) {
            if (str == null) {
                    return false;
            } else {
                    int length = str.length();
                    if (length < min) {
                            return false;
                    } else if (length > max) {
                            return false;
                    }
            }
            return true;
    }

    /**
     * 判断字符串是否是 指定长度
     */
    public static boolean isLength(String str, int length) {
            if (str == null) {
                    return false;
            } else {
                    if (str.length() == length) {
                            return true;
                    }
            }
            return false;
    }
    
    /**
     * 判断字符串是否 大于length
     */
    public static boolean isGtLength(String str, int length) {
            if (str == null) {
                    return false;
            } else {
            	return str.length() > length;
                        
            }
    }
    
    /**
     * 判断字符串是否 大于等于长度
     */
    public static boolean isGtEqualLength(String str, int length) {
            if (str == null) {
                    return false;
            } else {
            	return str.length() >= length;
                        
            }
    }
    
    /**
     * 判断字符串是否 小于等于长度
     */
    public static boolean isLtEqualLength(String str, int length) {
            if (str == null) {
                    return false;
            } else {
            	return str.length() <= length;
                        
            }
    }
    
    /**
     * 判断字符串是否 小于等于长度
     */
    public static boolean isLtLength(String str, int length) {
            if (str == null) {
                    return false;
            } else {
            	return str.length() < length;
                        
            }
    }
    
    /**
     * 正则验证
     * @param value
     * @param regex
     * @return
     */
    public static boolean matches(Object value, String regex) {
        return isEmpty(value) || isEmpty(regex) ? false : String.valueOf(value).trim().matches(regex);
    }


    public static void main(String[] args) {
        /*Pattern pattern = Pattern.compile("^\\d{4}(\\/|\\-|年)\\d{1,2}(\\/|\\-|月)\\d{1,2}.?(\\s\\d{1,2}.\\d{1,2}(.\\d{1,2})?)?$");
        System.out.println(pattern.matcher("1987/04/22").find());*/

    	/*//System.out.println(isLength("22225", 1, 4));
    	System.out.println(isGtLength("123456", 6));
    	//System.out.println(isGtEqualLength("willen", 6));
    	System.out.println(isLtLength("123456", 6));
    	//System.out.println(isLtEqualLength("willen", 20));
    	//System.out.println(isEmail("441@qq.com"));
    	 * 
    	 * 
    	 * 
*/    
    
    	System.out.println(isNumberAll("-1.9"));
    }


    /**
     * 验证基类
     */
    public static class Entity {

        // 不需要验证的字段列表
        private Map ignoreValidFields = new HashMap();
        // 需要验证的字段列表
        private Map validFields = new HashMap();

        /**
         * 添加不需要验证的字段
         *
         * @param fields
         * @return
         */
        public Entity addIgnoreValidFields(String... fields) {
            if(!validFields.isEmpty()){
                throw  new RuntimeException("不能既添加忽略字段又添加有效字段！");
            }
            for (String field : fields) {
                ignoreValidFields.put(field, true);
            }
            return this;
        }

        /**
         * 添加要验证的字段
         *
         * @param fields
         * @return
         */
        public Entity addValidFields(String... fields) {
            if(!ignoreValidFields.isEmpty()){
                throw  new RuntimeException("不能既添加忽略字段又添加有效字段！");
            }
            for (String field : fields) {
                validFields.put(field, true);
            }
            return this;
        }

        /**
         * 获取字段是否需要验证
         *
         * @param field
         * @return
         */
        protected boolean isNeedValidField(String field) {
            if (!validFields.isEmpty()) {
                return validFields.containsKey(field);
            } else {
                return !ignoreValidFields.containsKey(field);
            }
        }
    }
}
