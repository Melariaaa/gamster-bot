const {
    app,
    BrowserWindow,
    ipcMain,
    net
} = require('electron')

const {
    autoUpdater
} = require('electron-updater')

const path = require('path')

const BotManager =
    require('./src/botManager')

const storage =
    require('./src/storage')

const license =
    require('./src/license')



let mainWindow
let botManager



// =======================================
// CONFIGURATION LICENCE
// =======================================

const LICENSE_API_URL =
    'https://nycthxaqrfzgcgtsspap.supabase.co/functions/v1/activate-license'



// Vérification automatique toutes les 30 minutes
const LICENSE_CHECK_INTERVAL =
    30 * 60 * 1000



// =======================================
// CONFIGURATION MISE À JOUR
// =======================================

// Vérification des mises à jour
// 10 secondes après le démarrage
const UPDATE_CHECK_DELAY =
    10 * 1000



// =======================================
// CRÉER LA FENÊTRE
// =======================================

function createWindow() {

    mainWindow =
        new BrowserWindow({

            width: 1100,

            height: 700,

            minWidth: 900,

            minHeight: 600,

            backgroundColor: '#0f1117',

            webPreferences: {

                preload:
                    path.join(
                        __dirname,
                        'preload.js'
                    ),

                contextIsolation: true,

                nodeIntegration: false
            }
        })



    mainWindow.loadFile(
        path.join(
            __dirname,
            'renderer',
            'index.html'
        )
    )



    botManager =
        new BotManager(
            (event, data) => {

                if (
                    mainWindow &&
                    !mainWindow.isDestroyed()
                ) {

                    mainWindow.webContents.send(
                        event,
                        data
                    )
                }
            }
        )
}



// =======================================
// MISE À JOUR AUTOMATIQUE
// =======================================

function setupAutoUpdater() {

    // Ne pas vérifier les mises à jour
    // lorsque l'application est lancée
    // directement avec "npm start".
    //
    // Les mises à jour sont destinées
    // à la version installée / distribuée.

    if (!app.isPackaged) {

        console.log(
            'Mise à jour automatique désactivée en mode développement.'
        )

        return
    }



    // ===================================
    // NOUVELLE VERSION DISPONIBLE
    // ===================================

    autoUpdater.on(
        'update-available',
        (info) => {

            console.log(
                'Nouvelle mise à jour disponible :',
                info.version
            )



            if (
                mainWindow &&
                !mainWindow.isDestroyed()
            ) {

                mainWindow.webContents.send(
                    'update-available',
                    {
                        version:
                            info.version
                    }
                )
            }
        }
    )



    // ===================================
    // AUCUNE MISE À JOUR
    // ===================================

    autoUpdater.on(
        'update-not-available',
        (info) => {

            console.log(
                'Gamster Bot est à jour.',
                info.version
            )
        }
    )



    // ===================================
    // PROGRESSION DU TÉLÉCHARGEMENT
    // ===================================

    autoUpdater.on(
        'download-progress',
        (progress) => {

            console.log(
                `Téléchargement mise à jour : ${Math.round(progress.percent)}%`
            )



            if (
                mainWindow &&
                !mainWindow.isDestroyed()
            ) {

                mainWindow.webContents.send(
                    'update-progress',
                    {
                        percent:
                            progress.percent
                    }
                )
            }
        }
    )



    // ===================================
    // MISE À JOUR TÉLÉCHARGÉE
    // ===================================

    autoUpdater.on(
        'update-downloaded',
        (info) => {

            console.log(
                'Mise à jour téléchargée :',
                info.version
            )



            if (
                mainWindow &&
                !mainWindow.isDestroyed()
            ) {

                mainWindow.webContents.send(
                    'update-downloaded',
                    {
                        version:
                            info.version
                    }
                )
            }
        }
    )



    // ===================================
    // ERREUR DE MISE À JOUR
    // ===================================

    autoUpdater.on(
        'error',
        (error) => {

            console.error(
                'Erreur mise à jour automatique :',
                error
            )



            if (
                mainWindow &&
                !mainWindow.isDestroyed()
            ) {

                mainWindow.webContents.send(
                    'update-error',
                    {
                        error:
                            error.message
                    }
                )
            }
        }
    )



    // ===================================
    // VÉRIFIER LES MISES À JOUR
    // ===================================

    setTimeout(
        async () => {

            try {

                console.log(
                    'Recherche de mises à jour...'
                )



                await autoUpdater.checkForUpdates()

            } catch (error) {

                console.error(
                    'Impossible de vérifier les mises à jour :',
                    error
                )

            }

        },

        UPDATE_CHECK_DELAY
    )
}



// =======================================
// INSTALLER LA MISE À JOUR
// =======================================

