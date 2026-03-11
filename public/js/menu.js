import { getMenu, getCategories } from "./api.js"
import { addToCart } from "./cart.js"

let MENU = []
let CATEGORY_ORDER = {}

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



function openModifier(item){

 const overlay=document.getElementById("modifierOverlay")
 const modal=document.getElementById("modifierModal")

 let html=`

 <div class="mod-header">

  <img class="mod-image" src="${item.image || ""}">

  <div class="mod-product">

   <div class="mod-product-name">
   ${cleanName(item.name)}
   </div>

  </div>

 </div>

 `

 item.modifier_groups.forEach(group=>{

  const name = group.name

  const isRequired =
   name.includes("เย็น") ||
   name.includes("ความหวาน")

  const isRadio = isRequired

  const isTopping =
   name.includes("ท็อป") ||
   name.includes("ท้อป")

  html+=`<div class="mod-group" data-required="${isRequired}" data-group="${name}">`

  html+=`<div class="mod-title">${name}</div>`

  group.modifiers.forEach(mod=>{

   if(isTopping){

    html+=`

    <div class="mod-option topping" data-id="${mod.id}" data-price="${mod.price}" data-name="${mod.name}">

      <span>${mod.name}</span>

      <span class="mod-price">฿${mod.price || 0}</span>

      <div class="qty-box">

        <button class="top-minus">-</button>
        <span class="top-qty">0</span>
        <button class="top-plus">+</button>

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

  <div class="qty-box">

   <button id="qtyMinus">-</button>
   <span id="qtyNum">1</span>
   <button id="qtyPlus">+</button>

  </div>

  <button class="confirm-btn">
  ใส่ตะกร้า ฿${item.price}
  </button>

 </div>

 `

 modal.innerHTML=html

 overlay.classList.add("active")

 overlay.onclick=(e)=>{

  if(e.target===overlay){
   overlay.classList.remove("active")
  }

 }

 setTimeout(()=>{

  /* qty product */

  let qty=1
  const qtyNum=document.getElementById("qtyNum")

  document.getElementById("qtyMinus").onclick=()=>{

   if(qty>1){
    qty--
    qtyNum.innerText=qty
   }

  }

  document.getElementById("qtyPlus").onclick=()=>{

   qty++
   qtyNum.innerText=qty

  }

  /* topping qty */

  document.querySelectorAll(".topping").forEach(el=>{

   const minus=el.querySelector(".top-minus")
   const plus=el.querySelector(".top-plus")
   const num=el.querySelector(".top-qty")

   let q=0

   minus.onclick=()=>{

    if(q>0){
     q--
     num.innerText=q
    }

   }

   plus.onclick=()=>{

    q++
    num.innerText=q

   }

  })

  const btn=document.querySelector(".confirm-btn")

  btn.onclick=()=>{

   const selections={}
   let extraPrice=0

   /* VALIDATE REQUIRED */

   const groups=document.querySelectorAll(".mod-group")

   for(const g of groups){

    if(g.dataset.required==="true"){

     const checked=g.querySelector("input:checked")

     if(!checked){

      alert("กรุณาเลือก "+g.dataset.group)

      return

     }

    }

   }

   /* COLLECT RADIO + CHECKBOX */

   item.modifier_groups.forEach(group=>{

    const checked=[...document.querySelectorAll(`input[name="${group.id}"]:checked`)]

    selections[group.name]=checked.map(i=>{

     const n=i.dataset.name
     const price=Number(i.dataset.price||0)

     extraPrice+=price

     return n

    })

   })

   /* COLLECT TOPPING */

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

   for(let i=0;i<qty;i++){

    addToCart({

     ...item,
     price:item.price + extraPrice,
     modifiers:selections

    })

   }

   overlay.classList.remove("active")

  }

 },50)

}



function cleanName(name){

 return name.replace(/^\d+/, "").trim()

}
