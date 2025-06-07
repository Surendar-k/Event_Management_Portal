import React, { useState } from 'react';

const ReportGeneration = () => {
    const [eventDetails, setEventDetails] = useState({
        title: '',
        organizingInstitution: '',
        college: '',
        department: '',
        leadCoordinator: '',
        facultyCoordinators: [],
        startDate: '',
        endDate: '',
        noOfDays: '',
        natureOfEvent: '',
        venueType: '',
        venue: '',
        intendedAudience: '',
        scope: '',
        fundingSource: '',
        speakers: [],
        estimatedParticipation: {
            student: '',
            faculty: '',
            total: '',
        },
        guestServices: {
            accommodation: '',
            transportation: '',
            dining: '',
        },
        technicalSetup: {
            audioVisual: '',
            speakers: '',
            airConditioning: '',
            presentationMaterials: '',
            recording: {
                photography: false,
                videography: false,
                lighting: false,
                liveStream: false,
            },
            additionalRequirements: '',
        },
        aboutEvent: {
            objectives: '',
            outcomes: '',
        },
        technicalSessionDetails: {
            date: '',
            fromTime: '',
            toTime: '',
            topic: '',
            speakerName: '',
        },
        financialPlanning: {
            fundingSources: '',
            estimatedBudget: '',
            remarks: '',
        },
        foodTravelArrangements: {
            meal: '',
            refreshment: '',
            travel: '',
            mealArrangements: {
                date: '',
                time: '',
                type: '',
                category: '',
                menu: '',
                personCount: '',
                servedAt: '',
                specialNote: '',
            },
        },
        eventChecklist: [],
        eventImages: [],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventDetails({
            ...eventDetails,
            [name]: value,
        });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setEventDetails({
            ...eventDetails,
            eventImages: [...eventDetails.eventImages, ...files],
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log(eventDetails);
    };

    return (
        <div>
            <h1>Event Report Generation</h1>
            <form onSubmit={handleSubmit}>
                <h2>Event Details & Scheduling</h2>
                <label>
                    Title of the Event:
                    <input type="text" name="title" onChange={handleChange} />
                </label>
                <label>
                    Organizing Institution:
                    <input type="text" name="organizingInstitution" onChange={handleChange} />
                </label>
                <label>
                    Select College:
                    <input type="text" name="college" onChange={handleChange} />
                </label>
                <label>
                    Organizing Department:
                    <input type="text" name="department" onChange={handleChange} />
                </label>
                <label>
                    Lead Coordinator:
                    <input type="text" name="leadCoordinator" onChange={handleChange} />
                </label>
                <label>
                    Faculty Coordinators:
                    <input type="text" name="facultyCoordinators" onChange={handleChange} />
                </label>
                <label>
                    Start Date:
                    <input type="date" name="startDate" onChange={handleChange} />
                </label>
                <label>
                    End Date:
                    <input type="date" name="endDate" onChange={handleChange} />
                </label>
                <label>
                    No. of Days:
                    <input type="number" name="noOfDays" onChange={handleChange} />
                </label>
                <label>
                    Nature of Event:
                    <select name="natureOfEvent" onChange={handleChange}>
                        <option value="">Select</option>
                        {/* Add options here */}
                    </select>
                </label>
                <label>
                    Venue Type:
                    <select name="venueType" onChange={handleChange}>
                        <option value="">Select</option>
                        {/* Add options here */}
                    </select>
                </label>
                <label>
                    Venue:
                    <select name="venue" onChange={handleChange}>
                        <option value="">Select Venue</option>
                        {/* Add options here */}
                    </select>
                </label>
                <label>
                    Intended Audience:
                    <input type="text" name="intendedAudience" onChange={handleChange} />
                </label>
                <label>
                    Scope:
                    <select name="scope" onChange={handleChange}>
                        <option value="">Select</option>
                        {/* Add options here */}
                    </select>
                </label>
                <label>
                    Funding Source:
                    <select name="fundingSource" onChange={handleChange}>
                        <option value="">Select</option>
                        {/* Add options here */}
                    </select>
                </label>

                <h2>Speaker Details</h2>
                {eventDetails.speakers.map((speaker, index) => (
                    <div key={index}>
                        <h3>Speaker {index + 1}</h3>
                        <label>
                            Name:
                            <input type="text" name={`speakerName${index}`} onChange={handleChange} />
                        </label>
                        <label>
                            Designation:
                            <input type="text" name={`speakerDesignation${index}`} onChange={handleChange} />
                        </label>
                        <label>
                            Affiliation:
                            <input type="text" name={`speakerAffiliation${index}`} onChange={handleChange} />
                        </label>
                        <label>
                            Contact:
                            <input type="text" name={`speakerContact${index}`} onChange={handleChange} />
                        </label>
                        <label>
                            Email:
                            <input type="email" name={`speakerEmail${index}`} onChange={handleChange} />
                        </label>
                    </div>
                ))}
                <button type="button" onClick={() => setEventDetails({ ...eventDetails, speakers: [...eventDetails.speakers, {}] })}>
                    + Add Speaker
                </button>

                <h2>Estimated Participation</h2>
                <label>
                    Student Participation:
                    <input type="number" name="estimatedParticipation.student" onChange={handleChange} />
                </label>
                <label>
                    Faculty Participation:
                    <input type="number" name="estimatedParticipation.faculty" onChange={handleChange} />
                </label>
                <label>
                    Total Attendees:
                    <input type="number" name="estimatedParticipation.total" onChange={handleChange} />
                </label>

                <h2>Guest Services</h2>
                <label>
                    Guest Accommodation:
                    <select name="guestServices.accommodation" onChange={handleChange}>
                        <option value="">Select</option>
                        {/* Add options here */}
                    </select>
                </label>
                <label>
                    Guest Transportation:
                    <select name="guestServices.transportation" onChange={handleChange}>
                        <option value="">Select</option>
                        {/* Add options here */}
                    </select>
                </label>
                <label>
                    Dining Arrangements:
                    <select name="guestServices.dining" onChange={handleChange}>
                        <option value="">Select</option>
                        {/* Add options here */}
                    </select>
                </label>

                <h2>Technical Setup</h2>
                <label>
                    Audio-Visual Setup:
                    <select name="technicalSetup.audioVisual" onChange={handleChange}>
                        <option value="">Select</option>
                        {/* Add options here */}
                    </select>
                </label>
                <label>
                    Speakers:
                    <select name="technicalSetup.speakers" onChange={handleChange}>
                        <option value="">Select</option>
                        {/* Add options here */}
                    </select>
                </label>
                <label>
                    Air Conditioner & Ventilation:
                    <select name="technicalSetup.airConditioning" onChange={handleChange}>
                        <option value="">Select Type</option>
                        {/* Add options here */}
                    </select>
                </label>
                <label>
                    No. of Units:
                    <input type="number" name="technicalSetup.noOfUnits" onChange={handleChange} />
                </label>
                <label>
                    Presentation Materials:
                    <select name="technicalSetup.presentationMaterials" onChange={handleChange}>
                        <option value="">Select</option>
                        {/* Add options here */}
                    </select>
                </label>
                <label>
                    Recording & Documentation:
                    <label>
                        Photography:
                        <input type="checkbox" name="technicalSetup.recording.photography" onChange={handleChange} />
                    </label>
                    <label>
                        Videography:
                        <input type="checkbox" name="technicalSetup.recording.videography" onChange={handleChange} />
                    </label>
                    <label>
                        Professional Lighting:
                        <input type="checkbox" name="technicalSetup.recording.lighting" onChange={handleChange} />
                    </label>
                    <label>
                        Live Stream:
                        <input type="checkbox" name="technicalSetup.recording.liveStream" onChange={handleChange} />
                    </label>
                </label>
                <label>
                    Additional Technical Requirements:
                    <input type="text" name="technicalSetup.additionalRequirements" onChange={handleChange} />
                </label>

                <h2>About the Event</h2>
                <label>
                    Objectives of the Event (max 200 words):
                    <textarea name="aboutEvent.objectives" maxLength="200" onChange={handleChange}></textarea>
                </label>
                <label>
                    Outcomes of the Event (max 200 words):
                    <textarea name="aboutEvent.outcomes" maxLength="200" onChange={handleChange}></textarea>
                </label>
                <label>
                    Proposed Event Brochure/Poster (PDF upload):
                    <input type="file" accept=".pdf" />
                </label>

                <h2>Technical Session Details</h2>
                <label>
                    Date:
                    <input type="date" name="technicalSessionDetails.date" onChange={handleChange} />
                </label>
                <label>
                    From Time:
                    <input type="time" name="technicalSessionDetails.fromTime" onChange={handleChange} />
                </label>
                <label>
                    To Time:
                    <input type="time" name="technicalSessionDetails.toTime" onChange={handleChange} />
                </label>
                <label>
                    Topic:
                    <input type="text" name="technicalSessionDetails.topic" onChange={handleChange} />
                </label>
                <label>
                    Speaker Name:
                    <input type="text" name="technicalSessionDetails.speakerName" onChange={handleChange} />
                </label>

                <h2>Financial Planning</h2>
                <label>
                    Funding Sources:
                    <select name="financialPlanning.fundingSources" onChange={handleChange}>
                        <option value="">Select Funding Source</option>
                        {/* Add options here */}
                    </select>
                </label>
                <label>
                    Estimated Budget:
                    <input type="number" name="financialPlanning.estimatedBudget" onChange={handleChange} />
                </label>
                <label>
                    Remarks:
                    <input type="text" name="financialPlanning.remarks" onChange={handleChange} />
                </label>

                <h2>Food & Travel Arrangements</h2>
                <label>
                    Meal:
                    <input type="text" name="foodTravelArrangements.meal" onChange={handleChange} />
                </label>
                <label>
                    Refreshment:
                    <input type="text" name="foodTravelArrangements.refreshment" onChange={handleChange} />
                </label>
                <label>
                    Travel:
                    <input type="text" name="foodTravelArrangements.travel" onChange={handleChange} />
                </label>
                <label>
                    Meal Arrangements:
                    <input type="text" name="foodTravelArrangements.mealArrangements.type" onChange={handleChange} />
                </label>
                <label>
                    Meal Type:
                    <input type="text" name="foodTravelArrangements.mealArrangements.category" onChange={handleChange} />
                </label>
                <label>
                    Menu:
                    <input type="text" name="foodTravelArrangements.mealArrangements.menu" onChange={handleChange} />
                </label>
                <label>
                    Person Count:
                    <input type="number" name="foodTravelArrangements.mealArrangements.personCount" onChange={handleChange} />
                </label>
                <label>
                    Served At:
                    <input type="text" name="foodTravelArrangements.mealArrangements.servedAt" onChange={handleChange} />
                </label>
                <label>
                    Special Note:
                    <input type="text" name="foodTravelArrangements.mealArrangements.specialNote" onChange={handleChange} />
                </label>

                <h2>Event Checklist</h2>
                <label>
                    Select Event Type:
                    <select name="eventChecklist" onChange={handleChange}>
                        <option value="">Online</option>
                        {/* Add options here */}
                    </select>
                </label>
                <button type="button" onClick={() => setEventDetails({ ...eventDetails, eventChecklist: [...eventDetails.eventChecklist, 'New Task'] })}>
                    + Add Tasks
                </button>

                <h2>Upload Event Images</h2>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
                <button type="submit">Generate Report</button>
            </form>
        </div>
    );
};

export default ReportGeneration;
