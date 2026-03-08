import { getMenu } from "./api.js"
import { addToCart } from "./cart.js"

let allMenu = []
let categories = []

/* map category_id -> ชื่อหมวด + ลำดับ */
const CATEGORY_MAP = {
"9cecdcb1-bb21-45d2-b6f1-4533e8338651": {name:"เมนูชา",order:1},
"93e0c7e4-3886-4e66-81f9-b150dc50c52": {name:"เมนูนมสด",order:2},
"743fa003-80ff-43e7-8d0b-e3f10bb09d43": {name:"เมนูผลไม้",order:3},
"cd9b8034-ea70-4bb2-b8c6-73b48dfda916": {name:"เมนูโซดา",order:4},
"938355b2-ec44-4dd4-bb08-ef7c5affbd5b": {name:"เมนูปังเย็น",order:5},
"3f2f494d-b4c6-4f41-be7f-ad2b3b55086d": {name:"เมนูขนมปัง",order:6}
}

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

const cat = CATEGORY_MAP[item.category_id]

if(!cat) return

if(!map[item.category_id]){

map[item.category_id] = {
id:item.category_id,
name:cat.name,
order:cat.order
}

}

})

categories = Object.values(map).sort((a,b)=>a.order-b.order)

}

function renderCategories(){

const container = document.getElementById("categories")
if(!container) return

container.innerHTML=""

const allBtn=document.createElement("button")
allBtn.innerText="ทั้งหมด"
allBtn.onclick=()=>renderMenu(allMenu)

container.appendChild(allBtn)

categories.forEach(cat=>{

const btn=document.createElement("button")

btn.innerText=cat.name

btn.onclick=()=>{

const filtered=allMenu
.filter(i=>i.category_id===cat.id)

renderMenu(filtered)

}

container.appendChild(btn)

})

}

function renderMenu(menu){

const container=document.getElementById("menu")
if(!container) return

container.innerHTML=""

const sorted=[...menu].sort((a,b)=>{

const catA=CATEGORY_MAP[a.category_id]?.order || 99
const catB=CATEGORY_MAP[b.category_id]?.order || 99

if(catA!==catB){
return catA-catB
}

return a.name.localeCompare(b.name,"th")

})

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
