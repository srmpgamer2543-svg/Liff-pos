export default async function handler(req, res) {

const token = process.env.LOYVERSE_API_KEY

const response = await fetch(
"https://api.loyverse.com/v1.0/items",
{
headers:{
Authorization:`Bearer ${token}`
}
})

const data = await response.json()

const products = data.items.map(item => ({

id: item.id,

name: item.item_name,

description: item.description,

image_url: item.image_url,

category_id: item.category_id,

sku: item.sku,

track_stock: item.track_stock,

tax_ids: item.tax_ids,

variants: item.variants ? item.variants.map(v => ({
variant_id: v.id,
sku: v.sku,
price: v.price,
cost: v.cost
})) : [],

modifier_groups: item.modifier_groups ? item.modifier_groups.map(m => ({
id: m.id,
name: m.name
})) : []

}))

res.status(200).json(products)

}
