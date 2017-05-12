/**
 * HAOWU
 * org.powerlong.sso.service.impl
 * DefaultUniqueTicketIdGeneratorImpl.java
 *
 * 2013-7-2-上午11:00
 * 2013宝龙公司-版权所有
 *
 */
package com.chuangge.user.service.impl;

import java.util.UUID;

import com.chuangge.user.service.UniqueTicketIdGenerator;


/**
 * DefaultUniqueTicketIdGeneratorImpl
 *
 * @author gn
 * @version 1.0.0
 * @email gn-hws@powerlong.com
 * @date 2013-7-2-上午11:02
 * @description 票据生成 默认实现
 */
public class DefaultUniqueTicketIdGeneratorImpl implements UniqueTicketIdGenerator {
    public String getNewTickId(String prefix) {
        return prefix + UUID.randomUUID().toString().replace("-", "").toUpperCase();
    }
}
