const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('gig')
        var gigs = await collection.find(criteria).toArray()
        return gigs
    } catch (err) {
        logger.error('cannot find gigs', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.searchKey) {
        const txtCriteria = { $regex: filterBy.searchKey, $options: 'i' }
        criteria.$or = [
            { title: txtCriteria },
            { tags: txtCriteria },
            { category: txtCriteria }
        ]
    }
    if (filterBy.tags) {
        const txtCriteria = { $regex: filterBy.tags, $options: 'i' }
        criteria.$or = [
            { title: txtCriteria },
            { tags: txtCriteria }
        ]
    }
    if (filterBy.userId) {
        criteria['seller._id'] = filterBy.userId;
    }
    return criteria
}

async function getById(gigId) {
    try {
        const collection = await dbService.getCollection('gig')
        const gig = await collection.findOne({ '_id': ObjectId(gigId) })
        return gig
    } catch (err) {
        logger.error(`while finding gig ${gigId}`, err)
        throw err
    }
}

async function remove(gigId) {
    try {
        const collection = await dbService.getCollection('gig')
        await collection.deleteOne({ '_id': ObjectId(gigId) })
        return gigId
    } catch (err) {
        logger.error(`cannot remove gig ${gigId}`, err)
        throw err
    }
}

async function add(gig) {
    try {
        const collection = await dbService.getCollection('gig')
        gig.createdAt = new Date().toLocaleDateString('he') + ' ' + new Date().toLocaleTimeString('he', { hour: '2-digit', minute: '2-digit' })
        const addedGigObject = await collection.insertOne(gig)
        const addedGig = getById(addedGigObject.insertedId)
        return addedGig
    } catch (err) {
        logger.error('cannot insert gig', err)
        throw err
    }
}

async function update(gig) {
    try {
        var id = ObjectId(gig._id)
        delete gig._id
        const collection = await dbService.getCollection('gig')
        await collection.updateOne({ "_id": id }, { $set: { ...gig } })
        return gig
    } catch (err) {
        logger.error(`cannot update gig ${gigId}`, err)
        throw err
    }
}



module.exports = {
    remove,
    query,
    getById,
    add,
    update,
}