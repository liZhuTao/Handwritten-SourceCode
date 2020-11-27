import React from './react';

function say(){
  alert(1)
}

let element = React.createElement("div", {
  name: "aaa"
}, "hello", React.createElement("button", {onClick:say}, "123"));
// <div name='aaa'>hello<button>123</button></div>  //bable会编译JSX


// jsx语法->虚拟dom
React.render(element,document.getElementById('root'));

