import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

type Appointment = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
};

const localizer = momentLocalizer(moment);

const Makeappointment: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [newAppointment, setNewAppointment] = useState<Appointment>({
    id: 0,
    date: '',
    startTime: '',
    endTime: '',
    description: '',
  });
  const [suggestedSlots, setSuggestedSlots] = useState<Appointment[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    const storedAppointments = localStorage.getItem('appointments');
    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewAppointment({ ...newAppointment, [e.target.name]: e.target.value });
  };

  const isSlotAvailable = (slotDate: string, slotStartTime: string, slotEndTime: string): boolean => {
    const conflictingAppointment = appointments.find(
      appointment =>
        appointment.date === slotDate &&
        ((appointment.startTime <= slotStartTime && appointment.endTime > slotStartTime) ||
          (appointment.startTime >= slotStartTime && appointment.startTime < slotEndTime))
    );

    return !conflictingAppointment;
  };

  const handleAddAppointment = () => {
    const slotDate = moment(newAppointment.date).format('YYYY-MM-DD');
    const slotStartTime = moment(newAppointment.startTime, 'HH:mm').format('HH:mm');
    const slotEndTime = moment(newAppointment.endTime, 'HH:mm').format('HH:mm');
    const currentDateTime = moment();

    if (isSlotAvailable(slotDate, slotStartTime, slotEndTime)) {
      setAppointments([...appointments, { ...newAppointment, id: Date.now() }]);
      setNewAppointment({ id: 0, date: '', startTime: '', endTime: '', description: '' });
    } else {
      const suggestedSlots: Appointment[] = [];
      let suggestedSlotStartTime = currentDateTime.clone().startOf('hour');
      let suggestedSlotEndTime = suggestedSlotStartTime.clone().add(30, 'minutes');

      // Find up to 3 available slots for the same day within the next 4 hours
      while (
        suggestedSlots.length < 3 &&
        suggestedSlotStartTime.isSameOrBefore(currentDateTime.clone().add(4, 'hours'), 'minute')
      ) {
        if (isSlotAvailable(slotDate, suggestedSlotStartTime.format('HH:mm'), suggestedSlotEndTime.format('HH:mm'))) {
          suggestedSlots.push({
            id: Date.now(),
            date: slotDate,
            startTime: suggestedSlotStartTime.format('HH:mm'),
            endTime: suggestedSlotEndTime.format('HH:mm'),
            description: newAppointment.description,
          });
        }

        suggestedSlotStartTime.add(30, 'minutes');
        suggestedSlotEndTime.add(30, 'minutes');
      }

      setSuggestedSlots(suggestedSlots);
    }
  };

  const handleAcceptSuggestedSlot = (slot: Appointment) => {
    setAppointments([...appointments, slot]);
    setNewAppointment({ id: 0, date: '', startTime: '', endTime: '', description: '' });
    setSuggestedSlots([]);
  };

  const handleRejectSuggestedSlots = () => {
    setSuggestedSlots([]);
  };

  const handleToggleView = () => {
    setViewMode(prevMode => (prevMode === 'calendar' ? 'list' : 'calendar'));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Appointment Manager</h1>

      <div className="flex flex-col mb-4">
        <label htmlFor="date" className="mb-2">
          Date:
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={newAppointment.date}
          onChange={handleInputChange}
          className="border border-gray-300 rounded p-2"
        />
      </div>
      <div className="flex flex-col mb-4">
        <label htmlFor="startTime" className="mb-2">
          Start Time:
        </label>
        <input
          type="time"
          id="startTime"
          name="startTime"
          value={newAppointment.startTime}
          onChange={handleInputChange}
          className="border border-gray-300 rounded p-2"
        />
      </div>
      <div className="flex flex-col mb-4">
        <label htmlFor="endTime" className="mb-2">
          End Time:
        </label>
        <input
          type="time"
          id="endTime"
          name="endTime"
          value={newAppointment.endTime}
          onChange={handleInputChange}
          className="border border-gray-300 rounded p-2"
        />
      </div>
      <div className="flex flex-col mb-4">
        <label htmlFor="description" className="mb-2">
          Description:
        </label>
        <textarea
          id="description"
          name="description"
          value={newAppointment.description}
          onChange={handleInputChange}
          className="border border-gray-300 rounded p-2"
        ></textarea>
      </div>
      <button onClick={handleAddAppointment} className="bg-blue-500 text-white py-2 px-4 rounded">
        Add Appointment
      </button>

      <h2 className="text-xl font-bold mt-8">Appointments</h2>
      {viewMode === 'calendar' ? (
        <Calendar
          localizer={localizer}
          events={appointments.map(appointment => ({
            start: new Date(appointment.date + ' ' + appointment.startTime),
            end: new Date(appointment.date + ' ' + appointment.endTime),
            title: appointment.description,
          }))}
          views={['month', 'week']}
          step={30}
          timeslots={2}
          defaultView="week"
          defaultDate={new Date()}
          min={new Date(0, 0, 0, 8, 0, 0)}
          max={new Date(0, 0, 0, 22, 0, 0)}
          length={2}
          showMultiDayTimes
          selectable={false}
        />
      ) : (
        <ul>
          {appointments.map(appointment => (
            <li key={appointment.id}>
              <strong>{appointment.date}:</strong> {appointment.startTime} - {appointment.endTime}: {appointment.description}
            </li>
          ))}
        </ul>
      )}

      {suggestedSlots.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Suggested Slots</h3>
          <ul>
            {suggestedSlots.map(slot => (
              <li key={slot.id}>
                {slot.date}: {slot.startTime} - {slot.endTime}{' '}
                <button
                  onClick={() => handleAcceptSuggestedSlot(slot)}
                  className="bg-green-500 text-white py-2 px-4 rounded mx-2"
                >
                  Accept
                </button>
              </li>
            ))}
          </ul>
          <button onClick={handleRejectSuggestedSlots} className="bg-red-500 text-white py-2 px-4 rounded mt-2">
            Reject All
          </button>
        </div>
      )}

      <button onClick={handleToggleView} className="bg-gray-500 text-white py-2 px-4 rounded mt-4">
        Toggle View
      </button>
    </div>
  );
};

export default Makeappointment;
