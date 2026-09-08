// =========================================
// ELEMENTS MISE A JOUR
// =========================================

const updateNotification =
    document.getElementById(
        'updateNotification'
    )

const updateTitle =
    document.getElementById(
        'updateTitle'
    )

const updateMessage =
    document.getElementById(
        'updateMessage'
    )

const updateProgressContainer =
    document.getElementById(
        'updateProgressContainer'
    )

const updateProgress =
    document.getElementById(
        'updateProgress'
    )

const updateProgressText =
    document.getElementById(
        'updateProgressText'
    )

const updateInstall =
    document.getElementById(
        'updateInstall'
    )

const updateLater =
    document.getElementById(
        'updateLater'
    )


// =========================================
// NOTES DES VERSIONS
// =========================================
//
// C'EST ICI QUE TU ECRIS TES MESSAGES.
//
// Pour chaque nouvelle version,
// ajoute une nouvelle entrée.
//
// Exemple :
// '1.1.0': {
//     title: '🚀 Nouvelle version',
//     message: 'Voici les nouveautés...',
//     changes: [
//         'Nouvelle fonctionnalité',
//         'Correction de bugs'
//     ]
// }

const UPDATE_NOTES = {

    '1.0.0': {

        title:
            '🎉 Première version publique',

        message:
            'Bienvenue sur Gamster Bot !',

        changes: [

            'Gestion des bots Minecraft',

            'Reconnexion automatique',

            'Gestion des comptes hors ligne',

            'Support des proxies SOCKS5',

            'Système de licence'

        ]

    },


    // =====================================
    // EXEMPLE POUR LA PROCHAINE VERSION
    // =====================================

    /*
    '1.1.0': {

        title:
            '🚀 Nouvelle mise à jour',

        message:
            'Gamster Bot reçoit plusieurs améliorations.',

        changes: [

            'Nouvelle fonctionnalité',

            'Correction de plusieurs bugs',

            'Amélioration de l’interface'

        ]

    }
    */

}


// =========================================
// AFFICHER LES LOGS DE MISE A JOUR
// =========================================

function renderUpdateLogs() {

    const container =
        document.getElementById(
            'logsContainer'
        )


    if (!container) {
        return
    }


    const versions =
        Object.keys(
            UPDATE_NOTES
        ).reverse()


    // =====================================
    // AUCUNE NOTE
    // =====================================

    if (versions.length === 0) {

        container.innerHTML = `

            <div class="logs-empty">

                <div class="logs-empty-icon">
                    📋
                </div>

                <h3>
                    Aucune mise à jour
                </h3>

                <p>
                    Les mises à jour de Gamster Bot
                    apparaîtront ici.
                </p>

            </div>

        `

        return

    }


    // =====================================
    // CREATION DES LOGS
    // =====================================

    container.innerHTML = ''


    versions.forEach(
        (version) => {

            const update =
                UPDATE_NOTES[version]


            const card =
                document.createElement(
                    'div'
                )


            card.className =
                'update-log-card'


            // =================================
            // TITRE
            // =================================

            const title =
                document.createElement(
                    'h3'
                )


            title.textContent =
                update.title


            // =================================
            // VERSION
            // =================================

            const versionElement =
                document.createElement(
                    'span'
                )


            versionElement.className =
                'update-log-version'


            versionElement.textContent =
                `Version ${version}`


            // =================================
            // MESSAGE
            // =================================

            const message =
                document.createElement(
                    'p'
                )


            message.className =
                'update-log-message'


            message.textContent =
                update.message


            // =================================
            // LISTE DES CHANGEMENTS
            // =================================

            const list =
                document.createElement(
                    'ul'
                )


            list.className =
                'update-log-changes'


            update.changes.forEach(
                (change) => {

                    const item =
                        document.createElement(
                            'li'
                        )


                    item.textContent =
                        change


                    list.appendChild(
                        item
                    )

                }
            )


            // =================================
            // ASSEMBLAGE
            // =================================

            card.appendChild(
                versionElement
            )

            card.appendChild(
                title
            )

            card.appendChild(
                message
            )

            card.appendChild(
                list
            )


            container.appendChild(
                card
            )

        }
    )

}


