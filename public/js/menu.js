import { addToCart } from "./cart.js"
import { getMenu, getCategories } from "./api.js"

let menuData=[]

function getPrefixNumber(name){

 if(!name) return 999

 const match=name.match(/^(\d+)[_\-\s]?/)

 return match ? parseInt(match[1]) : 999

}

function cleanName(name){

 if(!name) return ""

 return name.replace(/^\d+[_\-\s]?/,"")

}

export async function loadMenu(){

 const menu=await getMenu()
 const categories=await getCategories()

 const categoryContainer=document.getElementById("categories")

 menuData=menu

 categoryContainer.innerHTML=""

 const allBtn=document.createElement("button")
 allBtn.className="cat-btn"
 allBtn.innerText="ทั้งหมด"

 allBtn.onclick=()=>{

  const sorted=[...menu]
  .sort((a,b)=>getPrefixNumber(a.name)-getPrefixNumber(b.name))

  renderMenu(sorted)

 }

 categoryContainer.appendChild(allBtn)

 const sortedCategories=[...categories]
 .sort((a,b)=>getPrefixNumber(a.name)-getPrefixNumber(b.name))

 sortedCategories.forEach(cat=>{

  const btn=document.createElement("button")
  btn.className="cat-btn"

  btn.innerText=cleanName(cat.name)

  btn.onclick=()=>{

   const items=menu
   .filter(i=>i.category_id===cat.id)
   .sort((a,b)=>getPrefixNumber(a.name)-getPrefixNumber(b.name))

   renderMenu(items)

  }

  categoryContainer.appendChild(btn)

 })

 const sorted=[...menu]
 .sort((a,b)=>getPrefixNumber(a.name)-getPrefixNumber(b.name))

 renderMenu(sorted)

}

function renderMenu(list){

 const menuContainer=document.getElementById("menu")
 menuContainer.innerHTML=""

 list.forEach(item=>{

  const card=document.createElement("div")
  card.className="item"

  const clean=cleanName(item.name)

  card.innerHTML=`

  <img src="${item.image||""}">

  <div class="item-info">
  <div class="item-name">${clean}</div>
  <div class="item-price">${item.price} ฿</div>
  </div>

  `

  card.onclick=()=>openModifier(item)

  menuContainer.appendChild(card)

 })

}

function openModifier(item){

 const overlay=document.getElementById("modifierOverlay")
 const modal=document.getElementById("modifierModal")

 modal.innerHTML=`

 <h2>${cleanName(item.name)}</h2>

 <div class="mod-group">

 <div class="mod-title">เลือกประเภท *</div>

 <label class="mod-option">
 <input type="radio" name="temp" value="เย็น">
 เย็น
 </label>

 <label class="mod-option">
 <input type="radio" name="temp" value="ปั่น">
 ปั่น
 </label>

 </div>

 <div class="mod-group">

 <div class="mod-title">ระดับความหวาน *</div>

 <label class="mod-option">
 <input type="radio" name="sweet" value="100%">
 100%
 </label>

 <label class="mod-option">
 <input type="radio" name="sweet" value="50%">
 50%
 </label>

 <label class="mod-option">
 <input type="radio" name="sweet" value="25%">
 25%
 </label>

 </div>

 <div class="mod-group">

 <div class="mod-title">ท็อปปิ้ง</div>

 <label class="mod-option">
 <input type="checkbox" value="ไข่มุก">
 ไข่มุก
 </label>

 <label class="mod-option">
 <input type="checkbox" value="วิปครีม">
 วิปครีม
 </label>

 </div>

 <button class="confirm-btn">เพิ่มลงตะกร้า</button>

 `

 overlay.classList.add("active")

 overlay.onclick=(e)=>{

  if(e.target===overlay){
   overlay.classList.remove("active")
  }

 }

 setTimeout(()=>{

  const btn=document.querySelector(".confirm-btn")

  btn.onclick=()=>{

   const temp=document.querySelector("input[name=temp]:checked")
   const sweet=document.querySelector("input[name=sweet]:checked")

   if(!temp||!sweet){
    alert("กรุณาเลือกตัวเลือกที่จำเป็น")
    return
   }

   const toppings=[...document.querySelectorAll("input[type=checkbox]:checked")]
   .map(i=>i.value)

   addToCart({
    ...item,
    type:temp.value,
    sweet:sweet.value,
    toppings:toppings
   })

   overlay.classList.remove("active")

  }

 },50)

}
