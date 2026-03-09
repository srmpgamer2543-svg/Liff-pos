import { addToCart } from "./cart.js"
import { getMenu, getCategories } from "./api.js"

let fullMenu=[]

export async function loadMenu(){

const menu=await getMenu()
const categories=await getCategories()

const menuContainer=document.getElementById("menu")
const categoryContainer=document.getElementById("categories")

if(!menuContainer||!categoryContainer)return

menuContainer.innerHTML=""
categoryContainer.innerHTML=""

const categoryMap={}

categories.forEach(c=>{

categoryMap[c.id]={
name:c.name,
items:[]
}

})

menu.forEach(item=>{

if(categoryMap[item.category_id]){
categoryMap[item.category_id].items.push(item)
}

})

const sortedCategories=Object.values(categoryMap)

sortedCategories.forEach(cat=>{

const btn=document.createElement("button")
btn.className="cat-btn"

btn.innerText=cat.name.replace(/^\d+_/,"")

btn.onclick=()=>renderMenu(cat.items)

categoryContainer.appendChild(btn)

})

fullMenu=menu

renderMenu(menu)

}

function renderMenu(list){

const menuContainer=document.getElementById("menu")

menuContainer.innerHTML=""

list.forEach(item=>{

const card=document.createElement("div")
card.className="item"

card.innerHTML=`

<img src="${item.image||""}">

<div class="item-info">
<div class="item-name">${item.name}</div>
<div class="item-price">${item.price} ฿</div>
</div>

<button class="add-btn">+</button>

`

card.onclick=()=>openModifierUI(item)

menuContainer.appendChild(card)

})

}

function openModifierUI(item){

const html=`

<div class="mod-group">

<div class="mod-title">เลือกประเภท</div>

<label class="mod-option">
<input type="radio" name="temp" value="เย็น"> เย็น
</label>

<label class="mod-option">
<input type="radio" name="temp" value="ปั่น"> ปั่น
</label>

</div>

<div class="mod-group">

<div class="mod-title">ระดับความหวาน</div>

<label class="mod-option"><input type="radio" name="sweet" value="100%">100%</label>
<label class="mod-option"><input type="radio" name="sweet" value="50%">50%</label>
<label class="mod-option"><input type="radio" name="sweet" value="25%">25%</label>

</div>

<div class="mod-group">

<div class="mod-title">ท็อปปิ้ง</div>

<label class="mod-option"><input type="checkbox" value="ไข่มุก">ไข่มุก</label>
<label class="mod-option"><input type="checkbox" value="วิปครีม">วิปครีม</label>

</div>

<button class="confirm-btn">เพิ่มลงตะกร้า</button>

`

window.openModifier(html)

setTimeout(()=>{

document.querySelector(".confirm-btn").onclick=()=>{

addToCart(item)

window.closeModifier()

}

},50)

}
