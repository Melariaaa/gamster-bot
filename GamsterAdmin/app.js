// ==========================================
// CONFIGURATION SUPABASE
// ==========================================

const SUPABASE_URL =
    'https://nycthxaqrfzgcgtsspap.supabase.co'


const SUPABASE_ANON_KEY =
    'sb_publishable_LGZZwftflZbvuM7NlO28fQ_MIcHIP_W'


// ==========================================
// CLIENT SUPABASE
// ==========================================

const {
    createClient
} = window.supabase


const supabaseClient =
    createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    )


// ==========================================
// ÉLÉMENTS HTML
// ==========================================

const loginScreen =
    document.getElementById(
        'loginScreen'
    )

const adminScreen =
    document.getElementById(
        'adminScreen'
    )

const emailInput =
    document.getElementById(
        'email'
    )

const passwordInput =
    document.getElementById(
        'password'
    )

const loginButton =
    document.getElementById(
        'loginButton'
    )

const logoutButton =
    document.getElementById(
        'logoutButton'
    )

const refreshButton =
    document.getElementById(
        'refreshButton'
    )

const loginError =
    document.getElementById(
        'loginError'
    )

const adminError =
    document.getElementById(
        'adminError'
    )

const licensesTable =
    document.getElementById(
        'licensesTable'
    )

const totalLicenses =
    document.getElementById(
        'totalLicenses'
    )

const activeLicenses =
    document.getElementById(
        'activeLicenses'
    )

const linkedLicenses =
    document.getElementById(
        'linkedLicenses'
    )


// ==========================================
// ÉLÉMENTS CRÉATION LICENCE
// ==========================================

const createLicenseButton =
    document.getElementById(
        'createLicenseButton'
    )

const createLicenseModal =
    document.getElementById(
        'createLicenseModal'
    )

const licenseOwner =
    document.getElementById(
        'licenseOwner'
    )

const licenseNotes =
    document.getElementById(
        'licenseNotes'
    )

const cancelCreateLicense =
    document.getElementById(
        'cancelCreateLicense'
    )

const confirmCreateLicense =
    document.getElementById(
        'confirmCreateLicense'
    )

const createLicenseError =
    document.getElementById(
        'createLicenseError'
    )


// ==========================================
// AFFICHER UNE ERREUR
// ==========================================

function showLoginError(
    message
) {

    loginError.textContent =
        message

    loginError.classList.remove(
        'hidden'
    )
}


function hideLoginError() {

    loginError.textContent =
        ''

    loginError.classList.add(
        'hidden'
    )
}


function showAdminError(
    message
) {

    adminError.textContent =
        message

    adminError.classList.remove(
        'hidden'
    )
}


function hideAdminError() {

    adminError.textContent =
        ''

    adminError.classList.add(
        'hidden'
    )
}


// ==========================================
// AFFICHER / CACHER LES ÉCRANS
// ==========================================

function showLoginScreen() {

    loginScreen.classList.remove(
        'hidden'
    )

    adminScreen.classList.add(
        'hidden'
    )
}


function showAdminScreen() {

    loginScreen.classList.add(
        'hidden'
    )

    adminScreen.classList.remove(
        'hidden'
    )
}


// ==========================================
// CONNEXION
// ==========================================

async function login() {

    hideLoginError()

    const email =
        emailInput.value.trim()

    const password =
        passwordInput.value


    if (!email || !password) {

        showLoginError(
            'Entre ton adresse e-mail et ton mot de passe.'
        )

        return
    }


    loginButton.disabled =
        true

    loginButton.textContent =
        'Connexion...'


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({
                    email,
                    password
                })


        if (error) {

            showLoginError(
                'Identifiants incorrects.'
            )

            return
        }


        if (!data.session) {

            showLoginError(
                'Impossible de créer la session.'
            )

            return
        }


        showAdminScreen()

        await loadLicenses()


    } catch (error) {

        console.error(error)

        showLoginError(
            'Une erreur est survenue.'
        )

    } finally {

        loginButton.disabled =
            false

        loginButton.textContent =
            'Se connecter'
    }
}


