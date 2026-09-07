let bots = []

let states = {}

let selectedBotId = null

let botToDeleteId = null


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
// AFFICHAGE
// =======================================

function render() {

    botCount.textContent =
        bots.length +
        (
            bots.length > 1
                ? ' bots'
                : ' bot'
        )


    if (bots.length === 0) {

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

        return
    }


    botList.innerHTML = ''


    bots.forEach(bot => {

        const state =
            states[bot.id] || {

                status:
                    'stopped',

                startTime:
                    null
            }


        const card =
            document.createElement('div')


        card.className =
            'bot-card'


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
                    state.status
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


        botList.appendChild(card)
    })
}


// =======================================
// STATUT
// =======================================

function getStatus(status) {

    switch (status) {

        case 'connected':
            return '🟢 Connecté'

        case 'connecting':
            return '🟡 Connexion...'

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

    if (!state.startTime) {

        return '00:00:00'

    }


    const seconds =
        Math.floor(
            (
                Date.now() -
                state.startTime
            ) / 1000
        )


    return formatTime(seconds)
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
            (seconds % 3600) / 60
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

setInterval(() => {

    bots.forEach(bot => {

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

    })

}, 1000)


// =======================================
// AJOUT BOT
// =======================================

document.getElementById(
    'addBot'
).onclick = () => {

    usernameInput.value = ''

    passwordInput.value = ''

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


        // Le main.js renvoie un seul bot.
        // On l'ajoute donc au tableau.
        if (newBot) {

            bots.push(newBot)

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


        // Remplace le bot dans le tableau
        const index =
            bots.findIndex(
                b => b.id === bot.id
            )


        if (index !== -1) {

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

    if (!botToDeleteId) {

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


        // Supprime le bot du tableau local
        bots =
            bots.filter(
                bot =>
                    bot.id !== id
            )


        // Supprime également son état
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
// ARRÊTER BOT
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
// LANCER TOUS
// =======================================

document.getElementById(
    'startAll'
).onclick = async () => {

    try {

        const result =
            await window.electronAPI.startAll()


        if (
            result &&
            !result.success
        ) {

            alert(
                result.error ||
                'Impossible de lancer les bots.'
            )

        }

    } catch (error) {

        console.error(
            'Erreur lancement de tous les bots :',
            error
        )

        alert(
            'Impossible de lancer les bots.'
        )
    }
}


// =======================================
// ARRÊTER TOUS
// =======================================

document.getElementById(
    'stopAll'
).onclick = async () => {

    try {

        const result =
            await window.electronAPI.stopAll()


        if (
            result &&
            !result.success
        ) {

            alert(
                result.error ||
                'Impossible d’arrêter les bots.'
            )

        }

    } catch (error) {

        console.error(
            'Erreur arrêt de tous les bots :',
            error
        )

        alert(
            'Impossible d’arrêter les bots.'
        )
    }
}


// =======================================
// EVENEMENTS BOT
// =======================================

window.electronAPI.onBotUpdate(
    data => {

        if (!data || !data.id) {

            return

        }


        states[data.id] = {

            status:
                data.status,

            startTime:
                data.startTime
        }


        render()
    }
)


// =======================================
// LOG
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

loadBots()