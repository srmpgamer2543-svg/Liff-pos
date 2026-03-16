import { getMenu, getCategories } from "./api.js"
import { addToCart, updateCartItem } from "./cart.js"

let MENU = []
let CATEGORY_ORDER = {}
let editIndex = null

export async function loadMenu(){

 const grid = document.getElementById("menuGrid")

 grid.innerHTML = "Loading..."

 try{

  const [menu,categories] = await Promise.all([
   getMenu(),
   getCategories()
  ])

  categories.sort((a,b)=>{

   const na = parseInt(a.name) || 999
   const nb = parseInt(b.name) || 999

   return na - nb

  })

  categories.forEach((c,i)=>{

   CATEGORY_ORDER[c.id] = i

  })

  MENU = menu

  MENU.sort((a,b)=>{

   const ca = CATEGORY_ORDER[a.category_id] ?? 999
   const cb = CATEGORY_ORDER[b.category_id] ?? 999

   if(ca !== cb) return ca - cb

   return cleanName(a.name).localeCompare(cleanName(b.name))

  })

  renderCategories(categories)

  renderMenu(MENU)

 }catch(err){

  grid.innerHTML = "Load menu error"
  console.error(err)

 }

}



function renderCategories(categories){

 const bar = document.getElementById("categories")

 bar.innerHTML = ""

 const allBtn = document.createElement("button")

 allBtn.className = "cat-btn"
 allBtn.innerText = "ทั้งหมด"

 allBtn.onclick = ()=>renderMenu(MENU)

 bar.appendChild(allBtn)

 categories.forEach(cat=>{

  const btn = document.createElement("button")

  btn.className = "cat-btn"

  btn.innerText = cleanName(cat.name)

  btn.onclick = ()=>{

   const filtered = MENU.filter(
    m => m.category_id === cat.id
   )

   renderMenu(filtered)

  }

  bar.appendChild(btn)

 })

}



function renderMenu(list){

 const grid = document.getElementById("menuGrid")

 grid.innerHTML = ""

 list.forEach(item=>{

  const card = document.createElement("div")

  card.className = "item"

  card.innerHTML = `

   <img src="${item.image || ""}">

   <div class="item-info">

    <div class="item-name">
    ${cleanName(item.name)}
    </div>

    <div class="item-price">
    ฿${item.price}
    </div>

   </div>

   <div class="add-btn">+</div>

  `

  card.onclick = ()=>{

   if(item.modifier_groups && item.modifier_groups.length){

    openModifier(item)

   }else{

    addToCart(item)

   }

  }

  grid.appendChild(card)

 })

}



