/**
 * Created by anning on 17/1/5.
 */

(function (jQuery) {
    jQuery.event = {
        add : function (elem, types, handler, data, selector) {
            /**
             * 这里可以看到以下几种情况会直接 return
             *
             *   1. elem 为 Text 节点
             *   2. elem 为 Comment 节点
             *   3. 没传入 types
             *   4. 没传入 handler
             *   5. elem 上不可以承载 data
             */
            // todo 所以这时候去搞一发 data 模块....
            if (elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data(elem))) {
                return;
            }
        }
    };
})(jQuery);