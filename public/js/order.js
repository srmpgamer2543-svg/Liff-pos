import { CART } from "./cart.js"
import { openModifier } from "./menu.js"
import { updateStickyCart } from "./sticky-cart.js"
import { createOrder, createOrderItems } from "./api.js"

function cleanName(name){
 return name.replace(/^\d+/, "").trim()
}

let isSending = false // 👈 lock ยิงซ้ำ

export function openOrderScreen(){

 const screen = document.getElementById("orderScreen")
 const list = document.getElementById("orderList")
 const menu = document.getElementById("menuGrid")
 const sticky = document.getElementById("sticky-cart")

 list.innerHTML = ""

 let total = 0

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

 mergedItems.forEach((item)=>{

  const div = document.createElement("div")
  div.className = "receipt-item"

  let mods = ""

  if(item.modifiers){

   Object.entries(item.modifiers).forEach(([group,arr])=>{

    const modCount = {}

    arr.forEach(m=>{

     const name = typeof m === "object" ? m.name : m
     const price = typeof m === "object" ? m.price || 0 : 0

     if(!modCount[name]) modCount[name] = {count:0,price}

     modCount[name].count++

    })

    Object.entries(modCount).forEach(([name,data])=>{

     const qty = data.count > 1 ? ` x${data.count}` : ""
     const price = data.price ? ` +฿${data.price*data.count}` : ""

     mods += `
     <div class="receipt-mod">
        <span class="mod-name">${name}${qty}</span>
        <span class="mod-price">${price}</span>
     </div>
     `

    })

   })

  }

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

 document.getElementById("orderTotal").innerText = total

 screen.classList.remove("hidden")
 screen.style.display = "flex"

 if(menu) menu.style.display = "none"
 if(sticky) sticky.style.display = "none"

 document.body.classList.add("order-open")

 document.getElementById("backToMenu").onclick = ()=>{

  closeOrderScreen()

 }

 document.querySelectorAll(".edit-btn").forEach(btn=>{

  btn.onclick=()=>{

   const indexes = btn.dataset.indexes.split(",").map(Number)

   const index = indexes[0]
   const item = CART[index]

   closeOrderScreen()

   openModifier(item,item.modifiers,index)

  }

 })

 document.querySelectorAll(".delete-btn").forEach(btn=>{

  btn.onclick=()=>{

   const indexes = btn.dataset.indexes.split(",").map(Number)

   if(confirm("ลบรายการนี้ทั้งหมด?")){

    indexes.sort((a,b)=>b-a).forEach(i=>{
     CART.splice(i,1)
    })

    updateStickyCart(CART)

    openOrderScreen()

   }

  }

 })

}

function closeOrderScreen(){

 const screen = document.getElementById("orderScreen")
 const menu = document.getElementById("menuGrid")
 const sticky = document.getElementById("sticky-cart")

 screen.classList.add("hidden")
 screen.style.display = "none"

 if(menu) menu.style.display = ""
 if(sticky) sticky.style.display = "flex"

 document.body.classList.remove("order-open")

}

document.addEventListener("DOMContentLoaded",()=>{

 const screen = document.getElementById("orderScreen")

 if(screen){
  screen.classList.add("hidden")
  screen.style.display = "none"
 }

 const sendBtn = document.getElementById("sendOrderBtn")

 if(sendBtn){
  sendBtn.onclick = sendOrder
 }

})

async function sendOrder(){

 if(isSending) return // 👈 กันกดรัว

 if(CART.length===0){
  window.showIOSAlert("ไม่มีสินค้า")
  return
 }

 const btn = document.getElementById("sendOrderBtn")
 isSending = true

 if(btn){
  btn.disabled = true
  btn.innerText = "กำลังส่ง..."
 }

 try{

  let total = 0
  CART.forEach(i=>{
   total += i.price
  })

  const order = await createOrder({
   table_id:1,
   total:total
  })

  console.log("ORDER:", order) // 👈 debug

  if(!order || !order.id){
   throw new Error("create order failed")
  }

  const orderId = order.id

  const items = CART.map(i=>({
   order_id: orderId,
   name: i.name,
   price: i.price,
   modifiers: i.modifiers || {}
  }))

  await createOrderItems(items)

  window.showIOSAlert("ส่งออเดอร์สำเร็จ")

  location.reload()

 }catch(err){

  console.error(err)

  window.showIOSAlert("ส่งออเดอร์ไม่สำเร็จ")

  isSending = false

  if(btn){
   btn.disabled = false
   btn.innerText = "ส่งออเดอร์"
  }

 }

}
