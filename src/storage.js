const fs = require('fs')
const path = require('path')
const { app } = require('electron')

function getDataFolder() {
    const folder = path.join(
        app.getPath('userData'),
        'data'
    )

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, {
            recursive: true
        })
    }

    return folder
}

function getFile() {
    return path.join(
        getDataFolder(),
        'bots.json'
    )
}

function loadBots() {
    const file = getFile()

    if (!fs.existsSync(file)) {
        return []
    }

    try {
        const content = fs.readFileSync(
            file,
            'utf8'
        )

        if (!content.trim()) {
            return []
        }

        const bots = JSON.parse(content)

        return Array.isArray(bots)
            ? bots
            : []

    } catch (error) {
        console.error(
            'Erreur lors du chargement des bots :',
            error
        )

        return []
    }
}

function saveBots(bots) {
    const file = getFile()

    try {
        fs.writeFileSync(
            file,
            JSON.stringify(bots, null, 2),
            'utf8'
        )

        return true

    } catch (error) {
        console.error(
            'Erreur lors de la sauvegarde des bots :',
            error
        )

        return false
    }
}

module.exports = {
    loadBots,
    saveBots
}