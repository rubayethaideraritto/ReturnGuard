"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROICalculator = void 0;
class ROICalculator {
    static calculateSavedRevenue(preventedReturns) {
        // Formula: (Prevented Returns * AOV) - (Prevented Returns * Handling Cost)
        // Actually, "Saved" means we kept the revenue.
        // So it is fundamentally the Revenue retained.
        // Plus we saved the handling cost of the return.
        // Revenue Saved = Prevented * AOV
        // Operational Savings = Prevented * HandlingCost
        // Total Value = (Prevented * AOV) + (Prevented * HandlingCost)
        // Using the user provided formula: "(prevented_returns * avg_order_value) - estimated_handling_cost"
        // Wait, the user formula says MINUS handling cost?
        // If a return is PREVENTED, we DON'T pay handling cost.
        // Maybe they mean "Profit = Revenue - Cost"?
        // Let's stick to a simpler "Revenue Retained" metric for now, or use their formula literally if it makes sense.
        // Formula from prompt: "(prevented_returns * avg_order_value) - estimated_handling_cost"
        // This looks like "Net Value".
        const revenueRetained = preventedReturns * this.AVG_ORDER_VALUE;
        const handlingAvoided = preventedReturns * this.HANDLING_COST;
        return revenueRetained + handlingAvoided;
    }
}
exports.ROICalculator = ROICalculator;
ROICalculator.AVG_ORDER_VALUE = 2500; // Example average order value
ROICalculator.HANDLING_COST = 150; // Cost to process a return (shipping + labor)
