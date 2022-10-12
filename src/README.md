At Aiven, we’re all about flexibility and choosing the right tools for the job. That’s why we offer an extensive range of managed services across the major cloud providers in regions across the world. But not only that, we also offer ready-made out of the box integrations between these services, meaning you don’t have to spend time and resources to build and maintain these integrations allowing you to concentrate on the things that matter to your business. 

In this blog post we’re going to take a look at a typical data-streaming IOT use-case and how, through using Aiven, you can quickly set-up a reliable, highly *observable* tech stack to handle your IOT data streams.

**Observability and Why do I Care?**

“But wait”, I hear you ask. “What exactly is Observability and why do I even care?”. This is a great question, and to answer it let’s take a look at our IOT use-case.

In our use-case, we’ll have an IOT device which feeds data about a critical electric motor running in our factory. Now again, why do we care about this data. Well, often the under-performance of even a single motor can have dramatic effects on the efficiency and quality of output of a wider complex system. In a factory setting where hundreds of thousands of euros worth of products are being produced in a day, this leads to an unacceptable loss. And this is where the importance of that IOT data is apparent. 

The sensor readings are a **critical factory asset** and must be handled as such. If we extend this out again to the hundreds or even thousands of components in complex systems we can begin to get an appreciation for the scale of the information that must be analysed to ensure that a system is functioning optimally. 

This often cannot be done locally and must be sent to a centralised provider in order to be properly analysed. This is where companies turn to Apache Kafka - to be the fault tolerant data streaming platform which ensures that the critical factory data is reliably delivered to the various consumers. So now we have an understanding of the importance of the IOT data and why companies choose Kafka to handle that data, we can now take a look at Observability.

**Keeping an EyeOT on things**

We’ve established that the IOT data is a critical company asset and so by extension the reliable processing of that data is just as important, which is why we chose Kafka as our data streaming service. But how do we know Kafka is operating as it should? If it is not, we end up in a situation where the data being analysed and from which **key operational decisions** will be made is incomplete, missing or just wrong. 

This is the problem that the “Observability” of a system describes. A highly observable system allows us to see that all is as it should be and that we can trust the output that a system has provided. On the other extreme, we have the so-called blackbox - where we only see the output and just have to trust that all is as it should be. Again, this is an unacceptable situation when we are talking about a high-value factory setting. The rest of this blog post will show how we can create a highly observable Kafka cluster using Aiven and its managed Kafka service together with its InfluxDB and Grafana.

**Producing Our IOT Data**

For the purposes of this blog post we used Node.js to create a small project which will act as our producer, feeding dummy IOT data to our Aiven Kafka cluster. To get started, open a terminal and let’s clone this project into a new repo.

```json
git clone github-repo
```

Now let’s move into the newly cloned repo and install the required project dependencies using

```powershell
cd github-repo && npm i
```

With the dependencies installed we are almost in a position to run the project and start to produce our dummy IOT data. But before we can do this we first need to create our Aiven Kafka service which we can send the data to. To do this go to the services tab of the Aiven console (https://console.aiven.io) and click on the “Create Service” button as shown below.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/21ea5ebe-86c6-4af8-9e5d-435bf75cf8a6/Untitled.png)

At this point you’ll be taken to the create service page which will let you define the service you want, the cloud service provider, and the region where the datacenter should be based. For this case we will choose Kafka and simply go with the default options given. To create the service, scroll to the bottom of the page and click the “Create Service” button. 

Next we are taken to the overview page of the service we just created. On this page we can see the data we need to be able to connect our Kafka client to the service. Namely we can see the required **service url,** the **access key**, the **access certificate** and the **ca certificate**. 

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/1c1ac791-7e0d-4c9f-beea-c1d5528ad922/Untitled.png)

We now need to download the access key, the access certificate and the ca certificate and store these in a sensible location. In this project we make use of environment variables and a .env file to store the service details. To create our .env file make a copy of the project example.env file 

```json
cp example.env .env
```

and replace the variables in the newly created .env file with the details of your service.

At this point we have everything we need to create a connection between our Kafka client and the Kafka service, however we haven’t yet defined any topics on the Kafka service that we can produce messages to. To define a Kafka topic go to the “Topics” section of your Kafka service in the Aiven console, click the “Add Topic” button and enter “iot-stream” as the topic name.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/7a7f7906-7a59-496f-82f4-c4a9cd93cb7a/Untitled.png)

Finally, we are in a position where we can start producing our IOT dummy data to the Kafka topic. To start the project enter the following command in the terminal:

```json
npm run dev
```

After running this command we should then start to see a data stream appearing in the console which will look similar to below:

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/ea9e1203-436e-4ccb-ab19-ffd53848af37/Untitled.png)

So let’s take a look at what exactly is happening. 

