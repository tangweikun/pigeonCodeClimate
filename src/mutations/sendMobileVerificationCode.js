import moment from 'moment'
import freshId from 'fresh-id'
import { code } from 'righteous-raven'

const { RIGHTEOUS_RAVEN_URL, RIGHTEOUS_RAVEN_ID, RIGHTEOUS_RAVEN_KEY } = process.env
const EXPIRES_IN = 300

export const sendMobileVerificationCode = async (_, args, context) => {
  const { mobile } = args
  console.log('---->>', mobile,RIGHTEOUS_RAVEN_URL, RIGHTEOUS_RAVEN_ID)

  await code(RIGHTEOUS_RAVEN_URL, {
    client_id: RIGHTEOUS_RAVEN_ID,
    client_key: RIGHTEOUS_RAVEN_KEY,
    rec: mobile,
    prefix: '护血糖',
    expired: EXPIRES_IN,
  })

  return EXPIRES_IN
}
