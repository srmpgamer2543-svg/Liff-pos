export async function getProducts(){

let res = await fetch('/api/products')

return res.json()

}

export async function sendOrder(data){

let res = await fetch('/api/order',{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(data)

})

return res.json()

}
