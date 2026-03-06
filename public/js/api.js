export async function getProducts(){

let res = await fetch('/api/products')
return await res.json()

}

export async function sendOrder(cart){

await fetch('/api/order',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify(cart)
})

}
