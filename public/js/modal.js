import {state} from "./state.js"
import {updateFloating} from "./cart.js"

export function openModal(id){

let p = state.products.find(x=>x.id==id)

state.currentProduct = p

let html = `
<div class="modal-content">

<h3>${p.name}</h3>

<button onclick="addToCart()">เพิ่มลงตะกร้า</button>

</div>
`

let modal = document.getElementById("modal")

modal.innerHTML = html
modal.classList.add("show")

}

export function addToCart(){

let p = state.currentProduct

state.cart.push({
name:p.name,
price:p.price,
qty:1,
modifiers:[]
})

document.getElementById("modal").classList.remove("show")

updateFloating()

}

window.addToCart=addToCart
