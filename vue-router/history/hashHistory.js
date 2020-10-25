import History from "./base";

const ensureHash = ()=>{
    if(window.location.hash){
        return ;
    }
    window.location.hash = "/";
}

export default class HashHistory extends History{
    constructor(router){
        super(router);
        this.router = router;
        ensureHash()
    }
    //获取当前路径
    getCurrentLocation(){
        return window.location.hash.slice(1);
    }
    setupListener(){
        window.addEventListener('hashchange',()=>{
            //再次执行匹配的操作
            this.transitionTo(this.getCurrentLocation());
        })
    }
}