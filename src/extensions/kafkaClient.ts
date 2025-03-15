import { Kafka, Producer, Consumer } from 'kafkajs';

const kafkaBrokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];

let kafkaProducer: Producer;
let kafkaConsumer: Consumer;

export async function connectKafka() {
    if (!kafkaProducer || !kafkaConsumer) {
        const kafka = new Kafka({
            clientId: 'my-app',
            brokers: kafkaBrokers,
        });

        kafkaProducer = kafka.producer();
        kafkaConsumer = kafka.consumer({ groupId: 'account-group' });
        await kafkaProducer.connect();
        await kafkaConsumer.connect();
        console.log('Kafka producer and consumer connected');
    }
    return kafkaProducer;
}

export async function getKafkaProducer() {
    if (!kafkaProducer) {
        const kafka = new Kafka({
            clientId: 'my-app',
            brokers: kafkaBrokers,
        });

        kafkaProducer = kafka.producer();
        await kafkaProducer.connect();
        console.log('Kafka producer connected');
    }
    return kafkaProducer;
}

export async function getKafkaConsumer() {
    if (!kafkaConsumer) {
        const kafka = new Kafka({
            clientId: 'my-app',
            brokers: kafkaBrokers,
        });

        kafkaConsumer = kafka.consumer({ groupId: 'account-group' });
        await kafkaConsumer.connect();
        console.log('Kafka producer connected');
    }
    return kafkaConsumer;
}