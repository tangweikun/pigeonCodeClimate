import { parse } from 'date-aware-json'
import { IContext } from '../types'
import { highRiskFoot } from '../utils'


export const saveFootAssessment = async (_, args, { getDb }: IContext) => {
  const db = await getDb()

  const {
    recordId,
    updatedAtString,
    assessmentDetailsJson,
    treatmentStateId,
    footBloodAt,
  } = args

  const record = await db.collection('footAssessment').findOne({ _id: recordId })
  if (!record) {
    return `Can't find footAssessment record with id ${recordId}`
  }

  const treatmentState = await db.collection('treatmentState').findOne({ _id: treatmentStateId })
  if (!treatmentState) {
    return `Can't find treatmentState with id ${treatmentStateId}`
  }

  const assessmentDetails = parse(assessmentDetailsJson)
  const recordResult = await db
    .collection('footAssessment')
    .findOneAndUpdate(
      { _id: recordId },
      {
        $set: {
          updatedAt: new Date(updatedAtString),
          ...assessmentDetails,
          highRiskFoot: highRiskFoot(assessmentDetails),
          treatmentDate: treatmentState.appointmentTime,
        },
      },
    )

  if (!recordResult.ok) {
    return `Error updating footAssessment record: ${JSON.stringify(recordResult.lastErrorObject)}`
  }

  const treatmentStateResult = await db
    .collection('treatmentState')
    .findOneAndUpdate({ _id: treatmentStateId }, { $set: { footBloodAt, footAt: true } })

  if (!treatmentStateResult.ok) {
    return `Error updating treatmentState: ${JSON.stringify(treatmentStateResult.lastErrorObject)}`
  }

  try {
    await db.collection('event').insert({
      type: 'SAVE_FOOT_ASSESSMENT',
      recordId,
      patientId: treatmentState.patientId,
      createdAt: new Date(updatedAtString),
    })
  } catch (e) { console.log(`Couldn't save event: ${e.message}`) }

  return null
}
