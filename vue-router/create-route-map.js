function addRouteRecord(route,pathList,pathMap,parentRecord){
    let path = parentRecord ? `${parentRecord}/${route.path}` : route.path;
    let record = {  //当前路由产生的记录 path component
        path,
        component:route.component,
        parent:parentRecord
    }
    if(!pathMap[path]){ //防止用户编写路由时有重复，不去覆盖
        pathList.push(path);
        pathMap[path] = record;
    }
    if(route.children){ //子路由页要放在对应的pathList,pathMap中
        route.children.forEach(r=>{
            addRouteRecord(r,pathList,pathMap,record)
        })
    }
    
}

function createRouteMap(routes,oldPathList,oldPathMap){
    let pathList = oldPathList || [];
    let pathMap = oldPathMap || {};

    routes.forEach(route=>{
        addRouteRecord(route,pathList,pathMap)
    });
    
    return {
        pathList,
        pathMap
    }
}

export default createRouteMap;