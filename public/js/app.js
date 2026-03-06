import {getCategories,getItems} from "./api.js"
import {renderCategories} from "./category.js"
import {renderMenu} from "./menu.js"

let items=[]

async function start(){

const categories=await getCategories()

items=await getItems()

renderCategories(categories)

renderMenu(items)

document.addEventListener("categoryChange",()=>{

renderMenu(items)

})

}

start()
