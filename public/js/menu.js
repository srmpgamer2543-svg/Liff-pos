import {state} from "./state.js"
import {cleanCategory,sortCategory,sortProducts} from "./utils.js"
import {openProduct} from "./modal.js"

export function renderCategory(){

let cats=[...new Set(state.products.map(p=>p.category).filter(Boolean))]

cats.sort(sortCategory)

let html='<button id="allBtn">All</button>'

cats.forEach(c=>{
html+=`<button data-cat="${c}">${cleanCategory(c)}</button>`
})

document.getElementById('category').innerHTML=html

document.getElementById("allBtn").onclick=()=>{
renderMenu(state.products)
}

document.querySelectorAll("[data-cat]").forEach(btn=>{
btn.onclick=()=>{
let c=btn.dataset.cat
let list=state.products.filter(p=>p.category==c)
renderMenu(sortProducts(list))
}
})

}

export function renderMenu(items){

let html=''

items.forEach(p=>{

html+=`

<div class="card" data-id="${p.id}">

<div class="card-img">
<img src="${p.image_url || ''}">
<div class="add-btn">+</div>
</div>

<div class="card-body">
<div class="name">${p.name}</div>
<div class="price">${p.price} ฿</div>
</div>

</div>

`

})

document.getElementById('menu').innerHTML=html

document.querySelectorAll(".card").forEach(c=>{
c.onclick=()=>{
openProduct(c.dataset.id)
}
})

}
