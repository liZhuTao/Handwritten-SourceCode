function myPromise(executor){
    if(typeof executor !== 'function') throw new TypeError('executor must be a function')
    
    this.PromiseState = 'pending'
    this.PromiseValue = undefined
    this.resolveFunc = function(){}
    this.rejectFunc = function(){}

    let _this = this;
    const change = function change(val,state){
        if(_this.PromiseState !== 'pending') return ;

        _this.PromiseState = state
        setTimeout(()=>{
            _this.PromiseValue = val
            state === 'resolve' ? 
                _this.resolveFunc(_this.PromiseValue) : 
                _this.rejectFunc(_this.PromiseValue) ;
        },0)
    }
    const resolve = function resolve(result){
        change(result,'resolved')
    }
    const reject = function reject(reason){
        change(reason,'rejected')
    }

    try {
        executor(resolve,reject)
    } catch (error) {
        reject(error)
    }
    
}

myPromise.prototype = {
    constructor:myPromise,
    then:function(resolveFunc,rejectFunc){
        if(typeof resolveFunc !== 'function'){
            resolveFunc = function resolveFunc(result){
                myPromise.resolve(result)
            }
        }
        if(typeof rejectFunc !== 'function'){
            rejectFunc = function rejectFunc(reason){
                myPromise.reject(reason)
            }
        }
        let _this = this
        return new myPromise((resolve,reject)=>{
            _this.resolveFunc = (result) => {
                try {
                    let x = resolveFunc(result)
                    resolve(x)
                } catch (error) {
                    reject(error)
                }
            }
            _this.rejectFunc = (reason) => {
                try {
                    let x = resolveFunc(reason)
                    resolve(x)
                } catch (error) {
                    reject(error)
                }
                
            }
        })
    },
    catch:function(rejectFunc){
        return this.then(null,rejectFunc)
    }
}



myPromise.resolve = function resolve(result){
    return new myPromise(resolve=>{
        resolve(result)
    })
}
myPromise.reject = function reject(){
    return new myPromise((_,reject)=>{
        reject(result)
    })
}
myPromise.all = function all(arr){
    let _this = this
    return new myPromise((resolve,reject)=>{
        let index = 0
        let result = []

        const fire = function fire(){
            if(index >= arr.length){
                resolve(result)
            }
        }
        for(let i in arr){
            let item = arr[i]
            if(!(item instanceof myPromise)){
                index++;
                result[i] = item;
                fire();
                return ;
            }
            item.then(res=>{
                index++;
                result[i] = res;
                fire();
            }).catch(err=>{
                reject(err)
            })
        }
    })
}


let a = new myPromise((resolve,reject)=>{
    resolve(10)
    // reject(11)
}).then(res=>{
    return res+10
}).then(res=>{
    return res+10
})
let b = new myPromise((resolve,reject)=>{
    // resolve(10)
    reject(11)
})

let c = myPromise.resolve(12)
let d = myPromise.resolve(13)

let e = myPromise.all([a,b,c,d])
console.log(a)
console.log(b)
console.log(c)
console.log(d)
console.log(e)


