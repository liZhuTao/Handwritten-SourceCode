let Vue = null;

class Store{
    constructor(options){
        //this.state = options.state 
        //vuex中的数据是响应式的
        let vm = new Vue({
            data:{
                state: options.state
            }
        })
        //实例挂载属性
        this.state = vm.state;

        this.mutations = {};    
        let mutations = options.mutations || {};
        Object.keys(mutations).forEach(key=>{   //遍历mutations给每个函数包装一层闭包，通过call的方式将this改成vuex实例
            this.mutations[key] = (payload)=>{
                mutations[key].call(this,this.state,payload)
            }
        })

        this.actions = {};
        let actions = options.actions || {};
        Object.keys(actions).forEach(key=>{   //actions的实现方式和mutations一样
            this.actions[key] = (payload)=>{
                actions[key].call(this,this,payload)
            }
        })

        this.getters = {};
        let getters = options.getters || {};
        Object.keys(getters).forEach(key=>{
            Object.defineProperty(this.getters,key,{
                get:()=>{
                    return getters[key].call(this,this.state)
                }
            })
        })


    }
    commit(type,payload){
        this.mutations[type](payload)
    }
    dispatch(type,payload){
        this.actions[type](payload)
    }
}

function install(_vue){
    if(_vue && _vue ==Vue){
        return ;
    }
    Vue = _vue;
    Vue.mixin({
        beforeCreate(){
            if(this.$options.store){
                //store已经注入到Vue实例中了
                this.$store = this.$options.store;  //将vuex实例挂在到实例上
            }else if(this.$parent){
                this.$store = this.$parent.$store;  //遍历到子组件的时候，直接去父组件那里拿vuex实例
            }
        }
    })
}

//辅助函数
export function mapState(ary=[]){
    let obj = {};
    ary.forEach(key=>{
        obj[key] = function(){
            return this.$store.state[key]
        }
    })
    return obj;
}

export function mapGetters(ary=[]){
    let obj = {};
    ary.forEach(key=>{
        obj[key] = function(parmas){
            return this.$store.getters(key,parmas)
        }
    })
    return obj;
}

export function mapMutations(ary=[]){
    let obj = {};
    ary.forEach(key=>{
        obj[key] = function(parmas){
            return this.$store.commit(key,parmas)
        }
    })
    return obj;
}

export function mapActions(ary=[]){
    let obj = {};
    ary.forEach(key=>{
        obj[key] = function(parmas){
            return this.$store.dispatch(key,parmas)
        }
    })
    return obj;
}

export default {
    install,
    Store,
    // mapState,
    // mapMutations,
    // mapActions,
    // mapGetters
}