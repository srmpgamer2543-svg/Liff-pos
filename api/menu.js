export default async function handler(req, res) {

  try {

    const [itemsRes, modifiersRes, categoriesRes] = await Promise.all([
      fetch("https://api.loyverse.com/v1.0/items", {
        headers: { Authorization: "Bearer " + process.env.LOYVERSE_TOKEN }
      }),
      fetch("https://api.loyverse.com/v1.0/modifier_lists", {
        headers: { Authorization: "Bearer " + process.env.LOYVERSE_TOKEN }
      }),
      fetch("https://api.loyverse.com/v1.0/categories", {
        headers: { Authorization: "Bearer " + process.env.LOYVERSE_TOKEN }
      })
    ]);

    const itemsData = await itemsRes.json();
    const modifiersData = await modifiersRes.json();
    const categoriesData = await categoriesRes.json();

    const modifiersMap = {};
    modifiersData.modifier_lists?.forEach(list => {
      modifiersMap[list.id] = list;
    });

    const categoriesMap = {};
    categoriesData.categories?.forEach(cat => {
      categoriesMap[cat.id] = cat.name;
    });

    const menu = [];

    itemsData.items.forEach(item => {

      const categoryName = categoriesMap[item.category_id] || null;

      const modifierLists = (item.modifier_list_ids || []).map(id => {
        const list = modifiersMap[id];

        if (!list) return null;

        return {
          id: list.id,
          name: list.name,
          modifiers: list.modifiers?.map(m => ({
            id: m.id,
            name: m.name,
            price: Number(m.price || 0)
          })) || []
        };

      }).filter(Boolean);

      if (item.variants && item.variants.length > 0) {

        item.variants.forEach(variant => {

          let price = 0;

          if (variant.stores && variant.stores.length > 0) {
            price = Number(variant.stores[0].price);
          } else if (variant.default_price) {
            price = Number(variant.default_price);
          }

          menu.push({
            item_id: item.id,
            variant_id: variant.variant_id,
            name: item.item_name,
            variant_name: variant.option1_value || null,
            description: item.description,
            category_id: item.category_id,
            category_name: categoryName,
            sku: variant.sku,
            barcode: variant.barcode,
            image: item.image_url,
            price: price,
            modifiers: modifierLists
          });

        });

      }

    });

    res.status(200).json(menu);

  } catch (error) {

    res.status(500).json({
      error: "menu api error",
      detail: error.message
    });

  }

}
