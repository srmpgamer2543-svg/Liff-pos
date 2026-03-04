import axios from "axios";

const BASE_URL = "https://api.loyverse.com/v1.0";

export async function getAllItems() {
  const res = await axios.get(`${BASE_URL}/items`, {
    headers: {
      Authorization: `Bearer ${process.env.LOYVERSE_TOKEN}`,
    },
  });

  return res.data.items;
}

export async function createReceipt(orderData) {
  const res = await axios.post(
    `${BASE_URL}/receipts`,
    orderData,
    {
      headers: {
        Authorization: `Bearer ${process.env.LOYVERSE_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
}
