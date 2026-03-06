import {state} from "./state.js"
import {openProduct} from "./modal.js"

export function renderMenu(){

const menu = document.getElementById("menu")

menu.innerHTML=""

state.products.forEach(p=>{

const card = document.createElement("div")
card.className="card"

card.innerHTML=`

<div style="position:relative">

<img src="${p.image_url || ''}">

<div class="add" data-id="${p.id}">+</div>

</div>

<div class="card-body">

<div>${p.name}</div>

<div class="price">${p.price} ฿</div>

</div>

`

card.querySelector(".add").onclick = () => openProduct(p)

menu.appendChild(card)

})

}
