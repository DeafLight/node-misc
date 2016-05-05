'use strict';

export class MongoConnectionManager {
    private static _instance: MongoConnectionManager;

    public static get instance() {
        if (!MongoConnectionManager._instance) {
            MongoConnectionManager._instance = new MongoConnectionManager();
        }
        return MongoConnectionManager._instance;
    }

    constructor() {
        if (MongoConnectionManager.instance) {
            throw new Error("Error: use MongoConnectionManager.instance");
        }
    }
}