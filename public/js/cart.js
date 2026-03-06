import {state} from "./state.js"
import {sendOrder} from "./api.js"

export function addCart(){

state.cart.push(state.currentProduct)

let total=0

state.cart.forEach(i=>{
total+=i.price
})

document.getElementById("floatingTotal").innerText=total
document.getElementById("floatingCart").style.display="block"

document.getElementById("modal").classList.remove("show")

}

export function openCart(){

let html=`<div class="modal-content">`

html+="<h3>Cart</h3>"

state.cart.forEach(c=>{
html+=`${c.name}<br>`
})

html+=`<button id="orderBtn">Order</button>`
html+=`</div>`

let modal=document.getElementById("modal")

modal.innerHTML=html
modal.classList.add("show")

document.getElementById("orderBtn").onclick=async()=>{

await sendOrder(state.cart)

alert("Order sent")

}

}
