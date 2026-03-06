export function cleanCategory(name){
if(!name) return "อื่นๆ"
return name.replace(/^\d+_/,'')
}

export function sortCategory(a,b){

let na=parseInt((a||"999").split('_')[0])
let nb=parseInt((b||"999").split('_')[0])

if(isNaN(na)) na=999
if(isNaN(nb)) nb=999

return na-nb

}

export function sortProducts(list){

return list.sort((a,b)=>{

let ca = a.category ? parseInt(a.category.split('_')[0]) : 999
let cb = b.category ? parseInt(b.category.split('_')[0]) : 999

if(isNaN(ca)) ca=999
if(isNaN(cb)) cb=999

if(ca!==cb) return ca-cb

return (a.name || "").localeCompare(b.name || "")

})

}

export function sortModifiers(mods){

let order = ["เย็น","ปั่น","หวาน","ท้อปปิ้ง"]

return mods.sort((a,b)=>{

let ai = order.findIndex(o=>a.name.includes(o))
let bi = order.findIndex(o=>b.name.includes(o))

if(ai==-1) ai=99
if(bi==-1) bi=99

return ai-bi

})

}
