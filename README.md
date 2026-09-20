# RareStore Discord Bot

Starter Node.js + discord.js bot for RareStore.

## Environment variables

Set these in your hosting provider's Secrets/Environment Variables:

- `DISCORD_TOKEN` = your Discord bot token
- `CLIENT_ID` = `1524585372980609065`
- `GUILD_ID` = your test server ID (recommended while testing)

**Do not send your bot token in chat or commit it to GitHub.**

## Run

```bash
npm install
npm start
```

## Current starter features

- `/products`
- Example product embed
- Purchase button
- Opens the purchaser's DM
- Shows the planned purchase questions

The next build can add:
- Real product management
- DM question-by-question answer collection
- Submission Channel
- Approve / Reject buttons
- Rejection reason
- Private order tickets
- Admin commands
- Persistent database
