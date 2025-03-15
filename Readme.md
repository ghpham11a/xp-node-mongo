#### Useful commands

To run it locally

```
npx ts-node src/index.ts
```

###### 1. Setup MongoDB

Charts from Bitnami is needed for MongoDB

```sh
helm install xp-mongodb -f dev-mongodb-config.yaml oci://registry-1.docker.io/bitnamicharts/mongodb
```

To retrieve the MongoDB root password from the Kubernetes secret and set it as an environment variable, run the following command:

```sh
$MONGODB_ROOT_PASSWORD = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String((kubectl get secret --namespace default xp-mongodb -o jsonpath="{.data.mongodb-root-password}")))

kubectl get svc xp-mongodb

kubectl run --namespace default xp-mongodb-client --rm --tty -i --restart='Never' --env="MONGODB_ROOT_PASSWORD=$MONGODB_ROOT_PASSWORD" --image docker.io/bitnami/mongodb:8.0.3-debian-12-r0 --command -- bash
```

Get into mongosh using the ip from the xp-mongodb svc 

```sh
mongosh --host '10.107.249.24' -u 'mongodb-username' -p 'mongodb-password' --authenticationDatabase 'mongodb-database'
```

Use MongoDB database

```sh
use mongodb-database
```

```sh
db.runCommand({connectionStatus:1})
```

Insert Data

```sh
# 3. Insert a single document
db.users.insertOne({ name: "john_doe", email: "john@example.com" })

# 4. Insert multiple documents
db.users.insertMany([
  { name: "jane_doe",  email: "jane@example.com" },
  { name: "alex_smith", email: "alex@example.com" }
])
```

Read data

```sh
db.users.find().pretty()
```

```sh
[
  {
    _id: ObjectId('67be9f544896e7d362fe6911'),
    id: 1,
    name: 'alpha',
    email: 'bravo'
  },
  {
    _id: ObjectId('67be9f7e4896e7d362fe6912'),
    id: 2,
    name: 'charlie',
    email: 'delta'
  }
]
```

To exit 

```sh
mongodb-database> exit
```

Set MONGO_URI secret in dev-users-secrets.yaml with the value below. Note where you are using the mongo username and mongo password

```sh
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('mongodb://mongodb-username:mongodb-password@xp-mongodb.default.svc.cluster.local:27017/mongodb-database'))
```

###### 2. Setup Kafka

Install Kafka Helm chart

```sh
helm install xp-kafka oci://registry-1.docker.io/bitnamicharts/kafka
```

To check that pods were spun up

```sh
kubectl get pods --selector app.kubernetes.io/instance=xp-kafka
```

To create the topics, we will start another pod that goes into the Kafka pods and creates the topics and shuts down. To do this, we need to find the Kafka password and update it's value in the dev-kafka-topics-admin.yaml. 

```sh
# This gets an encoded value
kubectl get secret xp-kafka-user-passwords -o jsonpath='{.data.client-passwords}'

# we need the decoded version to put into the yaml
# Powershell
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String((kubectl get secret xp-kafka-user-passwords -o jsonpath='{.data.client-passwords}')))

# bash
kubectl get secret xp-flask-postgres-kafka-user-passwords -o jsonpath='{.data.client-passwords}' | base64 -d
```

Get the password and update the password field in dev-kafka-topics-admin.yaml

```
... required username=\"user1\" password=\"zRycaPH3fQ\";" >> /tmp/kafka-client.properties ...
```

Then just run this command which applies the yaml updates

```sh
kubectl apply -f dev-kafka-topics-admin.yaml
```

###### 3. Setup Redis

Install Redis Helm chart

```sh
helm install xp-redis oci://registry-1.docker.io/bitnamicharts/redis
```

Optional: connect to Redis

```sh
# Store the password in Powershell
$REDIS_PASSWORD = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String((kubectl get secret --namespace default xp-flask-postgres-redis -o jsonpath="{.data.redis-password}")))

kubectl run --namespace default redis-client --restart='Never' --env REDIS_PASSWORD=$REDIS_PASSWORD  --image docker.io/bitnami/redis:7.4.2-debian-12-r4 --command -- sleep infinity

kubectl exec --tty -i redis-client --namespace default -- bash

redis-cli -h xp-flask-postgres-redis-master -p 6379

AUTH [REDIS_PASSWORD]
```
