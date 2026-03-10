export default async function handler(req, res){

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

  if(!data.categories){
   return res.status(500).json({
    error:"Loyverse API error",
    response:data
   })
  }

  const categories = data.categories.map(c=>({
   id:c.id,
   name:c.name
  }))

  res.status(200).json(categories)

 }catch(err){

  res.status(500).json({
   error:err.message
  })

 }

}
