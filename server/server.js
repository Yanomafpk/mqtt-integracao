const express = require("express");
const cors = require("cors");
const pool = require("./database");  // Importa a conexão do banco de dados
const app = express();

app.use(express.json());
app.use(cors());

// Rota POST para adicionar um usuário
app.post("/adduser", (req, res) => {
    const { username, password } = req.body;

    console.log("Username:", username);
    console.log("Password:", password);

    const insertSTMT = `
        INSERT INTO accounts (username, password) 
        VALUES ($1, $2);
    `;
    
    pool.query(insertSTMT, [username, password])
        .then(() => {
            console.log("Data Saved");
            res.status(200).send("User added successfully");
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error saving data");
        });
});

// Rota GET para buscar todos os usuários
app.get("/users", (req, res) => {
    const query = "SELECT * FROM accounts";

    pool.query(query)
        .then((response) => {
            res.status(200).json(response.rows);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error retrieving users");
        });
});

// Rota GET para obter o status do LED
app.get("/led-status", (req, res) => {
    const query = "SELECT led_status FROM sensor_data WHERE id = 1";

    pool.query(query)
        .then((response) => {
            if (response.rows.length > 0) {
                res.status(200).json({ led_status: response.rows[0].led_status });
            } else {
                res.status(404).send("LED status not found");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error retrieving LED status");
        });
});

app.listen(4000, () => console.log("Server running on localhost:4000"));
