export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).end()
  }

  try{

    const { image } = req.body

    if(!image){
      return res.status(400).json({ error: "no image" })
    }

    // แค่ส่งกลับไปเลย (ไม่ต้อง save)
    // ใช้ data URL download ตรงๆ

    res.status(200).json({
      url: image
    })

  }catch(err){

    res.status(500).json({
      error: err.message
    })

  }

}
