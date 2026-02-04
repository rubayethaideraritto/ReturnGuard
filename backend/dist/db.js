"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.DB = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_FILE = path_1.default.join(__dirname, '../data.json');
const DEFAULT_DATA = {
    orders: [],
    preventedReturnsCount: 0,
    users: [],
    shopStates: {},
    shopTokens: {}
};
class DB {
    constructor() {
        this.data = this.load();
        this.migrateLegacyData();
    }
    migrateLegacyData() {
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
    load() {
        try {
            if (!fs_1.default.existsSync(DB_FILE)) {
                this.save(DEFAULT_DATA);
                return Object.assign({}, DEFAULT_DATA);
            }
            const fileContent = fs_1.default.readFileSync(DB_FILE, 'utf-8');
            const loadedData = JSON.parse(fileContent);
            // Merge with defaults to ensure new fields (like users) exist
            return Object.assign(Object.assign({}, DEFAULT_DATA), loadedData);
        }
        catch (error) {
            console.error("Failed to load DB, initializing empty:", error);
            return Object.assign({}, DEFAULT_DATA);
        }
    }
    save(data) {
        fs_1.default.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    }
    getOrders(userId) {
        if (!userId)
            return this.data.orders;
        return this.data.orders.filter(o => o.userId === userId);
    }
    addOrder(order, userId) {
        this.data.orders.push(Object.assign(Object.assign({}, order), { userId, timestamp: new Date().toISOString() }));
        this.save(this.data);
    }
    updateOrder(orderId, updates) {
        const index = this.data.orders.findIndex(o => o.order_id === orderId);
        if (index !== -1) {
            this.data.orders[index] = Object.assign(Object.assign({}, this.data.orders[index]), updates);
            this.save(this.data);
        }
    }
    getPreventedReturnsCount(userId) {
        if (!userId)
            return this.data.preventedReturnsCount;
        // For per-user, we filter orders and count preventions
        return this.data.orders.filter(o => o.userId === userId && o.preventionPrevented).length;
    }
    incrementPreventedReturns(userId, orderId) {
        // Find order and mark as prevented for this user
        const index = this.data.orders.findIndex(o => o.order_id === orderId && o.userId === userId);
        if (index !== -1) {
            this.data.orders[index].preventionPrevented = true;
            this.data.preventedReturnsCount++; // Keep global count too for now
            this.save(this.data);
        }
    }
    // User Management
    addUser(user) {
        this.data.users.push(Object.assign(Object.assign({}, user), { settings: { autoSend: true, manualApproval: false, strictMode: true } }));
        this.save(this.data);
    }
    findUserByEmail(email) {
        return this.data.users.find(u => u.email === email);
    }
    getAllUsers() {
        return this.data.users;
    }
    getUserSettings(userId) {
        const user = this.data.users.find(u => u.id === userId);
        return (user === null || user === void 0 ? void 0 : user.settings) || { autoSend: true, manualApproval: false, strictMode: true };
    }
    updateUserSettings(userId, settings) {
        const index = this.data.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            this.data.users[index].settings = Object.assign(Object.assign({}, this.getUserSettings(userId)), settings);
            this.save(this.data);
        }
    }
    // Shopify OAuth Management
    saveShopState(shop, state) {
        this.data.shopStates[shop] = state;
        this.save(this.data);
    }
    getShopState(shop) {
        return this.data.shopStates[shop];
    }
    saveShopToken(shop, token) {
        this.data.shopTokens[shop] = token;
        this.save(this.data);
    }
    getShopToken(shop) {
        return this.data.shopTokens[shop];
    }
}
exports.DB = DB;
exports.db = new DB();
