export default async function handler(req,res){

const token = process.env.LOYVERSE_API_KEY

const headers = {
Authorization:`Bearer ${token}`
}

const [itemsRes,modsRes,catRes] = await Promise.all([

fetch("https://api.loyverse.com/v1.0/items",{headers}),
fetch("https://api.loyverse.com/v1.0/modifier_groups",{headers}),
fetch("https://api.loyverse.com/v1.0/categories",{headers})

])

const itemsData = await itemsRes.json()
const modsData = await modsRes.json()
const catData = await catRes.json()

const categories = {}
catData.categories.forEach(c=>{
categories[c.id]=c.name
})

const modifierGroups = {}
modsData.modifier_groups.forEach(g=>{
modifierGroups[g.id]=g
})

const products = itemsData.items.map(item=>{

const variant = item.variants?.[0]

const modifiers = (item.modifier_groups || []).map(gid=>{

const g = modifierGroups[gid]

if(!g) return null

return {

id:g.id,
name:g.name,

options:g.modifiers.map(m=>({

id:m.id,
name:m.name,
price:m.price/100

}))

}

}).filter(Boolean)

return {

id:item.id,
name:item.item_name,

price: variant ? variant.price/100 : 0,

image_url:item.image_url,

category_id:item.category_id,

category_name: categories[item.category_id] || "อื่นๆ",

modifiers

}

})

res.status(200).json(products)

}
