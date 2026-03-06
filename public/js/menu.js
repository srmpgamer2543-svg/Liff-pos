import {state} from "./state.js"
import {openProduct} from "./modal.js"

export function renderCategory(){

let cats=[...new Set(state.products.map(p=>p.category))]

let html=`<button onclick="filterMenu('all')" class="active">All</button>`

cats.forEach(c=>{
html+=`<button onclick="filterMenu('${c}')">${c.replace(/^[0-9]+_/,'')}</button>`
})

document.getElementById("category").innerHTML=html

}

export function filterMenu(cat){

let buttons=document.querySelectorAll("#category button")

buttons.forEach(b=>b.classList.remove("active"))
event.target.classList.add("active")

if(cat=="all"){
renderMenu(state.products)
}else{
renderMenu(state.products.filter(p=>p.category==cat))
}

}

export function renderMenu(list){

let html=""

list.forEach(p=>{

html+=`

<div class="card" onclick="openProduct('${p.id}')">

<div class="imgbox">

<img src="${p.image_url||'/logo.png'}">

<div class="add">+</div>

</div>

<div class="card-body">

<div class="name">${p.name}</div>
<div class="price">${p.price} ฿</div>

</div>

</div>

`

})

document.getElementById("menu").innerHTML=html

}

window.filterMenu=filterMenu
window.openProduct=openProduct