// ==========================================
// DÉCONNEXION
// ==========================================

async function logout() {

    await supabaseClient.auth.signOut()

    showLoginScreen()

    licensesTable.innerHTML =
        ''

    emailInput.value =
        ''

    passwordInput.value =
        ''
}


// ==========================================
// RÉCUPÉRER LES LICENCES
// ==========================================

async function loadLicenses() {

    hideAdminError()

    refreshButton.disabled =
        true

    refreshButton.textContent =
        'Chargement...'


    try {

        const {
            data: {
                session
            }
        } =
            await supabaseClient.auth
                .getSession()


        if (!session) {

            showLoginScreen()

            return
        }


        const response =
            await fetch(
                `${SUPABASE_URL}/functions/v1/admin-licenses`,
                {
                    method: 'GET',

                    headers: {
                        Authorization:
                            `Bearer ${session.access_token}`
                    }
                }
            )


        const data =
            await response.json()


        if (!response.ok) {

            showAdminError(
                data.error ||
                'Impossible de récupérer les licences.'
            )

            return
        }


        if (!data.success) {

            showAdminError(
                data.error ||
                'Impossible de récupérer les licences.'
            )

            return
        }


        renderLicenses(
            data.licenses || []
        )


    } catch (error) {

        console.error(error)

        showAdminError(
            'Impossible de contacter le serveur.'
        )

    } finally {

        refreshButton.disabled =
            false

        refreshButton.textContent =
            'Actualiser'
    }
}


// ==========================================
// AFFICHER LES LICENCES
// ==========================================

function renderLicenses(
    licenses
) {

    licensesTable.innerHTML =
        ''

    totalLicenses.textContent =
        licenses.length

    activeLicenses.textContent =
        licenses.filter(
            license =>
                license.active
        ).length

    linkedLicenses.textContent =
        licenses.filter(
            license =>
                !!license.device_id
        ).length


    if (licenses.length === 0) {

        const row =
            document.createElement(
                'tr'
            )

        const cell =
            document.createElement(
                'td'
            )

        cell.colSpan =
            7

        cell.textContent =
            'Aucune licence.'

        cell.className =
            'muted'

        row.appendChild(
            cell
        )

        licensesTable.appendChild(
            row
        )

        return
    }


    for (
        const license
        of licenses
    ) {

        const row =
            document.createElement(
                'tr'
            )


        // ==========================================
        // CLÉ
        // ==========================================

        const keyCell =
            document.createElement(
                'td'
            )

        keyCell.textContent =
            license.license_key

        keyCell.className =
            'license-key'


        // ==========================================
        // PROPRIÉTAIRE
        // ==========================================

        const ownerCell =
            document.createElement(
                'td'
            )

        ownerCell.textContent =
            license.owner_name ||
            '—'


        // ==========================================
        // ÉTAT
        // ==========================================

        const statusCell =
            document.createElement(
                'td'
            )

        const badge =
            document.createElement(
                'span'
            )

        badge.textContent =
            license.active
                ? 'Active'
                : 'Désactivée'

        badge.className =
            license.active
                ? 'badge active'
                : 'badge inactive'

        statusCell.appendChild(
            badge
        )


        // ==========================================
        // APPAREIL
        // ==========================================

        const deviceCell =
            document.createElement(
                'td'
            )

        if (license.device_id) {

            const device =
                document.createElement(
                    'span'
                )

            device.textContent =
                '🔒 Lié'

            device.className =
                'device-linked'

            deviceCell.appendChild(
                device
            )

        } else {

            const device =
                document.createElement(
                    'span'
                )

            device.textContent =
                'Non lié'

            device.className =
                'device-not-linked'

            deviceCell.appendChild(
                device
            )
        }


        // ==========================================
        // ACTIVATION
        // ==========================================

        const activationCell =
            document.createElement(
                'td'
            )

        if (
            license.activated_at
        ) {

            activationCell.textContent =
                formatDate(
                    license.activated_at
                )

        } else {

            activationCell.textContent =
                '—'

            activationCell.className =
                'muted'
        }


        // ==========================================
        // NOTES
        // ==========================================

        const notesCell =
            document.createElement(
                'td'
            )

        notesCell.textContent =
            license.notes ||
            '—'

        if (!license.notes) {

            notesCell.className =
                'muted'
        }


        // ==========================================
        // ACTIONS
        // ==========================================

        const actionCell =
            document.createElement(
                'td'
            )


        // ------------------------------------------
        // BOUTON ACTIVER / DÉSACTIVER
        // ------------------------------------------

        const toggleButton =
            document.createElement(
                'button'
            )

        toggleButton.className =
            'secondary-button license-action-button'

        toggleButton.textContent =
            license.active
                ? 'Désactiver'
                : 'Activer'

        toggleButton.addEventListener(
            'click',
            () => {

                toggleLicense(
                    license
                )

            }
        )


        actionCell.appendChild(
            toggleButton
        )


        // ------------------------------------------
        // BOUTON SUPPRIMER
        // ------------------------------------------

        const deleteButton =
            document.createElement(
                'button'
            )

        deleteButton.className =
            'secondary-button license-action-button'

        deleteButton.textContent =
            'Supprimer'


        deleteButton.addEventListener(
            'click',
            () => {

                deleteLicense(
                    license
                )

            }
        )


        actionCell.appendChild(
            deleteButton
        )


        // ==========================================
        // AJOUTER LES CELLULES
        // ==========================================

        row.appendChild(
            keyCell
        )

        row.appendChild(
            ownerCell
        )

        row.appendChild(
            statusCell
        )

        row.appendChild(
            deviceCell
        )

        row.appendChild(
            activationCell
        )

        row.appendChild(
            notesCell
        )

        row.appendChild(
            actionCell
        )


        licensesTable.appendChild(
            row
        )
    }
}


