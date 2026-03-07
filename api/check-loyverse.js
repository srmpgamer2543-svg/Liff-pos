export default async function handler(req,res){

const response = await fetch(
 "https://api.loyverse.com/v1.0/items",
 {
  headers:{
   Authorization:`Bearer ${34b14f9c227247aaa1cb8af92921bf0b}`
  }
 }
)

const data = await response.json()

res.json(data)

}
