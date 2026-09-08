let bots = []

let states = {}

let selectedBotId = null

let botToDeleteId = null

let logs = []

let currentPage = 'bots'


// =======================================
// NOTIFICATION CONNEXION
// =======================================

let connectionNotification = null

let connectionNotificationHideTimer = null

let connectionNotificationRemoveTimer = null


// =======================================
// VERIFIER SI UN BOT ATTEND
// =======================================

function hasWaitingBot() {

    return bots.some(
        bot => {

            const state =
                states[bot.id]

            return (
                state &&
                state.status === 'waiting'
            )

        }
    )

}


// =======================================
// AFFICHER NOTIFICATION
// =======================================

function showConnectionNotification(data) {

    if (!data) {

        return

    }


    if (
        data.status !== 'waiting'
    ) {

        return

    }


    // ===================================
    // ANNULER LA DISPARITION PREVUE
    // ===================================

    if (
        connectionNotificationHideTimer
    ) {

        clearTimeout(
            connectionNotificationHideTimer
        )

        connectionNotificationHideTimer =
            null

    }


    // ===================================
    // ANNULER LA SUPPRESSION PREVUE
    // ===================================

    if (
        connectionNotificationRemoveTimer
    ) {

        clearTimeout(
            connectionNotificationRemoveTimer
        )

        connectionNotificationRemoveTimer =
            null

    }


    // ===================================
    // CREATION DE LA NOTIFICATION
    // ===================================

    if (!connectionNotification) {

        connectionNotification =
            document.createElement(
                'div'
            )


        connectionNotification.style.position =
            'fixed'

        connectionNotification.style.top =
            '82px'

        connectionNotification.style.left =
            '50%'

        connectionNotification.style.transform =
            'translateX(-50%)'

        connectionNotification.style.zIndex =
            '9999'

        connectionNotification.style.minWidth =
            '300px'

        connectionNotification.style.maxWidth =
            '420px'

        connectionNotification.style.padding =
            '14px 18px'

        connectionNotification.style.border =
            '1px solid rgba(139, 92, 246, 0.45)'

        connectionNotification.style.borderRadius =
            '14px'

        connectionNotification.style.background =
            'linear-gradient(135deg, rgba(25, 22, 40, 0.97), rgba(15, 15, 24, 0.97))'

        connectionNotification.style.boxShadow =
            '0 12px 35px rgba(0, 0, 0, 0.35), 0 0 25px rgba(139, 92, 246, 0.12)'

        connectionNotification.style.backdropFilter =
            'blur(12px)'

        connectionNotification.style.color =
            '#ffffff'

        connectionNotification.style.fontFamily =
            'inherit'

        connectionNotification.style.textAlign =
            'center'

        connectionNotification.style.transition =
            'opacity 0.25s ease, transform 0.25s ease'


        document.body.appendChild(
            connectionNotification
        )

    }


    // ===================================
    // TEMPS RESTANT
    // ===================================

    const seconds =
        Number(
            data.reconnectSeconds
        )


    const username =
        escapeHtml(
            data.username ||
            'Bot'
        )


    // ===================================
    // CONTENU
    // ===================================

    connectionNotification.innerHTML = `

        <div style="
            font-size: 22px;
            margin-bottom: 6px;
        ">
            ⏱️
        </div>

        <div style="
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 5px;
        ">
            Connexion de ${username}
        </div>

        <div style="
            font-size: 13px;
            color: #aeb4c3;
        ">
            Connexion dans
            <strong style="
                color: #a98aff;
                font-size: 18px;
            ">
                ${seconds}s
            </strong>
        </div>

    `


    // ===================================
    // AFFICHER UNIQUEMENT DANS BOTS
    // ===================================

    if (
        currentPage === 'bots'
    ) {

        connectionNotification.style.display =
            'block'

        connectionNotification.style.opacity =
            '1'

        connectionNotification.style.transform =
            'translateX(-50%)'

    } else {

        connectionNotification.style.display =
            'none'

    }

}


// =======================================
// MASQUER LA NOTIFICATION
// =======================================

