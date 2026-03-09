import { addToCart } from "./cart.js"
import { getMenu, getCategories } from "./api.js"

let fullMenu=[]

function getOrderNumber(name){

 const match=name.match(/^(\d+)/)

 return match?parseInt(match[1]):999

}

export async function loadMenu(){

 const menu=await getMenu()
 const categories=await getCategories()

 const menuContainer=document.getElementById("menu")
 const categoryContainer=document.getElementById("categories")

 if(!menuContainer||!categoryContainer)return

 menuContainer.innerHTML=""
 categoryContainer.innerHTML=""

 const categoryMap={}

 categories.forEach(c=>{

  categoryMap[c.id]={
   id:c.id,
   name:c.name,
   items:[]
  }

 })

 menu.forEach(item=>{

  if(!categoryMap[item.category_id]){

   categoryMap[item.category_id]={
    id:item.category_id,
    name:"อื่นๆ",
    items:[]
   }

  }

  categoryMap[item.category_id].items.push(item)

 })

 const sortedCategories=Object.values(categoryMap)
 .sort((a,b)=>getOrderNumber(a.name)-getOrderNumber(b.name))

 /* ปุ่มทั้งหมด */

 const allBtn=document.createElement("button")
 allBtn.className="cat-btn"
 allBtn.innerText="ทั้งหมด"

 allBtn.onclick=()=>{

  const sorted=[...menu]
  .sort((a,b)=>getOrderNumber(a.name)-getOrderNumber(b.name))

  renderMenu(sorted)

 }

 categoryContainer.appendChild(allBtn)

 /* ปุ่มหมวด */

 sortedCategories.forEach(cat=>{

  const btn=document.createElement("button")
  btn.className="cat-btn"

  const cleanName=cat.name.replace(/^\d+_/,"")

  btn.innerText=cleanName

  btn.onclick=()=>{

   const sortedItems=[...cat.items]
   .sort((a,b)=>getOrderNumber(a.name)-getOrderNumber(b.name))

   renderMenu(sortedItems)

  }

  categoryContainer.appendChild(btn)

 })

 fullMenu=[...menu]
 .sort((a,b)=>getOrderNumber(a.name)-getOrderNumber(b.name))

 renderMenu(fullMenu)

}

function renderMenu(list){

 const menuContainer=document.getElementById("menu")

 menuContainer.innerHTML=""

 list.forEach(item=>{

  const card=document.createElement("div")
  card.className="item"

  const cleanName=item.name.replace(/^\d+_/,"")

  card.innerHTML=`

  <img src="${item.image||""}">

  <div class="item-info">
  <div class="item-name">${cleanName}</div>
  <div class="item-price">${item.price} ฿</div>
  </div>

  <button class="add-btn">+</button>

  `

  card.onclick=()=>openModifierUI(item)

  menuContainer.appendChild(card)

 })

}

function openModifierUI(item){

 const html=`

 <div class="mod-group">

 <div class="mod-title">เลือกประเภท</div>

 <label class="mod-option">
 <input type="radio" name="temp" value="เย็น"> เย็น
 </label>

 <label class="mod-option">
 <input type="radio" name="temp" value="ปั่น"> ปั่น
 </label>

 </div>

 <div class="mod-group">

 <div class="mod-title">ระดับความหวาน</div>

 <label class="mod-option"><input type="radio" name="sweet" value="100%">100%</label>
 <label class="mod-option"><input type="radio" name="sweet" value="50%">50%</label>
 <label class="mod-option"><input type="radio" name="sweet" value="25%">25%</label>

 </div>

 <div class="mod-group">

 <div class="mod-title">ท็อปปิ้ง</div>

 <label class="mod-option"><input type="checkbox" value="ไข่มุก">ไข่มุก</label>
 <label class="mod-option"><input type="checkbox" value="วิปครีม">วิปครีม</label>

 </div>

 <button class="confirm-btn">เพิ่มลงตะกร้า</button>

 `

 window.openModifier(html)

 setTimeout(()=>{

  document.querySelector(".confirm-btn").onclick=()=>{

   addToCart(item)

   window.closeModifier()

  }

 },50)

}
