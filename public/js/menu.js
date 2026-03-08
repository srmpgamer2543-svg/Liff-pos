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

function prepareCategories(){

const map = {}

allMenu.forEach(item => {

const rawName = item.category_name || item.category_id || "อื่นๆ"

let order = 999
let name = rawName

if(rawName.includes("_")){
const parts = rawName.split("_")
order = parseInt(parts[0]) || 999
name = parts.slice(1).join("_")
}

if(!map[rawName]){
map[rawName] = {
id: rawName,
name: name,
order: order
}
}

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

const rawName = i.category_name || i.category_id

return rawName === cat.id

})

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

const getOrder = (item) => {

const raw = item.category_name || item.category_id || ""

if(raw.includes("_")){
return parseInt(raw.split("_")[0]) || 999
}

return 999

}

const orderA = getOrder(a)
const orderB = getOrder(b)

if(orderA !== orderB){
return orderA - orderB
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
<button>add</button>
`

div.querySelector("button").onclick = () => addToCart(item)

container.appendChild(div)

})

}