function hideConnectionNotification() {

    if (
        !connectionNotification
    ) {

        return

    }


    // ===================================
    // ANNULER ANCIEN TIMER
    // ===================================

    if (
        connectionNotificationHideTimer
    ) {

        clearTimeout(
            connectionNotificationHideTimer
        )

        connectionNotificationHideTimer =
            null

    }


    // ===================================
    // ATTENDRE AVANT DE MASQUER
    // ===================================

    connectionNotificationHideTimer =
        setTimeout(
            () => {

                connectionNotificationHideTimer =
                    null


                if (
                    !connectionNotification
                ) {

                    return

                }


                // ===================================
                // SI UN AUTRE BOT ATTEND
                // ===================================

                if (
                    hasWaitingBot()
                ) {

                    return

                }


                // ===================================
                // SI ON EST DANS UNE AUTRE PAGE
                // ===================================

                if (
                    currentPage !== 'bots'
                ) {

                    connectionNotification.style.display =
                        'none'

                    return

                }


                // ===================================
                // MASQUER
                // ===================================

                connectionNotification.style.opacity =
                    '0'

                connectionNotification.style.transform =
                    'translateX(-50%) translateY(-8px)'


                // ===================================
                // SUPPRESSION DU DOM
                // ===================================

                if (
                    connectionNotificationRemoveTimer
                ) {

                    clearTimeout(
                        connectionNotificationRemoveTimer
                    )

                }


                connectionNotificationRemoveTimer =
                    setTimeout(
                        () => {

                            if (
                                connectionNotification &&
                                !hasWaitingBot()
                            ) {

                                connectionNotification.remove()

                                connectionNotification =
                                    null

                            }


                            connectionNotificationRemoveTimer =
                                null

                        },
                        250
                    )

            },
            1500
        )

}


// =======================================
// ELEMENTS
// =======================================

const botList =
    document.getElementById('botList')

const botCount =
    document.getElementById('botCount')

const modal =
    document.getElementById('modal')

const settingsModal =
    document.getElementById('settingsModal')


const usernameInput =
    document.getElementById('username')

const passwordInput =
    document.getElementById('password')


const proxyEnabled =
    document.getElementById('proxyEnabled')

const proxyHost =
    document.getElementById('proxyHost')

const proxyPort =
    document.getElementById('proxyPort')

const proxyUsername =
    document.getElementById('proxyUsername')

const proxyPassword =
    document.getElementById('proxyPassword')


// =======================================
// ELEMENTS PROFIL
// =======================================

const profileButton =
    document.getElementById('profileButton')

const profileAvatar =
    document.getElementById('profileAvatar')

const profileUsername =
    document.getElementById('profileUsername')


// =======================================
// ELEMENTS NAVIGATION
// =======================================

const botsTab =
    document.getElementById('botsTab')

const offlineAccountsTab =
    document.getElementById(
        'offlineAccountsTab'
    )

const logsTab =
    document.getElementById('logsTab')

const logsPage =
    document.getElementById('logsPage')

const botsPage =
    document.getElementById('botsPage')

const offlineAccountsPage =
    document.getElementById(
        'offlineAccountsPage'
    )

const logsContainer =
    document.getElementById('logsContainer')


// =======================================
// ELEMENTS COMPTES HORS LIGNE
// =======================================

const offlineUsername =
    document.getElementById(
        'offlineUsername'
    )

const offlinePassword =
    document.getElementById(
        'offlinePassword'
    )

const offlinePasswordConfirm =
    document.getElementById(
        'offlinePasswordConfirm'
    )


// =======================================
// PROXY COMPTES HORS LIGNE
// =======================================

const offlineProxyEnabled =
    document.getElementById(
        'offlineProxyEnabled'
    )

const offlineProxyHost =
    document.getElementById(
        'offlineProxyHost'
    )

const offlineProxyPort =
    document.getElementById(
        'offlineProxyPort'
    )

const offlineProxyUsername =
    document.getElementById(
        'offlineProxyUsername'
    )

const offlineProxyPassword =
    document.getElementById(
        'offlineProxyPassword'
    )


// =======================================
// AFFICHAGE PROXY COMPTES HORS LIGNE
// =======================================

const offlineProxyFields =
    document.getElementById(
        'offlineProxyFields'
    )


if (
    offlineProxyEnabled &&
    offlineProxyFields
) {

    offlineProxyEnabled.addEventListener(
        'change',
        () => {

            if (
                offlineProxyEnabled.checked
            ) {

                offlineProxyFields.style.display =
                    'block'

            } else {

                offlineProxyFields.style.display =
                    'none'

            }

        }
    )

}


const executeOfflineAccount =
    document.getElementById(
        'executeOfflineAccount'
    )

const offlineAccountResult =
    document.getElementById(
        'offlineAccountResult'
    )


// =======================================
// ELEMENTS POPUP SUPPRESSION
// =======================================

const deleteModal =
    document.getElementById('deleteModal')

const deleteBotName =
    document.getElementById('deleteBotName')

const cancelDelete =
    document.getElementById('cancelDelete')

