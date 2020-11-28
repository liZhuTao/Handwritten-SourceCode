import $ from 'jquery'

class Unit {    // 通过父类保存参数
    constructor(element){
        this.currentElement = element
    }
}
// 负责渲染文本节点
class ReactTextUnit extends Unit{
    getMarkUp(rootId){   //保存当前元素的Id
        this._rootId = rootId
        // 返回当前元素的html脚本
        return `<span data-reactid="${rootId}">${this.currentElement}</span>`
    }
}
// 负责渲染原生节点
class ReactNativeUnit extends Unit{
    getMarkUp(rootId){
        this._rootId = rootId;
        // 结构出需要渲染的内容
        let {type,props} = this.currentElement;
        let tagStart = `<${type} data-reactid="${rootId}"`;
        let tagEnd = `</${type}>`;
        let contentStr = '';
        for(let propName in props){
            if(/on[A-Z]/.test(propName)){
                let eventType = propName.slice(2).toLowerCase();    //获取事件
                // react中的事件都是通过事件委托的方式来实现绑定的
                $(document).on(eventType,`[data-reactid="${rootId}"]`,props[propName]);
            }else if(propName === 'children'){    // ['<span>hello</span>','<button></button>']
                console.log(props[propName])
                contentStr = props[propName].map((child,idx)=>{  
                    // 递归循环子节点
                    let childInstance = createReactUnit(child)
                    // 返回的是多个元素的字符串的数组
                    return childInstance.getMarkUp(`${rootId}.${idx}`)
                }).join('');
            }else{
                tagStart += (` ${propName}=${props[propName]}`)
            }
        }
        // 返回拼接后的字符串
        return tagStart + '>' + contentStr + tagEnd
    }
}
// 负责渲染React组件
class ReactCompositUnit extends Unit{
    getMarkUp(rootId){
        this._rootId = rootId;
        let {type:Component,props} = this.currentElement;
        let componentInstance = new Component(props);
        // componentWillMount钩子函数执行
        componentInstance.componentWillMount && componentInstance.componentWillMount()
        // 调用render后返回的结果
        let reactComponentRenderer = componentInstance.render();
        // 递归渲染组件render后的返回结果
        let ReactCompositUnitInstance = createReactUnit(reactComponentRenderer);
        // 先序深度优先，有儿子就进去，树的遍历
        let markUp = ReactCompositUnitInstance.getMarkUp(rootId);
        // 在递归后绑定事件，儿子先绑定成功，再绑定父亲
        $(document).on('mounted',()=>{
            // 在递归的阶段挂载 componentDidMount生命周期钩子函数
            componentInstance.componentDidMount && componentInstance.componentDidMount()
        })
        return markUp
    }
}

function createReactUnit(element){
    // console.log(element);
    if(typeof element === 'string' || typeof element === 'number'){
        return new ReactTextUnit(element)
    }
    if(typeof element === 'object' && typeof element.type === 'string'){
        return new ReactNativeUnit(element);
    }
    if(typeof element === 'object' && typeof element.type === 'function'){
        return new ReactCompositUnit(element);
    }
}

export default createReactUnit;