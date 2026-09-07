const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld(
    'electronAPI',
    {

        // =======================================
        // LICENCE
        // =======================================

        licenseStatus: () =>
            ipcRenderer.invoke(
                'license-status'
            ),


        activateLicense: (licenseKey) =>
            ipcRenderer.invoke(
                'activate-license',
                licenseKey
            ),


        onLicenseInvalid: (callback) => {

            ipcRenderer.on(
                'license-invalid',
                (event, data) => {

                    callback(data)

                }
            )

        },


        // =======================================
        // MISE À JOUR
        // =======================================

        onUpdateAvailable: (callback) => {

            ipcRenderer.on(
                'update-available',
                (event, data) => {

                    callback(data)

                }
            )

        },


        onUpdateProgress: (callback) => {

            ipcRenderer.on(
                'update-progress',
                (event, data) => {

                    callback(data)

                }
            )

        },


        onUpdateDownloaded: (callback) => {

            ipcRenderer.on(
                'update-downloaded',
                (event, data) => {

                    callback(data)

                }
            )

        },


        onUpdateError: (callback) => {

            ipcRenderer.on(
                'update-error',
                (event, data) => {

                    callback(data)

                }
            )

        },


        installUpdate: () =>
            ipcRenderer.invoke(
                'install-update'
            ),


        // =======================================
        // BOTS
        // =======================================

        getBots: () =>
            ipcRenderer.invoke(
                'get-bots'
            ),


        addBot: (bot) =>
            ipcRenderer.invoke(
                'add-bot',
                bot
            ),


        updateBot: (id, bot) =>
            ipcRenderer.invoke(
                'update-bot',
                {
                    id,
                    bot
                }
            ),


        deleteBot: (id) =>
            ipcRenderer.invoke(
                'delete-bot',
                id
            ),


        // =======================================
        // LANCEMENT / ARRÊT
        // =======================================

        startBot: (bot) =>
            ipcRenderer.invoke(
                'start-bot',
                bot
            ),


        stopBot: (id) =>
            ipcRenderer.invoke(
                'stop-bot',
                id
            ),


        startAll: () =>
            ipcRenderer.invoke(
                'start-all'
            ),


        stopAll: () =>
            ipcRenderer.invoke(
                'stop-all'
            ),


        // =======================================
        // ÉVÉNEMENTS
        // =======================================

        onBotUpdate: (callback) => {

            ipcRenderer.on(
                'bot-update',
                (event, data) => {

                    callback(data)

                }
            )

        },


        onBotLog: (callback) => {

            ipcRenderer.on(
                'bot-log',
                (event, data) => {

                    callback(data)

                }
            )

        },


        // =======================================
        // RETIRER LES ÉVÉNEMENTS
        // =======================================

        removeBotUpdateListener: () => {

            ipcRenderer.removeAllListeners(
                'bot-update'
            )

        },


        removeBotLogListener: () => {

            ipcRenderer.removeAllListeners(
                'bot-log'
            )

        }

    }
)