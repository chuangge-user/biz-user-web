/**
 * HAOWU
 * com.hoss.sso.service
 * UniqueTicketIdGenerator.java
 *
 * 2013-7-2-上午11:00
 * 2013宝龙公司-版权所有
 *
 */
package com.chuangge.user.service;

/**
 * UniqueTicketIdGenerator
 *
 * @author GN
 * @version 1.0.0
 * @email zhanggj-hws@powerlong.com
 * @date 2013-7-2-上午11:02
 * @description 票据生成
 */

public interface UniqueTicketIdGenerator {
    /**
     * 获取票据
     *
     * @param prefix
     * @return
     */
    String getNewTickId(String prefix);
}
