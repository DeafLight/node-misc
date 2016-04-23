'use strict';

// http://mongoosejs.com/docs/api.html#connection_Connection-readyState
export enum MongooseReadyState {
    Disconnected = 0,
    Connected = 1,
    Connecting = 2,
    Disconnecting = 3
}