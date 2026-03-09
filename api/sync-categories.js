import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {

  const response = await fetch("https://api.loyverse.com/v1.0/categories", {
    headers: {
      Authorization: `Bearer ${process.env.LOYVERSE_TOKEN}`
    }
  });

  const data = await response.json();

  if (!data.categories) {
    return res.json({
      error: "Loyverse API error",
      response: data
    });
  }

  const categories = data.categories.map(c => ({
    id: c.id,
    name: c.name
  }));

  const { error } = await supabase
    .from("categories")
    .upsert(categories);

  if (error) {
    return res.json({ error });
  }

  res.json({
    success: true,
    total: categories.length
  });

}
