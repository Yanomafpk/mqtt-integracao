#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

// Configurações de rede WiFi
const char* ssid = "yanoma";
const char* password = "yanomalindao";

// Configurações do broker MQTT
const char* mqtt_username = "yanoma";
const char* mqtt_password = "Safyfk090391!";
const char* mqtt_server = "c6c0a7b3489745eebf6facb43d10e815.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_topic = "sensor/led_status";

// Usando WiFiClientSecure para conexões seguras
WiFiClientSecure espClient;
PubSubClient client(espClient);

// Definindo os pinos dos LEDs e botões
const int redLedPin = 16;
const int greenLedPin = 17;
const int redButtonPin = 4;
const int greenButtonPin = 5;

String currentLedColor = "Nenhum";

void setup() {
  Serial.begin(115200);

  // Configurando LEDs e botões
  pinMode(redLedPin, OUTPUT);
  pinMode(greenLedPin, OUTPUT);
  pinMode(redButtonPin, INPUT_PULLUP);
  pinMode(greenButtonPin, INPUT_PULLUP);

  // Conectando ao WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando ao WiFi...");
  }
  Serial.println("Conectado ao WiFi");

  // Configurações para conexão segura
  espClient.setInsecure();
  client.setServer(mqtt_server, mqtt_port);
}

void reconnect() {
  Serial.print("Conectando ao broker MQTT...");
  if (client.connect("ESP32Client", mqtt_username, mqtt_password)) {
    Serial.println("conectado");
  } else {
    Serial.print("falha, rc=");
    Serial.print(client.state());
    Serial.println(" tentando novamente em 5 segundos");
    delay(5000);
  }
}

void publishLedStatus() {
  String payload = "LED aceso: " + currentLedColor;
  client.publish(mqtt_topic, payload.c_str());
  Serial.println("Dados enviados: " + payload);
}

void loop() {
  if (!client.connected()) {
    reconnect();
    return;
  }
  client.loop();

  // Lendo os botões e mostrando o estado no Serial Monitor
  int redButtonState = digitalRead(redButtonPin);
  int greenButtonState = digitalRead(greenButtonPin);

  Serial.print("Estado do botão vermelho: ");
  Serial.println(redButtonState);
  Serial.print("Estado do botão verde: ");
  Serial.println(greenButtonState);

  // Verifica qual botão está pressionado e acende o LED correspondente
  if (redButtonState == LOW) {  // Botão vermelho pressionado
    digitalWrite(redLedPin, HIGH);
    digitalWrite(greenLedPin, LOW);
    currentLedColor = "Vermelho";
  } else if (greenButtonState == LOW) {  // Botão verde pressionado
    digitalWrite(redLedPin, LOW);
    digitalWrite(greenLedPin, HIGH);
    currentLedColor = "Verde";
  } else {  // Nenhum botão pressionado
    digitalWrite(redLedPin, LOW);
    digitalWrite(greenLedPin, LOW);
    currentLedColor = "Nenhum";
  }

  // Enviar status do LED para o broker MQTT
  publishLedStatus();

  delay(2000);  // Atraso para verificar o status dos botões
}
