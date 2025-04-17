export function generateSkuFromOptions(
    options: Record<string, string>, // e.g. { color: "red", size: "XXL" }
    optionOrder: string[],           // e.g. ["color", "size"]
    prefix: string = 'SKU'           // optional product-specific prefix
): string {
    const parts = optionOrder.map(key => options[key]?.toUpperCase() || '');
    return `${prefix}-${parts.join('-')}`;
}

export function generateCombinationsFromOptions(
    options: Record<string, string[]>,
    defaultPrice: number = 0,
) {
    const entries = Object.entries(options); // [ ['Color', [...]], ['Size', [...]] ]
    const keys = entries.map(([key]) => key);
    const values = entries.map(([, vals]) => vals);
    const optionOrder = Object.keys(options);

    const cartesian = values.reduce((acc, curr) =>
        acc.flatMap(a => curr.map(b => [...a, b]))
        , [[]]);

    return cartesian.map(combination => {
        const variant: Record<string, string> = {};
        combination.forEach((val, i) => {
            variant[keys[i]] = val;
        });
        return {
            sku: generateSkuFromOptions(variant, optionOrder),
            options: variant,
            price: defaultPrice,
        }
    });
}