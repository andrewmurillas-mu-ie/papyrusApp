"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const mongo_controller_1 = require("./mongo-controller");
const user_routes_1 = __importDefault(require("./routes/user_routes"));
const auth_routes_1 = __importDefault(require("./routes/auth_routes"));
const page_routes_1 = __importDefault(require("./routes/page_routes"));
const page_version_routes_1 = __importDefault(require("./routes/page_version_routes"));
const workspace_routes_1 = __importDefault(require("./routes/workspace_routes"));
const ai_routes_1 = __importDefault(require("./routes/ai_routes"));
require("./auth/passport");
const simple_collab_server_1 = __importDefault(require("./collaboration/simple-collab-server"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)({
    origin: ["http://localhost:5174", "http://localhost:5175"],
    credentials: true,
}));
app.use(express_1.default.json());
// Root route for health check
app.get("/", (req, res) => {
    res.json({
        message: "Papyrus API is running",
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});
app.use("/auth", auth_routes_1.default);
app.use("/", user_routes_1.default);
app.use("/", page_routes_1.default);
app.use("/", page_version_routes_1.default);
app.use("/", workspace_routes_1.default);
app.use("/ai", ai_routes_1.default);
(0, mongo_controller_1.connect)()
    .then(() => {
    console.log("Mongoose connected to MongoDB");
})
    .catch((error) => {
    console.error("MongoDB connection failed:", error);
});
// Initialize simple collaboration server
const collaborationServer = new simple_collab_server_1.default(server);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`🚀 Real-time collaborative editing ENABLED`);
});
//# sourceMappingURL=index.js.map