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
