import { updateStickyCart } from "./sticky-cart.js"

let CART=[]

export { CART }

export function addToCart(item){

 CART.push(item)

 updateCart()

 updateStickyCart(CART)

}

export function updateCart(){

 const el=document.getElementById("cart-items")

 el.innerHTML=""

 CART.forEach(i=>{

  const div=document.createElement("div")

  let mods=""

if(i.modifiers){

 Object.values(i.modifiers).forEach(arr=>{
  mods += arr.join(", ") + " "
 })

}

div.innerText =
`${i.name}
${mods}
- ${i.price}`
  
el.appendChild(div)
})
}

export function getCart(){
 return CART
}

export function clearCart(){

 CART=[]

 updateCart()

 updateStickyCart(CART)

}

export function updateCartItem(index,newItem){

 CART[index] = newItem

 updateCart()

 updateStickyCart(CART)

}
