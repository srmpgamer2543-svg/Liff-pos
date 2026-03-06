export function sortProducts(data){

return data.sort((a,b)=>{

let ca = a.category || ""
let cb = b.category || ""

let na = parseInt(ca.split("_")[0]) || 999
let nb = parseInt(cb.split("_")[0]) || 999

return na-nb

})

}
