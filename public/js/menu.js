import { getMenu } from "./api.js"
import { addToCart } from "./cart.js"

let allMenu = []

export async function loadMenu(){

const menu = await getMenu()

allMenu = menu

renderCategories()

renderMenu(allMenu)

}

function renderCategories(){

const container = document.getElementById("categories")

if(!container) return

container.innerHTML=""

const cats = [...new Set(allMenu.map(i => i.category_id))]

const allBtn = document.createElement("button")
allBtn.innerText = "ทั้งหมด"

allBtn.onclick = () => renderMenu(allMenu)

container.appendChild(allBtn)

cats.forEach(cat => {

const btn = document.createElement("button")

btn.innerText = cat

btn.onclick = () => {

const filtered = allMenu.filter(i => i.category_id === cat)

renderMenu(filtered)

}

container.appendChild(btn)

})

}

function renderMenu(menu){

const container = document.getElementById("menu")

container.innerHTML=""

menu.forEach(item=>{

const div=document.createElement("div")

div.className="item"

div.innerHTML=`

<img src="${item.image || ""}">
<h3>${item.name}</h3>
<p>${item.price}</p>
<button>add</button>

`

div.querySelector("button").onclick = () => addToCart(item)

container.appendChild(div)

})

}
