export function sortProducts(items){

return items.sort((a,b)=>{

const ca = a.category || ""
const cb = b.category || ""

return ca.localeCompare(cb)

})

}
