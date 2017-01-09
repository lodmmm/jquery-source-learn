/**
 * Created by anning on 17/1/4.
 */

var jQuery = (function () {
    // 一个自执行函数, return 的结果就是 jQ 的取值

    /**
     * 这个是 jQuery 的构造函数
     * 但是 jQuery.fn.init 才是真正的主体
     * @param selector => 选择器
     * @param context => 上下文
     * @returns jqObject => return 一个 jq 对象
     */
    var jQuery = function (selector, context) {
        return new jQuery.fn.init(selector, context, rootjQuery);
    };

    // 如果以前存在 jQuery 这个全局变量, 就先把它存为 _jQuery
    // 当然, $ 也是一样, 如果以前有 $ 这个全局变量, 也先存起来
    var _jQuery = window.jQuery;
    var _$ = window.$;

    // A central reference to the root jQuery(document)
    // 很多框架里面都会有一个 root 变量, 这个变量里面一般存的就是 document
    var rootjQuery;

    // A simple way to check for HTML strings or ID strings
    // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
    // 用于快速匹配 标签/ID
    var quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;

    // Check if a string has a non-whitespace character in it
    // 非空白字符
    var rnotwhite = /\S/;

    // Used for trimming whitespace
    // 用来匹配到开头的多个空格和结尾的多个空格
    var trimLeft = /^\s+/;
    var trimRight = /\s+$/;

    // Match a standalone tag
    // 匹配 <div>, <div></div> 这种标签, 中间不能有其他的字符, 只能是一个闭合标签或者一个自闭和标签
    var rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

    // JSON RegExp
    // 用来匹配有效的 char
    var rvalidchars = /^[\],:{}\s]*$/;
    // 匹配有效范围
    var rvalidscope = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;

    // Useragent RegExp
    // 对 webkit 的检测, 字符串里要有 webkit
    var rwebkit = /(webkit)[ \/]([\w.]+)/;
    // opera
    var ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/;
    // ie
    var rmsie = /(msie) ([\w.]+)/;
    // firefox
    var rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;


    // Matches dashed string for camelizing
    // 匹配 -a, -1 这种

    /**
     * 这里会有脏正则的出现
     *
     * @example
     *     var reg = /123/g;
     *     var str = '123123124';
     *     reg.test(str); // true => 这时候从第0位开始检测
     *     reg.test(str); // true => 这时候从第3为开始检测
     *     reg.test(str); // false => 这时候从第6位开始检测 => 6位开始是 124, 所以是 false
     *
     * 可以通过 reg.lastIndex 来检测匹配的起始值
     * reg.test 为 true 的时候, 这个值就会改变
     * reg.test 为 false 的时候, 这个值会归零
     *
     */
    var rdashAlpha = /-([a-z]|[0-9])/ig;

    // 匹配以 '-ms-' 开头的 str
    var rmsPrefix = /^-ms-/;


    /**
     *
     * @param all => 暂时看不出干啥的
     * @param letter => 要转换的字母
     * @returns {string} => letter 的大写形式
     */
    var fcamelCase = function (all, letter) {
        return (letter + '').toUpperCase();
    };

    // Keep a UserAgent string for use with jQuery.browser
    // 把 navigator 里面的 userAgent 属性取出来, 用来进行浏览器检测
    var userAgent = navigator.userAgent;

    // For matching the engine and version of the browser
    // 匹配浏览器内核和浏览器版本
    var browserMatch;

    // The deferred used on DOM ready
    // 只用在 DOM ready 的时候
    var readyList;

    // The ready event handler
    // 浏览器 ready 事件的处理函数
    var DOMContentLoaded;

    // Save a reference to some core methods
    // 把一些原生方法取出来
    var toString = Object.prototype.toString;
    var hasOwn = Object.prototype.hasOwnProperty;
    var push = Array.prototype.push;
    var slice = Array.prototype.slice;
    var trim = String.prototype.trim;
    var indexOf = Array.prototype.indexOf;

    // [[class]] -> type pairs
    var class2type = {};

    jQuery.fn = jQuery.prototype = {
        constructor: jQuery,
        /**
         * jQ 的本尊了...
         * @param selector
         * @param context
         * @param rootjQuery
         */
        init: function (selector, context, rootjQuery) {

            // 匹配结果
            var match;
            // ownerDocument/document
            var doc;

            var ret;

            var elem;

            // Handle $(""), $(null), or $(undefined)
            // 这里处理的就是上面三种情况
            // 啥都不干 return 一个 jq 对象
            if (!selector) return this;

            // Handle $(DOMElement)
            // 传入的是 dom 节点的时候
            if (selector.nodeType) {
                // 给一个新的 jq 对象上面, 新建 context 属性存他原来的 dom
                // 在规定好他的 length
                // 然后返回这个新的 jq 对象
                this.context = this[0] = selector;
                this.length = 1;
                return this;
            }

            // The body element only exists once, optimize finding it
            // 对 body 单独考虑
            if (selector === 'body' && !context && document.body) {
                this.context = document;
                this[0] = document.body;
                this.selector = selector;
                shit.length = 1;
                return this;
            }

            // Handle HTML strings
            // 处理传入的字符串
            if (typeof selector === 'string') {
                // selector 的第一个字符是 `<`, 第二个字符是 `>`, 且不为 `<>`, 就会进入到这个叼东西。。。
                if (selector.charAt(0) === '<' && selector.charAt(selector.length - 1) === '>' && selector.length >= 3) {
                    match = [null, selector, null];
                } else {
                    match = quickExpr.exec(selector);
                }

                if (match && (match[1] || !context)) {
                    if (match[1]) {
                        // 如果 context 是 jq 的实例的话, 就取 [0]
                        // 因为我们会把原生的 context 存在 jq 对象的 [0] 里面
                        context = context instanceof jQuery ? context[0] : context;

                        // ownerDocument/document
                        doc = (context ? context.ownerDocument || context : document);
                        // '<div></div>' 会被 exec 为 ['<div></div>', 'div']
                        ret = rsingleTag.exec('selector');
                        if (ret) {
                            // 用 element
                            if (jQuery.isPlainObject(context)) {
                                selector = [document.createElement(ret[1])];
                                jQuery.fn.attr.call(selector, context, true);
                            } else {
                                selector = [doc.createElement(ret[1])];
                            }
                        } else {
                            // 用碎片
                            ret = jQuery.buildFragment([match[1]], [doc]);
                            selector = ( ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment ).childNodes;
                        }

                        // 其实就是把 selector 挂在了 jq[0] 上面... 厉害了
                        return jQuery.merge(this, selector);
                    }
                } else {
                    // '#again' 会被处理成 ['#again', undefined, 'again']
                    // 所以这里的 match[2] 其实就是 'again'
                    elem = document.getElementById(match[2]);

                    // 如果有这个 dom 节点的话
                    if (elem && elem.parentNode) {
                        if (elem.id !== match[2]) {
                            return rootjQuery.find(selector);
                        }

                        // 还是一样定死 length
                        this.length = 1;
                        // 还是一样把 elem 塞到 jq[0] 里面
                        this[0] = elem;
                    }

                    this.context = document;
                    this.selector = selector;
                    return this;
                }
                // HANDLE: $(expr, $(...))
                // 如果说 context 为一个假值或者是 context 是 $.fn 那一级的
            } else if (!context || context.jquery) {
                return (context || rootjQuery).find(selector);
            } else {
                // todo 貌似主题还是这个 find 方法....
                return this.constructor(context).find(selector);
            }

            if (jQuery.isFunction(selector)) {
                return rootjQuery.ready(selector);
            }

            if (selector.selector !== undefined) {
                this.selector = selector.selector;
                this.context = selector.context;
            }

            return jQuery.makeArray(selector, this);

        },

        // Start with an empty selector
        // 初始化 selector
        selector : '',

        // The current version of jQuery being used
        // 版本号
        jquery : '@VERSION',

        // The default length of a jQuery object is 0
        // 一个 jq 对象的初始 length 为 0
        length : 0,

        // The number of elements contained in the matched element set
        // 会返回这个 jq 对象匹配了多少个 element
        size : function () {
            return this.length;
        },

        // 把类数组对象转成 Array
        toArray : function () {
            return slice.call(this, 0);
        },

        // Get the Nth element in the matched element set OR
        // Get the whole matched element set as a clean array
        /**
         * 针对 $('div') 这种匹配出一大堆的东西的, 取第 num 个
         * @param num
         * @returns any
         */
        get : function (num) {
            return num == null ? this.toArray() : (num < 0 ? this[this.length + num] : this[num])
        },

        // Take an array of elements and push it onto the stack
        // (returning the new matched element set)
        pushStack : function (elems, name, selector) {
            // 得到一个新的 jq 对象集合
            var ret = this.constructor();

            // elems 是 array 的话, 就直接 push 进去
            if (jQuery.isArray(elems)) {
                push.apply(ret, elems);
            } else {
                // 是 obj 就 merge 进去
                jQuery.merge(ret, elems);
            }
            // 把调用这个方法的 jq 对象存起来
            ret.prevObject = this;
            // 各种抄
            ret.context = this.context;
            // 如果是 find 方法, 就要给 selector 拼上原来的 selector 加一个空格(selector + ' ')
            if (name === 'find') {
                ret.selector = this.selector + (this.selector ? ' ' : '') + selector;
            } else if (name) {
                ret.selector = this.selector + '.' + name + '(' + selector + ')';
            }
            // 最后返回的是这个新的 jq 对象
            return ret;
        },

        // Execute a callback for every element in the matched set.
        // (You can seed the arguments with an array of args, but this is
        // only used internally.)
        // 这里是调用 jq 的 each 方法
        each : function (callback, args) {
            return jQuery.each(this, callback, args);
        },

        ready : function (fn) {
            // Attach the listeners
            jQuery.bindReady();

            // Add the callback
            // 添加 callback
            // todo 这个 .add 的定义
            readyList.add(fn);

            return this;
        },

        // 一大堆操作的 $ 的方法
        eq : function (i) {
            i = +i;
            return i === -1 ? this.slice(i) : this.slice(i, i + 1);
        },

        first: function() {
            return this.eq( 0 );
        },

        last: function() {
            return this.eq( -1 );
        },

        slice: function() {
            return this.pushStack( slice.apply( this, arguments ),
                "slice", slice.call(arguments).join(",") );
        },

        map: function( callback ) {
            return this.pushStack( jQuery.map(this, function( elem, i ) {
                return callback.call( elem, i, elem );
            }));
        },

        end: function() {
            return this.prevObject || this.constructor(null);
        },

        // For internal use only.
        // Behaves like an Array's method, not like a jQuery method.
        push: push,
        sort: [].sort,
        splice: [].splice
    };

    jQuery.fn.init.prototype = jQuery.fn;

    // 这个 extend 方法搞了太多遍了。。。
    jQuery.extend = jQuery.fn.extend = function () {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
            target = {};
        }

        // extend jQuery itself if only one argument is passed
        if ( length === i ) {
            target = this;
            --i;
        }

        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
                        if ( copyIsArray ) {
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : [];

                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[ name ] = jQuery.extend( deep, clone, copy );

                        // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    };

    // 只有一个参数, 会被当成是对 jq 的扩展
    jQuery.extend({
        // 就是看有没有 namespace 上面的冲突
        noConflict : function (deep) {
            if (window.$ === jQuery) {
                window.$ = _$;
            }
            if (deep && window.jQuery === jQuery) {
                window.jQuery = _jQuery;
            }

            return jQuery;
        },

        // 是不是 ready 的 tag
        isReady : false,

        // A counter to track how many items to wait for before
        // the ready event fires. See #6781
        readyWait : 1,

        // Hold (or release) the ready event
        holdReady : function (hold) {
            if (hold) {
                jQuery.readyWait ++;
            } else {
                jQuery.ready(true);
            }
        },

        // Handle when the DOM is ready
        // 在 DOM 准备就绪的时候的执行程序
        // todo 对这里的场景还不是很理解
        ready : function (wait) {

            // 两种可以通过
            // wait 为 true, 且 没有 readyWiit 的东西
            // wait 不为 true, 且 isReady 为 false
            if ((wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady)) {
                // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
                if (!document.body) {
                    // 如果 body 都还没有的话, 那就把 jQuery.ready 加入到延时队列里面去
                    return setTimeout(jQuery.ready, 1);
                }

                // 把 tag 标记为 true
                jQuery.isReady = true;

                // If a normal DOM Ready event fired, decrement, and wait if need be
                if (wait !== true && --jQuery.readyWait > 0) {
                    return;
                }

                // 这个 readyList 是个 callback list。。。
                readyList.fireWith(document, [jQuery]);

                if (jQuery.fn.trigger) {
                    jQuery(document).trigger('ready').off('ready');
                }
            }
        },
        bindReady : function () {
            // readyList 为假的时候, 直接 return
            if (readyList) {
                return;
            }

            readyList = jQuery.Callbacks('once memory');

            // 这里为 complete 就代表着加载好了
            if (document.readyState === 'complete') {
                return setTimeout(jQuery.ready, 1);
            }

            // 给 dom 绑定事件
            if (document.addEventListener) {
                // 这里先 addEvent, 再在回调里面 removeEvent， remove 掉之后直接调用 ready 函数
                // 所以 bindReady 其实就是做了一个 readyList 的 callback 化
                document.addEventListener('DOMContentLoaded', DOMContentLoaded, false);
                window.addEventListener('load', jQuery.ready, false);
            } else if (document.attachEvent) {
                document.attachEvent('onreadystatechange', DOMContentLoaded);
                window.attachEvent('onload', jQuery.ready);

                var toplevel = false;

                try {
                    toplevel = window.frameElement == null;
                } catch (e) {}

                // 这里也还是在检测是否 ready
                if ( document.documentElement.doScroll && toplevel ) {
                    doScrollCheck();
                }
            }
        },
        // 检测是不是 function
        isFunction : function (obj) {
            return jQuery.type(obj) === 'function';
        },

        // 判断是不是 window 对象
        // 这里如果说是 ie8+ 的话, 可以直接判断({}).toString.call(obj) === '[object Window]';
        isWindow : function (obj) {
            return obj != null && obj == obj.window;
        },

        // 是不是数字型
        isNumberic : function (obj) {
            return !isNaN(parseFloat(obj)) && isFinite(obj);
        },

        // 判断是什么类型
        type : function (obj) {
            return obj == null ? String(obj) : class2type[toString.call(obj)] || 'object';
        },

        // 判断是不是一个纯净的对象
        isPlainObject : function (obj) {
            // 如果 obj 为假值, 或者不是一个 obj, 再或者是一个 dom 节点, 再或者是 window, 直接 return false
            if (!obj || jQuery.type(obj) !== 'object' || obj.nodeType || jQuery.isWindow(obj)) {
                return fasle;
            }

            try {
                // 如果有构造函数
                // 如果有 constructor 属性
                // 如果 __proto__ 有 isPropertyOf 方法
                // 统统返回
                if (obj.constructor && !hasOwn.call(obj, 'constructor') && !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                    return false;
                }
            } catch (e) {
                return false;
            }

            var key;
            for (key in obj) {}

            // 如果他都没有自有属性, 或者是有属性且是自有属性, 那么就说明是一个纯净的对象
            return key === undefined || hasOwn.call(obj, key);
        },

        // 检测是不是一个空的对象
        isEmptyObject : function (obj) {
            for (var name in obj) {
                return false;
            }
            return true;
        },

        // 简单的抛错的方法封装
        error : function (msg) {
            throw new Error(msg);
        },

        // 对 json 的处理
        parseJSON : function (data) {
            // 不是个 string 或者压根就是个假值, 直接 return null
            if (typeof data !== 'string' || !data) {
                return null;
            }
            // 去除前后空格
            data = jQuery.trim(data);

            // 能调 JSON.parse 最好, 就直接调了
            if (window.JSON && window.JSON.parse) {
                return window.JSON.parse(data);
            }

            // 不能调的话就只能自己处理了
            if ( rvalidchars.test( data.replace( rvalidescape, "@" )
                    .replace( rvalidtokens, "]" )
                    .replace( rvalidbraces, "")) ) {

                return ( new Function( "return " + data ) )();

            }

            // 上面的都不对的话, 只能抛错了
            jQuery.error('Invalid JSON : ' + data);
        },

        // 从样子上看貌似是对 XML 的处理...
        parseXML : function (data) {
            if (typeof data !== 'string' || data) {
                return null;
            }
            var xml, tmp;

            try {
                if (window.DOMParser) {
                    // 正常。。。
                    tmp = new DOMParser();
                    xml = tmp.parseFormString(data, 'text/xml');
                } else {
                    // IE。。。
                    xml = new ActiveXObject('Microsoft.XMLDOM');
                    xml.async = 'false';
                    xml.loadXML(data);
                }
            } catch (e) {
                xml = undefined;
            }

            if (!xml || !xml.documnetElement || xml.getElementsByTagName('parsererror').length) {
                jQuery.error('Invalid XML : ' + data);
            }

            return xml;
        },

        // 啥都不干的一个函数, 基本上每个框架里面都有...
        noop : function () {},

        // todo 看这个里面涉及到的 api
        globalEval : function (data) {
            if (data && rnotwhite.test(data)) {
                ( window.execScript || function( data ) {
                    window[ "eval" ].call( window, data );
                } )( data );
            }
        },

        // 转驼峰
        camelCase : function (string) {
            return string.replace(rmsPrefix, 'ms-').replace(rdashAlpha, fcamelCase);
        },

        // 判断 elem 的标签名是不是 name, 大小写不敏感
        nodeName : function (elem, name) {
            return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
        },

        // args is for internal usage only
        // 这里感觉有些冗余...
        // 方法就是为了去遍历一遍 object, 给每个都执行一遍 callback
        each : function (object, callback, args) {
            var name, i = 0;
            var length = object.length;
            var isObj = length === undefined || jQuery.isFunction(object);

            if (args) {
                if (isObj) {
                    for (name in object) {
                        if (callback.apply(object[name], args) === false) {
                            break;
                        }
                    }
                } else {
                    for (; i < length; ) {
                        if (callback.apply(object[i ++], args) === false) {
                            break;
                        }
                    }
                }
            } else {
                if (isObj) {
                    for (name in object) {
                        if (callback.apply(object[name], name, object[name]) === false) {
                            break;
                        }
                    }
                } else {
                    for (; i < length; ) {
                        if (callback.apply(object[i], i, object[i ++]) === false) {
                            break;
                        }
                    }
                }
            }
            return object;
        },


        // Use native String.trim function wherever possible
        // 去除空格
        // 原生支持的话就直接用原生的
        trim : trim ? function (text) {
            return text === null ? '' : trim.call(text);
        } : function (text) {
            return text == null ? '' : text.toString().replace(trimLeft, '').replace(trimRight, '');
        },

        // results is for internal usage only
        // 把 arguments[0] 里面的东西放到一个 array 里面
        // 最后的结果是 arguments[1] 和 arguments[0] 里面东西的结合
        makeArray : function (array, results) {
            var ret = results || [];

            if (array != null) {
                var type = jQuery.type(array);
                if (array.length == null || type === 'string' || type === 'function' || type === 'regexp'  || jQuery.isWindow(array)) {
                    push.call(ret, array);
                } else {
                    jQuery.merge(ret, array);
                }
            }
            return ret;
        },

        // merge...恩, 就是字面的意思
        // 感觉和 underscore 里面的方法有点像...
        merge : function (first, second) {
            var i = first.length;
            var j = 0;

            if (typeof second.length === 'number') {
                for (var l = second.length; j < l; j ++) {
                    // 从 first 的最后一位开始, 依次把 second 各个位赋值进去
                    first[i ++] = second[j];
                }
            } else {
                while (second[j] !== undefined) {
                    // 同上...
                    first[i ++] = second[j ++];
                }
            }

            // todo : 这句感觉没太大用, 当然后面可能结合调用会有更深的理解
            first.length = i;

            return first;
        },

        /**
         * 找 elem 在不在 array 里面
         * @param elem => 被寻找的
         * @param array => 在哪里寻找
         * @param i => 寻找的起始索引
         * @returns {*}
         */
        inArray : function (elem, array, i) {
            var len;

            if (array) {
                // 如果原生支持 indexOf 的话, 就直接用 indexOf 去写
                if (indexOf) {
                    return indexOf.call(array, elem, i);
                }

                len = array.length;
                // 没有传 i, 就从 0 开始
                // 传了 i, i 是正数的话就从 i 开始, 是负数的话就从 max(0, len + i) 位开始
                i = i ? (i < 0 ? Math.max(0, len + i) : i) : 0;
                for (; i < len; i ++) {
                    // 找到了的话, 就直接返回 i
                    if (i in array && array[i] === elem) {
                        return i;
                    }
                }
            }
            // 没找到就返回 -1
            return -1;
        },

        /**
         * 检测 elems 里面的每一项执行 callback 后结果为 inv 的项, 塞到一个数组里面返回
         * @param elems => 原始集合
         * @param callback => validator function => 检测函数
         * @param inv => 预期检测结果 => 只会有 true/false, 其他的会根据 !!inv 来强行转化为 Boolean
         * @returns {Array} => 返回通过检测函数并与预期检测结果相符的项的集合
         */
        grep : function (elems, callback, inv) {
            var ret = [], retVal;
            inv = !! inv;

            // Go through the array, only saving the items
            // that pass the validator function

            for (var i = 0, length = elems.length; i < length; i ++) {
                retVal = !!callback(elems[i], i);

                if (inv !== retVal) {
                    ret.push(elems[i]);
                }
            }

            return ret;
        },

        /**
         * 也是用来遍历, 但是如果 callback(elems[i]) 的执行结果为 null 或者 undefined 的时候, 会被过滤掉, 不会被返回
         * 要注意的就是, 最后返回的不是原 elems 的项, 而是通过 callback 运算后的结果
         * @param elems => 被遍历的集合
         * @param callback => 为每个集合的项执行的函数
         * @param arg => 额外参数
         * @returns array => 返回一个 cb(elems[i]) 不为 null 的执行结果的集合
         */
        map : function (elems, callback, arg) {
            var value, key, ret = [], i = 0, length = elems.length,
                // 这里写的有点丑... 太多的限制条件了...
                isArray = elems instanceof jQuery || length !== undefined && typeof length === 'number' && ((length > 0 && elems[0] && elems[length - 1]) || length === 0 || jQuery.isArray(elems));

            // 是 array 的话
            if (isArray) {
                for (; i < length; i ++) {
                    value = callback(elems[i], i, arg);
                    if (value != null) {
                        // 这个意思就是... 只有运算结果不为 null 的东西才会被返回
                        ret[ret.length] = value;
                    }
                }
            } else {
                for (key in elems) {
                    value = callback(elems[key], key, arg);
                    if (value != null) {
                        // 也是只有运算结果不为 null 的才会被返回
                        ret[ret.length] = value;
                    }
                }
            }
            // 最后把 ret concat 上一个数组
            return ret.concat.apply([], ret);
        },

        // A global GUID counter for objects
        guid : 1,


        // Bind a function to a context, optionally partially applying any
        // arguments.
        // todo : 这个方法不太懂, 等到有涉及到的时候联合参数和场景看
        proxy : function (fn, context) {
            if (typeof context === 'string') {
                var tmp = fn[context];
                context = fn;
                fn = tmp;
            }
        },

        // Mutifunctional method to get and set values to a collection
        // The value/s can optionally be executed if it's a function
        // todo 这个方法用到的时候整理
        access : function (elems, fn, key, value, chainable, emptyGet, pass) {},

        // 获取当前时间的时间戳
        now : function () {
            return (new Date()).getTime();
        },

        // Use of jQuery.browser is frowned upon.
        // More details: http://docs.jquery.com/Utilities/jQuery.browser
        // 确定 useragent 的信息
        uaMatch : function (ua) {
            ua = ua.toLowerCase();

            var match = rwebkit.exec(ua) || ropera.exec(ua) || rmsie.exec(ua) || ua.indexOf('compatible') < 0 && rmozilla.exec(ua) || [];

            return {
                browser : match[1] || '',
                version : match[2] || '0'
            }
        },

        // todo 用到的时候整理
        sub : function () {},

        browser : {}
    });


    // 这里就是对 class2type 的扩展了
    jQuery.each('Boolean Number String Function Array Date RegExp Object'.split(' '), function (i, name) {
        class2type['[object '+ name +']'] = name.toLowerCase();
    });


    // 这里会处理一些浏览器相关的问题
    browserMatch = jQuery.uaMatch(userAgent);

    if (browserMatch.browser) {
        jQuery.browser[browserMatch.browser] = true;
        jQuery.browser.version = browserMatch.version;
    }


    // Deprecated, use jQuery.browser.webkit instead
    if (jQuery.browser.webkit) {
        jQuery.browser.safari = true;
    }

    // 对 trim 那些的处理
    if (rnotwhite.test('\xA0')) {
        trimLeft = /^[\s\xA0]+/;
        trimRight = /[\s\xA0]+$/;
    }

    rootjQuery = jQuery(document);

    if (document.addEventListener) {
        DOMContentLoaded = function () {
            document.remoteEventListener('DOMContentLoaded', DOMContentLoaded, false);
            jQuery.ready();
        }
    } else if (document.attachEvent) {
        DOMContentLoaded = function() {
            // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
            if ( document.readyState === "complete" ) {
                document.detachEvent( "onreadystatechange", DOMContentLoaded );
                jQuery.ready();
            }
        };
    }


    // The DOM ready check for Internet Explorer
    function doScrollCheck() {
        if ( jQuery.isReady ) {
            return;
        }

        try {
            // If IE is used, use the trick by Diego Perini
            // http://javascript.nwbox.com/IEContentLoaded/
            document.documentElement.doScroll("left");
        } catch(e) {
            setTimeout( doScrollCheck, 1 );
            return;
        }

        // and execute any waiting functions
        jQuery.ready();
    }

    return jQuery;


})();


























