import {state} from "./state.js"
import {getProducts} from "./api.js"
import {sortProducts} from "./utils.js"
import {renderCategory,renderMenu} from "./menu.js"

async function init(){

try{

await liff.init({
liffId:"2009308319-2r1OXrGI"
})

let data = await getProducts()

data = data.map(p=>{
if(!p.category) p.category="999_อื่นๆ"
return p
})

state.products = sortProducts(data)

renderCategory()
renderMenu(state.products)

}catch(e){

console.error(e)
alert("โหลดเมนูไม่สำเร็จ")

}

}

init()
