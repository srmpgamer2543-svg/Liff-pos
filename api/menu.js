export default async function handler(req,res){

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY

const response = await fetch(
`${SUPABASE_URL}/rest/v1/menu?select=*`,
{
headers:{
apikey:SUPABASE_KEY,
Authorization:`Bearer ${SUPABASE_KEY}`
}
}
)

const data = await response.json()

res.json(data)

}
