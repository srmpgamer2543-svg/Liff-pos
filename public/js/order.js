import { CART } from "./cart.js"
import { openModifier } from "./menu.js"

export function openOrderScreen(){

 const screen = document.getElementById("orderScreen")
 const list = document.getElementById("orderList")

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

 screen.classList.remove("hidden")

 document.body.style.overflow = "hidden"

 document.getElementById("backToMenu").onclick = ()=>{

  screen.classList.add("hidden")

  document.body.style.overflow = ""

 }

 document.querySelectorAll(".edit-btn").forEach(btn=>{

  btn.onclick=()=>{

   const index = btn.dataset.index
   const item = CART[index]

   screen.classList.add("hidden")

   document.body.style.overflow = ""

   openModifier(item)

  }

 })

}
