import {addToCart} from "./cart.js"

export function renderMenu(items){

const menu=document.getElementById("menu")

menu.innerHTML=""

items
.filter(i=>!window.currentCategory || i.category_id===window.currentCategory)
.forEach(i=>{

const card=document.createElement("div")

card.className="menu-card"

card.innerHTML=`

<div class="name">${i.item_name}</div>
<div class="price">${i.price} ฿</div>

`

card.onclick=()=>addToCart(i)

menu.appendChild(card)

})

}
