const MinecraftBot = require('./minecraftBot')

class BotManager {

    constructor(send) {

        this.send = send

        this.bots = new Map()

        // Bots actuellement en attente
        // avant leur connexion
        this.pendingStarts = new Map()

        // =======================================
        // DELAI DE CONNEXION
        // =======================================

        // Minimum : 15 secondes
        this.minConnectionDelay = 15000

        // Maximum : 30 secondes
        this.maxConnectionDelay = 30000

    }


    // =======================================
    // LANCER UN BOT
    // =======================================

    async startBot(data) {

        // Déjà connecté / en cours de connexion
        if (this.bots.has(data.id)) {

            return false

        }


        // Déjà en attente
        if (
            this.pendingStarts.has(data.id)
        ) {

            return false

        }


        // =======================================
        // CHOISIR LE DELAI
        // =======================================

        const delay =
            this.getRandomDelay()


        const totalSeconds =
            Math.ceil(
                delay / 1000
            )


        // =======================================
        // ENREGISTRER L'ATTENTE
        // =======================================

        const startData = {

            cancelled:
                false,

            timer:
                null,

            countdownTimer:
                null

        }


        this.pendingStarts.set(
            data.id,
            startData
        )


        // =======================================
        // NOTIFICATION INITIALE
        // =======================================

        this.send(
            'bot-update',
            {
                id:
                    data.id,

                status:
                    'waiting',

                startTime:
                    null,

                reconnectSeconds:
                    totalSeconds,

                connectionDelay:
                    totalSeconds,

                username:
                    data.username
            }
        )


        // =======================================
        // COMPTE A REBOURS
        // =======================================

        let remaining =
            totalSeconds


        startData.countdownTimer =
            setInterval(
                () => {

                    const current =
                        this.pendingStarts.get(
                            data.id
                        )


                    if (
                        !current ||
                        current.cancelled
                    ) {

                        return

                    }


                    remaining--


                    if (
                        remaining <= 0
                    ) {

                        clearInterval(
                            startData.countdownTimer
                        )

                        startData.countdownTimer =
                            null

                        return

                    }


                    this.send(
                        'bot-update',
                        {
                            id:
                                data.id,

                            status:
                                'waiting',

                            startTime:
                                null,

                            reconnectSeconds:
                                remaining,

                            connectionDelay:
                                remaining,

                            username:
                                data.username
                        }
                    )

                },
                1000
            )


        // =======================================
        // ATTENDRE
        // =======================================

        await new Promise(
            resolve => {

                startData.timer =
                    setTimeout(
                        resolve,
                        delay
                    )

            }
        )


        // =======================================
        // RECUPERER L'ATTENTE
        // =======================================

        const current =
            this.pendingStarts.get(
                data.id
            )


        // =======================================
        // ANNULATION
        // =======================================

        if (
            !current ||
            current.cancelled
        ) {

            if (
                startData.countdownTimer
            ) {

                clearInterval(
                    startData.countdownTimer
                )

            }


            this.pendingStarts.delete(
                data.id
            )


            return false

        }


        // =======================================
        // NETTOYAGE
        // =======================================

        if (
            startData.countdownTimer
        ) {

            clearInterval(
                startData.countdownTimer
            )

        }


        this.pendingStarts.delete(
            data.id
        )


        // =======================================
        // VERIFICATION
        // =======================================

        if (
            this.bots.has(data.id)
        ) {

            return false

        }


        // =======================================
        // CREATION DU BOT
        // =======================================

        const bot =
            new MinecraftBot(
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


        // =======================================
        // CONNEXION
        // =======================================

        bot.start()


        return true

    }


    // =======================================
    // ARRETER UN BOT
    // =======================================

    stopBot(id) {

        // =======================================
        // SI LE BOT EST EN ATTENTE
        // =======================================

        const pending =
            this.pendingStarts.get(
                id
            )


        if (pending) {

            pending.cancelled =
                true


            if (
                pending.timer
            ) {

                clearTimeout(
                    pending.timer
                )

            }


            if (
                pending.countdownTimer
            ) {

                clearInterval(
                    pending.countdownTimer
                )

            }


            this.pendingStarts.delete(
                id
            )


            this.send(
                'bot-update',
                {
                    id:
                        id,

                    status:
                        'stopped',

                    startTime:
                        null,

                    reconnectSeconds:
                        null
                }
            )


            return true

        }


        // =======================================
        // BOT NORMAL
        // =======================================

        const bot =
            this.bots.get(
                id
            )


        if (!bot) {

            this.send(
                'bot-update',
                {
                    id:
                        id,

                    status:
                        'stopped',

                    startTime:
                        null
                }
            )

            return false

        }


        bot.stop()


        this.bots.delete(
            id
        )


        this.send(
            'bot-update',
            {
                id:
                    id,

                status:
                    'stopped',

                startTime:
                    null
            }
        )


        return true

    }


    // =======================================
    // LANCER TOUS LES BOTS
    // =======================================

    async startAll(bots) {

        if (
            !Array.isArray(bots)
        ) {

            return false

        }


        for (
            let i = 0;
            i < bots.length;
            i++
        ) {

            const bot =
                bots[i]


            // ===================================
            // VERIFIER SI DEJA LANCE
            // ===================================

            if (
                this.bots.has(bot.id) ||
                this.pendingStarts.has(bot.id)
            ) {

                continue

            }


            // ===================================
            // LANCER
            // ===================================

            await this.startBot(
                bot
            )

        }


        return true

    }


    // =======================================
    // DELAI ALEATOIRE
    // =======================================

    getRandomDelay() {

        const min =
            this.minConnectionDelay


        const max =
            this.maxConnectionDelay


        return Math.floor(
            Math.random() *
            (
                max -
                min +
                1
            )
        ) + min

    }


    // =======================================
    // ARRETER TOUS LES BOTS
    // =======================================

    stopAll() {

        // =======================================
        // ANNULER LES BOTS EN ATTENTE
        // =======================================

        for (
            const [
                id,
                pending
            ]
            of this.pendingStarts
        ) {

            pending.cancelled =
                true


            if (
                pending.timer
            ) {

                clearTimeout(
                    pending.timer
                )

            }


            if (
                pending.countdownTimer
            ) {

                clearInterval(
                    pending.countdownTimer
                )

            }


            this.send(
                'bot-update',
                {
                    id:
                        id,

                    status:
                        'stopped',

                    startTime:
                        null,

                    reconnectSeconds:
                        null
                }
            )

        }


        this.pendingStarts.clear()


        // =======================================
        // ARRETER LES BOTS CONNECTES
        // =======================================

        for (
            const [id, bot]
            of this.bots
        ) {

            bot.stop()


            this.send(
                'bot-update',
                {
                    id:
                        id,

                    status:
                        'stopped',

                    startTime:
                        null
                }
            )

        }


        this.bots.clear()

    }

}


module.exports = BotManager