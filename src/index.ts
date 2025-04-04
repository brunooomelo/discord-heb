import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import client from './client.js';
import { crime } from './commands/crime.js';
import { ready } from './events/ready.js';
import { Events,  } from 'discord.js';
import { environment } from './config/environment.js';
import { stats } from './commands/stats.js';
import { addRule, getRule } from './commands/add-rule.js';


const cmds = [crime, stats,addRule,
  getRule
];

cmds.forEach((cmd) => {
  client.commands.set(cmd.data.name, cmd);
})

client.once(ready.name, (...args) => ready.execute(...args));
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  console.log(`Comando recebido: ${interaction.commandName}`);
  
  const command = client.commands.get(interaction.commandName);
  
  if (!command) {
    console.error(`Comando ${interaction.commandName} não encontrado.`);
    return;
  }
  
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Erro ao executar o comando ${interaction.commandName}:`, error);
    
    const replyContent = { 
      content: 'Ocorreu um erro ao executar este comando!', 
      ephemeral: true 
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyContent);
    } else {
      await interaction.reply(replyContent);
    }
  }
});

async function deployCommands() {
  try {
    console.log('Iniciando registro de comandos de aplicação (/)...');

    const rest = new REST({ version: '10' }).setToken(environment.token);
    const commandsJSON = cmds.map((command) => command.data.toJSON() )

    if (environment.guildId) {
      await rest.put(
        Routes.applicationGuildCommands(environment.clientId, environment.guildId),
        { body: commandsJSON }
      );
      console.log(`Comandos de aplicação registrados para a guild ${environment.guildId}`);
    } else {
      // Registrar comandos globalmente (pode levar até 1h para propagar)
      await rest.put(
        Routes.applicationCommands(environment.clientId),
        { body: commandsJSON }
      );
      console.log('Comandos de aplicação registrados globalmente');
    }
  } catch (error) {
    console.error(error);
  }
}

(async () => {
  await deployCommands();
  
  await client.login(environment.token);
})();