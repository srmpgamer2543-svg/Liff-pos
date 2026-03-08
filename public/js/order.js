import { getCart, clearCart } from "./cart.js"

export async function checkout(){

const cart=getCart()

if(cart.length===0){

alert("cart empty")

return

}

await fetch("/api/create-order",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({items:cart})

})

clearCart()

alert("order sent")

}
