package com.chuangge.user.common.util;

import java.util.Map;
import java.util.concurrent.TimeUnit;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.chuangge.redis.util.RedisUtils;
import com.chuangge.user.service.UniqueTicketIdGenerator;
import com.chuangge.user.service.impl.DefaultUniqueTicketIdGeneratorImpl;

public class CasManagerUtils {

	private static final Logger logger= LoggerFactory.getLogger(CasManagerUtils.class);
	
	
	private static UniqueTicketIdGenerator uniqueTicketIdGenerator = new DefaultUniqueTicketIdGeneratorImpl();
	
	private static final long EXPIRE_TIME = 7200;
	
	private static final long EXPIRE_TIME_TGC = 1200;
	
	private static final int EXPIRE_TIME_TGC_EXPIRE_INT = 1200;
	
	
	private static final String REDISKEYPREFIXUSERTGC = "HOSS_USER_TGC";
	
	private static final String REDISKEYPREFIXUSERTICKET = "HOSS_USER_TICKET";
	
	/**
	 * 
	 * sessionPut(session插入) (这里描述这个方法适用条件 – 可选)
	 * 
	 * @param jsessionId
	 *            Cookie中key为ploccSessionId的值
	 * @param key
	 *            插入关键字
	 * @param value
	 *            插入值 void
	 * @exception
	 * @since 1.0.0
	 */
	public static void sessionPut(String jsessionId, String key, String value) {

		String jsessionValue = loadObject(jsessionId + "_" + key);
		try {
			if (org.apache.commons.lang.StringUtils.isBlank(jsessionValue)){
				cacheObject(jsessionId + ":" + key, value, "NX","EX");
			} else {
				cacheObject(jsessionId + ":" + key, value, "XX","EX");
			}
			
		} catch (Exception e) {
            logger.info("Cache Object: [" + jsessionId + "]cas存储失败");
			// TODO: handle exception
			e.printStackTrace();
		}

	}
	
