/**
 * 
 */
package com.chuangge.user.service.dto;

import java.util.Map;

/**
 * 远程接口返回信息DTO
 * 
 * @author guonan
 *
 */
public final class ResponseJsonDto {

	/**
	 * 成功标示，0表示成功
	 */
	private Integer code;
	
	/**
	 * 信息
	 */
	private String msg;
	
	/**
	 * 特殊数据
	 */
	private Map<String, String> data;

	/**
	 * @return the code
	 */
	public Integer getCode() {
		return code;
	}

	/**
	 * @param code the code to set
	 */
	public void setCode(Integer code) {
		this.code = code;
	}

	/**
	 * @return the msg
	 */
	public String getMsg() {
		return msg;
	}

	/**
	 * @param msg the msg to set
	 */
	public void setMsg(String msg) {
		this.msg = msg;
	}

	/**
	 * @return the data
	 */
	public Map<String, String> getData() {
		return data;
	}

	/**
	 * @param data the data to set
	 */
	public void setData(Map<String, String> data) {
		this.data = data;
	}
	
	
}
