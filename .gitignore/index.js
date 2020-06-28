const Discord = require("discord.js");
const token = require("./token.json");
const fs = require("fs");
const bdd = require("./bdd.json");
const fetch = require('node-fetch');

const bot = new Discord.Client();

bot.on("ready", async () => {
    console.log("Le bot est allumé")
    bot.user.setStatus("dnd");
    setTimeout(() => {
        bot.user.setActivity("développer mon bot");
    }, 100)
});

bot.on("guildMemberAdd", member => {
    
    if(bdd["message-bienvenue"]){
        bot.channels.cache.get('701770132812464169').send(bdd["message-bienvenue"]);
    }
    else{
        bot.channels.cache.get('701770132812464169').send("Bienvenue sur le serveur");
    }
    member.roles.add('701156465515167755');

})

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
    // commande de stats
    if (message.content.startsWith("!stats")) {
        let onlines = message.guild.members.cache.filter(({ presence }) => presence.status !== 'offline').size;
        let totalmembers = message.guild.members.cache.size;
        let totalservers = bot.guilds.cache.size;
        let totalbots = message.guild.members.cache.filter(member => member.user.bot).size;
        let totalrole = message.guild.roles.cache.get('701156465515167755').members.map(member => member.user.tag).length;

        const monembed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Statistiques')
            .setURL('https://discord.js.org/')
            .setAuthor('Mon Bot discord', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
            .setDescription('Voici les statistiques du serveur')
            .setThumbnail('https://i.imgur.com/wSTFkRM.png')
            .addFields(
                { name: 'Nombre de membrs total', value: totalmembers, inline: true },
                { name: 'Membres connéctés : ', value: onlines, inline: true },
                { name: 'Nombre de serveurs auquel le bot appartient : ', value: totalservers, inline: true },
                { name: 'Nombres de bots sur le serveur : ', value: totalbots, inline: true },
                { name: 'Nombre d\'arrivants : ', value: totalrole, inline: true },
            )
            .setImage('https://i.imgur.com/wSTFkRM.png')
            .setTimestamp()
            .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');

        message.channel.send(monembed);
    }

    //LEVEL

    if (message.content.startsWith('!lvl')) {
        if (bdd["statut-level"] == true) {
            bdd["statut-level"] = false
            Savebdd();
            return message.channel.send('Vous venez d\'arreter le système de level !');
        }
        else {
            bdd["statut-level"] = true;
            Savebdd();
            return message.channel.send('Vous venez d\'alumer le système de level !');
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
     if(message.content.startsWith('!youtube')){
        const data = await fetch('https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UCWqPk07TBQAKy695NJMnlZg&key=AIzaSyDWDZMYQwGq5ON1u7s4ZNloxp0U5MRw0zo').then(response => response.json());
        console.log(data)
        const monembed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Youtube')
            .setURL('https://discord.js.org/')
            .setAuthor('Mon Bot discord', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
            .setDescription('Voici les statistiques youtube')
            .setThumbnail('https://i.imgur.com/wSTFkRM.png')
            .addFields(
                { name: 'Nombre d\'abonnés', value: data.items[0].statistics.subscriberCount, inline: true },
                { name: 'Nombre de vidéos : ', value: data.items[0].statistics.videoCount, inline: true },
                { name: 'Nombre de vues sur la chaîne : ', value: data.items[0].statistics.viewCount, inline: true },
                // { name: 'Nombres de bots sur le serveur : ', value: totalbots, inline: true },
                // { name: 'Nombre d\'arrivants : ', value: totalrole, inline: true },
            )
            .setImage('https://i.imgur.com/wSTFkRM.png')
            .setTimestamp()
            .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');

        message.channel.send(monembed);
    }
    if (message.content.startsWith('!ban')) {
        if (message.member.hasPermission('BAN_MEMBERS')) {

            //!ban @test 1234 test

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
                        //on effectue le tempban
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
