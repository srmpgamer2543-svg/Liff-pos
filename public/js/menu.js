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

if(!map[item.category_id]){

map[item.category_id] = {
id: item.category_id,
name: item.category_name || item.category_id,
order: item.category_order || 0
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
.filter(i => i.category_id === cat.id)
.sort((a,b)=>a.name.localeCompare(b.name))

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

if(a.category_order !== b.category_order){
return (a.category_order||0) - (b.category_order||0)
}

return a.name.localeCompare(b.name)

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