const confirmDelete =
    document.getElementById('confirmDelete')


// =======================================
// NAVIGATION BOTS
// =======================================

function showBotsPage() {

    currentPage = 'bots'


    if (botsPage) {

        botsPage.classList.add(
            'active'
        )

    }


    if (offlineAccountsPage) {

        offlineAccountsPage.classList.remove(
            'active'
        )

    }


    if (logsPage) {

        logsPage.classList.remove(
            'active'
        )

    }


    if (botsTab) {

        botsTab.classList.add(
            'active'
        )

    }


    if (offlineAccountsTab) {

        offlineAccountsTab.classList.remove(
            'active'
        )

    }


    if (logsTab) {

        logsTab.classList.remove(
            'active'
        )

    }


    // ===================================
    // REAFFICHER LA NOTIFICATION
    // SI UN BOT ATTEND
    // ===================================

    if (
        connectionNotification &&
        hasWaitingBot()
    ) {

        connectionNotification.style.display =
            'block'

        connectionNotification.style.opacity =
            '1'

        connectionNotification.style.transform =
            'translateX(-50%)'

    }

}


// =======================================
// NAVIGATION COMPTES HORS LIGNE
// =======================================

function showOfflineAccountsPage() {

    currentPage =
        'offlineAccounts'


    if (botsPage) {

        botsPage.classList.remove(
            'active'
        )

    }


    if (offlineAccountsPage) {

        offlineAccountsPage.classList.add(
            'active'
        )

    }


    if (logsPage) {

        logsPage.classList.remove(
            'active'
        )

    }


    if (botsTab) {

        botsTab.classList.remove(
            'active'
        )

    }


    if (offlineAccountsTab) {

        offlineAccountsTab.classList.add(
            'active'
        )

    }


    if (logsTab) {

        logsTab.classList.remove(
            'active'
        )

    }


    // ===================================
    // MASQUER LA NOTIFICATION
    // ===================================

    if (
        connectionNotification
    ) {

        connectionNotification.style.display =
            'none'

    }

}


// =======================================
// NAVIGATION LOGS
// =======================================

function showLogsPage() {

    currentPage = 'logs'


    if (botsPage) {

        botsPage.classList.remove(
            'active'
        )

    }


    if (offlineAccountsPage) {

        offlineAccountsPage.classList.remove(
            'active'
        )

    }


    if (logsPage) {

        logsPage.classList.add(
            'active'
        )

    }


    if (botsTab) {

        botsTab.classList.remove(
            'active'
        )

    }


    if (offlineAccountsTab) {

        offlineAccountsTab.classList.remove(
            'active'
        )

    }


    if (logsTab) {

        logsTab.classList.add(
            'active'
        )

    }


    // ===================================
    // MASQUER LA NOTIFICATION DANS LOGS
    // ===================================

    if (
        connectionNotification
    ) {

        connectionNotification.style.display =
            'none'

    }


    renderLogs()

}


// =======================================
// BOUTON BOTS
// =======================================

if (botsTab) {

    botsTab.onclick = () => {

        showBotsPage()

    }

}


// =======================================
// BOUTON COMPTES HORS LIGNE
// =======================================

if (offlineAccountsTab) {

    offlineAccountsTab.onclick = () => {

        showOfflineAccountsPage()

    }

}


// =======================================
// BOUTON LOGS
// =======================================

if (logsTab) {

    logsTab.onclick = () => {

        showLogsPage()

    }

}


// =======================================
// CREATION COMPTE HORS LIGNE
// =======================================

