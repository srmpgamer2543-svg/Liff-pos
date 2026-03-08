export default async function handler(req, res) {

 try {

  const response = await fetch(
   "https://api.loyverse.com/v1.0/categories",
   {
    headers:{
     Authorization: `Bearer ${process.env.LOYVERSE_API_KEY}`
    }
   }
  )

  const data = await response.json()

  res.status(200).json(data.categories)

 } catch (error) {

  res.status(500).json({
   error:error.message
  })

 }

}
