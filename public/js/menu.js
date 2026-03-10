import { addToCart } from "./cart.js"
import { getMenu, getCategories } from "./api.js"

let menuData = []
let categoriesData = []

function getPrefixNumber(name){

 if(!name) return 999

 const match = name.trim().match(/^(\d{1,3})[\s_\-\.\)\:]*/)

 return match ? parseInt(match[1]) : 999

}

function cleanName(name){

 if(!name) return ""

 return name.replace(/^\d{1,3}[\s_\-\.\)\:]*?/,"")

}

function sortCategories(a,b){

 const pa = getPrefixNumber(a.name)
 const pb = getPrefixNumber(b.name)

 if(pa !== pb){
  return pa - pb
 }

 return a.name.localeCompare(b.name,"th")

}

function sortMenuItems(a,b){

 const catA = categoriesData.findIndex(c => c.id === a.category_id)
 const catB = categoriesData.findIndex(c => c.id === b.category_id)

 if(catA !== catB){
  return catA - catB
 }

 const pa = getPrefixNumber(a.name)
 const pb = getPrefixNumber(b.name)

 if(pa !== pb){
  return pa - pb
 }

 return a.name.localeCompare(b.name,"th")

}

export async function loadMenu(){

 const menu = await getMenu()
 const categories = await getCategories()

 const categoryContainer = document.getElementById("categories")

 menuData = menu
 categoriesData = [...categories].sort(sortCategories)

 categoryContainer.innerHTML = ""

 const allBtn = document.createElement("button")
 allBtn.className = "cat-btn"
 allBtn.innerText = "ทั้งหมด"

 allBtn.onclick = ()=>{

  const sorted=[...menuData].sort(sortMenuItems)

  renderMenu(sorted)

 }

 categoryContainer.appendChild(allBtn)

 categoriesData.forEach(cat=>{

  const btn=document.createElement("button")

  btn.className="cat-btn"

  btn.innerText=cleanName(cat.name)

  btn.onclick=()=>{

   const filtered = menuData
   .filter(item => item.category_id === cat.id)
   .sort(sortMenuItems)

   renderMenu(filtered)

  }

  categoryContainer.appendChild(btn)

 })

 const sorted=[...menuData].sort(sortMenuItems)

 renderMenu(sorted)

}

function renderMenu(list){

 const grid=document.getElementById("menuGrid")

 grid.innerHTML=""

 list.forEach(item=>{

  const card=document.createElement("div")

  card.className="item"

  card.innerHTML=`

   <img src="${item.image || ""}">

   <div class="item-info">

     <div class="item-name">
       ${cleanName(item.name)}
     </div>

     <div class="item-price">
       ${item.price} ฿
     </div>

   </div>

   <div class="add-btn">+</div>

  `

  card.addEventListener("click",(e)=>{

   e.stopPropagation()

   if(!item.modifier_groups || item.modifier_groups.length===0){

    addToCart(item)

    return

   }

   openModifier(item)

  })

  const addBtn=card.querySelector(".add-btn")

  addBtn.addEventListener("click",(e)=>{

   e.stopPropagation()

   if(!item.modifier_groups || item.modifier_groups.length===0){

    addToCart(item)

    return

   }

   openModifier(item)

  })

  grid.appendChild(card)

 })

}

function openModifier(item){

 const overlay=document.getElementById("modifierOverlay")
 const modal=document.getElementById("modifierModal")

 let html=`<h2>${cleanName(item.name)}</h2>`

 item.modifier_groups.forEach(group=>{

  const min = group.min_select || 0
  const max = group.max_select || group.modifiers.length

  html+=`<div class="mod-group">`

  html+=`
  <div class="mod-title">
  ${group.name}
  <div style="font-size:20px;color:#888;">
  เลือก ${min}${max>1 ? ` - ${max}` : ""}
  </div>
  </div>
  `

  group.modifiers.forEach(mod=>{

   const type =
   min===1 && max===1
   ? "radio"
   : "checkbox"

   html+=`

   <label class="mod-option">

   <span>
   ${mod.name}
   ${mod.price>0 ? `(+${mod.price})` : ""}
   </span>

   <input
    type="${type}"
    name="${group.id}"
    value="${mod.name}"
   >

   </label>

   `

  })

  html+=`</div>`

 })

 html+=`<button class="confirm-btn">เพิ่มลงตะกร้า</button>`

 modal.innerHTML=html

 overlay.classList.add("active")

 overlay.onclick=(e)=>{

  if(e.target===overlay){

   overlay.classList.remove("active")

  }

 }

 setTimeout(()=>{

  const btn=document.querySelector(".confirm-btn")

  btn.onclick=()=>{

   const selections={}
   let valid=true

   item.modifier_groups.forEach(group=>{

    const checked=[...document.querySelectorAll(`input[name="${group.id}"]:checked`)]
    .map(i=>i.value)

    if(checked.length < (group.min_select||0)){
     alert(`กรุณาเลือก ${group.name}`)
     valid=false
    }

    selections[group.name]=checked

   })

   if(!valid) return

   addToCart({

    ...item,
    modifiers:selections

   })

   overlay.classList.remove("active")

  }

 },50)

}
