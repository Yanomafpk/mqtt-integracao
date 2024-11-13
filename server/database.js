const mqtt = require('mqtt');
const { Pool } = require('pg');

// Configurações do PostgreSQL
const pool = new Pool({
    user: "postgres",
    password: "safyfk090391",
    host: "localhost",
    port: 5432,
    database: "project_prodesp",
});
module.exports = pool;

// Configurações do broker MQTT
const brokerUrl = 'mqtts://c6c0a7b3489745eebf6facb43d10e815.s1.eu.hivemq.cloud:8883';
const mqtt_username = "yanoma"; // Usuário MQTT
const mqtt_password = "Safyfk090391!"; // Senha MQTT
const topic = 'sensor/led_status';

// Conectar ao broker MQTT com credenciais
const client = mqtt.connect(brokerUrl, {
    username: mqtt_username,
    password: mqtt_password,
});

// Verificação inicial para garantir que a linha com ID 1 existe no banco de dados
(async () => {
    try {
        await pool.query(`
            INSERT INTO sensor_data (id, led_status) 
            VALUES (1, 'Nenhum') 
            ON CONFLICT (id) DO NOTHING
        `);
    } catch (err) {
        console.error('Erro ao inserir linha inicial:', err);
    }
})();

// Conectar ao broker MQTT e inscrever no tópico
client.on('connect', () => {
    console.log('Conectado ao broker MQTT');
    client.subscribe(topic, (err) => {
        if (!err) {
            console.log(`Inscrito no tópico: ${topic}`);
        } else {
            console.error('Erro ao se inscrever no tópico:', err);
        }
    });
});

client.on('error', (err) => {
    console.error('Erro de conexão MQTT:', err);
});

// Receber mensagens do ESP32 e atualizar no PostgreSQL
client.on('message', async (topic, message) => {
    const ledStatus = message.toString();
    console.log(`Status do LED recebido do tópico ${topic}: ${ledStatus}`);

    try {
        // Atualizando o estado do LED no banco de dados
        const updateQuery = `UPDATE sensor_data SET led_status = $1 WHERE id = 1;`;
        const result = await pool.query(updateQuery, [ledStatus]);
        console.log('Estado do LED atualizado no banco de dados:', result.rowCount);
    } catch (err) {
        console.error('Erro ao atualizar o banco de dados:', err);
    }
});
