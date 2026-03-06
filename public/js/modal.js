import {state} from "./state.js"
import {addCart} from "./cart.js"

export function openProduct(id){

const p = state.products.find(x=>x.id==id)

state.currentProduct = p

const modal = document.getElementById("modal")

let html = `<h3>${p.name}</h3>`

if(p.modifiers){

p.modifiers.forEach(m=>{

html+=`<h4>${m.name}</h4>`

m.options.forEach(o=>{

html+=`
<label>

<input type="checkbox"
value="${o.name}"
data-price="${o.price||0}">

${o.name}
${o.price?`(+${o.price})`:''}

</label>
<br>
`

})

})

}

html+=`<button id="addCartBtn">เพิ่มลงตะกร้า</button>`

modal.innerHTML=html

modal.classList.add("show")

document.getElementById("addCartBtn").onclick=addCart

}
