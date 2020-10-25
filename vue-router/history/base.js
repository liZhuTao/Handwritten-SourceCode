export const createRoute = (record,location)=>{ //根据匹配的记录来计算匹配到的所有的记录
    let matched = [];
    if(record){
        while(record){
            matched.unshift(record);
            record = record.parent;
        }
    }
    return {
        ...location,
        matched
    }

}

export default class History{
    constructor(router){
        this.router = router;
        this.current = createRoute(null,{   //null表示没有匹配到
            path:'/'
        });     //matched 的值是一个[]
    }
    transitionTo(localtion,complete){
        //获取当前路径匹配出对应的记录，当路径变化的时候，获取到对应的记录=>渲染页面
        let current = this.router.match(localtion);
        //防止重复点击，不需要再次渲染
        //匹配到的路劲和个数都相同就不需要再次跳转了
        if(this.current.path === location && this.current.matched.length === current.matched.length){
            return 
        }
        this.current = current; //用最新匹配的结果，去更新视图
        //_route更新
        this.cb && this.cb(current);
        //当路径变化后，监视hash再次进行匹配操作
        complete && complete()
    }
    listen(cb){
        this.cb = cb
    }
}