if (executeOfflineAccount) {

    executeOfflineAccount.onclick = async () => {

        const username =
            offlineUsername.value.trim()

        const password =
            offlinePassword.value

        const passwordConfirm =
            offlinePasswordConfirm.value


        // ===================================
        // PROXY HORS LIGNE
        // ===================================

        const proxy = {

            enabled:
                offlineProxyEnabled
                    ? offlineProxyEnabled.checked
                    : false,

            host:
                offlineProxyHost
                    ? offlineProxyHost.value.trim()
                    : '',

            port:
                offlineProxyPort
                    ? Number(
                        offlineProxyPort.value
                    ) || 1080
                    : 1080,

            username:
                offlineProxyUsername
                    ? offlineProxyUsername.value.trim()
                    : '',

            password:
                offlineProxyPassword
                    ? offlineProxyPassword.value
                    : ''

        }


        // ===================================
        // VERIFICATION PSEUDO
        // ===================================

        if (!username) {

            alert(
                'Entre le pseudo Minecraft.'
            )

            offlineUsername.focus()

            return

        }


        // ===================================
        // VERIFICATION MOT DE PASSE
        // ===================================

        if (!password) {

            alert(
                'Entre le mot de passe serveur.'
            )

            offlinePassword.focus()

            return

        }


        // ===================================
        // CONFIRMATION MOT DE PASSE
        // ===================================

        if (
            password !== passwordConfirm
        ) {

            alert(
                'Les deux mots de passe ne correspondent pas.'
            )

            offlinePasswordConfirm.focus()

            return

        }


        // ===================================
        // VERIFICATION PROXY
        // ===================================

        if (
            proxy.enabled
        ) {

            if (!proxy.host) {

                alert(
                    'Entre l’adresse du proxy SOCKS5.'
                )

                if (
                    offlineProxyHost
                ) {

                    offlineProxyHost.focus()

                }

                return

            }


            if (
                !Number.isInteger(proxy.port) ||
                proxy.port < 1 ||
                proxy.port > 65535
            ) {

                alert(
                    'Le port du proxy est invalide.'
                )

                if (
                    offlineProxyPort
                ) {

                    offlineProxyPort.focus()

                }

                return

            }

        }


        // ===================================
        // DESACTIVER LE BOUTON
        // ===================================

        executeOfflineAccount.disabled =
            true

        executeOfflineAccount.textContent =
            '⏳ Création en cours...'


        // ===================================
        // MESSAGE RESULTAT
        // ===================================

        if (offlineAccountResult) {

            offlineAccountResult.classList.add(
                'hidden'
            )

            offlineAccountResult.textContent =
                ''

        }


        try {

            const result =
                await window.electronAPI.createOfflineAccount(
                    username,
                    password,
                    proxy
                )


            // ===================================
            // SUCCES
            // ===================================

            if (
                result &&
                result.success
            ) {

                if (offlineAccountResult) {

                    offlineAccountResult.textContent =
                        '✅ Compte créé avec succès. Tu peux maintenant ajouter ce compte dans l’onglet Bots.'

                    offlineAccountResult.classList.remove(
                        'hidden'
                    )

                }


                // ===================================
                // VIDER LES CHAMPS
                // ===================================

                offlineUsername.value =
                    ''

                offlinePassword.value =
                    ''

                offlinePasswordConfirm.value =
                    ''


                // ===================================
                // VIDER LE PROXY
                // ===================================

                if (
                    offlineProxyEnabled
                ) {

                    offlineProxyEnabled.checked =
                        false

                }


                if (
                    offlineProxyFields
                ) {

                    offlineProxyFields.style.display =
                        'none'

                }


                if (
                    offlineProxyHost
                ) {

                    offlineProxyHost.value =
                        ''

                }


                if (
                    offlineProxyPort
                ) {

                    offlineProxyPort.value =
                        1080

                }


                if (
                    offlineProxyUsername
                ) {

                    offlineProxyUsername.value =
                        ''

                }


                if (
                    offlineProxyPassword
                ) {

                    offlineProxyPassword.value =
                        ''

                }

            } else {

                throw new Error(
                    result &&
                    result.error
                        ? result.error
                        : 'Impossible de créer le compte.'
                )

            }

        } catch (error) {

            console.error(
                'Erreur création compte hors ligne :',
                error
            )


            if (offlineAccountResult) {

                offlineAccountResult.textContent =
                    '❌ ' +
                    (
                        error.message ||
                        'Impossible de créer le compte.'
                    )

                offlineAccountResult.classList.remove(
                    'hidden'
                )

            }

        }


        // ===================================
        // REACTIVER LE BOUTON
        // ===================================

        executeOfflineAccount.disabled =
            false

        executeOfflineAccount.textContent =
            '▶ Exécuter'

    }

}


// =======================================
// CHARGEMENT DU PROFIL
// =======================================

async function loadProfile() {

    try {

        const result =
            await window.electronAPI.profileStatus()


        if (
            result &&
            result.success &&
            result.profile
        ) {

            const profile =
                result.profile


            // ---------------------------------
            // PSEUDO
            // ---------------------------------

            if (
                profileUsername &&
                profile.username
            ) {

                profileUsername.textContent =
                    profile.username

            }


            // ---------------------------------
            // AVATAR
            // ---------------------------------

            if (
                profileAvatar &&
                profile.avatarUrl
            ) {

                profileAvatar.src =
                    profile.avatarUrl

            }

        }

    } catch (error) {

        console.error(
            'Erreur lors du chargement du profil :',
            error
        )

    }

}


// =======================================
// CHARGEMENT DES BOTS
// =======================================

