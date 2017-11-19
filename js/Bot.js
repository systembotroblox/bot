//---------------------------------------------------------------------
// Bot
// Contains functions for controlling the bot.
//---------------------------------------------------------------------

const client = {};

client.DBM = null;

const DiscordJS = require('discord.js');

client.$cmds = {};
client.$evts = {};

client.bot = null;

client.init = function() {
	this.initBot();
	this.reformatData();
	this.initEvents();
	this.login();
};

client.initBot = function() {
	this.bot = new DiscordJS.Client();
};

client.reformatData = function() {
	this.reformatCommands();
	this.reformatEvents();
};

client.reformatCommands = function() {
	const data = this.DBM.Files.data.commands;
	if(!data) return;
	for(let i = 0; i < data.length; i++) {
		const com = data[i];
		if(com) {
			if(this.DBM.Files.data.settings.case === 'false') {
				this.$cmds[com.name.toLowerCase()] = com;
			} else {
				this.$cmds[com.name] = com;
			}
		}
	}
};

client.reformatEvents = function() {
	const data = this.DBM.Files.data.events;
	if(!data) return;
	for(let i = 0; i < data.length; i++) {
		const com = data[i];
		if(com) {
			const type = com['event-type'];
			if(!this.$evts[type]) this.$evts[type] = [];
			this.$evts[type].push(com);
		}
	}
};

client.initEvents = function() {
	this.bot.on('ready', this.onReady.bind(this));
	this.bot.on('message', this.onMessage.bind(this));
	this.DBM.Events.registerEvents(this.bot);
};

client.login = function() {
	this.bot.login(this.DBM.Files.data.settings.token);
};

client.onReady = function() {
	if(process.send) process.send('BotReady');
	console.log('Bot is ready!');
	this.preformInitialization();
};

client.preformInitialization = function() {
	const bot = this.bot;
	if(this.$evts["1"]) {
		this.DBM.Events.onInitialization(bot);
	}
	if(this.$evts["3"]) {
		this.DBM.Events.setupIntervals(bot);
	}
};

client.onMessage = function(msg) {
	if(!msg.author.bot) {
		try {
			if(!this.checkCommand(msg)) {
				this.onAnyMessage(msg);
			}
		} catch(e) {
			console.error(e);
		}
	}
};

client.checkCommand = function(msg) {
	let command = this.checkTag(msg.content);
	if(command) {
		if(this.DBM.Files.data.settings.case === 'false') {
			command = command.toLowerCase();
		}
		const cmd = this.$cmds[command];
		if(cmd) {
			this.DBM.Actions.preformActions(msg, cmd);
			return true;
		}
	}
	return false;
};

client.checkTag = function(content) {
	const tag = this.DBM.Files.data.settings.tag;
	const separator = this.DBM.Files.data.settings.separator || '\\s+';
	content = content.split(new RegExp(separator))[0];
	if(content.startsWith(tag)) {
		return content.substring(tag.length);
	}
	return null;
};

client.onAnyMessage = function(msg) {
	if(!msg.author.bot) {
		if(this.$evts["2"]) {
			this.DBM.Events.callEvents("2", 1, 0, 2, false, '', msg);
		}
	}
};

module.exports = Bot;
