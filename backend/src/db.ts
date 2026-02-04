import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(__dirname, '../data.json');

export interface UserSettings {
    autoSend: boolean;
    manualApproval: boolean;
    strictMode: boolean;
}

export interface User {
    id: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    settings?: UserSettings;
}

export interface DatabaseData {
    orders: any[];
    preventedReturnsCount: number;
    users: User[];
    shopStates: Record<string, string>;
    shopTokens: Record<string, string>;
}

const DEFAULT_DATA: DatabaseData = {
    orders: [],
    preventedReturnsCount: 0,
    users: [],
    shopStates: {},
    shopTokens: {}
};

export class DB {
    private data: DatabaseData;

    constructor() {
        this.data = this.load();
        this.migrateLegacyData();
    }

    private migrateLegacyData() {
        let changed = false;
        const firstUser = this.data.users[0];

        if (firstUser) {
            this.data.orders.forEach(order => {
                if (!order.userId) {
                    order.userId = firstUser.id;
                    changed = true;
                }
            });
        }

        if (changed) {
            console.log(`[Migration] Associated ${this.data.orders.filter(o => o.userId === firstUser.id).length} legacy orders with ${firstUser.email}`);
            this.save(this.data);
        }
    }

    private load(): DatabaseData {
        try {
            if (!fs.existsSync(DB_FILE)) {
                this.save(DEFAULT_DATA);
                return { ...DEFAULT_DATA };
            }
            const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
            const loadedData = JSON.parse(fileContent);
            // Merge with defaults to ensure new fields (like users) exist
            return { ...DEFAULT_DATA, ...loadedData };
        } catch (error) {
            console.error("Failed to load DB, initializing empty:", error);
            return { ...DEFAULT_DATA };
        }
    }

    private save(data: DatabaseData) {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    }

    public getOrders(userId?: string): any[] {
        if (!userId) return this.data.orders;
        return this.data.orders.filter(o => o.userId === userId);
    }

    public addOrder(order: any, userId: string) {
        this.data.orders.push({ ...order, userId, timestamp: new Date().toISOString() });
        this.save(this.data);
    }

    public updateOrder(orderId: string, updates: any) {
        const index = this.data.orders.findIndex(o => o.order_id === orderId);
        if (index !== -1) {
            this.data.orders[index] = { ...this.data.orders[index], ...updates };
            this.save(this.data);
        }
    }

    public getPreventedReturnsCount(userId?: string): number {
        if (!userId) return this.data.preventedReturnsCount;
        // For per-user, we filter orders and count preventions
        return this.data.orders.filter(o => o.userId === userId && o.preventionPrevented).length;
    }

    public incrementPreventedReturns(userId: string, orderId: string) {
        // Find order and mark as prevented for this user
        const index = this.data.orders.findIndex(o => o.order_id === orderId && o.userId === userId);
        if (index !== -1) {
            this.data.orders[index].preventionPrevented = true;
            this.data.preventedReturnsCount++; // Keep global count too for now
            this.save(this.data);
        }
    }

    // User Management
    public addUser(user: User) {
        this.data.users.push({
            ...user,
            settings: { autoSend: true, manualApproval: false, strictMode: true }
        });
        this.save(this.data);
    }

    public findUserByEmail(email: string): User | undefined {
        return this.data.users.find(u => u.email === email);
    }

    public getAllUsers(): User[] {
        return this.data.users;
    }

    public getUserSettings(userId: string): UserSettings {
        const user = this.data.users.find(u => u.id === userId);
        return user?.settings || { autoSend: true, manualApproval: false, strictMode: true };
    }

    public updateUserSettings(userId: string, settings: Partial<UserSettings>) {
        const index = this.data.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            this.data.users[index].settings = {
                ...this.getUserSettings(userId),
                ...settings
            };
            this.save(this.data);
        }
    }

    // Shopify OAuth Management
    public saveShopState(shop: string, state: string) {
        this.data.shopStates[shop] = state;
        this.save(this.data);
    }

    public getShopState(shop: string): string | undefined {
        return this.data.shopStates[shop];
    }

    public saveShopToken(shop: string, token: string) {
        this.data.shopTokens[shop] = token;
        this.save(this.data);
    }

    public getShopToken(shop: string): string | undefined {
        return this.data.shopTokens[shop];
    }
}

export const db = new DB();
