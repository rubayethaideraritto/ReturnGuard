import { RiskAnalysis } from './OrderRiskAgent';

export interface ReturnRequest {
    order_id: string;
    customer_history?: number; // Return rate
    product_condition: 'UNOPENED' | 'OPENED_UNUSED' | 'USED_DAMAGED';
    return_reason: string;
    risk_analysis: RiskAnalysis;
}

export type DecisionOption = 'SUGGEST_EXCHANGE' | 'FAST_REFUND' | 'MANUAL_REVIEW' | 'REJECT';

export interface ReturnDecision {
    recommendation: DecisionOption;
    reasoning: string;
    auto_approved: boolean;
}

export class ReturnDecisionAgent {
    public evaluateReturn(request: ReturnRequest): ReturnDecision {
        const { risk_analysis, product_condition, return_reason } = request;

        // 1. Check for Abuse/Fraud (High Risk)
        if (risk_analysis.risk_label === 'HIGH') {
            return {
                recommendation: 'MANUAL_REVIEW',
                reasoning: 'High risk order history detected during return request.',
                auto_approved: false
            };
        }

        // 2. Prefer Exchange for functional reasons
        if (['defective', 'wrong_size', 'better_price'].includes(return_reason.toLowerCase())) {
            return {
                recommendation: 'SUGGEST_EXCHANGE',
                reasoning: 'Customer issue can be solved with exchange.',
                auto_approved: true
            }
        }

        // 3. Fast Refund for safe customers with Unopened items
        if (product_condition === 'UNOPENED' && risk_analysis.risk_label === 'MODERATE') {
            return {
                recommendation: 'FAST_REFUND',
                reasoning: 'Moderate risk customer returning unopened item.',
                auto_approved: true
            };
        }

        // Default Fallback
        return {
            recommendation: 'MANUAL_REVIEW',
            reasoning: 'Standard return requiring merchant oversight.',
            auto_approved: false
        };
    }
}
