/* =========================================
   PROFIL
========================================= */


const profileButton =
    document.getElementById(
        'profileButton'
    )


const profileModal =
    document.getElementById(
        'profileModal'
    )


const closeProfile =
    document.getElementById(
        'closeProfile'
    )


const profileModalAvatar =
    document.getElementById(
        'profileModalAvatar'
    )


const profileModalUsername =
    document.getElementById(
        'profileModalUsername'
    )


const profileBotList =
    document.getElementById(
        'profileBotList'
    )


/* =========================================
   OUVRIR PROFIL
========================================= */

async function openProfile() {

    if (!profileModal) {
        return
    }


    profileModal.classList.remove(
        'hidden'
    )


    await loadProfile()

}


/* =========================================
   FERMER PROFIL
========================================= */

function closeProfileModal() {

    if (!profileModal) {
        return
    }


    profileModal.classList.add(
        'hidden'
    )

}


/* =========================================
   CHARGER PROFIL
========================================= */

async function loadProfile() {

    try {

        const result =
            await window.electronAPI.profileStatus()


        if (
            !result ||
            !result.success ||
            !result.profile
        ) {

            setDefaultProfile()

            return
        }


        const profile =
            result.profile


        /* ================================
           NOM
        ================================= */

        if (profileModalUsername) {

            profileModalUsername.textContent =
                profile.username ||
                'Gamster'

        }


        /* ================================
           AVATAR
        ================================= */

        if (profileModalAvatar) {

            if (profile.avatarUrl) {

                profileModalAvatar.src =
                    profile.avatarUrl

            } else {

                profileModalAvatar.src =
                    'assets/melaria-head.png'

            }

        }


        /* ================================
           BOTS
        ================================= */

        await loadProfileBots()


    } catch (error) {

        console.error(
            'Erreur chargement profil :',
            error
        )

        setDefaultProfile()

    }

}


/* =========================================
   PROFIL PAR DÉFAUT
========================================= */

function setDefaultProfile() {

    if (profileModalUsername) {

        profileModalUsername.textContent =
            'Melaria'

    }


    if (profileModalAvatar) {

        profileModalAvatar.src =
            'assets/melaria-head.png'

    }


    if (profileBotList) {

        profileBotList.innerHTML = `
            <div class="profile-empty">
                Aucun bot à afficher.
            </div>
        `

    }

}


/* =========================================
   CHARGER LES BOTS
========================================= */

async function loadProfileBots() {

    if (!profileBotList) {
        return
    }


    try {

        const bots =
            await window.electronAPI.getBots()


        if (
            !Array.isArray(bots) ||
            bots.length === 0
        ) {

            profileBotList.innerHTML = `
                <div class="profile-empty">
                    Aucun bot à afficher.
                </div>
            `

            return
        }


        profileBotList.innerHTML = ''


        bots.forEach(bot => {

            const botElement =
                document.createElement(
                    'div'
                )


            botElement.className =
                'profile-bot-item'


            botElement.innerHTML = `

                <div class="profile-bot-icon">
                    🤖
                </div>

                <div class="profile-bot-info">

                    <div class="profile-bot-name">
                        ${escapeHtml(
                            bot.username ||
                            'Bot'
                        )}
                    </div>

                    <div class="profile-bot-status">
                        Bot Minecraft
                    </div>

                </div>

            `


            profileBotList.appendChild(
                botElement
            )

        })


    } catch (error) {

        console.error(
            'Erreur chargement bots du profil :',
            error
        )


        profileBotList.innerHTML = `
            <div class="profile-empty">
                Impossible de charger les bots.
            </div>
        `

    }

}


/* =========================================
   PROTECTION HTML
========================================= */

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            '&amp;'
        )
        .replace(
            /</g,
            '&lt;'
        )
        .replace(
            />/g,
            '&gt;'
        )
        .replace(
            /"/g,
            '&quot;'
        )
        .replace(
            /'/g,
            '&#039;'
        )

}


/* =========================================
   ÉVÉNEMENTS
========================================= */

if (profileButton) {

    profileButton.addEventListener(
        'click',
        openProfile
    )

}


if (closeProfile) {

    closeProfile.addEventListener(
        'click',
        closeProfileModal
    )

}


/* =========================================
   CLIQUER À CÔTÉ DU MODAL
========================================= */

if (profileModal) {

    profileModal.addEventListener(
        'click',
        event => {

            if (
                event.target ===
                profileModal
            ) {

                closeProfileModal()

            }

        }
    )

}


/* =========================================
   ÉCHAPPEMENT AVEC ÉCHAP
========================================= */

document.addEventListener(
    'keydown',
    event => {

        if (
            event.key === 'Escape' &&
            profileModal &&
            !profileModal.classList.contains(
                'hidden'
            )
        ) {

            closeProfileModal()

        }

    }
)