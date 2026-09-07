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
        // BOTS
        // =======================================

        // Récupérer tous les bots
        getBots: () =>
            ipcRenderer.invoke(
                'get-bots'
            ),


        // Ajouter un bot
        addBot: (bot) =>
            ipcRenderer.invoke(
                'add-bot',
                bot
            ),


        // Modifier un bot
        updateBot: (id, bot) =>
            ipcRenderer.invoke(
                'update-bot',
                {
                    id,
                    bot
                }
            ),


        // Supprimer un bot
        deleteBot: (id) =>
            ipcRenderer.invoke(
                'delete-bot',
                id
            ),


        // =======================================
        // LANCEMENT / ARRÊT
        // =======================================

        // Lancer un bot
        startBot: (bot) =>
            ipcRenderer.invoke(
                'start-bot',
                bot
            ),


        // Arrêter un bot
        stopBot: (id) =>
            ipcRenderer.invoke(
                'stop-bot',
                id
            ),


        // Lancer tous les bots
        startAll: () =>
            ipcRenderer.invoke(
                'start-all'
            ),


        // Arrêter tous les bots
        stopAll: () =>
            ipcRenderer.invoke(
                'stop-all'
            ),


        // =======================================
        // ÉVÉNEMENTS
        // =======================================

        // Mise à jour d'un bot
        onBotUpdate: (callback) => {

            ipcRenderer.on(
                'bot-update',
                (event, data) => {

                    callback(data)

                }
            )
        },


        // Logs des bots
        onBotLog: (callback) => {

            ipcRenderer.on(
                'bot-log',
                (event, data) => {

                    callback(data)

                }
            )
        },


        // Retirer les événements
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