ipcMain.handle(
    'install-update',
    () => {

        if (!app.isPackaged) {

            return {
                success: false,
                error:
                    'Les mises à jour ne sont pas disponibles en mode développement.'
            }
        }



        try {

            autoUpdater.quitAndInstall(
                false,
                true
            )



            return {
                success: true
            }

        } catch (error) {

            console.error(
                'Erreur installation mise à jour :',
                error
            )



            return {
                success: false,
                error:
                    error.message
            }
        }
    }
)



// =======================================
// ACTIVER UNE LICENCE
// =======================================

async function activateLicense(
    licenseKey
) {

    const deviceId =
        license.getDeviceId()



    try {

        const response =
            await net.fetch(
                LICENSE_API_URL,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify({

                            licenseKey:
                                licenseKey.trim(),

                            deviceId:
                                deviceId
                        })
                }
            )



        const data =
            await response.json()



        if (!response.ok) {

            return {

                success: false,

                error:
                    data.error ||
                    'Licence invalide'
            }
        }



        if (!data.success) {

            return {

                success: false,

                error:
                    data.error ||
                    'Licence invalide'
            }
        }



        // Sauvegarder l'activation
        license.saveActivation({

            licenseKey:
                licenseKey.trim(),

            ownerName:
                data.ownerName ||
                null,

            deviceId:
                deviceId,

            activatedAt:
                new Date().toISOString()
        })



        return {

            success: true,

            ownerName:
                data.ownerName ||
                null
        }



    } catch (error) {

        console.error(
            'Erreur activation licence :',
            error
        )



        return {

            success: false,

            error:
                'Impossible de contacter le serveur'
        }
    }
}



// =======================================
// REVALIDER LA LICENCE
// =======================================

async function checkLicense() {

    const activation =
        license.getActivation()



    // ===================================
    // AUCUNE LICENCE ENREGISTRÉE
    // ===================================

    if (!activation) {

        return {

            success: false,

            activated: false,

            reason: 'invalid',

            error:
                'Aucune licence activée'
        }
    }



    const deviceId =
        license.getDeviceId()



    try {

        const response =
            await net.fetch(
                LICENSE_API_URL,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify({

                            licenseKey:
                                activation.licenseKey,

                            deviceId:
                                deviceId
                        })
                }
            )



        const data =
            await response.json()



        // ===================================
        // SERVEUR A RÉPONDU
        // LICENCE INVALIDE
        // ===================================

        if (!response.ok) {

            return {

                success: false,

                activated: false,

                reason: 'invalid',

                error:
                    data.error ||
                    'Licence invalide'
            }
        }



        if (!data.success) {

            return {

                success: false,

                activated: false,

                reason: 'invalid',

                error:
                    data.error ||
                    'Licence invalide'
            }
        }



        // ===================================
        // LICENCE VALIDE
        // ===================================

        return {

            success: true,

            activated: true,

            reason: 'valid',

            ownerName:
                data.ownerName ||
                null
        }



    } catch (error) {

        // ===================================
        // INTERNET / SERVEUR INACCESSIBLE
        // ===================================

        console.error(
            'Impossible de contacter le serveur de licence :',
            error
        )



        return {

            success: false,

            activated: false,

            reason: 'offline',

            error:
                'Impossible de contacter le serveur'
        }
    }
}



// =======================================
// VÉRIFICATION AUTOMATIQUE
// =======================================

let licenseCheckTimer = null



function startLicenseCheck() {

    if (licenseCheckTimer) {

        clearInterval(
            licenseCheckTimer
        )
    }



    licenseCheckTimer =
        setInterval(
            async () => {

                const result =
                    await checkLicense()



                // ===================================
                // LICENCE RÉELLEMENT INVALIDE
                // ===================================

                if (
                    !result.success &&
                    result.reason === 'invalid'
                ) {

                    console.error(
                        'Licence invalide :',
                        result.error
                    )



                    // Arrêter tous les bots
                    if (botManager) {

                        botManager.stopAll()
                    }



                    // Prévenir le renderer
                    if (
                        mainWindow &&
                        !mainWindow.isDestroyed()
                    ) {

                        mainWindow.webContents.send(
                            'license-invalid',
                            {
                                error:
                                    result.error
                            }
                        )
                    }



                    return
                }



                // ===================================
                // INTERNET INACCESSIBLE
                // ===================================

                if (
                    !result.success &&
                    result.reason === 'offline'
                ) {

                    console.warn(
                        'Serveur de licence inaccessible. Nouvelle tentative plus tard.'
                    )



                    // IMPORTANT :
                    // On NE bloque PAS l'application
                    // et on NE stoppe PAS les bots.

                    return
                }



                // ===================================
                // LICENCE VALIDE
                // ===================================

                if (result.success) {

                    console.log(
                        'Licence vérifiée avec succès.'
                    )
                }

            },

            LICENSE_CHECK_INTERVAL
        )
}



