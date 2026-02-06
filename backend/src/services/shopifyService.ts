import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { Order } from '../agents/OrderRiskAgent';

dotenv.config();

const API_VERSION = '2024-01';

export class ShopifyService {
    private async fetchShopify(endpoint: string) {
        const SHOP_URL = process.env.SHOPIFY_SHOP_URL;
        const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
        
        if (!SHOP_URL || !ADMIN_TOKEN) {
            console.error('Environment variables check:', { SHOP_URL: !!SHOP_URL, ADMIN_TOKEN: !!ADMIN_TOKEN });
            throw new Error('Shopify credentials not configured in environment variables');
        }

        const url = `${SHOP_URL}/admin/api/${API_VERSION}/${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'X-Shopify-Access-Token': ADMIN_TOKEN,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Shopify API error: ${response.status} - ${error}`);
        }

        return response.json();
    }

    public async getOrderAnalysisData(orderId: string): Promise<Order> {
        // 1. Fetch the specific order
        const orderData = await this.fetchShopify(`orders/${orderId}.json`) as any;
        const order = orderData.order;

        if (!order || !order.customer) {
            throw new Error('Order or customer data not found in Shopify');
        }

        const customerId = order.customer.id;

        // 2. Fetch customer's past orders to calculate returns
        const customerOrdersData = await this.fetchShopify(`customers/${customerId}/orders.json?limit=50`) as any;
        const pastOrders = customerOrdersData.orders || [];

        // Calculate metrics
        const pastReturns = pastOrders.filter((o: any) => o.refunds && o.refunds.length > 0).length;

        const createdAt = new Date(order.customer.created_at);
        const now = new Date();
        const accountAgeDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        const totalSpent = parseFloat(order.customer.total_spent || '0');
        const ordersCount = parseInt(order.customer.orders_count || '0');
        const avgOrderValue = ordersCount > 0 ? totalSpent / ordersCount : 0;

        return {
            order_id: order.name || order.id.toString(),
            product_category: order.line_items[0]?.product_type || 'General',
            price: parseFloat(order.total_price),
            payment_method: order.gateway === 'manual' ? 'COD' : 'CARD',
            is_cod: order.gateway === 'manual',
            customer_id: customerId.toString(),
            return_history_count: pastReturns,
            past_returns: pastReturns,
            past_orders: ordersCount,
            account_age_days: accountAgeDays,
            customer_avg_order_value: avgOrderValue,
            return_rate: ordersCount > 0 ? (pastReturns / ordersCount) * 100 : 0
        };
    }
}

export const shopifyService = new ShopifyService();

