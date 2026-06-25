// No per-product weight is tracked in the schema, so these are approximate,
// commonly-cited conversion factors used consistently across the store
// dashboard and the user-facing impact/gamification card.
export const FOOD_WASTE_KG_PER_MEAL = 0.4
export const CO2_KG_PER_WASTE_KG = 2.5
export const CO2_KG_ABSORBED_PER_TREE_PER_YEAR = 20

export function mealsToFoodWasteKg(meals: number) {
  return Math.round(meals * FOOD_WASTE_KG_PER_MEAL * 10) / 10
}

export function foodWasteKgToCo2Kg(foodWasteKg: number) {
  return Math.round(foodWasteKg * CO2_KG_PER_WASTE_KG * 10) / 10
}

export function co2KgToTrees(co2Kg: number) {
  return Math.max(1, Math.round(co2Kg / CO2_KG_ABSORBED_PER_TREE_PER_YEAR))
}
