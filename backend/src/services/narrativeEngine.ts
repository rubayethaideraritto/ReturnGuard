import { RiskAnalysis, Order } from '../agents/OrderRiskAgent';

interface NarrativeContext {
    order: Order;
    riskAnalysis: RiskAnalysis;
}

export class NarrativeEngine {
    private openers = [
        "Analysis indicates",
        "Risk assessment reveals",
        "Pattern recognition shows",
        "Behavioral analysis suggests",
        "Data synthesis demonstrates"
    ];

    private connectors = [
        "however",
        "specifically regarding",
        "compounded by",
        "in conjunction with",
        "particularly when examining"
    ];

    private closers = [
        "warranting enhanced verification protocols",
        "suggesting a measured protective stance",
        "indicating standard processing is appropriate",
        "requiring human oversight for optimal outcome",
        "justifying automated approval with monitoring"
    ];

    public generateRiskNarrative(context: NarrativeContext): string {
        const { order, riskAnalysis } = context;
        const { risk_label } = riskAnalysis;

        // Build contextual sentences
        const parts: string[] = [];

        // Opening
        const opener = this.selectRandom(this.openers);
        parts.push(opener);

        // Main risk factors
        if (risk_label === 'HIGH') {
            parts.push(this.buildHighRiskNarrative(order, riskAnalysis));
        } else if (risk_label === 'MEDIUM') {
            parts.push(this.buildMediumRiskNarrative(order, riskAnalysis));
        } else {
            parts.push(this.buildLowRiskNarrative(order, riskAnalysis));
        }

        return parts.join(' ');
    }

    public generateCustomerMessage(context: NarrativeContext, channel: 'WhatsApp' | 'Email'): string | null {
        const { order, riskAnalysis } = context;
        const customerName = order.customer_id || 'valued customer';

        if (riskAnalysis.risk_label === 'HIGH') {
            return `Hello ${customerName}, thank you for your order #${order.order_id}! To ensure everything arrives perfectly, we recommend opening your package in the presence of our delivery partner. If you need an exchange or have any concerns, our support team is ready to assist you immediately.`;
        } else if (riskAnalysis.risk_label === 'MEDIUM') {
            return `Hi ${customerName}, your order #${order.order_id} is confirmed and being prepared with care! We've double-checked all items. If you have any questions or special requests, feel free to reach out to us anytime.`;
        }

        return null; // No message for low risk
    }

    private buildHighRiskNarrative(order: Order, risk: RiskAnalysis): string {
        const factors: string[] = [];

        if (order.past_returns && order.past_returns >= 3) {
            factors.push(`a recurring pattern of ${order.past_returns} previous returns`);
        }

        if (order.is_cod) {
            factors.push("cash-on-delivery payment selection");
        }

        if (order.price > 2000) {
            factors.push(`the high-value nature of this ${order.price} BDT transaction`);
        }

        if (['Electronics', 'Fashion', 'Jewelry'].includes(order.product_category)) {
            factors.push(`elevated category risk in ${order.product_category}`);
        }

        if (order.account_age_days && order.account_age_days < 30) {
            factors.push("limited account history");
        }

        const connector = this.selectRandom(this.connectors);
        const closer = this.closers[3]; // "requiring human oversight"

        return `that ${factors.slice(0, 2).join(' and ')}, ${connector} ${factors[2] || 'transaction characteristics'}, ${closer}.`;
    }

    private buildMediumRiskNarrative(order: Order, risk: RiskAnalysis): string {
        const factors: string[] = [];

        if (order.past_returns && order.past_returns > 0) {
            factors.push(`${order.past_returns} prior return events`);
        } else {
            factors.push("limited negative history");
        }

        if (order.price > 1000) {
            factors.push("moderate transaction value");
        }

        if (order.is_cod) {
            factors.push("delivery-based payment");
        }

        return `moderate risk markers including ${factors[0]}, ${this.connectors[2]} ${factors[1] || 'standard order patterns'}, ${this.closers[1]}.`;
    }

    private buildLowRiskNarrative(order: Order, risk: RiskAnalysis): string {
        const positives: string[] = [];

        if (!order.is_cod) {
            positives.push("prepaid transaction security");
        }

        if (order.account_age_days && order.account_age_days > 90) {
            positives.push("established account tenure");
        }

        if (order.past_returns === 0 || !order.past_returns) {
            positives.push("clean return history");
        }

        return `favorable indicators including ${positives.slice(0, 2).join(' and ')}, ${this.closers[2]}.`;
    }

    private selectRandom<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    public generateComparisonInsight(context: NarrativeContext): string {
        const { risk_label } = context.riskAnalysis;
        const { order } = context;

        if (risk_label === 'HIGH') {
            if (order.past_returns && order.past_returns > 0) {
                return "This decision would differ significantly for a customer with cleaner transaction history, even for an identical product.";
            }
            return "High-value items in this category receive enhanced scrutiny when paired with elevated risk vectors.";
        } else if (risk_label === 'MEDIUM') {
            return "A minor intervention at this stage can prevent potential complications without creating friction.";
        }

        return "ReturnGuard applies protective measures only when expected savings justify the intervention cost.";
    }
}

export const narrativeEngine = new NarrativeEngine();
