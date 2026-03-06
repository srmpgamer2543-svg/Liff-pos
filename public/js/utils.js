export function cleanCategory(name){

if(!name) return "อื่นๆ"

return name.replace(/^\d+_/,'')
}



export function sortCategory(a,b){

let na=parseInt(a.split('_')[0])||999
let nb=parseInt(b.split('_')[0])||999

return na-nb

}



export function sortProducts(list){

return list.sort((a,b)=>{

let ca=parseInt(a.category?.split('_')[0])||999
let cb=parseInt(b.category?.split('_')[0])||999

if(ca!==cb) return ca-cb

return a.name.localeCompare(b.name)

})

}
