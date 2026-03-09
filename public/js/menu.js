import { addToCart } from "./cart.js"
import { getMenu, getCategories } from "./api.js"

let fullMenu = []

export async function loadMenu(){

 const menu = await getMenu()
 const categories = await getCategories()

 const menuContainer = document.getElementById("menu")
 const categoryContainer = document.getElementById("categories")

 if(!menuContainer || !categoryContainer) return

 menuContainer.innerHTML=""
 categoryContainer.innerHTML=""

 const categoryMap={}

 categories.forEach(c=>{

  categoryMap[c.id]={
   name:c.name,
   items:[]
  }

 })

 menu.forEach(item=>{

  if(categoryMap[item.category_id]){
   categoryMap[item.category_id].items.push(item)
  }

 })

 const sortedCategories = Object.values(categoryMap).sort((a,b)=>{

  const numA=parseInt(a.name.match(/^\d+/)?.[0]||999)
  const numB=parseInt(b.name.match(/^\d+/)?.[0]||999)

  return numA-numB

 })

 const sortedMenu=[]

 sortedCategories.forEach(cat=>{
  sortedMenu.push(...cat.items)
 })

 fullMenu = sortedMenu

 const allBtn=document.createElement("button")
 allBtn.className="cat-btn"
 allBtn.innerText="ทั้งหมด"

 allBtn.onclick=()=>{

  renderMenu(fullMenu)

 }

 categoryContainer.appendChild(allBtn)

 sortedCategories.forEach(cat=>{

  const btn=document.createElement("button")
  btn.className="cat-btn"

  const cleanName=cat.name.replace(/^\d+_/,"")

  btn.innerText=cleanName

  btn.onclick=()=>{

   renderMenu(cat.items)

  }

  categoryContainer.appendChild(btn)

 })

 renderMenu(fullMenu)

}

function renderMenu(list){

 const menuContainer=document.getElementById("menu")

 menuContainer.innerHTML=""

 list.forEach(item=>{

  const card=document.createElement("div")

  card.className="item"

  card.innerHTML=`

   <img src="${item.image||""}">

   <div class="item-info">
    <div class="item-name">${item.name}</div>
    <div class="item-price">${item.price} ฿</div>
   </div>

   <button class="add-btn">+</button>

  `

  card.querySelector(".add-btn").onclick=()=>{

   addToCart(item)

  }

  menuContainer.appendChild(card)

 })

}
