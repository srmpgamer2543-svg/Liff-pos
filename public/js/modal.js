import {state} from "./state.js"
import {sortModifiers} from "./utils.js"
import {updateFloating} from "./cart.js"

export function openProduct(id){

let p=state.products.find(x=>x.id==id)
state.currentProduct=p

let mods=sortModifiers([...p.modifiers])

let html=`<div class="modal-content" onclick="event.stopPropagation()">`
html+=`<h3>${p.name}</h3>`

mods.forEach(m=>{

html+=`<h4>${m.name}</h4>`

m.options.forEach(o=>{

if(m.name.includes('ท้อปปิ้ง')){

html+=`
<label class="option">
<input type="checkbox" value="${o.id}" data-price="${o.price||0}">
${o.name} ${o.price?`(+${o.price})`:''}
</label>
`

}else{

html+=`
<label class="option">
<input type="radio" name="${m.id}" value="${o.id}" data-price="${o.price||0}">
${o.name} ${o.price?`(+${o.price})`:''}
</label>
`

}

})

})

html+=`<button onclick="addCart()">เพิ่มลงตะกร้า</button>`
html+=`</div>`

let modal=document.getElementById('modal')
modal.innerHTML=html
modal.classList.add('show')

modal.onclick=function(){
modal.classList.remove('show')
}

}

export function addCart(){

let modifiers=[]
let extra=0

document.querySelectorAll(".modal-content input:checked").forEach(i=>{

let price=parseInt(i.dataset.price)||0

modifiers.push({
name:i.parentElement.innerText.trim(),
price:price
})

extra+=price

})

let item={
name:state.currentProduct.name,
price:state.currentProduct.price,
modifiers:modifiers,
qty:1
}

state.cart.push(item)

updateFloating()

document.getElementById('modal').classList.remove('show')

}

window.openProduct=openProduct
window.addCart=addCart
