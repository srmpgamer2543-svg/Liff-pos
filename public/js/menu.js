export function renderMenu(products){

const menu = document.getElementById("menu")

menu.innerHTML=""

products.forEach(p=>{

const card=document.createElement("div")
card.className="menu-card"

card.innerHTML=`

<img src="${p.image_url || ''}">

<div class="menu-info">

<div class="menu-name">
${p.name}
</div>

<div class="menu-price">
${p.price} ฿
</div>

</div>

<button class="add-btn" onclick="openProduct('${p.id}')">+</button>

`

menu.appendChild(card)

})

}
