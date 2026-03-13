import { CART } from "./cart.js"
import { openModifier } from "./menu.js"

export function openOrderScreen(){

 const screen = document.getElementById("orderScreen")
 const list = document.getElementById("orderList")
 const menu = document.getElementById("menuGrid")
 const sticky = document.getElementById("sticky-cart")

 list.innerHTML = ""

 let total = 0

 CART.forEach((item,index)=>{

  const div = document.createElement("div")
  div.className = "order-item"

  let mods = ""

  if(item.modifiers){

   Object.values(item.modifiers).forEach(arr=>{
    arr.forEach(m=>{
     mods += `<div class="order-mod">- ${m}</div>`
    })
   })

  }

  div.innerHTML = `

   <div class="order-row">

    <div class="order-name">
     ${item.name}
     ${mods}
    </div>

    <div class="order-right">

      <div class="order-price">
       ฿${item.price}
      </div>

      <button class="edit-btn" data-index="${index}">
       แก้ไข
      </button>

    </div>

   </div>

  `

  total += item.price

  list.appendChild(div)

 })

 document.getElementById("orderTotal").innerText = total


 /* ---------- UI STATE ---------- */

 screen.classList.remove("hidden")

 if(menu) menu.style.display = "none"
 if(sticky) sticky.style.display = "none"

 document.body.style.overflow = "hidden"


 /* ---------- BACK BUTTON ---------- */

 document.getElementById("backToMenu").onclick = ()=>{

  screen.classList.add("hidden")

  if(menu) menu.style.display = ""
  if(sticky) sticky.style.display = "flex"

  document.body.style.overflow = ""

 }


 /* ---------- EDIT ---------- */

 document.querySelectorAll(".edit-btn").forEach(btn=>{

  btn.onclick=()=>{

   const index = btn.dataset.index
   const item = CART[index]

   screen.classList.add("hidden")

   if(menu) menu.style.display = ""
   if(sticky) sticky.style.display = "flex"

   document.body.style.overflow = ""

   openModifier(item)

  }

 })

}

/* ป้องกัน order screen เปิดตอนโหลดเว็บ */

document.addEventListener("DOMContentLoaded",()=>{

 const screen = document.getElementById("orderScreen")

 if(screen){
  screen.classList.add("hidden")
 }

})
