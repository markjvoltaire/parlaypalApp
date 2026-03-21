import Purchases from "react-native-purchases";

const TAG = "[RevenueCat products]";

/** App Store Connect Product ID: "Monthly with trial" (Premium Access group) */
export const MONTHLY_SUBSCRIPTION_PRODUCT_ID = "monthlyWithFree";

/** RevenueCat / App Store: "Per Week No Free" */
export const WEEKLY_NO_FREE_TRIAL_PRODUCT_ID = "premium.perweekaccess";

/**
 * Find a RevenueCat package whose Store product matches this identifier (any offering).
 */
export function findPackageForStoreProductId(offerings, storeProductId) {
  if (!storeProductId || !offerings?.all) return null;
  for (const offering of Object.values(offerings.all)) {
    const pkgs = offering?.availablePackages ?? [];
    const found = pkgs.find((p) => p?.product?.identifier === storeProductId);
    if (found) return found;
  }
  return null;
}

/**
 * Weekly prefers `premium.perweekaccess`, else first package on "Weekly" offering.
 * Monthly prefers `monthlyWithFree`, else first package on "Monthly" offering.
 */
export function resolveDefaultSubscriptionPackages(offerings) {
  const all = offerings?.all || {};
  const weeklyOffering = all["Weekly"] || null;
  const monthlyOffering = all["Monthly"] || null;

  const weeklyPkg =
    findPackageForStoreProductId(offerings, WEEKLY_NO_FREE_TRIAL_PRODUCT_ID) ||
    (weeklyOffering?.availablePackages?.length > 0
      ? weeklyOffering.availablePackages[0]
      : null);

  const monthlyPkg =
    findPackageForStoreProductId(offerings, MONTHLY_SUBSCRIPTION_PRODUCT_ID) ||
    (monthlyOffering?.availablePackages?.length > 0
      ? monthlyOffering.availablePackages[0]
      : null);

  return { weeklyPkg, monthlyPkg };
}

function summarizeStoreProduct(product) {
  if (!product) return null;
  return {
    identifier: product.identifier,
    title: product.title,
    description: product.description,
    price: product.price,
    priceString: product.priceString,
    currencyCode: product.currencyCode,
    subscriptionPeriod: product.subscriptionPeriod,
    productCategory: product.productCategory,
    productType: product.productType,
    pricePerWeek: product.pricePerWeek,
    pricePerMonth: product.pricePerMonth,
    pricePerYear: product.pricePerYear,
    pricePerWeekString: product.pricePerWeekString,
    pricePerMonthString: product.pricePerMonthString,
    pricePerYearString: product.pricePerYearString,
    introPrice: product.introPrice,
    discounts: product.discounts,
  };
}

/**
 * Fetches offerings and logs only the two store products used on the paywall
 * (weekly + monthly packages from resolveDefaultSubscriptionPackages).
 * @returns {Promise<object>} RevenueCat PurchasesOfferings
 */
export async function fetchAndLogPurchasesProducts() {
  const offerings = await Purchases.getOfferings();
  const { weeklyPkg, monthlyPkg } =
    resolveDefaultSubscriptionPackages(offerings);

  if (weeklyPkg?.product) {
    console.log(
      TAG,
      "displayed weekly product:",
      summarizeStoreProduct(weeklyPkg.product),
    );
  } else {
    console.warn(TAG, "displayed weekly product: (none — no package resolved)");
  }

  if (monthlyPkg?.product) {
    console.log(
      TAG,
      "displayed monthly product:",
      summarizeStoreProduct(monthlyPkg.product),
    );
  } else {
    console.warn(TAG, "displayed monthly product: (none — no package resolved)");
  }

  return offerings;
}
