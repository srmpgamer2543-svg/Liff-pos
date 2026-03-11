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

  div.innerText=
  `${i.name}
  ${i.type||""}
  ${i.sweet||""}
  ${i.toppings?.join(",")||""}
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
