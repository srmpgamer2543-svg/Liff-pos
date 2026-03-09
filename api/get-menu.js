import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
 process.env.SUPABASE_URL,
 process.env.SUPABASE_KEY
)

export default async function handler(req, res) {

 try {

  const { data, error } = await supabase
   .from("menu")
   .select("*")

  if (error) {
   return res.status(500).json({
    error: error.message
   })
  }

  res.status(200).json(data)

 } catch (err) {

  res.status(500).json({
   error: err.message
  })

 }

}
