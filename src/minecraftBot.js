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

        // Permet de différencier :
        // - une vraie déconnexion
        // - un arrêt demandé depuis l'application
        this.manualStop = false
    }


    // ==========================================
    // LOG
    // ==========================================

    log(message) {

        this.onLog({
            id: this.data.id,
            message
        })
    }


    // ==========================================
    // UPDATE
    // ==========================================

    update(status) {

        this.onUpdate({

            id: this.data.id,

            status: status,

            startTime: this.startTime
        })
    }


    // ==========================================
    // START
    // ==========================================

    start() {

        if (this.bot) {
            return
        }


        // Nouveau démarrage :
        // on considère que l'arrêt précédent
        // n'est plus actif.

        this.manualStop = false


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


        // ==========================================
        // SANS PROXY
        // ==========================================

        if (
            !this.data.proxy ||
            !this.data.proxy.enabled
        ) {

            options.host =
                'mc.gamster.org'

            options.port =
                25565
        }


        // ==========================================
        // AVEC PROXY SOCKS5
        // ==========================================

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


        // ==========================================
        // CREATION DU BOT
        // ==========================================

        this.bot =
            mineflayer.createBot(
                options
            )


        // ==========================================
        // CONNEXION
        // ==========================================

        this.bot.once(
            'spawn',
            () => {

                // Si le bot a été arrêté
                // avant d'arriver au spawn,
                // on ne démarre pas le compteur.

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


                // ======================================
                // CONNEXION SERVEUR
                // ======================================

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


                // ======================================
                // COMPTEUR
                // ======================================

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


        // ==========================================
        // DECONNEXION
        // ==========================================

        this.bot.on(
            'end',
            () => {

                this.clearTimers()


                // Sauvegarde de la raison
                // avant de nettoyer le bot.

                const wasManualStop =
                    this.manualStop


                this.bot = null


                // ======================================
                // ARRET DEMANDE PAR L'APPLICATION
                // ======================================

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


                // ======================================
                // DECONNEXION NORMALE
                // ======================================

                this.startTime =
                    null


                this.update(
                    'disconnected'
                )


                this.log(
                    '🔴 Bot déconnecté.'
                )
            }
        )


        // ==========================================
        // ERREUR
        // ==========================================

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


        // ==========================================
        // AFK
        // ==========================================

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


    // ==========================================
    // STOP
    // ==========================================

    stop() {

        // On indique AVANT quit()
        // qu'il s'agit d'un arrêt volontaire.

        this.manualStop = true


        this.clearTimers()


        // Le compteur doit être arrêté
        // immédiatement.

        this.startTime =
            null


        // On informe immédiatement
        // l'interface.

        this.update(
            'stopped'
        )


        if (!this.bot) {

            return
        }


        const bot =
            this.bot


        // On ne met PAS this.bot = null ici.
        //
        // On laisse l'événement "end"
        // faire le nettoyage correctement.

        try {

            bot.quit(
                'Arrêt depuis l’application'
            )

        } catch (error) {

            this.log(
                '⚠️ Erreur lors de l’arrêt : ' +
                error.message
            )


            this.bot = null
        }
    }


    // ==========================================
    // NETTOYAGE DES TIMERS
    // ==========================================

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