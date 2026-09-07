const MinecraftBot = require('./minecraftBot')

class BotManager {

    constructor(send) {

        this.send = send

        this.bots = new Map()
    }

    startBot(data) {

        if (this.bots.has(data.id)) {
            return false
        }

        const bot = new MinecraftBot(

            data,

            (update) => {
                this.send(
                    'bot-update',
                    update
                )
            },

            (log) => {
                this.send(
                    'bot-log',
                    log
                )
            }
        )

        this.bots.set(
            data.id,
            bot
        )

        bot.start()

        return true
    }

    stopBot(id) {

        const bot =
            this.bots.get(id)

        if (!bot) {
            return false
        }

        bot.stop()

        this.bots.delete(id)

        return true
    }

    stopAll() {

        for (
            const [id, bot]
            of this.bots
        ) {

            bot.stop()
        }

        this.bots.clear()
    }
}

module.exports = BotManager