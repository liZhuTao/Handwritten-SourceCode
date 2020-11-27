import $ from 'jquery';
import createReactUnit from './unit.js'
import createElement from './element.js'

let React = {
    render,
    nextRootIndex:0,
    createElement
}

// 给每个元素添加一个属性，为了方便获取到这个元素
function render(element,container){
    // 编写一个工厂函数，用来创建对应的react元素
    // 通过这个工厂函数来创建
    // console.log(element)
    let createReactUnitInstance = createReactUnit(element);
    let markUp = createReactUnitInstance.getMarkUp(React.nextRootIndex);
    $(container).html(markUp);
}

export default React