class sub{
    pond = {}
    // 添加
    add(event,func){
        let pond = this.pond;
        !pond[event] ?  pond[event] = [] : null ;
        !pond[event].includes(func) ? pond[event].push(func) : null;
    }
    // 删除
    off(event,func){
        let pond = this.pond;
        if(!pond[event])  return ;
        let arr = pond[event]
        for(let i = 0; i < arr.length; i++){
            if(arr[i] === func){
                arr[i] = null
            }
        }
    }
    // 执行
    fire(event,...params){
        let pond = this.pond;
        if(!pond[event]) return ;
        let arr = pond[event];
        for(let i = 0 ; i < arr.length ; i++){
            if(typeof arr[i] !== 'function'){
                arr.splice(i,1);
                i--;
                continue;
            }
            arr[i](...params)
        }
    }
}

