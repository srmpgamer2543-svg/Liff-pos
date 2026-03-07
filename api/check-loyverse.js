export default async function handler(req,res){

const response = await fetch(
 "https://api.loyverse.com/v1.0/items",
 {
  headers:{
   Authorization:`Bearer ${process.env.LOYVERSE_API_KEY}`
  }
 }
)

const data = await response.json()

res.json(data)

}
