import install from './install';
import creatMatcher from './create-matcher';
import HashHistory from './history/hashHistory'
import BrowserHistory from './history/browserHistory'

class VueRouter{
    constructor(options){
        //需要根据用户配置，制作映射表(创建一个匹配器)
        //1.匹配功能 match  
        //2. 动态添加路由的功能 addRoutes
        this.matcher = creatMatcher(options,routes||[])
        // 创建历史管理
        this.mode = options.mode || "hash";
        switch(this.mode){
            case "hash":
                this.history = new HashHistory(this);
                break;
            case "history":
                this.history = new BrowserHistory(this);
                break;
        }
    }
    init(app){  //this VueRouter实例上的方法
        //需要根据当前路径，实现页面跳转的逻辑
        //页面跳转的时候，会进行匹配的操作  根据路劲获取对应的记录
        let setupHashListener = ()=>{
            history.setupListener()     //hashChange
        }

        const history = this.history;
        //路径跳转和匹配的功能
        history.transitionTo(history.getCurrentLocation(),setupHashListener)
        //根据current的值监听route
        history.listen((route)=>{
            app._route = route; //更新视图的操作，当current变化后再次更新_route属性
        })
    }
    match(location){
        return this.matcher.match(location);
    }
    // transitionTo  跳转路劲的逻辑   hash和browser都有
    // getCurrentLocation  获取当前路径  hash和browser实现方式不一样
    // setupHashListener  监听hash
    push(location){
        window.location.hash = location
    }
}

VueRouter.install = install;

export default VueRouter;