	/**
	 * cacheObject(緩存對象) (这里描述这个方法适用条件 – 可选)
	 * 
	 * @param key
	 * @param value
	 * @param exp
	 *            void
	 * @throws
	 * @since 1.0.0
	 */
	public static void cacheObject(String key, String value, String nx, String expx) {
		try {
			RedisUtils.opsForValue().set(key, value, EXPIRE_TIME, TimeUnit.SECONDS);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
		logger.info("Cache Object: [" + key + "]");
	}
	
	/**
	 * flushObject(清理对象) (这里描述这个方法适用条件 – 可选)
	 * 
	 * @param key
	 *            void
	 * @throws
	 * @since 1.0.0
	 */
	public static void flushObject(String key) {
		try {
//			redis.set(getKey, value, nxxx, expx, time);
			logger.info("touch Object: [" + key + "]");
		} catch (Exception e) {
			//e.printStackTrace();
			logger.error("touch Object: [" + key + "] failed");
		}
	}


    /**
     * 生成  ticket 并保存 与 TGC 之间的关系
     *
     * @param tgc
     * @return
     */
    public static String ticketGrant(String tgc) {
    	String tgcId = uniqueTicketIdGenerator.getNewTickId("");
    	RedisUtils.opsForValue().set(REDISKEYPREFIXUSERTICKET + tgcId,tgc,EXPIRE_TIME_TGC,TimeUnit.SECONDS);
    	return tgcId;
    }
    
    public static String getAuthorizationByTgc(String tgc) {
        try {
            String userIdAndTgc =  loadObject(REDISKEYPREFIXUSERTGC + tgc);
            RedisUtils.expire(REDISKEYPREFIXUSERTGC + tgc, EXPIRE_TIME_TGC_EXPIRE_INT,TimeUnit.SECONDS);
            return userIdAndTgc;
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return null;
    }
    
	/**
	 * loadObject(加载对象) (这里描述这个方法适用条件 – 可选)
	 * 
	 * @param <T>
	 * @param key
	 * @return T
	 * @throws
	 * @since 1.0.0
	 */
	public static <T> T loadObject(String key) {
		T object = null;
		try {
			object = (T) RedisUtils.opsForValue().get(key);
		} catch (Exception e) {
			e.printStackTrace();
			logger.error(e.getMessage(), e);
		}
		logger.info("Load Object: [" + key + "]");
		return object;
	}
	
	public static  void flushBatch(String hossSessionId) {
		
		String sessionValue = loadObject(hossSessionId);
		
		if (sessionValue != null){
			RedisUtils.expire(hossSessionId, EXPIRE_TIME_TGC_EXPIRE_INT,TimeUnit.SECONDS);
		} else {
			RedisUtils.opsForValue().set(hossSessionId, hossSessionId + ":" + hossSessionId, EXPIRE_TIME_TGC_EXPIRE_INT,TimeUnit.SECONDS);
		}
		
	}
	
    /**
     * TGC验证
     *
     * @param tgc
     * @return
     */
    public static boolean tgcValidation(String tgc) {
        return null != getUserByTgc(tgc);
    }
    
    /**
     * 获取用户信息
     *
     * @param tgc
     * @return
     */
    public static String getUserByTgc(String tgc) {
        String userIdAndTgc = loadObject(REDISKEYPREFIXUSERTGC + tgc);
        return userIdAndTgc;
    }
    
    
    /**
     * 生成TGC
     *
     * @param id
     * @return
     */
    public static String tgcGrant(Long id,String userName) {
        String tgc =  uniqueTicketIdGenerator.getNewTickId("");
        RedisUtils.opsForValue().set(REDISKEYPREFIXUSERTGC + tgc, String.valueOf(userName)+":" + String.valueOf(id) +":" + tgc +":" + WebUtil.getRequest().getSession().getId(), EXPIRE_TIME_TGC,TimeUnit.SECONDS);
        return tgc;
    }
    

    /**
     * 票据验证
     *
     * @param ticket
     * @return
     */
    public static boolean ticketValidation(String ticket) {
        return null != getUserByTicket(ticket);
    }

    /**
     * 删除票据
     *
     * @param ticket
     */
    public static void removeTicket(String ticket) {
    	 RedisUtils.delete(ticket);
    }

    public static void removeAuthorizationByTicket(String ticket) {
    	RedisUtils.delete(REDISKEYPREFIXUSERTICKET + ticket);
    }
    
    /**
     * 获取用户信息
     *
     * @param ticket
     * @return
     */
    public static String getUserByTicket(String ticket) {
        String tgc = loadObject(REDISKEYPREFIXUSERTICKET + ticket);
        String userIdAndTgc = loadObject(REDISKEYPREFIXUSERTGC + tgc);
        return userIdAndTgc;
    }
    


	/**
	 * 
	 * sessionGet(session获取) (这里描述这个方法适用条件 – 可选)
	 * 
	 * @param <T>
	 * @param jsessionId
	 *            Cookie中key为ploccSessionId的值
	 * @param key
	 *            关键值
	 * @return T
	 * @exception
	 * @since 1.0.0
	 */
	public static <T> T sessionGet(String jsessionId, String key) {
		try {
			RedisUtils.expire(jsessionId + "_" + key,EXPIRE_TIME_TGC_EXPIRE_INT,TimeUnit.SECONDS);
			return (T) loadObject(jsessionId + "_" + key);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
		
		return null;
	}

	/**
	 * 
	 * sessionGet(session获取) (这里描述这个方法适用条件 – 可选)
	 * 
	 * @param <T>
	 * @param request
	 *            当前request对象
	 * @param key
	 *            关键值
	 * @return T
	 * @exception
	 * @since 1.0.0
	 */
	public static <T> T sessionGet(HttpServletRequest request, String key) {
		Map cookie = WebUtility.getCookies(request);
		String jsessionId = (String) cookie.get("ploccSessionId");
		return (T) sessionGet(jsessionId, key);
	}
}
