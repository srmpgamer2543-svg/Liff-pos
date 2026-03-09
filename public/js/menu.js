import { getMenu } from "./api.js"
import { addToCart } from "./cart.js"

let allMenu=[]
let categories=[]

export async function loadMenu(){

 const menu=await getMenu()

 allMenu=menu || []

 prepareCategories()

 renderCategories()

 renderMenu(allMenu)

}


function prepareCategories(){

 const map={}

 allMenu.forEach(item=>{

  const cat=item.categories

  if(!cat) return

  const name=cat.name

  const order=parseInt(name.split("_")[0]) || 999

  if(!map[cat.id]){

   map[cat.id]={
    id:cat.id,
    name:name.replace(/^\d+_/,""),
    order:order
   }

  }

 })

 categories=Object.values(map).sort((a,b)=>a.order-b.order)

}


function renderCategories(){

 const container=document.getElementById("categories")

 if(!container) return

 container.innerHTML=""

 const allBtn=document.createElement("button")
 allBtn.className="cat-btn"
 allBtn.innerText="ทั้งหมด"

 allBtn.onclick=()=>renderMenu(allMenu)

 container.appendChild(allBtn)

 categories.forEach(cat=>{

  const btn=document.createElement("button")

  btn.className="cat-btn"

  btn.innerText=cat.name

  btn.onclick=()=>{

   const filtered=allMenu.filter(i=>i.category_id===cat.id)

   renderMenu(filtered)

  }

  container.appendChild(btn)

 })

}


function renderMenu(menu){

 const container=document.getElementById("menu")

 if(!container) return

 container.innerHTML=""

 const sorted=[...menu].sort((a,b)=>{

  const catA=a.categories?.name || ""
  const catB=b.categories?.name || ""

  const orderA=parseInt(catA.split("_")[0]) || 999
  const orderB=parseInt(catB.split("_")[0]) || 999

  if(orderA!==orderB){
   return orderA-orderB
  }

  return a.name.localeCompare(b.name,"th")

 })

 sorted.forEach(item=>{

  const div=document.createElement("div")

  div.className="item"

  div.innerHTML=`
  <img src="${item.image || ""}">
  <h3>${item.name}</h3>
  <p>${item.price}</p>
  <button>เพิ่ม</button>
  `

  div.querySelector("button").onclick=()=>addToCart(item)

  container.appendChild(div)

 })

}
