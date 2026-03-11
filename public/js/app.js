import { loadMenu } from "./menu.js"
import { toggleCart } from "./ui.js"

window.toggleCart = toggleCart

document.addEventListener("DOMContentLoaded",()=>{

 loadMenu()

})
