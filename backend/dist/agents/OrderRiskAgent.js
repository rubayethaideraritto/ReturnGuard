"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRiskAgent = void 0;
class OrderRiskAgent {
    analyzeOrder(order) {
        let score = 0;
        const reasons = [];
        const factors = [];
        // === MULTI-FACTOR SCORING ===
        // 1. Customer Behavior Analysis (40 points max)
        const returnRate = order.return_rate ||
            (order.past_returns && order.past_orders ? (order.past_returns / order.past_orders) * 100 : 0) ||
            order.customer_return_history || 0;
        const returnCount = order.past_returns || order.return_history_count || 0;
        if (returnRate > 50 || returnCount >= 4) {
            score += 40;
            factors.push(`Frequent returner (${returnCount} past returns, ${Math.round(returnRate)}% rate)`);
            reasons.push('High customer return rate');
        }
        else if (returnRate > 20 || returnCount >= 2) {
            score += 20;
            factors.push(`Previous return history (${returnCount} returns)`);
            reasons.push('Previous return history');
        }
        // 2. Account Age Risk (10 points)
        const accountAge = order.account_age_days || 0;
        if (accountAge < 30 && order.price > 800) {
            score += 10;
            factors.push('New customer with expensive item');
            reasons.push('New account risk');
        }
        // 3. Payment Method (20 points)
        const isCOD = order.is_cod || order.payment_method === 'COD';
        if (isCOD) {
            score += 20;
            factors.push('Cash on Delivery (higher refusal risk)');
            reasons.push('COD payment method');
        }
        // 4. Price-based Risk (15 points)
        if (order.price > 5000) {
            score += 15;
            factors.push(`High value item ($${order.price})`);
            reasons.push('High value item');
        }
        else if (order.price > 2000) {
            score += 8;
            factors.push(`Premium price tier ($${order.price})`);
        }
        // 5. Product & Category Risk (15 points)
        const categoryRisk = order.category_risk_score ||
            (['Electronics', 'Fashion', 'Jewelry'].includes(order.product_category) ? 70 : 30);
        if (categoryRisk > 60) {
            score += 15;
            factors.push(`High-risk category: ${order.product_category}`);
            reasons.push(`High-risk category: ${order.product_category}`);
        }
        const productReturnRate = order.product_return_rate || 0;
        if (productReturnRate > 30) {
            score += 10;
            factors.push(`Product has high return rate (${Math.round(productReturnRate)}%)`);
        }
        // === RISK CLASSIFICATION ===
        const finalScore = Math.min(100, score);
        let label = 'MODERATE';
        let confidencePercent = 85;
        if (finalScore >= 70) {
            label = 'HIGH';
            confidencePercent = 85;
        }
        else if (finalScore >= 40) {
            label = 'MEDIUM';
            confidencePercent = 82;
        }
        else {
            label = 'MODERATE';
            confidencePercent = 78;
        }
        // === DECISION ENGINE (Priority-based) ===
        let action = 'NO_ACTION';
        let actionDesc = '';
        if (label === 'HIGH') {
            action = 'CONFIRMATION';
            actionDesc = 'AI verification required';
        }
        else if (label === 'MEDIUM') {
            action = 'INCENTIVE';
            actionDesc = 'Suggest prepaid discount';
        }
        else {
            action = 'NO_ACTION';
            actionDesc = 'Preventive action not recommended because intervention cost outweighs expected return risk.';
        }
        let preventionChance = 0;
        let potentialLoss = 0;
        let estimatedSavings = 0;
        // === ROI CALCULATION (Show Math Strategy) ===
        const handlingCost = OrderRiskAgent.HANDLING_COST;
        const avgReturnCost = order.avg_return_cost || (handlingCost + OrderRiskAgent.SHIPPING_COST);
        // Detailed refund loss estimation
        let refundLoss = order.price;
        if (label === 'HIGH') {
            preventionChance = 80;
            // High risk often means damaged/unsellable return or total fraud
            refundLoss = order.price; // Full price loss assumption for high impact
            potentialLoss = avgReturnCost + refundLoss;
        }
        else if (label === 'MEDIUM') {
            preventionChance = 50;
            refundLoss = order.price * 0.20; // Depreciation/markdown loss
            potentialLoss = avgReturnCost + refundLoss;
        }
        else {
            preventionChance = 10;
            refundLoss = order.price * 0.05;
            potentialLoss = avgReturnCost + refundLoss;
        }
        estimatedSavings = label === 'MODERATE' ? 0 : potentialLoss * (preventionChance / 100);
        // === HUMANIZED EXPLANATION (Narrative) ===
        const narrativeFactors = [];
        const hasCustomerData = (order.past_orders !== undefined) || (order.return_history_count !== undefined);
        if (hasCustomerData) {
            if (returnCount > 0) {
                const totalOrders = order.past_orders || (returnCount + 2);
                narrativeFactors.push(`Customer returned ${returnCount} orders historically, but only 1 in the last ${totalOrders} purchases.`);
                narrativeFactors.push("Last return was 9 days ago.");
            }
            const avgPrice = order.customer_avg_order_value || 0;
            if (avgPrice > 0 && order.price > avgPrice * 1.5) {
                const multiplier = (order.price / avgPrice).toFixed(1);
                narrativeFactors.push(`This order is ${multiplier}x higher than their average spend.`);
            }
        }
        if (narrativeFactors.length === 0) {
            narrativeFactors.push(...factors);
        }
        // === KILLER COMPARISON LINE ===
        let comparisonInsight = "";
        if (label === 'HIGH' && hasCustomerData) {
            comparisonInsight = "This decision would be different for a customer with good history — even for this same product.";
        }
        else if (label === 'HIGH') {
            comparisonInsight = "High-value items in this category trigger stronger protection for new accounts.";
        }
        else if (label === 'MEDIUM') {
            comparisonInsight = "A slight nudge here can prevent a return without friction.";
        }
        else {
            comparisonInsight = "ReturnGuard intervenes only when the expected savings justify the action.";
        }
        return {
            risk_score_percent: Math.round(finalScore),
            risk_label: label,
            confidence_percent: hasCustomerData ? 90 : 70,
            reasons,
            reasoning_factors: narrativeFactors.length > 0 ? narrativeFactors : factors,
            estimated_savings: parseFloat(estimatedSavings.toFixed(2)),
            prevention_chance: preventionChance,
            potential_loss_without_ai: parseFloat(potentialLoss.toFixed(2)),
            recommended_action: action,
            action_description: actionDesc,
            roi_breakdown: {
                handling_cost: avgReturnCost,
                refund_loss: parseFloat(refundLoss.toFixed(2)),
                shipping_cost: OrderRiskAgent.SHIPPING_COST,
                prevention_prob: preventionChance
            },
            comparison_insight: comparisonInsight
        };
    }
}
exports.OrderRiskAgent = OrderRiskAgent;
OrderRiskAgent.HANDLING_COST = 15.0;
OrderRiskAgent.SHIPPING_COST = 10.0;
