/**
 * Created by anning on 17/1/5.
 */

(function (jQuery) {
	// 在 fn 上扩展的才是真正在实例里面可用的, 而在 fn 上扩展的会用到在构造函数上扩展的东西
	// 所以先看这个会比较好, 到时候带着入参去看 $.data() 之类的方法

	// 匹配大写字母
	var rmultiDash = /([A-Z])/g;
	// 匹配左右是大括号的
	var rbrace = /^(?:\{.*\}|\[.*\])$/;

  jQuery.fn.extend({
		data : function (key, value) {
			var attr;
			var data = null;
			var elem = this[0];
			var i = 0, l;
			var parts;
			var part;
			// Gets all values
			if (key === undefined) {
				// 如果 length 为 0, 匹配的情况就是 selector 没有筛选到元素....
				if (this.length) {
					// 这里说明 selector 筛选到了元素
					data = jQuery.data(elem);
					// document, 
					// todo $._data
					if (elem.nodeType === 1 && jQuery._data(elem, 'parsedAttr')) {
						// 这里取到的是他身上挂着的所有属性
						attr = elem.attributes;
						for (l = attr.length; i < l; i ++) {
							// 这里就取到了属性的名字
							name = attr[i].name;

							// 如果 'data-' 这个字段出现在了属性名的第 0 位
							// 这时候说明是 data 属性噻。。
							if (name.indexOf('data-') === 0) {
								// 把 name 再次赋值为第 5 个字符开始的时候的那个字符
								// 也就是说, 'data-again' => 'again'
								name = jQuery.camelCase(name.substring(5));
								dataAttr(elem, name, data[name]);
							}
						}
						jQuery._data(elem, 'parsedAttr', true);
					}
				}
				return data;
			}

			// 如果是 object 的话, 就递归一下
			if (typeof key === 'object') {
				return this.each(function () {
					jQuery.data(this, key);
				});
			}

			// 取出来 keys.split('.') 之后的前两位
			parts = keys.split('.', 2);
			// 对 parts[1] 的包装
			parts[1] = parst[1] ? '.' + parts[1] : '';
			
			part = parts[1] + '!';

			// todo 这里的 access 还需要继续看
			return jQuery.access(this, function (value) {
				if (data = this.triggerHandler()) {}
			});
		}
  });

	jQuery.extend({
		cache : {},

		// id 值
		uuid : 0,

		// 唯一标示
		expando : "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

		noData : {
			"embed" : true,
			"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
			"applet" : true
		},

		hasData : function (elem) {
			elem = elem.nodeType ? jQuery.cache[elem[jQuery.expando]] : elem[jQuery.expando];
		},

		data : function (elem, name, data, pvt) {
			// 如果不能接受 data 的话, 直接 return
			if (!jQuery.acceptData(elem)) {
				return;
			}
			
			var isNode = elem.nodeType;

			var internalKey = jQuery.expando;

			var id = isNode ? elem[internalKey] : elem[internalKey] && internalKey;

			var privateCache, thisCache;

			var cache = isNode ? jQuery.cache : elem;

			var getByName = typeof name === 'string';

			var ret;

			// 没有 id 就代表, elem 里面本身没有存 jq 标示的字段或者 jQuery.expando 就是空的
			// 没有 cache[id] 就代表, 原来没得这个东西
			// 先不看这一堆需要 return 的
			if ((!id || !cache[id])) {}

			// 没 id 的话
			if (!id) {
				if (isNode) {
					// 以 jquery 对象存储的, 就使用 jQuery.uuid 来进行标示
					elem[internalKey] = id = ++ jQuery.uuid;
				} else {
					// 否则就直接使用 expando 来标示
					id = internalKey;
				}
			}

			// cache 里面没存这个的话
			if (cache[id]) {
				// 初始化
				cache[id] = {};
				if (!isNode) {
					// 这里可以理解为, 如果说不是 dom 节点, 就给他加个 toJSON 方法, 这个方法什么都不做, 就只是给他挂一个。。
					cache[id].toJSON = jQuery.noop;
				}
			}

			if (typeof name === 'object' || typeof name === 'function') {
				if (pvt) {
					// todo
				} else {
					cache[id].data = jQuery.extend(cache[id].data, name);
				}
			}

			// 这里给他的 data 和 JSON 属性都赋了值
			privateCache = thisCache = cache[id];

			if (!pvt) {
				if (!thisCache.data) {
					thisCache.data = {};
				}
				thisCache = thisCache.data;
			}

			// 如果说有 data 参数的传入的话, 就把 thisCache 的 name 上挂上 data
			if (data !== undefined) {
				thisCache[jQuery.camelCase(name)] = data;
			}

			// 如果 thisCache 里面没有, 而且是入参 name 是 events 的话
			if (isEvents && !thisCache[name]) {
				return privateCache.events;
			}

			// getByName 是一个标示 name 入参是不是一个 string 的 tag
			if (getByName) {
				ret = thisCache[name];
				if (ret == null) {
					ret = thisCache[jQuery.camelCase(name)];
				}
			} else {
				ret = thisCache;
			}

			return ret;
		},
		acceptData : function (elem) {
			// 如果说, 是个 dom 节点, 需要判断一下是不是 nodeData 的三种节点
			if (elem.nodeName) {
				var match = jQuery.noData[elem.nodeName.toLowerCase()];
				if (match) {
					return !(match === true || elem.getAttribute('classid') !== match);
				}
			}
			// 如果说是个 Object, 直接返回 true
			return true;
		},
		_data : function (elem, name, data) {
			return jQuery.data(elem, name, data, true);
		}
	});


	// 调用时候 => dataAttr(elem, name, data[name]);
	// @params : elem => 元素
	// @params : name => data 后面那半截
	// @params : data[name] => 根据 name 取到的 data 里面存的所有
	function dataAttr (elem, key, data) {
		// 如果没传入 data 或者 elem 直接是 document
		if (data === undefined && elem.nodeType === 1) {
			// key 里如果有大写字母的话, 先给大写字母前面加个 -
			// 再把整个 key 字符串转换为 小写字母
			// 最后再前面拼上 data- 这段字符
			var name = 'data-' + key.replace(rmultiDash, '-$1').toLowerCase();
			// 通过这个 'data-xxx' 找到在 elem 上挂着的整个东西。。
			data = elem.getAttribute('name');
			if (typeof data === 'string') {
				try {
					data = data === 'true' ? true : 
						(data === 'false' ? false : 
							(data === 'null' ? null : 
								(jQuery.isNumberic(data) ? +data : 
									(rbrace.test(data) ? jQuery.parse(data) : data))))
				} catch (e) {
					// do nothing
				}

				// 给这个 data 注册一下, 其实我觉得这里就只是存一下 cache
				jQuery.data(elem, key, data);
			} else {
				data = undefined;
			}
		}

		// 最后返回这个data
		return data;
	}
})(jQuery);

