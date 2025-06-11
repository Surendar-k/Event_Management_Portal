import {create} from 'zustand'

const useFormStore = create(set => ({
  event: {
    selectedCollege: '',
    departments: [],
    selectedDepartment: '',
    title: '',
    eventNature: '',
    otherNature: '',
    fundingSource: '',
    otherFunding: '',
    venueType: '',
    venue: '',
    audience: '',
    scope: '',
    startDate: '',
    endDate: '',
    numDays: '',
    speakers: [
      {name: '', designation: '', affiliation: '', contact: '', email: ''}
    ],
    participants: {
      students: '',
      faculty: '',
      total: ''
    },
    guestServices: {
      accommodation: '',
      transportation: '',
      dining: ''
    },
    technicalSetup: {
      audioVisual: '',
      speakerSystem: '',
      airConditioningType: '',
      airConditioningUnits: '',
      presentationMaterials: '',
      recording: [],
      additional: ''
    },
    selectedCoordinators: [],
    filteredSuggestions: [],
    showSuggestions: false,

    setEventField: (key, value) =>
      set(state => ({
        event: {...state.event, [key]: value}
      })),

    updateParticipants: (key, value) =>
      set(state => ({
        event: {
          ...state.event,
          participants: {...state.event.participants, [key]: value}
        }
      })),

    updateGuestServices: (key, value) =>
      set(state => ({
        event: {
          ...state.event,
          guestServices: {...state.event.guestServices, [key]: value}
        }
      })),

    updateSpeaker: (index, key, value) =>
      set(state => {
        const updated = [...state.event.speakers]
        updated[index][key] = value
        return {
          event: {...state.event, speakers: updated}
        }
      }),

    setSpeakers: speakers =>
      set(state => ({
        event: {...state.event, speakers}
      })),

    setTechnicalSetup: technicalSetup =>
      set(state => ({
        event: {
          ...state.event,
          technicalSetup: {
            ...state.event.technicalSetup,
            ...technicalSetup
          }
        }
      }))
  }
}))

export default useFormStore
