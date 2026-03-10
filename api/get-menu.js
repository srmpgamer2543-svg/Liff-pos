import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

let lastSync = 0;

async function backgroundSync(){

  const now = Date.now()

  if(now - lastSync < 30000){
    return
  }

  lastSync = now

  try{

    await fetch(`${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : ""}/api/sync-menu`)

  }catch(e){
    console.log("background sync error",e.message)
  }

}

export default async function handler(req, res) {

  try {

    backgroundSync()

    const { data, error } = await supabase
      .from("items")
      .select(`
        id,
        name,
        price,
        image,
        category_id
      `)

    if (error) throw error

    res.status(200).json(data)

  } catch (err) {

    res.status(500).json({
      error: err.message
    })

  }

}
