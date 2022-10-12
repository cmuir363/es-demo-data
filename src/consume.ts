import { Kafka, logLevel } from "kafkajs"
import fs from "fs"

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


const consume = async () => {

    const consumer = kafka.consumer({groupId: "test-group"})
    await consumer.connect()
    await consumer.subscribe({topic: "iot-stream"})

    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            console.log({
                key: message.key.toString(),
                value: message.value.toString()
            })
        }
    })
}

export default consume