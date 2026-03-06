export async function getProducts(){

let res = await fetch("/api/products")

if(!res.ok) throw new Error("API ERROR")

return await res.json()

}
