import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
 process.env.SUPABASE_URL,
 process.env.SUPABASE_KEY
)

export default async function handler(req,res){

 try{

  const response = await fetch(
   "https://api.loyverse.com/v1.0/categories",
   {
    headers:{
     Authorization:`Bearer ${process.env.LOYVERSE_API_KEY}`
    }
   }
  )

  const data = await response.json()

  const categories = data.categories.map(c=>({
   id:c.id,
   name:c.name
  }))

  const loyverseIds = categories.map(c=>`"${c.id}"`).join(",")

  // upsert
  const {error:upsertError}=await supabase
   .from("categories")
   .upsert(categories,{onConflict:"id"})

  if(upsertError) throw upsertError

  // delete missing
  const {error:deleteError}=await supabase
   .from("categories")
   .delete()
   .not("id","in",`(${loyverseIds})`)

  if(deleteError) throw deleteError

  res.json({
   success:true,
   total:categories.length
  })

 }catch(e){

  res.status(500).json({
   error:e.message
  })

 }

}
