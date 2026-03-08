import { getMenu } from "./api.js"
import { addToCart } from "./cart.js"

export async function loadMenu(){

const menu = await getMenu()

const container = document.getElementById("menu")

container.innerHTML=""

menu.forEach(item=>{

const div=document.createElement("div")

div.className="item"

div.innerHTML=`

<img src="${item.image || ""}">
<h3>${item.name}</h3>
<p>${item.price}</p>
<button>add</button>

`

div.querySelector("button").onclick=()=>addToCart(item)

container.appendChild(div)

})

}
