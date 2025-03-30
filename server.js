const app = require("./app");

const PORT = process.env.PORT || 5001; // Use a different default port if needed

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
