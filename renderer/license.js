const licenseScreen =
    document.getElementById(
        'licenseScreen'
    )


const licenseInput =
    document.getElementById(
        'licenseInput'
    )


const activateButton =
    document.getElementById(
        'activateLicense'
    )


const licenseError =
    document.getElementById(
        'licenseError'
    )


// =======================================
// AFFICHER ERREUR
// =======================================

function showLicenseError(message) {

    licenseError.textContent =
        message

    licenseError.classList.remove(
        'hidden'
    )
}


// =======================================
// CACHER ERREUR
// =======================================

function hideLicenseError() {

    licenseError.textContent =
        ''

    licenseError.classList.add(
        'hidden'
    )
}


// =======================================
// ACTIVER
// =======================================

async function activate() {

    const key =
        licenseInput.value.trim()


    hideLicenseError()


    if (!key) {

        showLicenseError(
            'Entre une clé de licence.'
        )

        return
    }


    activateButton.disabled =
        true

    activateButton.textContent =
        'Vérification...'


    try {

        const result =
            await window.electronAPI
                .activateLicense(
                    key
                )


        if (!result.success) {

            showLicenseError(
                result.error ||
                'Licence invalide.'
            )

            return
        }


        licenseScreen.classList.add(
            'hidden'
        )


        window.dispatchEvent(
            new Event(
                'license-activated'
            )
        )

    } catch (error) {

        console.error(
            error
        )

        showLicenseError(
            'Impossible de contacter le serveur.'
        )

    } finally {

        activateButton.disabled =
            false

        activateButton.textContent =
            'Activer Gamster Bot'
    }
}


// =======================================
// BOUTON
// =======================================

activateButton.onclick =
    activate


// =======================================
// TOUCHE ENTRÉE
// =======================================

licenseInput.addEventListener(
    'keydown',
    event => {

        if (
            event.key === 'Enter'
        ) {

            activate()
        }
    }
)


// =======================================
// VÉRIFICATION AU DÉMARRAGE
// =======================================

async function checkLicense() {

    try {

        const result =
            await window.electronAPI
                .licenseStatus()


        if (result.activated) {

            licenseScreen.classList.add(
                'hidden'
            )

            return
        }


        licenseScreen.classList.remove(
            'hidden'
        )

        licenseInput.focus()

    } catch (error) {

        console.error(
            error
        )

        licenseScreen.classList.remove(
            'hidden'
        )
    }
}

checkLicense()

// =======================================
// LICENCE DEVENUE INVALIDE
// =======================================

window.electronAPI.onLicenseInvalid(
    data => {

        console.log(
            'Licence devenue invalide :',
            data?.error
        )

        // Afficher à nouveau l'écran de licence
        licenseScreen.classList.remove(
            'hidden'
        )

        // Vider le champ
        licenseInput.value = ''

        // Afficher le message
        showLicenseError(
            data?.error ||
            'Ta licence n’est plus valide.'
        )

        // Mettre le curseur dans le champ
        licenseInput.focus()
    }
)