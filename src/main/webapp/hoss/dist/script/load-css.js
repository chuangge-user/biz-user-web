define(function () {
    /**
     * 加载CSS样式
     * @param {String} resource
     */
    var cache = {};

    return {
        url: function (resource) {
            var link = document.createElement('link'),
                cssUrl = resource;

            if (cache[cssUrl]) {
                return;
            }

            cache[cssUrl] = true;

            var parent = document.getElementsByTagName('head')[0]
                || document.body;

            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            link.setAttribute('href', cssUrl);
            parent.appendChild(link);

            parent = null;
            link = null;
        }
    }
});