// ==========================================
// FORMATER UNE DATE
// ==========================================

function formatDate(
    value
) {

    try {

        return new Date(
            value
        ).toLocaleString(
            'fr-FR'
        )

    } catch {

        return value
    }
}


// ==========================================
// CRÉATION LICENCE
// ==========================================

function openCreateLicenseModal() {

    createLicenseModal.classList.remove(
        'hidden'
    )

    licenseOwner.value =
        ''

    licenseNotes.value =
        ''

    createLicenseError.textContent =
        ''

    createLicenseError.classList.add(
        'hidden'
    )

    licenseOwner.focus()
}


function closeCreateLicenseModal() {

    createLicenseModal.classList.add(
        'hidden'
    )
}


async function createLicense() {

    createLicenseError.textContent =
        ''

    createLicenseError.classList.add(
        'hidden'
    )

    confirmCreateLicense.disabled =
        true

    confirmCreateLicense.textContent =
        'Création...'


    try {

        const {
            data: {
                session
            }
        } =
            await supabaseClient.auth
                .getSession()


        if (!session) {

            showLoginScreen()

            return
        }


        const response =
            await fetch(
                `${SUPABASE_URL}/functions/v1/admin-create-license`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json',

                        Authorization:
                            `Bearer ${session.access_token}`
                    },

                    body:
                        JSON.stringify({
                            owner_name:
                                licenseOwner
                                    .value
                                    .trim(),

                            notes:
                                licenseNotes
                                    .value
                                    .trim()
                        })
                }
            )


        const data =
            await response.json()


        if (!response.ok) {

            createLicenseError.textContent =
                data.error ||
                'Impossible de créer la licence.'

            createLicenseError.classList.remove(
                'hidden'
            )

            return
        }


        if (!data.success) {

            createLicenseError.textContent =
                data.error ||
                'Impossible de créer la licence.'

            createLicenseError.classList.remove(
                'hidden'
            )

            return
        }


        closeCreateLicenseModal()

        await loadLicenses()

        alert(
            `Licence créée avec succès !\n\n${data.license.license_key}`
        )


    } catch (error) {

        console.error(error)

        createLicenseError.textContent =
            'Impossible de contacter le serveur.'

        createLicenseError.classList.remove(
            'hidden'
        )

    } finally {

        confirmCreateLicense.disabled =
            false

        confirmCreateLicense.textContent =
            'Créer'
    }
}


