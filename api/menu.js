export default async function handler(req, res) {

  try {

    const headers = {
      Authorization: "Bearer " + process.env.LOYVERSE_TOKEN
    };

    // โหลด API พร้อมกัน
    const [itemsRes, modifiersRes, categoriesRes] = await Promise.all([
      fetch("https://api.loyverse.com/v1.0/items", { headers }),
      fetch("https://api.loyverse.com/v1.0/modifier_lists", { headers }),
      fetch("https://api.loyverse.com/v1.0/categories", { headers })
    ]);

    const itemsData = await itemsRes.json();
    const modifiersData = await modifiersRes.json();
    const categoriesData = await categoriesRes.json();

    // -----------------------------
    // map modifier lists
    // -----------------------------
    const modifiersMap = {};

    (modifiersData.modifier_lists || []).forEach(list => {

      modifiersMap[list.id] = {
        id: list.id,
        name: list.name,
        modifiers: (list.modifiers || []).map(m => ({
          id: m.id,
          name: m.name,
          price: Number(m.price || 0)
        }))
      };

    });

    // -----------------------------
    // map categories
    // -----------------------------
    const categoriesMap = {};

    (categoriesData.categories || []).forEach(cat => {
      categoriesMap[cat.id] = cat.name;
    });

    const menu = [];

    // -----------------------------
    // loop items
    // -----------------------------
    (itemsData.items || []).forEach(item => {

      const categoryName = categoriesMap[item.category_id] || null;

      // -----------------------------
      // หา modifier list id
      // -----------------------------
      let modifierIds = [];

      if (item.modifier_list_ids && item.modifier_list_ids.length > 0) {

        modifierIds = item.modifier_list_ids.map(m =>
          typeof m === "string" ? m : m.modifier_list_id
        );

      }

      if (item.modifier_lists && item.modifier_lists.length > 0) {

        modifierIds = item.modifier_lists.map(m => m.id);

      }

      // -----------------------------
      // map modifier data
      // -----------------------------
      const modifierLists = modifierIds
        .map(id => modifiersMap[id])
        .filter(Boolean);

      // -----------------------------
      // loop variants
      // -----------------------------
      (item.variants || []).forEach(variant => {

        let price = 0;

        if (variant.stores && variant.stores.length > 0) {
          price = Number(variant.stores[0].price);
        }
        else if (variant.default_price) {
          price = Number(variant.default_price);
        }

        // variant modifier (บางร้านใช้แบบนี้)
        let variantModifierIds = [];

        if (variant.modifier_list_ids && variant.modifier_list_ids.length > 0) {

          variantModifierIds = variant.modifier_list_ids.map(m =>
            typeof m === "string" ? m : m.modifier_list_id
          );

        }

        const variantModifiers = variantModifierIds
          .map(id => modifiersMap[id])
          .filter(Boolean);

        const finalModifiers =
          variantModifiers.length > 0 ? variantModifiers : modifierLists;

        // -----------------------------
        // push menu
        // -----------------------------
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

          modifiers: finalModifiers

        });

      });

    });

    res.status(200).json(menu);

  } catch (error) {

    res.status(500).json({
      error: "menu api error",
      detail: error.message
    });

  }

}
