import { openOrderScreen } from "./order.js"

export function updateStickyCart(cart){

 const bar = document.getElementById("sticky-cart")
 const count = document.getElementById("sticky-cart-count")
 const price = document.getElementById("sticky-cart-price")

 if(!cart || cart.length === 0){
  bar.classList.add("hidden")
  return
 }

 bar.classList.remove("hidden")

 let totalItems = 0
 let totalPrice = 0

 cart.forEach(item => {

  totalItems += item.qty || 1
  totalPrice += item.totalPrice || item.price

 })

 count.textContent = totalItems
 price.textContent = totalPrice

}

const confirmBtn = document.getElementById("confirm-order-btn")

if(confirmBtn){

 confirmBtn.onclick = ()=>{
  openOrderScreen()
 }

}
