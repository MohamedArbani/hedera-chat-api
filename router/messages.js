const router= require('express').Router();
const topicChat = require('../topicChat');

const {
    Client,
    PrivateKey
} = require("@hashgraph/sdk");
require("dotenv").config();

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



// Example route for displaying logic
router.get('/display-logic', (req, res) => {
    // Assuming you have the messagesBytags object
    const messagesBytags = req.body.messagesBytags;
    let msgs = [];

    for (const tag in messagesBytags) {
        messagesBytags[tag].forEach(x => {
            const y = JSON.parse(x)
            console.log(`[${tag}]:<${y.accountId}>:"${y.message}"`);
            msgs.push([tag,`<${y.accountId}>:"${y.message}"`])
        });
    }
    res.send(msgs);
});

// Example route for creating topics by tags
router.post('/create-topics', async (req, res) => {

    try {
        const topicsIds = await topicChat.createTopicsByTags(client, adminKey, tags);
        res.json({ topicsIds });
    } catch (error) {
        console.error('Error creating topics:', error);
        res.status(500).json({ error: 'Failed to create topics' });
    }
});

// Example route for submitting a message by tag
router.post('/submit-message', async (req, res) => {
    const { topicsIds, tag, accountId, message } = req.body;

    try {
        await topicChat.submitMessageByTag(client, topicsIds, tag, accountId, message);
        res.json({ message: 'Message submitted successfully' });
    } catch (error) {
        console.error('Error submitting message:', error);
        res.status(500).json({ error: 'Failed to submit message' });
    }
});

module.exports=router