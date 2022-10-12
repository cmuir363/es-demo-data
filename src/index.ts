import { Kafka, logLevel } from "kafkajs"
import { v4 as uuid } from 'uuid';
import fs from "fs"
import * as dotenv from 'dotenv'

import consume from "./consume"
import { produceIotDataStream } from "./iot-data"

dotenv.config()

const kafka = new Kafka({
    clientId: "my-app",
    brokers: [process.env.KAFKA_CLUSTER_URL],
    ssl: {
        ca: [fs.readFileSync(process.env.KAFKA_CA_PATH, "utf-8")],
        key: fs.readFileSync(process.env.KAFKA_KEY_PATH, "utf-8"),
        cert: fs.readFileSync(process.env.KAFKA_CERT_PATH, "utf-8")
    },
    logLevel: logLevel.ERROR,
})

const producer = kafka.producer()

const produce = async () => {
    await producer.connect()

    produceIotDataStream(100, (data) => {
        producer.send({
            topic: "iot-stream",
            messages: [
                {
                    key: uuid(),
                    value: JSON.stringify(data)
                }
            ]
        })
        .catch(err => console.log(err))
    })
}

consume()
produce() 

