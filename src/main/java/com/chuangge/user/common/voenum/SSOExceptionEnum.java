/**
 * 
 */
package com.chuangge.user.common.voenum;

import com.chuangge.user.exception.ExceptionEnum;

/**
 * @author guonan
 *
 */
public enum SSOExceptionEnum implements ExceptionEnum {
	
	/**
	 * 登录IP地址为空
	 */
	UNKNOW_IP("OS0001", "IP地址为空"), 
	
	/**
	 * 登录MAC地址为空
	 */
	UNKNOW_MAC("OS0002", "MAC地址为空"), 
	
	/**
	 * 手机登录商场wifi ssid未获得
	 */
	UNKNOW_SSID("OS0003", "SSID为空"), 
	
	/**
	 * 参数异常
	 */
	INVALID_PARAM("OS0004", "参数异常"), 
	
	/**
	 * 更新数据库失败
	 */
	UPDATE_ERROR("OS0005", "更新数据库失败"), 
	
	/**
	 * 查询数据出错
	 */
	QUERY_ERROR("OS0006", "查询数据出错"), 
	
	/**
	 * 接口访问异常
	 */
	INTERFACE_ERROR("OS0007", "接口访问异常"), 
	
	/**
	 * 新增AC用户失败
	 */
	AC_ADD_USER_ERROR("OS0008", "新增AC用户失败"), 
	
	/**
	 * 新增CPPM用户失败
	 */
	CPPM_ADD_USER_ERROR("OS0009","新增CPPM用户失败"), 
	
	/**
	 * 新增AC用户命令行执行失败
	 */
	AC_ADD_USER_CMD_ERROR("OS0010", "新增AC用户命令行执行失败"), 
	
	/**
	 * 新增CPPM用户接口调用失败
	 */
	CPPM_ADD_USER_INTERFACE_ERROR("OS0011", "新增CPPM用户接口调用失败"), 
	
	/**
	 * 注销AC用户失败
	 */
	AC_LOGOUT_USER_ERROR("OS0012", "注销AC用户失败"), 
	
	/**
	 * 注销AC用户命令行执行失败
	 */
	AC_LOGOUT_USER_CMD_ERROR("OS0013", "注销AC用户命令行执行失败"),
	
	/**
	 * 删除CPPM用户失败
	 */
	CPPM_DEL_USER_ERROR("OS0014", "删除CPPM用户失败"), 
	
	/**
	 * 删除CPPM用户接口访问失败
	 */
	CPPM_DEL_USER_INTERFACE_ERROR("OS0015", "删除CPPM用户接口访问失败"), 
	
	/**
	 * 获取AC命令行流信息失败
	 */
	AC_CMD_IO_ERROR("OS0016", "获取AC命令行流信息失败"), 
	
	/**
	 * XML解析失败
	 */
	XML_ERROR("OS0017", "XML解析失败"),
	
	LOAD_AD_SEAT_TO_MAP_EXCEPTION("OS0018","加载广告位到map集合中异常!"),
	;
	
	/**
	 * 异常代码
	 */
	private String code;
	
	/**
	 * 后台异常信息
	 */
	private String message;
	
	
	/**
	 * 未定义错误代码的错误信息
	 */
	private static final String COMMON_ERROR_MESSAGE = "抱歉！系统繁忙，请稍后重试。";
	
	/**
	 * 构造函数
	 * 
	 * @param code 异常代码
	 * @param message 异常信息
	 */
	private SSOExceptionEnum(String code, String message) {
		this.code = code;
		this.message = message;
	}

	@Override
	public String getCode() {
		return code;
	}

	@Override
	public String getMessage() {
		return message;
	}
	
	public static String getMessage(String code) {
		for(SSOExceptionEnum errorMessageEnum :SSOExceptionEnum.values()){
			if(errorMessageEnum.getCode().equalsIgnoreCase(code)){
				return errorMessageEnum.message;
			}
		}
		return COMMON_ERROR_MESSAGE;
	}

}
