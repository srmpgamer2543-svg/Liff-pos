import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE
)

const r = await fetch("https://api.loyverse.com/v1.0/items", {
headers: {
Authorization: `Bearer ${process.env.LOYVERSE_API_KEY}`
}
})

const data = await r.json()

for (const item of data.items) {

const price = item.variants?.[0]?.price || 0

await supabase.from("items").upsert({
id: item.id,
name: item.item_name,
price: price,
image: item.image_url
})

}

res.json({
status: "menu synced",
count: data.items.length
})

}