// =======================================
// DÉMARRAGE DE L'APPLICATION
// =======================================

app.whenReady().then(
    async () => {

        createWindow()



        // ===================================
        // SYSTÈME DE MISE À JOUR
        // ===================================

        setupAutoUpdater()



        // ===================================
        // VÉRIFICATION LICENCE
        // ===================================

        const result =
            await checkLicense()



        // ===================================
        // LICENCE INVALIDE AU DÉMARRAGE
        // ===================================

        if (
            !result.success &&
            result.reason === 'invalid'
        ) {

            console.error(
                'Licence invalide au démarrage :',
                result.error
            )



            if (botManager) {

                botManager.stopAll()
            }



            if (
                mainWindow &&
                !mainWindow.isDestroyed()
            ) {

                mainWindow.webContents.send(
                    'license-invalid',
                    {
                        error:
                            result.error
                    }
                )
            }
        }



        // ===================================
        // INTERNET INACCESSIBLE AU DÉMARRAGE
        // ===================================

        if (
            !result.success &&
            result.reason === 'offline'
        ) {

            console.warn(
                'Serveur de licence inaccessible au démarrage.'
            )



            // Pour cette étape :
            // on laisse l'application fonctionner.
        }



        // Démarrer la vérification automatique
        startLicenseCheck()

    }
)



// =======================================
// FERMETURE DE L'APPLICATION
// =======================================

app.on(
    'window-all-closed',
    () => {

        if (
            process.platform !== 'darwin'
        ) {

            app.quit()
        }
    }
)



// =======================================
// LICENCE - STATUT LOCAL
// =======================================

ipcMain.handle(
    'license-status',
    () => {

        const activation =
            license.getActivation()



        return {

            activated:
                !!activation,

            ownerName:
                activation?.ownerName ||
                null
        }
    }
)



// =======================================
// LICENCE - ACTIVATION
// =======================================

ipcMain.handle(
    'activate-license',
    async (
        event,
        licenseKey
    ) => {

        return await activateLicense(
            licenseKey
        )
    }
)



// =======================================
// RÉCUPÉRER LES BOTS
// =======================================

ipcMain.handle(
    'get-bots',
    () => {

        return storage.loadBots()
    }
)



// =======================================
// AJOUTER UN BOT
// =======================================

ipcMain.handle(
    'add-bot',
    (event, bot) => {

        const bots =
            storage.loadBots()



        bots.push(bot)



        storage.saveBots(
            bots
        )



        return bots
    }
)



// =======================================
// MODIFIER UN BOT
// =======================================

ipcMain.handle(
    'update-bot',
    (event, data) => {

        const {
            id,
            bot
        } = data



        const bots =
            storage.loadBots()



        const index =
            bots.findIndex(
                existingBot =>
                    existingBot.id === id
            )



        if (index === -1) {

            throw new Error(
                'Bot introuvable'
            )
        }



        bots[index] = {

            ...bots[index],

            ...bot,

            id:
                bots[index].id
        }



        storage.saveBots(
            bots
        )



        return bots
    }
)



// =======================================
// SUPPRIMER UN BOT
// =======================================

ipcMain.handle(
    'delete-bot',
    (event, id) => {

        const bots =
            storage.loadBots()



        const newBots =
            bots.filter(
                bot =>
                    bot.id !== id
            )



        storage.saveBots(
            newBots
        )



        botManager.stopBot(
            id
        )



        return newBots
    }
)



// =======================================
// LANCER UN BOT
// =======================================

ipcMain.handle(
    'start-bot',
    async (event, bot) => {

        const result =
            await checkLicense()



        if (!result.success) {

            return {
                success: false,

                error:
                    result.reason === 'offline'
                        ? 'Impossible de vérifier la licence.'
                        : result.error ||
                          'Licence invalide.'
            }
        }



        return botManager.startBot(
            bot
        )
    }
)



// =======================================
// ARRÊTER UN BOT
// =======================================

ipcMain.handle(
    'stop-bot',
    (event, id) => {

        return botManager.stopBot(
            id
        )
    }
)



// =======================================
// LANCER TOUS LES BOTS
// =======================================

ipcMain.handle(
    'start-all',
    async () => {

        const result =
            await checkLicense()



        if (!result.success) {

            return {
                success: false,

                error:
                    result.reason === 'offline'
                        ? 'Impossible de vérifier la licence.'
                        : result.error ||
                          'Licence invalide.'
            }
        }



        const bots =
            storage.loadBots()



        for (
            const bot
            of bots
        ) {

            botManager.startBot(
                bot
            )
        }



        return {
            success: true
        }
    }
)



// =======================================
// ARRÊTER TOUS LES BOTS
// =======================================

ipcMain.handle(
    'stop-all',
    () => {

        botManager.stopAll()



        return true
    }
)