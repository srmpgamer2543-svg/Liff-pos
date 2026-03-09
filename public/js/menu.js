import { getMenu } from "./api.js"
import { addToCart } from "./cart.js"

let allMenu = []
let categories = []

/* mapping หมวดจาก loyverse */

const CATEGORY_MAP = {
"9cecdcb1-bb21-45d2-b6f1-4533e8338651": "01_เมนูชา",
"93e0c7e4-3886-4e66-81f9-b150dc50c52": "02_เมนูนมสด",
"743fa003-80ff-43e7-8d0b-e3f10bb09d43": "03_เมนูผลไม้",
"cd9b8034-ea70-4bb2-b8c6-73b48dfda916": "04_เมนูโซดา",
"938355b2-ec44-4dd4-bb08-ef7c5affbd5b": "05_เมนูปังเย็น",
"3f2f494d-b4c6-4f41-be7f-ad2b3b55086d": "06_เมนูขนมปัง"
}

export async function loadMenu(){

 const menu = await getMenu()

 allMenu = menu || []

 prepareCategories()

 renderCategories()

 renderMenu(allMenu)

}


/* เตรียมหมวด */

function prepareCategories(){

 const map = {}

 allMenu.forEach(item=>{

  const raw = CATEGORY_MAP[item.category_id]

  if(!raw) return

  const [orderStr,thaiName] = raw.split("_")

  const order = parseInt(orderStr)

  if(!map[item.category_id]){

   map[item.category_id] = {
    id:item.category_id,
    name:thaiName,
    order:order
   }

  }

 })

 categories = Object.values(map).sort((a,b)=>a.order-b.order)

}


/* ปุ่มหมวด */

function renderCategories(){

 const container = document.getElementById("categories")

 if(!container) return

 container.innerHTML=""

 const allBtn=document.createElement("button")
 allBtn.className="cat-btn"
 allBtn.innerText="ทั้งหมด"

 allBtn.onclick=()=>{

  const sorted = sortMenu(allMenu)

  renderMenu(sorted)

 }

 container.appendChild(allBtn)

 categories.forEach(cat=>{

  const btn=document.createElement("button")

  btn.className="cat-btn"

  btn.innerText=cat.name

  btn.onclick=()=>{

   const filtered = allMenu.filter(i=>i.category_id===cat.id)

   const sorted = sortMenu(filtered)

   renderMenu(sorted)

  }

  container.appendChild(btn)

 })

}


/* เรียงเมนู */

function sortMenu(menu){

 return [...menu].sort((a,b)=>{

  const mapA = CATEGORY_MAP[a.category_id]
  const mapB = CATEGORY_MAP[b.category_id]

  const orderA = mapA ? parseInt(mapA.split("_")[0]) : 999
  const orderB = mapB ? parseInt(mapB.split("_")[0]) : 999

  if(orderA !== orderB){
   return orderA - orderB
  }

  return a.name.localeCompare(b.name,"th")

 })

}


/* แสดงเมนู */

function renderMenu(menu){

 const container=document.getElementById("menu")

 if(!container) return

 container.innerHTML=""

 const sorted = sortMenu(menu)

 sorted.forEach(item=>{

  const div=document.createElement("div")

  div.className="item"

  div.innerHTML=`
  <img src="${item.image || ""}">
  <h3>${item.name}</h3>
  <p>${item.price}</p>
  <button>เพิ่ม</button>
  `

  div.querySelector("button").onclick=()=>addToCart(item)

  container.appendChild(div)

 })

}
