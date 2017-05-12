package com.chuangge.user.common.util;

import org.codehaus.jackson.annotate.JsonRawValue;
import org.codehaus.jackson.annotate.JsonValue;

/**
 * Created by 林晓辉 on 2014/8/19.
 */
public class JsonString {

    private String value;

    public JsonString(){

    }

    public JsonString(String value){
        this.value=value;
    }

    @JsonValue
    @JsonRawValue
    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
