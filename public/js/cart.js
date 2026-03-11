let cart=[]

export function addToCart(item){

cart.push(item)

updateCart()

updateStickyCart(cart)

}

export function updateCart(){

const el=document.getElementById("cart-items")

el.innerHTML=""

cart.forEach(i=>{

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

return cart

}

export function clearCart(){

cart=[]

updateCart()

updateStickyCart(cart)

}
