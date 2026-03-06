import {state} from "./state.js"
import {sortModifiers} from "./utils.js"
import {addCart} from "./cart.js"

export function openProduct(id){

let p = state.products.find(x=>x.id==id)

state.currentProduct = p

let mods = sortModifiers([...p.modifiers])

let html=`<div class="modal-content">`

html+=`<h3>${p.name}</h3>`

mods.forEach(m=>{

html+=`<div class="modifier-group">`
html+=`<h4>${m.name}</h4>`
html+=`<div class="modifier-grid">`

m.options.forEach(o=>{

if(m.name.includes('ท้อปปิ้ง')){

html+=`
<label class="option">
<input type="checkbox" value="${o.id}">
${o.name}
</label>`

}else{

html+=`
<label class="option">
<input type="radio" name="${m.id}" value="${o.id}">
${o.name}
</label>`

}

})

html+=`</div></div>`

})

html+=`<button id="addCartBtn">เพิ่มลงตะกร้า</button>`
html+=`</div>`

let modal=document.getElementById("modal")

modal.innerHTML=html
modal.classList.add("show")

modal.onclick=()=>{
modal.classList.remove("show")
}

document.querySelector(".modal-content").onclick=(e)=>{
e.stopPropagation()
}

document.getElementById("addCartBtn").onclick=addCart

}
