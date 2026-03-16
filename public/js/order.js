import { CART } from "./cart.js"
import { openModifier } from "./menu.js"

function cleanName(name){
 return name.replace(/^\d+/, "").trim()
}

export function openOrderScreen(){

 const screen = document.getElementById("orderScreen")
 const list = document.getElementById("orderList")
 const menu = document.getElementById("menuGrid")
 const sticky = document.getElementById("sticky-cart")

 list.innerHTML = ""

 let total = 0

 /* ⭐ รวมรายการที่เหมือนกัน */

 const mergedMap = {}

 CART.forEach((item,index)=>{

  const key = item.name + JSON.stringify(item.modifiers || {})

  if(!mergedMap[key]){

   mergedMap[key] = {
    ...item,
    qty:1,
    indexes:[index]
   }

  }else{

   mergedMap[key].qty++
   mergedMap[key].indexes.push(index)

  }

 })

 const mergedItems = Object.values(mergedMap)

 /* ⭐ render รายการ */

 mergedItems.forEach((item,mergedIndex)=>{

  const div = document.createElement("div")
  div.className = "receipt-item"

  let mods = ""

  if(item.modifiers){

   Object.entries(item.modifiers).forEach(([group,arr])=>{

    arr.forEach(m=>{

     mods += `
     <div class="receipt-mod">
        <span class="mod-name">${m}</span>
        <span class="mod-price"></span>
     </div>
     `

    })

   })

  }

  div.innerHTML = `

   <div class="receipt-product">

     <div class="receipt-name">
       ${cleanName(item.name)} x${item.qty}
     </div>

     ${mods}

     <div class="receipt-price-row">

       <div class="receipt-price">
         ฿${item.price * item.qty}
       </div>

       <button class="edit-btn" data-index="${item.indexes[0]}">
         แก้ไข
       </button>

     </div>

   </div>

  `

  total += item.price * item.qty

  list.appendChild(div)

 })

 document.getElementById("orderTotal").innerText = total

 screen.classList.remove("hidden")
 screen.style.display = "flex"

 if(menu) menu.style.display = "none"
 if(sticky) sticky.style.display = "none"

 document.body.classList.add("order-open")

 document.getElementById("backToMenu").onclick = ()=>{

  screen.classList.add("hidden")
  screen.style.display = "none"

  if(menu) menu.style.display = ""
  if(sticky) sticky.style.display = "flex"

  document.body.classList.remove("order-open")

 }

 document.querySelectorAll(".edit-btn").forEach(btn=>{

  btn.onclick=()=>{

   const index = btn.dataset.index
   const item = CART[index]

   screen.classList.add("hidden")
   screen.style.display = "none"

   if(menu) menu.style.display = ""
   if(sticky) sticky.style.display = "flex"

   document.body.classList.remove("order-open")

   // ⭐ ส่ง modifiers เดิมไปด้วย
   openModifier(item, item.modifiers, index)

  }

 })

}

document.addEventListener("DOMContentLoaded",()=>{

 const screen = document.getElementById("orderScreen")

 if(screen){
  screen.classList.add("hidden")
  screen.style.display = "none"
 }

})
