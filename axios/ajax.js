// 工具类方法库
(function () {
    let class2type = {},
        toString = class2type.toString,
        hasOwn = class2type.hasOwnProperty,
        getProto = Object.getPrototypeOf,
        fnToString = hasOwn.toString,
        ObjectFunctionString = fnToString.call(Object),
        utils = {};

    // 数据类型检测
    ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error", "Symbol", "BigInt"].forEach(
        name => {
            class2type[`[object ${name}]`] = name.toLowerCase();
        }
    );
    const toType = function toType(obj) {
        if (obj == null) return obj + "";
        return typeof obj === "object" || typeof obj === "function" ?
            class2type[toString.call(obj)] || "object" :
            typeof obj;
    };

    // 检测是否为函数
    const isFunction = function isFunction(obj) {
        return typeof obj === "function" && typeof obj.nodeType !== "number";
    };

    // 检测是否为window
    const isWindow = function isWindow(obj) {
        return obj != null && obj === obj.window;
    };

    // 检测是否为数组 & 类数组
    const isArrayLike = function isArrayLike(obj) {
        let length = !!obj && "length" in obj && obj.length,
            type = toType(obj);
        if (isFunction(obj) || isWindow(obj)) return false;
        return type === "array" || length === 0 ||
            typeof length === "number" && length > 0 && (length - 1) in obj;
    };

    // 检测是否为普通对象
    const isPlainObject = function isPlainObject(obj) {
        let proto, Ctor;
        if (!obj || toString.call(obj) !== "[object Object]") return false;
        proto = getProto(obj);
        if (!proto) return true;
        Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
        return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
    };

    // 检查是否为空对象
    const isEmptyObject = function isEmptyObject(obj) {
        var keys = [
            ...Object.keys(obj),
            ...Object.getOwnPropertySymbols(obj)
        ];
        return keys.length === 0 ? true : false;
    }

    // 遍历数组/类数组/对象
    const each = function each(obj, callback) {
        callback = callback || Function.prototype;
        if (isArrayLike(obj)) {
            for (let i = 0; i < obj.length; i++) {
                let item = obj[i],
                    result = callback.call(item, item, i);
                if (result === false) break;
            }
            return obj;
        }
        for (let key in obj) {
            if (!hasOwn.call(obj, key)) break;
            let item = obj[key],
                result = callback.call(item, item, key);
            if (result === false) break;
        }
        return obj;
    };

    // 支持Symbol属性的遍历
    const eachAll = function eachAll(obj, callback) {
        let keys = [
            ...Object.keys(obj),
            ...Object.getOwnPropertySymbols(obj)
        ];
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i],
                item = obj[key],
                result = callback.call(item, item, key);
            if (result === false) break;
        }
        return obj;
    };

    // 浅克隆 & 深克隆
    const shallowClone = function shallowClone(obj) {
        let type = toType(obj),
            Ctor = obj.constructor;
        if (/^(symbol|bigint)$/i.test(type)) return Object(obj);
        if (/^(regexp|date)$/i.test(type)) return new Ctor(obj);
        if (/^error$/i.test(type)) return new Ctor(obj.message);
        /* if (/^function$/i.test(type)) {      //函数克隆暂时不处理
            return function () {
                return obj.call(this, ...arguments);
            };
        } */
        if (/^(object|array)$/i.test(type)) {
            let result = new Ctor();
            eachAll(obj, (_, key) => {
                result[key] = obj[key];
            });
            return result;
        }
        return obj;
    };
    const deepClone = function deepClone(obj, cache = new Set()) {
        let type = toType(obj),
            Ctor = obj.constructor;
        if (!/^(object|array)$/i.test(type)) return shallowClone(obj);
        if (cache.has(obj)) return obj;
        cache.add(obj);
        let result = new Ctor();
        eachAll(obj, (item, key) => {
            result[key] = deepClone(item, cache);
        });
        return result;
    };

    // 深度合并
    /* 
     * 几种情况的分析
     *   A->options中的key值  B->params中的key值
     *   1.A&B都是原始值类型:B替换A即可
     *   2.A是对象&B是原始值:抛出异常信息
     *   3.A是原始值&B是对象:B替换A即可
     *   4.A&B都是对象:依次遍历B中的每一项,替换A中的内容
     */
    const merge = function merge(options, params = {}) {
        if (!isPlainObject(options) || !isPlainObject(params)) throw new TypeError(`options and params must be an plain object!`);
        options != null ? options = deepClone(options) : null;
        params != null ? params = deepClone(params) : null;
        eachAll(params, (_, key) => {
            let isA = isPlainObject(options[key]),
                isB = isPlainObject(params[key]);
            if (isA && !isB) throw new TypeError(`${key} in params must be an plain object`);
            if (isA && isB) {
                options[key] = merge(options[key], params[key]);
                return;
            }
            options[key] = params[key];
        });
        return options;
    };

    // 暴露API：支持浏览器导入和CommonJS/ES6Module规范
    utils = {
        toType,
        isFunction,
        isWindow,
        isArrayLike,
        isPlainObject,
        isEmptyObject,
        each,
        eachAll,
        shallowClone,
        deepClone,
        merge
    };
    if (typeof window !== "undefined") {
        window._ = window.utils = utils;
    }
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = utils;
    }
})();


