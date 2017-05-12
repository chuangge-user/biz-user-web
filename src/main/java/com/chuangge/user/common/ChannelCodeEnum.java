package com.chuangge.user.common;

/**
 * 
 * 
 * ChannelCodeEnum
 * 
 * 施晓辰 simon
 * 施晓辰 simon
 * 2014-6-11-下午5:13:48
 * 
 * @version 1.0.0
 *
 */
public enum ChannelCodeEnum {
	CODE_LOGIN_INDEX("LOGIN_INDEX","登录页");
	public String key;
	public String value;
	
	private ChannelCodeEnum(String key,String value) {
		this.key = key;
		this.value = value;
	}
}