async function loadBots() {

    try {

        const result =
            await window.electronAPI.getBots()


        if (Array.isArray(result)) {

            bots = result

        } else {

            bots = []

        }


        render()

    } catch (error) {

        console.error(
            'Erreur lors du chargement des bots :',
            error
        )

        bots = []

        render()

    }

}


// =======================================
// BOUTON LANCER / ARRETER TOUT
// =======================================

function updateToggleAllButton() {

    const button =
        document.getElementById(
            'toggleAllBots'
        )


    const icon =
        document.getElementById(
            'toggleAllIcon'
        )


    const text =
        document.getElementById(
            'toggleAllText'
        )


    if (
        !button ||
        !icon ||
        !text
    ) {

        return

    }


    const hasRunningBot =
        bots.some(bot => {

            const state =
                states[bot.id]


            return (
                state &&
                (
                    state.status === 'connected' ||
                    state.status === 'connecting' ||
                    state.status === 'waiting' ||
                    state.status === 'reconnecting'
                )
            )

        })


    if (hasRunningBot) {

        icon.textContent =
            '■'


        text.textContent =
            'Arrêter tout'


        button.classList.add(
            'danger'
        )


        button.classList.remove(
            'success'
        )

    } else {

        icon.textContent =
            '▶'


        text.textContent =
            'Lancer tout'


        button.classList.add(
            'success'
        )


        button.classList.remove(
            'danger'
        )

    }

}


// =======================================
// AFFICHAGE
// =======================================

function render() {

    if (
        !botCount ||
        !botList
    ) {

        return

    }


    botCount.textContent =
        bots.length +
        (
            bots.length > 1
                ? ' bots'
                : ' bot'
        )


    if (
        bots.length === 0
    ) {

        botList.innerHTML = `

            <div class="empty">

                <div class="empty-icon">
                    🤖
                </div>

                <h3>
                    Aucun bot
                </h3>

                <p>
                    Ajoute ton premier bot
                    Minecraft pour commencer.
                </p>

            </div>

        `


        updateToggleAllButton()


        return

    }


    botList.innerHTML = ''


    bots.forEach(bot => {

        const state =
            states[bot.id] || {

                status:
                    'stopped',

                startTime:
                    null,

                reconnectSeconds:
                    null

            }


        const card =
            document.createElement(
                'div'
            )


        card.className =
            'bot-card'


        // ===================================
        // IDENTIFIANT DE LA CARTE
        // ===================================

        card.dataset.botId =
            bot.id


        card.innerHTML = `

            <div class="bot-header">

                <div class="bot-name">
                    🤖 ${escapeHtml(
                        bot.username
                    )}
                </div>

            </div>


            <div class="status">

                ${getStatus(
                    state.status,
                    state
                )}

            </div>


            <div class="time-title">

                Temps sur le serveur

            </div>


            <div
                class="time"
                id="time-${bot.id}"
            >
                ${getTime(state)}
            </div>


            <div class="bot-buttons">

                <button
                    class="btn success"
                    onclick="startBot('${bot.id}')"
                >
                    ▶
                    Lancer
                </button>


                <button
                    class="btn danger"
                    onclick="stopBot('${bot.id}')"
                >
                    ■
                    Arrêter
                </button>


                <button
                    class="btn"
                    onclick="openSettings('${bot.id}')"
                    title="Paramètres"
                >
                    ⚙
                </button>


                <button
                    class="btn delete-btn"
                    onclick="openDeleteConfirm('${bot.id}')"
                    title="Supprimer le bot"
                >
                    🗑
                </button>

            </div>

        `


        botList.appendChild(
            card
        )

    })


    updateToggleAllButton()

}


// =======================================
// STATUT
// =======================================

function getStatus(
    status,
    state = {}
) {

    switch (status) {

        case 'connected':

            return '🟢 Connecté'


        case 'waiting':

            if (
                state.reconnectSeconds !== null &&
                state.reconnectSeconds !== undefined
            ) {

                return (
                    '⏳ Connexion dans ' +
                    state.reconnectSeconds +
                    's'
                )

            }

            return '⏳ Préparation...'


        case 'connecting':

            return '🟡 Connexion...'


        case 'reconnecting':

            if (
                state.reconnectSeconds !== null &&
                state.reconnectSeconds !== undefined
            ) {

                return (
                    '🔄 Reconnexion dans ' +
                    state.reconnectSeconds +
                    's'
                )

            }

            return '🔄 Reconnexion...'


        case 'disconnected':

            return '🔴 Déconnecté'


        case 'error':

            return '⚠️ Erreur'


        default:

            return '⚪ Arrêté'

    }

}


