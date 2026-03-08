import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
 process.env.SUPABASE_URL,
 process.env.SUPABASE_KEY
)

export default async function handler(req,res){

 const { data, error } = await supabase
  .from("menu")
  .select("*")
  .order("name")

 if(error){
  res.status(500).json({error:error.message})
  return
 }

 res.status(200).json(data)

}
