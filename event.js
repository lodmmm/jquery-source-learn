/**
 * Created by anning on 17/1/5.
 */

(function (jQuery) {
    jQuery.fn.extend({
        /**
         * 我们平常熟知的 $('ohehe').on('click', function () {.....})
         */
        on : function (types, selector, data, fn, /*internal*/one) {
            // 如果说是一个 types/handlers 的 map 的话
            if (typeof types === 'object') {
                // 在 arguments[0] 是 map 的情况下
                // 只会处理 selector 位置上传入 string 的情况
                // 不是的话, 就会默认为 undefined
                if (typeof selector !== 'string') {
                    data = data || selector;
                    selector = undefined;
                }
                // 这时候会循环调用这里面的, 把每个都绑定上
                for (type in types) {
                    this.on(type, selector, data, types[type], one);
                }
            }
        }
    });
})(jQuery);