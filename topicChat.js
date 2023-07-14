const {
    Client,
    PrivateKey,
    TopicCreateTransaction,
    TopicInfoQuery,
    TopicUpdateTransaction,
    TopicMessageSubmitTransaction,
    TopicMessageQuery
} = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {

    // testnet account initiation
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    if (myAccountId == null || myPrivateKey == null) {
        throw new Error(
            "Environment variables myAccountId and myPrivateKey must be present"
        );
    }

    const client = Client.forTestnet();

    client.setOperator(myAccountId, myPrivateKey);

    //keys generation
    const adminKey = PrivateKey.generateED25519()

    //topics by tags
    const tags = ['red', 'blue', 'yellow']

    const topicsIds = await createTopicsByTags(client, adminKey, tags);
    console.log("*** Topics created ***")


    //submitting a message
    await submitMessageByTag(client, topicsIds, "red", myAccountId, "Hello there")

    //message dispalying
    console.log("\n[ Displaying messages ]\n");

    let messagesBytags = {}
    for (const tag in topicsIds) {
        messagesBytags[tag] = []
        new TopicMessageQuery()
            .setTopicId(topicsIds[tag])
            .setStartTime(0)
            .subscribe(
                client,
                (message) => {
                    console.log(`*** New message submitted with ${tag} tag! ***`);
                    messagesBytags[tag].push(Buffer.from(message.contents, "utf8").toString())
                    displayLogic(messagesBytags);
                }
            );
    }

    //submitting a second message
    await submitMessageByTag(client, topicsIds, "yellow", myAccountId, "Hello again")
}

function displayLogic(messagesBytags) {
    for (const tag in messagesBytags) {
        messagesBytags[tag].forEach(x => {
            const y = JSON.parse(x)
            console.log(`[${tag}]:<${y.accountId}>:"${y.message}"`);
        });
    }
}

async function createTopicsByTags(client, adminKey, tags) {
    let topicsIds = {}
    for (let index = 0; index < tags.length; index++) {
        const element = tags[index];
        topicsIds[element] = await new TopicCreateTransaction()
            .setAdminKey(adminKey)
            .setTopicMemo(`Topic with ${element} tag`)
            .freezeWith(client)
            .sign(adminKey)
            .then(x => x.execute(client))
            .then(x => x.getReceipt(client))
            .then(x => x.topicId)
    }
    return topicsIds
}

async function submitMessageByTag(client, topicsIds, tag, accountId, message) {
    const msgTx = await new TopicMessageSubmitTransaction()
        .setTopicId(topicsIds[tag])
        .setMessage(JSON.stringify({
            accountId: accountId,
            message: message
        }))
        .freezeWith(client)
        .execute(client)
        console.log("*** Message submitted ***");
}

//main();

module.exports ={
    displayLogic,
    createTopicsByTags,
    submitMessageByTag
}