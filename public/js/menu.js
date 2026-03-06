import {state} from "./state.js"
import {openModal} from "./modal.js"

export function renderCategory(){

let el = document.getElementById("category")

let cats = [...new Set(state.products.map(p=>p.category))]

let html = ""

cats.forEach(c=>{

html+=`<button onclick="filterCategory('${c}')">${c.split("_")[1]}</button>`

})

el.innerHTML = html

}

export function renderMenu(products){

const menu = document.getElementById("menu")

menu.innerHTML=""

products.forEach(p=>{

const card = document.createElement("div")
card.className="menu-card"

card.innerHTML = `
<img src="${p.image_url || ''}">
<div class="menu-info">
<div class="menu-name">${p.name}</div>
<div class="menu-price">${p.price} ฿</div>
</div>
<button class="add-btn">+</button>
`

menu.appendChild(card)

})

}

window.filterCategory=(cat)=>{

let list = state.products.filter(p=>p.category==cat)

renderMenu(list)

}

window.openModal=openModal
