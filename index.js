const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN) {
  console.error("Missing DISCORD_TOKEN environment variable.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

// Temporary starter product list.
// You can replace/add products later or connect this to a database.
const products = [
  {
    id: "example",
    name: "Example Product",
    price: "৳0",
    description: "Replace this with your first RareStore product."
  }
];

const purchaseQuestions = [
  "Discord username",
  "In-game username",
  "Player ID",
  "Payment method",
  "Transaction ID"
];

const commands = [
  new SlashCommandBuilder()
    .setName("products")
    .setDescription("Show RareStore products")
    .toJSON()
];

async function registerCommands() {
  if (!CLIENT_ID) {
    console.warn("CLIENT_ID is not set; slash command registration skipped.");
    return;
  }

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  if (GUILD_ID) {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("Registered /products in the test server.");
  } else {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log("Registered /products globally.");
  }
}

function productEmbed(product) {
  return new EmbedBuilder()
    .setTitle(`RareStore • ${product.name}`)
    .setDescription(product.description)
    .addFields({ name: "Price", value: product.price, inline: true })
    .setFooter({ text: "RareStore" });
}

client.once(Events.ClientReady, async readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}`);
  try {
    await registerCommands();
  } catch (error) {
    console.error("Slash command registration failed:", error);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand() && interaction.commandName === "products") {
      if (!products.length) {
        return interaction.reply("No products are configured yet.");
      }

      for (const product of products) {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`purchase:${product.id}`)
            .setLabel("Purchase")
            .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({
          embeds: [productEmbed(product)],
          components: [row]
        });

        // Only show the first product in this starter version.
        break;
      }
      return;
    }

    if (interaction.isButton() && interaction.customId.startsWith("purchase:")) {
      const productId = interaction.customId.split(":")[1];
      const product = products.find(p => p.id === productId);

      if (!product) {
        return interaction.reply({
          content: "This product is no longer available.",
          ephemeral: true
        });
      }

      await interaction.reply({
        content: "Check your DMs — RareStore will ask you a few purchase questions.",
        ephemeral: true
      });

      try {
        const dm = await interaction.user.createDM();

        await dm.send(
          `🛒 **RareStore Purchase**\n\n` +
          `Product: **${product.name}**\n` +
          `Price: **${product.price}**\n\n` +
          `Please answer these questions one by one.`
        );

        for (const question of purchaseQuestions) {
          await dm.send(`**${question}:**`);
        }

        await dm.send(
          "⚠️ Starter version: automatic answer collection is not enabled yet. " +
          "The next version will collect each answer and send the completed order to your Submission Channel."
        );
      } catch (dmError) {
        console.error("Could not DM user:", dmError);
      }
    }
  } catch (error) {
    console.error("Interaction error:", error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "Something went wrong. Please try again later.",
        ephemeral: true
      }).catch(() => {});
    }
  }
});

client.login(TOKEN);
