const {
    app,
    BrowserWindow,
    ipcMain,
    net,
    Menu
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

// =========================================
// LICENCE
// =========================================

const LICENSE_API_URL =
    'https://nycthxaqrfzgcgtsspap.supabase.co/functions/v1/activate-license'

const LICENSE_CHECK_INTERVAL =
    30 * 60 * 1000

// =========================================
// MISE À JOUR
// =========================================

const UPDATE_CHECK_DELAY =
    10 * 1000

// =========================================
// FENÊTRE
// =========================================

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

    // =====================================
    // SUPPRIMER LE MENU ELECTRON
    // =====================================

    Menu.setApplicationMenu(null)

    mainWindow.loadFile(
        path.join(
            __dirname,
            'renderer',
            'index.html'
        )
    )

    // =====================================
    // BOT MANAGER
    // =====================================

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

// =========================================
// AUTO-UPDATER
// =========================================

function setupAutoUpdater() {

    if (!app.isPackaged) {

        console.log(
            'Mise à jour automatique désactivée en mode développement.'
        )

        return

    }

    // =====================================
    // MISE À JOUR DISPONIBLE
    // =====================================

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

    // =====================================
    // AUCUNE MISE À JOUR
    // =====================================

    autoUpdater.on(
        'update-not-available',
        (info) => {

            console.log(
                'Gamster Bot est à jour.',
                info.version
            )

        }
    )

    // =====================================
    // PROGRESSION
    // =====================================

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

    // =====================================
    // MISE À JOUR TÉLÉCHARGÉE
    // =====================================

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

    // =====================================
    // ERREUR
    // =====================================

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

    // =====================================
    // VÉRIFICATION APRÈS 10 SECONDES
    // =====================================

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

// =========================================
// INSTALLATION DE LA MISE À JOUR
// =========================================

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

// =========================================
// LICENCE : ACTIVATION
// =========================================

ipcMain.handle(
    'activate-license',
    async (event, licenseKey) => {

        try {

            const deviceId =
                license.getDeviceId()

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
                                licenseKey,
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
                        'Licence invalide.'
                }

            }

            license.saveActivation({
                licenseKey,
                deviceId,
                activatedAt:
                    new Date().toISOString()
            })

            return {
                success: true
            }

        } catch (error) {

            console.error(
                'Erreur activation licence :',
                error
            )

            return {
                success: false,

                error:
                    'Impossible de contacter le serveur de licence.'
            }

        }

    }
)

// =========================================
// LICENCE : STATUT
// =========================================

ipcMain.handle(
    'license-status',
    async () => {

        const activation =
            license.getActivation()

        if (!activation) {

            return {
                activated: false
            }

        }

        const result =
            await checkLicense()

        return {
            activated:
                result.valid
        }

    }
)

// =========================================
// VÉRIFICATION LICENCE
// =========================================

async function checkLicense() {

    const activation =
        license.getActivation()

    if (!activation) {

        return {
            valid: false,
            reason: 'invalid'
        }

    }

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
                                activation.deviceId
                        })
                }
            )

        const data =
            await response.json()

        if (!response.ok) {

            return {
                valid: false,
                reason: 'invalid',

                error:
                    data.error ||
                    'Licence invalide.'
            }

        }

        return {
            valid: true,
            reason: 'valid'
        }

    } catch (error) {

        console.error(
            'Erreur vérification licence :',
            error
        )

        return {
            valid: false,
            reason: 'offline',

            error:
                'Impossible de contacter le serveur de licence.'
        }

    }

}

// =========================================
// VÉRIFICATION PÉRIODIQUE LICENCE
// =========================================

function startLicenseCheck() {

    setInterval(
        async () => {

            const result =
                await checkLicense()

            if (result.reason === 'invalid') {

                console.log(
                    'Licence invalide : arrêt des bots.'
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
                                result.error ||
                                'Ta licence n’est plus valide.'
                        }
                    )

                }

            }

            if (result.reason === 'offline') {

                console.warn(
                    'Serveur de licence inaccessible. Les bots continuent de fonctionner.'
                )

            }

        },
        LICENSE_CHECK_INTERVAL
    )

}

