"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const express_1 = __importDefault(require("express"));
const mongo_controller_1 = require("./mongo-controller");
const user_routes_1 = __importDefault(require("./routes/user_routes"));
const auth_routes_1 = __importDefault(require("./routes/auth_routes"));
const page_routes_1 = __importDefault(require("./routes/page_routes"));
require("./auth/passport");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use('/auth', auth_routes_1.default);
app.use('/', user_routes_1.default);
app.use('/', page_routes_1.default);
const client = (0, mongo_controller_1.connect)();
exports.db = client.then(c => c.db('papyrus'));
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
