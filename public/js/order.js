import { CART } from "./cart.js"

export function openOrderScreen(){

 const screen = document.getElementById("orderScreen")
 const list = document.getElementById("orderList")

 list.innerHTML = ""

 let total = 0

 CART.forEach(item=>{

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

   <div class="order-name">
    ${item.name}
   </div>

   ${mods}

   <div>
    ฿${item.price}
   </div>

  `

  total += item.price

  list.appendChild(div)

 })

 document.getElementById("orderTotal").innerText = total

 screen.classList.remove("hidden")
 document.getElementById("backToMenu").onclick = ()=>{
 document.getElementById("orderScreen").classList.add("hidden")
}

}
