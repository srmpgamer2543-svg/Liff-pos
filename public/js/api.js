export async function getMenu(){

 const res = await fetch("/api/get-menu?ts=" + Date.now())
 const data = await res.json()

 return data

}

export async function getCategories(){

 const res = await fetch("/api/get-categories?ts=" + Date.now())
 const data = await res.json()

 return data

}

export async function createOrder(order){

 const res = await fetch("/api/create-order",{
  method:"POST",
  headers:{
   "Content-Type":"application/json"
  },
  body:JSON.stringify(order)
 })

 return await res.json()

}

export async function createOrderItems(items){

 const res = await fetch("/api/create-order-items",{
  method:"POST",
  headers:{
   "Content-Type":"application/json"
  },
  body:JSON.stringify(items)
 })

 return await res.json()

}
