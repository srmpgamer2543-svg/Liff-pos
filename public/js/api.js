import {cart} from "./state.js"

export async function sendOrder(){

await fetch('/api/order',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify(cart)
})

alert("Order sent")

}

window.sendOrder=sendOrder
