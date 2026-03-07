export default async function handler(req, res) {

try {

const response = await fetch(
 "https://api.loyverse.com/v1.0/items",
 {
  headers:{
   Authorization: "Bearer YOUR_LOYVERSE_API_KEY"
  }
 }
)

const data = await response.json()

const items = data.items || []

const menu = items.map(item => {

const variant = item.variants?.[0] || {}

let price = 0

// ใช้ราคาจาก store ก่อน
if (variant.stores && variant.stores.length > 0) {
 price = variant.stores[0].price
}

// fallback ราคา default
if (!price && variant.default_price) {
 price = variant.default_price
}

return {
 id: item.id,
 name: item.item_name,
 category_id: item.category_id,
 image: item.image_url || null,
 price: price,
 variant_id: variant.variant_id
}

})

return res.status(200).json({
 success: true,
 total: menu.length,
 menu
})

} catch (error) {

return res.status(500).json({
 success:false,
 error:error.message
})

}

}
