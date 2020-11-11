const func = x => {
    return new Promise(resolve=>{
        setTimeout(_=>{
            resolve(++x)
        },1000)
    })
}

function _async(generator,...parmas){
    const iterator = generator(...parmas);
    const next = x => {
        let { value,done } = iterator.next(x);
        if(done) return ;
        value.then(x=>{
            next(x);
        })
    };
    next();
}

_async(function* (x){
    x = yield func(x)
    console.log(x)  // 1
    
    x = yield func(x)
    console.log(x)  // 2
    
    x = yield func(x)
    console.log(x)  // 3
},0)