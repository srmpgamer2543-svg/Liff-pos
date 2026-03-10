import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

let lastSync = 0;

function runSync(req){

  const now = Date.now()

  if(now - lastSync < 1000){
    return
  }

  lastSync = now

  try{

    const base =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `https://${req.headers.host}`

    fetch(`${base}/api/sync-menu`,{
      method:"GET"
    }).catch(()=>{})

  }catch(e){

    console.log("sync error",e.message)

  }

}

export default async function handler(req, res) {

  try {

    runSync(req)

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
