/* Import dependencies */
const Discord = require('discord.js');
const {
	prefix,
	token,
} = require('./config.json');

/* Create client and login using token */
const client = new Discord.Client();
client.login(token);