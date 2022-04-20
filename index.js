require('dotenv').config();
const path = require('path');
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
function milk(server){
	if(fs.existsSync("data/" + server.toString())){
		var data = fs.readFileSync("data/" + server.toString() + "/ismilk", "utf-8");
			if(data.toString() == "0"){
			fs.writeFile("data/" + server.toString() + "/ismilk", "1", (err) => {
			if(err) console.log("FATAL MILK ERROR: " + err);
			});
			return true;
		} else {
			// no milky :(
			return false;
		}
	} else {
		fs.mkdirSync("data/" + server.toString());
		fs.writeFileSync("data/" + server.toString() + "/ismilk", "1");
		return true;
	}
}	
function unmilk(){
	fs.readdir("data", { withFileTypes: true }, (err, files) => {
		const dirs = files
			.filter((item) => item.isDirectory())
			.map((item) => item.name);
		dirs.forEach(dir => fs.writeFileSync("data/" + dir + "/ismilk", "0"));
	});
	// old code
	// fs.writeFileSync("ismilk", "0");
}
function stampstring(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000)
  return minutes + " minutes and " + seconds + " seconds";
}
function pointadd(pts, id){
	if(fs.existsSync("data/user/" + id)){
		// Read and write the points
		if(fs.existsSync("data/user/"+id+"/points")){
			pointsOld = Number(fs.readFileSync("data/user/" + id + "/points"));
		} else {
			pointsOld = 0;
		}
		pointsNew = pointsOld + pts;
		pointsNew = pointsNew.toString();
		fs.writeFileSync("data/user/" + id + "/points", pointsNew);
		
	} else {
		fs.mkdirSync("data/user/" + id);
		fs.writeFileSync("data/user/" + id + "/points", pts);
	}
}
function pointtake(pts, id){
	if(fs.existsSync("data/user/" + id)){
		// Read and write the points
		if(fs.existsSync("data/user/"+id+"/points")){
			pointsOld = Number(fs.readFileSync("data/user/" + id + "/points"));
			if(pointsOld >= pts){
				pointsNew = pointsOld - pts;
			} else {
				pointsNew = "0"
				fs.writeFileSync("data/user/" + id + "/points", pointsNew);
				return "ERR_NOT_ENOUGH";
			}
		} else {
			pointsOld = 0;
		}
		
		pointsNew = pointsNew.toString();
		fs.writeFileSync("data/user/" + id + "/points", pointsNew);
		
	} else {
		fs.mkdirSync("data/user/" + id);
		fs.writeFileSync("data/user/" + id + "/points", "0");
	}
}
function getBalance(id){
	nd = id.toString();
	if(fs.existsSync("data/user/"+nd)){
		result = fs.readFileSync("data/user/"+id+"/points");
		return result;
	} else {
		fs.mkdirSync("data/user/"+nd);
		fs.writeFileSync("data/user/"+nd+"/points","0");
		return "0";
	}
}
function pointpro(m){
	// Point processing
	total = Math.floor(m.content.length / 5);
	pointadd(total, m.author.id);
}	
// console.log(unmilk());
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})
client.on("message", msg => {
  var donotprocess = false;
  if (msg.content === "!milk") {
	donotprocess = true;
	server = msg.guild.id;
    if(milk(server)){
		var oldtime = fs.readFileSync("epoch");
		var newtime = ((new Date().getTime()) - Number(oldtime));
		pointadd(30, msg.author.id);
		msg.reply("You milked the cow! (" + stampstring(newtime) + " late)");
	} else {
		if(pointtake(30, msg.author.id) === "ERR_NOT_ENOUGH"){
			// console.log("This person does not have enough points to be deducted from");
		}
		msg.reply("Sorry, no milk! 30 points deducted");
		console.log("Failed to milk");
	}
  }
  if (msg.content === "!bal") {
	    donotprocess = true;
		msg.reply("You have "+ getBalance(msg.author.id) + " 3DSPoints!");
  }
  if (msg.content === "!ban") {
		donotprocess = true;
		msg.reply("I wish I was a mod. Shame it isn't reality...");
  }
  if(!msg.channel.name.includes("spam") || msg.author.bot || !donotprocess){
	pointpro(msg);
  }
})
client.login(process.env.DISCORD_TOKEN);
var schedule = require('node-schedule');
var j = schedule.scheduleJob('0 * * * *', function(){  // this for one hour
	unmilk();
	console.log("Cow is milkable!");
		epoch = (new Date().getTime()).toString();
		fs.writeFile("epoch", epoch, (err) => {
			if(err) console.log("Failed to write epoch!");
		});
});