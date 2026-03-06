import {state} from "./state.js"
import {updateFloating} from "./cart.js"

export function openModal(id){

let p = state.products.find(x=>x.id==id)

state.currentProduct = p

let html = `<div class="modal-content">`

html += `<h3>${p.name}</h3>`

if(p.modifiers){

p.modifiers.forEach(g=>{

html += `<div class="modifier-group">`
html += `<h4>${g.name}</h4>`

g.options.forEach(o=>{

let type = g.name.includes("ท้อป") ? "checkbox" : "radio"

html += `

<label>

<input type="${type}" name="${g.id}" value="${o.id}" data-price="${o.price}">

${o.name} (+${o.price})

</label>

`

})

html += `</div>`

})

}

html += `

<button onclick="addToCart()">เพิ่มลงตะกร้า</button>

</div>
`

let modal=document.getElementById("modal")

modal.innerHTML=html
modal.classList.add("show")

}

export function addToCart(){

let p = state.currentProduct

let selected=[]

document.querySelectorAll("#modal input:checked").forEach(i=>{

selected.push({

id:i.value,
name:i.parentElement.innerText,
price:Number(i.dataset.price)

})

})

state.cart.push({

name:p.name,
price:p.price,
qty:1,
modifiers:selected

})

document.getElementById("modal").classList.remove("show")

updateFloating()

}

window.addToCart=addToCart