// =========================================
// BOTS
// =========================================

ipcMain.handle(
    'get-bots',
    () => {

        return storage.loadBots()

    }
)

ipcMain.handle(
    'add-bot',
    (event, bot) => {

        const bots =
            storage.loadBots()

        const newBot = {
            ...bot,

            id:
                Date.now().toString()
        }

        bots.push(newBot)

        storage.saveBots(bots)

        return newBot

    }
)

ipcMain.handle(
    'update-bot',
    (event, data) => {

        const bots =
            storage.loadBots()

        const index =
            bots.findIndex(
                bot =>
                    bot.id === data.id
            )

        if (index === -1) {

            return {
                success: false
            }

        }

        bots[index] = {
            ...bots[index],
            ...data.bot
        }

        storage.saveBots(bots)

        return {
            success: true,
            bot: bots[index]
        }

    }
)

ipcMain.handle(
    'delete-bot',
    (event, id) => {

        const bots =
            storage.loadBots()

        if (botManager) {

            botManager.stopBot(id)

        }

        const filtered =
            bots.filter(
                bot =>
                    bot.id !== id
            )

        storage.saveBots(filtered)

        return {
            success: true
        }

    }
)

// =========================================
// START BOT
// =========================================

ipcMain.handle(
    'start-bot',
    async (event, bot) => {

        const result =
            await checkLicense()

        if (result.reason === 'invalid') {

            return {
                success: false,

                error:
                    result.error ||
                    'Licence invalide.'
            }

        }

        if (result.reason === 'offline') {

            return {
                success: false,

                error:
                    'Impossible de contacter le serveur de licence.'
            }

        }

        try {

            await botManager.startBot(bot)

            return {
                success: true
            }

        } catch (error) {

            console.error(
                'Erreur démarrage bot :',
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

// =========================================
// STOP BOT
// =========================================

ipcMain.handle(
    'stop-bot',
    async (event, id) => {

        try {

            await botManager.stopBot(id)

            return {
                success: true
            }

        } catch (error) {

            console.error(
                'Erreur arrêt bot :',
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

// =========================================
// START ALL
// =========================================

ipcMain.handle(
    'start-all',
    async () => {

        const result =
            await checkLicense()

        if (result.reason === 'invalid') {

            return {
                success: false,

                error:
                    result.error ||
                    'Licence invalide.'
            }

        }

        if (result.reason === 'offline') {

            return {
                success: false,

                error:
                    'Impossible de contacter le serveur de licence.'
            }

        }

        try {

            await botManager.startAll()

            return {
                success: true
            }

        } catch (error) {

            console.error(
                'Erreur démarrage de tous les bots :',
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

// =========================================
// STOP ALL
// =========================================

ipcMain.handle(
    'stop-all',
    async () => {

        try {

            await botManager.stopAll()

            return {
                success: true
            }

        } catch (error) {

            console.error(
                'Erreur arrêt de tous les bots :',
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

// =========================================
// DÉMARRAGE ELECTRON
// =========================================

app.whenReady().then(
    async () => {

        createWindow()

        // =====================================
        // VÉRIFICATION LICENCE AU DÉMARRAGE
        // =====================================

        const result =
            await checkLicense()

        if (result.reason === 'invalid') {

            console.log(
                'Licence invalide au démarrage.'
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
                            result.error ||
                            'Ta licence n’est plus valide.'
                    }
                )

            }

        }

        if (result.reason === 'offline') {

            console.warn(
                'Serveur de licence inaccessible au démarrage.'
            )

        }

        // =====================================
        // VÉRIFICATION PÉRIODIQUE
        // =====================================

        startLicenseCheck()

        // =====================================
        // AUTO-UPDATER
        // =====================================

        setupAutoUpdater()

        // =====================================
        // MAC
        // =====================================

        app.on(
            'activate',
            () => {

                if (
                    BrowserWindow.getAllWindows()
                        .length === 0
                ) {

                    createWindow()

                }

            }
        )

    }
)

// =========================================
// FERMETURE
// =========================================

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