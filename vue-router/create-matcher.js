import createRouteMap from './create-route-map'
import {createRoute} from './history/base'

export default function creatMatcher(routes){
    //获取所有的路径  route => pathlist pathMap
    let {pathlist,pathMap} = createRouteMap(routes)
    //根据用户输入的路径获取匹配记录
    const match = function match(location){ 
        let record = pathMap[location]; //获取对应的记录
        return createRoute(record,{path:location})
    }
    //动态添加路由
    const addRoutes = function addRoutes(routes){
        createRouteMap(routes,pathlist,pathMap)
    }

    return {
        match,
        addRoutes
    }
}