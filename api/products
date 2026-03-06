export default async function handler(req, res){

const token = process.env.LOYVERSE_API_KEY

const response = await fetch(
"https://api.loyverse.com/v1.0/items",
{
headers:{
Authorization:`Bearer ${token}`
}
})

const data = await response.json()

let products = data.items.map(p=>({

id:p.id,
name:p.item_name,
price:p.variants[0].price,
image_url:p.image_url,
category:p.category_id

}))

res.status(200).json(products)

}
