import { addToCart } from "./cart.js"
import { getMenu, getCategories } from "./api.js"

let menuData = []
let categoriesData = []

function getPrefixNumber(name){
 if(!name) return 999
 const match = name.trim().match(/^(\d{1,3})/)
 return match ? parseInt(match[1]) : 999
}

function cleanName(name){
 if(!name) return ""
 return name.replace(/^\d{1,3}[\s_\-\.\)\:]*?/,"")
}

function sortMenuItems(a,b){
 const pa = getPrefixNumber(a.name)
 const pb = getPrefixNumber(b.name)

 if(pa !== pb){
  return pa - pb
 }

 return a.name.localeCompare(b.name,"th")
}

function sortCategories(a,b){
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
 allBtn.innerText = "All"

 allBtn.onclick = ()=>{
  const sorted = [...menuData].sort(sortMenuItems)
  renderMenu(sorted)
 }

 categoryContainer.appendChild(allBtn)

 categoriesData.forEach(cat=>{

  const btn = document.createElement("button")
  btn.className = "cat-btn"
  btn.innerText = cleanName(cat.name)

  btn.onclick = ()=>{

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

 const grid = document.getElementById("menuGrid")

 grid.innerHTML = ""

 list.forEach(item=>{

  const card = document.createElement("div")
  card.className = "menu-item"

  card.innerHTML = `

   <img src="${item.image || ""}">

   <div class="menu-name">
   ${cleanName(item.name)}
   </div>

   <div class="menu-price">
   ${item.price} ฿
   </div>

  `

  card.onclick = ()=>{
   openModifier(item)
  }

  grid.appendChild(card)

 })

}

function openModifier(item){

 const overlay = document.getElementById("modifierOverlay")
 const modal = document.getElementById("modifierModal")

 modal.innerHTML = `

 <h2>${cleanName(item.name)}</h2>

 <div class="mod-group">

 <div class="mod-title">เลือกประเภท *</div>

 <label class="mod-option">
 เย็น
 <input type="radio" name="temp" value="เย็น">
 </label>

 <label class="mod-option">
 ปั่น
 <input type="radio" name="temp" value="ปั่น">
 </label>

 </div>

 <div class="mod-group">

 <div class="mod-title">ระดับความหวาน *</div>

 <label class="mod-option">
 100%
 <input type="radio" name="sweet" value="100%">
 </label>

 <label class="mod-option">
 50%
 <input type="radio" name="sweet" value="50%">
 </label>

 <label class="mod-option">
 25%
 <input type="radio" name="sweet" value="25%">
 </label>

 </div>

 <div class="mod-group">

 <div class="mod-title">ท็อปปิ้ง</div>

 <label class="mod-option">
 ไข่มุก
 <input type="checkbox" value="ไข่มุก">
 </label>

 <label class="mod-option">
 วิปครีม
 <input type="checkbox" value="วิปครีม">
 </label>

 </div>

 <button class="confirm-btn">เพิ่มลงตะกร้า</button>

 `

 overlay.classList.add("active")

 overlay.onclick = (e)=>{
  if(e.target === overlay){
   overlay.classList.remove("active")
  }
 }

 setTimeout(()=>{

  const btn = document.querySelector(".confirm-btn")

  btn.onclick = ()=>{

   const temp = document.querySelector("input[name=temp]:checked")
   const sweet = document.querySelector("input[name=sweet]:checked")

   if(!temp || !sweet){
    alert("กรุณาเลือกตัวเลือก")
    return
   }

   const toppings = [...document.querySelectorAll("input[type=checkbox]:checked")]
   .map(i=>i.value)

   addToCart({
    ...item,
    type: temp.value,
    sweet: sweet.value,
    toppings: toppings
   })

   overlay.classList.remove("active")

  }

 },50)

}
