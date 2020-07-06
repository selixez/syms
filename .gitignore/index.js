const Discord = require('discord.js');
const client = new Discord.Client();
const token = require("./token.json");
const fs = require("fs");
const bdd = require("./bdd.json");
const fetch = require('node-fetch');

const bot = new Discord.Client();

bot.on("ready", async () => {
    console.log("Le bot est allumé !")
    bot.user.setStatus("dnd");
    setTimeout(() => {
        bot.user.setActivity("Je suis en développement !");
    }, 100)
});

bot.on("guildMemberAdd", member => {
    
    if(bdd["message-bienvenue"]){
        bot.channels.cache.get('726785329985486968').send(bdd["message-bienvenue"]);
    }
    else{
        bot.channels.cache.get('726785329985486968').send("Bienvenue sur le serveur");
    }
    member.roles.add('726800918208577566');
});

bot.on("message", async message => {

    if (message.author.bot) return;

    if (message.content.startsWith("!clear")) {
        // message.delete();
        if (message.member.hasPermission('MANAGE_MESSAGES')) {

            let args = message.content.trim().split(/ +/g);

            if (args[1]) {
                if (!isNaN(args[1]) && args[1] >= 1 && args[1] <= 99) {

                    message.channel.bulkDelete(args[1])
                    message.channel.send(`Vous avez supprimé ${args[1]} message(s)`)
                    message.channel.bulkDelete(1)

                }
                else {
                    message.channel.send(`Vous devez indiquer une valeur entre 1 et 99 !`)
                }
            }
            else {
                message.channel.send(`Vous devez indiquer un nombre de messages a supprimer !`)
            }
        }
        else {
            message.channel.send(`Vous devez avoir la permission de gérer les messages pour éxécuter cette commande !`)
        }
    }

    if (message.content.startsWith("!mb")) {
        message.delete()
        if (message.member.hasPermission('MANAGE_MESSAGES')) {
            if (message.content.length > 5) {
                message_bienvenue = message.content.slice(4)
                bdd["message-bienvenue"] = message_bienvenue
                Savebdd()

            }
        }
    }
    if (message.content.startsWith("!warn")) {
        if (message.member.hasPermission('BAN_MEMBERS')) {

            if (!message.mentions.users.first()) return;
            utilisateur = message.mentions.users.first().id

            if (bdd["warn"][utilisateur] == 2) {

                delete bdd["warn"][utilisateur]
                message.guild.members.ban(utilisateur)

            }
            else {
                if (!bdd["warn"][utilisateur]) {
                    bdd["warn"][utilisateur] = 1
                    Savebdd();
                    message.channel.send("Tu as a présent " + bdd["warn"][utilisateur] + " avertissement(s)");
                }
                else {
                    bdd["warn"][utilisateur]++
                    Savebdd();
                    message.channel.send("Tu as a présent " + bdd["warn"][utilisateur] + " avertissements");

                }
            }
        }
    }

    if (message.content.startsWith('!lvl')) {
        if (bdd["statut-level"] == true) {
            bdd["statut-level"] = false
            Savebdd();
            return message.channel.send('Vous venez d\'arreter le système de level !');
        }
        else {
            bdd["statut-level"] = true;
            Savebdd();
            return message.channel.send('Vous venez d\'allumer le système de level !');
        }
    }

    if (bdd["statut-level"] == true) {
        if (message.content.startsWith('!level')) {
            if (!bdd["coins-utilisateurs"][message.member.id]){
                return message.channel.send(`Nous n'avez pas encore posté de message !`);
            } else {
                return message.channel.send(`Vous avez ${bdd["coins-utilisateurs"][message.member.id]} points !\nEt vous êtes au level n°${bdd["level-utilisateurs"][message.member.id]}`)
            }
        }
        else{
            addRandomInt(message.member);
            if (!bdd["coins-utilisateurs"][message.member.id]) {
                bdd["coins-utilisateurs"][message.member.id] = Math.floor(Math.random() * (4 - 1) + 1);
                bdd["level-utilisateurs"][message.member.id] = 0;
                Savebdd();
            }
            else if (bdd["coins-utilisateurs"][message.member.id] > 100 && bdd["coins-utilisateurs"][message.member.id] < 250) {
                if (bdd["level-utilisateurs"][message.member.id] == 0) {
                    bdd["level-utilisateurs"][message.member.id] = 1;
                    Savebdd();
                    return message.channel.send(`Bravo ${message.author} tu es passé niveau 1 !`);
                }
            }
            else if (bdd["coins-utilisateurs"][message.member.id] > 250 && bdd["coins-utilisateurs"][message.member.id] < 500) {
                if (bdd["level-utilisateurs"][message.member.id] == 1) {
                    bdd["level-utilisateurs"][message.member.id] = 2;
                    Savebdd();
                    return message.channel.send(`Bravo ${message.author} tu es passé niveau 2 !`);
                }
            }
            else if (bdd["coins-utilisateurs"][message.member.id] > 500 && bdd["coins-utilisateurs"][message.member.id] < 1000) {
                if (bdd["level-utilisateurs"][message.member.id] == 2) {
                    bdd["level-utilisateurs"][message.member.id] = 3;
                    Savebdd();
                    return message.channel.send(`Bravo ${message.author} tu es passé niveau 3 !`);
                }
            }
            else if (bdd["coins-utilisateurs"][message.member.id] > 1000) {
                if (bdd["level-utilisateurs"][message.member.id] == 3) {
                    bdd["level-utilisateurs"][message.member.id] = 4;
                    Savebdd();
                    return message.channel.send(`Bravo ${message.author} tu es passé niveau 4 !`);
                }
            }
        }
    }

    if (message.content.startsWith('!ban')) {
        if (message.member.hasPermission('BAN_MEMBERS')) {


            let arg = message.content.trim().split(/ +/g)

            utilisateur = message.mentions.members.first();
            temps = arg[2];
            raison = arg[3];

            if (!utilisateur) {
                return message.channel.send('Vous devez mentionner un utilisateur !');
            }
            else {
                if (!temps || isNaN(temps)) {
                    return message.channel.send('Vous devez indiquer un temps en secondes !');
                } else {
                    if (!raison) {
                        return message.channel.send('Vous devez indiquer une raison du ban !');
                    } else {
                        message.guild.members.ban(utilisateur.id);
                        setTimeout(function () {
                            message.guild.members.unban(utilisateur.id);
                        }, temps * 1000);

                    }
                }
            }


        } else {
            return message.channel.send('Tu n\'as pas les permissions nécessaires !');
        }
    }
})
function addRandomInt(member) {
    bdd["coins-utilisateurs"][member.id] = bdd["coins-utilisateurs"][member.id] + Math.floor(Math.random() * (4 - 1) + 1);
    Savebdd();
}

function Savebdd() {
    fs.writeFile("./bdd.json", JSON.stringify(bdd, null, 4), (err) => {
        if (err) message.channel.send("Une erreur est survenue.");
    });
  }


bot.login(process.env.TOKEN);
