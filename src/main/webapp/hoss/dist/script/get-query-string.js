define(function () {
    /**
     * 根据参数名从 url 取值
     * @param {String} name
     * @param {String} url 可选
     * @returns {String||Null}
     */
    function getQueryString(name, url) {
        var str = url || document.location.search || document.location.hash,
            result = null;

        if (!name || str === '') {
            return result;
        }

        result = str.match(
            new RegExp('(^|&|[\?#])' + name + '=([^&]*)(&|$)')
        );

        return result === null ? result : decodeURIComponent(result[2]);
    }



    return getQueryString;
});