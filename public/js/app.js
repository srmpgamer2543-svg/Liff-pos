import {state} from "./state.js"
import {getProducts} from "./api.js"
import {sortProducts} from "./utils.js"
import {renderMenu} from "./menu.js"

async function init(){

try{

await liff.init({
liffId:"2009308319-2r1OXrGI"
})

if(!liff.isLoggedIn()){
liff.login()
return
}

let data = await getProducts()

state.products = sortProducts(data)

renderMenu()

}catch(e){

console.error(e)

alert("โหลดเมนูไม่สำเร็จ")

}

}

init()