// =======================================
// TEMPS
// =======================================

function getTime(state) {

    if (
        !state.startTime
    ) {

        return '00:00:00'

    }


    const seconds =
        Math.floor(
            (
                Date.now() -
                state.startTime
            ) / 1000
        )


    return formatTime(
        seconds
    )

}


// =======================================
// FORMAT TEMPS
// =======================================

function formatTime(seconds) {

    const hours =
        Math.floor(
            seconds / 3600
        )


    const minutes =
        Math.floor(
            (
                seconds % 3600
            ) / 60
        )


    const secs =
        seconds % 60


    return (

        String(hours)
            .padStart(2, '0')

        + ':'

        + String(minutes)
            .padStart(2, '0')

        + ':'

        + String(secs)
            .padStart(2, '0')

    )

}


// =======================================
// COMPTEUR TEMPS
// =======================================

setInterval(
    () => {

        bots.forEach(
            bot => {

                const state =
                    states[bot.id]


                if (
                    !state ||
                    !state.startTime
                ) {

                    return

                }


                const element =
                    document.getElementById(
                        `time-${bot.id}`
                    )


                if (element) {

                    element.textContent =
                        getTime(state)

                }

            }
        )

    },
    1000
)


// =======================================
// AJOUT BOT
// =======================================

document.getElementById(
    'addBot'
).onclick = () => {

    usernameInput.value =
        ''

    passwordInput.value =
        ''


    modal.classList.remove(
        'hidden'
    )


    usernameInput.focus()

}


// =======================================
// FERMER MODAL
// =======================================

function closeModal() {

    modal.classList.add(
        'hidden'
    )

}


document.getElementById(
    'cancel'
).onclick =
    closeModal


document.getElementById(
    'closeModal'
).onclick =
    closeModal


// =======================================
// SAUVEGARDER BOT
// =======================================

document.getElementById(
    'save'
).onclick = async () => {

    const username =
        usernameInput.value.trim()


    const password =
        passwordInput.value


    if (!username) {

        alert(
            'Entre le pseudo du bot.'
        )

        return

    }


    if (!password) {

        alert(
            'Entre le mot de passe.'
        )

        return

    }


    const bot = {

        id:
            crypto.randomUUID(),

        username:
            username,

        password:
            password,

        proxy: {

            enabled:
                false,

            host:
                '',

            port:
                1080,

            username:
                '',

            password:
                ''

        }

    }


    try {

        const newBot =
            await window.electronAPI.addBot(
                bot
            )


        if (newBot) {

            bots.push(
                newBot
            )

        }


        closeModal()

        render()

    } catch (error) {

        console.error(
            'Erreur lors de l’ajout :',
            error
        )

        alert(
            'Impossible d’ajouter le bot.'
        )

    }

}


// =======================================
// PARAMETRES
// =======================================

function openSettings(id) {

    selectedBotId =
        id


    const bot =
        bots.find(
            b => b.id === id
        )


    if (!bot) {

        console.error(
            'Bot introuvable :',
            id
        )

        return

    }


    const proxy =
        bot.proxy || {

            enabled:
                false,

            host:
                '',

            port:
                1080,

            username:
                '',

            password:
                ''

        }


    document.getElementById(
        'settingsBotName'
    ).textContent =
        bot.username


    proxyEnabled.checked =
        proxy.enabled


    proxyHost.value =
        proxy.host || ''


    proxyPort.value =
        proxy.port || 1080


    proxyUsername.value =
        proxy.username || ''


    proxyPassword.value =
        proxy.password || ''


    settingsModal.classList.remove(
        'hidden'
    )

}


window.openSettings =
    openSettings


// =======================================
// FERMER PARAMETRES
// =======================================

function closeSettings() {

    settingsModal.classList.add(
        'hidden'
    )


    selectedBotId =
        null

}


document.getElementById(
    'closeSettings'
).onclick =
    closeSettings


document.getElementById(
    'cancelSettings'
).onclick =
    closeSettings


// =======================================
// SAUVEGARDER PARAMETRES
// =======================================

