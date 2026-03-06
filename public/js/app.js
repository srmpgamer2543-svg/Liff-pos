let products=[]
let cart=[]
let currentProduct=null

function cleanCategory(name){
if(!name) return "อื่นๆ"
return name.replace(/^\d+_/,'')
}

function sortCategory(a,b){
let na=parseInt(a.split('_')[0])||999
let nb=parseInt(b.split('_')[0])||999
return na-nb
}

function sortProducts(list){
return list.sort((a,b)=>{
let ca=parseInt(a.category?.split('_')[0])||999
let cb=parseInt(b.category?.split('_')[0])||999
if(ca!==cb) return ca-cb
return a.name.localeCompare(b.name)
})
}

function sortModifiers(mods){

let order=["เย็น","ปั่น","หวาน","ท้อปปิ้ง"]

return mods.sort((a,b)=>{

let ai=order.findIndex(o=>a.name.includes(o))
let bi=order.findIndex(o=>b.name.includes(o))

if(ai==-1) ai=99
if(bi==-1) bi=99

return ai-bi

})

}

async function init(){

try{

await liff.init({liffId:"2009308319-2r1OXrGI"})

let res=await fetch('/api/products')
products=await res.json()

products=products.map(p=>{
if(!p.category)p.category="999_อื่นๆ"
return p
})

products=sortProducts(products)

renderCategory()
renderMenu(products)

}catch(e){

alert("โหลดเมนูไม่สำเร็จ")

}

}

function renderCategory(){

let cats=[...new Set(products.map(p=>p.category))]
cats.sort(sortCategory)

let html='<button onclick="renderMenu(products)">All</button>'

cats.forEach(c=>{
html+=`<button onclick="filterCat('${c}')">${cleanCategory(c)}</button>`
})

document.getElementById('category').innerHTML=html

}

function filterCat(c){
let list=products.filter(p=>p.category==c)
renderMenu(list)
}

function renderMenu(items){

let html=''

items.forEach(p=>{

html+=`
<div class="card" onclick="openProduct('${p.id}')">

<div class="card-img">
<img src="${p.image_url||''}">
<div class="add-btn">+</div>
</div>

<div class="card-body">
<div class="name">${p.name}</div>
<div class="price">${p.price} ฿</div>
</div>

</div>
`

})

document.getElementById('menu').innerHTML=html

}

function openProduct(id){

let p=products.find(x=>x.id==id)
currentProduct=p

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

function addCart(){

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
name:currentProduct.name,
price:currentProduct.price,
modifiers:modifiers,
qty:1
}

cart.push(item)

updateFloating()

document.getElementById('modal').classList.remove('show')

}

function updateFloating(){

let total=0

cart.forEach(c=>{
let mod=0
c.modifiers.forEach(m=>mod+=m.price)
total+=(c.price+mod)*(c.qty||1)
})

document.getElementById('floatingTotal').innerText=total
document.getElementById('floatingCart').style.display="block"

}

function openCart(){

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

function increaseQty(i){
cart[i].qty++
openCart()
updateFloating()
}

function decreaseQty(i){

if(cart[i].qty>1){
cart[i].qty--
}else{
cart.splice(i,1)
}

openCart()
updateFloating()

}

function removeItem(i){
cart.splice(i,1)
openCart()
updateFloating()
}

async function sendOrder(){

await fetch('/api/order',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify(cart)
})

alert("Order sent")

}

init()
