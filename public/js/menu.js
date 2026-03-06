import {state} from "./state.js"
import {cleanCategory,sortCategory} from "./utils.js"
import {openProduct} from "./modal.js"

export function renderCategory(){

let cats=[...new Set(state.products.map(p=>p.category))]
cats.sort(sortCategory)

let html='<button onclick="renderMenu(state.products)">All</button>'

cats.forEach(c=>{
html+=`<button onclick="filterCat('${c}')">${cleanCategory(c)}</button>`
})

document.getElementById('category').innerHTML=html

}

export function filterCat(c){
let list=state.products.filter(p=>p.category==c)
renderMenu(list)
}

export function renderMenu(items){

let html=''

items.forEach(p=>{

html+=`
<div class="card" onclick="openProduct('${p.id}')">

<div class="card-img">
<img src="${p.image_url||''}">
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

}

window.renderMenu = renderMenu
window.filterCat = filterCat
