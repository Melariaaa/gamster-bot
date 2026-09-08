const mineflayer = require('mineflayer')
const socks = require('socks').SocksClient

class MinecraftBot {

    constructor(data, onUpdate, onLog) {

        this.data = data

        this.onUpdate = onUpdate

        this.onLog = onLog

        this.bot = null

        this.startTime = null

        this.timer = null

        this.swingTimer = null

        this.reconnectTimer = null

        this.reconnectCountdownTimer = null

        this.manualStop = false

        this.reconnectDelay = 5000
    }


    // =======================================
    // LOG
    // =======================================

    log(message) {

        this.onLog({
            id: this.data.id,
            message
        })

    }


    // =======================================
    // UPDATE
    // =======================================

    update(status, reconnectSeconds = null) {

        this.onUpdate({

            id:
                this.data.id,

            status:
                status,

            startTime:
                this.startTime,

            reconnectSeconds:
                reconnectSeconds

        })

    }


    // =======================================
    // DEMARRAGE
    // =======================================

    start() {

        if (this.bot) {
            return
        }


        this.manualStop = false


        if (this.reconnectTimer) {

            clearTimeout(
                this.reconnectTimer
            )

            this.reconnectTimer = null

        }


        if (this.reconnectCountdownTimer) {

            clearInterval(
                this.reconnectCountdownTimer
            )

            this.reconnectCountdownTimer = null

        }


        this.log(
            'Connexion au serveur...'
        )


        this.update(
            'connecting'
        )


        const options = {

            username:
                this.data.username,

            version:
                '1.8.9'

        }


        // =======================================
        // CONNEXION SANS PROXY
        // =======================================

        if (
            !this.data.proxy ||
            !this.data.proxy.enabled
        ) {

            options.host =
                'mc.gamster.org'

            options.port =
                25565

        }


        // =======================================
        // CONNEXION AVEC PROXY
        // =======================================

        else {

            const proxy =
                this.data.proxy


            options.connect =
                (client) => {

                    socks.createConnection({

                        proxy: {

                            host:
                                proxy.host,

                            port:
                                parseInt(
                                    proxy.port
                                ),

                            type:
                                5,

                            userId:
                                proxy.username,

                            password:
                                proxy.password

                        },

                        command:
                            'connect',

                        destination: {

                            host:
                                'mc.gamster.org',

                            port:
                                25565

                        }

                    }, (err, info) => {

                        if (err) {

                            this.log(
                                '❌ Erreur proxy : ' +
                                err.message
                            )

                            this.update(
                                'error'
                            )

                            return

                        }


                        client.setSocket(
                            info.socket
                        )


                        client.emit(
                            'connect'
                        )

                    })

                }

        }


        // =======================================
        // CREATION DU BOT
        // =======================================

        this.bot =
            mineflayer.createBot(
                options
            )


        // =======================================
        // BOT CONNECTE
        // =======================================

        this.bot.once(
            'spawn',
            () => {

                if (this.manualStop) {
                    return
                }


                this.startTime =
                    Date.now()


                this.update(
                    'connected'
                )


                this.log(
                    '🟢 Bot connecté.'
                )


                // =======================================
                // CONNEXION AUTOMATIQUE AU SERVEUR
                // =======================================

                setTimeout(() => {

                    if (
                        !this.bot ||
                        this.manualStop
                    ) {

                        return

                    }


                    this.bot.chat(
                        '/l ' +
                        this.data.password
                    )


                    this.log(
                        '🔐 Connexion envoyée.'
                    )

                }, 3000)


                // =======================================
                // COMPTEUR
                // =======================================

                this.timer =
                    setInterval(() => {

                        if (
                            !this.bot ||
                            this.manualStop
                        ) {

                            return

                        }


                        this.update(
                            'connected'
                        )

                    }, 1000)

            }
        )


        // =======================================
        // DECONNEXION
        // =======================================

        this.bot.on(
            'end',
            () => {

                this.clearTimers()


                const wasManualStop =
                    this.manualStop


                this.bot =
                    null


                // =======================================
                // ARRET MANUEL
                // =======================================

                if (wasManualStop) {

                    this.startTime =
                        null


                    this.update(
                        'stopped'
                    )


                    this.log(
                        '⚪ Bot arrêté.'
                    )


                    return

                }


                // =======================================
                // DECONNEXION INVOLONTAIRE
                // =======================================

                this.startTime =
                    null


                this.update(
                    'disconnected'
                )


                this.log(
                    '🔴 Bot déconnecté.'
                )


                // =======================================
                // RECONNEXION AUTOMATIQUE
                // =======================================

                this.scheduleReconnect()

            }
        )


        // =======================================
        // ERREUR
        // =======================================

        this.bot.on(
            'error',
            (err) => {

                this.log(
                    '⚠️ Erreur : ' +
                    err.message
                )


                this.update(
                    'error'
                )

            }
        )


        // =======================================
        // MOUVEMENT DU BRAS
        // =======================================

        this.swingTimer =
            setInterval(() => {

                if (
                    this.bot &&
                    this.bot.entity &&
                    !this.manualStop
                ) {

                    this.bot.swingArm(
                        'right'
                    )

                }

            }, 30000)

    }