document.getElementById(
    'saveSettings'
).onclick = async () => {

    const bot =
        bots.find(
            b => b.id === selectedBotId
        )


    if (!bot) {

        return

    }


    const updatedBot = {

        ...bot,

        proxy: {

            enabled:
                proxyEnabled.checked,

            host:
                proxyHost.value.trim(),

            port:
                parseInt(
                    proxyPort.value
                ) || 1080,

            username:
                proxyUsername.value.trim(),

            password:
                proxyPassword.value

        }

    }


    try {

        const result =
            await window.electronAPI.updateBot(
                bot.id,
                updatedBot
            )


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                'La sauvegarde du bot a échoué.'
            )

        }


        const index =
            bots.findIndex(
                b => b.id === bot.id
            )


        if (
            index !== -1
        ) {

            bots[index] =
                result.bot ||
                updatedBot

        }


        closeSettings()

        render()

    } catch (error) {

        console.error(
            'Erreur sauvegarde paramètres :',
            error
        )

        alert(
            'Impossible de sauvegarder les paramètres.'
        )

    }

}


// =======================================
// OUVRIR POPUP SUPPRESSION
// =======================================

function openDeleteConfirm(id) {

    const bot =
        bots.find(
            b => b.id === id
        )


    if (!bot) {

        return

    }


    botToDeleteId =
        id


    deleteBotName.textContent =
        bot.username


    deleteModal.classList.remove(
        'hidden'
    )

}


// =======================================
// FERMER POPUP SUPPRESSION
// =======================================

function closeDeleteConfirm() {

    deleteModal.classList.add(
        'hidden'
    )


    botToDeleteId =
        null

}


// =======================================
// BOUTON ANNULER SUPPRESSION
// =======================================

cancelDelete.onclick =
    closeDeleteConfirm


// =======================================
// CONFIRMER SUPPRESSION
// =======================================

confirmDelete.onclick = async () => {

    if (
        !botToDeleteId
    ) {

        return

    }


    const id =
        botToDeleteId


    closeDeleteConfirm()


    try {

        await window.electronAPI.stopBot(
            id
        )

    } catch (error) {

        console.log(
            'Le bot était peut-être déjà arrêté.'
        )

    }


    try {

        const result =
            await window.electronAPI.deleteBot(
                id
            )


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                'La suppression a échoué.'
            )

        }


        bots =
            bots.filter(
                bot =>
                    bot.id !== id
            )


        delete states[id]


        render()

    } catch (error) {

        console.error(
            'Erreur suppression bot :',
            error
        )

        alert(
            'Impossible de supprimer le bot.'
        )

    }

}


// =======================================
// FONCTION GLOBALE POPUP
// =======================================

window.openDeleteConfirm =
    openDeleteConfirm


// =======================================
// LANCER BOT
// =======================================

async function startBot(id) {

    const bot =
        bots.find(
            b => b.id === id
        )


    if (!bot) {

        return

    }


    try {

        const result =
            await window.electronAPI.startBot(
                bot
            )


        if (
            result &&
            !result.success
        ) {

            alert(
                result.error ||
                'Impossible de démarrer le bot.'
            )

        }

    } catch (error) {

        console.error(
            'Erreur démarrage bot :',
            error
        )

        alert(
            'Impossible de démarrer le bot.'
        )

    }

}


window.startBot =
    startBot


// =======================================
// ARRETER BOT
// =======================================

async function stopBot(id) {

    try {

        const result =
            await window.electronAPI.stopBot(
                id
            )


        if (
            result &&
            !result.success
        ) {

            alert(
                result.error ||
                'Impossible d’arrêter le bot.'
            )

        }

    } catch (error) {

        console.error(
            'Erreur arrêt bot :',
            error
        )

        alert(
            'Impossible d’arrêter le bot.'
        )

    }

}


window.stopBot =
    stopBot


// =======================================
// LANCER / ARRETER TOUS
// =======================================

const toggleAllBots =
    document.getElementById(
        'toggleAllBots'
    )


if (toggleAllBots) {

    toggleAllBots.onclick = async () => {

        const hasRunningBot =
            bots.some(
                bot => {

                    const state =
                        states[bot.id]


                    return (
                        state &&
                        (
                            state.status === 'connected' ||
                            state.status === 'connecting' ||
                            state.status === 'waiting' ||
                            state.status === 'reconnecting'
                        )
                    )

                }
            )


        try {

            let result


            if (
                hasRunningBot
            ) {

                result =
                    await window.electronAPI.stopAll()

            } else {

                result =
                    await window.electronAPI.startAll()

            }


            if (
                result &&
                !result.success
            ) {

                alert(
                    result.error ||
                    (
                        hasRunningBot
                            ? 'Impossible d’arrêter les bots.'
                            : 'Impossible de lancer les bots.'
                    )
                )

            }

        } catch (error) {

            console.error(
                'Erreur action sur tous les bots :',
                error
            )


            alert(
                hasRunningBot
                    ? 'Impossible d’arrêter les bots.'
                    : 'Impossible de lancer les bots.'
            )

        }


        updateToggleAllButton()

    }

}


