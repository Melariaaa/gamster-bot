const {
    app,
    safeStorage
} = require('electron')

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')


// =======================================
// FICHIER DE LICENCE
// =======================================

function getLicenseFile() {

    const folder =
        path.join(
            app.getPath('userData'),
            'license'
        )


    if (!fs.existsSync(folder)) {

        fs.mkdirSync(
            folder,
            {
                recursive: true
            }
        )
    }


    return path.join(
        folder,
        'activation.dat'
    )
}


// =======================================
// DEVICE ID
// =======================================

function getDeviceId() {

    const file =
        path.join(
            app.getPath('userData'),
            'device.id'
        )


    if (fs.existsSync(file)) {

        return fs
            .readFileSync(
                file,
                'utf8'
            )
            .trim()
    }


    const deviceId =
        crypto.randomUUID()


    fs.writeFileSync(
        file,
        deviceId,
        'utf8'
    )


    return deviceId
}


// =======================================
// SAUVEGARDER ACTIVATION
// =======================================

function saveActivation(data) {

    const file =
        getLicenseFile()


    const json =
        JSON.stringify(data)


    if (
        !safeStorage.isEncryptionAvailable()
    ) {

        throw new Error(
            'Le stockage sécurisé est indisponible.'
        )
    }


    const encrypted =
        safeStorage.encryptString(
            json
        )


    fs.writeFileSync(
        file,
        encrypted
    )
}


// =======================================
// LIRE ACTIVATION
// =======================================

function getActivation() {

    const file =
        getLicenseFile()


    if (!fs.existsSync(file)) {

        return null
    }


    try {

        const encrypted =
            fs.readFileSync(
                file
            )


        const json =
            safeStorage.decryptString(
                encrypted
            )


        return JSON.parse(
            json
        )

    } catch (error) {

        console.error(
            'Impossible de lire la licence :',
            error
        )

        return null
    }
}


// =======================================
// SUPPRIMER ACTIVATION
// =======================================

function clearActivation() {

    const file =
        getLicenseFile()


    if (fs.existsSync(file)) {

        fs.unlinkSync(
            file
        )
    }
}


// =======================================
// EXPORT
// =======================================

module.exports = {

    getDeviceId,

    saveActivation,

    getActivation,

    clearActivation

}