import RouterLink from './components/router-link';
import RouterView from './components/router-view';

let Vue
const install = function(_Vue){
    Vue = _Vue;
    Vue.component('router-link',RouterLink);
    Vue.component('router-view',RouterView);
    //Vue.mixin 混入 Vue中的高阶组建，给每个组件添加功能
    Vue.mixin({
        beforeCreate(){
            // console.log("name",this.options.name);
            if(this.options.router){
                this._routerRoot = this;    //根实例
                this._router = this.options.router
                this._router.init(this)
                Vue.util.defineReactive(this,"_route",this._router.history.current);
            }else{
                //儿子 孙子
                this._routerRoot = this.$parent && this.$parent._routerRoot
            }
        }
    })
    Object.defineProperty(Vue.prototype,'$route',{
        get(){
            return this._routerRoot && this._routerRoot._route;
        }
    })
    Object.defineProperty(Vue.prototype,'$router',{
        get(){
            return this._routerRoot && this._routerRoot._router;
        }
    })
}


export default install;