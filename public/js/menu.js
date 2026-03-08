import { getMenu } from "./api.js"
import { addToCart } from "./cart.js"

let allMenu = []
let categories = []

export async function loadMenu(){

const menu = await getMenu()

allMenu = menu || []

prepareCategories()

renderCategories()

renderMenu(allMenu)

}

/* เตรียมหมวดหมู่จาก category_name */

function prepareCategories(){

const map = {}

allMenu.forEach(item => {

if(!item.category_name) return

const parts = item.category_name.split("_")

const order = parseInt(parts[0]) || 99
const name = parts.slice(1).join("_") || item.category_name

if(!map[item.category_name]){

map[item.category_name] = {
id: item.category_name,
name: name,
order: order
}

}

})

categories = Object.values(map).sort((a,b)=>a.order-b.order)

}

/* สร้างปุ่มหมวด */

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

const filtered = allMenu.filter(i => i.category_name === cat.id)

renderMenu(filtered)

}

container.appendChild(btn)

})

}

/* แสดงเมนู */

function renderMenu(menu){

const container=document.getElementById("menu")
if(!container) return

container.innerHTML=""

const sorted=[...menu].sort((a,b)=>{

const orderA=parseInt((a.category_name||"").split("_")[0]) || 99
const orderB=parseInt((b.category_name||"").split("_")[0]) || 99

if(orderA!==orderB){
return orderA-orderB
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
