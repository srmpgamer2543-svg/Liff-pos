export default async function handler(req, res) {

 if (req.method !== "POST") {
  return res.status(405).end()
 }

 const body = req.body

 console.log("LINE EVENT:", JSON.stringify(body, null, 2))

 res.status(200).end()
}