// ==========================================
// ACTIVER / DÉSACTIVER UNE LICENCE
// ==========================================

async function toggleLicense(
    license
) {

    const newStatus =
        !license.active

    const action =
        newStatus
            ? 'activer'
            : 'désactiver'


    const confirmed =
        confirm(
            `Veux-tu vraiment ${action} cette licence ?\n\n${license.license_key}`
        )


    if (!confirmed) {
        return
    }


    try {

        const {
            data: {
                session
            }
        } =
            await supabaseClient.auth
                .getSession()


        if (!session) {

            showLoginScreen()

            return
        }


        const response =
            await fetch(
                `${SUPABASE_URL}/functions/v1/admin-toggle-license`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json',

                        Authorization:
                            `Bearer ${session.access_token}`
                    },

                    body:
                        JSON.stringify({
                            license_id:
                                license.id,

                            active:
                                newStatus
                        })
                }
            )


        const data =
            await response.json()


        if (!response.ok) {

            showAdminError(
                data.error ||
                'Impossible de modifier la licence.'
            )

            return
        }


        if (!data.success) {

            showAdminError(
                data.error ||
                'Impossible de modifier la licence.'
            )

            return
        }


        await loadLicenses()


    } catch (error) {

        console.error(error)

        showAdminError(
            'Impossible de contacter le serveur.'
        )
    }
}


// ==========================================
// SUPPRIMER UNE LICENCE
// ==========================================

async function deleteLicense(
    license
) {

    const confirmed =
        confirm(
            `⚠️ Veux-tu vraiment supprimer cette licence ?\n\n` +
            `${license.license_key}\n\n` +
            `Cette action est définitive.`
        )


    if (!confirmed) {
        return
    }


    try {

        const {
            data: {
                session
            }
        } =
            await supabaseClient.auth
                .getSession()


        if (!session) {

            showLoginScreen()

            return
        }


        const response =
            await fetch(
                `${SUPABASE_URL}/functions/v1/admin-delete-license`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json',

                        Authorization:
                            `Bearer ${session.access_token}`
                    },

                    body:
                        JSON.stringify({
                            license_id:
                                license.id
                        })
                }
            )


        const data =
            await response.json()


        if (!response.ok) {

            showAdminError(
                data.error ||
                'Impossible de supprimer la licence.'
            )

            return
        }


        if (!data.success) {

            showAdminError(
                data.error ||
                'Impossible de supprimer la licence.'
            )

            return
        }


        await loadLicenses()


    } catch (error) {

        console.error(error)

        showAdminError(
            'Impossible de contacter le serveur.'
        )
    }
}


// ==========================================
// ÉVÉNEMENTS
// ==========================================

loginButton.addEventListener(
    'click',
    login
)


logoutButton.addEventListener(
    'click',
    logout
)


refreshButton.addEventListener(
    'click',
    loadLicenses
)


createLicenseButton.addEventListener(
    'click',
    openCreateLicenseModal
)


cancelCreateLicense.addEventListener(
    'click',
    closeCreateLicenseModal
)


confirmCreateLicense.addEventListener(
    'click',
    createLicense
)


createLicenseModal.addEventListener(
    'click',
    event => {

        if (
            event.target ===
            createLicenseModal
        ) {

            closeCreateLicenseModal()
        }
    }
)


passwordInput.addEventListener(
    'keydown',
    event => {

        if (
            event.key === 'Enter'
        ) {

            login()
        }
    }
)


// ==========================================
// VÉRIFIER SESSION
// ==========================================

async function checkSession() {

    try {

        const {
            data: {
                session
            }
        } =
            await supabaseClient.auth
                .getSession()


        if (session) {

            showAdminScreen()

            await loadLicenses()

        } else {

            showLoginScreen()
        }

    } catch (error) {

        console.error(error)

        showLoginScreen()
    }
}


// ==========================================
// DÉMARRAGE
// ==========================================

checkSession()