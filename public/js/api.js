let menuCache=null
let categoriesCache=null

export async function getMenu(){

 if(menuCache){
  return menuCache
 }

 const res = await fetch("/api/get-menu")
 const data = await res.json()

 menuCache=data

 return data

}

export async function getCategories(){

 if(categoriesCache){
  return categoriesCache
 }

 const res = await fetch("/api/get-categories")
 const data = await res.json()

 categoriesCache=data

 return data

}
