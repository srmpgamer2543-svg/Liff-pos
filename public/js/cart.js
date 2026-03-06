import {state} from "./state.js"

export function updateFloating(){

let total = 0

state.cart.forEach(c=>{
total += c.price * c.qty
})

let el = document.getElementById("floatingCart")

if(state.cart.length==0){

el.style.display="none"

}else{

el.style.display="block"

}

document.getElementById("floatingTotal").innerText = total

}

export function openCart(){

alert("cart")

}

window.openCart=openCart
