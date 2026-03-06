import {state} from "./state.js"

export function addCart(){

const p = state.currentProduct

let modifiers=[]
let extra=0

document.querySelectorAll("#modal input:checked")
.forEach(i=>{

let price = parseInt(i.dataset.price)||0

modifiers.push({
name:i.value,
price:price
})

extra+=price

})

state.cart.push({

name:p.name,
price:p.price,
modifiers:modifiers,
qty:1

})

document.getElementById("modal").classList.remove("show")

console.log("cart",state.cart)

}
