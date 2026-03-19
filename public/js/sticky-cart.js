import { openOrderScreen } from "./order.js"

export function updateStickyCart(cart){

 const bar = document.getElementById("sticky-cart")
 const count = document.getElementById("sticky-cart-count")
 const price = document.getElementById("sticky-cart-price")
 const headerCount = document.getElementById("headerCartCount")

 if(!bar || !count || !price) return

 if(!cart || cart.length === 0){

  bar.classList.add("hidden")
  bar.style.display = "" // ✅ กัน display ค้าง

  if(headerCount) headerCount.textContent = 0

  return
 }

 bar.classList.remove("hidden")
 bar.style.display = "flex" // ✅ ให้แน่ใจว่าแสดงถูก

 let totalItems = 0
 let totalPrice = 0

 cart.forEach(item=>{

  totalItems += item.qty || 1
  totalPrice += item.price

 })

 count.textContent = totalItems
 price.textContent = totalPrice

 if(headerCount) headerCount.textContent = totalItems

}


/* ปุ่มยืนยันออเดอร์ */

document.addEventListener("DOMContentLoaded",()=>{

 const confirmBtn = document.getElementById("confirm-order-btn")

 if(confirmBtn){

  confirmBtn.onclick = ()=>{
   openOrderScreen()
  }

 }

 const cartIcon = document.querySelector(".cart-icon")

 if(cartIcon){

  cartIcon.onclick = ()=>{

   const count = document.getElementById("headerCartCount")

   if(!count || Number(count.textContent) === 0){
    window.showIOSAlert("ไม่มีสินค้าในตะกร้า")
    return
   }

   openOrderScreen()
  }

 }

})