// =======================================
// LOGS
// =======================================
//
// Les logs Minecraft restent dans la
// console développeur.
//
// L'onglet Logs est réservé aux
// mises à jour de Gamster Bot.
//

function renderLogs() {

    if (!logsContainer) {

        return

    }


    logsContainer.innerHTML = `

        <div class="update-log-card">

            <div class="update-log-header">

                <div class="update-log-icon">
                    ✨
                </div>

                <div>

                    <h3>
                        Gamster Bot 1.0.0
                    </h3>

                    <span>
                        Première version publique
                    </span>

                </div>

            </div>


            <div class="update-log-content">

                <p>
                    🎉 Première version publique de
                    <strong>Gamster Bot</strong> !
                </p>


                <h4>
                    🤖 Bots
                </h4>

                <ul>

                    <li>
                        Ajout, modification et suppression des bots
                    </li>

                    <li>
                        Démarrage / arrêt individuel ou global
                    </li>

                    <li>
                        Reconnexion automatique
                    </li>

                    <li>
                        Sauvegarde des configurations
                    </li>

                </ul>


                <h4>
                    ⏱️ Connexions
                </h4>

                <ul>

                    <li>
                        Ajout d'une latence entre chaque connexion
                    </li>

                    <li>
                        Meilleure stabilité avec plusieurs bots
                    </li>

                </ul>


                <h4>
                    👤 Comptes hors ligne
                </h4>

                <ul>

                    <li>
                        Fonctionnalité actuellement
                        <strong>en maintenance</strong>
                    </li>

                    <li>
                        Améliorations prévues prochainement
                    </li>

                </ul>


                <h4>
                    🔄 Mises à jour
                </h4>

                <ul>

                    <li>
                        Détection et téléchargement automatique
                    </li>

                    <li>
                        Installation directement depuis l'application
                    </li>

                    <li>
                        Historique des nouveautés dans
                        <strong>Logs</strong>
                    </li>

                </ul>


                <h4>
                    🎨 Interface
                </h4>

                <ul>

                    <li>
                        Nouvelle interface Gamster Bot
                    </li>

                    <li>
                        Gestion simplifiée des bots
                    </li>

                    <li>
                        Améliorations générales de stabilité
                    </li>

                </ul>

            </div>


            <div class="update-log-footer">

                📅 7 septembre 2026

            </div>

        </div>

    `

}


// =======================================
// EVENEMENTS BOT
// =======================================

window.electronAPI.onBotUpdate(
    data => {

        if (
            !data ||
            !data.id
        ) {

            return

        }


        states[data.id] = {

            status:
                data.status,

            startTime:
                data.startTime,

            reconnectSeconds:
                data.reconnectSeconds

        }


        // ===================================
        // NOTIFICATION
        // ===================================

        if (
            data.status === 'waiting'
        ) {

            showConnectionNotification(
                data
            )

        } else {

            hideConnectionNotification()

        }


        // ===================================
        // CHERCHER LA CARTE DU BOT
        // ===================================

        const botCard =
            document.querySelector(
                `[data-bot-id="${data.id}"]`
            )


        // ===================================
        // SI LA CARTE N'EXISTE PAS
        // ON FAIT UN RENDER COMPLET
        // ===================================

        if (!botCard) {

            render()

            return

        }


        // ===================================
        // METTRE A JOUR UNIQUEMENT LE STATUT
        // ===================================

        const statusElement =
            botCard.querySelector(
                '.status'
            )


        if (statusElement) {

            statusElement.textContent =
                getStatus(
                    data.status,
                    data
                )

        }


        // ===================================
        // METTRE A JOUR UNIQUEMENT LE TEMPS
        // ===================================

        const timeElement =
            botCard.querySelector(
                '.time'
            )


        if (timeElement) {

            timeElement.textContent =
                getTime(
                    data
                )

        }


        // ===================================
        // METTRE A JOUR LE BOUTON GLOBAL
        // ===================================

        updateToggleAllButton()

    }
)


// =======================================
// LOGS TECHNIQUES DES BOTS
// =======================================

window.electronAPI.onBotLog(
    data => {

        if (!data) {

            return

        }


        console.log(
            `[BOT ${data.id}] ${data.message}`
        )

    }
)


// =======================================
// SECURITE HTML
// =======================================

function escapeHtml(text) {

    const div =
        document.createElement(
            'div'
        )


    div.textContent =
        text


    return div.innerHTML

}


// =======================================
// DEMARRAGE
// =======================================

showBotsPage()

loadProfile()

loadBots()