export function sortProducts(products){

return products.sort((a,b)=>{

let ca = a.category || ""
let cb = b.category || ""

let na = parseInt(ca.split("_")[0])
let nb = parseInt(cb.split("_")[0])

return na - nb

})

}
