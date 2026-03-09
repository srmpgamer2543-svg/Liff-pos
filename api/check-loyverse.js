export default async function handler(req, res) {

 try {

  const response = await fetch(
   "https://api.loyverse.com/v1.0/items",
   {
    method: "GET",
    headers: {
     "Authorization": `Bearer ${process.env.LOYVERSE_API_KEY}`,
     "Content-Type": "application/json"
    },
    cache: "no-store"
   }
  )

  const data = await response.json()

  return res.status(200).json(data)

 } catch (error) {

  return res.status(500).json({
   error: error.message
  })

 }

}
