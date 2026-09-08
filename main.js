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

const path =
    require('path')

const mineflayer =
    require('mineflayer')

const socks =
    require('socks').SocksClient

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
    async (
        event,
        licenseKey
    ) => {

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


            // =================================
            // SAUVEGARDE LICENCE
            // + PROFIL GAMSTER
            // =================================

            license.saveActivation({

                licenseKey,

                deviceId,

                activatedAt:
                    new Date().toISOString(),

                profile:
                    data.profile
                        ? {

                            id:
                                data.profile.id,

                            username:
                                data.profile.username,

                            avatarUrl:
                                data.profile.avatarUrl

                        }
                        : null

            })


            console.log(
                'Licence activée.',
                data.profile
            )


            return {

                success: true,

                profile:
                    data.profile || null

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
// PROFIL : STATUT
// =========================================

ipcMain.handle(
    'profile-status',
    () => {

        const activation =
            license.getActivation()


        if (
            !activation ||
            !activation.profile
        ) {

            return {

                success: false,

                profile: null

            }

        }


        return {

            success: true,

            profile:
                activation.profile

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


            if (
                result.reason ===
                'invalid'
            ) {

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


            if (
                result.reason ===
                'offline'
            ) {

                console.warn(
                    'Serveur de licence inaccessible. Les bots continuent de fonctionner.'
                )

            }

        },
        LICENSE_CHECK_INTERVAL
    )

}



// =========================================
// CRÉATION COMPTE HORS LIGNE
// =========================================

ipcMain.handle(
    'create-offline-account',
    async (
        event,
        data
    ) => {

        console.log(
            '========================================'
        )

        console.log(
            'DEMANDE CRÉATION COMPTE HORS LIGNE'
        )

        console.log(
            '========================================'
        )


        // =====================================
        // VÉRIFICATIONS
        // =====================================

        if (
            !data ||
            !data.username ||
            !data.password
        ) {

            return {

                success: false,

                error:
                    'Pseudo et mot de passe obligatoires.'

            }

        }


        const username =
            String(
                data.username
            ).trim()


        const password =
            String(
                data.password
            )


        if (!username) {

            return {

                success: false,

                error:
                    'Le pseudo est obligatoire.'

            }

        }


        if (!password) {

            return {

                success: false,

                error:
                    'Le mot de passe est obligatoire.'

            }

        }


        // =====================================
        // VÉRIFICATION LICENCE
        // =====================================

        console.log(
            'Vérification de la licence...'
        )


        const licenseResult =
            await checkLicense()


        if (
            licenseResult.reason ===
            'invalid'
        ) {

            return {

                success: false,

                error:
                    licenseResult.error ||
                    'Licence invalide.'

            }

        }


        if (
            licenseResult.reason ===
            'offline'
        ) {

            return {

                success: false,

                error:
                    'Impossible de contacter le serveur de licence.'

            }

        }


        console.log(
            'Licence valide.'
        )


        // =====================================
        // PROXY HORS LIGNE
        // =====================================

        const proxy =
            data.proxy || {
                enabled: false
            }


        const proxyEnabled =
            proxy.enabled === true


        let proxyHost = ''

        let proxyPort = 1080

        let proxyUsername = ''

        let proxyPassword = ''


        if (proxyEnabled) {

            proxyHost =
                String(
                    proxy.host || ''
                ).trim()


            proxyPort =
                parseInt(
                    proxy.port,
                    10
                )


            proxyUsername =
                String(
                    proxy.username || ''
                ).trim()


            proxyPassword =
                String(
                    proxy.password || ''
                )


            // =================================
            // VALIDATION ADRESSE PROXY
            // =================================

            if (!proxyHost) {

                return {

                    success: false,

                    error:
                        'L’adresse du proxy est obligatoire.'

                }

            }


            // =================================
            // VALIDATION PORT
            // =================================

            if (
                !Number.isInteger(proxyPort) ||
                proxyPort < 1 ||
                proxyPort > 65535
            ) {

                return {

                    success: false,

                    error:
                        'Le port du proxy est invalide.'

                }

            }


            console.log(
                'Proxy SOCKS5 activé.'
            )

            console.log(
                'Proxy :',
                `${proxyHost}:${proxyPort}`
            )

        } else {

            console.log(
                'Proxy SOCKS5 désactivé.'
            )

        }


        // =====================================
        // VARIABLES
        // =====================================

        let temporaryBot = null

        let finished = false

        let registerTimer = null

        let safetyTimer = null


        // =====================================
        // TERMINER
        // =====================================

        const finish =
            (result) => {

                if (finished) {

                    return result

                }


                finished = true


                if (registerTimer) {

                    clearTimeout(
                        registerTimer
                    )

                    registerTimer =
                        null

                }


                if (safetyTimer) {

                    clearTimeout(
                        safetyTimer
                    )

                    safetyTimer =
                        null

                }


                if (temporaryBot) {

                    try {

                        temporaryBot.removeAllListeners(
                            'message'
                        )

                        temporaryBot.removeAllListeners(
                            'messagestr'
                        )

                    } catch (error) {

                        console.error(
                            'Erreur suppression listeners :',
                            error
                        )

                    }


                    try {

                        temporaryBot.quit(
                            'Création du compte terminée'
                        )

                    } catch (error) {

                        console.error(
                            'Erreur fermeture bot temporaire :',
                            error
                        )

                    }


                    temporaryBot =
                        null

                }


                console.log(
                    'Résultat création compte :',
                    result
                )


                console.log(
                    '========================================'
                )


                return result

            }


        // =====================================
        // PROMESSE
        // =====================================

        return await new Promise(
            (resolve) => {

                // =================================
                // OPTIONS MINEFLAYER
                // =================================

                const options = {

                    username:
                        username,

                    version:
                        '1.8.9'

                }


                // =================================
                // CONNEXION DIRECTE
                // =================================

                if (!proxyEnabled) {

                    options.host =
                        'mc.gamster.org'

                    options.port =
                        25565


                    console.log(
                        'Connexion directe au serveur Minecraft...'
                    )

                    console.log(
                        'Serveur :',
                        `${options.host}:${options.port}`
                    )

                }


                // =================================
                // CONNEXION VIA SOCKS5
                // =================================

                else {

                    console.log(
                        'Connexion au serveur via proxy SOCKS5...'
                    )


                    options.connect =
                        (client) => {

                            const proxyConfig = {

                                host:
                                    proxyHost,

                                port:
                                    proxyPort,

                                type:
                                    5

                            }


                            // =========================
                            // AUTHENTIFICATION
                            // =========================

                            if (
                                proxyUsername &&
                                proxyPassword
                            ) {

                                proxyConfig.userId =
                                    proxyUsername

                                proxyConfig.password =
                                    proxyPassword

                            }


                            socks.createConnection(
                                {

                                    proxy:
                                        proxyConfig,

                                    command:
                                        'connect',

                                    destination:
                                        {

                                            host:
                                                'mc.gamster.org',

                                            port:
                                                25565

                                        }

                                },

                                (
                                    error,
                                    info
                                ) => {

                                    if (error) {

                                        console.error(
                                            '❌ Erreur connexion proxy SOCKS5 :',
                                            error.message
                                        )


                                        resolve(
                                            finish({

                                                success: false,

                                                error:
                                                    'Impossible de se connecter au proxy SOCKS5 : ' +
                                                    error.message

                                            })
                                        )


                                        try {

                                            client.destroy()

                                        } catch {

                                            // Rien à faire

                                        }


                                        return

                                    }


                                    try {

                                        client.setSocket(
                                            info.socket
                                        )


                                        client.emit(
                                            'connect'
                                        )


                                        console.log(
                                            '🟢 Connexion SOCKS5 établie.'
                                        )

                                    } catch (error) {

                                        console.error(
                                            '❌ Erreur configuration socket SOCKS5 :',
                                            error
                                        )


                                        resolve(
                                            finish({

                                                success: false,

                                                error:
                                                    'Erreur lors de la connexion via le proxy : ' +
                                                    error.message

                                            })
                                        )

                                    }

                                }
                            )

                        }

                }


                console.log(
                    'Création du bot temporaire...'
                )


                // =================================
                // CRÉATION BOT TEMPORAIRE
                // =================================

                try {

                    temporaryBot =
                        mineflayer.createBot(
                            options
                        )

                } catch (error) {

                    console.error(
                        'Impossible de créer le bot temporaire :',
                        error
                    )


                    resolve(
                        finish({

                            success: false,

                            error:
                                'Impossible de créer le bot temporaire : ' +
                                error.message

                        })
                    )


                    return

                }


                // =================================
                // TIMEOUT GLOBAL
                // =================================

                safetyTimer =
                    setTimeout(
                        () => {

                            console.error(
                                'Timeout création compte.'
                            )


                            resolve(
                                finish({

                                    success: false,

                                    error:
                                        'Le serveur Minecraft n’a pas répondu à temps.'

                                })
                            )

                        },
                        30000
                    )


                // =================================
                // SPAWN
                // =================================

                temporaryBot.once(
                    'spawn',
                    () => {

                        if (finished) {

                            return

                        }


                        console.log(
                            '========================================'
                        )

                        console.log(
                            'BOT TEMPORAIRE CONNECTÉ'
                        )

                        console.log(
                            'Pseudo :',
                            username
                        )

                        console.log(
                            'Le serveur a accepté la connexion.'
                        )

                        console.log(
                            '========================================'
                        )


                        // =========================
                        // ATTENDRE AVANT REGISTER
                        // =========================

                        console.log(
                            'Attente de 8 secondes avant /register...'
                        )


                        registerTimer =
                            setTimeout(
                                () => {

                                    if (
                                        finished ||
                                        !temporaryBot
                                    ) {

                                        return

                                    }


                                    try {

                                        const command =
                                            '/register ' +
                                            password +
                                            ' ' +
                                            password


                                        console.log(
                                            'Envoi de la commande : /register ******** ********'
                                        )


                                        temporaryBot.chat(
                                            command
                                        )


                                        console.log(
                                            'Commande /register envoyée.'
                                        )

                                    } catch (error) {

                                        console.error(
                                            'Erreur envoi /register :',
                                            error
                                        )


                                        resolve(
                                            finish({

                                                success: false,

                                                error:
                                                    'Impossible d’envoyer la commande /register : ' +
                                                    error.message

                                            })
                                        )

                                    }

                                },
                                8000
                            )

                    }
                )


                // =================================
                // MESSAGES DU SERVEUR
                // =================================

                const handleServerMessage =
                    (message) => {

                        if (finished) {

                            return

                        }


                        let text = ''


                        try {

                            text =
                                message.toString()

                        } catch (error) {

                            console.error(
                                'Impossible de lire le message serveur :',
                                error
                            )

                            return

                        }


                        const cleanText =
                            text
                                .replace(
                                    /§[0-9a-fk-or]/gi,
                                    ''
                                )
                                .replace(
                                    /<[^>]*>/g,
                                    ''
                                )
                                .trim()


                        const lowerText =
                            cleanText.toLowerCase()


                        // =================================
                        // AFFICHER MESSAGE SERVEUR
                        // =================================

                        console.log(
                            '----------------------------------------'
                        )

                        console.log(
                            '[SERVEUR MINECRAFT]'
                        )

                        console.log(
                            cleanText
                        )

                        console.log(
                            '----------------------------------------'
                        )


                        // =================================
                        // COMPTE DÉJÀ ENREGISTRÉ
                        // =================================

                        if (
                            lowerText.includes(
                                'already registered'
                            ) ||
                            lowerText.includes(
                                'déjà enregistré'
                            ) ||
                            lowerText.includes(
                                'deja enregistre'
                            ) ||
                            lowerText.includes(
                                'already exists'
                            ) ||
                            lowerText.includes(
                                'existe déjà'
                            ) ||
                            lowerText.includes(
                                'existe deja'
                            ) ||
                            lowerText.includes(
                                'already registered.'
                            )
                        ) {

                            console.log(
                                'Le pseudo est déjà enregistré.'
                            )


                            resolve(
                                finish({

                                    success: false,

                                    error:
                                        'Ce pseudo est déjà enregistré.'

                                })
                            )


                            return

                        }


                        // =================================
                        // MOT DE PASSE TROP COURT
                        // =================================

                        if (
                            (
                                lowerText.includes(
                                    'password'
                                ) ||
                                lowerText.includes(
                                    'mot de passe'
                                )
                            ) &&
                            (
                                lowerText.includes(
                                    'too short'
                                ) ||
                                lowerText.includes(
                                    'trop court'
                                ) ||
                                lowerText.includes(
                                    'minimum'
                                ) ||
                                lowerText.includes(
                                    'at least'
                                )
                            )
                        ) {

                            resolve(
                                finish({

                                    success: false,

                                    error:
                                        'Le mot de passe est trop court.'

                                })
                            )


                            return

                        }


                        // =================================
                        // COMMANDE REGISTER INCORRECTE
                        // =================================

                        if (
                            (
                                lowerText.includes(
                                    'usage'
                                ) ||
                                lowerText.includes(
                                    'utilisation'
                                )
                            ) &&
                            lowerText.includes(
                                'register'
                            )
                        ) {

                            resolve(
                                finish({

                                    success: false,

                                    error:
                                        'La commande /register n’a pas été acceptée par le serveur.'

                                })
                            )


                            return

                        }


                        // =================================
                        // ERREUR REGISTER
                        // =================================

                        if (
                            lowerText.includes(
                                'registration failed'
                            ) ||
                            lowerText.includes(
                                'register failed'
                            ) ||
                            lowerText.includes(
                                'enregistrement échoué'
                            ) ||
                            lowerText.includes(
                                'enregistrement echoue'
                            )
                        ) {

                            resolve(
                                finish({

                                    success: false,

                                    error:
                                        'Le serveur a refusé la création du compte.'

                                })
                            )


                            return

                        }


                        // =================================
                        // SUCCÈS
                        // =================================

                        if (
                            lowerText.includes(
                                'successfully registered'
                            ) ||
                            lowerText.includes(
                                'successfully'
                            ) ||
                            lowerText.includes(
                                'registration successful'
                            ) ||
                            lowerText.includes(
                                'registered successfully'
                            ) ||
                            lowerText.includes(
                                'compte créé'
                            ) ||
                            lowerText.includes(
                                'compte cree'
                            ) ||
                            lowerText.includes(
                                'compte a été créé'
                            ) ||
                            lowerText.includes(
                                'compte a ete cree'
                            ) ||
                            lowerText.includes(
                                'enregistré avec succès'
                            ) ||
                            lowerText.includes(
                                'enregistre avec succes'
                            ) ||
                            lowerText.includes(
                                'enregistré'
                            ) ||
                            lowerText.includes(
                                'enregistre'
                            )
                        ) {

                            console.log(
                                '========================================'
                            )

                            console.log(
                                'CRÉATION DU COMPTE CONFIRMÉE PAR LE SERVEUR'
                            )

                            console.log(
                                '========================================'
                            )


                            resolve(
                                finish({

                                    success: true,

                                    message:
                                        'Compte créé avec succès.'

                                })
                            )


                            return

                        }

                    }


                // =================================
                // EVENT MESSAGE
                // =================================

                temporaryBot.on(
                    'message',
                    handleServerMessage
                )


                // =================================
                // EVENT MESSAGESTR
                // =================================

                temporaryBot.on(
                    'messagestr',
                    (message) => {

                        if (finished) {

                            return

                        }


                        console.log(
                            '[messagestr]',
                            message
                        )


                        handleServerMessage(
                            message
                        )

                    }
                )


                // =================================
                // ERREUR MINEFLAYER
                // =================================

                temporaryBot.on(
                    'error',
                    (error) => {

                        if (finished) {

                            return

                        }


                        console.error(
                            '========================================'
                        )

                        console.error(
                            'ERREUR BOT TEMPORAIRE'
                        )

                        console.error(
                            error
                        )

                        console.error(
                            '========================================'
                        )


                        resolve(
                            finish({

                                success: false,

                                error:
                                    'Erreur de connexion : ' +
                                    error.message

                            })
                        )

                    }
                )


                // =================================
                // KICK
                // =================================

                temporaryBot.on(
                    'kicked',
                    (reason) => {

                        if (finished) {

                            return

                        }


                        console.error(
                            'BOT TEMPORAIRE KICK'
                        )


                        console.error(
                            'Raison :',
                            reason
                        )


                        let reasonText = ''


                        try {

                            if (
                                typeof reason ===
                                'string'
                            ) {

                                reasonText =
                                    reason

                            } else {

                                reasonText =
                                    JSON.stringify(
                                        reason
                                    )

                            }

                        } catch {

                            reasonText =
                                String(
                                    reason
                                )

                        }


                        resolve(
                            finish({

                                success: false,

                                error:
                                    'Le serveur a expulsé le bot : ' +
                                    reasonText

                            })
                        )

                    }
                )


                // =================================
                // DÉCONNEXION
                // =================================

                temporaryBot.on(
                    'end',
                    () => {

                        console.log(
                            'Bot temporaire déconnecté.'
                        )


                        if (!finished) {

                            resolve(
                                finish({

                                    success: false,

                                    error:
                                        'Le serveur a fermé la connexion avant de confirmer la création du compte.'

                                })
                            )

                        }

                    }
                )

            }
        )

    }
)



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


        bots.push(
            newBot
        )


        storage.saveBots(
            bots
        )


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


        storage.saveBots(
            bots
        )


        return {

            success: true,

            bot:
                bots[index]

        }

    }
)



ipcMain.handle(
    'delete-bot',
    (event, id) => {

        const bots =
            storage.loadBots()


        if (botManager) {

            botManager.stopBot(
                id
            )

        }


        const filtered =
            bots.filter(
                bot =>
                    bot.id !== id
            )


        storage.saveBots(
            filtered
        )


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
    async (
        event,
        bot
    ) => {

        const result =
            await checkLicense()


        if (
            result.reason ===
            'invalid'
        ) {

            return {

                success: false,

                error:
                    result.error ||
                    'Licence invalide.'

            }

        }


        if (
            result.reason ===
            'offline'
        ) {

            return {

                success: false,

                error:
                    'Impossible de contacter le serveur de licence.'

            }

        }


        try {

            await botManager.startBot(
                bot
            )


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
    async (
        event,
        id
    ) => {

        try {

            await botManager.stopBot(
                id
            )


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


        if (
            result.reason ===
            'invalid'
        ) {

            return {

                success: false,

                error:
                    result.error ||
                    'Licence invalide.'

            }

        }


        if (
            result.reason ===
            'offline'
        ) {

            return {

                success: false,

                error:
                    'Impossible de contacter le serveur de licence.'

            }

        }


        try {

            // =================================
            // CHARGE TOUS LES BOTS
            // =================================

            const bots =
                storage.loadBots()


            // =================================
            // LANCE TOUS LES BOTS
            // EN ARRIÈRE-PLAN
            // =================================

            botManager
                .startAll(
                    bots
                )
                .catch(
                    (error) => {

                        console.error(
                            'Erreur démarrage de tous les bots :',
                            error
                        )

                    }
                )


            // =================================
            // RÉPONSE IMMÉDIATE
            // =================================

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


        if (
            result.reason ===
            'invalid'
        ) {

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


        if (
            result.reason ===
            'offline'
        ) {

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
                    BrowserWindow
                        .getAllWindows()
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