export function openModifier(item, previousSelections=null, index=null){

 editIndex = index

 const overlay=document.getElementById("modifierOverlay")
 const modal=document.getElementById("modifierModal")

 /* reset scroll position ทุกครั้ง */
 modal.scrollTop = 0

 const sortedGroups=[...item.modifier_groups].sort((a,b)=>{

  const order=(name)=>{

   if(name.includes("เย็น")) return 1
   if(name.includes("หวาน")) return 2
   if(name.includes("ท็อป")||name.includes("ท้อป")) return 3

   return 99
  }

  return order(a.name)-order(b.name)

 })

 let html=`

 <div class="mod-header">

  <img class="mod-image" src="${item.image || '/logo.png'}">

  <div class="mod-product">

   <div class="mod-product-name">
   ${cleanName(item.name)}
   </div>

  </div>

 </div>

<div class="mod-trash-box">
  <button id="clearMods">🗑️</button>
</div>
 `

 sortedGroups.forEach(group=>{

  const name = group.name

  const isRequired =
   name.includes("เย็น") ||
   name.includes("ความหวาน")

  const isRadio = isRequired

  const isTopping =
   name.includes("ท็อป") ||
   name.includes("ท้อป")

  html+=`<div class="mod-group" data-required="${isRequired}" data-group="${name}" data-id="${group.id}">`

  html+=`<div class="mod-title">${name}</div>`

  group.modifiers.forEach(mod=>{

   if(isTopping){

    html+=`

    <div class="mod-option topping" data-id="${mod.id}" data-price="${mod.price}" data-name="${mod.name}">

      <span>${mod.name}</span>

      <span class="mod-price">฿${mod.price || 0}</span>

      <div class="qty-box">

        <button class="top-minus">➖</button>
        <span class="top-qty">0</span>
        <button class="top-plus">➕</button>

      </div>

    </div>

    `

   }else{

    html+=`

    <label class="mod-option">

     <span>${mod.name}</span>

     <span class="mod-price">฿${mod.price || 0}</span>

     <input
      type="${isRadio ? "radio" : "checkbox"}"
      name="${group.id}"
      value="${mod.id}"
      data-name="${mod.name}"
      data-price="${mod.price}"
     >

    </label>

    `

   }

  })

  html+=`</div>`

 })

 html+=`

<div class="mod-footer">

<div class="qty-row">

 <span class="qty-label">จำนวนแก้ว</span>

 <div class="qty-box">
   <button id="qtyMinus">➖</button>
   <span id="qtyNum">1</span>
   <button id="qtyPlus">➕</button>
 </div>

</div>

`

 modal.innerHTML=html

 /* restore modifier selections */

if(previousSelections){

 Object.entries(previousSelections).forEach(([group,values])=>{

  values.forEach(val=>{

   const radio=document.querySelector(`input[data-name="${val}"]`)

   if(radio){
    radio.checked=true
   }

   const topping=document.querySelector(`.topping[data-name="${val}"]`)

   if(topping){

    const qtyEl = topping.querySelector(".top-qty")
qtyEl.innerText = 1

   }

  })

 })
 
 
}

let oldBtn = document.querySelector(".confirm-btn")
if(oldBtn) oldBtn.remove()

const btn = document.createElement("button")
btn.className = "confirm-btn"
const basePrice = item.basePrice || item.price
btn.innerText = `ใส่ตะกร้า ฿${basePrice}`

overlay.appendChild(btn)

 overlay.classList.add("active")

 modal.scrollTop = 0

 overlay.onclick=(e)=>{

  if(e.target===overlay){
   overlay.classList.remove("active")
  }

 }

 setTimeout(()=>{

  const btn=document.querySelector(".confirm-btn")

  function updateTotalPrice(){

   let extraPrice=0

   document.querySelectorAll(".mod-option input:checked").forEach(i=>{
    extraPrice+=Number(i.dataset.price||0)
   })

   document.querySelectorAll(".topping").forEach(el=>{

    const qty=parseInt(el.querySelector(".top-qty").innerText)
    const price=Number(el.dataset.price)

    extraPrice+=qty*price

   })

   const qty = parseInt(document.getElementById("qtyNum").innerText)

// ใช้ basePrice เพื่อไม่ให้บวก modifier ซ้ำ
const basePrice = item.basePrice || item.price

const total = (basePrice + extraPrice) * qty

btn.innerText = `ใส่ตะกร้า ฿${total}`

  }
  updateTotalPrice()

  document.querySelectorAll(".mod-option input").forEach(input=>{
   input.addEventListener("change",updateTotalPrice)
  })

  document.getElementById("clearMods").onclick=()=>{

   document.querySelectorAll("input").forEach(i=>i.checked=false)

   document.querySelectorAll(".top-qty").forEach(q=>{
    q.innerText="0"
   })

   document.querySelectorAll(".mod-option").forEach(o=>{
    o.classList.remove("selected")
   })

   updateTotalPrice()

  }

  let qty = item.qty || 1
const qtyNum = document.getElementById("qtyNum")

qtyNum.innerText = qty

  document.getElementById("qtyMinus").onclick=()=>{

   if(qty>1){
    qty--
    qtyNum.innerText=qty
    updateTotalPrice()
   }

  }

  document.getElementById("qtyPlus").onclick=()=>{

   qty++
   qtyNum.innerText=qty
   updateTotalPrice()

  }

  document.querySelectorAll(".topping").forEach(el=>{

 const minus=el.querySelector(".top-minus")
 const plus=el.querySelector(".top-plus")
 const num=el.querySelector(".top-qty")

 minus.onclick=()=>{

  let q=parseInt(num.innerText)

  if(q>0){
   q--
   num.innerText=q
   updateTotalPrice()
  }

 }

 plus.onclick=()=>{

  let q=parseInt(num.innerText)

  q++
  num.innerText=q

  updateTotalPrice()

 }

})


  btn.onclick=()=>{

   const selections={}
   let extraPrice=0

   const groups=document.querySelectorAll(".mod-group")

   for(const g of groups){

    if(g.dataset.required==="true"){

     const groupId=g.dataset.id

     const checked=document.querySelector(`input[name="${groupId}"]:checked`)

     if(!checked){

      window.showIOSAlert("กรุณาเลือก "+g.dataset.group)
      return

     }

    }

   }

   item.modifier_groups.forEach(group=>{

    const checked=[...document.querySelectorAll(`input[name="${group.id}"]:checked`)]

    selections[group.name]=checked.map(i=>{

     const n=i.dataset.name
     const price=Number(i.dataset.price||0)

     extraPrice+=price

     return n

    })

   })

   document.querySelectorAll(".topping").forEach(el=>{

    const qty=parseInt(el.querySelector(".top-qty").innerText)

    if(qty>0){

     const name=el.dataset.name
     const price=Number(el.dataset.price)

     if(!selections["ท็อปปิ้ง"])
      selections["ท็อปปิ้ง"]=[]

     for(let i=0;i<qty;i++){

      selections["ท็อปปิ้ง"].push(name)

      extraPrice+=price

     }

    }

   })

   const basePrice = item.basePrice || item.price

const newItem = {

 ...item,
 basePrice: basePrice,
 price: basePrice + extraPrice,
 modifiers: selections

}

if(editIndex !== null){

 updateCartItem(editIndex,newItem)

}else{

 for(let i=0;i<qty;i++){
  addToCart(newItem)
 }

}

editIndex = null

   overlay.classList.remove("active")

  }

 },50)

}



function cleanName(name){

 return name.replace(/^\d+/, "").trim()

}
