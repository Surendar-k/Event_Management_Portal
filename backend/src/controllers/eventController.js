exports.saveEventInfo = async (req, res) => {
  try {
    const { event_id } = req.params;
    const data = req.body;

    const [existing] = await db.execute(
      'SELECT id FROM event_info WHERE event_id = ?',
      [event_id]
    );

    const normalize = val => (val === undefined || val === '' ? null : val);

    const payload = [
      normalize(data.title),
      normalize(data.selected_college),
      normalize(data.selected_department),
      JSON.stringify(data.faculty_coordinators || []),
      normalize(data.start_date),
      normalize(data.end_date),
      normalize(data.num_days),
      normalize(data.event_nature),
      normalize(data.other_nature),
      normalize(data.venue_type),
      normalize(data.venue),
      normalize(data.audience),
      normalize(data.scope),
      normalize(data.funding_source),
      normalize(data.other_funding),
      JSON.stringify(data.speakers || []),
      JSON.stringify(data.participants || {}),
      JSON.stringify(data.guest_services || {}),
      normalize(data.objectives),
      normalize(data.outcomes),
      normalize(data.brochure_path),
      JSON.stringify(data.agenda_sessions || []),
      JSON.stringify(data.financial_data || {}),
      JSON.stringify(data.food_transport_data || {}),
      JSON.stringify(data.checklist_data || [])
    ];

    if (existing.length > 0) {
      await db.execute(
        `UPDATE event_info SET
          title = ?, selected_college = ?, selected_department = ?, faculty_coordinators = ?,
          start_date = ?, end_date = ?, num_days = ?, event_nature = ?, other_nature = ?,
          venue_type = ?, venue = ?, audience = ?, scope = ?, funding_source = ?, other_funding = ?,
          speakers = ?, participants = ?, guest_services = ?,
          objectives = ?, outcomes = ?, brochure_path = ?, agenda_sessions = ?,
          financial_data = ?, food_transport_data = ?, checklist_data = ?
         WHERE event_id = ?`,
        [...payload, event_id]
      );
    } else {
      await db.execute(
        `INSERT INTO event_info (
          event_id, title, selected_college, selected_department, faculty_coordinators,
          start_date, end_date, num_days, event_nature, other_nature,
          venue_type, venue, audience, scope, funding_source, other_funding,
          speakers, participants, guest_services,
          objectives, outcomes, brochure_path, agenda_sessions,
          financial_data, food_transport_data, checklist_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [event_id, ...payload]
      );
    }

    res.json({ message: 'Full event info saved successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