If we look at the index.ts file we will see the following code where we set-up our Kafka client.

```jsx
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
```

With the client set-up we are now able to use it to define producers to write to topics and consumers to read from topics. 

**Producing Data to a Topic**

So let’s do exactly that and set up our producer to write to our “iot-stream” topic:

```jsx
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
```

In the first line we set-up our producer, after which we create a function called `produce` which is going to do the heavy-lifting for us. Within this produce function we instruct our `producer` to create a connection to our Kafka service. 

After this connection is established we then call the `produceIotDataStream` function which will handle the creation of the IOT data and then the writing of that data to the topic. The function accepts two inputs, the time interval in milliseconds between producing new data and a callback which tells the function what to do after the dummy IOT data has been produced. In this case we are simply sending that data to the `“iot-stream”` topic. 

**Consuming Data from a Topic**

But none of this explains why we are seeing the messages in the console. In this fictitious scenario, our program is also acting as a Consumer. This is obviously not a realistic real-life scenario but it does serve to show that data is being written to our Kafka topic and shows how we can consume and act on a data stream, in this case printing the data to the console.

```jsx
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
```

**Viewing Messages in the Aiven Console**

At this point you may be wondering if there is an alternative to creating a consumer to see the messages being sent to a topic. And yes, Aiven makes this possible directly in the console. To do this navigate to the “Topics” tab of your Kafka service and click on the `“iot-stream”` topic. This will bring up a window, where you can click on the “Messages” button. This will load up the messages page of the Topic, which gives you an option to fetch the latest messages. The messages that our client has sent have been base64 encoded, so to see the JSON object we sent in our message we must also enable the  “decode from Base64” option.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/a27b64b8-ae9a-4186-9821-9ecdc6f46591/Untitled.png)

With that we can now view our Topic messages directly in the Aiven console, but this hardly constitutes a “Highly Observable” system. Yes we can see messages coming into the Aiven console and we can consume messages but the question is still, “How do we really know that our infrastructure is operating as it should be?” 

This is where we turn to InfluxDB and Grafana and the out-of-the-box integrations that Aiven offers with its Kafka managed service.

**Creating Our Highly Observable System**

Navigate back to our Kafka overview page and scroll down until we see a “Service Integrations” box. Within this box we want to click on the “Set-up integration button” as shown below.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/6e532da1-ea34-44b0-8138-0e05e598a441/Untitled.png)

This will open up the “Service Integrations” page where we want to look for the “Metrics” box and click on the “Use Integration” button.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/31884d31-bf01-4512-b535-f658186784c8/Untitled.png)

Choose “New Service” from the menu, from the corresponding dropdown select the “New InfluxDB service” option and then click the “Continue” button. This will bring you to a page where you can define the Cloud Provider, the location and the service plan. Again just keep the defaults here and scroll to the bottom of the page and click “Create and Enable”. At this point you’ll be taken back to the integrations page and you should see your newly created InfluxDb integration as below. Click on this.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/e850cb78-0422-49f3-b622-7eb06d05d5e9/Untitled.png)

This will take you to the InfluxDB overview page where directly below the “Connections Information” you will see a “Manage Integrations” button. Click on this and then choose the “Grafana Metrics Dashboard” integration

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/8733ae21-02f0-4321-aec6-7d7346b1663f/Untitled.png)

From the pop-up window choose the “New service” option and choose continue to go to the set-up page. Again just keep the default options here and click the “Create and enable” button.

And that’s it. We now have a highly observable Kafka managed service. To see this we need to navigate to our Grafana dashboard by going to the Grafana service overview page and using the connection information to log-in to the service.

Once logged-in, use the sidebar menu to go to Dashboards > Browse. We will then see a default dashboard which Aiven provides as part of its integration. Click on this and you’ll be taken to your Kafka dashboard where you can see in minute detail how each part of your Kafka cluster is performing.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/2c3836f4-9eac-4d95-ba0a-a4342e074338/Untitled.png)

We can not only see System metrics but also Kafka specific metrics as well. As a challenge, try changing the millisecond parameter in the “produceIotDataStream” function down to 10 and then 1 and then check this dashboard to see how your Kafka cluster is handling this. For extra points try running multiple of these projects to simulate multiple IOT devices and see when your Kafka cluster is eventually overloaded. 

This again illustrates why the concept of observability is so important. Without this Grafana overview page of your complex, distributed system (Kafka) there would be no way to see how your infrastructure is handling such increases in data throughput. And as we saw earlier, without knowing how your infrastructure is performing, we are essentially crossing our fingers and hoping our “black box” is behaving, and will continue to behave, as expected.

And this is why Aiven has created these out-of-the-box integrations to manage your Kafka clusters, so that the creation of such a highly observable system does not need to be a Kafkaesque undertaking.