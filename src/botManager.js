const MinecraftBot = require('./minecraftBot')

class BotManager {

    constructor(send) {

        this.send = send

        this.bots = new Map()
    }


    // =======================================
    // LANCER UN BOT
    // =======================================

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


    // =======================================
    // ARRÊTER UN BOT
    // =======================================

    stopBot(id) {

        const bot =
            this.bots.get(id)


        if (!bot) {

            // Même si le bot n'existe plus
            // dans le manager, on demande
            // à l'interface de remettre
            // le compteur à zéro.

            this.send(
                'bot-update',
                {
                    id: id,
                    status: 'stopped',
                    startTime: null
                }
            )

            return false
        }


        // Arrêt du bot Minecraft
        bot.stop()


        // Suppression du bot actif
        this.bots.delete(id)


        // IMPORTANT :
        // On informe l'interface que le bot
        // est complètement arrêté.
        //
        // startTime = null permet de stopper
        // le compteur dans app.js.

        this.send(
            'bot-update',
            {
                id: id,
                status: 'stopped',
                startTime: null
            }
        )


        return true
    }


    // =======================================
    // ARRÊTER TOUS LES BOTS
    // =======================================

    stopAll() {

        for (
            const [id, bot]
            of this.bots
        ) {

            bot.stop()


            // Remise à zéro du temps
            // pour chaque bot.

            this.send(
                'bot-update',
                {
                    id: id,
                    status: 'stopped',
                    startTime: null
                }
            )
        }


        this.bots.clear()
    }
}


module.exports = BotManager