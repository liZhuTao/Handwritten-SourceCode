import React from './react';

function say(){
  alert(1)
}
 
class SubCounter{
  componentWillMount(){
    console.log('child-组件将要挂载')
  }
  componentDidMount(){
    console.log('child-挂载完成')
  }
  render(){
    return '123'
  }
}

class Counter extends React.Component {
  constructor(props){
    super(props);
    this.state = {number:1}
  }
  componentWillMount(){
    console.log('parent-组件将要挂载')
  }
  componentDidMount(){
    console.log('parent-挂载完成')
  }
  render(){
    // return this.state.number
    return React.createElement(SubCounter,{name:1})
  }
}

// let element = React.createElement("div", {
//   name: "aaa"
// }, "hello", React.createElement("button", {onClick:say}, "123"));
// <div name='aaa'>hello<button>123</button></div>  //bable会编译JSX


// jsx语法->虚拟dom
React.render(<Counter></Counter>,document.getElementById('root'));
// React.createElement(Counter,{name:'aa'});

