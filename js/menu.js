let cart = []
let menuData = []

async function loadMenu(){

try{

const res = await fetch("/api/menu")
menuData = await res.json()

renderCategories()
renderMenu(menuData)

}catch(e){

console.log("menu load error",e)

}

}

function renderMenu(data){

const el = document.getElementById("menu")
el.innerHTML=""

data.forEach((item,index)=>{

el.innerHTML += `
<div class="item">

<img src="${item.image || 'https://via.placeholder.com/90'}">

<div class="item-info">

<div class="item-name">${item.name}</div>

<div class="item-price">฿${item.price}</div>

<button class="add-btn" onclick="addCart(${index})">+</button>

</div>

</div>
`

})

}

function renderCategories(){

const cats = [...new Set(menuData.map(i=>i.category_name))]

const el = document.getElementById("categories")

el.innerHTML=""

cats.forEach(cat=>{

el.innerHTML += `
<div class="cat" onclick="filterCategory('${cat}')">
${cat}
</div>
`

})

}

function filterCategory(cat){

const filtered = menuData.filter(i=>i.category_name===cat)

renderMenu(filtered)

}

function addCart(index){

const item = menuData[index]

cart.push(item)

updateCart()

}

function updateCart(){

document.getElementById("cart").innerText =
`ดูตะกร้า (${cart.length})`

}

loadMenu()
