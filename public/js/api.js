export async function getProducts(){

const res = await fetch("/api/products")

if(!res.ok){
throw new Error("โหลดสินค้าไม่ได้")
}

return await res.json()

}
