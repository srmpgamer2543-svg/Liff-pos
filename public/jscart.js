import {cart} from "./state.js"
import {sendOrder} from "./api.js"

export function updateFloating(){

let total=0

cart.forEach(c=>{
let mod=0
c.modifiers.forEach(m=>mod+=m.price)
total+=(c.price+mod)*(c.qty||1)
})

document.getElementById('floatingTotal').innerText=total
document.getElementById('floatingCart').style.display="block"

}

export function openCart(){

let html=`<div class="modal-content" onclick="event.stopPropagation()">`

html+=`<h3>Cart</h3>`

let total=0

cart.forEach((c,i)=>{

let modPrice=0

let modText=c.modifiers.map(m=>{
modPrice+=m.price
return `${m.name}`
}).join(', ')

let itemPrice=(c.price+modPrice)*(c.qty||1)
total+=itemPrice

html+=`

<div style="border-bottom:1px solid #eee;padding:10px 0">

<div style="font-weight:bold">${c.name}</div>
<div style="font-size:24px;color:#777">${modText}</div>
<div>${itemPrice} ฿</div>

<div>

<button onclick="decreaseQty(${i})">-</button>
${c.qty}
<button onclick="increaseQty(${i})">+</button>

<button onclick="removeItem(${i})">ลบ</button>

</div>

</div>

`

})

html+=`

<div style="font-size:36px;font-weight:bold">
รวม ${total} ฿
</div>

<button onclick="sendOrder()">Order</button>

</div>
`

let modal=document.getElementById('modal')
modal.innerHTML=html
modal.classList.add('show')

}

export function increaseQty(i){
cart[i].qty++
openCart()
updateFloating()
}

export function decreaseQty(i){

if(cart[i].qty>1){
cart[i].qty--
}else{
cart.splice(i,1)
}

openCart()
updateFloating()

}

export function removeItem(i){
cart.splice(i,1)
openCart()
updateFloating()
}

window.openCart=openCart
window.increaseQty=increaseQty
window.decreaseQty=decreaseQty
window.removeItem=removeItem
