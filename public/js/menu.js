export async function loadMenu(){

const res = await fetch("/api/products")
const items = await res.json()

const menu = document.getElementById("menu")

menu.innerHTML=""

items.forEach(item=>{

const card = document.createElement("div")
card.className="card"

card.innerHTML = `
<img src="${item.image_url || ''}">
<div class="card-body">
<div>${item.name}</div>
<div class="price">${item.price} ฿</div>
</div>
`

menu.appendChild(card)

})

}
