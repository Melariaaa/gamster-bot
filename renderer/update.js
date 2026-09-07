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

}


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
// ÉVÉNEMENTS DE MISE À JOUR
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

