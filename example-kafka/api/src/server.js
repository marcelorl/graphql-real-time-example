const express = require('express');
const { Kafka, logLevel } = require('kafkajs');

const routes = require('./routes');

const app = express();

const kafka = new Kafka({
    clientId: 'api',
    brokers: ['localhost:9092'],
    retry: {
        initialRetryTime: 300,
        retries: 10
    },
    logLevel: logLevel.WARN
});

const producer = kafka.producer()
const consumer = kafka.consumer({groupId: 'certificate-group-receiver'})

app.use((req, res, next) => {
    req.producer = producer;

    return next();
})

app.use(routes);

async function run() {
    await producer.connect()
    await consumer.connect()

    await consumer.run({
        eachMessage: async({topic, partition, message}) => {
            console.log('Resposta', message)
        }
    })

    app.listen(3333, () => console.log('ta rolano'));
}

run().catch(console.error)
