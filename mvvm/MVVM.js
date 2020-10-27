

//观察者（发布订阅） 观察者  被观察者
//订阅
class Dep{
    constructor(){
        this.subs = []; //存放所有的watcher
    }
    //订阅
    addSub(watcher){   //添加watcher
        this.subs.push(watcher);
    }
    //发布
    notify(){
        this.subs.forEach(watcher=>watcher.updata());
    }
}

class Watcher{
    constructor(vm,expr,cb){
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        //默认先存放一个老值
        this.oldValue = this.get();
    }
    get(){
        Dep.target = this;  //先把自己放在this上
        //取值 把观察者和数据关联起来
        let value = CompileUtil.getVal(this.vm,this.expr);
        Dep.target = null;  //不取消 任何值取值 都会添加watcher
        return value;
    }
    updata(){   //更新操作  数据变化之后 会调用观察者的updata方法
        let newVal = CompileUtil.getVal(this.vm,this.expr);
        if(newVal !== this.oldValue){
            this.cb(newVal);
        }
    }
}


//实现数据劫持的功能
class Observer{
    constructor(data){
        this.observer(data);
    }
    observer(data){
        if(data && typeof data == 'object'){
            //如果是对象
            for(let key in data){
                this.defineReactive(data,key,data[key]);
            }
        }
    }
    defineReactive(obj,key,value){
        this.observer(value);  
        let dep =new Dep(); //给每个属性 都加上一个具有发布订阅的功能
        Object.defineProperty(obj,key,{
            get(){
                //创建watcher时 会取到对应的内容，并且把watcher放到全局了
                Dep.target && dep.addSub(Dep.target)
                return value;
            },
            set:(newVal)=>{
                if(value != newVal){
                    this.observer(newVal)
                    value = newVal;
                    dep.notify();
                }
            }
        })
    }
}



//编译类
class Compiler{
    constructor(el,vm){
        //判断el属性是不是元素，不是元素则获取
        this.el = this.isElementNode(el) ? el :document.querySelector(el);
        this.vm = vm;
        //把当前元素中的节点的元素获取到，并放到内存中
        let fragment = this.node2fragment(this.el);
        console.dir(fragment)

        //把节点中的内容替换
        //用数据编译模板
        this.compile(fragment)
        //把内容塞回到页面去
        this.el.appendChild(fragment);
    }
    //判断是不是指令
    isDirective(attrName){
        return attrName.startsWith('v-')
    }
    // 编译元素节点的方法
    compileElement(node){
        let attributes = node.attributes;
        [...attributes].forEach(attr=>{ // type = "text" v-model = "shcool.name"
            let {name,value:expr} = attr;
            //判断是不是指令
            if(this.isDirective(name)){     //v-model  v-html  v-bind
                let [,directive] = name.split("-");     //v-on:click="xxx"
                let [directiveName,eventName] = directive.split(":")
                //需要调用不同的指令来处理
                CompileUtil[directiveName](node,expr,this.vm,eventName);
            }
        })
    }
    //编译文本节点的方法
    compileText(node){  //判断当前文本节点的额内容是否包含小胡子语法{{xxx}}
        let content = node.textContent;
        if(/\{\{(.+?)\}\}/.test(content)){  //找到所有符合条件元素
            //文本节点
            CompileUtil['text'](node,content,this.vm);  //{{a}} {{b}} {{c}}
        }
    }
    //核心的编译方法 编译内存中的DOM节点
    compile(node){
        let childNodes = node.childNodes;
        // console.log(childNodes);
        [...childNodes].forEach(child=>{
            if(this.isElementNode(child)){
                this.compileElement(child);
                //如果是元素的话，需要把自己传进去，去遍历子元素
                this.compile(child);
            }else{
                this.compileText(child);
            }
        });
    }
    //将节点放到文档碎片
    node2fragment(node){   
        let fragment = document.createDocumentFragment();
        let firstChild;
        while(firstChild = node.firstChild){
            // appendChild具有移动性
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
    //是不是元素节点
    isElementNode(node){    
        return node.nodeType === 1;
    }
}

CompileUtil = {
    //根据表达式取到对应的数据
    getVal(vm,expr){
        return expr.split(".").reduce((data,current)=>{
            return data[current]
        },vm.$data)
    },
    getContentVal(vm,expr){
        //遍历的表达式 将内容 重新替换成一个人完整的内容 返回去
        return expr.replace(/\{\{(.+?)\}\}/g,(...arg)=>{
            return this.getVal(vm,arg[1])
        })
    },
    setValue(vm,expr,value){
        expr.split(".").reduce((data,current,index,arr)=>{
            if(index == arr.length-1){
                return data[current] = value;
            }
            return data[current]
        },vm.$data)
    },
    //解析v-model指令
    model(node,expr,vm){    //node是节点  expr表达式  vm是实例
        //给输入框赋予valse属性
        let fn = this.updater["modelUpdader"];
        new Watcher(vm,expr,(newVal)=>{ //给输入框加一个观察者，当数据更新后会触发此方法，会拿新值给输入框赋值
            fn(node,newVal);
        });
        node.addEventListener("input",(e)=>{
            let value = e.target.value; //获取用户输入的内容
            this.setValue(vm,expr,value);
        })
        let value = this.getVal(vm,expr);
        fn(node,value);
    },
    html(node,expr,vm){
        let fn = this.updater["htmlUpdader"];
        new Watcher(vm,expr,(newVal)=>{ 
            fn(node,newVal);
        });
        let value = this.getVal(vm,expr);
        fn(node,value);
    },
    on(node,expr,vm,eventName){ //expr -> change
        node.addEventListener(eventName,(e)=>{
            vm[expr].call(vm,e);
        })
    },
    text(node,expr,vm){//expr  => {{a}} {{b}} {{c}}
        let fn = this.updater["textUpdater"];
        let content = expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{
            //给文本中的每个 小胡子 加上观察者
            new Watcher(vm,args[1],()=>{
                fn(node,this.getContentVal(vm,expr));    //返回了一个全的字符串
            })
            return this.getVal(vm,args[1]);
        });
        fn(node,content);
    },
    updater:{
        //把数据插入到节点中
        modelUpdader(node,value){
            node.value = value;
        },
        htmlUpdader(node,value){  //xss工具
            node.innerHTML = value;
        },
        textUpdater(node,value){
            node.textContent = value;
        }
    }

}




//基类 负责调度
class Vue{
    constructor(options){
        //给实例添加属性
        this.$el = options.el;
        this.$data = options.data;
        let computed = options.computed;
        let methods = options.methods;

        //根元素 存在 编译模板
        if(this.$el){
            //把数据 全部转化成 Object.defineProperty 定义
            new Observer(this.$data);
            
            //
            for(let key in computed){   //有依赖关系
                Object.defineProperty(this.$data,key,{
                    get:()=>{
                        return computed[key].call(this);
                    }
                })
            }
            for(let key in methods){   //有依赖关系
                Object.defineProperty(this,key,{
                    get:()=>{
                        return methods[key];
                    }
                })
            }
             //把数据获取操作 vm上的取值操作都代理到vm.$data上
             this.proxyVm(this.$data)

            new Compiler(this.$el,this)
        }
    }
    proxyVm(data){
        for(let key in data){
            Object.defineProperty(this,key,{    //实现了可以通过vm取到$data中的数据
                get(){
                    return data[key]; //进行了转化操作
                },
                set(newValue){
                    data[key] = newValue;
                }
            })
        }
    }
}