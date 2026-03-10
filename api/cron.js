export default async function handler(req, res) {

  try{

    const base =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `https://${req.headers.host}`

    const response = await fetch(`${base}/api/sync-menu`)

    const data = await response.json()

    res.json({
      success:true,
      result:data
    })

  }catch(e){

    res.status(500).json({
      success:false,
      error:e.message
    })

  }

}
