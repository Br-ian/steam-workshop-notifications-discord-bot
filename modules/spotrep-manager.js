import EventEmitter from "events";
import moment from "moment";
import * as cache from "./cache-manager.js";
import * as util from "./util.js";
import {modManager} from "./mod-manager.js";
import {logger} from "./logger.js";

const spotRepManager = new EventEmitter()
let spotRepDatabase = new Map()

spotRepManager.on('loadSpotRepFromCache', cachedSpotRep => {
    logger.info('Loading SpotRep from cache.')

    spotRepDatabase = new Map(Object.entries(cachedSpotRep))

    logger.info(`SpotRep loaded from cache, last update: ${spotRepDatabase.get('lastUpdate')}.`)
})

spotRepManager.on('saveSpotRepToCache', async () => {
    logger.info('Saving SpotRep to cache.')

    try {
        await cache.writeSpotRepToCache(Object.fromEntries(spotRepDatabase))
    } catch (e) {
        logger.error(e)
    }
})

spotRepManager.on('checkSpotRep', async (client) => {
    const res = await util.downloadFile('https://dev.arma3.com/spotrep')
        .then(html => util.parseArmaSpotRepHtml(html))

    if(res['time'].isBefore(moment(spotRepDatabase.get('lastUpdate')))) {
        logger.debug('SpotRep not updated')
        return
    }

    logger.info('SpotRep updated')
    spotRepDatabase.set('lastUpdate', moment().format())

    const changelog = await util.downloadFile(res['link'])
        .then(html => util.parseArmaSpotRepPostHtml(html))


    modManager.emit('listNotifications', async (notificationsMap) => {
        for (const [guildId, notifications] of notificationsMap.entries()) {
            let notificationsString = await util.buildNotificationString(notifications, guildId, client)

            const message = `Arma was updated \`${res['info']}\` (<${res['link']}>) was updated! ${notificationsString}`
            const splitChangelog = util.splitString(changelog, 1900, '\n')

            for(const channelId of notifications.channelIds) {
                client.channels.cache.get(channelId).send(message).catch(e => logger.error(e))

                for(let changelogPart of splitChangelog) {
                    if(changelogPart.length === 0)
                        continue

                    changelogPart = `\`\`\`${changelogPart}\`\`\``

                    client.channels.cache
                        .get(channelId)
                        .send(changelogPart)
                        .catch(e => logger.error(e))
                }
            }
        }
    })


    spotRepManager.emit('saveSpotRepToCache')
})

export { spotRepManager }