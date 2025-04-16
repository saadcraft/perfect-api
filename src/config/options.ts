export function generateSkuFromOptions(
    options: Record<string, string>, // e.g. { color: "red", size: "XXL" }
    optionOrder: string[],           // e.g. ["color", "size"]
    prefix: string = 'SKU'           // optional product-specific prefix
): string {
    const parts = optionOrder.map(key => options[key]?.toUpperCase() || '');
    return `${prefix}-${parts.join('-')}`;
}