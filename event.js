/**
 * Created by anning on 17/1/5.
 */

(function (jQuery) {
    function returnFalse () {
        return false;
    }

    function returnTrue () {
        return true;
    }

    jQuery.event = {
        remove : function (elem, types, handler, selector, mappedTypes) {
            // 先取到 elem 上面挂着的 data
            var elemData = jQuery.hasData(elem) && jQuery._data(elem);

            var events;
            


            // 这里对 events 做了一个定义, 是挂着的 data 里面的 events 属性
            // 没有的话, 直接 return
            if (!elemData || !(events = elemData.events)) {
                return;
            }

            types = jQuery.trim(hoverHack(types || ''));
        }
    };

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
                return this;
            }

            // 也就是说这时候只传入了 types 和 selector
            // 这时候会默认为 (type, undefined, undefined, fn)
            if (data == null && fn == null) {
                // 就是我们熟悉的 xxx.on('click', function () {})
                fn = selector;
                data = selector = undefined;
            } else if (fn == null) {
                if (typeof selector === 'string') {
                    // (types, selector, fn)
                    fn = data;
                    data = undefined;
                } else {
                    // (types, data, fn)
                    // 如果 selector 位置上不是一个 string 的话
                    // 会被默认当做是 data
                    fn = data;
                    data = selector;
                    selector = undefined;
                }
            }

            if (fn === false) {
                fn = returnFalse;
            } else if (!fn) {
                return this;
            }

            if (one === 1) {
                origFn = fn;
                fn = function (event) {
                    // 这里会用到 $.fn.off 方法
                    // 现在就去定义咯
                    jQuery().off(event);
                    return origFn.apply(this, arguments);
                };

                fn.guid = origFn.guid || (origFn.guid = jQuery.guid ++);
            }
        },
        off : function (types, selector, fn) {
            // 这里还不太懂
            if (types && types.preventDefault && types.handleObj) {
                // ( event )  dispatched jQuery.Event
                var handleObj = types.handleObj;

                jQuery(types.delegateTarget).off(
                    handleObj.namespace ? handleObj.origType + '.' + handleObj.namespace : handleObj.origType,
                    handleObj.selector,
                    handleObj.handler
                );
                return this;
            }

            // handle arguments[0] 为一个 obj 的情况
            if (typeof types === 'object') {
                // 会直接把里面的全都调用一次
                for (var type in types) {
                    this.off(type, selector, types[type]);
                }
                return this;
            }

            if (selector === false || typeof selector === 'function') {
                // (types, [, fn])
                fn = selector;
                selector = undefined;
            }

            // 传入的第三个参数为 false 的话, fn 会被定义为直接 return false 的函数
            if (fn === false) {
                fn = returnFalse;
            }

            return this.each(function () {
                // 这里用到了 $.remove, 去定义一下
                jQuery.event.remove(this, types, fn, selector);
            });


        }
    });
})(jQuery);