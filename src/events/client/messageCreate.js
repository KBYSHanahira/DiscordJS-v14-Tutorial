const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const client = require('../../index');
const config = require('../../config/config.json');

module.exports = {
    name: "messageCreate"
};

client.on('messageCreate', async (message) => {

    let prefix = config.global.prefix;
    if (message.channel.type !== 0) return;
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    if (!message.guild) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length == 0) return;

    let command = client.commands.get(cmd);

    if (!command) command = client.commands.get(client.aliases.get(cmd))

    if (command) {
        if (command.userPermissions) {
            if (!message.member.permissions.has(PermissionsBitField.resolve(command.userPermissions || []))) return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`💢 **[${message.member.displayName}]** you don't have permissions to use this command\n\`\`\`\n${command.userPermissions || []}\n\`\`\``)
                        .setColor('Red')
                ]
            })
        }

        if (command.botPermissions) {
            if (!message.guild.members.cache.get(client.user.id).permissions.has(PermissionsBitField.resolve(command.botPermissions || []))) return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`💢 **[${message.member.displayName}]** i don't have permissions to use this command\n\`\`\`\n${command.botPermissions || []}\n\`\`\``)
                        .setColor('Red')
                ]
            })
        }

        if (command.owner, command.owner == true) {
            if (!config.developers.owner) return;

            const allowedUsers = [];

            config.developers.owner.forEach(user => {
                const fetchOwner = message.guild.members.cache.get(user);
                if (!fetchOwner) return allowedUsers.push(`**[Unknown#0000]**`)
                allowedUsers.push(`${fetchOwner.user.tag}`);
            });

            if (!config.developers.owner.some(ID => message.member.id.includes(ID))) return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`💢 **[${message.member.displayName}]** only owners can use this command!\n\`\`\`\n${allowedUsers.join(", ")}\n\`\`\``)
                        .setColor('Red')
                ]
            })
        }

        try {
            command.run(client, message, args);
        } catch (err) {
            console.log(err);
        }
    }
})