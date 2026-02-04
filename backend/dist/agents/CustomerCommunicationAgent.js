"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerCommunicationAgent = void 0;
class CustomerCommunicationAgent {
    generateMessage(request) {
        // Only send messages for MEDIUM or HIGH risk
        if (request.risk_analysis.risk_label === 'MODERATE') {
            return null;
        }
        const { risk_label } = request.risk_analysis;
        let messageTemplate = '';
        // Mock LLM generation or dynamic template selection
        if (risk_label === 'HIGH') {
            messageTemplate = `Hello ${request.customer_name}, thanks for your order #${request.order_id}! We want to ensure everything is perfect. Please prefer to open the package in front of the delivery person. If you need an exchange, we are here to help!`;
        }
        else if (risk_label === 'MEDIUM') {
            messageTemplate = `Hi ${request.customer_name}, your order #${request.order_id} is confirmed! We have double-checked the items. If you have any questions, feel free to reply here.`;
        }
        // Simulate sending (would call external API like Twilio/SendGrid)
        return {
            sent: true,
            content: messageTemplate,
            channel: request.channel,
            metadata: {
                risk_context: risk_label,
                timestamp: new Date().toISOString()
            }
        };
    }
}
exports.CustomerCommunicationAgent = CustomerCommunicationAgent;
