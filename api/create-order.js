export default async function handler(req,res){

 if(req.method!=="POST"){
  return res.status(405).end()
 }

 try{

  const body = req.body

  const response = await fetch(
   process.env.SUPABASE_URL + "/rest/v1/orders",
   {
    method:"POST",
    headers:{
     apikey:process.env.SUPABASE_KEY,
     Authorization:`Bearer ${process.env.SUPABASE_KEY}`,
     "Content-Type":"application/json",
     Prefer:"return=representation"
    },
    body:JSON.stringify({
     table_id: body.table_id || 1,
     total: body.total,
     status:"pending"
    })
   }
  )

  // 👇 เพิ่มตรงนี้
  if(!response.ok){
   const text = await response.text()
   return res.status(500).json({error:text})
  }

  const data = await response.json()

  res.json(data[0])

 }catch(err){

  res.status(500).json({error:err.message})

 }

}