    // =======================================
    // PROGRAMMER RECONNEXION
    // =======================================

    scheduleReconnect() {

        if (this.manualStop) {
            return
        }


        if (this.reconnectTimer) {
            return
        }


        let seconds =
            Math.ceil(
                this.reconnectDelay / 1000
            )


        // =======================================
        // PREMIER AFFICHAGE
        // =======================================

        this.update(
            'reconnecting',
            seconds
        )


        this.log(
            '🔄 Reconnexion dans ' +
            seconds +
            ' secondes...'
        )


        // =======================================
        // COMPTE A REBOURS
        // =======================================

        this.reconnectCountdownTimer =
            setInterval(() => {

                if (this.manualStop) {

                    clearInterval(
                        this.reconnectCountdownTimer
                    )

                    this.reconnectCountdownTimer =
                        null

                    return

                }


                seconds--


                if (seconds <= 0) {

                    clearInterval(
                        this.reconnectCountdownTimer
                    )

                    this.reconnectCountdownTimer =
                        null

                    return

                }


                this.update(
                    'reconnecting',
                    seconds
                )

            }, 1000)


        // =======================================
        // RECONNEXION
        // =======================================

        this.reconnectTimer =
            setTimeout(() => {

                this.reconnectTimer =
                    null


                if (this.reconnectCountdownTimer) {

                    clearInterval(
                        this.reconnectCountdownTimer
                    )

                    this.reconnectCountdownTimer =
                        null

                }


                if (this.manualStop) {
                    return
                }


                this.log(
                    '🔄 Tentative de reconnexion...'
                )


                this.start()

            }, this.reconnectDelay)

    }


    // =======================================
    // ARRET
    // =======================================

    stop() {

        this.manualStop =
            true


        // =======================================
        // ANNULER RECONNEXION
        // =======================================

        if (this.reconnectTimer) {

            clearTimeout(
                this.reconnectTimer
            )

            this.reconnectTimer =
                null

        }


        if (this.reconnectCountdownTimer) {

            clearInterval(
                this.reconnectCountdownTimer
            )

            this.reconnectCountdownTimer =
                null

        }


        this.clearTimers()


        this.startTime =
            null


        this.update(
            'stopped'
        )


        if (!this.bot) {
            return
        }


        const bot =
            this.bot


        try {

            bot.quit(
                'Arrêt depuis l’application'
            )

        } catch (error) {

            this.log(
                '⚠️ Erreur lors de l’arrêt : ' +
                error.message
            )


            this.bot =
                null

        }

    }


    // =======================================
    // NETTOYAGE DES TIMERS
    // =======================================

    clearTimers() {

        if (this.timer) {

            clearInterval(
                this.timer
            )

            this.timer =
                null

        }


        if (this.swingTimer) {

            clearInterval(
                this.swingTimer
            )

            this.swingTimer =
                null

        }

    }

}


module.exports = MinecraftBot