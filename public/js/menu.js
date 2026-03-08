import { getMenu } from "./api.js"
import { addToCart } from "./cart.js"

let allMenu = []
let categories = []

/* กำหนดหมวดหมู่ที่ต้องการให้แสดง */
const CATEGORY_ORDER = [
{ key: "01_", name: "เมนูชา", order: 1 },
{ key: "02_", name: "เมนูนมสด", order: 2 },
{ key: "03_", name: "เมนูผลไม้", order: 3 },
{ key: "04_", name: "เมนูโซดา", order: 4 },
{ key: "05_", name: "เมนูปังเย็น", order: 5 },
{ key: "06_", name: "เมนูขนมปัง", order: 6 }
]

export async function loadMenu(){

const menu = await getMenu()

allMenu = menu || []

prepareCategories()

renderCategories()

renderMenu(allMenu)

}

function prepareCategories(){

const map = {}

allMenu.forEach(item => {

const categoryName = item.category_name || ""

CATEGORY_ORDER.forEach(cat => {

if(categoryName.startsWith(cat.key)){

if(!map[cat.name]){

map[cat.name] = {
id: cat.name,
name: cat.name,
order: cat.order
}

}

}

})

})

categories = Object.values(map).sort((a,b)=>a.order-b.order)

}

function renderCategories(){

const container = document.getElementById("categories")
if(!container) return

container.innerHTML=""

const allBtn = document.createElement("button")
allBtn.innerText = "ทั้งหมด"

allBtn.onclick = () => renderMenu(allMenu)

container.appendChild(allBtn)

categories.forEach(cat => {

const btn = document.createElement("button")

btn.innerText = cat.name

btn.onclick = () => {

const filtered = allMenu
.filter(i => {

const name = i.category_name || ""
return name.includes(cat.name)

})
.sort((a,b)=>a.name.localeCompare(b.name,"th"))

renderMenu(filtered)

}

container.appendChild(btn)

})

}

function renderMenu(menu){

const container = document.getElementById("menu")
if(!container) return

container.innerHTML=""

const sorted = [...menu].sort((a,b)=>{

const catA = CATEGORY_ORDER.find(c => (a.category_name||"").startsWith(c.key))?.order || 99
const catB = CATEGORY_ORDER.find(c => (b.category_name||"").startsWith(c.key))?.order || 99

if(catA !== catB){
return catA - catB
}

return a.name.localeCompare(b.name,"th")

})

sorted.forEach(item => {

const div = document.createElement("div")

div.className = "item"

div.innerHTML = `
<img src="${item.image || ""}">
<h3>${item.name}</h3>
<p>${item.price}</p>
<button>เพิ่ม</button>
`

div.querySelector("button").onclick = () => addToCart(item)

container.appendChild(div)

})

}
