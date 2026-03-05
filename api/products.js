export default async function handler(req, res) {

  const headers = {
    Authorization: `Bearer ${process.env.LOYVERSE_TOKEN}`,
    "Content-Type": "application/json",
  };

  try {

    // ดึงสินค้า
    const itemsRes = await fetch(
      "https://api.loyverse.com/v1.0/items",
      { headers }
    );

    const itemsData = await itemsRes.json();


    // ดึง modifier จาก API เรา
    const modifierRes = await fetch(
      "https://liff-pos.vercel.app/api/modifiers"
    );

    const modifierLists = await modifierRes.json();


    const products = itemsData.items.map(item => {

      const variant = item.variants?.[0];

      let imageUrl = "";

      if (item.image_url) imageUrl = item.image_url;
      else if (item.images?.length) imageUrl = item.images[0].url;


      // 🔥 หา modifier ของสินค้า
      const modifierIds =
        item.modifier_list_ids ||
        item.modifier_lists ||
        [];


      const itemModifiers = modifierIds
        .map(id => modifierLists.find(m => m.id === id))
        .filter(Boolean);


      return {
        id: item.id,
        variant_id: variant?.variant_id,
        name: item.item_name,
        price: variant?.default_price || variant?.price || 0,
        image_url: imageUrl,
        modifiers: itemModifiers
      };

    });

    res.status(200).json(products);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

}
