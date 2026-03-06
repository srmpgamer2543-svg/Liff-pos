import {state} from "./state.js"

export function renderCategory(){

let box = document.getElementById("category")

let cats = [...new Set(state.products.map(p=>p.category))]

box.innerHTML=""

cats.forEach(c=>{

let btn = document.createElement("button")

btn.innerText = c.replace(/^[0-9]+_/,"")

btn.onclick=()=>{

state.category=c

renderMenu()

}

box.appendChild(btn)

})

}

export function renderMenu(){

let menu = document.getElementById("menu")

let list = state.products

if(state.category){
list = list.filter(p=>p.category===state.category)
}

menu.innerHTML=""

list.forEach(p=>{

let card = document.createElement("div")
card.className="card"

card.innerHTML=`

<img src="${p.image_url||''}">

<div class="card-body">

<div>${p.name}</div>

<div class="price">${p.price} ฿</div>

</div>

`

menu.appendChild(card)

})

}
