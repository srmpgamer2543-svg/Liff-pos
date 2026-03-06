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

export function renderMenu(list){

let el = document.getElementById("menu")

let html = ""

list.forEach(p=>{

html+=`

<div class="card" onclick="openModal('${p.id}')">

<img src="${p.image_url||''}">

<div class="name">${p.name}</div>

<div class="price">${p.price} ฿</div>

</div>

`

})

el.innerHTML = html

}

window.filterCategory=(cat)=>{

let list = state.products.filter(p=>p.category==cat)

renderMenu(list)

}

window.openModal=openModal
