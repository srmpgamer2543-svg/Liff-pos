import {products} from "./state.js"
import {sortProducts} from "./utils.js"
import {renderCategory,renderMenu} from "./menu.js"

async function init(){

try{

await liff.init({liffId:"2009308319-2r1OXrGI"})

let res=await fetch('/api/products')
products=await res.json()

products=products.map(p=>{
if(!p.category)p.category="999_อื่นๆ"
return p
})

products=sortProducts(products)

renderCategory()
renderMenu(products)

}catch(e){

alert("โหลดเมนูไม่สำเร็จ")

}

}

init()
