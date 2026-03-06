import {state} from "./state.js"
import {getProducts} from "./api.js"
import {sortProducts} from "./utils.js"
import {renderCategory,renderMenu} from "./menu.js"

async function init(){

console.log("APP START")

try{

await liff.init({
liffId:"2009308319-2r1OXrGI"
})

console.log("LIFF READY")

let data = await getProducts()

console.log("API READY",data.length)

data = data.map(p=>{
if(!p.category) p.category="999_อื่นๆ"
return p
})

state.products = sortProducts(data)

renderCategory()

renderMenu()

console.log("RENDER DONE")

}catch(e){

console.error(e)

alert("โหลดเมนูไม่สำเร็จ")

}

}

init()
