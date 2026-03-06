export default async function handler(req, res) {

  console.log("ORDER :", req.body)

  res.status(200).json({
    status: "order received"
  });

}
