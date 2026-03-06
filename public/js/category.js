export function renderCategories(categories){

const box=document.getElementById("category")

box.innerHTML=""

categories.forEach(c=>{

const btn=document.createElement("button")

btn.innerText=c.name

btn.onclick=()=>{

window.currentCategory=c.id
document.dispatchEvent(new Event("categoryChange"))

}

box.appendChild(btn)

})

}
