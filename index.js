/* Import dependencies */
const Discord = require('discord.js');
const {
    prefix,
    token,
} = require('./config.json');

/* Create client */
const client = new Discord.Client();

/* Queue of bot command requests */
const queue = new Map();

/* Basic listeners that console.log */
client.once('ready', () => {
    console.log('Ready!');
});

client.once('reconnecting', () => {
    console.log('Reconnecting!');
});

client.once('disconnect', () => {
    console.log('Disconnect!');
});

/* Reading messages/commands and adding valid ones to queue */
client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;                /* Ensure message begins with "!" */

    const serverQueue = queue.get(message.guild.id);

    if (message.content.startsWith(`${prefix}checkseed`)) {         /* !checkseed - add checkseed to queue */
        execute(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}queue`)) {      /* !queue - add checkqueue to queue */
        checkQueue(message, serverQueue);
        return;
    } else {
        message.channel.send('You need to enter a valid command!')  /* invalid command */
    }
});

/* Adding seed check requests to queue */
async function execute(message, serverQueue) {                      
    const args = message.content.split(' ');

    /* Check valid arguments */
    if (args.length != 3) {                                         
        message.channel.send('You need to enter a valid argument!');
        return;
    }

    console.log("New request");

    /* Request necessary data */
    const checkRequest = {                                          
        linkCode: args[2],
        member: message.author,
        ign: args[1]
    };

    /* If no existing queue, make one. Then, start seed checking process */
    if (!serverQueue) {                                             

        console.log("No server queue");

        /* Array of seed requests */
        const queueContruct = {
            requests: []
        };

        /* Initialize queue */
        queue.set(message.guild.id, queueContruct);
        queueContruct.requests.push(checkRequest);

        try {
            /* Perform seed checking for first request in queue */
            checkSeed(message.guild, queueContruct.requests[0]);
            return message.channel.send(`${checkRequest.ign} is first in queue!`);
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        /* Add additional request to back of queue for execution */
        serverQueue.requests.push(checkRequest);
        return message.channel.send(`${checkRequest.ign} has been added to the queue!`);
    }

}

/* Check seed of player's pokemon and send "IGN (PKMN-NAME) SEED" as private message */
async function checkSeed(guild, checkRequest) {

    const serverQueue = queue.get(guild.id);

    if (!checkRequest) {
        queue.delete(guild.id);
        return;
    }

    /* Execute all seed checks in queue */
    while (serverQueue.requests[0]) {
        try{
            console.log(serverQueue.requests);
            await wait(5000);   /* Dummy seed checker function */
            console.log("finish---------------------------------------------------------");

            /* Send seed to user as private message */
            checkRequest.member.send(checkRequest.ign + "(PKMN): SEED");

            serverQueue.requests.shift();
        }
        catch(err) {
            console.log(err)
        }
    }
    queue.delete(guild.id);

}

/* Check status of queue */
async function checkQueue(message, serverQueue) {
    try {
        await message.channel.send("There are " + queue.get(message.guild.id).requests.length + " requests in the queue.");
    } catch (err) {
        console.log(err);
        return message.channel.send(err);
    }

}

// wait ms milliseconds
function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}


/* Login using token */
client.login(token);