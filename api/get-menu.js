import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
 process.env.SUPABASE_URL,
 process.env.SUPABASE_KEY
)

export default async function handler(req,res){

 try{

  const { data, error } = await supabase
   .from("menu")
   .select("*")
   .order("name")

  if(error){
   return res.status(500).json({ error:error.message })
  }

  // แปลงข้อมูลให้ตรงกับหน้า POS
  const menu = data.map(item => ({
   id: item.id,
   name: item.name,
   price: item.price,
   image: item.image,
   category_name: item.category_name || item.category || "00_อื่นๆ"
  }))

  res.status(200).json(menu)

 }catch(err){

  res.status(500).json({ error: err.message })

 }

}
