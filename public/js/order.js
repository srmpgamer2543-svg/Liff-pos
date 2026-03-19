import { CART } from "./cart.js"
import { openModifier } from "./menu.js"
import { updateStickyCart } from "./sticky-cart.js"
import { createOrder, createOrderItems } from "./api.js"

function cleanName(name){
 return name.replace(/^\d+/, "").trim()
}

let isSending = false

function isLiffReady(){
 return window.liff && typeof liff.isLoggedIn === "function" && liff.isLoggedIn()
}

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
  div.className = "mb-3"

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
     <div class="flex justify-between">
       <span>${name}${qty}</span>
       <span>${price}</span>
     </div>
     `
    })

   })

  }

  div.innerHTML = `

<div class="receipt-item">

  <!-- HEADER -->
  mods += `
   <div class="receipt-mod">
  <span>${name}${qty}</span>
  <span>${price}</span>
</div>
`

    <div class="receipt-name">
      ${cleanName(item.name)}
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

  <!-- MOD -->
  <div class="receipt-mod">
    ${mods}
  </div>

  <!-- FOOTER -->
  <div class="receipt-price-row">

    <div class="qty-control">
      <button class="qty-btn minus-btn" data-indexes="${item.indexes.join(",")}">-</button>
      <span class="qty-text">${item.qty}</span>
      <button class="qty-btn plus-btn" data-indexes="${item.indexes.join(",")}">+</button>
    </div>

    <div class="receipt-price">
      ฿${item.price * item.qty}
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

 // ➕ เพิ่ม
 document.querySelectorAll(".plus-btn").forEach(btn=>{
  btn.onclick=()=>{
   const indexes = btn.dataset.indexes.split(",").map(Number)
   const item = CART[indexes[0]]
   CART.push(item)

   updateStickyCart(CART)
   openOrderScreen()
  }
 })

 // ➖ ลด
 document.querySelectorAll(".minus-btn").forEach(btn=>{
  btn.onclick=()=>{
   const indexes = btn.dataset.indexes.split(",").map(Number)
   CART.splice(indexes[0],1)

   updateStickyCart(CART)
   openOrderScreen()
  }
 })

 // EDIT
 document.querySelectorAll(".edit-btn").forEach(btn=>{
  btn.onclick=()=>{
   const indexes = btn.dataset.indexes.split(",").map(Number)
   const item = CART[indexes[0]]

   closeOrderScreen()
   openModifier(item, item.modifiers, indexes)
  }
 })

 // DELETE
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

 screen.classList.add("hidden")
 screen.style.display = "none"

 if(menu) menu.style.display = ""

 document.body.classList.remove("order-open")

 updateStickyCart(CART)

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

 if(isSending) return

 if(!window.lineUserId){
  window.showIOSAlert("กรุณาเปิดผ่าน LINE ใหม่")
  return
 }

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
   total:total,
   line_user_id: window.lineUserId
  })

  if(!order || !order.id){
   throw new Error("create order failed")
  }

  const orderId = order.id

  const items = CART.map(i=>({
   order_id: orderId,
   name: i.name,
   price: i.price,
   modifiers: i.modifiers || {},
   line_user_id: window.lineUserId
  }))

  await createOrderItems(items)

  if(isLiffReady() && liff.isInClient()){
    try{
      await liff.sendMessages([
        {
          type:"text",
          text:`🧾 รับออเดอร์แล้ว #${orderId}\n⏳ รอร้านยืนยัน`
        }
      ])
    }catch(err){}
  }

  if(isLiffReady()){
   if(liff.isInClient()){
     liff.closeWindow()
     return
   }
  }

  window.showIOSAlert("สั่งออเดอร์สำเร็จแล้ว")

 }catch(err){

  window.showIOSAlert("ส่งออเดอร์ไม่สำเร็จ")

  isSending = false

  if(btn){
   btn.disabled = false
   btn.innerText = "ส่งออเดอร์"
  }

 }

}