// =========================================
// AFFICHAGE INITIAL
// =========================================

renderUpdateLogs()


// =========================================
// NOTIFICATION
// =========================================

function showUpdateNotification() {

    updateNotification.classList.remove(
        'hidden'
    )

}


function hideUpdateNotification() {

    updateNotification.classList.add(
        'hidden'
    )

}


// =========================================
// MISE A JOUR DISPONIBLE
// =========================================

function showUpdateAvailable(version) {

    updateTitle.textContent =
        'Mise à jour disponible'

    updateMessage.textContent =
        `Gamster Bot ${version} est disponible.`

    updateProgressContainer.classList.add(
        'hidden'
    )

    updateInstall.classList.add(
        'hidden'
    )

    updateLater.classList.remove(
        'hidden'
    )

    showUpdateNotification()

}


// =========================================
// TELECHARGEMENT
// =========================================

function showUpdateProgress(percent) {

    const value =
        Math.max(
            0,
            Math.min(
                100,
                Math.round(percent)
            )
        )

    updateTitle.textContent =
        'Téléchargement de la mise à jour'

    updateMessage.textContent =
        'Gamster Bot télécharge la nouvelle version.'

    updateProgressContainer.classList.remove(
        'hidden'
    )

    updateProgress.style.width =
        `${value}%`

    updateProgressText.textContent =
        `${value}%`

    updateInstall.classList.add(
        'hidden'
    )

    updateLater.classList.add(
        'hidden'
    )

    showUpdateNotification()

}


// =========================================
// MISE A JOUR TELECHARGEE
// =========================================

function showUpdateDownloaded(version) {

    updateTitle.textContent =
        'Mise à jour prête'

    updateMessage.textContent =
        `Gamster Bot ${version} est prêt à être installé.`

    updateProgressContainer.classList.add(
        'hidden'
    )

    updateInstall.classList.remove(
        'hidden'
    )

    updateLater.classList.remove(
        'hidden'
    )

    showUpdateNotification()


    // =====================================
    // ACTUALISER LES LOGS
    // =====================================

    renderUpdateLogs()

}


// =========================================
// ERREUR
// =========================================

function showUpdateError(error) {

    console.error(
        'Erreur de mise à jour :',
        error
    )

    updateTitle.textContent =
        'Mise à jour impossible'

    updateMessage.textContent =
        'La mise à jour automatique a rencontré un problème.'

    updateProgressContainer.classList.add(
        'hidden'
    )

    updateInstall.classList.add(
        'hidden'
    )

    updateLater.classList.remove(
        'hidden'
    )

    showUpdateNotification()

}


// =========================================
// EVENEMENTS DE MISE A JOUR
// =========================================

window.electronAPI.onUpdateAvailable(
    (data) => {

        console.log(
            'Mise à jour disponible :',
            data?.version
        )

        showUpdateAvailable(
            data?.version || 'nouvelle'
        )

    }
)


window.electronAPI.onUpdateProgress(
    (data) => {

        showUpdateProgress(
            data?.percent || 0
        )

    }
)


window.electronAPI.onUpdateDownloaded(
    (data) => {

        console.log(
            'Mise à jour téléchargée :',
            data?.version
        )

        showUpdateDownloaded(
            data?.version || 'nouvelle'
        )

    }
)


window.electronAPI.onUpdateError(
    (data) => {

        showUpdateError(
            data?.error
        )

    }
)


// =========================================
// BOUTON INSTALLER
// =========================================

updateInstall.onclick =
    async () => {

        updateInstall.disabled =
            true

        updateInstall.textContent =
            'Installation...'


        try {

            const result =
                await window.electronAPI.installUpdate()


            if (
                !result ||
                !result.success
            ) {

                updateInstall.disabled =
                    false

                updateInstall.textContent =
                    'Redémarrer et mettre à jour'

                showUpdateError(
                    result?.error
                )

            }

        } catch (error) {

            console.error(
                error
            )

            updateInstall.disabled =
                false

            updateInstall.textContent =
                'Redémarrer et mettre à jour'

            showUpdateError(
                error?.message
            )

        }

    }


// =========================================
// BOUTON PLUS TARD
// =========================================

updateLater.onclick =
    () => {

        hideUpdateNotification()

    }