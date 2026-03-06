export async function getProducts(){

let res = await fetch('/api/products')

if(!res.ok){
throw new Error("โหลดสินค้าไม่สำเร็จ")
}

return await res.json()

}



export async function sendOrder(cart){

await fetch('/api/order',{
method:'POST',
headers:{
'Content-Type':'application/json'
},
body:JSON.stringify(cart)
})

}
