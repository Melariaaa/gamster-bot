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
    }


    log(message) {

        this.onLog({
            id: this.data.id,
            message
        })
    }


    update(status) {

        this.onUpdate({

            id: this.data.id,

            status: status,

            startTime: this.startTime
        })
    }


    start() {

        if (this.bot) {
            return
        }


        this.log('Connexion au serveur...')

        this.update('connecting')


        const options = {

            username: this.data.username,

            version: '1.8.9'
        }


        // ==========================================
        // SANS PROXY
        // ==========================================

        if (
            !this.data.proxy ||
            !this.data.proxy.enabled
        ) {

            options.host = 'mc.gamster.org'

            options.port = 25565
        }


        // ==========================================
        // AVEC PROXY SOCKS5
        // ==========================================

        else {

            const proxy =
                this.data.proxy


            options.connect = (client) => {

                socks.createConnection({

                    proxy: {

                        host: proxy.host,

                        port: parseInt(
                            proxy.port
                        ),

                        type: 5,

                        userId:
                            proxy.username,

                        password:
                            proxy.password
                    },

                    command: 'connect',

                    destination: {

                        host: 'mc.gamster.org',

                        port: 25565
                    }

                }, (err, info) => {

                    if (err) {

                        this.log(
                            '❌ Erreur proxy : ' +
                            err.message
                        )

                        this.update('error')

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

                this.startTime =
                    Date.now()


                this.update(
                    'connected'
                )


                this.log(
                    '🟢 Bot connecté.'
                )


                // Connexion au serveur
                setTimeout(() => {

                    if (!this.bot) {
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


                // Compteur
                this.timer =
                    setInterval(() => {

                        if (!this.bot) {
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

                this.bot = null

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
                    this.bot.entity
                ) {

                    this.bot.swingArm(
                        'right'
                    )
                }

            }, 30000)
    }


    stop() {

        if (!this.bot) {
            return
        }


        this.clearTimers()


        this.bot.quit(
            'Arrêt depuis l’application'
        )


        this.bot = null


        this.update(
            'stopped'
        )
    }


    clearTimers() {

        if (this.timer) {

            clearInterval(
                this.timer
            )

            this.timer = null
        }


        if (this.swingTimer) {

            clearInterval(
                this.swingTimer
            )

            this.swingTimer = null
        }
    }
}


module.exports = MinecraftBot