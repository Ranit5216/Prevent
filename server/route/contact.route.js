import express from 'express'
import { contactFormController } from '../controllers/contact.controller.js'

const contactRouter = express.Router()

contactRouter.post('/submit', contactFormController)

export default contactRouter

