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

 /* ===============================
    รวมรายการที่เหมือนกัน
  =============================== */

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

 /* ===============================
    render รายการ
  =============================== */

 mergedItems.forEach((item,mergedIndex)=>{

  const div = document.createElement("div")
  div.className = "receipt-item"

  let mods = ""

  if(item.modifiers){

   Object.entries(item.modifiers).forEach(([group,arr])=>{

    const modCount = {}

    arr.forEach(m=>{

     if(typeof m === "object"){

      modCount[m.name] = modCount[m.name] || {count:0,price:m.price || 0}
      modCount[m.name].count++

     }else{

      modCount[m] = modCount[m] || {count:0,price:0}
      modCount[m].count++

     }

    })

    Object.entries(modCount).forEach(([name,data])=>{

     const qtyText = data.count > 1 ? ` x${data.count}` : ""
     const priceText = data.price ? ` +฿${data.price*data.count}` : ""

     mods += `
     <div class="receipt-mod">
        <span class="mod-name">${name}${qtyText}</span>
        <span class="mod-price">${priceText}</span>
     </div>
     `

    })

   })

  }

  /* ===============================
     note
  =============================== */

  let noteHTML = ""

  if(item.note){

   noteHTML = `
   <div class="receipt-note">
      หมายเหตุ: ${item.note}
   </div>
   `

  }

  div.innerHTML = `

   <div class="receipt-product">

     <div class="receipt-name">
       ${cleanName(item.name)} x${item.qty}
     </div>

     ${mods}

     ${noteHTML}

     <div class="receipt-price-row">

       <div class="receipt-price">
         ฿${item.price * item.qty}
       </div>

       <div class="receipt-actions">

        <button class="edit-btn" data-indexes="${item.indexes.join(",")}">
          แก้ไข
        </button>

        <button class="delete-btn" data-indexes="${item.indexes.join(",")}">
          ลบ
        </button>

       </div>

     </div>

   </div>

  `

  total += item.price * item.qty

  list.appendChild(div)

 })

 /* ===============================
    total
  =============================== */

 document.getElementById("orderTotal").innerText = total

 screen.classList.remove("hidden")
 screen.style.display = "flex"

 if(menu) menu.style.display = "none"
 if(sticky) sticky.style.display = "none"

 document.body.classList.add("order-open")

 /* ===============================
    กลับหน้า menu
  =============================== */

 document.getElementById("backToMenu").onclick = ()=>{

  screen.classList.add("hidden")
  screen.style.display = "none"

  if(menu) menu.style.display = ""
  if(sticky) sticky.style.display = "flex"

  document.body.classList.remove("order-open")

 }

 /* ===============================
    ปุ่มแก้ไข
  =============================== */

 document.querySelectorAll(".edit-btn").forEach(btn=>{

  btn.onclick=()=>{

   const indexes = btn.dataset.indexes.split(",")

   if(indexes.length === 1){

    const index = indexes[0]
    const item = CART[index]

    screen.classList.add("hidden")
    screen.style.display = "none"

    if(menu) menu.style.display = ""
    if(sticky) sticky.style.display = "flex"

    document.body.classList.remove("order-open")

    openModifier(item, item.modifiers, index)

   }else{

    openCupSelector(indexes)

   }

  }

 })

 /* ===============================
    ปุ่มลบ
  =============================== */

 document.querySelectorAll(".delete-btn").forEach(btn=>{

  btn.onclick=()=>{

   const indexes = btn.dataset.indexes.split(",")

   if(confirm("ลบรายการนี้?")){

    indexes.reverse().forEach(i=>{
     CART.splice(i,1)
    })

    openOrderScreen()

   }

  }

 })

}

/* ===============================
   เลือกแก้วที่จะแก้
================================ */

function openCupSelector(indexes){

 const modal = document.createElement("div")
 modal.className = "cup-selector-modal"

 let html = `
 <div class="cup-selector-box">

   <div class="cup-selector-title">
     เลือกแก้วที่ต้องการแก้ไข
   </div>
 `

 indexes.forEach((i,idx)=>{

  html += `
  <button class="cup-btn" data-index="${i}">
    แก้วที่ ${idx+1}
  </button>
  `

 })

 html += `
 </div>
 `

 modal.innerHTML = html
 document.body.appendChild(modal)

 document.querySelectorAll(".cup-btn").forEach(btn=>{

  btn.onclick=()=>{

   const index = btn.dataset.index
   const item = CART[index]

   modal.remove()

   openModifier(item, item.modifiers, index)

  }

 })

}

/* ===============================
   init
================================ */

document.addEventListener("DOMContentLoaded",()=>{

 const screen = document.getElementById("orderScreen")

 if(screen){
  screen.classList.add("hidden")
  screen.style.display = "none"
 }

})