(function () {

    /* 发送请求核心内容 */
    function Ajax(config) {
        this.config = config;
        this.GETREG = /^(get|head|options|delete)$/i;
        return this.send();
    }
    Ajax.prototype = {
        version: '1.0.0',
        constructor: Ajax,
        send() {
            let {
                method,
                validateStatus,
                timeout,
                withCredentials
            } = this.config;

            return new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest;
                xhr.open(method, this.initURL());
                // 常规配置
                xhr.timeout = timeout;
                xhr.withCredentials = withCredentials;
                this.initHeaders(xhr);
                xhr.onreadystatechange = () => {
                    // 服务器有响应
                    let {
                        readyState,
                        status
                    } = xhr;
                    if(!validateStatus(status)){
                        //状态码不符合要求：失败
                        reject(this.initResult(false,xhr));
                        return;
                    }
                    if(readyState === 4){
                        // 成功
                        resolve(this.initResult(true,xhr));
                    }
                };
                xhr.onerror = error => {
                    // 服务器无响应:返回的结果是没有response对象的
                    reject({
                        message:error.message
                    });
                }
                xhr.send();
            })
        },
        // 处理请求头
        initHeaders(xhr){
            let {
                headers,
                method
            } = this.config;
            let alone = headers[method] || {},
                common = headers['common'] || {};
            delete headers['common'];
            _.each(['get','head','options','delete','post','put'],(index,item)=>{
                delete headers[item];
            });
            common = _.merge(common,alone);
            headers = _.merge(headers,common);
            _.each(headers,(key,value)=>{
                xhr.setRequestHeader(key,value);
            })

            xhr.setRequestHeader('xxx','xxx')
        },
        //处理URL
        stringify(params) {
            let str = ``;
            _.each(params, (key, value) => {
                str += `&${key}=${value}`;
            })
            return str.substring(1);
        },
        initURL() {
            let {
                baseURL,
                url,
                method,
                params,
                cache
            } = this.config;
            url = baseURL + url;
            // get 请求下处理问号传参 && 缓存
            if (this.GETREG.test(method)) {
                params = this.stringify(params);
                if (params) {
                    url += `${url.includes('?')?'&':'?'}${params}`;
                }
                if (!cache) {
                    url += `${url.includes('?')?'&':'?'}${Math.random()}`;
                }
            }
            return url;
        },
        //处理data
        initData() {
            let {
                method,
                data,
                transformRequst
            } = this.config;
            if (this.GETREG.test(method)) return null;
            return transformRequst(data)
        },
        //处理返回结果
        getHeaders(xhr){
            let headerText = xhr.getAllResponseHeaders(),
                obj = {};
            headerText = headerText.split(/(?:\n)/g);
            _.each(headerText,(index,item)=>{
                let [key,value] = item.split(': ');
                if(!key) return ;
                headers[key] = value;
            })

            return obj;
        },
        initResult(flag,xhr){
            let response = {
                data:{},
                request:xhr,
                status:xhr.status,
                statusText:xhr.statusText,
                headers:this.getHeaders(xhr),
                config:this.config
            };
            if(flag){
                let res = xhr.responseText;
                switch(this.config.responseType.toLowerCase()){
                    case 'json':
                        text = JSON.parse(text);
                        break;
                    case 'stream':
                        text = xhr.response;
                        break;
                    case 'document':
                        text = xhr.responseXML;
                        break;
                }
                response.data = text;
                return response;
            }
            return {
                massage:xhr.statusText,
                response
            }
        }
    }


    /* 参数处理 */
    // 处理headers默认值
    let headers = {
        common: {
            'Conyent-Type': 'application/json'
        }
    }
    _.each(['get', 'header', 'delete', 'options', 'post', 'put'], (index, item) => {
        headers[item] = {}
    })
    //插件默认配置项规则
    let configDefault = {
        baseURL: {
            type: 'string',
            defaults: ''
        },
        url: {
            type: 'string',
            required: true
        },
        method: {
            type: 'string',
            default: 'get'
        },
        headers: {
            type: 'object',
            default: headers
        },
        params: {
            type: 'object',
            default: {}
        },
        cache: {
            type: 'boolean',
            default: true
        },
        data: {
            type: 'object',
            default: {}
        },
        without: {
            type: 'number',
            default: 0
        },
        withCredentials: {
            type: 'boolean',
            default: false
        },
        responseType: {
            type: 'string',
            default: 'json'
        },
        transformRequst: {
            type: 'function',
            default: function (data) {
                if (_.isEmptyObject(data)) return null;
                // 默认会把传递的对象变为JSON字符串，传递给服务器
                return JSON.stringify(data)
            }
        },
        validateStatus: {
            type: 'function',
            default: function (status) {
                return status >= 200 && status < 300;
            }
        }
    }

    // 支持default二次配置更改
    /* let defaults = {
        baseURL:'',
        headers:headers,
        timeout:0,
        withCredentials:false,
        responseType:'json',
        transformRequst:function(data){
            if(_.isEmptyObject(data)) return null;
            // 默认会把传递的对象变为JSON字符串，传递给服务器
            return JSON.stringify(data)
        },
        validateStatus:function(status){
            return status >= 200 && status < 300;
        }
    }; */

    /* 配置项初始化 */
    function initParams(config) {
        // 先将自定义的配置项和 ajax.defaults 二次配置项进行合并
        config = _.merge(ajax.defaults, config);

        // 将合并后的结果再次和插件默认配置进行合并（同时校验规则）
        let params = {};
        _.each(configDefault, (key, rule) => {
            let {
                type,
                required,
                default: defaultValue
            } = rule;
            // 传递中的配置项中没有这一项：验证是否必传 && 走默认值
            if (!config.hasOwnProperty(key)) {
                if (required) throw new ReferenceError(`${key} is must be required!`);
                params[key] = defaultValue;
                return;
            }
            // 传递的配置项中有这一项：验证传递至的格式 && 合并
            if (_.toType(config[key]) !== type) throw new TypeError(`${key} is must be an ${type}`);
            params[key] = _.merge(defaultValue, config[key]);
        })

        return params;
    }


    /* 暴露到外部的API */
    function ajax(url, config) {
        // 参数处理
        if (_.isPlainObject(url)) config = url;
        if (_.toType(url) === 'string') {
            if (!_.isPlainObject(config)) config = {};
            config.url = url;
        }
        config = initParams(config);
        return new Ajax(config);
    }
    /* 快捷方法 */
    _.each(['get', 'head', 'delete', 'options'], (index, item) => {
        ajax[item] = function (url, config) {
            if (!_.isPlainObject(config)) config = {}; //config需要传入一个对象
            config.url = url;
            config.method = item;
            return ajax();
        }
    });
    _.each(['post', 'put'], (index, item) => {
        ajax[item] = function (url, data, config) {
            if (!_.isPlainObject(config)) config = {}; //config需要传入一个对象
            config.url = url;
            config.method = item;
            config.data = data;
            return ajax();
        }
    });
    ajax['all'] = function all(promiseList) {
        if (!_.isArrayLike(promiseList)) throw new TypeError('The params of ajax.all() must be an array or ArrayLike!');
        return Promise.all(promiseList);
    };
    ajax.stringify = Ajax.prototype.stringify;

    // 基于代理监听 当我们修改ajax.defaults中的数据，会将defaults中的值改掉
    /* ajax.defaults = new Proxy(defaults,{
        set(obj,attr,value){
            if(!obj.hasOwnProperty(attr)) return ;
            obj[attr] = value;
        }
    }); */

    // 源码中没有采用代理的方式实现，而是采用了以下方式，来实现二次配置项的更改
    ajax.defaults = {
        headers: headers //只留 headers 是由于我们不单单只是操作headers本身，还会操作它的属性
    };







    if (typeof window !== 'undefined') {
        window.ajax = ajax;
    }
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = ajax;
    }
})()