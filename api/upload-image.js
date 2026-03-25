import fs from "fs"
import path from "path"

export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).end()
  }

  const { image } = req.body

  if(!image){
    return res.status(400).json({ error: "no image" })
  }

  const base64Data = image.replace(/^data:image\/png;base64,/, "")

  const fileName = `print_${Date.now()}.png`
  const filePath = path.join(process.cwd(), "public", fileName)

  fs.writeFileSync(filePath, base64Data, "base64")

  res.json({
    url: `/${fileName}`
  })
}
