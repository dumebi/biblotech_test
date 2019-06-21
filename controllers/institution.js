const InstititionModel = require('../models/institution');
const HttpStatus = require('../helpers/status');
const { getAsync, client } = require('../helpers/redis');
const {
  paramsNotValid, handleError, handleFail, handleSuccess, paramsNotValidChecker
} = require('../helpers/utils');
const publisher = require('../helpers/rabbitmq');

const InstititionController = {
  /**
   * Create Institition
   * @description Create an institution
   * @param {string} name 
   * @param {string} url      
   * @param {string} domain
   * @return {object} institution
   */
  async create(req, res, next) {
    try {
      if (paramsNotValid(req.body.name, req.body.url, req.body.domain)) {
        return handleFail(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.body.name, req.body.url, req.body.domain))
      }

      const institutionFound = await InstititionModel.findOne({ name: req.body.name })
      if (institutionFound) { return handleError(res, HttpStatus.BAD_REQUEST, 'institution already exists') }

      const institution = new InstititionModel({
        name: req.body.name,
        url: req.body.url,
        domain: req.body.domain
      })
      await Promise.all([institution.save(), publisher.queue('ADD_OR_UPDATE_INSTITUTIONS_CACHE', { institution })])
      return handleSuccess(res, HttpStatus.OK, institution)
    } catch (error) {
      console.log(error)
      handleError(res, HttpStatus.BAD_REQUEST, 'Could not create institution')
    }
  },
  /**
   * Get Instititions.
   * @description This returns all institutions in the Premier League Ecosystem.
   * @return {object[]} institutions
   */
  async all(req, res, next) {
    try {
      let institutions = {}
      const result = await getAsync('biblotech_institutions');
      // console.log(result)
      if (result != null && JSON.parse(result).length > 0) {
        institutions = JSON.parse(result);
      } else {
        allInstititions = await InstititionModel.find({});
        for (let index = 0; index < allInstititions.length; index++) {
          institutions[allInstititions[index]._id] = allInstititions[index]
        }
        await client.set('biblotech_institutions', JSON.stringify(institutions));
      }
      return handleSuccess(res, HttpStatus.OK, Object.values(institutions))
    } catch (error) {
      console.log(error)
      return handleError(res, HttpStatus.BAD_REQUEST, 'Could not get institutions')
    }
  },

  /**
     * Get Institition
     * @description This returns a institution details in thw Premier League Ecosystem.
     * @param   {string}  id  Institition's ID
     * @return  {object}  institution
     */
  async one(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return handleFail(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.params.id))
      }
      const _id = req.params.id;
      const institution = await InstititionModel.findById(_id);

      if (institution) {
        return handleSuccess(res, HttpStatus.OK, institution)
      }
      return handleError(res, HttpStatus.NOT_FOUND,  'Institition not found')
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error getting institution')
    }
  },

  /**
   * Update Institition
   * @description This updates a institution details in thw Premier League Ecosystem.
   * @param   {string}  id  Institition's ID
   * @return {object} institution
   */
  async update(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return handleFail(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.params.id))
      }
      const _id = req.params.id;
      const institution = await InstititionModel.findByIdAndUpdate(
        _id,
        { $set: req.body },
        { safe: true, multi: true, new: true }
      )
      if (institution) {
        await Promise.all([publisher.queue('ADD_OR_UPDATE_INSTITUTIONS_CACHE', { institution })])
        return handleSuccess(res, HttpStatus.OK, institution)
      }
      return handleError(res, HttpStatus.NOT_FOUND, 'Institition not found')
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error updating institution')
    }
  },

  /**
   * Update Institition
   * @description This removes a institution details in thw Premier League Ecosystem.
   * @param   {string}  id  Institition's ID
   * @return {object} institution
   */
  async remove(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return handleFail(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.params.id))
      }
      const _id = req.params.id;
      const institution = await InstititionModel.findByIdAndRemove(
        _id,
        { safe: true, multi: true, new: true }
      )
      if (institution) {
        await Promise.all([publisher.queue('REMOVE_INSTITUTIONS_CACHE', { _id })])
        return handleSuccess(res, HttpStatus.OK, null)
      }
      return handleError(res, HttpStatus.NOT_FOUND, 'Institition not found')
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error updating institution')
    }
  }
};

module.exports = InstititionController;
